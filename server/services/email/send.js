const nodemailer = require('nodemailer');
const config = require('../../configs').email;

module.exports = async function (input){
  if (!config.enabled) return { 'message': 'email service disabled' };

  const transporter = nodemailer.createTransport({
    service: config.service,
    auth: {
      user: config.login,
      pass: config.password
    }
  });

  const mailOptions = {
    'from': `${config.title} <${config.login}>`,
    'to': input.receiver,
    'subject': input.subject
  };

  if (input.text) mailOptions.text = input.text;
  if (input.html) mailOptions.html = input.html;

  console.log('!sendMail', JSON.stringify(mailOptions));

  const result = await transporter.sendMail(mailOptions);

  transporter.close();

  return result;
};
