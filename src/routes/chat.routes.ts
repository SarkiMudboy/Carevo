import { Router } from 'express';
import sendWhatsAppMessage from '#test_bot.ts';
import { processMessage } from '#services/whatsapp/messages.js';

const chatRouter = Router();

chatRouter.get('/onboard', (req, res) => {
  res.send({
    message: 'Welcome to Carevo, Please select your language preference',
  });
});

chatRouter.post('/language', (req, res) => {
  res.send({
    message: 'Language preference received. How can I assist you today?',
  });
});

chatRouter.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  const responseData = sendWhatsAppMessage('Hey there!, welcome to carevo!');
  res.send({ message: 'Message sent!' });
});

chatRouter.post('/', async (req, res) => {
  console.log('PROCESS MESSAGE');
  const data = req.body;
  await processMessage(data);
  res.status(200).send({ message: 'message sent' });
});

export default chatRouter;
