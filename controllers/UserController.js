const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms=require('../models/cms');
const commonFunnction = require('../helper/commonFunction');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');


var  Usercontroller= {};

/*fetch-user-details
method:POST
input:body[ limit,page]
output:data,
purpose:to fetch user list
created by Anirban das
*/

/**
 * @swagger
 * /api/admin/fetch-user-list:
 *  post:
 *   tags:
 *    - Users
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: string
 *       value: 3
 *    - in: query
 *      name: search_text
 *      schema:
 *       type: string
 *   responses:
 *    '200':
 *      description: successful
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SuccessResponse'
 *    '500':
 *      description: error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ErrorResponse'
 *    '400':
 *      description: Bad request
 *    '401':
 *      description: Authorization invalid
 *    '404':
 *      description: Not found
 *    '422':
 *      description: validation error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ValidationResponse'
 */

Usercontroller.fetchUserList=(req,res)=>{


  if (!req.body.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'Body' });
  if (!req.body.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'Body' });
  
  let page = parseInt(req.body.page);
  let limit = parseInt(req.body.limit);
  let offset = limit*(page-1);

  (async()=>{

       try{
        var array=[];
        let user={};
        user.table='user',
        user.where={user_type:3,is_complete:0};
        let user_contractor=await GenericRepository.fetchData(user);

        for(index in user_contractor.rows){
          array.push(user_contractor.rows[index].dataValues.id);
        }

           let information={};

           let and_data = [];
           if(req.body.user_type==0){
           and_data.push({id:{$notIn:array}});
           }
           
           if(req.body.user_type != 0)
           {
            and_data.push({user_type:parseInt(req.body.user_type),id:{$notIn:array}});
           }
           let or_data = [];

           if(req.body.search_text)
           {
            or_data.push({id:{$like:'%'+req.body.search_text+'%'}});
            or_data.push({email:{$like:'%'+req.body.search_text+'%'}});
            or_data.push({full_name:{$like:'%'+req.body.search_text+'%'}});
            or_data.push({phone:{$like:'%'+req.body.search_text+'%'}});

           }

           information.table='user';
           if(or_data.length > 0){
             information.where= { $or:or_data,$and:and_data};
           }else{
             information.where= and_data ;
           }

           let order=[[]];
           if(req.body.order=="namedsc"){
             order=[['full_name','DESC']]
           }
          else if(req.body.order=="nameasc"){
            order=[['full_name','ASC']]
          }
         else if(req.body.order=="emaildsc"){
            order=[['email','DESC']]
          }
          else if(req.body.order=="emailasc"){
            order=[['email','ASC']]
          }

          else if(req.body.order=="createdatdsc"){
            order=[['createdAt','DESC']]
          }
          else if(req.body.order=="createdatasc"){
            order=[['createdAt','ASC']]
          }
          else if(req.body.order=="idasc"){
            order=[['id','ASC']]
          }
         
          else
          {
            order=[['id','DESC']]
          }
         //console.log(information);
           let userdata = await GenericRepository.fetchDatalimit(information,limit,offset,order);
          
          
           for(index in userdata.rows){
            if(userdata.rows[index].dataValues.user_type==1){
              let project = {};
              project.table ='projects',
              project.where = { user_id:userdata.rows[index].dataValues.id };
              let project_count = await GenericRepository.fetchData(project);
              userdata.rows[index].dataValues.projects=project_count.rows.length;
             }
             if(userdata.rows[index].dataValues.user_type==2){
              let project = {};
             // project.table ='project_consultants',
              project.where = { consultant_id:userdata.rows[index].dataValues.id };
              let project_count = await ConsultationhubRepository.ProjectDataforListing(project);
              userdata.rows[index].dataValues.projects=project_count.rows.length;
             }
      
      
             if(userdata.rows[index].dataValues.user_type==3){
              let project = {};
              project.table ='project_bids',
              project.where = { contractor_id:userdata.rows[index].dataValues.id, is_draft: 0 };
              let project_count = await ConsultationhubRepository.ProjectDataforListingContractor(project);
              userdata.rows[index].dataValues.projects=project_count.rows.length;
             }
      
      
             let temp_user={};
             temp_user.table='temp_users',
             temp_user.where={user_id:userdata.rows[index].dataValues.id};
             let user_fetch=await GenericRepository.fetchData(temp_user);
             if(user_fetch.rows.length>0){
              userdata.rows[index].dataValues.update=1
             }
             else{
              userdata.rows[index].dataValues.update=0
             }
           
             let admin_consultant={};
             admin_consultant.table='admin_consultants',
             admin_consultant.where={user_id:userdata.rows[index].dataValues.id};
            let admin_consultant_fetch=await GenericRepository.fetchData(admin_consultant);
            if(admin_consultant_fetch.rows.length>0){
            userdata.rows[index].dataValues.consultant_profile_status= admin_consultant_fetch.rows[0].dataValues.is_active;
            }
            else{
              userdata.rows[index].dataValues.consultant_profile_status= 0;
            }

          }

           return res.send({status:200, msg:'data', message:'data',purpose:'user list',data:userdata});

          } catch(err){
            console.trace(err)

              res.send({status:500, err:err});

          }

  })()
  
}

