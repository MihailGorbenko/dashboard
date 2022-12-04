const express = require('express')
const path = require('path')
const config = require('config')
const http = require('http')
const https = require('https')
const fs = require('fs')

HTTP_PORT = config.get('http_port')
HTTPS_PORT = config.get('https_port')

const app = express()

app.use(express.static(path.join(__dirname, '/client')))
app.use('/node_modules', express.static(path.join(__dirname,'/node_modules')))

http.createServer(app).listen(HTTP_PORT, () => {console.log(`Server listening port ${HTTP_PORT}`);})

https.createServer({
    key: fs.readFileSync('hkeys/key.pem'),
    cert: fs.readFileSync('hkeys/cert.pem')
},app).listen(HTTPS_PORT, () => {console.log(`Server listening port ${HTTPS_PORT}`);})


