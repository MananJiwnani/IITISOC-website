const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/userDb', { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Email is invalid'],
  },
  contact: {
    type: Number,
    required: [true, 'Contact is required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: ['owner', 'tenant'],
  }
})

module.exports = mongoose.model('user', userSchema)