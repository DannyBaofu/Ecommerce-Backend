const mongoose = require('mongoose')
const Schema = mongoose.Schema
const { isEmail } = require('validator')

const UserSchema = new Schema({
    fullname: {
        type:String,
        required: true
    },
    isAdmin: {
        type:Boolean,
        default: false
    },
    email:{
        type:String,
        required: [true, "Please enter an email"],
        unique: true,
        lowercase:true, //toLowerCase()
        isValid: [isEmail,"Please enter a valid email"]
    },
    password: {
        type:String,
        required: true,
        minlength: [8, 'Password mst be 8 or more characters']
    }
})

module.exports = mongoose.model('User', UserSchema)