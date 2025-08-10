const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const RECIPIENT_WAID = process.env.RECIPIENT_WAID;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const VERSION = process.env.VERSION || 'v22.0';

function get_text_message_input(message) {
    return JSON.stringify({
        messaging_product: 'whatsapp',
        to: RECIPIENT_WAID,
        // type: 'text',
        // text: { body: message }
        type: 'template',
        template: { name: message, language: { code: 'en_US' } }
    })
}


export default async function sendWhatsAppMessage(message) {
    const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`
    console.log(url)
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: 
    })
    console.log(`Response status: ${response.status}`);
    console.log(`Response status text: ${response.statusText}`);
    return response.json();
}

sendWhatsAppMessage("Hello there welcome to carevo!");