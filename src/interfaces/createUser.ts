export interface User {
  user_id: string;
  name: string;
  phone_no: string;
  email: string;
}

export interface Teacher extends User {
  role: string;
}
