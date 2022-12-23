const { Router } = require('express')
const auth = require('../middleware/middleware.auth')
const path = require('path')
const resizer = require('../utils/resizeImage')
const formidable = require('express-formidable')
const fs = require('fs')
const Log = require('../utils/logger')
const UserData = require('../models/UserData')
const User = require('../models/User')
const os = require('os');




const router = new Router()

router.get(
    '/getUserProfile',
    auth,
    async (req, res) => {
        const log = new Log('route: /getUserProfile')
        const userId = req.userId

        try {
            const user = await User.findById(userId)
            if (!user) {
                log.error(`user not found: userId > ${userId}`)
                res.status(400).json({ message: "user not found" })
            }
            log.info(`User: ${user.credentials.email}`)
            res.status(200).json({ name: user.credentials.name })
        } catch (err) {
            log.error(err)
            res.status(400).json({ message: err.message })
        }
    }
);

router.get(
    '/getUserProfilePicture',
    auth,
    async (req, res) => {
        const userId = req.userId
        const log = new Log('route: /getUserProfilePicture')
        try {
            const userData = await UserData.findOne({ user: userId })
            if (!userData) {
                log.error(`User data not found: userId > ${userId}`)
                res.status(400).json({ message: "image not found" })
            }
            const imageUri = userData.imageUri
            if (imageUri) {
                const imagePath = path.join(path.resolve(__dirname, '../'), imageUri)
                log.info(`sending image: ${imageUri}`)
                res.status(200).sendFile(imagePath)
            }
            else {
                log.info(`image not found: ${imageUri}`)
                res.status(404).json({ message: 'image not found' })
            }
        } catch (err) {
            log.error(err)
            res.status(400).json({ message: err.message })
        }
    }
);

router.get(
    '/getSystemInfo',
    (req, res) => {
        const log = new Log('route: /getSystemInfo')

        try {
            log.info('Sending system info...')
            return res.status(200).json({
                pArch: os.arch(),
                cpus: os.cpus(),
                freemem: os.freemem(),
                hostname: os.hostname(),
                loadAvg: os.loadavg(),
                platform: os.platform(),
                release: os.release(),
                totalmem: os.totalmem(),
                type: os.type(),
                uptime: os.uptime()
            })
        } catch (err) {
            log.error(err)
            res.status(400).json({ message: err.message })
        }
    }
);



router.post(
    '/setProfilePicture',
    [
        
        auth,
        formidable({ uploadDir: path.resolve(__dirname, '../storage/images') })
    ],
    async (req, res) => {
        const log = new Log('route: /setProfilePicture')
        try {

            const filePath = req.files.image.path
            const fileName = req.files.image.name
            const reqFields = req.fields
            log.info(`Got image  > ${fileName}`)

            const newPath = path.join(path.dirname(filePath), fileName)
            fs.renameSync(filePath, newPath)
            log.info(`Image renamed`)
            resizer(newPath, path.dirname(newPath),reqFields.width, reqFields.heigth, 'true')
            log.info(`Image resized`)

            const userId = req.userId
            log.info(`Got user id > ${userId}`)

            const userData = await UserData.findOne({ user: userId })
            if (!userData) {
                log.error('user data not found')
                return res.status(400).json({ message: 'error adding image' })
            }
            userData.imageUri = `storage/images/${fileName}`
            await userData.save()
            log.info('UserData obj saved')

            return res.status(200).sendFile(newPath)
        } catch (err) {
            log.error(err)
            return res.status(400).json({ message: err })
        }
    }
);

router.post(
    '/resizeImage',
    [
        auth,
        formidable({ uploadDir: path.resolve(__dirname, '../storage/resize') })
    ],
    (req, res) => {
        const log = new Log('route: /resizeImage')
        try {
            /// write middleware to create unique folders
            const filePath = req.files.image.path
            const imageName = req.files.image.name
            const reqFields = req.fields
            const dirName = `dir-${path.basename(filePath)}`
            const imageDir = path.resolve(__dirname, `../storage/resize/${dirName}`)
            fs.mkdirSync(imageDir)
            log.info(`created directory ${imageDir}`)
            const newImagePath = path.join(imageDir, `${imageName}`)
            fs.renameSync(filePath, newImagePath)
            log.info(`image moved, new path ${newImagePath}`)
            resizer(newImagePath, imageDir, reqFields.height, reqFields.width, reqFields.detect,5)
            log.info('Resizing done')

            const results = fs.readdirSync(imageDir, { withFileTypes: true })
                .filter(dirent => dirent.isFile)
                .map(dirent => path.join(`./storage/resize/${dirName}`, dirent.name))


            return res.status(200).json(results)
        } catch (err) {
            log.error(err)
            return res.status(400).json({ message: err })
        }
    }
);



module.exports = router