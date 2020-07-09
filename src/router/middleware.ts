import express from 'express';

// export function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
//   console.log(req.isAuthenticated());
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.status(403).send();
//   }
// }

// export function isNotLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
//   if (!req.isAuthenticated()) {
//     next();
//   } else {
//     res.status(403).send();
//   }
// }

export function isLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.user) {
    return next();
  }
  res.status(401).send();
}

export function isNotLoggedIn(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    return next();
  }
  res.status(401).send();
}
