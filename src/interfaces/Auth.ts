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
  role: string;
}

export interface ForgetpassToken {
  id: number;
  otp: number;
}

export interface VerifyOtpToken {
  id: number;
  otpSuccess: boolean;
}
