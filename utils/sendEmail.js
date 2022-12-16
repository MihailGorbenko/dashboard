const nodemailer = require('nodemailer')
const config = require('config')
const Log = require('./logger')
const log = new Log('SendEmail')

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
        log.info('Email sent succesfully')

    } catch (err) {
        log.error(`Email not sent > ${err.message}`)
    }
}


module.exports = sendEmail