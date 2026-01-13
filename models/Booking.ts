import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBooking extends Document {
  clientId: mongoose.Types.ObjectId;
  lawyerId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  hearingDate?: Date;
  hearingTime?: string;
  caseDescription?: string;
  acceptedAt?: Date;
  rejectedAt?: Date;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },
    hearingDate: {
      type: Date,
    },
    hearingTime: {
      type: String,
    },
    caseDescription: {
      type: String,
      maxlength: 2000,
    },
    acceptedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Booking as Model<IBooking>) || mongoose.model<IBooking>('Booking', BookingSchema);

