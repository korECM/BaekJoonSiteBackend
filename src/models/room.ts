import mongoose from 'mongoose';

import { UserSchema, UserInterface } from './user';
import { ProblemSchema } from './problem';
import { ProblemAPIInterface } from '../util/getProblemsFromTier';

const { Schema } = mongoose;

export interface RoomInterface extends mongoose.Document {
  title: string;
  size: number;
  problemPerDay: number;
  enterId: string;
  minProblemLevel: number;
  maxProblemLevel: number;
  recommendedProblem: ProblemAPIInterface[];
  members: string[] | UserInterface[];
  owner: string | UserInterface;
  lastUpdate: Date;
  publishedDate: Date;
}

const RoomSchema = new Schema({
  title: String,
  size: Number,
  problemPerDay: Number,
  enterId: String,
  minProblemLevel: Number,
  maxProblemLevel: Number,
  recommendedProblem: [ProblemSchema],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdate: Date,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});
const Room = mongoose.model<RoomInterface>('Room', RoomSchema);
export default Room;
