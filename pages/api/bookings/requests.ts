import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Lawyer from '@/models/Lawyer';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let bookings;

    if (payload.role === 'lawyer') {
      // Get bookings for this lawyer
      const lawyer = await Lawyer.findOne({ userId: payload.userId });
      if (!lawyer) {
        return res.status(404).json({ error: 'Lawyer profile not found' });
      }

      bookings = await Booking.find({ lawyerId: lawyer._id })
        .populate('clientId', 'name email profilePhoto')
        .sort({ createdAt: -1 });
    } else if (payload.role === 'client') {
      // Get bookings for this client
      bookings = await Booking.find({ clientId: payload.userId })
        .populate({
          path: 'lawyerId',
          populate: { path: 'userId', select: 'name email profilePhoto' },
        })
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const bookingsList = bookings.map((booking: any) => ({
      id: booking._id,
      status: booking.status,
      caseDescription: booking.caseDescription,
      hearingDate: booking.hearingDate,
      hearingTime: booking.hearingTime,
      createdAt: booking.createdAt,
      acceptedAt: booking.acceptedAt,
      rejectedAt: booking.rejectedAt,
      ...(payload.role === 'lawyer'
        ? {
            client: {
              id: booking.clientId._id,
              name: booking.clientId.name,
              email: booking.clientId.email,
              profilePhoto: booking.clientId.profilePhoto,
            },
          }
        : {
            lawyer: {
              id: booking.lawyerId._id,
              name: booking.lawyerId.userId.name,
              email: booking.lawyerId.userId.email,
              profilePhoto: booking.lawyerId.userId.profilePhoto,
              chargesPerHearing: booking.lawyerId.chargesPerHearing,
            },
          }),
    }));

    res.status(200).json({ success: true, bookings: bookingsList });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

