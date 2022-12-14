const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
    credentials: {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, unique: true }
    },
    userData: {
        type: Types.ObjectId,
        ref: 'UserData'
    }
})


module.exports = model('User', schema)