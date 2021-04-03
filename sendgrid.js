const sgMail = require('@sendgrid/mail');
const path = require("path");
require("dotenv").config(path.join(__dirname, ".env"))
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

function sendMail(email, url) {
    const msg = {
        to: email, // Change to your recipient
        from: 'anusu90@gmail.com', // Change to your verified sender
        subject: 'Invitation for video Call',
        text: `You have been invited to connect via a video call. Click on the following URL:     `
            + `${url}`,
        html: `<strong>You have been invited to connect via a video call</strong> <br>` +
            ` copy paste the URL or click on the button to join <br>` +
            `${url}` +
            `<br>` +
            `<a href=${url} target="_blank"><button>Click Me!</button></a>`
    }
    return sgMail.send(msg)
}


module.exports = sendMail