var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('../repositories/ConsultationhubRepository');
var CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const { validationResult } = require('express-validator/check');
const commonFunnction = require('../helper/commonFunction');
const _ = require('lodash');
const Sequelize = require(global.appPath + '/config/database')

var publicVar = {};

/**verify-email-link_of-admin-consultant API
method:POST
input:body[validation_hash],
output:data
purpose:To verify the link
created by arijit saha
*/




publicVar.verify_email_link_of_admin_consultant = function(req, res){
    (async()=>{
        let send_data = await new Promise(function(resolve, reject){
            let send_data = {};
            let check_validation_data = {};
            check_validation_data.table = 'validation';
            check_validation_data.where = {};
            check_validation_data.where.validation_hash = req.body.validation_hash;
            GenericRepository.fetchData(check_validation_data).then(check_validation_result=>{
                if(check_validation_result.rows.length > 0){
                    if(check_validation_result.rows[0].dataValues.is_expired == 1){
                        return res.send({status:403, message:'Invitation link is already expired'});
                    }
                    else{
                        send_data.id = check_validation_result.rows[0].dataValues.id;
                        send_data.ref_email = check_validation_result.rows[0].dataValues.ref_email;
                        send_data.is_expired = check_validation_result.rows[0].dataValues.is_expired;
                        resolve(send_data);
                    }
                }
                else{
                    return res.send({status:404, message:'No such invitation link found'});
                }
            }).catch(check_validation_err=>{
                console.log(check_validation_err);
                return res.send({status:500, message:'Something went wrong'});
            })
        }).then(result=>{
            return result;
        }).catch(err=>{
            console.log(err);
            return res.send({status:500, message:'Something went wrong'});
        })
        return res.send({status:200, message:'Invitation link details',purpose:'Invitation link details', data:send_data});
    })()
}



