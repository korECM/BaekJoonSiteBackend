import schedule from 'node-schedule';
import User from '../models/user';
import { updateUsersData } from './updateUserData';

export function scheduleUserUpdate() {
  console.log('유저 정기 업데이트 스케줄링');
  schedule.scheduleJob('1 0 * * *', async () => {
    try {
      console.log('업데이트 할 유저 찾기');
      const users = await User.find().exec();
      console.log(`${users.length}명의 유저 업데이트 시작`);
      await updateUsersData(users);
      console.log(`${users.length}명의 유저 업데이트 끝`);
    } catch (error) {
      console.error(error);
    }
  });
}
