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

        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email, password, name } = req.body
            const candidateEmail = await User.findOne({ "credentials.email": email })

            if (candidateEmail) {
                console.log('User exists.');
                return res.status(400).json({ message: 'exist' })
            }
            console.log('No such user.');
            const hashedPassword = await bcrypt.hash(password, config.get('passwordSalt'))
            console.log('Password:', hashedPassword);

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
            res.status(201).json({ message: 'created' })
        } catch (e) {
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

        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email, password } = req.body
            const user = await User.findOne({ "credentials.email": email })

            console.log('User found');
            console.log(user.credentials.email);

            if (!user) {
                console.log('User not found.');
                return res.status(400).json({ message: 'not exist' })
            }
            const passwordMatch = await bcrypt.compare(password, user.credentials.password)
            console.log('password match');

            if (!passwordMatch) {
                console.log('Invalid password.');
                return res.status(400).json({ message: 'password invalid' })
            }
            console.log('generating jwt');
            const token = jwt.sign({
                id: user.id
            },
                config.get('jwtSecret'),
                {
                    expiresIn: '1h'
                }
            )
            console.log('token:', token);
            res.cookie('userId', user._id, { secure: true})
            res.status(200).json({ token })


        } catch (e) {
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
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }

            const { email } = req.body
            const candidate = await User.findOne({ "credentials.email": email })

            if (!candidate) {
                console.log('User not exists.');
                return res.status(400).json({ message: 'not exist' })
            }

            console.log('User exists.');
            return res.status(200).json({ message: 'exist' })

        } catch (e) {
            res.status(500).json({ message: 'error' })
        }

    }
)

//   /api/auth/validateToken
router.post('/validateToken', auth, (req, res) => {
    console.log('/validate token token valid');
    return res.status(200).json({ message: 'token valid' })
})

router.post(
    '/passwordReset',
    [
        check('email', 'bad email').isEmail(),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
            const { email } = req.body
            const user = await User.findOne({ "credentials.email": email })

            if (!user) {
                console.log('User not exists.');
                return res.status(400).json({ message: 'not exist' })
            }
            console.log('resetPassword: user found', user.credentials.name);
            let passwordToken = await ResetPasswordToken.findOne({ userId: user._id })
            if (!passwordToken) {
                passwordToken = await new ResetPasswordToken({
                    userId: user._id,
                    token: crypto.randomBytes(32).toString("hex")
                }).save()
            }

            const link = `${config.get('baseUrl')}/api/auth/passwordResetForm/${user._id}/${passwordToken.token}`
            await sendEmail(user.credentials.email, "Password reset", link)

            return res.status(200).json({ mesage: "sent" })

        } catch (err) {
            res.status(500).json({ message: 'error' })
            console.log('resetPassword: ', err, err.message);
        }
    })

router.get(
    '/passwordResetForm/:userId/:token',
    async (req, res) => {
        const userId = req.params.userId
        const token = req.params.token
        const user = await User.findById(userId)
        if (!user) {
            return res.status(400).json({ message: 'invalid link or expired' })
        }
        const passwordToken = await ResetPasswordToken.findOne({
            userId: userId,
            token: token
        })
        if (!passwordToken) {
            return res.status(400).json({ message: 'invalid link or expired' })
        }
        res.cookie('userId', userId, { httpOnly: true, secure: true, maxAge: 3600000 })
        res.cookie('token', token, { httpOnly: true, secure: true, maxAge: 3600000 })
        res.redirect(`${config.get('baseUrl')}/restore.html`)

    })

router.post(
    '/passwordResetFromForm',
    [
        check('password', 'bad password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
            const userId = req.cookies.userId
            const token = req.cookies.token

            const user = await User.findById(userId)
            if (!user) {
                return res.status(400).json({ message: 'invalid link or expired' })
            }
            const passwordToken = await ResetPasswordToken.findOne({
                userId: userId,
                token: token
            })
            if (!passwordToken) {
                return res.status(400).json({ message: 'invalid link or expired' })
            }


            const hashedPassword = await bcrypt.hash(req.body.password, config.get('passwordSalt'))
            user.credentials.password = hashedPassword
            await user.save()
            await passwordToken.delete()
            console.log('password reset');
            return res.status(200).json({ message: "reset" })


        } catch (err) {
            res.status(500).json({ message: 'error' })
        }

    })


module.exports = router