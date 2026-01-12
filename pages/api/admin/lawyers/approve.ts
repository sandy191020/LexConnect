import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Lawyer from '@/models/Lawyer';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

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
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { lawyerId, approve } = req.body;

    if (!lawyerId) {
      return res.status(400).json({ error: 'Lawyer ID is required' });
    }

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer not found' });
    }

    if (approve) {
      lawyer.isApproved = true;
      lawyer.verificationBadge = true;
      lawyer.approvedBy = payload.userId;
      lawyer.approvedAt = new Date();

      // Also verify the user
      await User.findByIdAndUpdate(lawyer.userId, { isVerified: true });
    } else {
      // Reject - you might want to add a rejection reason field
      lawyer.isApproved = false;
    }

    await lawyer.save();

    res.status(200).json({
      success: true,
      message: approve ? 'Lawyer approved successfully' : 'Lawyer rejected',
      lawyer: {
        id: lawyer._id,
        isApproved: lawyer.isApproved,
        verificationBadge: lawyer.verificationBadge,
      },
    });
  } catch (error: any) {
    console.error('Error approving lawyer:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