/*get-user-details
method:GET
input:body[ user_id]
output:data,
purpose:fetch user details
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/get-user-details:
 *  post:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: user_id need for fetch user's details.
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            user_id:
 *              type: integer
 *   responses:
 *    '200':
 *      description: successful
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SuccessResponse'
 *    '500':
 *      description: error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ErrorResponse'
 *    '400':
 *      description: Bad request
 *    '401':
 *      description: Authorization invalid
 *    '404':
 *      description: Not found
 *    '422':
 *      description: validation error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ValidationResponse'
 */
Usercontroller.userDetails=(req,res)=>{

  (async()=>{

    try{

     let information={};
     information.table='user',
    
     information.where = {id:parseInt(req.body.user_id)},
     information.where.is_delete = 0; 

     let userdata = await ConsultationhubRepository.userDetails(information);

     for(index in userdata.rows){
       if(userdata.rows[index].dataValues.user_type==1){
        let project = {};
        project.table ='projects',
        project.where = { user_id:userdata.rows[index].dataValues.id };

        let project_count = await GenericRepository.fetchData(project);
        userdata.rows[index].dataValues.projects=project_count.rows;
       }
       if(userdata.rows[index].dataValues.user_type==2){
        let project = {};
        project.table ='project_consultants',
        project.where = { consultant_id:userdata.rows[index].dataValues.id };
        let project_count = await GenericRepository.fetchData(project);
        userdata.rows[index].dataValues.projects=project_count.rows;
       }


       if(userdata.rows[index].dataValues.user_type==3){
        let project = {};
        project.table ='project_bids',
        project.where = { contractor_id:userdata.rows[index].dataValues.id, is_draft: 0 };
        let project_count = await GenericRepository.fetchData(project);
        userdata.rows[index].dataValues.projects=project_count.rows;
       }


       let temp_user={};
       temp_user.table='temp_users',
       temp_user.where={user_id:userdata.rows[index].dataValues.id};
       let user_fetch=await GenericRepository.fetchData(temp_user);
       if(user_fetch.rows.length>0){
        userdata.rows[index].dataValues.update=1
       }
       else{
        userdata.rows[index].dataValues.update=0
       }
     }
     
     res.send({status:200, msg:'result', message:'result',data:userdata});

  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()

}

/*update-user-status
method:PUT
input:body[user_id]
output:data,
purpose:to active or deactive user 
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/update-user-status:
 *  post:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: user_id need for fetch user's details.
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            user_id:
 *              type: integer
 *            is_active:
 *              type: integer
 *   responses:
 *    '200':
 *      description: successful
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SuccessResponse'
 *    '500':
 *      description: error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ErrorResponse'
 *    '400':
 *      description: Bad request
 *    '401':
 *      description: Authorization invalid
 *    '404':
 *      description: Not found
 *    '422':
 *      description: validation error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ValidationResponse'
 */
Usercontroller.userStatusChange=(req,res)=>{

  (async()=>{

    try{

     let information={};
     information.table='user',
    
     information.where = {id:req.body.user_id},
     information.where.is_delete = 0; 
     information.data = {is_active : req.body.is_active}; 


     await GenericRepository.updateData(information)
     let userdata = await GenericRepository.fetchData(information)

     
     
     res.send({status:200, msg:'result', message:'result',data:userdata});

  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()

}

/*project-Scope
method:GET
input:body[user_id]
output:data,
purpose:to get project Scope 
created by Sayanti Nath
*/


Usercontroller.projectScope=(req,res)=>{

  (async()=>{

    try{
    

      let data={};
      data.table='project_scopes',
      data.where={};
      data.where.is_deleted=0;
     //let  group_by=['group_name'];

      let projectscopes_fetch=await GenericRepository.fetchData(data);
  
        res.send({status:201, data:projectscopes_fetch,message:'data fetche'});

    } catch(err){

      console.trace(err)
        res.send({status:500, err:err});

    }

  })()

}

/*user-project-details
method:GET
input:body[ user_id ]
output:fetch project details,
purpose:to fetch project details for user
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/user-project-details:
 *  get:
 *   tags:
 *    - Users
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: integer
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: integer
 *       value: 3
 *    - in: query
 *      name: user_id
 *      required: true
 *      schema:
 *       type: integer
 *   responses:
 *    '200':
 *      description: successful
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SuccessResponse'
 *    '500':
 *      description: error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ErrorResponse'
 *    '400':
 *      description: Bad request
 *    '401':
 *      description: Authorization invalid
 *    '404':
 *      description: Not found
 *    '422':
 *      description: validation error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ValidationResponse'
 */
Usercontroller.projectDetails=(req,res)=>{
  (async()=>{
    try{
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit*(page-1);
      //let order=[[]];


      let order=[[]];
      if(req.query.order=='projectAsc'){
        order=[['id','ASC']]

      }
      else if(req.query.order=='projectDsc'){

        order=[['id','DESC']]

      }

      let information={};
      information.table='user',
     
      information.where = {id:parseInt(req.query.user_id)},
      information.where.is_delete = 0; 
 
      let userdata = await GenericRepository.fetchData(information);
      console.log(userdata);
      if(userdata.rows[0].dataValues.user_type==1){
        let project = {};
        project.table ='projects';
       // project.where = { user_id:userdata.rows[0].dataValues.id };
        let and_data=[];
        let or_data=[];
        let name_data=[];
        and_data.push({user_id:userdata.rows[0].dataValues.id});
        if(req.query.search_text){
          or_data.push({name:{$like:'%'+req.query.search_text+'%'}});
         }
         if(req.query.search=='draft'){
           name_data.push({user_id:userdata.rows[0].dataValues.id,status:0})

         }
         if(req.query.search=='closed'){
          name_data.push({user_id:userdata.rows[0].dataValues.id,status:4})

        }
        if(req.query.search=='approved'){
          name_data.push({user_id:userdata.rows[0].dataValues.id,status:2})

        }
        if(req.query.search=='reject'){
          name_data.push({user_id:userdata.rows[0].dataValues.id,status:3})

        }
        if(req.query.search=='awarded'){
          name_data.push({user_id:userdata.rows[0].dataValues.id,status:5})

        }
        if(req.query.search=='signed'){
          name_data.push({user_id:userdata.rows[0].dataValues.id,status:6})

        }
        

        if (name_data.length > 0 && or_data.length > 0) {
          project.where  = { $or: or_data, $and: name_data };
        }
       
        else if (name_data.length > 0) {
  
          project.where = name_data;
        }
  
        else if (or_data.length > 0) {
          
          project.where  = { $or: or_data, $and: and_data };
        }
        else {
          project.where  = and_data;
         
        }
        
         let project_count = await GenericRepository.fetchDatalimit(project,limit,offset);
        userdata.rows[0].dataValues.projects=project_count.rows;
       }
       if(userdata.rows[0].dataValues.user_type==2){
        let project = {};
        //project.where = { consultant_id:userdata.rows[0].dataValues.id };
        let and_data=[];
        let or_data=[];
        let name_data=[];
        and_data.push({consultant_id:userdata.rows[0].dataValues.id});
        if(req.query.search_text){
          or_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `name` LIKE "%' + req.query.search_text + '%"')] }});
         }
         if(req.query.search=='draft'){
           name_data.push({consultant_id:userdata.rows[0].dataValues.id, project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=0')]}})

         }
         if(req.query.search=='closed'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=4')]}})

        }
        if(req.query.search=='approved'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=2')]}})

        }
        if(req.query.search=='reject'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=3')]}})

        }
        if(req.query.search=='awarded'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=5')]}})

        }
        if(req.query.search=='signed'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=6')]}})

        }
        

        if (name_data.length > 0 && or_data.length > 0) {
          project.where  = { $or: or_data, $and: name_data };
        }
       
        else if (name_data.length > 0) {
  
          project.where = name_data;
        }
  
        else if (or_data.length > 0) {
          
          project.where  = { $or: or_data, $and: and_data };
        }
        else {
          project.where  = and_data;
         
        }
        let project_count = await ConsultationhubRepository.ProjectDataforListing(project,limit,offset);
        userdata.rows[0].dataValues.projects=project_count.rows;
       }


       if(userdata.rows[0].dataValues.user_type==3){
        let project = {};
        project.table ='project_bids';
        //project.where = { contractor_id:userdata.rows[0].dataValues.id, is_draft: 0 };
        let and_data=[];
        let or_data=[];
        let name_data=[];
        and_data.push({contractor_id:userdata.rows[0].dataValues.id});
        if(req.query.search_text){
          or_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `name` LIKE "%' + req.query.search_text + '%"')] }});
         }
         if(req.query.search=='draft'){
           name_data.push({contractor_id:userdata.rows[0].dataValues.id, project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=0')]}})

         }
         if(req.query.search=='closed'){
          name_data.push({contractor_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=4')]}})

        }
        if(req.query.search=='approved'){
          name_data.push({consultant_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=2')]}})

        }
        if(req.query.search=='reject'){
          name_data.push({contractor_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=3')]}})

        }
        if(req.query.search=='awarded'){
          name_data.push({contractor_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=5')]}})

        }
        if(req.query.search=='signed'){
          name_data.push({contractor_id:userdata.rows[0].dataValues.id,project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `status`=6')]}})

        }
        

        if (name_data.length > 0 && or_data.length > 0) {
          project.where  = { $or: or_data, $and: name_data };
        }
       
        else if (name_data.length > 0) {
  
          project.where = name_data;
        }
  
        else if (or_data.length > 0) {
          
          project.where  = { $or: or_data, $and: and_data };
        }
        else {
          project.where  = and_data;
         
        }
        let project_count = await ConsultationhubRepository.ProjectDataforListingContractor(project,limit,offset);
        userdata.rows[0].dataValues.projects=project_count.rows;
       }

       return res.send({status:200,message:'project details',purpose:'user project details',data:userdata});


    }
    catch(err){

      console.trace(err)
        res.send({status:500, err:err});

    }

  })()

}



module.exports=Usercontroller