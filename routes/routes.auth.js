const {Router} = require('express')
const bodyParser = require('body-parser')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const {check,validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')

const router = Router()
const jsonParser = bodyParser.json()

// Register
router.post(
    '/register',
     jsonParser,
     [
        check('email','bad email').isEmail(),
        check('password','bad password').isString().isLength({ min: 5 }),
        check('profileName','bad profileName').isString().isLength({ max: 15 })
     ],
     async (req,res) => {

    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'incorect'
            })
        }

        const {email,password,profileName} = req.body
        const candidateEmail = await User.findOne({ "credentials.email": email})
        const candidateProfile = await User.findOne({ "userData.profileName": profileName})

        if(candidateEmail || candidateProfile){
            console.log('User exists.');
            return res.status(400).json({message: 'exist'})
        } 
        console.log('No such user.');
        const hashedPassword = await bcrypt.hash(password,12)
        console.log('Password:',hashedPassword);

        const user = new User({
            credentials: {
                email: email,
                password: hashedPassword
            },
            userData: {
                profileName: profileName
            }
        })
        await user.save()
        res.status(201).json({message: 'created'})
    } catch(e){
        res.status(500).json({message: 'error'})
    }
})

// Login
router.post(
    '/login',
     jsonParser,
     [
        check('email','bad email').isEmail(),
        check('password','bad password').exists()
     ],
     async (req,res) => {

    try {
        const errors = validationResult(req)

        if (!errors.isEmpty()){
            return res.status(400).json({
                errors: errors.array(),
                message: 'incorect'
            })
        }

        const {email,password} = req.body
        const user = await User.findOne({ "credentials.email": email })
        console.log('User found');

        if(!user){
            console.log('User not found.');
            return res.status(400).json({message: 'not exist'})
        } 
        console.log('password',password);
        console.log('userpassword',user.credentials.password);
        const passwordMatch = await bcrypt.compare(password,user.credentials.password)
        console.log('password match');

        if(!passwordMatch){
            console.log('Invalid password.');
            return res.status(400).json({message: 'password invalid'})
        }

        console.log('generating jwt');
        const token = jwt.sign({
            id: user.id,
            profileName: user.profileName
            },
            config.get('jwtSecret'),
            {
                expiresIn: '1h'
            }
        )
        console.log('token:', token);
        res.status(200).json({token,userId: user.id})

       
    } catch(e){
        res.status(500).json({message: 'error',errtext: e.message})
    }
})

//  Check email exists

router.post(
    '/isUserEmailExists',
    jsonParser,
    [
        check('email','bad email').normalizeEmail().isEmail(),
    ],
    async (req,res) => {
        try {
            const errors = validationResult(req)
    
            if (!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
    
            const {email} = req.body
            const candidate = await User.findOne({ "credentials.email": email })
    
            if(!candidate){
                console.log('User not exists.');
                return res.status(400).json({message: 'not exist'})
            } 

            console.log('User exists.');
            return res.status(200).json({message: 'exist'})
            
            } catch(e){
                res.status(500).json({message: 'error'})
                }

    }
)



// Check username exists

router.post(
    '/isProfileNameAvailable',
    jsonParser,
    [
        check('profileName','bad profileName').isString().isLength({ max: 15 })
    ],
    async (req,res) => {
        try {
            const errors = validationResult(req)
    
            if (!errors.isEmpty()){
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'incorect'
                })
            }
    
            const {profileName} = req.body
            const candidateProfile = await User.findOne({ "userData.profileName": profileName })
    
            if(candidateProfile){
                console.log('profileName exists.');
                return res.status(400).json({ message: 'exist' })
            } 
            console.log('profileName available.');
            return res.status(200).json({ message: 'available' })

            } catch(e){
                res.status(500).json({message: 'error'})
                }

    }
)




module.exports = router