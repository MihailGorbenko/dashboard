const { Router } = require('express')
const auth = require('../middleware/middleware.auth')
const cors = require('cors')
const path = require('path')
const resizer = require('../utils/resizeImage')
const formidable = require('express-formidable')
const fs = require('fs')



const router = new Router()

router.get(
    '/getUserData',
    auth,
    (req, resp) => {
        const userId = req.userId

        try {
            //fetch data
        } catch (err) {

        }
    }
);



router.post(
    '/setProfilePicture',
    [
        cors(),
        formidable({uploadDir:path.resolve(__dirname,'../storage/images')})
    ],
    (req, res) => {
        try {

            const filePath = req.files.image.path
            const fileName = req.files.image.name
            const reqFields = req.fields

            const newPath = path.join(path.dirname(filePath), fileName)
            fs.renameSync(filePath, newPath )
            console.log('image renamed',newPath);
            resizer(newPath, reqFields.width, reqFields.heigth)
            console.log('image resized');

            ///// =>>> save path to user data imgUrl

            return res.status(200).sendFile(newPath)
        } catch (err) {
            console.log('/resizeImage:', err);
            return res.status(400).json({ message: err })
        }
    }
);

router.post(
    '/resizeImage',
    [
        auth,
        formidable()

    ],
    (req, res) => {
        try {

            const filePath = req.files.image.path
            const reqFields = req.fields

            resizer(newPath, reqFields.width, reqFields.heigth)
            console.log('image resized');
            return res.status(200).sendFile(filePath)
        } catch (err) {
            console.log('/resizeImage:', err);
            return res.status(400).json({ message: err })
        }
    }
);



module.exports = router