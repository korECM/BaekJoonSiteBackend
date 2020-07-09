import express from "express";
import Room from "../models/room";
const router = express.Router();

router.get("/", async (req, res, next) => {

  return res.send("Hello!");
});

export default router;
