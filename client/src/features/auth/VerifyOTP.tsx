import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const verifySchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits')
});

type VerifyForm = z.infer<typeof verifySchema>;

export const VerifyOTP: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema)
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const phone = location.state?.phone;

  if (!phone) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: VerifyForm) => {
    try {
      const res = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: data.otp })
      });
      const result = await res.json();
      if (result.success) {
        login(result.data.accessToken, result.data.user);
        if (result.data.user.role === 'AUTHORITY') {
          navigate('/authority');
        } else {
          navigate('/citizen');
        }
      } else {
        alert(result.error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify OTP</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">Sent to {phone}</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Enter 6-digit OTP</label>
              <Input placeholder="123456" {...register('otp')} />
              {errors.otp && <span className="text-red-500 text-sm">{errors.otp.message}</span>}
            </div>
            <Button type="submit" className="w-full">Verify</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
