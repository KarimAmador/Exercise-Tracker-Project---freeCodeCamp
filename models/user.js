const { Schema, model } = require('mongoose');

const exerciseSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true,
        default: new Date().toDateString()
    }
}, {_id: false});

const userSchema = Schema({
    username: String,
    count: {
        type: Number,
        default: 0
    },
    log: [exerciseSchema]
})

const User = model('User', userSchema);

module.exports = User;
