import express from 'express';
import mongoose from 'mongoose';
import Joi from 'joi';
import Room, { RoomInterface } from '../models/room';
import * as uuid from 'uuid';
import User, { UserInterface } from '../models/user';
import { isLoggedIn, isNotLoggedIn } from './middleware';
import { ReqUserInterface } from '../util/jwtMiddleware';
import { getUserData, updateUsersData } from '../util/updateUserData';
import { updateRoomData, updateRecommendedProblem } from '../util/updateRoomData';
const DAY = 1000 * 60 * 60 * 24;

const router = express.Router();

router.post('/makeRoom', isLoggedIn, async (req, res, next) => {
  const schema = Joi.object().keys({
    title: Joi.string().required().min(1).max(10),
    problemPerDay: Joi.number().required().min(1),
    minProblemLevel: Joi.number().required().min(1).max(30),
    maxProblemLevel: Joi.number().required().min(1).max(30),
  });

  const result = Joi.validate(req.body, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }
  const { title, problemPerDay, minProblemLevel, maxProblemLevel } = req.body;

  try {
    const enterId = uuid.v4().replace(/-/g, '');

    const owner = await User.findOne({
      _id: (req.user! as ReqUserInterface)._id,
    });

    let date = new Date();
    date.setHours(date.getHours() + 9);

    const room = await new Room({
      title,
      problemPerDay,
      enterId,
      members: [owner!._id],
      owner: owner!.id,
      minProblemLevel,
      maxProblemLevel,
      lastUpdate: date,
    });

    await room.save();

    await updateRecommendedProblem(room._id);

    owner?.rooms.push(room._id);
    await owner?.save();

    const data = room.toJSON() as RoomInterface;
    delete data.__v;

    res.send(data);
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.get('/enterRoom/:enterId', isLoggedIn, async (req, res, next) => {
  const schema = Joi.object().keys({
    enterId: Joi.string().required(),
  });

  const result = Joi.validate(req.params, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { enterId } = req.params;

  try {
    const room = await Room.findOne({ enterId }).exec();
    console.log(room);
    if (!room) {
      console.error('입장하려는 방 찾을 수 없음');
      return res.status(406).send();
    }
    const user = await User.findOne({
      _id: (req.user! as ReqUserInterface)._id,
    });
    if (!user) {
      console.error('로그인 한 유저 정보 찾을 수 없음');
      return res.status(406).send();
    }

    if (!user.rooms.includes(room._id)) {
      user.rooms.push(room._id);
      await user.save();
    }

    if (room.members.includes(user._id)) {
      console.log('해당 유저 이미 존재');
    } else {
      room.members.push(user._id);
      await room.save();
    }

    return res.json({
      roomId: room._id,
    });
  } catch (error) {
    console.error(error);
  }

  res.send('');
});

router.get('/getMembers/:roomID', async (req, res, next) => {
  const schema = Joi.object().keys({
    roomID: Joi.string().required(),
  });

  const result = Joi.validate(req.params, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { roomID } = req.params;

  try {
    const room = await Room.findOne({ _id: roomID }).populate('members').exec();
    if (!room) {
      return res.status(406).send();
    }
    const members = (room.members as [any]).map((member) => ({
      name: member.name,
    }));

    return res.json(members);
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.get('/getRooms', isLoggedIn, async (req, res, next) => {
  try {
    const loginUser = req.user;
    if (!loginUser) {
      return res.status(403).send();
    }
    const user = await User.findOne({ _id: (loginUser as ReqUserInterface)._id })
      .populate('rooms')
      .exec();

    if (!user) {
      return res.status(403).send();
    }

    return res.json(user.rooms);
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.get('/getRoomInfo/:roomID', isLoggedIn, async (req, res, next) => {
  const schema = Joi.object().keys({
    roomID: Joi.string().required(),
  });

  const result = Joi.validate(req.params, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { roomID } = req.params;

  try {
    const loginUser = req.user!;

    const user = await User.findOne({ _id: (loginUser as ReqUserInterface)._id });

    if (!user) {
      console.error('해당 유저가 존재하지 않음');
      return res.status(406).send();
    }

    let room = await Room.findOne({ _id: roomID }).populate('members').exec();
    if (!room) {
      console.error('해당 방이 존재하지 않음');
      return res.status(406).send();
    }

    if ((room.members as UserInterface[]).map((member) => member._id).includes(user._id) === false) {
      console.error('해당 유저가 방에 없음');
      return res.status(401).send();
    }

    console.log(`${room.title}방 업데이트 시작`);
    await updateUsersData(room.members as UserInterface[]);
    console.log(`${room.title}방 업데이트 끝`);

    console.log(`${room.title} 방 정보 업데이트 시작`);
    await updateRoomData(room._id);
    console.log(`${room.title} 방 정보 업데이트 끝`);

    room = await Room.findOne({ _id: roomID }).populate('members').exec();

    let members = (room!.members as UserInterface[]).map((member) => {
      let temp = member;
      delete temp.password;
      delete temp.rooms;
      return temp;
    });

    let connector = user.toJSON();

    delete connector.password;
    delete connector.rooms;

    return res.json({
      room: {
        problemPerDay: room?.problemPerDay,
        title: room?.title,
        _id: room?._id,
        enterId: room?.enterId,
        recommendedProblems: room?.recommendedProblem,
      },
      members,
      user: connector,
      isOwner: room!.owner.toString() === `${user._id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

router.get('/deleteRoom/:roomID', isLoggedIn, async (req, res, next) => {
  const schema = Joi.object().keys({
    roomID: Joi.string().required(),
  });

  const result = Joi.validate(req.params, schema);

  if (result.error) {
    console.error(result.error);
    res.status(403).send();
  }

  const { roomID } = req.params;

  try {
    const loginUser = req.user!;

    const user = await User.findOne({ _id: (loginUser as ReqUserInterface)._id });

    if (!user) {
      console.error('해당 유저가 존재하지 않음');
      return res.status(406).send();
    }

    let room = await Room.findOne({ _id: roomID }).populate('members').exec();
    if (!room) {
      console.error('해당 방이 존재하지 않음');
      return res.status(406).send();
    }

    if ((room.members as UserInterface[]).map((member) => member._id).includes(user._id) === false) {
      console.error('해당 유저가 방에 없음');
      return res.status(401).send();
    }

    (room.members as UserInterface[]).forEach(async (member) => {
      const roomMember = await User.findOne({ _id: member._id }).exec();
      if (!roomMember) return;
      roomMember.rooms = roomMember.rooms.filter((roomIdForMember) => `${roomIdForMember}` !== `${room!._id}`);

      await roomMember?.save();
    });

    await Room.deleteOne({ _id: roomID });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(403).send();
  }
});

export default router;
