export interface User {
  name: string;
  addressLine: string;
  email: string;
  gender: string;
  password: string;
}

export interface UserReq {
  email: string;
  password: string;
}
