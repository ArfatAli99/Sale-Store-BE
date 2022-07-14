var GenericRepository = require('../repositories/GenericRepository');
const commonFunnction = require('../helper/commonFunction');
const md5 = require('md5');


var publicVar = {};

/**consultant_invite_client API
method:POST
input:body[name, email, project_id], headers [x-access-token]
output:data,
purpose:To invite a client from consultant for a project.
created by arijit saha
*/
/**
     * To invite a client from consultant for a project with respect to `name`,`email`, `project_id`, `x-access-token`
     * @param {Number} `project_id`
     * @param {String} `name`,`email`,`x-access-token`
     * @return {data} `data`
*/

publicVar.consultant_invite_client = function(req, res){
    (async()=>{
        try{
            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                commonFunnction.getRandomString(10).then((randNum) => {
                  validation_hash = randNum;
                  resolve(validation_hash)
                }).catch(randErr=>{
                  console.log(randErr);
                  return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                })
          
            })
            console.log(validation_hash)
            let client_data = await new Promise(function(resolve, reject){
                let client_data = {};
                let check_client_data = {};
                check_client_data.table = 'user';//
                check_client_data.where = {};
                check_client_data.where.email = req.body.email;
                check_client_data.where.user_type = 1;
                GenericRepository.fetchData(check_client_data).then(check_client_result=>{
                    client_data.rows = check_client_result.rows;
                    resolve(client_data);
                }).catch(check_client_err=>{
                    console.log(check_client_err);
                })
            })
            ///// Work here to check if previously invited //////
            let check_if_previously_invited = await new Promise(function(resolve, reject){
                let check_validation_data = {};
                check_validation_data.table = 'validation';
                check_validation_data.where = {};
                check_validation_data.where.uid = req.user_id;
                check_validation_data.where.role = 2;
                check_validation_data.where.validation_type = 'consultant_invite_client';
                check_validation_data.where.validation_meta = req.body.project_id;
                GenericRepository.fetchData(check_validation_data).then(check_validation_result=>{
                    if(check_validation_result.rows.length > 0){
                        return res.send({status:409, msg:'You have previously invited a client to this project already', message:'You have previously invited a client to this project already'});
                    }
                    else{
                        resolve();
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err)
                })
            })
            let validation_data_entry = await new Promise(function(resolve, reject){
                let validation_create_data = {};
                validation_create_data.table = 'validation';
                validation_create_data.data = {};
                validation_create_data.data.uid = req.user_id;
                validation_create_data.data.role = 2;
                validation_create_data.data.validation_type = 'consultant_invite_client';
                validation_create_data.data.validation_meta = req.body.project_id;
                if(req.body.phone){
                    validation_create_data.data.phone = req.body.phone;
                }
                validation_create_data.data.ref_email = req.body.email;
                validation_create_data.data.validation_hash = validation_hash;
                if(client_data.rows.length > 0){
                    validation_create_data.data.ref_id = client_data.rows[0].dataValues.id;
                }
                else{
                    validation_create_data.data.ref_id = 0;
                }
                GenericRepository.createData(validation_create_data).then(validation_create_result=>{
                    if(client_data.rows.length > 0){
                        let project_consultant_data = {};
                        project_consultant_data.table = 'project_consultants';
                        project_consultant_data.data = {};
                        project_consultant_data.data.client_id = client_data.rows[0].dataValues.id;
                        project_consultant_data.data.consultant_id = req.user_id;
                        project_consultant_data.data.project_id = req.body.project_id;
                        GenericRepository.createData(project_consultant_data).then(project_consultant_result=>{
                            resolve()
                        }).catch(project_consultant_err=>{
                            console.log(project_consultant_err)
                        })
                    }
                    else{
                        resolve();
                    }
                }).catch(validation_create_err=>{
                    console.log(validation_create_err);
                })

            })
            let create_email_data = await new Promise(function(resolve, reject){
                let create_consultant_data = {};
                create_consultant_data.name = req.body.name;
                create_consultant_data.email = req.body.email;
                if(client_data.rows.length > 0){
                    create_consultant_data.is_user_found = 1;
                    create_consultant_data.link = process.env.WEBURL+'/ebinaa/html/project-verified-client/'+validation_hash;//////
                }
                else{
                    create_consultant_data.is_user_found = 0;
                    create_consultant_data.link = process.env.WEBURL+'/signup-client/'+validation_hash;
                }
                resolve(create_consultant_data)
            })
            global.eventEmitter.emit('consultant_invite_client',  create_email_data);
            return res.send({status:200, msg:'Invitation sent successfully', message:'Invitation sent successfully', purpose:'To send a project email invitation to a client'})

        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}

/**detailsOfConsultantInviteClientLink API
method:GET
input:queryParam[validation_hash]
output:data,
purpose:To get details for a hash link.
created by arijit saha
*/
/**
     * To get details for a hash link with respect to `validation_hash`
     * @param {String} `validation_hash`
     * @return {data} `data`
*/
publicVar.detailsOfConsultantInviteClientLink = function(req, res){
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
                            resolve(check_link);
                        }
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err);
                })
            })
            let send_data = {};
            send_data.id = check_link.rows[0].dataValues.id;
            send_data.uid = check_link.rows[0].dataValues.uid;
            send_data.validation_meta = check_link.rows[0].dataValues.validation_meta;
            send_data.ref_email = check_link.rows[0].dataValues.ref_email;
            send_data.ref_id = check_link.rows[0].dataValues.ref_id;
            return res.send({status:200, message:'Link details', purpose:'To get details of link hash', data:send_data});
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
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
        is_expired:1,
        ref_id:req.user_id
      }
      
      let validations_fetch =await GenericRepository.fetchData(validations_information);
      if(validations_fetch.rows.length>0)
      {
        if(validations_fetch.rows[0].dataValues.is_expired == 1){
          return res.send({status:403, message:'Invitation link is already expired'});

      }
      else{
            let consultant_data = {};
            consultant_data.data = {
              client_id:validations_fetch.rows[0].dataValues.uid,
              consultant_id:req.user_id,
              project_id:validations_fetch.rows[0].dataValues.validation_meta,
            }
          consultant_data.table='project_consultants';
        let consultant_data_val = await GenericRepository.createData(consultant_data);

        let validations_update=await GenericRepository.updateData(validations_information);



        return res.send({status:200, message:'Invitation link',validation_id:validations_fetch.rows[0].dataValues.id,validation_meta:validations_fetch.rows[0].dataValues.validation_meta,ref_mail:validations_fetch.rows[0].dataValues.ref_email});
        



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



/*consultant-Profile-Photo api
method:POST
input:body[Id, file]
output:data
purpose:to set consultant profile photo
created by sayanti Nath
*/

publicVar.consultantProfilePhoto=(req,res)=>{


    (async()=>{
      try{
     
      let url=global.constants.IMG_URL.consultant_profile_photo_url+req.files.upload[0].filename;
  
      let info={};
  
      info.table='resources',
      info.data={
          user_id:req.user_id,
          resource_type:'file',
          resource_url:url,
          type:'consultant_profile_photo'
      }
      let resource_create=await GenericRepository.createData(info)
      res.send({status:201,url:url,message:'uploaded'})
     
      } catch(err){
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({status:500,uploaded: 0, error:{message:"error"}});
      
      }
      
      
      })()
  
  
  
  
  
  }

  /*consultant-Profile-Photo-update api
  method:PUT
  input:body[Id, file]
  output:data
  purpose:to update consultant profile photo
  created by sayanti Nath
  */

  publicVar.consultantProfilePhotoUpdate=(req,res)=>{
    (async()=>{
        try{
       
           
         let url=global.constants.IMG_URL.consultant_profile_photo_url+req.files.upload[0].filename;


            let info={};
        
            info.table='resources',
            info.where={user_id:req.body.id,type:'consultant_profile_photo'}
            let fetch=await GenericRepository.fetchData(info);

            var data={};
            data.path=url;

            info.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'consultant_profile_photo'
            }

            if(fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info);
            data.id=resource_update.dataValues.id;
            }
            else{
                let resource_create=await GenericRepository.createData(info);
                data.id=resource_create.dataValues.id;
            }

            let admin_consultant={};
            admin_consultant.table='admin_consultants',
            admin_consultant.where={user_id:req.body.id};
            admin_consultant.data={
                company_logo:url
            }
            let admin_consultant_update=await GenericRepository.updateData(admin_consultant);
        
            

            return res.send({status:200,message:'profile photo uploaded',purpose:'profile photo uploaded',data:data})
       
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"error"}});
        
        }
        
        
        })()

  }

  /*consultant-Profile-Add api
  method:POST
  input:body[id, email, phone, password, company_name, email_verified, phone_verified, ]
  output:data
  purpose:to add consultant profile 
  created by sayanti Nath
  */

  publicVar.consulantProfileAdd=async(req,res)=>{
      try{
          let admin_consultant={};
          admin_consultant.table='admin_consultants',
          admin_consultant.where={};
          let admin_consultant_fetch=await GenericRepository.fetchData(admin_consultant);
          

          for(index in admin_consultant_fetch.rows){
              console.log(admin_consultant_fetch.rows[index].dataValues.email);
              let user={};
              user.table='user',
              user.where={email:admin_consultant_fetch.rows[index].dataValues.email,user_type:2};
              let user_fetch=await GenericRepository.fetchData(user);
              console.log(user_fetch);
              if(user_fetch.rows.length>0){
                  let consultant={};
                  consultant.table='user',
                  consultant.where={id:user_fetch.rows[0].dataValues.id};
                  consultant.data=
                  {
                    email:admin_consultant_fetch.rows[index].dataValues.email,
                    phone:admin_consultant_fetch.rows[index].dataValues.phone,
                    password:md5(admin_consultant_fetch.rows[index].dataValues.phone),
                    company_name:admin_consultant_fetch.rows[index].dataValues.company_name,
                    user_type:2,
                    is_email_verified:1,
                    is_phone_verified:1
                   }
                 
                  let consultant_update=await GenericRepository.updateData(consultant);
                  let map_admin_consultants={};
                  map_admin_consultants.table='admin_consultants',
                  map_admin_consultants.where={id:admin_consultant_fetch.rows[index].dataValues.id};
                  map_admin_consultants.data={user_id:consultant_update.dataValues.id};
                  let map_admin_consultants_data=await GenericRepository.updateData(map_admin_consultants);

                  
              }
              else{
                let consultant={};
                consultant.table='user',
                consultant.data=
                {
                    email:admin_consultant_fetch.rows[index].dataValues.email,
                    phone:admin_consultant_fetch.rows[index].dataValues.phone,
                    password:md5(admin_consultant_fetch.rows[index].dataValues.phone),
                    company_name:admin_consultant_fetch.rows[index].dataValues.company_name,
                    user_type:2,
                    is_email_verified:1,
                    is_phone_verified:1


                   }
                
                let consultant_update=await GenericRepository.createData(consultant);
                let map_admin_consultants={};
                map_admin_consultants.table='admin_consultants',
                map_admin_consultants.where={id:admin_consultant_fetch.rows[index].dataValues.id};
                map_admin_consultants.data={user_id:consultant_update.dataValues.id};
                let map_admin_consultants_data=await GenericRepository.updateData(map_admin_consultants);
                
                let email_data={};
                email_data.email=consultant_update.dataValues.email;
                email_data.password=consultant_update.dataValues.phone;
                global.eventEmitter.emit('consultant_new_login', email_data);
                console.log('email sent');



              }
          }

          return res.send({status:200,message:'consultant add',purpose:'consultant add'});
        
      }
      catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"error"}});
        
        }
  }


module.exports = publicVar;