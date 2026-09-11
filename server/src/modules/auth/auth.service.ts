import { OTPRequest } from '../../models/OTPRequest';
import { User, IUser } from '../../models/User';
import { Session } from '../../models/Session';
import { AuditLog } from '../../models/AuditLog';
import { textBeeService } from '../../services/notifications/TextBeeProvider';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class AuthService {
  async sendOTP(phone: string): Promise<string> {
    // Basic rate limit per phone checks could be done here or in middleware
    
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const requestId = crypto.randomUUID();

    await OTPRequest.create({
      phone,
      requestId,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 mins
    });

    // We do NOT log the OTP in production.
    const message = `Your Civic Pulse verification code is: ${otp}. Valid for 5 minutes.`;
    await textBeeService.sendSMS(phone, message);

    return requestId;
  }

  async verifyOTP(phone: string, otp: string): Promise<{ accessToken: string, refreshToken: string, user: IUser }> {
    // DEMO BYPASS: Allow '123456' as a universal bypass for demo purposes
    if (otp !== '123456') {
      const otpReq = await OTPRequest.findOne({
        phone,
        verified: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });

      if (!otpReq) {
        throw new Error('Invalid or expired OTP');
      }

      if (otpReq.attempts >= 3) {
        throw new Error('Maximum verification attempts reached');
      }

      otpReq.attempts += 1;
      await otpReq.save();

      const isValid = await bcrypt.compare(otp, otpReq.otpHash);
      if (!isValid) {
        throw new Error('Invalid OTP');
      }

      // Mark as verified to prevent reuse
      otpReq.verified = true;
      await otpReq.save();
    }

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, isVerified: true });
      await AuditLog.create({
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user._id.toString(),
      });
    } else {
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      await AuditLog.create({
        actorId: user._id,
        action: 'USER_LOGGED_IN',
        entityType: 'User',
        entityId: user._id.toString(),
      });
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await Session.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken, user };
  }
}

export const authService = new AuthService();
