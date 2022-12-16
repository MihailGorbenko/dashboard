const { Router } = require('express')
const User = require('../models/User')
const UserData = require('../models/UserData')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../middleware/middleware.auth')
const ResetPasswordToken = require('../models/ResetPasswordToken')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')
const path = require('path')
const Log = require('../utils/logger')




const router = Router()

// Register
router.post(
    '/register',
    [
        check('email', 'bad email').isEmail(),
        check('password', 'bad password').isString().isLength({ min: 5 }),
        check('name', 'bad name').isString().isAlpha()
    ],
    async (req, res) => {
        const log = new Log('route: /Register')
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                log.error('Input form incorect');
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email, password, name } = req.body
            const candidateEmail = await User.findOne({ "credentials.email": email })

            if (candidateEmail) {
                log.info(`User ${email} exists`);
                return res.status(400).json({ message: 'exist' })
            }
            log.info(`No such user ${email}`);
            const hashedPassword = await bcrypt.hash(password, config.get('passwordSalt'))
            log.info('Password hashed');

            const userData = new UserData({})

            const user = new User({
                credentials: {
                    name: name,
                    email: email,
                    password: hashedPassword
                },
                userData: userData
            })
            userData.user = user

            await userData.save()
            await user.save()
            log.info(`User ${email} saved`)
            res.status(201).json({ message: 'created' })
        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error' })
        }
    })

// Login
router.post(
    '/login',
    [
        check('email', 'bad email').isEmail(),
        check('password', 'bad password').exists()
    ],
    async (req, res) => {
        const log = new Log('route: /Login')
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                log.error('Input form incorect');
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email, password } = req.body
            const user = await User.findOne({ "credentials.email": email })

            if (!user) {
                log.info(`User ${email} not found`);
                return res.status(400).json({ message: 'not exist' })
            }
            log.info(`User ${email} found`);

            const passwordMatch = await bcrypt.compare(password, user.credentials.password)

            if (!passwordMatch) {
                log.info(`Invalid password`);
                return res.status(400).json({ message: 'password invalid' })
            }
            log.info(`Password match`);

            log.info(`Generating JWT`);
            const token = jwt.sign({
                id: user.id
            },
                config.get('jwtSecret'),
                {
                    expiresIn: '1h'
                }
            )
            log.info(`JWT generated`);
            res.cookie('userId', user._id, { secure: true })
            res.status(200).json({ token })

        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error', errtext: e.message })
        }
    })

//  /isUserEmailExists

router.post(
    '/isUserEmailExists',
    [
        check('email', 'bad email').isEmail(),
    ],
    async (req, res) => {
        const log = new Log('route: /isUserEmailExists')
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                log.error('Input form incorect');
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email } = req.body
            const candidate = await User.findOne({ "credentials.email": email })

            if (!candidate) {
                log.info(`User ${email} not found`);
                return res.status(400).json({ message: 'not exist' })
            }

            log.info(`User ${email} found`);
            return res.status(200).json({ message: 'exist' })

        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error' })
        }

    }
)

//   /api/auth/validateToken
router.post('/validateToken', auth, (req, res) => {
    const log = new Log('route: /validateToken')
    log.info(`JWT token valid`);
    return res.status(200).json({ message: 'token valid' })
})

router.post(
    '/passwordReset',
    [
        check('email', 'bad email').isEmail(),
    ],
    async (req, res) => {
        const log = new Log('route: /passwordReset')
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                log.error('Input form incorect');
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
            const { email } = req.body
            const user = await User.findOne({ "credentials.email": email })

            if (!user) {
                log.info(`User ${email} not found`);
                return res.status(400).json({ message: 'not exist' })
            }
            log.info(`User ${email} found`);

            let passwordToken = await ResetPasswordToken.findOne({ userId: user._id })
            if (!passwordToken) {
                log.info(`Reset Password Token not found. Generating...`);
                passwordToken = await new ResetPasswordToken({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex")
                }).save()
            }

            const link = `${config.get('baseUrl')}/api/auth/passwordResetForm/${user._id}/${passwordToken.token}`
            await sendEmail(user.credentials.email, "Password reset", link)
            log.info(`Email sent to ${user.credentials.email}`);

            return res.status(200).json({ mesage: "sent" })

        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error' })
        }
    })


router.get(
    '/passwordResetForm/:userId/:token',
    async (req, res) => {
        const log = new Log('route: /passwordResetForm/:userId/:token')
        try {

            const userId = req.params.userId
            const token = req.params.token
            const user = await User.findById(userId)
            if (!user) {
                log.info(`User ${userId} not found`);
                return res.status(400).json({ message: 'invalid link or expired' })
            }
            const passwordToken = await ResetPasswordToken.findOne({
                userId: userId,
                token: token
            })
            if (!passwordToken) {
                log.info(`Restore Password Token not found`);
                return res.status(400).json({ message: 'invalid link or expired' })
            }
            log.info(`Restore Password Token found`);

            res.cookie('userId', userId, { httpOnly: true, secure: true, maxAge: 3600000 })
            res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 })

            log.info(`Redirecting to reset form`);
            res.redirect(`${config.get('baseUrl')}/restore.html`)
        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error' })
        }
    })


router.post(
    '/passwordResetFromForm',
    [
        check('password', 'bad password').exists()
    ],
    async (req, res) => {
        const log = new Log('route: /passwordResetFromForm')
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                log.error('Input form incorect');
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
            const userId = req.cookies.userId
            const token = req.cookies.token

            const user = await User.findById(userId)
            if (!user) {
                log.info(`User ${userId} not found`);
                return res.status(400).json({ message: 'invalid link or expired' })
            }
            log.info(`User ${userId} found`);
            const passwordToken = await ResetPasswordToken.findOne({
                userId: userId,
                token: token
            })
            if (!passwordToken) {
                log.info(`Restore Password Token not found`);
                return res.status(400).json({ message: 'invalid link or expired' })
            }
            log.info(`Restore Password Token found`);

            const hashedPassword = await bcrypt.hash(req.body.password, config.get('passwordSalt'))
            user.credentials.password = hashedPassword
            await user.save()
            await passwordToken.delete()
            log.info('Password reset');
            return res.status(200).json({ message: "reset" })


        } catch (err) {
            log.error(err);
            res.status(500).json({ message: 'error' })
        }

    })


module.exports = router