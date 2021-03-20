export interface User {
  user_id: string;
  name: string;
  phone_no: string;
  email: string;
}

export interface Teacher extends User {
  role: string;
}

export interface Program {
  name: string;
  no_of_years: number;
  max_enrol_years: number;
}

export interface Course {
  program_id: number;
  semester: number;
  name: string;
  code: string;
  credit_hr: number;
  total_marks: number;
}

export interface Batch {
  program_id: number;
  name: string;
  shift: string;
  starting_yr: string;
  ending_yr: string;
}
