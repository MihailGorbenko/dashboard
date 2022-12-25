const jwt = require('jsonwebtoken')
const config = require('config')
const Log = require('../utils/logger')

module.exports = (req,res,next) => {
    const log = new Log('Middleware: auth')
    if(req.method === 'OPTIONS')
    {
        return next()
    }
    try {
        
        log.info('Authorize request')
        const token = req.headers.authorization.split(' ')[1]  //Bearer TOKEN
        if(!token) return res.status(401).json({message: 'not authorized'})

        const decoded = jwt.verify(token,config.get('jwtSecret'))
        req.userId = decoded.id
        log.info('Authorized')
        next()

    } catch(err) {
        log.info(err)
        return res.status(401).json({message: 'not authorized'})
    }

}