/**admin-consultant-register API
method:POST
input:body[company_name,emailphone,company_services,company_engineers,project_image_ids],
output:data
purpose:To register consultent
created by arijit saha
*/
publicVar.adminConsultantRegister = function(req, res){
    (async()=>{
        try{
            // console.log(JSON.parse(req.body.company_services));
            // console.log(JSON.parse(req.body.company_services)[0].resource_ids);
            // return;
            //await Sequelize.transaction(async (t) => {
            let user={};
            user.table='user',
            user.data={
                email:req.body.email,
                phone:req.body.phone,
                company_name:req.body.company_name,
                user_type:2
            }
            //if(req.body.password)
           // await sequelize.transaction(async (t) => {
            let user_create=await GenericRepository.createData(user);
            console.log(user_create.dataValues.id);
            let duplicate_data_check = await new Promise(function(resolve, reject){
                let duplicate_data_check = {};
                duplicate_data_check.table = 'admin_consultants';
                duplicate_data_check.where = {};
                duplicate_data_check.where.email = req.body.email;
                GenericRepository.fetchData(duplicate_data_check).then(duplicate_data_check_result=>{
                    if(duplicate_data_check_result.rows.length > 0){
                        return res.send({status:409, message:'An user with this email is already exists.'});
                    }
                    else{
                        resolve();
                    }
                })
            })
            let new_registered_id = await new Promise(function(resolve, reject){
                let new_registered_id;
                let admin_consultant_data = {};
                admin_consultant_data.table = 'admin_consultants';
                admin_consultant_data.data = {};
                admin_consultant_data.data.company_name = req.body.company_name;
                admin_consultant_data.data.email = req.body.email;
                admin_consultant_data.data.user_id=user_create.dataValues.id,
                admin_consultant_data.data.status = 0
                if(req.files){
                    if(Object.keys(req.files).length > 0){
                        if(Object.keys(req.files).indexOf('company_logo') > -1 ){
                            admin_consultant_data.data.company_logo = global.constants.IMG_URL.profile_photo+req.files.company_logo[0].filename;
                        }
                    }
                }

                admin_consultant_data.data.phone = req.body.phone;
                if(req.body.facebook_link){
                    admin_consultant_data.data.facebook_link = req.body.facebook_link;
                }
                if(req.body.linkedIn_link){
                    admin_consultant_data.data.linkedIn_link = req.body.linkedIn_link;
                }
                if(req.body.instagram_link){
                    admin_consultant_data.data.instagram_link = req.body.instagram_link;
                }
                if(req.body.website_link){
                    admin_consultant_data.data.website_link = req.body.website_link;
                }
                if(req.body.pinterest_link){
                    admin_consultant_data.data.pinterest_link = req.body.pinterest_link;
                }
                if(req.body.whatsapp_no){
                    admin_consultant_data.data.whatsapp_no = req.body.whatsapp_no;
                }
                if(req.body.company_profile){
                    admin_consultant_data.data.company_profile = req.body.company_profile;
                }
                if(req.body.established_year){
                    admin_consultant_data.data.established_year=req.body.established_year;

                }
                console.log(admin_consultant_data);
                GenericRepository.createData(admin_consultant_data).then(admin_consultant_result=>{
                    new_registered_id = admin_consultant_result.dataValues.id;
                    resolve(new_registered_id);
                })
                .catch(admin_consultant_err=>{
                    console.log(admin_consultant_err);
                })
            })
            console.log(new_registered_id)
            let insert_company_services = await new Promise(function(resolve, reject){
                for(let i = 0; i < JSON.parse(req.body.company_services).length; i++){
                    let company_services_data = {};
                    company_services_data.table = 'company_services';
                    company_services_data.data = {};
                    company_services_data.data.user_id = new_registered_id;
                    company_services_data.data.user_type = 1;
                    company_services_data.data.Service_id = JSON.parse(req.body.company_services)[i].Service_id;  
                    company_services_data.data.Service_description = JSON.parse(req.body.company_services)[i].Service_description;
                    console.log('********** company_services_data **********', company_services_data)
                    GenericRepository.createData(company_services_data).then(company_services_result=>{
                        if(i == JSON.parse(req.body.company_services).length - 1){
                            resolve();
                        }
                    }).catch(company_services_err=>{
                        console.log(company_services_err);
                    })  
                }

            })
            let insert_company_engineers = await new Promise(function(resolve, reject){
                for(let i = 0; i < JSON.parse(req.body.company_engineers).length; i++){
                    let company_engineers_data = {};
                    company_engineers_data.table = 'company_engineers';
                    company_engineers_data.data = {};
                    company_engineers_data.data.user_id = new_registered_id;
                    company_engineers_data.data.user_type = 1;
                    company_engineers_data.data.name = JSON.parse(req.body.company_engineers)[i].name;
                    // company_engineers_data.data.cv = JSON.parse(req.body.company_engineers)[i].cv;
                    company_engineers_data.data.type = JSON.parse(req.body.company_engineers)[i].type;
                    company_engineers_data.data.linkedIn_profile = JSON.parse(req.body.company_engineers)[i].linkedIn_profile;
                    company_engineers_data.data.facebook_profile = JSON.parse(req.body.company_engineers)[i].facebook_profile;
                    company_engineers_data.data.instagram_profile = JSON.parse(req.body.company_engineers)[i].instagram_profile;
                    GenericRepository.createData(company_engineers_data).then(company_engineers_result=>{
                        if(JSON.parse(req.body.company_engineers)[i].resource_ids || JSON.parse(req.body.company_engineers)[i].resource_ids.length > 0){
                            let update_resource_data = {};
                            update_resource_data.table = 'resources';
                            update_resource_data.where = {};
                            update_resource_data.where.id = {$in:JSON.parse(req.body.company_engineers)[i].resource_ids}
                            update_resource_data.data = {};
                            update_resource_data.data.user_id = company_engineers_result.dataValues.id;
                            update_resource_data.data.is_active = 1;
                            GenericRepository.updateData(update_resource_data).then(update_resource_result=>{
                                if(i == JSON.parse(req.body.company_engineers).length - 1){
                                    resolve();
                                }
                            }).catch(update_resource_err=>{
                                console.log(update_resource_err);
                            })

                        }
                        else{
                            if(i == JSON.parse(req.body.company_engineers).length - 1){
                                resolve();
                            }
                        }

                    }).catch(company_engineers_err=>{
                        console.log(company_engineers_err);
                    })  
                }

            })
            //////////////// Previous Projects Upload not done yet //////////////
            let update_resource_data_for_company_projects = await new Promise(function(resolve, reject){
                if(req.body.project_image_ids.length > 0){
                    let update_resource_data = {};
                    update_resource_data.table = 'resources';
                    update_resource_data.where = {};
                    update_resource_data.where.id = {$in:JSON.parse(req.body.project_image_ids)}
                    // update_resource_data.where.id = req.body.project_image_ids
                    update_resource_data.data = {};
                    update_resource_data.data.user_id = new_registered_id;
                    GenericRepository.updateData(update_resource_data).then(update_resource_result=>{
                        resolve()
                    }).catch(update_resource_err=>{
                        console.log(update_resource_err);
                    })
                }
                else{
                    resolve()
                }

            })
            let expire_link = await new Promise(function(resolve, reject){
                let validation_data = {};
                validation_data.table = 'validation';
                validation_data.where = {};
                validation_data.where.id = parseInt(req.body.id);
                validation_data.data = {};
                validation_data.data.is_expired = 1;
                validation_data.data.is_verified = 1;
                GenericRepository.updateData(validation_data).then(validation_result=>{
                    resolve()
                }).catch(validation_err=>{
                    console.log(validation_err);
                })
            })
            return res.send({status:201, message:'Registered successfully', purpose:'To register an admin consultant',data:[]});
       // })
        }
        catch(err){
            console.trace(err)
            res.send({status:500, mesage:'Something went wrong'});
        }
    })()
}

