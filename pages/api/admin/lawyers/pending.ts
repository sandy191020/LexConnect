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

    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const lawyers = await Lawyer.find({ isApproved: false })
      .populate('userId', 'name email address phone profilePhoto')
      .populate('certificates')
      .sort({ createdAt: -1 });

    const lawyersList = lawyers.map((lawyer: any) => ({
      id: lawyer._id,
      user: {
        id: lawyer.userId._id,
        name: lawyer.userId.name,
        email: lawyer.userId.email,
        address: lawyer.userId.address,
        phone: lawyer.userId.phone,
        profilePhoto: lawyer.userId.profilePhoto,
      },
      barCouncilNumber: lawyer.barCouncilNumber,
      specialization: lawyer.specialization,
      experience: lawyer.experience,
      chargesPerHearing: lawyer.chargesPerHearing,
      bio: lawyer.bio,
      certificates: lawyer.certificates,
      createdAt: lawyer.createdAt,
    }));

    res.status(200).json({ success: true, lawyers: lawyersList });
  } catch (error: any) {
    console.error('Error fetching pending lawyers:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

