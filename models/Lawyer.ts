import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILawyer extends Document {
  userId: mongoose.Types.ObjectId;
  barCouncilNumber: string;
  specialization: string[];
  experience: number;
  chargesPerHearing: number;
  bio?: string;
  certificates: mongoose.Types.ObjectId[];
  blockchainHash?: string;
  isApproved: boolean;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  verificationBadge: boolean;
  rating?: number;
  totalBookings?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LawyerSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    barCouncilNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    specialization: {
      type: [String],
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    chargesPerHearing: {
      type: Number,
      required: true,
      min: 0,
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    certificates: [{
      type: Schema.Types.ObjectId,
      ref: 'Certificate',
    }],
    blockchainHash: {
      type: String,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    verificationBadge: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Lawyer as Model<ILawyer>) || mongoose.model<ILawyer>('Lawyer', LawyerSchema);

