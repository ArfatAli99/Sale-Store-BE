const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
var ProjectRepository = require('.././repositories/ProjectRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms = require('../models/cms');
const commonFunnction = require('../helper/commonFunction');
const moment = require('moment');
const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');

 ProjectTemplateController = {}



 /* project-template-delete
method:Put
input:body[ID],
output:data,
purpose:Project TEMPLATE delete"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-template-delete:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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


 ProjectTemplateController.templateDelete=async(req,res)=>{
     try{
         let purpose='template delete';
     var template={};
     template.table='project_templates',
     template.where={id:req.body.id};
     template.data={
        is_delete:1
     }
     let template_delete=await GenericRepository.updateData(template);
     return res.send({status:200,message:'template deleted',purpose:purpose})
    }
    catch(err){
        console.trace(err)
    
          res.send({status:500, err:err,purpose:purpose});
    
      }

 }


 /* project-template-list
method:GET
input:body[],
output:data,
purpose:Project TEMPLATE list"
created by Sayanti Nath
*/



/**
 * @swagger
 * /api/admin/project-template-list:
 *  get:
 *   tags:
 *    - Template Management
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: integer
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: integer
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

 ProjectTemplateController.templateShow=async(req,res)=>{
    try{

      if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit*(page-1);

        let purpose='template view';
         var template={};
         template.table='project_templates';
    
    let and_data=[];
    let or_data=[];
    and_data.push({is_delete:0});

    if(req.query.search_text)
    {
      

      or_data.push({name:{$like:'%'+req.query.search_text+'%'}});
    
      
    }
    template.table='project_templates';

    if(or_data.length > 0){
      template.where= { $or:or_data,$and:and_data};
    }else{
      template.where= and_data ;
    }
    let order=[[]];
    order=[['id','DESC']]

    
    let template_show=await GenericRepository.fetchDatalimit(template,limit,offset,order);
    return res.send({status:200,message:'template view',data:template_show,purpose:purpose})
   }
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err,purpose:purpose});
   
     }

}



/* project-template-view
method:POST
input:body[id],
output:data,
purpose:Project TEMPLATE view"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-template-view:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            page:
 *              type: integer
 *            limit:
 *              type: integer
 *            id:
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

ProjectTemplateController.templateShowById=async(req,res)=>{
    try{

      let page = parseInt(req.body.page);
      let limit = parseInt(req.body.limit);
      let offset = limit*(page-1);
        let purpose='template view by id';
       var template={};
    //template.table='project_templates',
    template.where={id:req.body.id};
    
    let template_show=await ConsultationhubRepository.fetchProjectTemplateView(template);
    return res.send({status:200,message:'template view',data:template_show,purpose:purpose})
   }
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err,purpose:purpose});
   
     }

}


/* template-stage
method:POST
input:body[project_template_id,name,description,description_arabic,maximum_allowed_percentage,max_allow_pullback,status],
output:data,
purpose:Project TEMPLATE stage add"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/template-stage:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_template_id:
 *              type: integer
 *            name:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            maximum_allowed_percentage:
 *              type: integer
 *            max_allow_pullback:
 *              type: integer
 *            status:
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


ProjectTemplateController.templateStageAdd=async(req,res)=>{
    try{


        var project_stages = {};
      project_stages.table = 'project_stage_templates';
      project_stages.where = { project_template_id: req.body.project_template_id,	is_default:0,is_deleted:0};
    


      var project_stage_data_fetch = await GenericRepository.fetchData(project_stages);


        let purpose='template stage add';
         var template={};
         template.table='project_stage_templates',
         template.data={

        project_template_id:req.body.project_template_id,
        name:req.body.name,
        description:req.body.description,
        description_arabic:req.body.description_arabic,
        maximum_allowed_percentage:req.body.maximum_allowed_percentage,
        status:req.body.status,
        max_allow_pullback:req.body.max_allow_pullback,
        //sequence:req.body.sequence



    };

    if(project_stage_data_fetch.rows.length>0 ){
        

        var b=project_stage_data_fetch.rows.length;
        var c=b+1;
        console.log(c)
        

        template.data.sequence=c;

       
      }

      else{

        template.data.sequence=1;
        

      }
    
    let template_add=await GenericRepository.createData(template);


    let project_task={};
    project_task.table='project_task_templates',
    project_task.data={
      template_stage_id:template_add.dataValues.id,
      name:'Stage Scope Completion in accordance to Drawings & Specifications',
      name_arabic:'إكمال المرحلة وفقًا للرسومات والمواصفات',
      status:1,
      Type:'Custom Request',
      Type_arabic:'طلب مخصص',
      creator:'system',
      assignee:'Contractor'

    }

    let project_task_data=await GenericRepository.createData(project_task);

    let project_task_second={};
    project_task_second.table='project_task_templates',
    project_task_second.data={
      template_stage_id:template_add.dataValues.id,
      name:'Witness and Approve technical compliance with Drawings & Specifications',
      name_arabic: 'الشهادة والموافقة كتابيا على الامتثال الفني للرسومات والمواصفات',
      status:1,
      Type:'Inspection Request',
      Type_arabic:'طلب تفتيش',
      creator:'system',
      assignee:'Consultant'

    }

    let project_task_data_second=await GenericRepository.createData(project_task_second);

    let project_task_third={};
    project_task_third.table='project_task_templates',
    project_task_third.data={
      template_stage_id:template_add.dataValues.id,
      name:'Pay Stage Payment upon Scope Completion and Consultant Approval',
      name_arabic: 'دفع الدفعة المرحلية عند انتهاء الأعمال و موافقة الإستشاري',
      status:1,
      Type:'Invoice Payment',
      Type_arabic:'دفع الفاتورة',
      creator:'system',
      assignee:'Client'

    }

    let project_task_data_third=await GenericRepository.createData(project_task_third);

    return res.send({status:200,message:'template stage add',purpose:purpose})
   }
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err,purpose:purpose});
   
     }

}

/* template-task
method:POST
input:body[project_template_id,name,description,description_arabic,maximum_allowed_percentage,max_allow_pullback,status],
output:data,
purpose:Project TEMPLATE task add/update"
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/template-task:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            data:
 *              type: array
 *              items:
 *                properties:
 *                    template_stage_id:
 *                      type: integer
 *                    name:
 *                      type: string
 *                    name_arabic:
 *                      type: string
 *                    status:
 *                      type: integer
 *                    type:
 *                      type: string
 *                    type_arabic:
 *                      type: string
 *                    instruction:
 *                      type: string
 *                    instruction_arabic:
 *                      type: string
 *                    creator:
 *                      type: string
 *                    assignee:
 *                      type: string
 *                    is_deleted:
 *                      type: integer
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



ProjectTemplateController.templateTaskAdd=async(req,res)=>{
    try{

      if (!req.body.data) return res.status(422).json({ status: 422,message: "data is required", fieldObject: 'body' });
    
        let purpose='template task add'

        let data = {};
        data = req.body.data;
        console.log("hello");
  
        data.forEach(async function (item, index, arr) {
          if (item.id) {
            let project_tasks = {};
            project_tasks.table = 'project_task_templates',
              project_tasks.data = {
                //stage_id:req.body.stage_id,
                template_stage_id:item.template_stage_id,
                name: item.name,
                name_arabic:item.name_arabic,
                status: item.status,
                Type: item.type,
                Type_arabic:item.type_arabic,
                Instruction: item.instruction,
                instruction_arabic:item.instruction_arabic,
                creator: item.creator,
                assignee: item.assignee,
                is_delete: item.is_deleted
  
              }
            project_tasks.where = {};
            project_tasks.where.id = item.id
            let project_tasks_table = await GenericRepository.updateData(project_tasks);
          }
  
          else {
            let project_tasks = {};
            project_tasks.table = 'project_task_templates',
              project_tasks.data = {
                template_stage_id:item.template_stage_id,
                name: item.name,
                name_arabic:item.name_arabic,
                status: item.status,
                Type: item.type,
                Type_arabic:item.type_arabic,
                Instruction: item.instruction,
                instruction_arabic:item.instruction_arabic,
                creator: item.creator,
                assignee: item.assignee,
                // is_delete:item.is_delete
  
              }
  
            let project_tasks_create = await GenericRepository.createData(project_tasks);
          }
        })
    
          
    return res.send({status:200,message:'task template add',purpose:purpose})
    }
   
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err,purpose:purpose});
   
     }

}



/* template-task
method:POST
input:body[project_template_id,name,description,description_arabic,maximum_allowed_percentage,max_allow_pullback,status],
output:data,
purpose:Project TEMPLATE task add/update"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/template-stage:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            project_template_id:
 *              type: integer
 *            name:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            maximum_allowed_percentage:
 *              type: integer
 *            max_allow_pullback:
 *              type: integer
 *            status:
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

ProjectTemplateController.templateStageUpdate=async(req,res)=>{
    try{


        let stage={};
        stage.table='project_stage_templates',
        stage.where={id:req.body.id};
        var stage_data=await GenericRepository.fetchData(stage);

        console.log(stage_data);
      
  
  
       
  
        var project_length={};
        project_length.table='project_stage_templates',
        project_length.where={project_template_id:stage_data.rows[0].dataValues.project_template_id,is_default:0,is_deleted:0};
        var project_length_data=await GenericRepository.fetchData(project_length);
        console.log(project_length_data);
        
  
        if(req.body.sequence>project_length_data.rows.length){
         
    
    
          let project_stages_entry={};
          project_stages_entry.table='project_stage_templates',
          project_stages_entry.where={
           id:req.body.id
    
          },
          project_stages_entry.data={
            name: req.body.name,
            description: req.body.description,
            description_arabic:req.body.description_arabic,
            maximum_allowed_percentage: req.body.maximum_allowed_percentage,
            status: req.body.status,
            max_allow_pullback: req.body.max_allow_pullback,
  
            sequence:project_length_data.rows.length
          }
    
          let  project_stages_entry_data=await GenericRepository.updateData(project_stages_entry);
  
  
        
          let project_stages_fet_data = {};
          project_stages_fet_data.table = 'project_stage_templates';
    
          project_stages_fet_data.where = {is_default:0,is_deleted:0};
          project_stages_fet_data.where.project_template_id = stage_data.rows[0].dataValues.project_template_id;
          project_stages_fet_data.where.id={$ne:req.body.id};
          project_stages_fet_data.where.sequence={$lte:req.body.sequence}
          
          let order=[['id','ASC']]
         
         var project_stage_data_less_data = await GenericRepository.fetchDataOrder( project_stages_fet_data);
         console.log(project_stage_data_less_data);
    
        
         let sequn_data=project_length_data.rows.length;
         let seq=sequn_data-1;
         console.log(seq)
        
        

       
    
         for(let i = 0; i < project_stage_data_less_data.rows.length; i++){
    
          let order_data={};
          order_data.table='project_stage_templates';
          order_data.where={id:project_stage_data_less_data.rows[i].dataValues.id};
           c=seq--;
           //console.log(c);
           order_data.data={
            sequence:c
           }
           let order_update=await GenericRepository.updateData(order_data);
    
    
    
           //res.send({ status: 201,data:project_stages_entry_data,message:'updated' })
    
    
        }
  
  
        // return res.send({
        //   status:200,
        //   message:'updated',
        //   data:project_stage_data_less_data
        // })
  
      }
    
  
  
  
       
  
        else{
        let project_stages = {};
        project_stages.table = 'project_stage_templates';
       
        project_stages.data =
          {
  
  
  
  
           
            name: req.body.name,
            description: req.body.description,
            description_arabic:req.body.description_arabic,
            maximum_allowed_percentage: req.body.maximum_allowed_percentage,
            status: req.body.status,
            max_allow_pullback: req.body.max_allow_pullback
  
  
          }
  
  
          console.log(stage_data.rows[0].dataValues.sequence)
  
          if(req.body.sequence!=stage_data.rows[0].dataValues.sequence){
            project_stages.data.sequence=req.body.sequence;
           
  
        if(stage_data.rows[0].dataValues.sequence>req.body.sequence){
            console.log('hello');
        let project_stages_fetch = {};
        project_stages_fetch.table = 'project_stage_templates';
  
        project_stages_fetch.where = {is_default:0,is_deleted:0};
        project_stages_fetch.where.project_template_id = stage_data.rows[0].dataValues.project_template_id;
        project_stages_fetch.where.sequence={$gte:req.body.sequence}
        project_stages_fetch.where.id={$ne:req.body.id}
       var project_stage_data = await GenericRepository.fetchData(project_stages_fetch);
       console.log("id",project_stage_data.rows[0].dataValues.id);
  
  
  
       
  
  
  
  
        
        let sequncn=req.body.sequence;
        console.log(sequncn)
       
  
         console.log(sequncn++)
       
  
       if(req.body.id > project_stage_data.rows[0].dataValues.id){
  
       for(let i =0; i < project_stage_data.rows.length; i++){
         console.log(project_stage_data.rows[i].dataValues.id)
        
  
        let order={};
         order.table='project_stage_templates';
         order.where={};
         order.where.id = project_stage_data.rows[i].dataValues.id;
       
         b=sequncn++;
         console.log(b);
         order.data={
          sequence:b
         }
         let order_update=await GenericRepository.updateData(order);
  
  
  
  
  
  
       }
      }
      else{
  
        for(let i =0; i < project_stage_data.rows.length; i++){
          
   
         let order={};
          order.table='project_stage_templates';
          order.where={};
          order.where.id = project_stage_data.rows[i].dataValues.id;
        
          b=sequncn++;
          console.log(b);
          order.data={
           sequence:b
          }
          let order_update=await GenericRepository.updateData(order);
  
      }
      }
    }
  
       if(stage_data.rows[0].dataValues.sequence<req.body.sequence){
        console.log("hello")
       let project_stages_fet = {};
        project_stages_fet.table = 'project_stage_templates';
  
        project_stages_fet.where = {is_default:0,is_deleted:0};
        project_stages_fet.where.project_template_id = stage_data.rows[0].dataValues.	project_template_id;
        project_stages_fet.where.id={$ne:req.body.id};
        project_stages_fet.where.sequence={$lte:req.body.sequence}
       
        let order=[['id','ASC']]
        //project_stages_fetch.where.sequence={$gte:req.body.sequence}
       var project_stage_data_less = await GenericRepository.fetchDataOrder( project_stages_fet);
  
       console.log(project_stage_data_less.rows[1].dataValues.sequence);
  
       
       let sequn_data=req.body.sequence
      console.log(sequn_data--)
  
       for(let i = 0; i < project_stage_data_less.rows.length; i++){
  
        let order_data={};
        order_data.table='project_stage_templates';
        order_data.where={id:project_stage_data_less.rows[i].dataValues.id};
         c=sequn_data--;
         console.log(c);
         order_data.data={
          sequence:c
         }
         let order_update=await GenericRepository.updateData(order_data);
  
  
  
  
  
  
       }
      }
  
      
  
          }
  
         
  
  
  
  
  
  
  
  
      
  
      
  
     
      project_stages.where={id:req.body.id};
      
       var project_stages_table = await GenericRepository.updateData(project_stages);
  
       
    

       
    }
    return res.send({ status: 201,data:project_stage_data_less_data,message:'updated' })
}
   
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err});
   
     }

}


/* template-stage-delete
method:PUT
input:body[ID],
output:data,
purpose:Project stage delete"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/template-stage-delete:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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


ProjectTemplateController.templateStageDelete=async(req,res)=>{
    try{
        let purpose='template stage delete';
    var template={};
    template.table='project_stage_templates',
    template.where={id:req.body.id};
    template.data={
      is_deleted:1
    }
    let template_delete=await GenericRepository.updateData(template);
    return res.send({status:200,message:'template stage deleted',purpose:purpose})
   }
   catch(err){
       console.trace(err)
   
         res.send({status:500, err:err,purpose:purpose});
   
     }

}


/* template-task-delete
method:PUT
input:body[ID],
output:data,
purpose:Project task delete"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/template-task-delete:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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
ProjectTemplateController.templateTaskDeleteData=async(req,res)=>{
  try{
      let purpose='template add';
  var template={};
  template.table='project_task_templates',
  template.where={id:req.body.id};
  template.data={
    is_deleted:1
  }
  let template_delete=await GenericRepository.updateData(template);
  return res.send({status:200,message:'template task deleted',purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}

/* template-add
method:PUT
input:body[NAME],
output:data,
purpose:Project template add"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/template-add:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
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

ProjectTemplateController.templateAdd=async(req,res)=>{
  try{
      let purpose='template add';
  var template={};
  template.table='project_templates',
  //template.where={id:req.body.id};
  template.data={
    name:req.body.name
  }
  let template_add=await GenericRepository.createData(template);


  
  let post_project_stages_primary_payment_data = {};
  post_project_stages_primary_payment_data.table = 'project_stage_templates';
  post_project_stages_primary_payment_data.data = {};
  post_project_stages_primary_payment_data.data.project_template_id = template_add.id;
  post_project_stages_primary_payment_data.data.name = 'primary_payment';
  post_project_stages_primary_payment_data.data.description = 'Advance Payment';
  post_project_stages_primary_payment_data.data.description_arabic  = 'دفعه  مقدمه';
  post_project_stages_primary_payment_data.data.maximum_allowed_percentage = 5;
  // post_project_stages_primary_payment_data.data.status = 4;
  post_project_stages_primary_payment_data.data.status = 0;
  post_project_stages_primary_payment_data.data.is_default = 1;
  post_project_stages_primary_payment_data.data.max_allow_pullback = 0;
  post_project_stages_primary_payment_data.data.sequence = 0;
  let post_project_stages_primary_payment_result = await GenericRepository.createData(post_project_stages_primary_payment_data);

  let project_task={};
  project_task.table='project_task_templates',
  project_task.data={
    template_stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Mobilize to Site',
    name_arabic:'التجهيز لمتطلبات الموقع',
    status:1,
    Type:'Custom Request',
    Type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data=await GenericRepository.createData(project_task);

  let project_task_second={};
  project_task_second.table='project_task_templates',
  project_task_second.data={
    template_stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Issuance of Building Permit ',
    name_arabic:'الشروع في البناء من البلدية المحلية',
    status:1,
    Type:'Custom Request',
    Type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data_second=await GenericRepository.createData(project_task_second);

  let project_task_third={};
  project_task_third.table='project_task_templates',
  project_task_third.data={
    template_stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Advance Payment ',
    name_arabic:  'دفع الدفعة المقدمة' ,
    status:1,
    Type:'Invoice Payment',
    Type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_third=await GenericRepository.createData(project_task_third);

  let project_task_fourth={};
  project_task_fourth.table='project_task_templates',
  project_task_fourth.data={
    template_stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Appoint Consultant ',
    name_arabic:  'تعيين الإستشاري'  ,
    status:1,
    Type:'Custom Request',
    Type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_fourth=await GenericRepository.createData(project_task_fourth);




  

  
  let post_project_stages_maintenance_data = {};
  post_project_stages_maintenance_data.table = 'project_stage_templates';
  post_project_stages_maintenance_data.data = {};
  post_project_stages_maintenance_data.data.project_template_id = template_add.id;
  post_project_stages_maintenance_data.data.name = 'maintenance';
  post_project_stages_maintenance_data.data.description = 'maintenance Period';
  post_project_stages_maintenance_data.data.description_arabic = 'فترة  صيانة';
  post_project_stages_maintenance_data.data.maximum_allowed_percentage = 5;
  // post_project_stages_maintenance_data.data.status = 4;
  post_project_stages_maintenance_data.data.status = 0;
  post_project_stages_maintenance_data.data.is_default = 1;
  post_project_stages_maintenance_data.data.max_allow_pullback = 0;
  post_project_stages_maintenance_data.data.sequence = 0;
  let post_project_stages_maintenance_result = await GenericRepository.createData(post_project_stages_maintenance_data);


  let project_task_maintain={};
  project_task_maintain.table='project_task_templates',
  project_task_maintain.data={
    template_stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Complete all maintenance requirements ',
    name_arabic:'   إكمال جميع متطلبات الصيانة ',
    status:1,
    Type:'Custom Request',
    Type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'

  }

  let project_task_maintain_data=await GenericRepository.createData(project_task_maintain);


  let project_task_mintain_second={};
  project_task_mintain_second.table='project_task_templates',
  project_task_mintain_second.data={
    template_stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Witness and Approve completion of Maintenance Tasks ',
    name_arabic:   'الشهادة والموافقة الكتابية على إكتمال صيانة المبنى',
    status:1,
    Type:'Inspection Request',
    Type_arabic:'طلب تفتيش',
    creator:'system',
    assignee:'Consultant '


  }

  let project_task_mintain_second_data=await GenericRepository.createData(project_task_mintain_second);


  let project_task_mintain_third={};
  project_task_mintain_third.table='project_task_templates',
  project_task_mintain_third.data={
    template_stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Final Payment ',
    name_arabic:   'دفع الدفعة الأخيرة عند انتهاء الأعمال و موافقة الإستشاري',
    status:1,
    Type:'Invoice Payment',
    Type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client  '


  }

  let project_task_mintain_third_data=await GenericRepository.createData(project_task_mintain_third);





  return res.send({status:200,message:'template add',purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}


/* template-task-list
method:PUT
input:body[template_id],
output:data,
purpose:Project template show"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/template-task-list:
 *  get:
 *   tags:
 *    - Template Management
 *   parameters:
 *    - in: query
 *      name: template_id
 *      required: true
 *      schema:
 *       type: integer
 *   requestBody:
 *    description: 
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            page:
 *              type: integer
 *            limit:
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

ProjectTemplateController.templateTaskShow=async(req,res)=>{
  try{

    let page = parseInt(req.body.page);
    let limit = parseInt(req.body.limit);
    let offset = limit*(page-1);
    let purpose='template task view';
    var template={};
    template.table='task_templates_data',
    template.where={template_stage_id:req.query.template_id,is_deleted:0};
  
   let template_show=await GenericRepository.fetchData(template);
  return res.send({status:200,message:'template task view',data:template_show,purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}

/* template-task-add
method:POST
input:body[name],
output:data,
purpose:Project template add"
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/template-task-add:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
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

ProjectTemplateController.templateTaskAddData=async(req,res)=>{
  try{
      let purpose='template task add';
  var template={};
  template.table='task_templates',
  //template.where={id:req.body.id};
  template.data={
    name:req.body.name
  }
  
  let template_add=await GenericRepository.createData(template);

  return res.send({status:200,message:'task templated add successfully'});
  }
  catch(err){
    console.trace(err)

      res.send({status:500, err:err,purpose:purpose});

  }
}

/* template-task-list
method:GET
input:query[search_text],
output:data,
purpose:Project template show"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/template-task-view:
 *  get:
 *   tags:
 *    - Template Management
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: integer
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: integer
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

ProjectTemplateController.templateTaskListShow=async(req,res)=>{
  try{

    if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
    if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let offset = limit*(page-1);

      let purpose='template view';
       var template={};
       template.table='task_templates_data';
  
  let and_data=[];
  let or_data=[];
  and_data.push({is_deleted:0});

  if(req.query.search_text)
  {
    

    or_data.push({name:{$like:'%'+req.query.search_text+'%'}});
    or_data.push({name_arabic:{$like:'%'+req.query.search_text+'%'}});
  
    
  }
  

  if(or_data.length > 0){
    template.where= { $or:or_data,$and:and_data};
  }else{
    template.where= and_data ;
  }
  let order=[[]];
  order=[['id','DESC']]

  
  let template_show=await GenericRepository.fetchDatalimit(template,limit,offset,order);
  return res.send({status:200,message:'template view',data:template_show,purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}

/* template-task-delete
method:PUT
input:BODY[id],
output:data,
purpose:Project template delete"
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/project-template-task-delete:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

ProjectTemplateController.templateTaskDelete=async(req,res)=>{
  try{
      let purpose='template delete';
  var template={};
  template.table='task_templates',
  template.where={id:req.body.id};
  template.data={
     is_delete:1
  }
  let template_delete=await GenericRepository.updateData(template);
  return res.send({status:200,message:'template deleted',purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}


/* template-task-add
method:POST
input:BODY[data],
output:data,
purpose:Project task template add"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-template-task-add:
 *  post:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            data:
 *              type: array
 *              items:
 *                properties:
 *                    template_stage_id:
 *                      type: integer
 *                    name:
 *                      type: string
 *                    name_arabic:
 *                      type: string
 *                    status:
 *                      type: integer
 *                    type:
 *                      type: string
 *                    type_arabic:
 *                      type: string
 *                    instruction:
 *                      type: string
 *                    instruction_arabic:
 *                      type: string
 *                    creator:
 *                      type: string
 *                    assignee:
 *                      type: string
 *                    is_deleted:
 *                      type: integer
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

ProjectTemplateController.templateTaskDataAdd=async(req,res)=>{
  try{

    if (!req.body.data) return res.status(422).json({ status: 422,message: "data is required", fieldObject: 'body' });

      let purpose='template task add'

      let data = {};
      data = req.body.data;

      data.forEach(async function (item, index, arr) {
        if (item.id) {
          let project_tasks = {};
          project_tasks.table = 'task_templates_data',
            project_tasks.data = {
              //stage_id:req.body.stage_id,
              template_stage_id:item.template_stage_id,
              name: item.name,
              name_arabic:item.name_arabic,
              status: item.status,
              Type: item.type,
              Type_arabic:item.type_arabic,
              Instruction: item.instruction,
              instruction_arabic:item.instruction_arabic,
              creator: item.creator,
              assignee: item.assignee,
              is_delete: item.is_deleted

            }
          project_tasks.where = {};
          project_tasks.where.id = item.id
          let project_tasks_table = await GenericRepository.updateData(project_tasks);
        }

        else {
          let project_tasks = {};
          project_tasks.table = 'task_templates_data',
            project_tasks.data = {
              template_stage_id:item.template_stage_id,
              name: item.name,
              name_arabic:item.name_arabic,
              status: item.status,
              Type: item.type,
              Type_arabic:item.type_arabic,
              Instruction: item.instruction,
              instruction_arabic:item.instruction_arabic,
              creator: item.creator,
              assignee: item.assignee,
              // is_delete:item.is_delete

            }

          let project_tasks_create = await GenericRepository.createData(project_tasks);
        }
      })
  
        
  return res.send({status:200,message:'task template add',purpose:purpose})
  }
 
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}


/* task-template-delete
method:PUT
input:BODY[id],
output:data,
purpose:Project task template delete"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/task-template-delete:
 *  put:
 *   tags:
 *    - Template Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

ProjectTemplateController.taskDelete=async(req,res)=>{
  try{
      let purpose='template delete';
  var template={};
  template.table='task_templates_data',
  template.where={id:req.body.id};
  template.data={
    is_deleted:1
  }
  let template_delete=await GenericRepository.updateData(template);
  return res.send({status:200,message:'template deleted',purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}


/* template-task-id
method:PUT
input:query[id],
output:data,
purpose:Project task template show"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/template-task-id:
 *  get:
 *   tags:
 *    - Template Management
 *   parameters:
 *    - in: query
 *      name: id
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

ProjectTemplateController.taskTempleShowId=async(req,res)=>{
  try{
      let purpose='template show';
       var template={};
       template.table='task_templates_data',
      template.where={id:req.query.id};
  
      let template_delete=await GenericRepository.fetchData(template);
  return res.send({status:200,data:template_delete,message:'template show',purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}

/* task-template-dropdown
method:GET
input:BODY[],
output:data,
purpose:Project task template delete"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/template-task-dropdown:
 *  get:
 *   tags:
 *    - Template Management
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


ProjectTemplateController.templateTaskShowDropdown=async(req,res)=>{
  try{

   
    let purpose='template task view';
    var template={};
    template.table='task_templates_data',
    template.where={is_deleted:0};
  
   let template_show=await GenericRepository.fetchData(template);
  return res.send({status:200,message:'template task view',data:template_show,purpose:purpose})
 }
 catch(err){
     console.trace(err)
 
       res.send({status:500, err:err,purpose:purpose});
 
   }

}


module.exports = ProjectTemplateController
