import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

// This endpoint allows creating an admin account
// For security, you might want to add additional checks (like a secret key)
// or disable this in production

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const { email, password, name, address, phone, secretKey } = req.body;

    // Optional: Add a secret key check for security
    // Remove this check if you want to allow admin creation without a key
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'change-this-secret-key';
    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({ error: 'Invalid secret key' });
    }

    // Validate required fields
    if (!email || !password || !name || !address) {
      return res.status(400).json({ error: 'Missing required fields: email, password, name, address' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      name,
      address,
      phone,
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

