require('dotenv').config();
const { validationResult } = require('express-validator/check');
var GenericRepository = require('.././repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
const md5 = require('md5');
const  CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const mailfunction=require('../middlewares/mailfunction');
const sequelize = require('../config/database').sequelize;



var ConsultenthubController = {};

/**invite API
method:GET,
input:body[email]
purpose:To get send invite of Ebinaa consultenthub.
created by sayanti nath
*/

ConsultenthubController.invite=(req,res)=>{
    let email=req.body.email;
    let url='http://localhost:4055/api/client/consultenthub'
    global.eventEmitter.emit('sendinvite',email, url);
    res.json({
        status:200,
		msg:'link send to your email',
        message:'link send to your email'
		
    })
}

/**Consultation-Hub API
method:GET,
input:body[page,limit,search_text]
purpose:To get list of Consultancy hub form and search.
created by sayanti nath
*/
/**
     * To get list of Consultancy hub form.
     * @param {Number} `page` 
     * @param {Number} `limit` 
	 * @param {Number} `search_text`
     * @return {JSON} success/error-response
	 * 
*/

/**
 * @swagger
 * /api/admin/consultation-hub:
 *  get:
 *   tags:
 *    - Consultation Hub
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

ConsultenthubController.fetchConsultantHub = function(req,res){
		
			(async()=>{
	
					try{ 
		
							let data = {};
		
							data.where = {};
	
					let page = parseInt(req.query.page);
		
					let limit = parseInt(req.query.limit);
		
					let offset = limit*(page-1);	
					let and_data = [];
		
					let or_data = [];
		
					let where = [];
		
					console.log("///////////////////////");
		
					
		
					 and_data.push({is_delete:0});
		
					 console.log("///////////////////////");
		
					
		
	 
	
			 if(req.query.search_text != "")
	
			 {
		
					 or_data.push({company_name:{$like:'%'+req.query.search_text+'%'}});
		
					 or_data.push({email:{$like:'%'+req.query.search_text+'%'}});
		
					 or_data.push({phone:{$like:'%'+req.query.search_text+'%'}});
		
			 }
		
	 
			 console.log(or_data.length)
		
							if(or_data.length > 0){
		
							where={ $or:or_data,$and:and_data};
	
							}else{

							where= and_data ;

							}
		
							data.where = where;
							data.limit = limit;
		
							data.offset = offset;
							let sort_by = ['id','DESC']

							let fetchConsultantHub = await ConsultationhubRepository.fetchConsultantHubData(data, sort_by);

							let information={};
							information.table='admin_consultants',
							
							information.where={};

							let coun_data=await GenericRepository.fetchData(information)
							//console.log(coun_data)
							
		
							console.log(fetchConsultantHub.rows.length);
		
							return res.send({status:200,message:'fetch consultant hub',purpose:'fetch consultant hub', totalcounts:coun_data.rows.length,search_count:fetchConsultantHub.rows.length,data:fetchConsultantHub});
		
		
					} catch(err){
		
					// console.trace(err)
		
					res.send({status:500, err:err});
		
					}
		
		
			})();


}

/**Consultation-Hub-Frontend API
method:GET,
input:body[page,limit,search_text]
purpose:To get list of Consultancy hub form and search.
created by sayanti nath
*/



/**
 * @swagger
 * /api/admin/consultation-hub-frontend:
 *  get:
 *   tags:
 *    - Consultation Hub
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

ConsultenthubController.fetchConsultantHubFrontend = function(req,res){
		
	(async()=>{

			try{ 

					let data = {};

					data.where = {};

			let page = parseInt(req.query.page);

			let limit = parseInt(req.query.limit);

			let offset = limit*(page-1);	
			let and_data = [];

			let or_data = [];

			let where = [];

			console.log("///////////////////////");

			

			 and_data.push({is_delete:0,is_active:1});

			 console.log("///////////////////////");
			 var String = req.query.search;

           


			
			if(req.query.search!='')
			{
			req.query.search=req.query.search.split(',');
			}
			
			
			



	 if(req.query.search_text)

	 {

			 or_data.push({company_name:{$like:'%'+req.query.search_text+'%'}});

			 or_data.push({email:{$like:'%'+req.query.search_text+'%'}});

			 or_data.push({phone:{$like:'%'+req.query.search_text+'%'}});

	 }
	 if(req.query.search!='')
	 {
		 for(let i=0;i<req.query.search.length;i++){
			 console.log('//////',req.query.search[i]);
		or_data.push({id: { $in: [sequelize.literal('SELECT user_id FROM `company_services` WHERE `Service_id` ='+req.query.search[i]+'')] }}); 
		}

	 }
	
	

	 console.log(or_data.length)

					if(or_data.length > 0){

					where={ $or:or_data,$and:and_data};

					}else{

					where= and_data ;

					}

					data.where = where;
					data.limit = limit;

					data.offset = offset;
					let sort_by = ['id','DESC']
					let fetchConsultantHub = await ConsultationhubRepository.fetchConsultantHubData(data, sort_by);

					let information={};
					information.table='admin_consultants',
					
					information.where={};

					let coun_data=await GenericRepository.fetchData(information)
					//console.log(coun_data)
					

					console.log(fetchConsultantHub.rows.length);

					return res.send({status:200, message:'fetch consultant hub',purpose:'fetch consultant hub',totalcounts:coun_data.rows.length,search_count:fetchConsultantHub.rows.length,data:fetchConsultantHub});


			} catch(err){

			 console.trace(err)

			res.send({status:500, err:err});

			}


	})();


}







/**getConsultationHub API
method:POST,
input:body[page,limit]
purpose:To get list of Consultancy hub form.
created by sayanti nath
*/
/**
     * To get list of Consultancy hub form.
     * @param {Number} `page` 
     * @param {Number} `limit` 
     * @return {JSON} success/error-response
*/

/**
 * @swagger
 * /api/admin/consultation-hub:
 *  post:
 *   tags:
 *    - Consultation Hub
 *   requestBody:
 *    description: user_id  for fetch consultant-hub
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
ConsultenthubController.fetchConsultantFormDetails = function(req,res){

	   
    (async()=>{
    	try{ 
            let data = {};
    		let page = 1;
        	data.limit = 1;
        	data.offset = data.limit*(page-1);
			data.where = {is_delete:0,id:req.body.user_id};
			let sort_by = ['createdAt','DESC']
    		let fetchConsultantHub = await ConsultationhubRepository.fetchConsultantHubData(data, sort_by);
    		return res.send({status:200,message:'fetch consultant hub details',purpose:'fetch consultant hub details', data:fetchConsultantHub});

    	} catch(err){
    		res.send({status:500, err:err});
    	}

    })();
}

/**chage-status api
method:PUT
input:body[id,is_active],
output:data,
purpose:to active or deactive
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/consultion-hub-change-status:
 *  put:
 *   tags:
 *    - Consultation Hub
 *   requestBody:
 *    description: user_id  for fetch consultant-hub
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

ConsultenthubController.changeStatus=(req,res)=>{
	(async()=>{

		try{
	
		 let information={};
		 information.table='admin_consultants',
		 information.data={
		  is_active:req.body.is_active
		 }
		  information.where={},
		  information.where.user_id=req.body.id;
	   
		 
	
		 let update_status= await GenericRepository.updateData(information);

		//  let user={};
		//  user.table=''
		 if(parseInt(req.body.is_active) == 1){
		 	return res.send({status:200, msg:'Activated', message:'Activated',purpose:'user active or deactivated',data:[]});
		 }
		 else{
			return res.send({status:200, msg:'Deactivated', message:'Deactivated',purpose:'user active or deactivated',data:[]});
		 }
		 
	
	  } catch(err){
		console.trace(err)
	
		  res.send({status:500, err:err});
	
	  }
	
	   
	  })()
}

module.exports = ConsultenthubController