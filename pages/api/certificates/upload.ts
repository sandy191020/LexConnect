import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Certificate from '@/models/Certificate';
import Lawyer from '@/models/Lawyer';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { generateCertificateHash, storeCertificateOnBlockchain, checkCertificateExistsOnBlockchain } from '@/lib/blockchain';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'lawyer') {
      return res.status(403).json({ error: 'Only lawyers can upload certificates' });
    }

    const lawyer = await Lawyer.findOne({ userId: payload.userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'certificates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse form data
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Error parsing form data' });
      }

      const file = Array.isArray(files.certificate) ? files.certificate[0] : files.certificate;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const formidableFile = file as FormidableFile;
      
      try {
        // Generate hash
        const certificateHash = generateCertificateHash(formidableFile.filepath);

        // Check if certificate already exists in database (duplicate prevention)
        const existingCertificate = await Certificate.findOne({ blockchainHash: certificateHash });
        if (existingCertificate) {
          // Clean up uploaded file
          if (fs.existsSync(formidableFile.filepath)) {
            fs.unlinkSync(formidableFile.filepath);
          }
          return res.status(400).json({
            error: 'Certificate already exists',
            message: 'This certificate has already been uploaded and stored on the blockchain. Duplicate uploads are not allowed to prevent tampering.',
            existingCertificate: {
              id: existingCertificate._id,
              fileName: existingCertificate.fileName,
              blockchainHash: existingCertificate.blockchainHash,
              blockchainTxHash: existingCertificate.blockchainTxHash,
              uploadedAt: existingCertificate.uploadedAt,
            },
          });
        }

        // Check if this lawyer already uploaded this certificate
        const lawyerCertificate = await Certificate.findOne({
          lawyerId: lawyer._id,
          blockchainHash: certificateHash,
        });

        if (lawyerCertificate) {
          if (fs.existsSync(formidableFile.filepath)) {
            fs.unlinkSync(formidableFile.filepath);
          }
          return res.status(400).json({
            error: 'You have already uploaded this certificate',
            message: 'This exact certificate file has already been uploaded to your profile.',
          });
        }

        // Check if certificate exists on blockchain (additional verification)
        const existsOnBlockchain = await checkCertificateExistsOnBlockchain(certificateHash);
        if (existsOnBlockchain) {
          // Clean up uploaded file
          if (fs.existsSync(formidableFile.filepath)) {
            fs.unlinkSync(formidableFile.filepath);
          }
          return res.status(400).json({
            error: 'Certificate already exists on blockchain',
            message: 'This certificate hash already exists on the blockchain. The file may have been uploaded before. Duplicate uploads are not allowed.',
          });
        }

        // Store on blockchain
        const blockchainResult = await storeCertificateOnBlockchain(
          certificateHash,
          JSON.stringify({
            lawyerId: lawyer._id.toString(),
            fileName: formidableFile.originalFilename || formidableFile.newFilename,
            uploadedAt: new Date().toISOString(),
          })
        );

        // Save file info to database
        const certificate = await Certificate.create({
          lawyerId: lawyer._id,
          fileName: formidableFile.originalFilename || formidableFile.newFilename || 'certificate',
          filePath: `/uploads/certificates/${formidableFile.newFilename}`,
          fileType: formidableFile.mimetype || 'application/octet-stream',
          fileSize: formidableFile.size,
          blockchainHash: certificateHash,
          blockchainTxHash: blockchainResult?.txHash,
        });

        // Update lawyer's certificates array
        lawyer.certificates.push(certificate._id);
        await lawyer.save();

        res.status(201).json({
          success: true,
          certificate: {
            id: certificate._id,
            fileName: certificate.fileName,
            blockchainHash: certificate.blockchainHash,
            blockchainTxHash: certificate.blockchainTxHash,
          },
        });
      } catch (error: any) {
        // Clean up uploaded file on error
        if (formidableFile.filepath && fs.existsSync(formidableFile.filepath)) {
          fs.unlinkSync(formidableFile.filepath);
        }
        throw error;
      }
    });
  } catch (error: any) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

