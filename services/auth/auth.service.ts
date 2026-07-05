import { VerifyOtpRequest, VerifyOtpResponse } from '../../types/auth';
import { DEMO_MOBILE, DEMO_OTP } from '../../constants/validation';

export const AuthService = {
  sendOtp: async (mobile: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulating backend validation
        if (mobile === DEMO_MOBILE) {
          resolve({ success: true });
        } else {
          reject(new Error('Invalid mobile number.'));
        }
      }, 800);
    });
  },

  verifyOtp: async (request: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulating backend verification
        if (request.mobile === DEMO_MOBILE && request.otp === DEMO_OTP) {
          resolve({
            token: 'dummy-token',
            user: {
              id: '1',
              name: 'John Doe',
              mobile: DEMO_MOBILE,
            },
          });
        } else {
          reject(new Error('Invalid OTP. Please try again.'));
        }
      }, 800);
    });
  },
};