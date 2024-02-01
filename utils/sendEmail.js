const nodemailer=require("nodemailer");
const { request } = require("../app");
require('dotenv').config()
sendEmail=async(email,name,otp)=>{
    let transporter=nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

// const link='${process.env.LINK}?token=${token}'
  const info = await transporter.sendMail({
    from: '"Frutable 👻" <avinashkallingal@gmail.com>', // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: `<div>Hi ${name}<br/><p>OTP is <br/><h3>${otp}</h3><br/>click the button to verify email  <a href="${process.env.LINK}?token=${otp}">Click here</a></p></div>`, // html body
  });

  
console.log("msg send")


}
module.exports=sendEmail