export interface User {
  id: string;
  name: string;
  mobile: string;
}

export interface VerifyOtpRequest {
  mobile: string;
  otp: string;
}

export interface VerifyOtpResponse {
  token: string;
  user: User;
}