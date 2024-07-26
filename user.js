const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({

  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
     },

  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
   },
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

// checking if the user entered correct details 
userSchema.statics.findAndValidate = async function (email, password) {
    const foundUser = await this.findOne({ email });
    if (!foundUser) {
      return false; 
    }
    const isValid = await bcrypt.compare(password, foundUser.password);
    return isValid ? foundUser : false;
}

// hasing the password and saving it
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
})

module.exports = new mongoose.model('User', userSchema);

