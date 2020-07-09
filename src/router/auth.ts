import express from 'express';
import Joi, { number } from 'joi';
import User, { generateToken } from '../models/user';
import bcrypt from 'bcrypt';
import { getUserData, updateOneUserData } from '../util/updateUserData';
import { ReqUserInterface } from '../util/jwtMiddleware';
const DAY = 1000 * 60 * 60 * 24;

export interface IGetUserAuthInfoRequest extends express.Request {
  user: ReqUserInterface; // or any other type
}

const router = express.Router();

router.post('/join', async (req, res, next) => {
  const schema = Joi.object().keys({
    name: Joi.string().required().min(1).max(16),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(16),
  });
  const result = Joi.validate(req.body, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { name, email, password } = req.body;

  try {
    const exUser = await User.findOne({ email });
    if (exUser) {
      console.error('회원가입 하려는 이메일 존재');
      return res.status(409).send('Conflict');
    } else {
      let numberOfProblems: number, problems: number[];
      try {
        let temp = await getUserData(name);
        numberOfProblems = temp.numberOfProblems;
        problems = temp.problems;

        console.log(numberOfProblems, problems);
        if (numberOfProblems === -1) {
          console.error('해당 이름의 백준 계정 존재 X');
          return res.status(406).send('No Baekjoon user');
        }
      } catch (error) {
        console.error('해당 이름의 백준 계정 존재 X');
        return res.status(406).send('No Baekjoon user');
      }

      let date = new Date();
      date.setHours(date.getHours() + 9);

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await new User({
        name,
        email,
        rooms: [],
        password: hashedPassword,
        problems,
        problemForToday: numberOfProblems,
        problemForYesterday: numberOfProblems,
        lastUpdate: date,
      });

      await user.save();

      const token = generateToken(user);

      res.cookie('access_token', token, {
        maxAge: DAY,
        httpOnly: true,
      });

      const data = user.toJSON();
      delete data.password;
      delete data._id;
      delete data.publishedDate;
      delete data.__v;

      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.post('/login', async (req, res, next) => {
  const schema = Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).max(16),
  });

  const result = Joi.validate(req.body, schema);
  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).send('일치하는 계정 없음');
    }
    const valid = await bcrypt.compare(password, user.password.toString());
    if (!valid) {
      return res.status(403).send('일치하는 계정 없음');
    }

    await updateOneUserData(user);

    const token = generateToken(user);

    res.cookie('access_token', token, {
      maxAge: DAY,
      httpOnly: true,
    });

    const data = user.toJSON();
    delete data.password;
    delete data._id;
    delete data.publishedDate;
    delete data.__v;

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.get('/check', async (req, res: express.Response, next) => {
  const user = req.user;
  if (!user) {
    // 로그인 중이 아닌 경우
    res.status(401).send();
  } else {
    // 로그인 한 경우
    res.send(user);
  }
});

router.get('/logout', (req, res, next) => {
  res.clearCookie('access_token');
  res.status(204).send();
});

export default router;
