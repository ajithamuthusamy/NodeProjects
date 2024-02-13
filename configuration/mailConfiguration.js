const nodemailer =  require( 'nodemailer');



const transporter = nodemailer.createTransport({

    service: 'gmail',
  auth: {
    user: 'ajithadevi20@gmail.com',
    pass: 'jrgt frhv khqa mroh',
  },
});


module.exports  = async function sendEmail(mailOptions) {
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Email sending failed' });
    } else {
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent successfully' });
    }
  });
}

