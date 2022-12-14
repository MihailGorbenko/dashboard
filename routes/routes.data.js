const {Router} = require('express')
const auth = require('../middleware/middleware.auth')
const cors = require('cors')
const path = require('path')

const { events } = require('../models/User')
const fs = require('fs')


const router = new Router()

router.get(
    '/getUserData',
    auth,
    (req,resp) => {
        const userId = req.userId

        try{
            //fetch data
        } catch(err) {
            
        }
    }
);



router.post(
    '/resizeImage',
    [
        cors()
    ],
    (req,res) => {
        try{
        
            const filePath = req.files.image.path
            const fileName = req.files.image.name
            const newPath = path.join(path.dirname(filePath),fileName)
            fs.renameSync(filePath,newPath, () => {console.log('image renamed');})

            
            return res.status(200).json({ message: '' })
        } catch(err) {
            console.log('/resizeImage:',err);
            return res.status(400).json({ message: err })
        }
    }
);



module.exports = router