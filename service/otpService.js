const twilio = require('twilio');

class OtpService{
constructor(accountSid, authToken, twilioPhoneNumber){

    this.client = new twilio(accountSid,authToken);
    this.twilioPhoneNumber =twilioPhoneNumber;
}

generateOtp(){
    return Math.floor(10000 + Math.random()* 900);
}
    
sendOTP(recipientPhoneNumber){
 
    const otp = this.generateOtp();

    return this.client.messages.create({
        body: `Your OTP from Pinnai Dhanya Investment Bank is: ${otp}`,
        from: this.twilioPhoneNumber,
        to: recipientPhoneNumber,
    });


}

}

 
module.exports=OtpService;