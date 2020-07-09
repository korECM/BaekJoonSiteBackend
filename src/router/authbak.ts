// import express from "express";
// import passport from "passport";
// import bcrypt from "bcrypt";
// import { isNotLoggedIn, isLoggedIn } from "./middleware";
// import User, { UserInterface } from "../models/user";

// const router = express.Router();

// router.get("/", async (req, res, next) => {
//   if (req.user) {
//     const user = req.user! as UserInterface;
//     return res.json({
//       name: user.name,
//       email: user.email,
//     });
//   } else {
//     return res.json({
//       name: "",
//       email: "",
//     });
//   }
// });

// router.get("/emailCheck/:email", isNotLoggedIn, async (req, res, next) => {
//   const { email } = req.params;
//   try {
//     const exUser = await User.findOne({ email }).exec();
//     if (exUser) {
//       res.json({
//         message: "fail",
//       });
//     } else {
//       res.json({
//         message: "success",
//       });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(403).send();
//   }
// });

// router.post("/join", isNotLoggedIn, async (req, res, next) => {
//   const { name, email, password } = req.body;

//   try {
//     const exUser = await User.findOne({ email }).exec();

//     if (!exUser) {
//       const hash = await bcrypt.hash(password, 10);
//       const user = new User({
//         name,
//         email,
//         password: hash,
//         provider: "local",
//       });
//       await user.save();

//       req.login(user, (err) => {
//         if (err) {
//           console.error(err);
//         }
//       });

//       return res.json({
//         message: "success",
//       });
//     } else {
//       res.status(403).send();
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(403).send();
//   }
// });

// router.post("/login", isNotLoggedIn, async (req, res, next) => {
//   passport.authenticate("local", (authError, user, info) => {
//     if (authError) {
//       console.error(authError);
//       return next(authError);
//     }
//     if (!user) {
//       res.status(403).send("Login error");
//     }
//     return req.login(user, (loginError) => {
//       if (loginError) {
//         console.error(loginError);
//         return next(loginError);
//       }
//       return res.redirect("/");
//     });
//   });
// });

// router.get("/kakao", passport.authenticate("kakao"));
// router.get(
//   "/kakao/callback",
//   passport.authenticate("kakao", {
//     failureRedirect: "/",
//   }),
//   (req, res) => {
//     res.redirect("/");
//   }
// );

// router.get("/logout", isLoggedIn, async (req: express.Request, res, next) => {
//   req.logout();
//   req.session?.destroy(() => {});
//   res.send("success");
// });

// export default router;
