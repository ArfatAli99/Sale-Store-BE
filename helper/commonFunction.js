const Q = require('q'),
  fs = require('fs'),
  crypto = require('crypto'),
  mkdirp = require('mkdirp'),
  request = require("request"),
  gcm = require('node-gcm'),
  nodemailer = require('nodemailer'),
  _ = require('lodash'),
//   googleMapsClient = require('@google/maps').createClient({
//   key: global.constants.GOOGLEAPIKEY,
//   Promise: Promise
// }),
accountSid = global.constants.ACCOUNTSID,
authToken = global.constants.AUTHTOKEN,
smsclient = require('twilio')(accountSid, authToken),
adminno = global.constants.ADMINNO

module.exports.mkdir = function (dirpath, callback) {
  var deferred = Q.defer();

  mkdirp(dirpath, {mode: 0777}, function (err) {
    if (err) {
      // global.commonFunction.customLog("mkdir", err)
      deferred.reject(err);
    } else {
      // global.commonFunction.customLog("mkdir created folder", dirpath);
      deferred.resolve(null);
    }
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
}

module.exports.getRandomNumber = function (howMany, callback) {
  const deferred = Q.defer();

  howMany = howMany || 6;
  chars = "0123456789";

  let rnd = crypto.randomBytes(howMany)
    , value = new Array(howMany)
    , len = chars.length;

  for (let i = 0; i < howMany; i++) {
    value[i] = chars[rnd[i] % len]
  }

  let randomNumber = value.join('');

  deferred.resolve(randomNumber);

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.getRandomString = function (howMany, callback) {
  const deferred = Q.defer();

  howMany = howMany || 10;
  chars = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";

  let rnd = crypto.randomBytes(howMany)
    , value = new Array(howMany)
    , len = chars.length;

  for (let i = 0; i < howMany; i++) {
    value[i] = chars[rnd[i] % len]
  }

  let randomString = value.join('');

  deferred.resolve(randomString);

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.deleteFiles = function (files, callback) {
  const deferred = Q.defer();

  let filesArr = Array.isArray(files) ? files : [files];
  let i = filesArr.length;

  filesArr.forEach(function (filepath) {
    // global.commonFunction.customLog("delete filepath : " + filepath);

    if (filepath != null || filepath != '') {
      fs.unlink(filepath, function (err) {
        i--;

        if (err) {
          deferred.reject(err);
        } else if (i <= 0) {
          deferred.resolve(null);
        }
      });
    }
  });

  deferred.promise.nodeify(callback);
  return deferred.promise;
};

module.exports.MD5 = (string) => {
  return crypto.createHash('md5').update(string).digest('hex')
}


module.exports.sendPush = (registrationTokens, title, body, data, timeToLive = 3600 * 24 * 7, callback) => {
  const deferred = Q.defer();

  var settings = {
    gcm: {
      id: global.constants.FCMSERVERKEY,
      timeToLive: timeToLive,
      priority: 'high',
      contentAvailable: 1,
    },
  };

  var sender = new gcm.Sender(global.constants.FCMSERVERKEY);



  var soundFile = "dropsound.wav";

  var sound_ch = "com.uipl.dropvendorapp.fcm.ANDROID_2";

  if("soundtype" in data)
  {
    if(data.soundtype == "placeorder")
    {
      soundFile = "dropsoundlong.wav"; 
      sound_ch = "com.uipl.dropvendorapp.fcm.ANDROID_1";

    }

      if(data.soundtype == "iamhere")
    {
      soundFile = "dropsoundlongmod.wav"; 
      sound_ch = "com.uipl.dropvendorapp.fcm.ANDROID_3";

    }
  }


  var message = new gcm.Message({
  priority: 'high',
  contentAvailable: true,
  timeToLive: timeToLive,
  sound: soundFile,
  title: title,
  body: body,
  custom:data,
  data: {
    title: title,
    message: body,
    sound: soundFile,
    custom:data,
    type:data.type,
    order_id:data.order_id,
    soundtype:data.soundtype,
  },
  notification: {
    title: title,
    body: body,
    sound: soundFile,
    android_channel_id : sound_ch,
    custom:data,
    color : "#EC3851",
    icon: "ic_push_notification",
  }
  });


  sender.send(message, { registrationTokens: registrationTokens }, function (err, response) {
  if(err) deferred.reject(err);
  else    deferred.resolve(response);
});




    deferred.promise.nodeify(callback);
    return deferred.promise;


}



module.exports.sendSms = function (number, text, callback) {
smsclient.messages
  .create({
     body: text,
     from: adminno,
     to: number
   })
  .then((message) => {
    callback(message);
  }).catch((err) => {
    console.log('message errrror #################################################################');
    console.log(err);
    callback(err);
  }).done();
 
};


module.exports.sendMail = (from, to, subject, textBody, htmlBody) => {
  var deferred = Q.defer()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'ebinaa321@gmail.com',
      pass: 'UIpl#@2020'
    },
    tls: {
      rejectUnauthorized: true
    }
  })
  

  let mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject // Subject line
  }

  if (textBody) {
    mailOptions.text = textBody
  } else if (htmlBody) {
    mailOptions.html = htmlBody
  }


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(108, error)
      deferred.reject(error)
    } else {
      console.log('Message sent: %s', info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

      deferred.resolve(info)
    }

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  })

  return deferred.promise
}


module.exports.sendMailAttachment = (from, to, subject, textBody, htmlBody , attachments) => {
  var deferred = Q.defer()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'ebinaa321@gmail.com',
      pass: 'UIpl#@2020'
    },
    tls: {
      rejectUnauthorized: true
    }
  })
  let mailOptions = {
    from: from, // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    attachments: attachments // Subject line
  }

  if (textBody) {
    mailOptions.text = textBody
  } else if (htmlBody) {
    mailOptions.html = htmlBody
  }
  


  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(108, error)
      deferred.reject(error)
    } else {
      console.log('Message sent: %s', info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

      deferred.resolve(info)
    }

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  })

  return deferred.promise
}




module.exports.sendMailMultiple = (from, to, subject, textBody, htmlBody ) => {
  var deferred = Q.defer()

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'ebinaa321@gmail.com',
      pass: 'UIpl#@2020'
    },
    tls: {
      rejectUnauthorized: true
    }
  })

  //var maillist = [];
  let mailOptions = {
    from: from, // sender address
   // to: item, // list of receivers
    subject: subject, // Subject line
   
  }

  if (textBody) {
    mailOptions.text = textBody
  } else if (htmlBody) {
    mailOptions.html = htmlBody
  }

  console.log(to);
 
 to=[];
  to.forEach(function (item, i , array) {
    console.log(item);
   
    mailOptions.to=item;
   

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(108, error)
      deferred.reject(error)
    } else {
      console.log('Message sent: %s', info.messageId)
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))

      deferred.resolve(info)
    }

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  })


  return deferred.promise
  })
}

