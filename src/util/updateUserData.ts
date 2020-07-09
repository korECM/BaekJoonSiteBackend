import request from 'request-promise';
import cheerio from 'cheerio';
import User, { UserInterface } from '../models/user';
// import moment from "moment"
import moment from 'moment-timezone';
import { number } from 'joi';

interface BaekjoonUserDataInterface {
  problems: number[];
  numberOfProblems: number;
}

export async function updateOneUserData(user: UserInterface): Promise<void> {
  const { numberOfProblems, problems } = await getUserData(user.name);

  // const userData = await User.findOne({ name: user });

  // if (!userData) {
  //   console.error(name + ' 유저 존재 X');
  //   return;
  // }

  let date = new Date();
  date.setHours(date.getHours() + 9);

  // 날이 바뀐 경우
  if (user.lastUpdate.getDay() != date.getDay()) {
    user.problemForYesterday = user.problemForToday;
    user.difference = [];
  }

  // 갱신 시간 저장
  user.lastUpdate = date;

  // 푼 문제 수 변화가 없는 경우 끝
  if (numberOfProblems === user.problemForToday) {
    await user.save();
    return;
  }
  // 오늘 푼 문제 수 갱신
  user.problemForToday = numberOfProblems;

  // 오늘 뭘 풀었는지 찾기
  const prevProblems = user.problems;
  let difference = problems.filter((x) => !prevProblems.includes(x));

  // 오늘 푼 문제 저장하고 전체 문제 갱신
  user.difference = difference;
  user.problems = problems;

  await user.save();
}

export async function updateUsersData(userNames: UserInterface[]): Promise<void> {
  await Promise.all([userNames.map((user) => updateOneUserData(user))]);
}

export async function getUserData(userName: string): Promise<BaekjoonUserDataInterface> {
  const url = 'https://www.acmicpc.net/user/' + userName;

  let problems: Array<number> = [];
  let numberOfProblems = -1;

  await request.get(url, function (err, response, body) {
    let $ = cheerio.load(body);
    // const numberOfProblems = $('#statics > tbody > tr:nth-child(2) > td > a').text();
    // console.log(numberOfProblems);
    problems = $('body > div.wrapper > div.container.content > div.row > div:nth-child(2) > div:nth-child(3) > div.col-md-9 > div:nth-child(1) > div.panel-body > span:nth-child(2n-1)')
      .children()
      .toArray()
      .map((data) => parseInt(data.firstChild.nodeValue));
    numberOfProblems = problems.length;
  });

  return { problems, numberOfProblems };
}
