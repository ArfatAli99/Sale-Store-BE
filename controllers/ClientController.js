const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
var ProjectRepository = require('.././repositories/ProjectRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms=require('../models/cms');
const commonFunnction = require('../helper/commonFunction');


clientController={} 

/*client-invite-consultent api
method:POST
input:body[ email,project_id]
output:mail sent,
purpose:to invite consultent
created by sayanti Nath
*/

clientController.inviteConsultent=(req,res)=>{

    (async()=>{

        try{
          let validation_check={};
          validation_check.table='validation',
          validation_check.where={};
          validation_check.where.validation_type='client_invite_consultent';
          validation_check.where.validation_meta=req.body.project_id;
          validation_check.where.validation_type='client_invite_consultent'
          let validation_check_fetch=await GenericRepository.fetchData(validation_check);
          if(validation_check_fetch.rows.length>0){
            return res.send({status:403, message:'you already sent invitation'});


          }
          else{


            let user_data={};
            user_data.table='user',
            user_data.where={},
            user_data.where.email=req.body.email;
      let user_table=await GenericRepository.fetchData(user_data);
         if(user_table.rows.length>0){
           console.log('if body')

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

          let validation_information={};
          validation_information.table='validation',

         
          validation_information.data={},
          validation_information.data.validation_type='client_invite_consultent',
          validation_information.data.uid=req.user_id,
          validation_information.data.phone=req.body.phone,
          validation_information.data.validation_meta=req.body.project_id,
          validation_information.data.role=1,
          validation_information.data.ref_email=req.body.email,
          validation_information.data.ref_id=user_table.rows[0].dataValues.id,
          validation_information.data.validation_hash= validationhash;
          //console.log( validation_data)
    
          let validation_table_entry=await GenericRepository.createData( validation_information);

          let email_data={};
          email_data.email=req.body.email;
          email_data.name=user_table.rows[0].dataValues.full_name,
          email_data.link=process.env.WEBURL+'/ebinaa/html/project-verified/'+ validationhash;

          global.eventEmitter.emit('project_invitation_email',  email_data);


          var project_consultents={};
          project_consultents.table='project_consultants',
          project_consultents.where=
          {
            consultant_id:user_table.rows[0].dataValues.id,
            project_id:req.body.project_id
          }

          let project_consultant_data=await GenericRepository.fetchData(project_consultents);
          project_consultents.data={
            consultant_id:user_table.rows[0].dataValues.id,
            project_id:req.body.project_id
          }

          if(project_consultant_data.rows.length>0){
           
            let project_consultant_data_update=await GenericRepository.updateata(project_consultents);

          }
         


else{

    let project_consultents_table=await GenericRepository.createData( project_consultents);
}
    return res.send({status:200, message:'mail sent'});


         }
         else{
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

          let validation_information={};
          validation_information.table='validation',
         
          validation_information.data={},
          validation_information.data.validation_type='client_invite_consultent',
          validation_information.data.uid=req.user_id,
          validation_information.data.phone=req.body.phone,
          validation_information.data.validation_meta=req.body.project_id,
          validation_information.data.role=1,
          validation_information.data.ref_email=req.body.email,
          validation_information.data.ref_id=0,
          validation_information.data.validation_hash= validationhash;
          //console.log( validation_data)
    
          let validation_table_entry=await GenericRepository.createData( validation_information);

          let email_data={};
          email_data.email=req.body.email,
          email_data.name=req.body.name,

          email_data.link=process.env.WEBURL+'/ebinaa/html/signup-consultant/'+ validationhash;

          global.eventEmitter.emit('consultent_register_invitation_email',  email_data);
          console.log('mail sent')
          return res.send({status:200, message:'mail sent'});






         }
        }

        
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


clientController.verifyLink=(req,res)=>{
console.log("/////////////////////////");
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
              client_id:req.user_id,
              consultant_id:validations_fetch.rows[0].dataValues.uid,
              project_id:validations_fetch.rows[0].dataValues.validation_meta,
            }
          consultant_data.table='project_consultants';
        let consultant_data_val = await GenericRepository.createData(consultant_data);

        let product_data = {};

        product_data.data =  {user_id:req.user_id};
        // product_data.where =  {project_id:validations_fetch.rows[0].dataValues.validation_meta};
        product_data.where =  {id:validations_fetch.rows[0].dataValues.validation_meta};
        product_data.table='projects';

        let product_data_val = await GenericRepository.updateData(product_data);

        let validations_update = await GenericRepository.updateData(validations_information);



        return res.send({status:200, message:'Invitation link',validation_id:validations_fetch.rows[0].dataValues.id,validation_meta:validations_fetch.rows[0].dataValues.validation_meta});
        



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



/*profile-photo api
method:POST
input:body[upload]
output:data,
purpose:to upload photo
created by sayanti Nath
*/



clientController.profilePhoto=(req,res)=>{


  (async()=>{
    try{
   
    let url=global.constants.IMG_URL.client_profile_photo_url+req.files.upload[0].filename;

    let info={};

    info.table='resources',
    info.data={
        user_id:req.user_id,
        resource_type:'file',
        resource_url:url,
        type:'client_profile_photo'
    }
    let resource_create=await GenericRepository.createData(info)
    res.send({status:201,url:url,message:'uploaded',purpose:'photo uploded'})
   
    } catch(err){
    console.trace(err)
    // res.send({status:500, err:err});
    res.send({status:500,uploaded: 0, error:{message:"error"}});
    
    }
    
    
    })()





}


clientController.getRandomString=async(req,res)=>{
  try{
    let validation= await commonFunnction.getRandomString(12);
    console.log(validation);

  }
  catch(err){
    console.trace(err)
    // res.send({status:500, err:err});
    res.send({status:500,uploaded: 0, error:{message:"error"}});
    
    }

}


module.exports=clientController
