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

impersonatecontroller={};

 /* impersonate
method:POST
input:body[id,role],
output:data,
purpose:validation entry"
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/impersonate:
 *  post:
 *   tags:
 *    - Impersonate
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
 *            role:
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

impersonatecontroller.validationEntry=async(req,res)=>{
    try{
        let purpose='impersonate'

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
        let validation={};
        validation.table='validation',
        validation.data={
            uid:req.body.id,
            role:req.body.role,
            validation_type:'impersonate',
            validation_hash:validationhash

        }
        let validation_entry=await GenericRepository.createData(validation);

        return res.send({status:200,message:'impersonate',purpose:purpose,data:validation_entry.dataValues.validation_hash});

    }
    catch(err){
        console.trace(err)
    
          res.send({status:500, err:err,purpose:purpose});
    
      }
}


/* impersonate-login
method:POST
input:body[validationhash],
output:data,
purpose:login
created by Sayanti Nath
*/



/**
 * @swagger
 * /api/admin/impersonate-login:
 *  post:
 *   tags:
 *    - Impersonate
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            validationhash:
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

impersonatecontroller.login=async(req,res)=>{
    try{
    var data={};
    data.table='user'

    let validation={};
        validation.table='validation',
        validation.where={
           
            validation_hash:req.body.validationhash

        }
        let validation_fetch=await GenericRepository.fetchData(validation);

        if(validation_fetch.rows.length>0){

            if(validation_fetch.rows[0].dataValues.is_expired==1){
                return res.send({status:400,message:'hash already expired'})
            }

            let validation_update={};
            validation_update.table='validation',
            validation_update.where={id:validation_fetch.rows[0].dataValues.id}
            validation_update.data={
                is_expired:1,
                is_verified:1
            }

            let validation_expire=await GenericRepository.updateData(validation_update);

            let user={};
            user.table='user',
            user.where={id:validation_fetch.rows[0].dataValues.uid}
            let user_fetch=await GenericRepository.fetchData(user);
            if(user_fetch){
                console.log(user_fetch);
           if(user_fetch.rows[0].dataValues.is_active == 0){
                return res.send({status:401, message:'User is deactivated'});
            }
            

            else{
                CommonValidationMiddleware.generateRefreshAndAccessToken(data.table, user_fetch.rows[0].id).then(async (token) =>   {
                    var data = {};
                    data.access_token = token.accessToken
                    data.refresh_token = token.refreshToken
                    data.role = 'user';
                    if(user_fetch.rows[0].dataValues.is_complete === 0 && user_fetch.rows[0].dataValues.user_type == 3){
                        var message = "Incomplete Signup.Please fillup the all required Fields";
                    }else{
                        var message = "Logged in successfully";
                    }
    
                    if(user_fetch.rows[0].dataValues.user_type==3){
                        let project_bid={};
                        project_bid.table='project_bids',
                        project_bid.where={contractor_id:user_fetch.rows[0].dataValues.id};
                        let project_bid_fetch=await GenericRepository.fetchData(project_bid);
                        console.log(project_bid_fetch);
                        data.bid_count=project_bid_fetch.rows.length;
    
                    }
                    data.is_complete = user_fetch.rows[0].dataValues.is_complete;
                    data.id = user_fetch.rows[0].dataValues.id;
                    data.user_type=user_fetch.rows[0].dataValues.user_type;
                    data.status=user_fetch.rows[0].dataValues.status;
                    data.email=user_fetch.rows[0].dataValues.email;
                    data.full_name=user_fetch.rows[0].dataValues.full_name;
                  //   data.user_type = req.body.user_type;
                    return res.json({
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
        }

   else
    {
    return res.send({status:400,message:'user dont exist'})
     }




}

        else{
            return res.send({status:500,message:'hash mismatch,you cant log in'})
        }


}
catch(err){
    console.trace(err)

      res.send({status:500, err:err,purpose:purpose});

  }
}





module.exports = impersonatecontroller