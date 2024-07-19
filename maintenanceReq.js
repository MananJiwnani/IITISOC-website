const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({

  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
     },

  tenant: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
   },

  tenantName: { 
    type: String, 
   
     required: true },

   propertyType: {
      type: String,
      required:true,
    },
  
  subCategory: {
      type: String,
      required: [true, 'subCategory is required'],
    },

  address: {
    type: String,
    required: [true, 'address is required'],
  },

  subject: {
    type: String,
    required: [true, 'subject is required'],
  },


  description: {
    type: String,
    required: [true, 'description is required'],
  },

  date: { 
    type: Date, 
    required: [true, 'date is required'],
  },


  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Completed'], 
    default: 'Pending' },

})

module.exports =new mongoose.model('mRequest', maintenanceRequestSchema);