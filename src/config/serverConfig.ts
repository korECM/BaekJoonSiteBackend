import express from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import session from 'express-session';
import helmet from 'helmet';
import hpp from 'hpp';
import passport from 'passport';
import passportConfig from '../passport';
import connectToDB from './mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import jwtMiddleware from '../util/jwtMiddleware';
dotenv.config();

export default async function config(app: express.Application) {
  passportConfig(passport);

  const sessionOption: session.SessionOptions = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET!,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  };

  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    sessionOption.proxy = true;
    sessionOption.cookie!.secure = true;
    app.use(helmet());
    app.use(hpp());
  } else {
    app.use(morgan('dev'));
  }

  app.set('port', process.env.PORT || 8001);

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    }),
  );

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(session(sessionOption));

  app.use(jwtMiddleware);

  app.use(cors({ origin: ['http://localhost:3000', 'https://relaxed-lalande-e7ac94.netlify.app/'], credentials: true }));

  await connectToDB();

  return app;
}
