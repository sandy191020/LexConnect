import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Lawyer from '@/models/Lawyer';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { sendBookingRejectionEmail } from '@/lib/email'; // 👈 new import

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
      return res.status(403).json({ error: 'Only lawyers can reject bookings' });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId).populate('lawyerId').populate('clientId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const lawyer = await Lawyer.findOne({ userId: payload.userId });
    if (!lawyer || booking.lawyerId._id.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    // Update booking status
    booking.status = 'rejected';
    booking.rejectedAt = new Date();
    await booking.save();

    // Get lawyer and client details
    const lawyerUser = await User.findById(lawyer.userId);
    const clientUser = await User.findById(booking.clientId);

    // Send rejection email to client
    if (lawyerUser && clientUser) {
      await sendBookingRejectionEmail(
        clientUser.email,
        lawyerUser.name,
        lawyerUser.email,
        booking.hearingDate,
        booking.hearingTime
      );

      booking.emailSent = true;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking rejected and email sent to client',
      booking: {
        id: booking._id,
        status: booking.status,
        rejectedAt: booking.rejectedAt,
      },
    });
  } catch (error: any) {
    console.error('Error rejecting booking:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
