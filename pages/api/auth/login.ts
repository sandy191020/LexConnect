import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Lawyer from '@/models/Lawyer';
import { verifyPassword, generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get lawyer profile if exists
    let lawyerProfile = null;
    if (user.role === 'lawyer') {
      lawyerProfile = await Lawyer.findOne({ userId: user._id });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        profilePhoto: user.profilePhoto,
        lawyerProfile: lawyerProfile ? {
          isApproved: lawyerProfile.isApproved,
          verificationBadge: lawyerProfile.verificationBadge,
        } : null,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

