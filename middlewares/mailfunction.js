const nodemailer = require('nodemailer'),
  Q = require('q')

module.exports.sendMail = (from, to, subject, textBody, htmlBody,attachments) => {
  var deferred = Q.defer()
   console.log(global.constants.SMTP)
  const transporter = nodemailer.createTransport({
    host: global.constants.SMTP.HOST,
    port: global.constants.SMTP.PORT,
    secure: true,
    auth: {
      user: global.constants.SMTP.USER,
      pass: global.constants.SMTP.PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  let mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject,// Subject line
   


  }


  

 

  if (textBody) {
    mailOptions.text = textBody
  } else if (htmlBody) {
    mailOptions.html = htmlBody
  }
 else if(attachments){
    mailOptions.attachments=attachments
 }
 

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error)
      deferred.reject(error)
    } else {
      console.log('Message sent: %s', info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      //console.log(info)

      deferred.resolve(info)
    }

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  })

  return deferred.promise
}

