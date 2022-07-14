global.eventEmitter = new events.EventEmitter()
const mailFunction = require(global.appPath + '/middlewares/mailFunction');
global.eventEmitter.on('sendinvitation',(email,url)=>{
    let emailsubject='consultent hub invitation'
    return mailFunction.sendMail(global.constants.SMTP.FROM,email,emailsubject,url,null);
  })