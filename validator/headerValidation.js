
const config = require('../env-config/local-cofig.json');
module.exports = (req, res, next) => {
    const empCode = req.headers['emp-code'];
      if (empCode !== config.empCodeHeader) {
        return res.status(400).json({ message: 'Invalid emp-code header' });
      }
    next(); // Move on to the next middleware or route handler
  };