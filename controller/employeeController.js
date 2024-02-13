const express = require('express');
const mongoose = require('mongoose');
const employeeSchema = require('../model/employee');
const PDFDocument = require('pdfkit');
const { validateEmployeePayload } = require('../validator/validator');
const kafkaProducer = require('../configuration/kafkaProducerConfiguration');
const router = express.Router();
const sendEmail = require('../configuration/mailConfiguration');
const fs = require('fs');
const OtpService = require('../service/OTPService');
const { authenticateToken } = require('../service/authService');




mongoose.connect('mongodb://127.0.0.1:27017/employee-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });


router.use(express.json());

router.get('/employee', async (req, res) => {
  try {
    console.log('Received GET request for employees');

    const { minSalary, maxSalary, startsWithLetter } = req.query;

    // Construct the query object based on the provided salary range
    const query = {};

    if (minSalary && maxSalary) {
      query.salary = { $gte: minSalary, $lte: maxSalary };
    } else if (minSalary) {
      query.salary = { $gte: minSalary };
    } else if (maxSalary) {
      query.salary = { $lte: maxSalary };
    }

    if (startsWithLetter && startsWithLetter.length > 1) {
      query.name = new RegExp(`^${startsWithLetter}`, 'i'); // 'i' for case-insensitive search
    }

    const employeesQeery = employeeSchema.find(query);

    console.log('MongoDB Query:', employeesQeery.getQuery());

    const employees = await employeesQeery.exec();


    const doc = new PDFDocument();

    // Set the response headers to indicate a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=employees.pdf');

    // Pipe the PDF document to the response stream
    doc.pipe(res);

    // Add content to the header
    doc.fontSize(14).text('List of Employees', { align: 'center' });

    // Create a table for employee data
    const table = {
      headers: ['Name', 'Salary'],
      rows: employees.map((employee) => [employee.name, employee.salary]),
    };

    // Define table properties
    const tableX = 50;       // X-coordinate of the table
    const tableY = 150;      // Y-coordinate of the table
    const colWidth = 200;    // Width of each column
    const rowHeight = 30;    // Height of each row (including header)
    const headerHeight = 40; // Height of the table header

    // Set the font size and header background color
    doc.fontSize(12);
    doc.fillColor('#333333');
    doc.fill('#f2f2f2'); // Header background color

    // Draw table header
    doc.rect(tableX, tableY, colWidth, headerHeight).fill();
    doc.rect(tableX + colWidth, tableY, colWidth, headerHeight).fill();
    doc.text(table.headers[0], tableX + 10, tableY + 10);
    doc.text(table.headers[1], tableX + colWidth + 10, tableY + 10);

    // Draw table rows
    doc.fill('#000000'); // Reset text color to black

    table.rows.forEach((row, rowIndex) => {
      const yPos = tableY + headerHeight + rowIndex * rowHeight;
      doc.rect(tableX, yPos, colWidth, rowHeight).stroke();
      doc.rect(tableX + colWidth, yPos, colWidth, rowHeight).stroke();
      doc.text(row[0], tableX + 10, yPos + 10);
      doc.text(row[1], tableX + colWidth + 10, yPos + 10);
    });


    // End the PDF document
    doc.end();


  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/employee', authenticateToken,async (req, res) => {
  try {
    console.log('Received POST request for a new employee');
    const validationError = validateEmployeeData(req.body);
    if (validationError) {
      return sendErrorResponse(res, 400, validationError);
    }
    console.log('input validation is successfull');
    const newEmployee = new employeeSchema(req.body);
    await newEmployee.save();

    const kafka = new kafkaProducer();
    await kafka.connectProducer();

    const kafkaMessage = {
      event: 'employee_created',
      data: newEmployee,

    }
    const result = await kafka.produceMessage('employee_topic', kafkaMessage);
    
    await kafka.disconnectProducer();


    if (result) {
      res.status(201).json(newEmployee);
    } else {
      res.status(500).json({ error: 'Failed to send message to Kafka' });
    }// Respond with the newly created employee data
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/employee/send-email', async (req, res) => {
  try {
    // Get the 'to', 'subject', and 'text' values from the request body
    const { to, subject, text } = req.body;

    // Here, you can add logic to fetch employee-related data
    // and customize the email content if needed

    // For simplicity, let's just send the email as is

    // Read the HTML email template from a file (or include it directly)
const emailTemplate = fs.readFileSync('emp-email.html', 'utf-8');
    const mailOptions = {
      from: 'ajithadevi20@gmail.com',
      to,
      subject,
      html: emailTemplate,
    };
console.log(mailOptions)
    const emailResult = sendEmail(mailOptions);

    if (emailResult) {
      res.status(200).json({ message: 'Email sent successfully' });
    } else {
      res.status(500).json({ error: 'Email sending failed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/employee/send-otp',authenticateToken, (req, res) => {

  const recipientPhoneNumber = req.body.phoneNumber; // The recipient's phone number

  // Twilio credentials
const accountSid = 'AC8b60d243e3b0f1d19784ca855416e73c';
const authToken = '53afc71ffc0e8d303cf229a13326e1dd';
const twilioPhoneNumber = '+16788827775';

const otpService = new OtpService(accountSid, authToken, twilioPhoneNumber);

  otpService
    .sendOTP(recipientPhoneNumber)
    .then((message) => {
      console.log('OTP sent successfully:', message.sid);
      res.status(200).json({ message: 'OTP sent successfully' });
    })
    .catch((error) => {
      console.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Error sending OTP' });
    });
});


router.ps
function validateEmployeeData(data) {
  const { name, email } = data;

  // Check if 'name' and 'email' fields are missing or empty
  if (!name || !email) {
    return 'Name and email are required fields';
  }

  // Use the custom email validation function
  if (!validateEmployeePayload(email)) {
    return 'Invalid email format';
  }



  return null; // Data is valid
}

function sendErrorResponse(res, statusCode, message) {
  res.status(statusCode).json({ message });
}

function sendSuccessResponse(res, statusCode, data) {
  res.status(statusCode).json(data);
}

module.exports = router;




