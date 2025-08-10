import { Router } from 'express';
import chatRouter from './chat.routes.js';
import { isValidIncomingWhatsAppMessageData } from '#services/whatsapp/utils.js';

const webhookRouter = Router();

webhookRouter.get('', (req, res) => {
  // verify webhook subscription
  const mode = req.query['hub.mode'];
  const verifyToken = req.query['hub.verify_token'];

  if (mode && verifyToken) {
    if (mode === 'subscribe' && verifyToken === process.env.VERIFY_TOKEN) {
      console.log('Webhook verified');
      // echo back the challenge token
      res.status(200).send(req.query['hub.challenge']);
    } else {
      console.error('Webhook verification failed:', mode, verifyToken);
      res.status(403).send('Forbidden');
    }
  } else {
    res.status(400).send('Bad Request: Missing parameters or invalid token');
  }
});

webhookRouter.post(
  '/',
  (req, res, next) => {
    const body = req.body;

    // Parse the webhook event, inspect and handle event type here
    const changes = body.entry && body.entry[0] && body.entry[0].changes;
    const status =
      changes && changes[0] && changes[0].field && changes[0].value.statuses;

    // Check if its a whatsapp event status message i.e. read, delivered, sent e.t.c. we create a type for this to cast
    if (changes && status) {
      console.log('Status recieved: ', status);
      res.status(200).send({ status: status });
    }

    if (!changes) {
      console.error('No changes found');
      res.status(400).send('Bad Request: No changes found in the webhook data');
    }

    console.log('EVENT_RECEIVED');
    console.log('Changes:', changes);

    if (isValidIncomingWhatsAppMessageData(body)) {
      // Handle messages in the chat handlers
      next();
    } else {
      res.status(400).send('Bad Request: Invalid webhook data');
    }
  },
  chatRouter
);

export default webhookRouter;
