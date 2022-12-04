 const {Schema, model} = require('mongoose')

 const schema = new Schema({
    credentials: {
        email: { type: String, required: true, unique: true},
        password: { type:String, required: true, unique: true}
    }, 
    userData: {
        imgUri: {type: String},
        name: {type: String},
        profileName: {type: String}
    }

 })

 module.exports = model('User',schema)