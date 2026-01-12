import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import Lawyer from '@/models/Lawyer';
import User from '@/models/User';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Only approved lawyers are visible to clients
    const lawyers = await Lawyer.find({ isApproved: true })
      .populate('userId', 'name email profilePhoto')
      .select('barCouncilNumber specialization experience chargesPerHearing bio verificationBadge rating totalBookings')
      .sort({ rating: -1, totalBookings: -1 });

    const lawyersList = lawyers.map((lawyer: any) => ({
      id: lawyer._id,
      userId: lawyer.userId._id,
      name: lawyer.userId.name,
      email: lawyer.userId.email,
      profilePhoto: lawyer.userId.profilePhoto,
      barCouncilNumber: lawyer.barCouncilNumber,
      specialization: lawyer.specialization,
      experience: lawyer.experience,
      chargesPerHearing: lawyer.chargesPerHearing,
      bio: lawyer.bio,
      verificationBadge: lawyer.verificationBadge,
      rating: lawyer.rating,
      totalBookings: lawyer.totalBookings,
    }));

    res.status(200).json({ success: true, lawyers: lawyersList });
  } catch (error: any) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

