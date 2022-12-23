const express = require('express')
const path = require('path')
const config = require('config')
const http = require('http')
const https = require('https')
const fs = require('fs')
const mongoose = require('mongoose')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const favicon = require('serve-favicon')
const Log = require('./utils/logger')
const log = new Log('app ')
const cors = require('cors')



HTTP_PORT = config.get('http_port')
HTTPS_PORT = config.get('https_port')

const app = express()


app.use(express.json())
app.use(cookieParser())
app.use(helmet({ contentSecurityPolicy: false }))
//app.use(cors())
app.use(require('./middleware/middleware.https-redirect'))
app.use(express.static(path.join(__dirname, '/client')))
app.use(favicon('./client/favicon.ico'))
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')))
app.use('/storage/resize', express.static(path.join(__dirname, '/storage/resize')))
app.use('/api/auth', require('./routes/routes.auth'))
app.use('/api/data', require('./routes/routes.data'))
app.use('/', require('./routes/routes.pages'))

async function start() {

    try {
        mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => log.info('Mongo connected'))

        http.createServer(app).listen(HTTP_PORT, () => { log.info(`Server listening port ${HTTP_PORT}`); })

        https.createServer({
            key: fs.readFileSync('./sslcert/privkey.pem'),
            cert: fs.readFileSync('./sslcert/fullchain.pem')
        }, app).listen(HTTPS_PORT, () => { log.info(`Server listening port ${HTTPS_PORT}`) })

    } catch (e) {
        log.error(`Server error: ${e.message}`)
        process.exit(1)
    }

}

start()


//launch storage clear script