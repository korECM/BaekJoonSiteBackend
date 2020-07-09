import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const { Schema } = mongoose;

export interface UserInterface extends mongoose.Document {
  name: string;
  password: string;
  email: string;
  rooms: string[];
  problems: number[];
  problemForToday: number;
  problemForYesterday: number;
  difference: number[];
  lastUpdate: Date;
  provider: string;
  snsId: string;
  publishedDate: Date;
}

export const UserSchema = new Schema({
  name: String,
  password: String,
  email: String,
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  problems: [Number],
  problemForToday: Number,
  problemForYesterday: Number,
  lastUpdate: Date,
  difference: [Number],
  provider: String,
  snsId: String,
  publishedDate: {
    type: Date,
    default: Date.now,
  },
});

export function generateToken(user: UserInterface) {
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      rooms: user.rooms,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: '1d',
    },
  );

  return token;
}

const User = mongoose.model<UserInterface>('User', UserSchema);
export default User;
