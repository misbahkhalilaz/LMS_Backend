export interface LoginReq {
  userId: string;
  password: string;
}

export interface LoginToken {
  id: number;
  password: string;
  role: string;
}

export interface AuthRes {
  message: string;
  token: string;
}

export interface LoginRes extends AuthRes {
  userId: string;
  name: string;
  role: string;
  phone: string;
  email: string | null;
}

export interface ForgetpassToken {
  id: number;
  otp: number;
}

export interface VerifyOtpToken {
  id: number;
  otpSuccess: boolean;
}