// publicVar.updateAdminConsultant = function(req, res){
//     (async()=>{
//         try{
//             let update_admin_consultant_data = await new Promise(function(resolve, reject){
//                 for(let i = 0; i < JSON.parse(req.body.company_engineers).length; i++){
//                     // console.log(JSON.parse(req.body.company_engineers)[i]);
//                     //// now Each item here ////

//                     if(i == JSON.parse(req.body.company_engineers).length - 1){
//                         resolve()
//                     }
//                 }

//             })
//         }
//         catch(err){
//             return res.send({status:500, :'Something went wrong'});
//         }msg
//     })()

// }


/**admin-consultant-register API
method:PUT
input:body[company_name,phone,company_services,company_engineers,project_image_ids],
output:data
purpose:To update consultent
created by arijit saha
*/

/**
 * @swagger
 * /api/admin/update-admin-consultant-profile:
 *  put:
 *   tags:
 *    - Admin consultant
 *   requestBody:
 *    description: update admin consultant profile
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            admin_consultant_id:
 *              type: integer
 *            company_name:
 *              type: string
 *            company_services:
 *              type: integer
 *            company_engineers:
 *              type: integer
 *            project_image_ids:
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

publicVar.updateAdminConsultant = async function(req, res){
    (async()=>{
        try{


            console.log(req.body);

            let admin_consultant_data = {};
            admin_consultant_data.table = 'admin_consultants';
            admin_consultant_data.data = {};
            admin_consultant_data.where={id:req.body.admin_consultant_id};

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
                    company_services_data.data.Service_id =  item.Service_id;  
                    company_services_data.data.Service_description = item.Service_description;
                   let comapny_eng_update=await GenericRepository.updateData(company_services_data)
                }
                else{

                    let company_services_data_add= {};
                    company_services_data_add.table = 'company_services';
                    company_services_data_add.data = {};
                    company_services_data_add.data.user_id = req.body.admin_consultant_id;
                    company_services_data_add.data.user_type = 1;
                    company_services_data_add.data.Service_id=  item.Service_id;  
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
                  console.log(item);


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

                        if(item.project_image_ids){
                            let update_resource_data = {};
                            update_resource_data.table = 'resources';
                            update_resource_data.where = {};
                            update_resource_data.where.id = {$in:item.project_image_ids}
                            // update_resource_data.where.id = req.body.project_image_ids
                            update_resource_data.data = {};
                            update_resource_data.data.user_id = req.body.admin_consultant_id;
                            let resource_update=await GenericRepository.updateData(update_resource_data)
                        }

                }
                        
                    
                    // if(i == JSON.parse(req.body.company_engineers).length - 1){
                    //     resolve()
                    // }
                })

            
        }
            return res.send({status:200, message:'Profile is updated successfully', purpose:'To update company engineers profile of Admin Consultant'});
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()

}

/**details-of-article-invitation-link API
method:POST
input:body[validation_hash],
output:data
purpose:To verify the link
created by arijit saha
*/


