import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import User from '@/models/User';
import Lawyer from '@/models/Lawyer';
import { hashPassword, generateToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password, name, address, phone, role, barCouncilNumber, specialization, experience, chargesPerHearing, bio } = req.body;

    // Validate required fields
    if (!email || !password || !name || !address || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate role
    if (!['client', 'lawyer'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Validate lawyer-specific fields
    if (role === 'lawyer') {
      if (!barCouncilNumber || !specialization || !experience || !chargesPerHearing) {
        return res.status(400).json({ error: 'Missing lawyer-specific fields' });
      }

      // Check if bar council number exists
      const existingLawyer = await Lawyer.findOne({ barCouncilNumber });
      if (existingLawyer) {
        return res.status(400).json({ error: 'Bar council number already registered' });
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      address,
      phone,
      role,
      isVerified: role === 'client', // Clients are auto-verified, lawyers need admin approval
    });

    // Create lawyer profile if role is lawyer
    if (role === 'lawyer') {
      await Lawyer.create({
        userId: user._id,
        barCouncilNumber,
        specialization: Array.isArray(specialization) ? specialization : [specialization],
        experience: parseInt(experience),
        chargesPerHearing: parseFloat(chargesPerHearing),
        bio,
        isApproved: false, // Requires admin approval
      });
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

