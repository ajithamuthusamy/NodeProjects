
const express = require('express');
const app = express();

 const port = process.env.port||5002;
 const headerValidation = require('./validator/headerValidation'); // Import the header validation middleware


 const apiRouter = require('./controller/employeeController');

 app.use(headerValidation)
 app.use('/api', apiRouter);



  app.listen(port,'0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });