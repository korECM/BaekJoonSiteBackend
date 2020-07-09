import express from 'express';
import config from './src/config/serverConfig';
import baseRouter from './src/router';
import authRouter from './src/router/auth';
import roomRouter from './src/router/room';
import dotenv from 'dotenv';
import { scheduleUserUpdate } from './src/util/userUpdateSchedule';
dotenv.config();

const app = express();

config(app)
  .then(() => {
    scheduleUserUpdate();

    app.use('/', baseRouter);

    app.use('/auth', authRouter);

    app.use('/room', roomRouter);

    app.use((req, res, next) => {
      const err = new Error('Not Found');
      //   err.status = 404;
      next(err);
    });

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.locals.message = err.message;
      res.locals.error = req.app.get('env') === 'development' ? err : {};
      res.status(500);
      res.render('error');
    });

    app.listen(app.get('port'), () => {
      console.log(app.get('port'), '번 포트에서 대기 중');
    });
  })
  .catch((error) => {
    console.error(error);
  });
