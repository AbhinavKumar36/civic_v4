import { Router, Request, Response } from 'express';
import multer from 'multer';
import { verifyAadhaar } from '../utils/aadhaar-verifier';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import fs from 'fs';
import path from 'path';

const router = Router();
const upload = multer({ dest: 'uploads/aadhaar/' });

router.post('/verify', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { phone, fullName, dateOfBirth } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'Aadhaar PDF file is required' } });
    }

    if (!phone || !fullName || !dateOfBirth) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
    }

    const isValid = verifyAadhaar(req.file.path, fullName, dateOfBirth);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    if (!isValid) {
      return res.status(400).json({ success: false, error: { message: 'Invalid Aadhaar PDF or Name/DOB mismatch.' } });
    }

    // Upsert User
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone,
        name: fullName,
        dob: dateOfBirth,
        role: 'CITIZEN',
        isVerified: true,
        identityStatus: 'VERIFIED',
        verifiedVia: 'AADHAAR'
      });
    } else {
      user.name = fullName;
      user.dob = dateOfBirth;
      user.isVerified = true;
      user.identityStatus = 'VERIFIED';
      user.verifiedVia = 'AADHAAR';
    }
    
    await user.save();

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);

    res.status(200).json({
      success: true,
      message: 'Aadhaar verified successfully',
      data: {
        accessToken,
        user
      }
    });

  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, error: { message: error.message || 'Internal Server Error' } });
  }
});

export default router;
