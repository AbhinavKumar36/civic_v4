import { Request, Response } from 'express';
import { authService } from './auth.service';
import { z } from 'zod';
import { Session } from '../../models/Session';
import { User } from '../../models/User';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

const sendOtpSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number')
});

const verifyOtpSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

const signupSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().optional(),
  role: z.enum(['CITIZEN', 'AUTHORITY', 'ADMIN']).optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
});

export const sendOTP = async (req: Request, res: Response) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    const requestId = await authService.sendOTP(phone);
    res.json({ success: true, data: { requestId } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Failed to send OTP' } });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.verifyOTP(phone, otp);
    
    // Set refresh token in http-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, data: { accessToken, user } });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { message: error.message || 'Verification failed' } });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const data = signupSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.signup(data);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ success: true, data: { accessToken, user } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { message: error.message || 'Signup failed' } });
  }
};

export const loginWithPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { accessToken, refreshToken, user } = await authService.login(email, password);
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, data: { accessToken, user } });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { message: error.message || 'Login failed' } });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new Error('No refresh token provided');

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.userId);
    if (!user) throw new Error('User not found');

    // Basic rotation: issue new access token
    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    res.json({ success: true, data: { accessToken } });
  } catch (error: any) {
    res.status(401).json({ success: false, error: { message: 'Invalid refresh token' } });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // In a real scenario, we'd also find the session and revoke it
    res.clearCookie('refreshToken');
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { message: 'Logout failed' } });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-__v');
    if (!user) throw new Error('User not found');
    res.json({ success: true, data: { user } });
  } catch (error: any) {
    res.status(404).json({ success: false, error: { message: error.message } });
  }
};
