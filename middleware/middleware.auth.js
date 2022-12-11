const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req,res,next) => {
    if(req.method === 'OPTIONS')
    {
        return next()
    }
    try {
        console.log('middleware auth');
        const token = req.headers.authorization.split(' ')[1]  //Bearer TOKEN
        if(!token) return res.status(401).json({message: 'not authorized'})
        console.log('got token',token)

        const decoded = jwt.verify(token,config.get('jwtSecret'))
        req.userId = decoded.id
        console.log('dec id', decoded.id);
        next()

    } catch(err) {
        console.log('error verify:',err.message);
        return res.status(401).json({message: 'not authorized'})
    }

}