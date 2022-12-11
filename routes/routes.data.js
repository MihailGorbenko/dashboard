const {Router} = require('express')
const auth = require('../middleware/middleware.auth')


const router = new Router()

router.get(
    '/getUserData',
    auth,
    (req,resp) => {
        userId = req.userId

        try{
            //fetch data
        } catch(err) {
            
        }
    }
)



module.exports = router