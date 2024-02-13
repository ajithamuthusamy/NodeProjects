const mongoose = require('mongoose');


const employeeSchma = new mongoose.Schema({
name :  {
    type: String,
    required: true,
    trim: true, // Remove leading and trailing whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email addresses are unique
    trim: true,
    lowercase: true, // Convert email to lowercase before saving
    validate: {
      validator: (value) => {
        // Use a regular expression or custom function to validate email format
        // Example using a regular expression:
        return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(value);
      },
      message: 'Invalid email format',
    },
  },
salary : {
    type: String,
    required: true,
    trim: true, // Remove leading and trailing whitespace
  },
    
});

module.exports=mongoose.model('Employee',employeeSchma);