publicVar.getDetailsOfArticleInvitationLink = function(req, res){
    (async()=>{
        try{
            let check_link_is_expired = await new Promise(function(resolve, reject){
                let check_validation_data = {};
                check_validation_data.table = 'validation';
                check_validation_data.where = {};
                check_validation_data.where.validation_hash = req.query.validation_hash;
                GenericRepository.fetchData(check_validation_data).then(check_validation_result=>{
                    if(check_validation_result.rows.length > 0){
                        if(check_validation_result.rows[0].dataValues.is_expired == 1){
                            return res.send({status:200, msg:'Link is already expired', message:'Link is already expired'})
                        }
                        else{
                            resolve();
                        }
                    }
                    else{
                        return res.send({status:404, msg:'No such link exists', mesage:'No such link exists'});
                    }
                }).catch(check_validation_err=>{
                    console.log(check_validation_err);
                })
            })
            let get_validation_details = await new Promise(function(resolve, reject){
                let get_validation_details;
                let validation_where = {};
                validation_where.validation_hash = req.query.validation_hash;
                ConsultationhubRepository.fetchValidationData(validation_where).then(validation_result=>{
                    get_validation_details = validation_result;
                    resolve(get_validation_details);
                }).catch(validation_err=>{
                    console.log(validation_err);
                })
            })
            return res.send({status:200, msg:'Validation details', data:get_validation_details, message:'Validation details', data:get_validation_details})
        }
        catch(error){
            return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'})
        }
    })()
}

// publicVar.submitArticle = function(req, res){

// }


