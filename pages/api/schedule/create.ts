import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Schedule from '@/models/Schedule';
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
    if (!payload || payload.role !== 'lawyer') {
      return res.status(403).json({ error: 'Only lawyers can create schedules' });
    }

    const { date, startTime, endTime } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ error: 'Date, start time, and end time are required' });
    }

    const lawyer = await Lawyer.findOne({ userId: payload.userId });
    if (!lawyer) {
      return res.status(404).json({ error: 'Lawyer profile not found' });
    }

    // Check for conflicts
    const conflictingSchedule = await Schedule.findOne({
      lawyerId: lawyer._id,
      date: new Date(date),
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
      ],
      isAvailable: true,
    });

    if (conflictingSchedule) {
      return res.status(400).json({ error: 'Time slot conflicts with existing schedule' });
    }

    const schedule = await Schedule.create({
      lawyerId: lawyer._id,
      date: new Date(date),
      startTime,
      endTime,
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      schedule: {
        id: schedule._id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      },
    });
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

