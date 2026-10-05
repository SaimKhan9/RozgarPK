import jwt from 'jsonwebtoken';
import type { JwtPayload } from '../types';

const SECRET = process.env.JWT_ACCESS_SECRET || 'rozgarpk_dev_access_secret';
const EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, SECRET) as JwtPayload;
};
