const nodemailer = require('nodemailer')
const config = require('config')

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: config.get('emailHost'),
            port: 587,
            secure: false,
            auth: {
                user: config.get('emailUser'),
                pass: config.get('emailPassword'),
            }
        })
        await transporter.sendMail({
            from: config.get('emailUser'),
            to: email,
            subject: subject,
            text: text
        })
        console.log('email sent succesfully')

    } catch (err) {
        console.log('email not sent', err.message)
    }
}


module.exports = sendEmail