const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const sendMail = async ({ to, project_name, link }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "aardvark.reports@gmail.com", // generated ethereal user
      pass: "cryingryan99", // generated ethereal password
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extName: ".handlebars",
        partialsDir: "./src/views/",
        layoutsDir: "./src/views/",
        defaultLayout: "guestLink",
      },
      viewPath: path.resolve("./src/Views/"),
    })
  );

  let info = await transporter.sendMail({
    from: "noreply@aardvark.reports", // sender address
    to: to, // list of receivers
    subject: `Help developers of ${project_name} with your feedback`, // Subject line
    text: `Link : ${link}`, // plain text body
    template: "guestLink",
    context: {
      project_name,
      link,
    },
  });

  // log  msg
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendMail;
