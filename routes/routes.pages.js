const {Router} = require('express')
const path = require('path')
const router = new Router()

router.get('', (req,res) => {
    res.sendFile(path.join(__dirname + '/../client/auth.html'))
})

router.get('/main', (req,res) => {
    const userId = req.cookies.userId
    res.cookie('userId', userId)
    res.sendFile(path.join(__dirname + '/../client/main.html'))
})




module.exports = router