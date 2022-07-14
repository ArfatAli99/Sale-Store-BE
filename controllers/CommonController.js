var md5 = require('md5');

var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
var CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const { validationResult } = require('express-validator/check');
const commonFunnction = require('../helper/commonFunction');
const sendMessage=require('../helper/massege');
const moment = require('moment');
var request = require('request');




var publicVar = {};

/**client_and_consultant_sign_up API
method:POST
input:body[user_type, facebook_id, email, phone, user_type, full_name, google_plus_id, password, company_name, relationship_with_company, description_of_relationship_with_company, is_phone_verified]
output:data,
purpose:To register of client and consultant by email, facebook, google plus.
*/
/**
     * To register of client and consultant by email, facebook, google plus with respect to `user_type`, `facebook_id`, `email`, `phone`, `user_type`, `full_name`, `google_plus_id`, `password`, `company_name`, `relationship_with_company`, `description_of_relationship_with_company`, `is_phone_verified`
     * @param {Number} `user_type`, `relationship_with_company`, `is_phone_verified`
     * @param {String} `facebook_id`, `email`, `phone`, `user_type`, `full_name`, `google_plus_id`, `password`, `company_name`, `description_of_relationship_with_company`
     * @return {data} `data`
*/
publicVar.client_and_consultant_sign_up = function(req, res){
    if(req.body.user_type == 1){
        if(req.body.facebook_id){
            CommonValidationMiddleware.client_validate('fb_signup');

        }
        else if(req.body.google_plus_id){
            CommonValidationMiddleware.client_validate('google_plus_signup');

        }
        else{
            CommonValidationMiddleware.client_validate('manualy_signup');
        }
    }
    else{
        CommonValidationMiddleware.consultant_validate('manualy_signup');
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      var msg = [];
      var mg = "";
      errors.array().map(i =>{
        mg = `'${i.param}' has ${i.msg}`;
        msg.push(mg);
      } );
      return res.send({status:-1,message:msg});
    }

    (async()=>{

       
        let duplicate_user_check = await new Promise(function(resolve, reject){
            let check_data = {};
            check_data.table = 'user';
            check_data.where = {};
            check_data.where.email = req.body.email;
            // check_data.where.phone = req.body.phone;
            check_data.where.user_type = req.body.user_type;
            GenericRepository.fetchData(check_data).then(check_data_result=>{
                if(check_data_result.rows.length > 0){
                    return res.send({status:409, message:'Email is already registered'});
                }
                else{
                    resolve();
                }
            }).catch(check_data_err=>{
                console.log(check_data_err);
                return res.send({status:500, message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, message:'Something went wrong'});
        })

        let check_phone={};
        check_phone.table='user';
        check_phone.where={phone:req.body.phone,user_type :req.body.user_type};
        let check_phone_data=await GenericRepository.fetchData(check_phone);
        if(check_phone_data.rows.length>0){
            return res.send({status:409, message:'Phone number is already registered'});

        }

       
        let client_and_consultant_sign_up = await new Promise(function(resolve, reject){
            let client_and_consultant_sign_up = {};
            client_and_consultant_sign_up.table = 'user';
            client_and_consultant_sign_up.data = {};
            client_and_consultant_sign_up.data.full_name = req.body.full_name;
            if(req.body.email){
                client_and_consultant_sign_up.data.email = req.body.email;
            }
            client_and_consultant_sign_up.data.user_type = parseInt(req.body.user_type);
    
            if(req.body.facebook_id){
                client_and_consultant_sign_up.data.facebook_id = req.body.facebook_id;
                client_and_consultant_sign_up.data.is_email_verified = 1;
                client_and_consultant_sign_up.data.is_phone_verified = 0;

            }
            if(req.body.google_plus_id){
                client_and_consultant_sign_up.data.google_plus_id = req.body.google_plus_id;
                client_and_consultant_sign_up.data.is_email_verified = 1;
                client_and_consultant_sign_up.data.is_phone_verified = 0;

            }
            if(req.body.id){
                client_and_consultant_sign_up.data.is_email_verified = 1;
                client_and_consultant_sign_up.data.is_phone_verified = 0;
            }
            if(req.body.phone){
                client_and_consultant_sign_up.data.phone = req.body.phone;
            }
            if(req.body.password){
                client_and_consultant_sign_up.data.password = md5(req.body.password);
            }
            if(Object.keys(req.files).length > 0){
                if(Object.keys(req.files).indexOf('profile_image') > -1 ){
                    client_and_consultant_sign_up.data.profile_image = req.files.profile_image[0].filename;
                }
            }else{
                client_and_consultant_sign_up.data.profile_image = req.body.profile_image;
            }
            if(req.body.company_name){
                client_and_consultant_sign_up.data.company_name = req.body.company_name;
            }
            if(req.body.relationship_with_company){
                client_and_consultant_sign_up.data.relationship_with_company = parseInt(req.body.relationship_with_company);
                if(parseInt(req.body.relationship_with_company) == 4){
                    client_and_consultant_sign_up.data.description_of_relationship_with_company = req.body.description_of_relationship_with_company;
                }
            }
            if(req.body.referred_by_user_id){
                client_and_consultant_sign_up.data.referred_by_user_id = parseInt(req.body.referred_by_user_id);
            }
            if(req.body.is_phone_verified){
                client_and_consultant_sign_up.data.is_phone_verified = req.body.is_phone_verified;
            }
            
            resolve(client_and_consultant_sign_up);
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, message:'Something went wrong'});
        })
        let validation_hash = await new Promise(function(resolve, reject){
            let validation_hash;
            if(req.body.facebook_id || req.body.google_plus_id){
                resolve();
            }
            else{
                commonFunnction.getRandomString(10).then((randNum) => {
                    validation_hash = randNum
                    resolve(validation_hash)
                  }).catch(randErr=>{
                    console.log(randErr);
                    return res.send({status:500, message:'Something went wrong'});
                  })

            }

        })
        let created_user_result = await new Promise(function(resolve, reject){
            let created_user_result;
            GenericRepository.createData(client_and_consultant_sign_up).then(async client_and_consultant_sign_up_result=>{
                created_user_result = client_and_consultant_sign_up_result;
                if(req.body.is_mail_verified){
                    let email_verified={};
                    email_verified.table='user',
                    email_verified.where={id:client_and_consultant_sign_up_result.dataValues.id}
                    email_verified.data={
                        is_email_verified:req.body.is_mail_verified
                    }
                    let email_verified_update=await GenericRepository.updateData(email_verified);
                    
        
                }
                if(req.body.user_type==2){
                    let admin_consultant={};
                    admin_consultant.table='admin_consultants',
                    admin_consultant.data={
                        user_id:client_and_consultant_sign_up_result.dataValues.id,
                        company_name:req.body.company_name
                    }
                    let admin_consultant_create=await GenericRepository.createData(admin_consultant);
                }

                resolve(created_user_result);
            }).catch(client_and_consultant_sign_up_err=>{
                console.log(client_and_consultant_sign_up_err);
                return res.send({status:500, message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, message:'Something went wrong'});
        })
        
        let send_email = await new Promise(function(resolve, reject){
            if(req.body.facebook_id || req.body.google_plus_id || req.body.id){
                resolve()
            }
            else{
                let validation_data = {};
                validation_data.table = 'validation';
                validation_data.data = {};
                validation_data.data.uid = created_user_result.dataValues.id;
                validation_data.data.role = req.body.user_type;
                validation_data.data.validation_type = 'email';
                validation_data.data.validation_hash = validation_hash;
                validation_data.data.ref_email = req.body.email;
                GenericRepository.createData(validation_data).then(validation_result=>{
                    let create_user_data = {};
                    create_user_data.name = created_user_result.dataValues.full_name;
                    create_user_data.email = created_user_result.dataValues.email;
                    create_user_data.link = process.env.WEBURL+'/ebinaa/html/account-verified/'+validation_hash;//change the url here
                    global.eventEmitter.emit('account_activation_email_link', create_user_data);
                    resolve();
                    // return res.send({status:201, msg:'Signed up successfully, please verify your email to your provided email address', data:client_and_consultant_sign_up_result})
                }).catch(validation_err=>{
                    console.log(157, validation_err);
                    return res.send({status:500, message:'Something went wrong'});
                })
            }

        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(409, err);
            return res.send({status:500, message:'Something went wrong'});
        })
        // let update_validation_data = await new Promise(function(resolve, reject){
        //     if(req.body.id){
        //         let update_validation_data = {};
        //         update_validation_data.table = 'validation';
        //         update_validation_data.where = {};
        //         update_validation_data.where.id = parseInt(req.body.id);
        //         update_validation_data.data = {};
        //         update_validation_data.data.ref_id = created_user_result.dataValues.id;
        //         update_validation_data.data.is_expired = 1;
        //         update_validation_data.data.is_verified = 1;
        //         GenericRepository.updateData(update_validation_data).then(update_validation_result=>{
        //             resolve();
        //         }).catch(update_validation_err=>{
        //             console.log(update_validation_err);
        //             return res.send({status:500, message:'Something went wrong'});
        //         })
        //     }
        //     else{
        //         resolve();
        //     }
        // }).then(result=>{
        //     return result;
        // }).catch(err=>{
        //     console.log(402, err);
        //     return res.send({status:500, message:'Something went wrong'});
        // })
        // let insert_project_consultant = await new Promise(function(resolve, reject){
        //     if(req.body.id){
        //         let insert_project_consultant_data = {};
        //         insert_project_consultant_data.table = 'project_consultant';
        //         insert_project_consultant_data.data = {};
        //         if(req.body.user_type == 1){
        //             insert_project_consultant_data.client_id = created_user_result.dataValues.id;
        //             insert_project_consultant_data.consultant_id = parseInt(req.body.uid);
        //         }
        //         else{
        //             insert_project_consultant_data.client_id = parseInt(req.body.uid);
        //             insert_project_consultant_data.consultant_id = created_user_result.dataValues.id;
        //         }
        //         insert_project_consultant_data.data.project_id = parseInt(req.body.project_id);
        //         GenericRepository.createData(insert_project_consultant_data).then(insert_project_consultant_result=>{
        //             resolve();
        //         }).catch(insert_project_consultant_err=>{
        //             console.log(442,insert_project_consultant_err);
        //             return res.send({status:500, message:'Something went wrong'});
        //         })

        //     }
        //     else{
        //         resolve()
        //     }

        // }).then(result=>{
        //     return result;
        // }).catch(err=>{
        //     console.log(430, err);
        //     return res.send({status:500, message:'Something went wrong'});
        // })
        return res.send({status:201, message:'Registered successfully', purpose:'To register client and consultant', data:created_user_result});
    })()

}

    
/**detailsOfAccountActivationEmailLink API
method:POST
input:queryParam[validation_hash]
output:data,
purpose:To verify email account of a newly registered client or consultant.
created by arijit saha
*/
/**
     * To verify email account of a newly registered client or consultant with respect to `validation_hash`
     * @param {String} `validation_hash`
     * @return {data} `data`
*/
publicVar.detailsOfAccountActivationEmailLink = function(req, res){
    (async()=>{
        try{
            let check_link = await new Promise(function(resolve, reject){
                let check_link;
                let check_validation = {};
                check_validation.table = 'validation';
                check_validation.where = {};
                check_validation.where.validation_hash = req.query.validation_hash;
                GenericRepository.fetchData(check_validation).then(check_validation_data=>{
                    if(check_validation_data.rows.length == 0){
                        return res.send({status:404, message:'No such link found'})
                    }
                    else{
                        if(check_validation_data.rows[0].dataValues.is_expired == 1){
                            return res.send({status:403, message:'Link is already expired'});
                        }
                        else{
                            check_link = check_validation_data;
                            let update_validation_data = {};
                            update_validation_data.table = 'validation';
                            update_validation_data.where = {};
                            update_validation_data.where.validation_hash = req.query.validation_hash;
                            update_validation_data.data = {};
                            update_validation_data.data.is_expired = 1
                            update_validation_data.data.is_verified = 1
                            GenericRepository.updateData(update_validation_data).then(check_validation_result=>{
                                // console.log('########################', check_validation_data.rows[0].dataValues);
                                let update_user_data = {};
                                update_user_data.table = 'user';
                                update_user_data.where = {};
                                update_user_data.where.id = parseInt(check_validation_data.rows[0].dataValues.uid);
                                update_user_data.where.email = check_validation_data.rows[0].dataValues.ref_email;
                                update_user_data.data = {};
                                update_user_data.data.is_email_verified = 1;
                                // console.log('****************************', update_user_data)
                                GenericRepository.updateData(update_user_data).then(update_user_result=>{
                                    check_link.is_expired = 1;
                                    check_link.is_verified = 1;
                                    resolve(check_link);
                                }).catch(update_user_err=>{
                                    console.log(493, update_user_err);
                                    return res.send({status:500, message:'Something went wrong'});
                                })

                            }).catch(check_validation_err=>{
                                console.log(check_validation_err);
                            })
                        }
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err);
                })
            })
            return res.send({status:200, message:'Email is verified successfully', purpose:'To verify email account of a newly registered client or consultant', data:check_link});
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}



// }

/**generateOtp API
method:POST
input:body[phone, country_code, role]
output:data,
purpose:To generate OTP.
*/
/**
     * To generate OTP with respect to `phone`, `country_code`, `role`
     * @param {Number} `role` 
     * @param {String} `phone`, `country_code` 
     * @return {data} data
*/
publicVar.generateOtp = (req, res, next) => {
  (async()=>{
      let check_phone_exists = await new Promise((resolve, reject)=>{
        let get_user_details = {};
        get_user_details.table = 'user';
        get_user_details.where = {};
        get_user_details.where.phone = req.body.phone;
        get_user_details.where.is_phone_verified = 1;
        GenericRepository.fetchData(get_user_details).then(get_user_result=>{
            if(get_user_result.rows.length > 0){
                return res.send({status:409, message:'Phone Number Already Exists'});
            }
            else{
                resolve();
            }
        }).catch(get_user_err=>{
            console.log(get_user_err);
            return res.send({status:500, message:'Something went wrong'});
        })
      }).then(result=>{
          return result;
      }).catch(err=>{
          console.log(545, err);
          return res.send({status:500, message:'Something went wrong'});
      })
      let expire_previous_otps = await new Promise(function(resolve, reject){
          let check_previous_otp;
          let validation_data = {};
          validation_data.table = 'validation';
          validation_data.where = {};
          validation_data.where.phone = req.body.phone;
          validation_data.where.country_code = "+968";
          validation_data.where.role = req.body.role;
          GenericRepository.fetchData(validation_data).then(validation_result=>{
              if(validation_result.rows.length > 0){
                  let update_validation_data = {};
                  update_validation_data.table = 'validation';
                  update_validation_data.where = {};
                  update_validation_data.data = {};
                  update_validation_data.where.phone = req.body.phone;
                  update_validation_data.where.country_code = "+968";
                  update_validation_data.where.role = req.body.role;
                  update_validation_data.data.is_expired = 1;
                  GenericRepository.updateData(update_validation_data).then(update_validation_result=>{
                      resolve();
                  }).catch(update_validation_err=>{
                      console.log(update_validation_err);
                      return res.send({status:500, message:'Something went wrong'});
                  })
              }
              else{
                  resolve()
              }
          }).catch(validation_err=>{
            console.log(validation_err);
            return res.send({status:500, message:'Something went wrong'});
          })
      }).then(result=>{
          return result;
      }).catch(err=>{
          console.log(err);
          return res.send({status:500, message:'Something went wrong'});
      })
      let generate_otp = await new Promise(function(resolve, reject){
          let generate_otp;
          commonFunnction.getRandomNumber(4).then((randNum) => {
            var textbody = "eBinaa : Your signup OTP is : "+randNum;
            // var mobnumber = req.body.country_code+req.body.phone;
            let otp_data = {};
            otp_data.table = 'validation';
            otp_data.data = {};
            otp_data.data.phone = req.body.phone;
            otp_data.data.country_code = "+968";
            otp_data.data.otp = randNum;
            otp_data.data.role = req.body.role;
            otp_data.data.validation_type = 'otp';
            GenericRepository.createData(otp_data).then(otp_result=>{
                console.log(otp_result);
                resolve(otp_result)
                var number=96894866684;


                // var mobnumber = req.body.country_code+req.body.phone;
                var mobnumber = "+968"+req.body.phone;
              let data = {
                  "msg" : textbody,
                  "sender":"96894866684",
                 
                  "to" : mobnumber,
                
                
                  }
                  sendMessage(data);

            }).catch(otp_err=>{
              console.error('Error :', otp_err)
        
              res.json({
                status: 500,
                message: 'Something went wrong'
              }) 
            })
        
        })

      }).then(result=>{
          return result;
      }).catch(err=>{
        console.log(err);
        return res.send({status:500, message:'Something went wrong'});
      })
      return res.send({status:201, message:'OTP is sent successfully',purpose:'otp is sent sucessfully'});
  })()

  
}

/**verify_otp API
method:POST
input:body[phone, country_code, role]
output:data,
purpose:To verify OTP.
*/
/**
     * To verify OTP with respect to `phone`, `country_code`, `role`, `otp`
     * @param {Number} `role`, `otp` 
     * @param {String} `phone`, `country_code` 
     * @return {data} data
*/
publicVar.verify_otp = function(req, res){
    (async()=>{
        let site_settings_data = await new Promise(function(resolve, reject){
            let site_settings_data;
            let validation_data = {};
            validation_data.table = 'site_setting';
            validation_data.where = {};
            GenericRepository.fetchData(validation_data).then(validation_result=>{
                site_settings_data = validation_result;
                resolve(site_settings_data);
            }).catch(validation_err=>{
                console.log(validation_err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, msg:'Something went wrong',message:'Something went wrong'});
        })
        let check_is_otp_expired = await new Promise(function(resolve, reject){
            let fetch_otp_data = {};
            fetch_otp_data.table = 'validation';
            fetch_otp_data.where = {};
            fetch_otp_data.where.phone = req.body.phone;
            fetch_otp_data.where.country_code = "+968";
            fetch_otp_data.where.is_expired = 0;
            GenericRepository.fetchData(fetch_otp_data).then(fetch_otp_result=>{
                if(fetch_otp_result.rows.length > 0){
                    let now  = moment().utc().format('YYYY-MM-DD HH:mm:ss');
                    let then = moment(fetch_otp_result.rows[0].dataValues.createdAt).utc().format('YYYY-MM-DD HH:mm:ss');

                    let time_diff = moment.duration(moment(now).diff(moment(then))).asSeconds();
                    console.log('******** now ********', now);
                    console.log('******** then ********', then);
                    console.log('****** time_diff *****', time_diff);
                    // if(time_diff > (site_settings_data.rows[0].dataValues.otp_validity * 60)){
                        if(time_diff > (site_settings_data.rows[0].dataValues.otp_validity * 60)){
                        let update_otp_data = {};
                        update_otp_data.table = 'validation';
                        update_otp_data.where = {};
                        update_otp_data.data = {};
                        update_otp_data.where.phone = req.body.phone;
                        update_otp_data.where.country_code = "+968";
                        update_otp_data.where.role = req.body.role;
                        update_otp_data.where.validation_type = 'otp';
                        update_otp_data.where.is_expired = 0;
                        update_otp_data.data.is_expired = 1;
                        GenericRepository.updateData(update_otp_data).then(update_otp_result=>{
                            return res.send({status:403, msg:'Your OTP is expired, please generate another OTP', message:'Your OTP is expired, please generate another OTP', otp_verified_data:0})

                        }).catch(update_otp_err=>{
                            console.log(update_otp_err);
                            return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                        })
                    }
                    else{
                        resolve();
                    }
                }
                else{
                    return res.send({status:404, msg:'OTP does not found', message:'OTP does not found', otp_verified_data:0})

                }

                ///////
            }).catch(fetch_otp_err=>{
                console.log(fetch_otp_err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, msg:'Something went wrong',message:'Something went wrong'});
        })
        let otp_verify_process = await new Promise(function(resolve, reject){
            let check_data = {};
            check_data.table = 'validation';
            check_data.where = {};
            check_data.where.phone = req.body.phone;
            check_data.where.country_code = "+968";
            check_data.where.role = req.body.role;
            check_data.where.otp = req.body.otp;
            check_data.where.validation_type = 'otp';
            check_data.where.is_expired = 0;
            GenericRepository.fetchData(check_data).then(check_result=>{
                if(check_result.rows.length > 0){
                    /////OTP matched/////
                    let updateData = {};
                    updateData.table = 'validation';
                    updateData.where = {};
                    updateData.data = {};
                    updateData.where.phone = req.body.phone;
                    updateData.where.country_code = "+968";
                    updateData.where.role = req.body.role;
                    updateData.where.otp = req.body.otp;
                    updateData.where.validation_type = 'otp';
                    updateData.where.is_expired = 0;
                    updateData.data.is_expired = 1;
                    updateData.data.is_verified = 1;
                    GenericRepository.updateData(updateData).then(update_result=>{
                        return res.send({status:200, msg:'OTP is verified successfully', message:'OTP is verified successfully', otp_verified_data:1});
                    }).catch(update_err=>{
                        console.log(update_err);
                        return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                    })  
                }
                else{
                    /////////OTP mismatched///////
                    let fetch_otp_data = {};
                    fetch_otp_data.table = 'validation';
                    fetch_otp_data.where = {};
                    fetch_otp_data.where.phone = req.body.phone;
                    fetch_otp_data.where.country_code = "+968";
                    fetch_otp_data.where.is_expired = 0;
                    GenericRepository.fetchData(fetch_otp_data).then(fetch_otp_result=>{
                        if(fetch_otp_result.rows.length > 0){
                            let now  = moment().utc().format('YYYY-MM-DD HH:mm:ss');
                            let then = moment(fetch_otp_result.rows[0].dataValues.createdAt).utc().format('YYYY-MM-DD HH:mm:ss');

                            let time_diff = moment.duration(moment(now).diff(moment(then))).asSeconds();
                            console.log('******** now ********', now);
                            console.log('******** then ********', then);
                            console.log('****** time_diff *****', time_diff);
                            if(time_diff > (site_settings_data.rows[0].dataValues.otp_validity * 60)){
                                let update_otp_data = {};
                                update_otp_data.table = 'validation';
                                update_otp_data.where = {};
                                update_otp_data.data = {};
                                update_otp_data.where.phone = req.body.phone;
                                update_otp_data.where.country_code = "+968";
                                update_otp_data.where.role = req.body.role;
                                update_otp_data.where.validation_type = 'otp';
                                update_otp_data.where.is_expired = 0;
                                update_otp_data.data.is_expired = 1;
                                GenericRepository.updateData(update_otp_data).then(update_otp_result=>{
                                    return res.send({status:403, msg:'Your OTP is expired, please generate another OTP', message:'Your OTP is expired, please generate another OTP', otp_verified_data:0})
    
                                }).catch(update_otp_err=>{
                                    console.log(update_otp_err);
                                    return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                                })
                            }
                            else{
                                return res.send({status:404, msg:'Incorrect OTP',message:'Incorrect OTP', otp_verified_data:0});
                            }
                        }
                        else{
                            return res.send({status:404, msg:'OTP does not found', message:'OTP does not found', otp_verified_data:0})

                        }

                        ///////
                    }).catch(fetch_otp_err=>{
                        console.log(fetch_otp_err);
                        return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                    })
                }
            }).catch(check_err=>{
                console.log(check_err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
        })

    })()
}

/**login API
method:POST
input:body[email, password],
output:data,
purpose:To login for admin.
*/
// publicVar.login = async function(req, res){
//     let data = {};
//     data.table = 'user';
//     data.where = {};
//     // data.where.is_active = 1;
//     data.where.is_delete = 0;


//     if(req.body.facebook_id || req.body.google_plus_id){

//         if(req.body.facebook_id){
//             data.where.facebook_id = req.body.facebook_id;
//         }
//         else{
//             data.where.google_plus_id = req.body.google_plus_id;
//         }
//     }
//     else{
//         var passcode = md5(req.body.password);
//         data.where.email = req.body.email;
//         data.where.user_type = req.body.user_type;
//         data.where.password = passcode;

//     }
//     console.log(data);
//    return GenericRepository.fetchData(data).then((user) => {
//      //  console.log(user.rows.length)

//        if (user.rows.length > 0) {
//         if(user.rows[0].dataValues.is_email_verified == 0){
//             return res.send({status:401, message:'Use your mobile number to access your profile'});
//         }
//         else if(user.rows[0].dataValues.is_active == 0){
//             return res.send({status:401, message:'User is deactivated'});
//         }
//         else{
//             CommonValidationMiddleware.generateRefreshAndAccessToken(data.table, user.rows[0].id).then(async (token) =>   {
//                 var data = {};
//                 data.access_token = token.accessToken
//                 data.refresh_token = token.refreshToken
//                 data.role = 'user';
//                 if(user.rows[0].is_complete === 0 && user.rows[0].user_type == 3){
//                     var message = "Incomplete Signup.Please fillup the all required Fields";
//                 }else{
//                     var message = "Logged in successfully";
//                 }

//                 if(user.rows[0].user_type==3){
//                     let project_bid={};
//                     project_bid.table='project_bids',
//                     project_bid.where={contractor_id:user.rows[0].id};
//                     let project_bid_fetch=await GenericRepository.fetchData(project_bid);
//                     console.log(project_bid_fetch);
//                     data.bid_count=project_bid_fetch.rows.length;

//                 }
//                 data.is_complete = user.rows[0].is_complete;
//                 data.id = user.rows[0].id;
//                 data.user_type=user.rows[0].user_type;
//                 data.status=user.rows[0].status;
//                 data.email=user.rows[0].email;
//                 data.full_name=user.rows[0].full_name;
//               //   data.user_type = req.body.user_type;
//                 res.json({
//                   status: 200,
//                   message: message,
//                   is_registered: 1,
//                   data: data
//                 })

//           }).catch((err) => {
//                 console.error('59 ERROR :', err)
//                 res.json({
//                   status: 500,
//                   message: 'Something went wrong'
//                 })
//           })

//         }

  
//     }
//         let by_phone_login_data = {};
//         by_phone_login_data.table = 'user';
//         by_phone_login_data.where = {};
//         by_phone_login_data.where.phone = req.body.email;
//         by_phone_login_data.where.user_type = req.body.user_type;
//         by_phone_login_data.where.password = passcode;
//         by_phone_login_data.where.is_active = 1;
//         by_phone_login_data.where.is_delete = 0;
//         return GenericRepository.fetchData(by_phone_login_data).then(by_phone_login_result=>{
//             if(by_phone_login_result.rows.length > 0){
//                 if(by_phone_login_result.rows[0].dataValues.is_phone_verified == 0){
//                     return res.send({status:401, message:'Your phone is not verified. Please verify your phone to sign in with phone'});
//                 }
                
//                 CommonValidationMiddleware.generateRefreshAndAccessToken(data.table, by_phone_login_result.rows[0].id).then(async (token) =>   {
//                       let data = {};
//                       data.access_token = token.accessToken
//                       data.refresh_token = token.refreshToken
//                       data.role = 'user'
//                       data.user_type = req.body.user_type;

//                       if(by_phone_login_result.rows[0].user_type==3){
//                         let project_bid={};
//                         project_bid.table='project_bids',
//                         project_bid.where={contractor_id:by_phone_login_result.rows[0].id};
//                         let project_bid_fetch=await GenericRepository.fetchData(project_bid);
//                         console.log(project_bid_fetch);
//                         data.bid_count=project_bid_fetch.rows.length;
    
//                     }
                       
//                        if(by_phone_login_result.rows[0].is_complete === 0 && by_phone_login_result.rows[0].user_type == 3 ){
//                             var message = "Incomplete Signup.Please fillup the all required Fields";
//                         }else{
//                             var message = "Logged in successfully";
//                         }

//                         data.is_complete = by_phone_login_result.rows[0].is_complete;
//                         data.id = by_phone_login_result.rows[0].id;
//                         data.email=by_phone_login_result.rows[0].email;
//                         data.full_name=by_phone_login_result.rows[0].full_name;
//                       res.json({
//                         status: 200,
//                         message: message,
//                         is_registered: 1,
//                         data: data
//                       })
//                 }).catch((err) => {
//                       console.error('59 ERROR :', err)
//                       res.json({
//                         status: 500,
//                         message: 'Something went wrong'
//                       })
//                 })

//             }
//             else{
//                 return  res.json({
//                     status: 404,
//                     message: "Please Provide a valid credentials"
//                 })
//             }
//         }).catch(by_phone_login_err=>{
//             console.log(by_phone_login_err);
//             return res.send({status:500, message:'Something went wrong'});
//         })


//         // return  res.json({
//         //   status: 0,
//         //   msg: "Please Provide a valid credentials"
//         // })
  
    
//     }).catch((err) => {
//       console.error('123 ERROR :', err)
//       res.json({
//         status: 500,
//         message: 'An error occured'
//       })
//     })
// }

publicVar.login = async function(req, res){
    var passcode=md5(req.body.password);

    let by_phone_login_data = {};
    by_phone_login_data.table = 'user';
    by_phone_login_data.where = {};
    by_phone_login_data.where.phone = req.body.email;
    by_phone_login_data.where.user_type = req.body.user_type;
    by_phone_login_data.where.password = passcode;
    //by_phone_login_data.where.is_delete = 0;
    return GenericRepository.fetchData(by_phone_login_data).then(by_phone_login_result=>{
        if(by_phone_login_result.rows.length > 0){
            if(by_phone_login_result.rows[0].dataValues.is_active == 0){
                return res.send({status:401, message:'User is not active'});  
            }
            if(by_phone_login_result.rows[0].dataValues.is_delete== 1){
                return res.send({status:401, message:'User is deleted'});  
            }
            if(by_phone_login_result.rows[0].dataValues.is_phone_verified == 0){
                return res.send({status:401, message:'Your phone is not verified. Please verify your phone to sign in with phone'});
            }
            
            CommonValidationMiddleware.generateRefreshAndAccessToken(by_phone_login_data.table, by_phone_login_result.rows[0].id).then(async (token) =>   {
                  let data = {};
                  data.access_token = token.accessToken
                  data.refresh_token = token.refreshToken
                  data.role = 'user'
                  data.user_type = req.body.user_type;
                  if(by_phone_login_result.rows[0].user_type==3){
                    let project_bid={};
                    project_bid.table='project_bids',
                    project_bid.where={contractor_id:by_phone_login_result.rows[0].id};
                    let project_bid_fetch=await GenericRepository.fetchData(project_bid);
                    console.log(project_bid_fetch);
                    data.bid_count=project_bid_fetch.rows.length;
                }
                       
                if(by_phone_login_result.rows[0].is_complete === 0 && by_phone_login_result.rows[0].user_type == 3 ){
                     var message = "Incomplete Signup.Please fillup the all required Fields";
                 }else{
                     var message = "Logged in successfully";
                 }
                 data.is_complete = by_phone_login_result.rows[0].is_complete;
                 data.id = by_phone_login_result.rows[0].id;
                 data.email=by_phone_login_result.rows[0].email;
                 data.full_name=by_phone_login_result.rows[0].full_name;
               res.json({
                 status: 200,
                 message: message,
                 is_registered: 1,
                 data: data
               })
         }).catch((err) => {
               console.error('59 ERROR :', err)
               res.json({
                 status: 500,
                 message: 'Something went wrong'
               })
         })
     }
     else{
         return  res.json({
             status: 404,
             message: "Please Provide a valid credentials"
         })
     }
 }).catch(by_phone_login_err=>{
     console.log(by_phone_login_err);
     return res.send({status:500, message:'Something went wrong'});
 })
}

/**log_out API
method:POST
input:body[refreshToken]
output:data,
purpose:To log out for admin and user both.
*/
/**
     * To verify OTP with respect to `refreshToken`, `x-access-token`
     * @param {String} `refreshToken`, `x-access-token` 
     * @return {data} data
*/
publicVar.logOut = function(req, res){
    (async()=>{
        let log_out = await new Promise(function(resolve, reject){
            let log_out_data = {};
            log_out_data.table = 'refresh_token';
            log_out_data.where =  {};
            log_out_data.data = {};
            log_out_data.where.refreshToken = req.body.refreshToken;
            log_out_data.data.isExpire = 1;
            GenericRepository.updateData(log_out_data).then(log_out_result=>{
                resolve();
            }).catch(log_out_err=>{
                console.log(435, log_out_err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});

            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
        })
        return res.send({status:200, msg:'Logged out successfully', message:'Logged out successfully',purpose:'log out',data:[]});
    })()
}

/**log_out API
method:POST
input:body[slug]
output:data,
purpose:To get the cms page data on the basis of slug.
*/
/**
     * @param {String} `refreshToken`, `x-access-token` 
     * @return {data} data
*/

publicVar.get_cms_page = function(req, res){
 
    (async()=>{

      try{

          let check_data = {};
          check_data.table = 'cms';
          check_data.where = {slug:'our-story'};

          let duplicate_user_check = await GenericRepository.fetchData(check_data)

          res.send({status:200, message:'cms pages',purpose:'cms pages',data:duplicate_user_check});

      } catch(err){

          res.send({status:500, err:err});

      }

    })()
    
}



/**get homepage info API
method:POST
input:body[]
output:data,
purpose:To get the cms page data(information).
*/
/**
     * @param {String} `refreshToken`, `x-access-token` 
     * @return {data} data
*/

publicVar.get_info_data = function(req, res){

    (async()=>{

      try{

          let check_data = {};
          check_data.table = 'site_setting';
          check_data.where = {};
          check_data.attributes = ['max_tender_submission_limit','admin_contact','admin_email','facebook_link','linkedin_link','twitter_link','instagram_link','partner_text','service_text'];
          let site_settings = await GenericRepository.fetchDataWithAttributes(check_data)
 
          res.send({status:200, message:'site settings data',purpose:'site settings data',data:site_settings});

      } catch(err){

          res.send({status:500, err:err});

      }

    })()
    
}


/**
api name: Article Additions
method:POST
input:body[title, description,data,is_draft],
output:data,
purpose:article data update.
author:anirban das
*/

publicVar.updateArtical=(req,res)=>{
  let information={};
  information.table='articles';
  information.data={
    title:req.body.title,
    writer:req.body.writer,
    writer_name:req.body.writer_name,
    data:req.body.data,
    is_draft:req.body.is_draft,
  }
  information.where= {id:req.body.id};

  GenericRepository.updateData(information).then((result)=>{
    res.json({  status:200,  msg:'article data updated',  message:'article data updated successfully' ,purpose: "article data update" })
  
  }).then((err)=>{
    console.trace(err);
    res.json({ status:500, msg:'an error occured', message:'an error occured' })
  })
}

/**
api name: viewArticle
method:GET
input:Query[page, limit, search_text],
output:data,
purpose:frontend article fetching.
author:anirban das
*/

publicVar.viewArticle=(req,res)=>{

  (async()=>{

    try{
      // information.table='articles';
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit*(page-1);
      let and_data = [];
      let or_data = [];
      //let where = [];
      let info={};
      let sort_by = ['createdAt', 'DESC'];
      

   
      and_data.push({is_deleted:0,is_approved:1,is_draft:0});

      if(req.query.search_text)
      {
        or_data.push({title:{$like:'%'+req.query.search_text+'%'}});
        or_data.push({writer :{$like:'%'+req.query.search_text+'%'}});
        or_data.push({data :{$like:'%'+req.query.search_text+'%'}});
      }

           if(or_data.length > 0){
             info.where= { $or:or_data,$and:and_data};
           }else{
             info.where= and_data ;
           }

     let data = await ConsultationhubRepository.fetchArticleData(info,limit,offset,sort_by)

     res.send({status:200,data:data, message:'Article data fetch successfully',purpose:"frontend article fetching"});



  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()

}


/**
api name: userForgetPassword
method:PUT
input:body[email],
output:link sent through mail,
purpose:to update password.
author:arijit saha
*/

publicVar.userForgetPassword = function(req, res){
    (async()=>{
        try{
            let get_user_details = await new Promise(function(resolve, reject){
                let get_user_details;
                let user_data = {};
                user_data.table = 'user';
                user_data.where = {};
                user_data.where.email = req.body.email;
                GenericRepository.fetchData(user_data).then(user_result=>{
                    if(user_result.rows.length > 0){
                        if(user_result.rows[0].dataValues.is_email_verified == 0){
                            return res.send({status:401, message:'Please verify the email first to receive the link to reset your password.'});
                        }
                        else{
                            get_user_details = user_result;
                            resolve(get_user_details)
                        }
                    }
                    else{
                        return res.send({status:404, message:'No user found with provided email address.'});
                    }
                }).catch(user_err=>{
                    console.log(user_err);
                })
            })
            console.log(get_user_details.rows[0].dataValues)
            if(get_user_details.rows[0].dataValues.facebook_id || get_user_details.rows[0].dataValues.google_plus_id){
                return res.send({status:200, message:'You have signed up with social media'})
            }
            else{
               
                let validation_hash = await new Promise(function(resolve, reject){
                    let validation_hash;
                    commonFunnction.getRandomString(10).then((randNum) => {
                        validation_hash = randNum;
                        resolve(validation_hash)
                      }).catch(randErr=>{
                        console.log(randErr);
                        return res.send({status:500, message:'Something went wrong'});
                      })
                    
                })
                let expire_previous_links = await new Promise(function(resolve, reject){
                    let check_validation_data = {};
                    check_validation_data.table = 'validation';
                    check_validation_data.where = {};
                    check_validation_data.where.uid = get_user_details.rows[0].dataValues.id;
                    check_validation_data.where.role = get_user_details.rows[0].dataValues.user_type;
                    check_validation_data.where.validation_type = 'forget_password';
                    // console.log('************** check_validation_data ***************',check_validation_data)
                    GenericRepository.fetchData(check_validation_data).then(check_validation_result=>{
                        if(check_validation_result.rows.length > 0){
                            let validation_update_data = {};
                            validation_update_data.table = 'validation';
                            validation_update_data.where = {}
                            validation_update_data.where.uid = get_user_details.rows[0].dataValues.id;
                            validation_update_data.where.role = get_user_details.rows[0].dataValues.user_type;
                            validation_update_data.where.validation_type = 'forget_password';
                            validation_update_data.data = {};
                            validation_update_data.data.is_expired = 1;
                            // console.log('************** validation_update_data ****************', validation_update_data)
                            GenericRepository.updateData(validation_update_data).then(validation_update_result=>{
                                let insert_validation_data = {};
                                insert_validation_data.table = 'validation';
                                insert_validation_data.data = {};
                                insert_validation_data.data.uid = get_user_details.rows[0].dataValues.id;
                                insert_validation_data.data.role = get_user_details.rows[0].dataValues.user_type;
                                insert_validation_data.data.validation_type = 'forget_password';
                                insert_validation_data.data.validation_hash = validation_hash;
                                GenericRepository.createData(insert_validation_data).then(insert_validation_result=>{
                                    resolve();
                                }).catch(insert_validation_err=>{
                                    console.log(insert_validation_err);
                                })


                            }).catch(validation_update_err=>{
                                console.log(validation_update_err);
                            })


                        }
                        else{
                            let insert_validation_data = {};
                            insert_validation_data.table = 'validation';
                            insert_validation_data.data = {};
                            insert_validation_data.data.uid = get_user_details.rows[0].dataValues.id;
                            insert_validation_data.data.role = get_user_details.rows[0].dataValues.user_type;
                            insert_validation_data.data.validation_type = 'forget_password';
                            insert_validation_data.data.validation_hash = validation_hash;
                            GenericRepository.createData(insert_validation_data).then(insert_validation_result=>{
                                resolve();
                            }).catch(insert_validation_err=>{
                                console.log(insert_validation_err);
                            })


                        }
                    }).catch(check_validation_err=>{
                        console.log(check_validation_err);

                    })
                })
                let user_details = await new Promise(function(resolve, reject){
                    let user_details = {};
                    user_details.name = get_user_details.rows[0].dataValues.full_name;
                    user_details.email = get_user_details.rows[0].dataValues.email;
                    // user_details.link = 'http://'+global.constants.WEBURL+'/ebinaa/html/reset-password/'+validation_hash;
                    user_details.link = process.env.WEBURL+'/ebinaa/html/reset-password/'+validation_hash;
                    if(get_user_details.rows[0].dataValues.user_type==1){
                        user_details.link_login=process.env.WEBURL+'/login/client'
                    }
                    if(get_user_details.rows[0].dataValues.user_type==2){
                        user_details.link_login=process.env.WEBURL+'/login/consultant'
                    }
                    if(get_user_details.rows[0].dataValues.user_type==3){
                        user_details.link_login=process.env.WEBURL+'/login/contractor'
                    }


                    resolve(user_details);
                })
                global.eventEmitter.emit('forget_password_email_link', user_details);
                return res.send({status:200, message:'A link has been sent to your email address. Verify the email to reset your password',purpose:'forgot password'})



            }




        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});

        }
    })()
}

/**
api name: getDetailsOfForgetPasswordLink
method:GET
input:body[validation_hash],
output:check the link sent through mail,
purpose:to chek link expired or not.
author:arijit saha
*/



publicVar.getDetailsOfForgetPasswordLink = function(req,res){
    (async()=>{
        try{
            let check_link_is_expired = await new Promise(function(resolve, reject){
                let get_validation_details = {}
                let check_validation_data = {};
                check_validation_data.table = 'validation';
                check_validation_data.where = {};
                check_validation_data.where.validation_hash = req.query.validation_hash;
                GenericRepository.fetchData(check_validation_data).then(async check_validation_result=>{
                    if(check_validation_result.rows.length > 0){
                        if(check_validation_result.rows[0].dataValues.is_expired == 1){
                            return res.send({status:403, message:'Link is already expired'})
                        }
                        else{
                            let data_email={};
                            data_email.table='user',
                            data_email.where={id:check_validation_result.rows[0].dataValues.uid};
                            let data_email_fetch=await GenericRepository.fetchData(data_email);
                            get_validation_details.id = check_validation_result.rows[0].dataValues.id
                            get_validation_details.uid = check_validation_result.rows[0].dataValues.uid
                            get_validation_details.role = check_validation_result.rows[0].dataValues.role
                            get_validation_details.email=data_email_fetch.rows[0].dataValues.email
                            resolve(get_validation_details);
                        }
                    }
                    else{
                        return res.send({status:404, message:'No such link exists'});
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err);
                })

            })
            return res.send({status:200, message:'Validation details', data:check_link_is_expired});

        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}
/**
api name: reset-Password
method:PUT
input:body[id,password],
output:data,
purpose:to update password.
author:arijit saha
*/



publicVar.resetPassword = function(req, res){
    (async()=>{
        try{
            let check_is_password_expired = await new Promise(function(resolve, reject){
                let check_validation_data = {};
                check_validation_data.table = 'validation';
                check_validation_data.where = {};
                check_validation_data.where.id = req.body.id;
                GenericRepository.fetchData(check_validation_data).then(check_validation_result=>{
                    if(check_validation_result.rows[0].dataValues.is_expired == 1){
                        return res.send({status:200, message:'Link is already expired'});
                    }
                    else{
                        resolve()
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err);
                })
            })
            let update_password = await new Promise(function(resolve, reject){
                let update_password_data = {};
                update_password_data.table = 'user';
                update_password_data.where = {};
                update_password_data.where.id = req.body.uid;
                update_password_data.where.user_type = req.body.user_type;
                update_password_data.data = {};
                update_password_data.data.password = md5(req.body.password);
                GenericRepository.updateData(update_password_data).then(update_password_result=>{
                    let update_validation_data = {};
                    update_validation_data.table = 'validation';
                    update_validation_data.where = {};
                    update_validation_data.where.id = req.body.id;
                    update_validation_data.data = {};
                    update_validation_data.data.is_expired = 1;
                    update_validation_data.data.is_verified = 1;
                    GenericRepository.updateData(update_validation_data).then(update_validation_result=>{
                        resolve();
                    }).catch(update_validation_err=>{
                        console.log(update_validation_err);
                    })
                }).catch(update_password_err=>{
                    console.log(update_password_err);
                })
            })
            return res.send({status:200, message:'You have successfully reset your password'}); 
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}

// publicVar.createProject = function(req, res){
//     (async()=>{
//         let create_project = await new Promise(function(resolve, reject){
//         })
//     })()
// }

/**showimage API
method:POST
input:body[limit,offset,query_type],
output:data,
purpose:to show image
created by Sayanti Nath.
*/
publicVar.showImage=(req,res)=>{
(async()=>{
      try{
          let data={};
          data.table='resources',
          data.where={},
          // data.where.is_active=1,
          data.where.is_delete=0,
          data.where.type=req.query.type
          let resImages = await GenericRepository.fetchData(data)
          res.send({status:200,message:'show image',purpose:'show image', data:resImages});
      } catch(err){
          res.send({status:500, err:err});
      }

    })()

}


/**cms-grid api
method:GET
input:body[LIMIT,OFFSET],
output:data,
purpose:to fetch the cmsgrid
created by sayanti nath
*/

publicVar.fetchCmsGrid=(req,res)=>{

let page = parseInt(req.query.page);
let limit = parseInt(req.query.limit);
var offset = limit*(page-1);

  (async()=>{

    try{

     let information={};
     information.table='cms_grids';
     information.where={is_deleted:0};
  
   
     console.log()

     let cms_table=await GenericRepository.fetchDatalimit(information,limit,offset)
     
     res.send({status:200, msg:'cms grid data fetch successfully',message:'cms grid data fetch successfully', data:cms_table});

  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()
}


/*verify-email-link api
method:PUT
input:body[VALIDATION_HASH]
output:check the validation_hash,
purpose:to check the validation_hash expired or not
created by sayanti Nath
*/


publicVar.verifyLink=(req,res)=>{

  (async()=>{

    try{
      let validations_information={};
      validations_information.table='validation',
      validations_information.where={},
      validations_information.where.validation_hash=req.query.validation_hash;
      validations_information.data={
        is_expired:1
      }
      
      let validations_fetch =await GenericRepository.fetchData(validations_information);
      if(validations_fetch.rows.length>0)
      {
        if(validations_fetch.rows[0].dataValues.is_expired == 1){
          return res.send({status:403, message:'Invitation link is already expired'});

      }
      else{


        return res.send({status:200, message:'successfull',validation_id:validations_fetch.rows[0].dataValues.id,validation_meta:validations_fetch.rows[0].dataValues.validation_meta,ref_mail:validations_fetch.rows[0].dataValues.ref_email});

      }



      }
      else{
       

        return res.send({status:404, message:'No such invitation link found'});
      }

    } catch(err){
      console.trace(err)

     res.send({status:500, message:"Interneal server error",purpose:"link check"});
      

  }

   
  })()


}

//Test Purpose//

/* test-email api
method:POST
input:body[ sender email, receivers email, Subject ]
output:massege,
purpose:to test email
created by sayanti nath
*/

publicVar.test_email = function( ){
console.log("hello");
const nodemailer = require('nodemailer'),
Q = require('q')

    console.log("hello")
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
      from: 'sayanti@unifiedinfotech.net', // sender address
      to: 'sayanti@unifiedinfotech.net', // list of receivers
      subject: "hello",// Subject line
     
  
  
    }
  
   console.log(global.constants.uploads.contract_documet+'5.pdf');
     
      mailOptions.attachments=[{
       // utf-8 string as an attachment
           
            //path: '/Users/rajdebnath/project@sayanti/ebinaa-node/uploads/contract_documet/5.pdf'
        path:global.constants.uploads.contract_documet+'5.pdf'
      }]
    
  
   
      mailOptions.text ="hii hello"
   
  
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


/* test-email api
method:POST
input:body[ email ]
output:massege[ email exist / email not exist],
purpose:to email test
created by sayanti nath
*/

publicVar.emailTest=(req,res)=>{


    (async()=>{

        try{
    
            let data={};
            data.table='user',
            data.where={
                email:req.body.email
            }
            let data_fetch=await GenericRepository.fetchData(data);
            if(data_fetch.rows.length>0){
                res.send({
                    status:403,
                    message:'email exist'
                })
            }
            else{
                res.send({
                    status:200,
                    message:'email not exist'
                })
        
            }
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()
    }
    
/*editClientProfile api
method:PUT
input:body[id, full_name, email, phone, password, company_name, relationship_with_company, phone_verified, ]
output:check the validation_hash,
purpose:to update client profile
created by anirban das
*/

publicVar.editClientProfile=(req,res)=>{


    (async()=>{

        try{


           

            let email_verify={};
            email_verify.table='user',
            email_verify.where={id:req.body.id};
            var email_verify_check=await GenericRepository.fetchData(email_verify);





            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                commonFunnction.getRandomString(10).then((randNum) => {
                  validationhash = randNum
                  resolve(validation_hash)
                }).catch(randErr=>{
                  console.log(randErr);
                  return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                })
          
              }).then(result=>{
                return result;
              }).catch(err=>{
                console.log(err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
              })
       

            if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let email={};
                email.table='user',
                email.where={email:req.body.email,user_type:1}
                let email_check=await GenericRepository.fetchData(email);
                if(email_check.rows.length>0){
                    return res.send({status:409,message:'Email is already exist'})
                }

            }


    
            let info={};
            info.table='user',
            info.where={id:req.body.id};
            info.data=
            {

                full_name:req.body.full_name
            }
           

            if(req.body.phone){
                info.data.phone	=req.body.phone;
                
            }

            if(req.body.password){
                info.data.password=md5(req.body.password);
            }


            if(req.body.company_name){
                info.data.company_name=req.body.company_name
            }

            if(req.body.relationship_with_company){
                info.data.relationship_with_company=req.body.relationship_with_company
            }
            
            if(req.body.phone_verified){
                info.data.is_phone_verified=req.body.phone_verified

            }

            if(req.body.phone_verified==0){
                var validations={};
                validations.table='validation',
                validations.where={
                    phone:req.body.phone,
                    role:req.body.role
                }
                let validations_fetch=await GenericRepository.fetchData(validations);
                if(validations_fetch.rows.length>0){
                    validations.data={
                        is_verified:0
                    }

                    let validations_update=await GenericRepository.updateData(validations);

                }
            }


            if(req.files.upload){
            let url=global.constants.IMG_URL.client_profile_photo_url+req.files.upload[0].filename;

            let info={};
            info.table='resources',

            info.where={user_id:req.body.id,type:'client_profile_photo'}
            let fetch=await GenericRepository.fetchData(info);


        
            
            info.data={
                user_id:req.user_id,
                resource_type:'file',
                resource_url:url,
                type:'client_profile_photo'
            }

            if(fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
            }
            else{
                let resource_create=await GenericRepository.createData(info)
            }
        }
        

            console.log(req.body);
            
            let user_update=await GenericRepository.updateData(info);

            if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let validation_data = {};
                validation_data.table = 'validation';
                validation_data.data = {};
                validation_data.data.uid = req.body.id;
                validation_data.data.role = req.body.user_type;
                validation_data.data.validation_type = 'email';
                validation_data.data.validation_hash = validationhash;
                validation_data.data.ref_email = req.body.email;
                await GenericRepository.createData(validation_data);
                    let create_user_data = {};
                    create_user_data.name = user_update.dataValues.full_name;
                    create_user_data.email = req.body.email;
                    create_user_data.link = process.env.WEBURL+'/mail-verified/'+validationhash;//change the url here
                    global.eventEmitter.emit('account_activation_email_link', create_user_data);
                  
            }


            res.send({status:200,message:'updated',purpose:'edit client profile',validation_hash:validationhash});
    
        } catch(err){
        console.trace(err)
    
            res.send({status:500, err:err});
    
        }
    
        
        })()

}


/*editConsultantProfile api
method:PUT
input:body[id, full_name, email, phone, password, company_name, relationship_with_company, phone_verified, ]
output:check the validation_hash,
purpose:to update client profile
created by anirban das
*/


publicVar.editConsultantProfile=(req,res)=>{


    (async()=>{

        try{


         


            let email_verify={};
            email_verify.table='user',
            email_verify.where={id:req.body.id};
            var email_verify_check=await GenericRepository.fetchData(email_verify);



            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                commonFunnction.getRandomString(10).then((randNum) => {
                  validationhash = randNum
                  resolve(validation_hash)
                }).catch(randErr=>{
                  console.log(randErr);
                  return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                })
          
              }).then(result=>{
                return result;
              }).catch(err=>{
                console.log(err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
              })
       


              if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let email={};
                email.table='user',
                email.where={email:req.body.email,user_type:2}
                let email_check=await GenericRepository.fetchData(email);
                if(email_check.rows.length>0){
                    return res.send({status:409,message:'Email is already exist'})
                }

            }

    
            let info={};
            info.table='user',
            info.where={id:req.body.id};
            info.data=
            {

                full_name:req.body.full_name
            }
            

            if(req.body.phone){
                info.data.phone	=req.body.phone;
                //info.data.is_phone_verified=0
            }

            if(req.body.password){
                info.data.password=md5(req.body.password);
            }


            if(req.body.company_name){
                info.data.company_name=req.body.company_name
            }

            if(req.body.relationship_with_company){
                info.data.relationship_with_company=req.body.relationship_with_company
            }
            
            if(req.body.phone_verified){
                info.data.is_phone_verified=req.body.phone_verified

            }

            if(req.body.phone_verified==0){
                var validations={};
                validations.table='validation',
                validations.where={
                    phone:req.body.phone,
                    role:req.body.role
                }
                let validations_fetch=await GenericRepository.fetchData(validations);
                if(validations_fetch.rows.length>0){
                    validations.data={
                        is_verified:0
                    }

                    let validations_update=await GenericRepository.updateData(validations);

                }
            }


       

        let admin_consultant_data = {};
        admin_consultant_data.table = 'admin_consultants';
        admin_consultant_data.data = {};
        admin_consultant_data.where={user_id:req.body.id};
       // let fetch_data=await GenericRepository.fetchData(admin_consultant_data)

        if(req.body.company_name)
        {
        admin_consultant_data.data.company_name = req.body.company_name;
        }


        // if(req.body.email){
        // admin_consultant_data.data.email = req.body.email;
        // }

        if(req.body.phone==''){
            admin_consultant_data.data.phone = req.body.phone;
            }
        if(req.body.phone){
        admin_consultant_data.data.phone = req.body.phone;
        }
        if(req.body.facebook_link==''){
            admin_consultant_data.data.facebook_link = req.body.facebook_link;
        }
        if(req.body.facebook_link){
            admin_consultant_data.data.facebook_link = req.body.facebook_link;
        }

        if(req.body.linkedIn_link==''){
            admin_consultant_data.data.linkedIn_link = req.body.linkedIn_link;
        }
        if(req.body.linkedIn_link){
            admin_consultant_data.data.linkedIn_link = req.body.linkedIn_link;
        }
        if(req.body.instagram_link==''){
            admin_consultant_data.data.instagram_link = req.body.instagram_link;
        }
        if(req.body.instagram_link){
            admin_consultant_data.data.instagram_link = req.body.instagram_link;
        }
        if(req.body.website_link==''){
            admin_consultant_data.data.website_link = req.body.website_link;
        }
        if(req.body.website_link){
            admin_consultant_data.data.website_link = req.body.website_link;
        }
        if(req.body.pinterest_link==''){
            admin_consultant_data.data.pinterest_link = req.body.pinterest_link;
        }
        if(req.body.pinterest_link){
            admin_consultant_data.data.pinterest_link = req.body.pinterest_link;
        }
        if(req.body.whatsapp_no==''){
            admin_consultant_data.data.whatsapp_no = null;
        }
        if(req.body.whatsapp_no){
            admin_consultant_data.data.whatsapp_no = req.body.whatsapp_no;
        }
        if(req.body.company_profile==''){
            admin_consultant_data.data.company_profile = req.body.company_profile;
        }
       
        if(req.body.company_profile){
            admin_consultant_data.data.company_profile = req.body.company_profile;
        }
        if(req.body.established_year){
            admin_consultant_data.data.established_year= req.body.established_year;
        }
       

        let admin_consultant_update=await GenericRepository.updateData(admin_consultant_data);



        if(req.body.company_services){
            let company_services={};
            company_services=req.body.company_services;


      
            company_services.forEach(async(item,index,arr)=>{
                console.log(item);
                if(item.company_services_id){
                let company_services_data = {};
                company_services_data.table = 'company_services';
                company_services_data.data = {};
                company_services_data.where={id: item.company_services_id}
                company_services_data.data.Service_name =  item.Service_name;  
                company_services_data.data.Service_description = item.Service_description;
               let comapny_eng_update=await GenericRepository.updateData(company_services_data)
            }
            else{

                let company_services_data_add= {};
                company_services_data_add.table = 'company_services';
                company_services_data_add.data = {};
                company_services_data_add.data.user_id = req.body.admin_consultant_id;
                company_services_data_add.data.user_type = 1;
                company_services_data_add.data.Service_name =  item.Service_name;  
                company_services_data_add.data.Service_description = item.Service_description;
               let comapny_eng_update=await GenericRepository.createData(company_services_data_add)



            }
            })
        
       

       
    }

    if(req.body.company_services_delete){
       


       
            var data={};
             data=req.body.company_services_delete;
            data.forEach(async(item,index,arr)=>{
                let company_services_data_delete = {};
                company_services_data_delete.table = 'company_services';
                company_services_data_delete.data = {};
                company_services_data_delete.where={id:item.id}
                company_services_data_delete.data.is_deleted=1;

                console.log(company_services_data_delete);
               
               
                let services_data=await GenericRepository.updateData(company_services_data_delete)
            })

       
    }


    if(req.body.remove_compnay_engineer_ids){
       


       
        var data_delete={};
        data_delete=req.body.remove_compnay_engineer_ids;
        data_delete.forEach(async(item,index,arr)=>{
            console.log('item',item);
            let company_engineers_data_delete = {};
            company_engineers_data_delete.table = 'company_engineers';
            company_engineers_data_delete.data = {};
            company_engineers_data_delete.where={id:item}
            company_engineers_data_delete.data.is_deleted=1;

            
           
            let engineers_data=await GenericRepository.updateData(company_engineers_data_delete)
        })

   
}




    if(req.body.company_engineers){
        console.log('hello');

       
            let company_engineers={};
            company_engineers=req.body.company_engineers;
            company_engineers.forEach(async(item,index,arr)=>{
                // console.log(JSON.parse(req.body.company_engineers)[i]);
                //// now Each item here ////

                if(item.id){
              console.log('company engs',item);


                let company_engineer_update_data = {};
                company_engineer_update_data.table = 'company_engineers';
                company_engineer_update_data.where = {};
                company_engineer_update_data.where.id = parseInt(item.id);
                company_engineer_update_data.data = {};
                if(item.name){
                    company_engineer_update_data.data.name = item.name;
                }
                if(item.type){
                    company_engineer_update_data.data.type = item.type;
                }
                if(item.linkedIn_profile){
                    company_engineer_update_data.data.linkedIn_profile = item.linkedIn_profile;
                }
                if(item.facebook_profile){
                    company_engineer_update_data.data.facebook_profile = item.facebook_profile;
                }

                if(item.instagram_profile){
                    company_engineer_update_data.data.instagram_profile =item.instagram_profile;
                }
                let company_engineers_update=await GenericRepository.updateData(company_engineer_update_data)

                    let update_resource_data = {};
                    update_resource_data.table = 'resources';
                    update_resource_data.where = {};
                    update_resource_data.where.id = {$in:item.resource_ids};
                    update_resource_data.data = {};
                    update_resource_data.data.user_id = parseInt(item.id);
                    let resources_one=await GenericRepository.updateData(update_resource_data)

                        let delete_previous_resource_data = {};
                        delete_previous_resource_data.table = 'resources';
                        delete_previous_resource_data.where = {};
                        delete_previous_resource_data.data = {};
                        delete_previous_resource_data.where.user_id = parseInt(item.id);
                        delete_previous_resource_data.where.type = {$in:['company_engineer_cv','company_engineer_profile_photo']};
                        delete_previous_resource_data.where.id = {$notIn:item.resource_ids};
                        delete_previous_resource_data.data.user_id = 0;//
                        delete_previous_resource_data.data.is_active = 0;
                        delete_previous_resource_data.data.is_delete = 1;
                        let resources=await GenericRepository.updateData(delete_previous_resource_data)
            }
            else{


                console.log('company engs',item);
                let company_engineer_add_data = {};
                company_engineer_add_data.table = 'company_engineers';
                company_engineer_add_data.data = {};
                company_engineer_add_data.data.user_id = req.body.admin_consultant_id;
                company_engineer_add_data.data.user_type = 1;
                if(item.name){
                    company_engineer_add_data.data.name = item.name;
                }
                if(item.type){
                    company_engineer_add_data.data.type = item.type;
                }
                if(item.linkedIn_profile){
                    company_engineer_add_data.data.linkedIn_profile = item.linkedIn_profile;
                }
                if(item.facebook_profile){
                    company_engineer_add_data.data.facebook_profile = item.facebook_profile;
                }

                if(item.instagram_profile){
                    company_engineer_add_data.data.instagram_profile =item.instagram_profile;
                }
                let company_engineers_add=await GenericRepository.createData(company_engineer_add_data)

                    let update_resource_data = {};
                    update_resource_data.table = 'resources';
                    update_resource_data.where = {};
                    update_resource_data.where.id = {$in:item.resource_ids};
                    update_resource_data.data = {};
                    update_resource_data.data.user_id = parseInt(company_engineers_add.dataValues.id);
                    let resources_one=await GenericRepository.updateData(update_resource_data)
            }

                    if(req.body.project_image_ids){
                        let delete_data={};
                        delete_data.table='resources';
                        delete_data.where={user_id:req.body.admin_consultant_id, type : 'admin_consultant_project'};
                        delete_data.data={
                            is_delete:1
                        }
                        let delete_previous_projects=await GenericRepository.updateData(delete_data);

                        let update_resource_data = {};
                        update_resource_data.table = 'resources';
                        update_resource_data.where = {};
                        update_resource_data.where.id = {$in:req.body.project_image_ids}
                        // update_resource_data.where.id = req.body.project_image_ids
                        update_resource_data.data = {};
                        update_resource_data.data.user_id = req.body.admin_consultant_id;
                        update_resource_data.data.is_delete=0;
                        let resource_update=await GenericRepository.updateData(update_resource_data)
                    }

            
                    
                
                // if(i == JSON.parse(req.body.company_engineers).length - 1){
                //     resolve()
                // }
        
        

            console.log(req.body);
            
            let user_update=await GenericRepository.updateData(info);

            if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let validation_data = {};
                validation_data.table = 'validation';
                validation_data.data = {};
                validation_data.data.uid = req.body.id;
                validation_data.data.role = req.body.user_type;
                validation_data.data.validation_type = 'email';
                validation_data.data.validation_hash = validationhash;
                validation_data.data.ref_email = req.body.email;
                await GenericRepository.createData(validation_data);
                    let create_user_data = {};
                    create_user_data.name = user_update.dataValues.full_name;
                    create_user_data.email = req.body.email;
                    create_user_data.link = process.env.WEBURL+'/mail-verified/'+validationhash;//change the url here
                    global.eventEmitter.emit('account_activation_email_link', create_user_data);
                  
            }
            })
        }

            res.send({status:200,message:'updated',purpose:'edit consultant profile',validation_hash:validationhash})


    
        } catch(err){
        console.trace(err)
    
            res.send({status:500, err:err});
    
        }
    
        
        })()

}

/*fetchUser api
method:GET
input:headers[x-access-token]
output:userdetails,
purpose:to view client 's own profile
created by anirban das
*/

publicVar.fetchUser=(req,res)=>{


    (async()=>{

        try{
    
            let data={};
            data.table='user'
            data.where={id:req.user_id};
            data.attributes = ['full_name','email','phone','is_email_verified','is_phone_verified','facebook_id','google_plus_id']
            let fetch_user=await GenericRepository.fetchDataWithAttributes(data);

            let info={};
        
            info.table='resources',
            info.where={user_id:req.user_id,type:'client_profile_photo'}
            let fetch=await GenericRepository.fetchData(info);


            res.send({status:200,profile_photo:fetch,data:fetch_user,message:'data fetched',purpose:'user fetch'})
    
        } catch(err){
        console.trace(err)
    
            res.send({status:500, err:err});
    
        }
    
        
        })()
    

}

/*fetchConsultant api
method:GET
input:headers[x-access-token]
output:userdetails,
purpose:to view Consultant 's own profile
created by anirban das
*/

publicVar.fetchConsultant=(req,res)=>{


    (async()=>{

        try{
    
            let data={};
            data.table='user'
            data.where={id:req.user_id};
            data.attributes = ['id','full_name','email','phone','is_email_verified','is_phone_verified','facebook_id','google_plus_id','company_name','relationship_with_company']
            let fetch_user=await GenericRepository.fetchDataWithAttributes(data);
            let admin_consultant={};
            admin_consultant.where={user_id:fetch_user.rows[0].dataValues.id};
            let sort_by = ['createdAt','DESC']
            let admin_consultant_fetch=await ConsultationhubRepository.fetchConsultantHubData(admin_consultant,sort_by);
            console.log(admin_consultant_fetch);
            fetch_user.rows[0].dataValues.admin_consultant=admin_consultant_fetch.rows;


            let info={};
        
            info.table='resources',
            info.where={user_id:req.user_id,type:'consultant_profile_photo'}
            let fetch=await GenericRepository.fetchData(info);
            res.send({status:200,profile_photo:fetch,data:fetch_user,message:'data fetched',purpose:'consultant fetch'})

            
    
        } catch(err){
        console.trace(err)
    
            res.send({status:500, err:err});
    
        }
    
        
        })()
    

}




    

/*emailVerify api
method:GET
input:headers[x-access-token]
purpose:to verify email address for client
created by Arijit Saha
*/

publicVar.emailVerify=(req,res)=>{

    (async()=>{

        try{
    
            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                
                    commonFunnction.getRandomString(10).then((randNum) => {
                        validation_hash = randNum
                        resolve(validation_hash)
                        }).catch(randErr=>{
                        console.log(randErr);
                        return res.send({status:500, message:'Something went wrong'});
                        })
    
                
    
            })

                let validations={};
                validations.table='validation',
                validations.data={
                uid:req.user_id,
                role:1,
                validation_hash:validation_hash,
                ref_emai:req.body.email,
                

                

                }

                let validations_entry=await  GenericRepository.createData(validations);
                let create_user_data = {};
                create_user_data.name = req.body.full_name;
                create_user_data.email = req.body.email;
                create_user_data.link = process.env.WEBURL+'/ebinaa/html/account-verified/'+validation_hash;//change the url here
                global.eventEmitter.emit('account_activation_email_link', create_user_data);
                //resolve();
                // return res.send({status:201, msg:'Signed up successfully, please verify your email to your provided email address', data:client_and_consultant_sign_up_result})
            

                return res.send({status:200,message:"email sent",purpose:'verify email',data:[]})

    
        } catch(err){
        console.trace(err)
    
            res.send({status:500, err:err});
    
        }
    
        
        })()
    
}


/*language
method:GET
input:file[ id,group_name]
output:data
purpose:fetch page wise language
created by Anirban Das
*/

publicVar.languagePageWise = (req, res) => {


  (async () => {
    try {
      var data = {};
      data.table = 'languages';
      data.where = {  is_active: 1, group_name: req.query.group_name };

      let languageData = await GenericRepository.fetchData(data)

     return res.send({ status: 200, data: languageData, message: 'Language data fetch successfully', purpose: "Project docs details fetch successfully" });


    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: 'Language data details fetching error', err: err });

    }

  })()

}
/*base-image
method:POST
input:body[project_id,resource_description ]
output:data
purpose:upload photi
created by Anirban Das
*/

publicVar.baseImageUpload = (req, res) => {

var base64Data = req.body.imagedata.replace(/^data:image\/png;base64,/, "");
var d = new Date();
var n = d.getTime();

    require("fs").writeFile(global.constants.uploads.project_gnatt_chart+n+".png", base64Data, 'base64', function(err) {
      if(err){
        res.send({ status: 500, message: 'error converting gnatt chart details', err: err });
      }else{

            (async () => {
                try {
                          var data = {};
                          data.table = 'project_docs';
                          data.where = {  is_active: 1, project_id:parseInt(req.body.project_id),resource_description:parseInt(req.body.resource_description)};

                          let languageData = await GenericRepository.fetchData(data);


                          // let data = { resource_type: 'png', resource_url: global.constants.IMG_URL.project_gnatt_chart +n+".png"  }
                          data.data ={
                            type:'gantt_chart',
                            resource_type:'image/png',
                            resource_url:global.constants.IMG_URL.project_gnatt_chart +n+".png",
                            is_active:1,
                            resource_description:parseInt(req.body.resource_description)
                          }

                          if(languageData.count > 0){
                              let resource_update = await GenericRepository.updateData(data);
                          }else{
                            data.data.project_id = req.body.project_id;
                            let resource_create = await GenericRepository.createData(data)
                            }

                       return res.send({ status: 201, data: data, message: 'file uploaded and updated', purpose: "project gnatt image upload" });

                    } catch (err) {
                      console.trace(err)

                     return res.send({ status: 500, message: 'Language data details fetching error', err: err });

                    }

        })()
 
            // res.send({ status: 201, data: data, message: 'file uploaded and updated', purpose: "project gnatt image upload" });

      }

    });

    publicVar.common_images=(req,res)=>{
        
    }

}
/*mail-verification
method:PUT
input:body[validation_hash ]
output:data
purpose:mail verify
created by Sayanti Nath
*/

publicVar.verifyemailLink=async(req,res)=>{
    try{
        let validations={};
        validations.table='validation',
        validations.where={
            validation_hash:req.body.validation_hash
        }
        let validations_fetch=await GenericRepository.fetchData(validations);

        if(validations_fetch.rows[0].dataValues.is_expired==1){

            return res.send({status:200,message:'link expired already'})

        }

        validations.data={
            is_expired:1
        }
        let validation_update=await GenericRepository.updateData(validations)


        let user={};
        user.table='user',
        user.where={id:validations_fetch.rows[0].dataValues.uid};
        user.data={
            email:validations_fetch.rows[0].dataValues.ref_email,
            is_email_verified:1
        }

        let user_update=await GenericRepository.updateData(user);

        return res.send({status:200,message:'Mail successfully verified',purpose:'mail verification',data:[]});

    }
    catch (err) {
        console.trace(err)

        res.send({ status: 500, message: 'error', err: err });

      }
}
/*client
method:POST
input:body[full_name,phone]
output:data
purpose:to check client existance
created by Sayanti Nath
*/

publicVar.clientExistanceCheck=async(req,res)=>{
    try{
        let client={};
        client.table='user',
        client.where={full_name:req.body.full_name,phone:req.body.phone,user_type:1};
        let client_fetch=await GenericRepository.fetchData(client);
        if(client_fetch.rows.length>0){
            return res.send({status:200,data:true,message:'Please login to continue',purpose:'client existance check'})
        }
        else{
            return res.send({status:200,data:false,message:' No account found with such details. Please create a new account',purpose:'client existance check'})
        }

    }
    catch (err) {
        console.trace(err)

        res.send({ status: 500, message: 'error', err: err });

      }

}
   
module.exports = publicVar