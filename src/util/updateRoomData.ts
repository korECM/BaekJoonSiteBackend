import Room from '../models/room';
import { getProblemsBetweenTier, ProblemAPIInterface } from './getProblemsFromTier';
import { UserInterface } from '../models/user';
import { RoomInterface } from '../models/room';

export async function updateRecommendedProblem(roomId: string) {
  console.log('방 추천 문제 업데이트');

  try {
    const room = await Room.findOne({ _id: roomId }).populate('members');

    if (!room) {
      console.error('업데이트 하려는 방 존재 X');
      return;
    }

    let result: ProblemAPIInterface[] = [];
    const membersProblemSet = new Set<number>();
    (room.members as UserInterface[]).forEach((member) => {
      console.log(member);
      member.problems.forEach((problem) => membersProblemSet.add(problem));
    });

    while (true) {
      const problems = await getProblemsBetweenTier(room.minProblemLevel, room.maxProblemLevel);
      problems.result.problems.forEach((problem) => {
        if (membersProblemSet.has(problem.id)) return;
        if (result.length > 10) return;
        result.push({
          average_try: problem.average_try,
          id: problem.id,
          level: problem.level,
          solvable: problem.solvable,
          solved_count: problem.solved_count,
          title: problem.title,
        });
      });
      if (result.length > 10) break;
    }

    room.recommendedProblem = result;

    let date = new Date();
    date.setHours(date.getHours() + 9);

    room.lastUpdate = date;

    await room.save();
  } catch (error) {
    console.error(error);
  }
}

export async function updateRoomData(roomId: string) {
  try {
    const room = await Room.findOne({ _id: roomId }).populate('members');

    if (!room) {
      console.error('업데이트 하려는 방 존재 X');
      return;
    }

    let date = new Date();
    date.setHours(date.getHours() + 9);

    if (date.getDay() != room.lastUpdate.getDay()) {
      updateRecommendedProblem(roomId);
    }
  } catch (error) {
    console.error(error);
  }
}
