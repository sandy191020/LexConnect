import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate extends Document {
  lawyerId: mongoose.Types.ObjectId;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  blockchainHash?: string;
  blockchainTxHash?: string;
  uploadedAt: Date;
}

const CertificateSchema: Schema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    blockchainHash: {
      type: String,
    },
    blockchainTxHash: {
      type: String,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Certificate as Model<ICertificate>) || mongoose.model<ICertificate>('Certificate', CertificateSchema);

