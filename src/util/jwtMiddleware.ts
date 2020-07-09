import jwt from 'jsonwebtoken';
import express from 'express';
import User, { generateToken } from '../models/user';
const DAY = 1000 * 60 * 60 * 24;
const HOUR = 60 * 60;

interface UserJwt {
  name: string;
  email: string;
  _id: string;
  exp: number;
  rooms: string[];
}

export interface ReqUserInterface {
  name: string;
  email: string;
  _id: string;
  rooms: string[];
}

const jwtMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserJwt;
    const { name, email, _id, rooms } = decoded;
    req.user = {
      name,
      email,
      _id,
      rooms,
    };

    // 토큰 만료가 1시간 남은 경우 재발금
    const now = Date.now();
    if (decoded.exp - now < HOUR) {
      const user = await User.findOne({ _id });
      const token = generateToken(user!);
      res.cookie('access_token', token, {
        maxAge: DAY,
        httpOnly: true,
      });
    }

    return next();
  } catch (error) {
    return next();
  }
};

export default jwtMiddleware;
