export interface User {
  name: string;
  email: string;
  gender: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  id: number;
  status: boolean;
}

export interface UserReq {
  email: string;
  password: string;
}
