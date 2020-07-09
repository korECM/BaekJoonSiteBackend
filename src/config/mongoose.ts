import mongoose from "mongoose";
import { connect } from "http2";

export default async function connectToDB() {
  const { MONGO_URI, USER, PASS } = process.env;
  try {
    const connection = await mongoose.connect(MONGO_URI!, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
    console.log("Connected to DB");
    return connection;
  } catch (error) {
    console.error(error);
  }
}
