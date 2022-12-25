const {Router} = require('express')
const path = require('path')
const router = new Router()
const Log= require('../utils/logger')

router.get('', (req,res) => {
    res.sendFile(path.join(__dirname + '/../client/auth.html'))
})

router.get('/main', (req,res) => {
    const userId = req.cookies.userId
    res.cookie('userId', userId)
    res.sendFile(path.join(__dirname + '/../client/main.html'))
})



router.post(
    '/log',
    (req,res) => {
        const log = new Log(' ')
        log.log(req.body.logMessage)
        res.status(200).send()
    })

module.exports = router