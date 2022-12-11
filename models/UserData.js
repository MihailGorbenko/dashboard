const {Schema, model,Types} = require('mongoose')

const schema = new Schema({
    user: { 
        type: Types.ObjectId,
        ref: 'User'
    },
    imageUri: { type: String },
    name: { type: String }
}) 


module.exports = model('UserData', schema)