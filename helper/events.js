const events = require('events'),

  moment = require('moment'),

  moment_tz = require('moment-timezone'),

  _ = require('lodash'),

  Email = require('email-templates'),
 
  AdmZip = require('adm-zip');

global.eventEmitter = new events.EventEmitter()

// Load the Database connection

const Sequelize = require(global.appPath + '/config/database')

// Load common functions

const commonFunctions = require(global.appPath + '/helper/commonFunction')

var GenericRepository = require('../repositories/GenericRepository');

const commonFunnction = require('../helper/commonFunction');

module.exports = () => {

  console.log('Initializing the EventEmitter. ooh, YEAH!!!')

  // global.eventEmitter.on('sendUserBookedmarkLink', (userData) => {

  //   console.log('************************ enter into event emmiter');

       

  //   })

  global.eventEmitter.on('client_invitation_email', (userData) => {

    console.log('************************ enter into event emmiter');

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'consultant_invitation_by_admin';

    GenericRepository.fetchData(email_data).then(email_result=>{

      var emailSubject = email_result.rows[0].dataValues.title;

      var emailBody = email_result.rows[0].dataValues.content;
      // var emailBody;
      // if(userData.website_language == 'english'){
      //   emailBody = email_result.rows[0].dataValues.content;
      // }
      // else{
      //   emailBody = email_result.rows[0].dataValues.content_arabic;

      // }


      emailBody = emailBody.replace("[USERNAME]", userData.name);

      emailBody = emailBody.replace("[LINK]", userData.link);
      

      // emailBody = emailBody.replace(/\[link\]/g,userData.link);
      // emailBody = emailBody.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
    // emailBody = emailBody.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
      emailBody = emailBody.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');


      emailBody = emailBody.replace("[WEBSITE_LINK]",process.env.WEBURL);



        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', userData.email, emailSubject, '', emailBody).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(74, email_err);

    })

        

    })

  global.eventEmitter.on('account_activation_email_link', (userData) => {

    console.log('************************ enter into event emmiter for sending emails');

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'account_activation_email_link';

    GenericRepository.fetchData(email_data).then(email_result=>{

      var emailSubject = email_result.rows[0].dataValues.title;

      var emailBody = email_result.rows[0].dataValues.content;

      emailBody = emailBody.replace("[USERNAME]", userData.name);

      emailBody = emailBody.replace("[LINK]", userData.link);
      
      emailBody = emailBody.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');
      emailBody = emailBody.replace("[WEBSITE_LINK]",process.env.WEBURL);




        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', userData.email, emailSubject, '', emailBody).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(74, email_err);

    })

        

    })

  global.eventEmitter.on('forget_password_email_link', (userData) => {

    console.log('************************ enter into event emmiter');

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'forget_password_email_link';

    GenericRepository.fetchData(email_data).then(email_result=>{

      var emailSubject = email_result.rows[0].dataValues.title;

      var emailBody = email_result.rows[0].dataValues.content;

      emailBody = emailBody.replace("[USERNAME]", userData.name);

      emailBody = emailBody.replace("[LINK]", userData.link);

        emailBody = emailBody.replace("[LINK_LOGIN]", userData.link_login);
      // emailBody = emailBody.replace(/\[link\]/g,userData.link);
      // emailBody = emailBody.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
      // emailBody = emailBody.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
      // emailBody = emailBody.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
      emailBody = emailBody.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

      emailBody = emailBody.replace("[WEBSITE_LINK]",process.env.WEBURL);




        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', userData.email, emailSubject, '', emailBody).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(74, email_err);

    })

        

    })

  global.eventEmitter.on('invite_to_article_link', (userData) => {

    console.log('************************ enter into event emmiter');

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'invite_to_article_link';

    GenericRepository.fetchData(email_data).then(email_result=>{

      var emailSubject = email_result.rows[0].dataValues.title;

      var emailBody = email_result.rows[0].dataValues.content;

      emailBody = emailBody.replace("[USERNAME]", userData.name);

      emailBody = emailBody.replace("[LINK]", userData.link);

      // emailBody = emailBody.replace(/\[link\]/g,userData.link);
      // emailBody = emailBody.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
      // emailBody = emailBody.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
      // emailBody = emailBody.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
      emailBody = emailBody.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

      emailBody = emailBody.replace("[WEBSITE_LINK]",process.env.WEBURL);



        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', userData.email, emailSubject, '', emailBody).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(74, email_err);

    })

        

    })

    

    global.eventEmitter.on('ask_me_email',(user)=>{

      var email_data = {};

      email_data.table = 'emailtemplate';

      email_data.where = {};

      email_data.where.slug = 'askme_from_thankyou';

      GenericRepository.fetchData(email_data).then(result=>{

        var subject=result.rows[0].dataValues.title;

        var body=result.rows[0].dataValues.content;
        body = body.replace("[USERNAME]", user.username);
        body = body.replace("[USERNAME]", user.name);
        body = body.replace("[name]", user.name);
        body = body.replace("[phone]", user.phone);
        body = body.replace("[mail]", user.email);
        body = body.replace("[description]", '<pre valign="top" style="margin:0;font-family:inherit;font-weight:inherit;font-size:inherit;color:inherit;line-height:inherit">'+user.description+'</pre>');
        // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
        // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
        // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
        body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

        body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);






        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {

          console.log('Email sent: %s', info1.messageId)

          }).catch((err) => {

            console.error('Error in pending verification email :', err)

          })

      }).catch(email_err=>{

        console.log(email_err);

        

      })

    })




    global.eventEmitter.on('consultent_register_invitation_email',(user)=>{

      var email_data = {};

      email_data.table = 'emailtemplate';

      email_data.where = {};

      email_data.where.slug = 'client_sent_invitation_to_consultent';

      GenericRepository.fetchData(email_data).then(result=>{

        var subject=result.rows[0].dataValues.title;

        var body=result.rows[0].dataValues.content;

        body = body.replace("[USERNAME]", user.name);
       
        body = body.replace("[LINK]", user.link);
        // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
        // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
        // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
        body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

        body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);






        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {

          console.log('Email sent: %s', info1.messageId)

          }).catch((err) => {

            console.error('Error in pending verification email :', err)

          })

      }).catch(email_err=>{

        console.log(email_err);

        

      })

    })


    global.eventEmitter.on('project_invitation_email',(user)=>{

      var email_data = {};

      email_data.table = 'emailtemplate';

      email_data.where = {};

      email_data.where.slug = 'client_invite_consulte_to_project';

      GenericRepository.fetchData(email_data).then(result=>{

        var subject=result.rows[0].dataValues.title;

        var body=result.rows[0].dataValues.content;

        body = body.replace("[USERNAME]", user.name);

        body = body.replace("[LINK]", user.link);
        // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
        // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
        // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
        body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

        body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);






        return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {

          console.log('Email sent: %s', info1.messageId)

          }).catch((err) => {

            console.error('Error in pending verification email :', err)

          })

      }).catch(email_err=>{

        console.log(email_err);

        

      })

    })
    global.eventEmitter.on('consultant_invite_client', (userData) => {

      console.log('************************ enter into event emmiter');
  
      var email_data = {};
  
      email_data.table = 'emailtemplate';
  
      email_data.where = {};
      if(userData.is_user_found == 0){
        email_data.where.slug = 'consultant_invite_client_to_register';
      }
      else{
        email_data.where.slug = 'consultant_invite_client_to_project';
      }
      GenericRepository.fetchData(email_data).then(email_result=>{
  
        var emailSubject = email_result.rows[0].dataValues.title;
  
        var emailBody = email_result.rows[0].dataValues.content;
  
        emailBody = emailBody.replace("[USERNAME]", userData.name);
  
        emailBody = emailBody.replace("[LINK]", userData.link);
  
        // emailBody = emailBody.replace(/\[link\]/g,userData.link);
        // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
        // emailBody = emailBody.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
        // emailBody = emailBody.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
        emailBody = emailBody.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

        emailBody = emailBody.replace("[WEBSITE_LINK]",process.env.WEBURL);



  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', userData.email, emailSubject, '', emailBody).then((info1) => {
  
          console.log('Email sent: %s', info1.messageId)
  
          }).catch((err) => {
  
            console.error('Error in pending verification email :', err)
  
          })
  
      }).catch(email_err=>{
  
        console.log(74, email_err);
  
      })
  
          
  
      })



      global.eventEmitter.on('ask_me_email_admin',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'askme_admin';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);
          body = body.replace("[name]", user.name);
          body = body.replace("[phone]", user.phone);
          // body = body.replace("[mail]", user.email);
          body = body.replace("[mail]", user.user_email_address);
          body = body.replace("[description]",  '<pre valign="top" style="margin:0;font-family:inherit;font-weight:inherit;font-size:inherit;color:inherit;line-height:inherit">'+user.description+'</pre>');
          body = body.replace("[type]", user.type);

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })


      global.eventEmitter.on('project_closed',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'project_reject';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);
          body = body.replace("[USERNAME]", user.username);
          body = body.replace("[clientname]", user.clientname);
          body = body.replace("[projectname]", user.projectname);
          body = body.replace("[reason]", user.reason);
          body = body.replace("[comment]", user.comment);

         

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })



      global.eventEmitter.on('project_approved',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'project_approved';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);
          body = body.replace("[USERNAME]", user.username);
          body = body.replace("[projectname]", user.projectname);
          body = body.replace("[project_location]", user.location);

         

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })



      global.eventEmitter.on('project_allortment',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'project_allortment';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);
          body = body.replace("[USERNAME]", user.username);
        
          body = body.replace("[projectname]", user.projectname);

         

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })



      global.eventEmitter.on('project_bid_reject',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'project_bid_reject';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);

         body = body.replace("[name]", user.name);
          body = body.replace("[USERNAME]", user.username);
        
          body = body.replace("[projectname]", user.projectname);

         

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })




      global.eventEmitter.on('project_tender',(user)=>{

        var email_data = {};
  
        email_data.table = 'emailtemplate';
  
        email_data.where = {};
  
        email_data.where.slug = 'project_tender';
  
        GenericRepository.fetchData(email_data).then(result=>{
  
          var subject=result.rows[0].dataValues.title;
  
          var body=result.rows[0].dataValues.content;
         // body = body.replace("[USERNAME]", user.name);
          body = body.replace("[USERNAME]", user.username);
        
          // body = body.replace("[projectname]", user.projectname);
         
          body = body.replace("[LINK]", user.link);



         
         
          // body = body.replace("[days]", user.days);
          // body = body.replace("[price]", user.price);

         

          // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
          // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
          // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
          body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');

  
          body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
  
  
  
  
  
  
          return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {
  
            console.log('Email sent: %s', info1.messageId)
  
            }).catch((err) => {
  
              console.error('Error in pending verification email :', err)
  
            })
  
        }).catch(email_err=>{
  
          console.log(email_err);
  
          
  
        })
  
      })




   global.eventEmitter.on('createProjectDrawingZip',   (data)=>{
    (async()=>{
      try{
        var zip = new AdmZip();
        let get_zip_file_name_for_project_drawings = await commonFunnction.getRandomString(5);
        let create_drawning_zip = await new Promise(function(resolve, reject){
          let id = parseInt(data.project_id);
          let get_project_doc_data = {};
          get_project_doc_data.table = 'project_docs';
          get_project_doc_data.where = {};
          get_project_doc_data.where.project_id = id;
          // get_project_doc_data.where.type = 'drawing';
          get_project_doc_data.where.type = data.type;
          get_project_doc_data.where.is_active = 1;
          get_project_doc_data.where.is_delete = 0;
          GenericRepository.fetchData(get_project_doc_data).then(get_project_doc_result=>{
            if(get_project_doc_result.rows.length > 0){
              // Project drawings found //
              for (let i = 0; i < get_project_doc_result.rows.length; i++){

                // zip.addLocalFile(process.env.WEBURL+"/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
                // zip.addLocalFile("/home/devuipl/public_html/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
                zip.addLocalFile(global.appPath+"/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
                // zip.addLocalFile("/var/www/html/ebinaa-node/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
              if(i == get_project_doc_result.rows.length - 1){
                console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')

                  zip.writeZip(/*target file name*/global.constants.uploads.project_docs_zips+get_zip_file_name_for_project_drawings+".zip");
                  let project_docs_create_data = {};
                  project_docs_create_data.table = 'project_docs';
                  project_docs_create_data.data = {};
                  project_docs_create_data.data.project_id = id;
                  // project_docs_create_data.data.type = 'drawing_zip';
                  project_docs_create_data.data.type = data.zip_type;
                  project_docs_create_data.data.resource_type = 'zip';
                  project_docs_create_data.data.resource_url = 'project_zips/'+get_zip_file_name_for_project_drawings+'.zip';
                  project_docs_create_data.data.is_active = 1;
                  project_docs_create_data.data.is_delete = 0;
                  project_docs_create_data.where = {project_id:id,type:data.zip_type};
                  GenericRepository.deleteData(project_docs_create_data).then(project_docs_create_result=>{

                          GenericRepository.createData(project_docs_create_data).then(project_docs_create_result=>{
                              resolve()
                          }).catch(project_docs_create_err=>{
                            console.log(2016, project_docs_create_err);
                            // return res.send({status:500, message:'Something went wrong'});
                          })


                    }).catch(project_docs_create_err=>{
                      console.log(2016, project_docs_create_err);
                    // return res.send({status:500, message:'Something went wrong'});
                  })

                  // GenericRepository.createData(project_docs_create_data).then(project_docs_create_result=>{
                  //   resolve()
                  // }).catch(project_docs_create_err=>{
                  //   console.log(2016, project_docs_create_err);
                  //   // return res.send({status:500, message:'Something went wrong'});
                  // })

                }
              }

            }
            else{
              // No project drawings found //
              resolve()
            }
          }).catch(get_project_doc_err=>{
            console.log(1995, get_project_doc_err);
            // return res.send({status:500, message:'Something went wrong'});
          })

        })

      }
      catch(err){
        console.log(1962, err);
        // return res.send({status:500, message:'Something went wrong'});
      }
    })()
  })

  global.eventEmitter.on('consultant_deactivate_email',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'consultant_update_account';

    GenericRepository.fetchData(email_data).then(result=>{

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[USERNAME]", user.username);
      body = body.replace("[LINK]", user.link);
      body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');


      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
      return commonFunctions.sendMail('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })

  global.eventEmitter.on('project_sign_to_client',(user)=>{


    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'project_sign_to_client';

    GenericRepository.fetchData(email_data).then(result=>{

      var subject=result.rows[0].dataValues.title;
      var body=result.rows[0].dataValues.content;
      body = body.replace("[USERNAME]", user.username);
      var attachments= user.attachments;
      body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
      return commonFunctions.sendMailAttachment('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body,attachments).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })

  global.eventEmitter.on('project_sign_to_contractor',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'project_sign_to_contractor';

    GenericRepository.fetchData(email_data).then(result=>{

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[USERNAME]", user.username);
      var attachments = user.attachments;
      body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
      return commonFunctions.sendMailAttachment('"eBinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body,attachments).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })


  global.eventEmitter.on('contractor_profile_approved',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'contractor_profile_approved';

    GenericRepository.fetchData(email_data).then(result=>{

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[USERNAME]", user.username);
      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })


  global.eventEmitter.on('contractor_registration',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'a_new_contractor_registration';

    GenericRepository.fetchData(email_data).then(result=>{

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[name]", user.name);
      body = body.replace("[phone]", user.phone);
      body = body.replace("[mail]", user.mail);

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body).then((info1) => {

        console.log('Email sent: %s', info1.messageId)

        }).catch((err) => {

          console.error('Error in pending verification email :', err)

        })

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })





  global.eventEmitter.on('new_project_submit',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'new_project_submit';

    GenericRepository.fetchData(email_data).then(result=>{
      

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[projectname]", user.projectname);
      body = body.replace("[project_location]", user.location);
      //user.email=[];
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })

  global.eventEmitter.on('contractor_edit_data',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'contractor_edit_data';

    GenericRepository.fetchData(email_data).then(result=>{
      

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[contname]", user.name);
      body = body.replace("[email]", user.contemail);
      //user.email=[];
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })

  global.eventEmitter.on('client_details',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'client_details';

    GenericRepository.fetchData(email_data).then(result=>{
      console.log(result);
      

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[clientname]", user.name);
      body = body.replace("[number]", user.number);
      //user.email=[];
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })

  global.eventEmitter.on('completed_project_information',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'completed_project_information';

    GenericRepository.fetchData(email_data).then(result=>{
      console.log(result);
      

      var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[project]", user.project);
      //body = body.replace("[number]", user.number);
      //user.email=[];
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })


  global.eventEmitter.on('consultant_new_login',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'consultant_new_login';

    GenericRepository.fetchData(email_data).then(result=>{
     
     var subject=result.rows[0].dataValues.title;

      var body=result.rows[0].dataValues.content;
      body = body.replace("[email]", user.email);
      body = body.replace("[password]", user.password);
      //body = body.replace("[number]", user.number);
      //user.email=[];
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })
  global.eventEmitter.on('project_details',(user)=>{

    var email_data = {};

    email_data.table = 'emailtemplate';

    email_data.where = {};

    email_data.where.slug = 'project_details';

    GenericRepository.fetchData(email_data).then(result=>{
     
     var subject=result.rows[0].dataValues.title;

      // var body=result.rows[0].dataValues.content;
      // body = body.replace("[email]", user.email);
      // body = body.replace("[password]", user.password);
     
     

      body = body.replace("[ebinaa_logo]",process.env.APIURL+'/uploads/common_images/EBinaa-Logo-Colored.png');
      body = body.replace("[WEBSITE_LINK]",process.env.WEBURL);
      return commonFunctions.sendMail(global.constants.SMTP.FROM, user.email, subject, '',body)

    }).catch(email_err=>{

      console.log(email_err);

      

    })

  })


  

  

// 


  //  global.eventEmitter.on('project_sign_to_contractor',(user)=>{

  //   var email_data = {};

  //   email_data.table = 'emailtemplate';

  //   email_data.where = {};

  //   email_data.where.slug = 'project_sign_to_contractor';

  //   GenericRepository.fetchData(email_data).then(result=>{

  //     var subject=result.rows[0].dataValues.title;

  //     var body=result.rows[0].dataValues.content;
  //     body = body.replace("[USERNAME]", user.username);
  //    // body=body.replace("[LINK]",user.link);
  //     //var file=user.file;
  //     //var path=user.path;
    
  //    //var attachments=filename;

     
  //     // body = body.replace("[description]", '<pre valign="top" style="margin:0;font-family:inherit;font-weight:inherit;font-size:inherit;color:inherit;line-height:inherit">'+user.description+'</pre>');
  //     // // body = body.replace(/\[image_folder\]/g,process.env.WEBURL+'/uploads/common_images/');
  //     // // body = body.replace(/\[ebinaa_logo\]/g,process.env.WEBURL+'/uploads/common_images/EBinaa-Logo-Colored.svg');
  //     // // body = body.replace(/\[WEBSITE_LINK\]/g,process.env.WEBURL+'/ebinaa/html/');
  //     body = body.replace("[ebinaa_logo]",process.env.WEBURL+':'+process.env.SERVER_PORT+'/uploads/common_images/EBinaa-Logo-Colored.png');
  //     body = body.replace("[WEBSITE_LINK]",process.env.WEBURL+'/ebinaa/html/');
  //     return commonFunctions.sendMail('"Ebinaa"<arijit@unifiedinfotech.net>', user.email, subject, '',body,user.path).then((info1) => {

  //       console.log('Email sent: %s', info1.messageId)

  //       }).catch((err) => {

  //         console.error('Error in pending verification email :', err)

  //       })

  //   }).catch(email_err=>{

  //     console.log(email_err);

      

  //   })

  // })


}





