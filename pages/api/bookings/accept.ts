import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Lawyer from '@/models/Lawyer';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { sendBookingAcceptanceEmail } from '@/lib/email';

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
      return res.status(403).json({ error: 'Only lawyers can accept bookings' });
    }

    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Find booking
    const booking = await Booking.findById(bookingId).populate('lawyerId').populate('clientId');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Verify lawyer owns this booking
    const lawyer = await Lawyer.findOne({ userId: payload.userId });
    if (!lawyer || booking.lawyerId._id.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not pending' });
    }

    // Update booking status
    booking.status = 'accepted';
    booking.acceptedAt = new Date();
    await booking.save();

    // Get lawyer and client details
    const lawyerUser = await User.findById(lawyer.userId);
    const clientUser = await User.findById(booking.clientId);

    if (lawyerUser && clientUser) {
      // Send email to client
      await sendBookingAcceptanceEmail(
        clientUser.email,
        lawyerUser.name,
        lawyerUser.email,
        lawyerUser.phone || 'N/A',
        lawyer.chargesPerHearing,
        booking.hearingDate,
        booking.hearingTime
      );

      booking.emailSent = true;
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Booking accepted and email sent to client',
      booking: {
        id: booking._id,
        status: booking.status,
        acceptedAt: booking.acceptedAt,
      },
    });
  } catch (error: any) {
    console.error('Error accepting booking:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

