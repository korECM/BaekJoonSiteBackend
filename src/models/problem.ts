import mongoose from 'mongoose';
import { ProblemAPIInterface } from '../util/getProblemsFromTier';

const { Schema } = mongoose;

export interface ProblemInterface extends mongoose.Document, ProblemAPIInterface {
  id: number;
  level: number;
  solvable: number;
  title: string;
  solved_count: number;
  average_try: number;
  publishedDate: Date;
}

export const ProblemSchema = new Schema({
  id: Number,
  level: Number,
  solvable: Number,
  title: String,
  solved_count: Number,
  average_try: Number,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});
const Room = mongoose.model<ProblemInterface>('Problem', ProblemSchema);
export default Room;
