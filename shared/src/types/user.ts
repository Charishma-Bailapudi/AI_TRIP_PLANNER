export interface User {
  userId: string;
  email: string;
  name: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUserResponse {
  userId: string;
  email: string;
  name: string;
}

export interface LoginResponseData {
  accessToken: string;
  expiresInSeconds: number;
  user: AuthUserResponse;
}
