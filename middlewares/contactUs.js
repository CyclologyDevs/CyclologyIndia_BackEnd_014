require("dotenv").config();   //For use .env file
const nodemailer = require("nodemailer");

const sendEmail = async (name, email, message) => {
    var name = name;
    var email = email;
    var message = message;

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            service: 'gmail',
            port: 587,
            secure: true,
            auth: {
                user: 'cycologydevteam@gmail.com',
                pass: 'wwczgsfnmwcjxcye',
            },
        });

        await transporter.sendMail({
          from: `${email}`,
          to: 'cycologydevteam@gmail.com' ,
          html: `<hr/> You got a message from <hr/>
          Email : ${email} <hr/>
          Name: ${name} <hr/>
          Message: ${message} <hr/>`,
        });
        console.log("Email Send for  ContactUs",email);
    } catch (error) {
        console.log("ERROR! Email NOT Send for  ContactUs",email);
        console.log(error);
    }
};

 const contactMe = async (req, res, next) => {

    const { name, email, message } = req.body;

    try {
      await sendEmail(name, email, message);
      console.log("ContactUs Message SEND for email",email)
      return res.status(200).send("Message Successfully Sent!");
    } catch (error) {
      console.log("ContactUs Message NOT SEND for email",email)
      return res.status(400).send("Message Could not be Sent");
    }
  };

module.exports = {sendEmail,contactMe};