import { Router } from "express";

const analyticsRouter = Router();

analyticsRouter.get("/", (req, res) => {
  res.send({message: "Welcome to the Analytics Dashboard"});
});

export default analyticsRouter;