const {Router} = require('express')
const bodyParser = require('body-parser')
const User = require('../models/User')
const UserData = require('../models/UserData')
const bcrypt = require('bcryptjs')
const {check,validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const auth = require('../middleware/middleware.auth')


const router = Router()
const jsonParser = bodyParser.json()

// Register
router.post(
    '/register',
     jsonParser,
     [
        check('email','bad email').isEmail(),
        check('password','bad password').isString().isLength({ min: 5 }),
        check('name','bad name').isString().isAlpha()
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

        const {email,password,name} = req.body
        const candidateEmail = await User.findOne({ "credentials.email": email})

        if(candidateEmail){
            console.log('User exists.');
            return res.status(400).json({message: 'exist'})
        } 
        console.log('No such user.');
        const hashedPassword = await bcrypt.hash(password,config.get('passwordSalt'))
        console.log('Password:',hashedPassword);

        const userData = new UserData({
            name: name
        }) 
        
        const user = new User({
            credentials: {
                email: email,
                password: hashedPassword
            },
            userData: userData
        })

        userData.user = user
        await userData.save()
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
        console.log(user.credentials.email );

        if(!user){
            console.log('User not found.');
            return res.status(400).json({message: 'not exist'})
        } 
        const passwordMatch = await bcrypt.compare(password,user.credentials.password)
        console.log('password match');

        if(!passwordMatch){
            console.log('Invalid password.');
            return res.status(400).json({message: 'password invalid'})
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
        res.status(200).json({token})

       
    } catch(e){
        res.status(500).json({message: 'error',errtext: e.message})
    }
})

//  /isUserEmailExists

router.post(
    '/isUserEmailExists',
    jsonParser,
    [
        check('email','bad email').isEmail(),
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

//   /api/auth/validateToken
router.post('/validateToken', auth, (req,res) => {
    console.log('/validate token token valid');
    return res.status(200).json({message: 'token valid'})
})

//   /api/auth/restorePassword
router.post(
    '/restorePassword',
    [
        check('email', 'bad email').isEmail(),
        check('password','bad password').exists()
    ],    
    (req,res) => {
        const errors = validationResult()

        if(!errors.isEmpty){
            return res.status(400).json({
                errors: errors.array(),
                maessage: "incorect"
            })
        }

    const {email,password} = req.body
    const user = User.findOne("credentials.email",email)
    if(!user) {
        console.log('User not found.');
        return res.status(400).json({
            message: 'user not found'
        })
    }

})


module.exports = router