const nodemailer = require('nodemailer');
const config = require('../configs');

module.exports = async function (input){
  const transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
      user: config.login,
      pass: config.password
    }
  });

  const mailOptions = {
    'from': `${config.title} <${config.login}>`,
    'to': input.to,
    'subject': input.subject
  };

  if (input.text) mailOptions.text = input.text;
  if (input.html) mailOptions.html = input.html;

  const result = await transporter.sendMail(mailOptions);

  transporter.close();

  return result;
};
