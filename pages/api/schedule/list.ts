import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';
import Lawyer from '@/models/Lawyer';
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

    const { lawyerId, startDate, endDate } = req.query;

    let query: any = {};

    if (payload.role === 'lawyer') {
      const lawyer = await Lawyer.findOne({ userId: payload.userId });
      if (!lawyer) {
        return res.status(404).json({ error: 'Lawyer profile not found' });
      }
      query.lawyerId = lawyer._id;
    } else if (lawyerId) {
      query.lawyerId = lawyerId;
    }

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    const schedules = await Schedule.find(query)
      .populate('bookingId')
      .sort({ date: 1, startTime: 1 });

    const schedulesList = schedules.map((schedule: any) => ({
      id: schedule._id,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable,
      bookingId: schedule.bookingId,
      reminderSent: schedule.reminderSent,
    }));

    res.status(200).json({ success: true, schedules: schedulesList });
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

