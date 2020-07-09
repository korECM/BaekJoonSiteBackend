import { Strategy } from "passport-kakao";
import { PassportStatic } from "passport";
import User from "../models/user";

export default function (passport: PassportStatic) {
  passport.use(
    new Strategy(
      {
        clientID: process.env.KAKAO_ID!,
        callbackURL: "/auth/kakao/callback",
        clientSecret: "",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const exUser = await User.findOne({
            snsId: profile.id,
            provider: "kakao",
          });
          if (exUser) {
            done(null, exUser);
          } else {
            const newUser = await new User({
              email: profile._json && profile.emails,
              name: profile.displayName,
              snsId: profile.id,
              provider: "kakao",
            });
            done(null, newUser);
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
}
