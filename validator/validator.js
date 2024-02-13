

function validateEmployeePayload(email) {
    // Implement your custom email validation logic here
    // For example, you can use a regular expression to check the email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

module.exports = { validateEmployeePayload };