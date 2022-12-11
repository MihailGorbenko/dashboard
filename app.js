const express = require('express')
const path = require('path')
const config = require('config')
const http = require('http')
const https = require('https')
const fs = require('fs')
const mongoose = require('mongoose')

HTTP_PORT = config.get('http_port')
HTTPS_PORT = config.get('https_port')

const app = express()

app.use(express.static(path.join(__dirname, '/client')))
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')))
app.use('/api/auth',require('./routes/routes.auth'))
app.use('/api/data',require('./routes/routes.data'))
app.use('/',require('./routes/routes.pages'))


async function start() {

    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('mongo connected');

        http.createServer(app).listen(HTTP_PORT, () => {console.log(`Server listening port ${HTTP_PORT}`);})

        https.createServer({
            key: fs.readFileSync('hkeys/key.pem'),
            cert: fs.readFileSync('hkeys/cert.pem')
        },app).listen(HTTPS_PORT, () => {console.log(`Server listening port ${HTTPS_PORT}`);})

    } catch (e) {
        console.log('Server error:', e.message)
        fs.writeFileSync('server.log', e.message)
        process.exit(1)
    }

}




start()