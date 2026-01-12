import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Booking from '@/models/Booking';
import Lawyer from '@/models/Lawyer';
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
    if (!payload || payload.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can book lawyers' });
    }

    const { lawyerId, caseDescription, hearingDate, hearingTime } = req.body;

    if (!lawyerId) {
      return res.status(400).json({ error: 'Lawyer ID is required' });
    }

    // Check if lawyer exists and is approved
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer || !lawyer.isApproved) {
      return res.status(404).json({ error: 'Lawyer not found or not approved' });
    }

    // Check for existing pending booking
    const existingBooking = await Booking.findOne({
      clientId: payload.userId,
      lawyerId,
      status: 'pending',
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'You already have a pending booking with this lawyer' });
    }

    // Create booking
    const booking = await Booking.create({
      clientId: payload.userId,
      lawyerId,
      caseDescription,
      hearingDate: hearingDate ? new Date(hearingDate) : undefined,
      hearingTime,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        status: booking.status,
        createdAt: booking.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

