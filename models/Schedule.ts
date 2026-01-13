import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISchedule extends Document {
  lawyerId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  bookingId?: mongoose.Types.ObjectId;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema: Schema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,
      ref: 'Lawyer',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.Schedule as Model<ISchedule>) || mongoose.model<ISchedule>('Schedule', ScheduleSchema);

