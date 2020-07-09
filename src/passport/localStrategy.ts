import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import { PassportStatic } from "passport";
import User from "../models/user";

export default function (passport: PassportStatic) {
  passport.use(
    new Strategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const hash = await bcrypt.hash(password, 10);
          const exUser = await User.findOne({ email, password: hash }).exec();
          if (exUser) {
            done(null, exUser);
          } else {
            done(null, false, {
              message: "일치하는 정보가 없습니다",
            });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
}
