// import local from "./localStrategy";
// import kakao from "./kakaoStrategy";
import { PassportStatic } from 'passport';

import User from '../models/user';

export default function config(passport: PassportStatic) {
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findOne({ _id: id })
      .lean()
      .exec()
      .then((user) => {
        done(null, user);
      })
      .catch((err) => done(err));
  });

  // local(passport);
  // kakao(passport);
}
