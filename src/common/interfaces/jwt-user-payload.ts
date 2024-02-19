import { Permission } from '../entities';

export interface JwtUserPayload {
  id: number;
  email: string;
  username?: string;
  roles?: string[];
  permissions?: Permission[];
  isAdmin: boolean;
}

declare module 'express' {
  interface Request {
    user: JwtUserPayload;
  }
}