/**upload-company-engineer-profile-picture API
method:POST
input:body[image],
output:data
purpose:To upload profile photo
created by arijit saha
*/
publicVar.uploadCompnayEngineerProfilePicture = function(req, res){
    (async()=>{
        try{
            let upload_profile_image = await new Promise(function(resolve, reject){
                let upload_image_result;
                let resource_data = {};
                resource_data.table = 'resources';
                resource_data.data = {};
                resource_data.data.resource_type = 'image';
                resource_data.data.resource_url = global.constants.IMG_URL.company_engineer_profile_photo+req.files.image[0].filename;
                resource_data.data.type = 'company_engineer_profile_photo';
                GenericRepository.createData(resource_data).then(resource_result=>{
                    upload_image_result = resource_result;
                    resolve(upload_image_result)
                }).catch(resource_err=>{
                    console.log(resource_err);
                })

            })
            return res.send({status:201, message:'Image uploaded successfully', purpose:'To upload profile image of Company engineers', data:upload_profile_image});
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}


/**upload-company-engineer-cv API
method:POST
input:body[file],
output:data
purpose:To upload cv
created by arijit saha
*/
publicVar.uploadCompnayEngineerCv = function(req, res){
    (async()=>{
        try{
            let upload_profile_cv = await new Promise(function(resolve, reject){
                let upload_image_result;
                let resource_data = {};
                resource_data.table = 'resources';
                resource_data.data = {};
                resource_data.data.resource_type = 'pdf';
                resource_data.data.resource_url = global.constants.IMG_URL.company_engineer_cv+req.files.image[0].filename;
                resource_data.data.type = 'company_engineer_cv';
                GenericRepository.createData(resource_data).then(resource_result=>{
                    upload_image_result = resource_result;
                    resolve(upload_image_result)
                }).catch(resource_err=>{
                    console.log(resource_err);
                })

            })
            return res.send({status:201, message:'CV uploaded successfully', purpose:'To upload CV of Company engineers', data:upload_profile_cv});
        }
        catch(err){
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}

/**upload-admin-consultant-project API
method:POST
input:body[file],
output:data
purpose:To project photo
created by arijit saha
*/
publicVar.uploadAdminConsultantProjectImages = function(req, res){
    (async()=>{
        try{
            let upload_project_images = await new Promise(function(resolve, reject){
                var new_created_project_ids = [];
                if(!_.isEmpty(req.files)){
                    for(let i = 0; i < req.files.image.length; i++){
                        // console.log('************* File name****************', req.files.gallery_photos[i].filename);
                        let resource_data = {};
                        resource_data.table = 'resources';
                        resource_data.data = {};
                        resource_data.data.resource_type = 'image';
                        resource_data.data.resource_url = global.constants.IMG_URL.project_images+req.files.image[i].filename;
                        resource_data.data.type = 'admin_consultant_project';
                        GenericRepository.createData(resource_data).then(photos_data_result=>{
                            new_created_project_ids.push(photos_data_result.dataValues.id);
                            if(i == req.files.image.length - 1){
                                resolve(new_created_project_ids);
                            }
                        }).catch(photos_data_err=>{
                            console.log(1503, photos_data_err);
                            // if(i == req.files.image.length - 1){
                            //     add_new_photos = 0;
                            //     reject(add_new_photos);
                            // }
                        })
                    }
                }
                else{
                    resolve(new_created_project_ids)
                }

            })
            return res.send({status:201, message:'Project images uploaded successfully', purpose:'To upload project images of admin consultant', data:upload_project_images});
        }
        catch(err){
            console.trace(err)
            return res.send({status:500, message:'Something went wrong'});
        }
    })()
}

/**update-company-logo API
method:PUT
input:body[ID,company_logo],
output:data
purpose:To update company logo
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/update-company-logo:
 *  put:
 *   tags:
 *    - Admin consultant
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            company_logo:
 *              type: string
 *              format: binary
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

publicVar.updateCompanyLogo=async function(req,res){

    try{



    let comapny_logo={};
    comapny_logo.table= 'admin_consultants'
    comapny_logo.where={id:req.body.id};
    comapny_logo.data={company_logo :global.constants.IMG_URL.profile_photo+req.files.company_logo[0].filename}

    let company_logo_data=await GenericRepository.updateData(comapny_logo);

    return res.send({status:200, message:'company logo updated',resp:global.constants.IMG_URL.profile_photo+req.files.company_logo[0].filename});
    }
    catch(err){
        console.trace(err)
        return res.send({status:500, message:'Something went wrong'});
    }





}

/**pervious-projects API
method:Put
input:body[ID,image],
output:data
purpose:To update pervious projects
created by sayanti nath
*/


/**
 * @swagger
 * /api/admin/pervious-projects:
 *  post:
 *   tags:
 *    - Admin consultant
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            image:
 *              type: string
 *              format: binary
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
publicVar.perviousImages=async(req,res)=>{

    try
    {

       let pervious_projects={};
    pervious_projects.table='resources';
   
    if(req.body.id){
        console.log(global.constants.IMG_URL.project_images+req.files.image[0].filename);
        pervious_projects.where={id:req.body.id};
        pervious_projects.data={
            resource_url:global.constants.IMG_URL.project_images+req.files.image.filename
        }

        let pervious_projects_data=await GenericRepository.updateData(pervious_projects);

    }

    else{

        pervious_projects.data={
            resource_type : 'image',
            type : 'admin_consultant_project',
            user_id:req.body.admin_consultant_id,
            resource_url:global.constants.IMG_URL.project_images+req.files.image[0].filename
        }
            let pervious_projects_data=await GenericRepository.createData(pervious_projects);

        }

        return res.send({status:200,message:'pervious projects updated',data:global.constants.IMG_URL.project_images+req.files.image[0].filename})



}
catch(err){
    console.trace(err)
    return res.send({status:500, message:'Something went wrong'});
}



}



/**project-status API
method:Put
input:body[ID],
output:data
purpose:To update status
created by sayanti nath
*/


/**
 * @swagger
 * /api/admin/project-image-status:
 *  put:
 *   tags:
 *    - Admin consultant
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      'multipart/form-data':  
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
publicVar.imagesStatusUpdate=async(req,res)=>{

    try{
    let project_status={};
    project_status.table='resources';
    project_status.where={id:req.body.id};
    project_status.data={
        is_delete:1
    }

    let project_status_update=await GenericRepository.updateData(project_status);

    return res.send({status:200,message:'project images deleted',purpose:'project images deleted',data:[]});
}
catch(err){
    console.trace(err)
    return res.send({status:500, message:'Something went wrong'});
}

}

/**fetch-service
method:GET
input:body[],
output:data
purpose:To fetch
>>>>>>> 888341ce50a0a97b08bc879e688912618be2421d
created by sayanti nath
*/

publicVar.fetchServices=async(req,res)=>{
    try{
        let services={};
        services.table='master_services',
        services.where={};
        let services_fetch=await GenericRepository.fetchData(services);
        return res.send({status:200,message:'services',purpose:'services',data:services_fetch});

    }
    catch(err){
        console.trace(err)
        return res.send({status:500, message:'Something went wrong'});
    }
    
}


module.exports = publicVar