type messageData = {
  id: any;
  from: any;
  timestamp: any;
  text: any;
  type: any;
  attachments: any;
};

export const isValidIncomingWhatsAppMessageData = (data: any): boolean => {
  // Validates that webhook event data has a valid "message" structure
  const eventType =
    data &&
    data.entry &&
    data.entry[0] &&
    data.entry[0].changes &&
    data.entry[0].changes[0].field;

  if (eventType === 'messages' && data.entry[0].changes[0].value.messages[0]) {
    return true;
  }
  return false;
};

export const parseIncomingWhatAppMessageData = (
  data: any
): messageData | null => {
  // Validates the structure of the webhook payload and parses out the message data
  // args -> data: payload
  //returns -> message (false if the structure does not conform with that of an incoming whatsapp message)

  const eventType =
    data &&
    data.entry &&
    data.entry[0] &&
    data.entry[0].changes &&
    data.entry[0].changes[0].field;

  if (eventType === 'messages') {
    const message = data.entry[0].changes[0].value.messages[0]; // fails here
    if (message) {
      const messageData = {
        id: message.id,
        from: message.from,
        timestamp: message.timestamp,
        text: message.text ? message.text.body : null,
        type: message.type,
        attachments: message.attachments || [],
      };
      return messageData;
    }
  }

  return null;
};
