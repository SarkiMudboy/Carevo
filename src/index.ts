import express from "express";

import chatRouter from "#routes/chat.routes.js";
import authRouter from "#routes/auth.routes.js";
import analyticsRouter from "#routes/analytics.routes.js";


const app = express();
const port = process.env.PORT || "9001";

app.use(express.json());
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/auth", authRouter);


app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("Response sent");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
