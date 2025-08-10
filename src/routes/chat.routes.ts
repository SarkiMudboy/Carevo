import { Router } from "express";
import sendWhatsAppMessage from "#test_bot.ts";

const chatRouter = Router();

chatRouter.get("/onboard", (req, res) => {
  res.send({message: "Welcome to Carevo, Please select your language preference"});
});

chatRouter.post("/language", (req, res) => {
  res.send({message: "Language preference received. How can I assist you today?"});
})

chatRouter.get("/test", (req, res) => {
  console.log("Test endpoint hit");
  const responseData = sendWhatsAppMessage("Hey there!, welcome to carevo!");
 res.send({message: "Message sent!"}); 
})

chatRouter.get("/webhook", (req, res) => {

  const mode = req.query["hub.mode"]
  const verifyToken = req.query["hub.verify_token"]

  if (mode && verifyToken) {
    if (mode === "subscribe" && verifyToken === process.env.VERIFY_TOKEN) {
      console.log("Webhook verified");
      res.status(200).send(req.query["hub.challenge"]);
    } else {
      console.error("Webhook verification failed:", mode, verifyToken);
      res.status(403).send("Forbidden");
    }
  } else {
    res.status(400).send("Bad Request: Missing parameters or invalid token");
  }
})

chatRouter.post("/webhook", (req, res) => {
  const body = req.body;
  const changes = body.entry && body.entry[0] && body.entry[0].changes
  console.log("Webhook received:", body);
  console.log("Changes:", changes);
  res.status(200).send("EVENT_RECEIVED");
})

export default chatRouter