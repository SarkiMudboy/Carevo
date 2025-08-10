import { Router } from "express";

const authRouter = Router();

authRouter.get("/login", (req, res) => {
    res.send({message: "Welcome to the Carevo Login Page"});
})

export default authRouter;