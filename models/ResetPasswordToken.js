const { model, Schema, Types } = require('mongoose')

const schema = new Schema({
    userId: { type: Types.ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 }
})

module.exports = model('ResetPasswordToken',schema)