const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/userDb', { useNewUrlParser: true, useUnifiedTopology: true })

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.userId,
    ref: 'user',
    required: true,
  },
  ownerName: {
    type: String,
    required: [true, 'ownerName is required'],
  },
  propertyType: {
    type: String,
    required: [true, 'propertyType is required'],
  },
  subCategory: {
    type: String,
    required: [true, 'subCategory is required'],
  },
  area: {
    type: String,
    required: [true, 'area is required'],
  },
  description: {
    type: String,
    required: [true, 'description is required'],
  },
  city: {
    type: String,
    required: [true, 'city is required']
  },
  state: {
    type: String,
    required: [true, 'state is required'],
  },
  country: {
    type: String,
    required: [true, 'country is required'],
  },
  address: {
    type: String,
    required: [true, 'address is required'],
  },
  price: {
    type: Number,
    required: [true, 'price is required'],
  },
  amenities: [{
    type: String,
    required: [true, 'amenities are required'],
  }],
  images: [{
    type: String, // URLs of the images
    required: [true, 'images are required'],
    unique: true,
  }],
  rentedOut: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('property', propertySchema);
