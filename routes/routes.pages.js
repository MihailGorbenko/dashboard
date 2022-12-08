const {Router} = require('express')
const path = require('path')
const router = new Router()

router.get('', (req,res) => {
    console.log('auth');
    res.sendFile(path.join(__dirname + '/../client/auth.html'))
})

router.get('/main', (req,res) => {
    console.log('main');
    res.sendFile(path.join(__dirname + '/../client/main.html'))
})




module.exports = router