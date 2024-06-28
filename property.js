const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
   
  },
  ownerName: {
    type: String,
    required: [true, 'owner name is required'],
  },

    propertyType: {
    type: String,
    required: [true, 'type is required'],
  },

    subCategory: {
    type: String,
    required: [true, 'bhk is required'],
  },
  
   price: {
    type: Number,
    required: [true, 'price is required'],
  },
  
 
  description: {
    type: String,
    required: [true, 'description is required'],
  },

  petPolicy: {
    type: String,
    required: [true, 'pet policy is required'],
  },

  carpetArea: {
    type: String,
    required: [true, 'carpet area is required'],
  },

  city: {
    type: String,
    required: [true, 'city is required']
  },
  state: {
    type: String,
    required: [true, 'state is required'],
  },
  address: {
    type: String,
    required: [true, 'address is required'],
  },
  ownershipType: [{
    type: String,
    required: [true, 'type of ownership is required'],
  }],
  furnishedStatus: [{
    type: String,
    required: [true, 'furnished status is required'],
  }],
  propertyAge: [{
    type: String,
    required: [true, 'property age is required'],
  }],
  amenities: [{
    type: String,
    required: [true, 'amenities are required'],
  }],
  images: [{
    type: String, // URLs of the images
    // required: [true, 'images are required'],
    // unique: true,
  }],
  rentedOut: {
    type: Boolean,
    default: false,
  }
});

module.exports =new mongoose.model('Property', propertySchema);