const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const Sequelize = require('sequelize');
const admin_consultant = require('../models/admin_consultant');



/* Importing schemas */
const  User = require('../models/user')(sequelize, DataTypes);
const  AdminConsultant = require('../models/admin_consultant')(sequelize, DataTypes);
const  CompanyEngineers = require('../models/company_engineers')(sequelize, DataTypes);
const  CompanyServices = require('../models/company_services')(sequelize, DataTypes);
const  Resource = require('../models/resource')(sequelize, DataTypes);
const  Article = require('../models/articles')(sequelize, DataTypes);
const  ArticleTopic = require('../models/article_topics')(sequelize, DataTypes);
const  Validation = require('../models/validation')(sequelize, DataTypes);
const contractor_metas=require('../models/contractor_metas')(sequelize, DataTypes);
const contractors_manpowers=require('../models/contractor_manpowers')(sequelize, DataTypes);
const project=require('../models/projects')(sequelize, DataTypes);
const project_consultants=require('../models/project_consultants')(sequelize, DataTypes);
const project_stages=require('../models/project_stages')(sequelize, DataTypes);
const project_tasks=require('../models/project_tasks')(sequelize, DataTypes);
const project_templates=require('../models/project_templates')(sequelize, DataTypes);
const project_task_templates=require('../models/project_task_templates')(sequelize, DataTypes);
const project_stage_templates=require('../models/project_stage_templates')(sequelize, DataTypes);
const project_bids=require('../models/project_bids')(sequelize, DataTypes);
const project_metas=require('../models/project_metas')(sequelize, DataTypes);
const project_scopes=require('../models/project_scopes')(sequelize, DataTypes);
const project_docs=require('../models/project_docs')(sequelize, DataTypes);
const project_doc_tags=require('../models/project_doc_tags')(sequelize, DataTypes);
const contractor_manpowers=require('../models/contractor_manpowers')(sequelize, DataTypes);
const project_stage_estimates=require('../models/project_stage_estimates')(sequelize, DataTypes);
const contract_banks=require('../models/contract_banks')(sequelize, DataTypes);
const contract_metas=require('../models/contract_metas')(sequelize, DataTypes);
const project_contracts=require('../models/project_contracts')(sequelize, DataTypes);
const section_scope_categories=require('../models/section_scope_categories')(sequelize, DataTypes);
const  master_scope_categories=require('../models/master_scope_categories')(sequelize, DataTypes);
const section_category_maps=require('../models/section_category_maps')(sequelize, DataTypes);
const  project_contract_stages=require('../models/project_contract_stages')(sequelize, DataTypes);
//const section_category_maps=require('../models/section_category_maps')(sequelize, DataTypes);
const temp_user=require('../models/temp_user')(sequelize, DataTypes);
const tmp_contractor_manpowers=require('../models/temp_contractor_manpowers')(sequelize, DataTypes);
const template_contractor_metas=require('../models/template_contractor_metas')(sequelize,DataTypes);
const task_template_data=require('../models/task_templates_data')(sequelize,DataTypes);
const notes=require('../models/notes')(sequelize,DataTypes);



/*all relations of user model will be definned here only*/
AdminConsultant.hasMany(CompanyEngineers, {foreignKey:'user_id', targetKey:'id'})
AdminConsultant.hasMany(CompanyServices, {foreignKey:'user_id', targetKey:'id'});
AdminConsultant.hasMany(Resource, {foreignKey:'user_id', targetKey:'id'});
CompanyEngineers.hasMany(Resource, {foreignKey:'user_id', targetKey:'id'});
Article.belongsTo(AdminConsultant, {foreignKey:'user_id', targetKey:'id'});
Article.hasMany(ArticleTopic, {foreignKey:'id', targetKey:'topic_id'});
Validation.belongsTo(Article, {foreignKey:'validation_meta', targetKey:'id'})
Article.belongsTo(ArticleTopic, {foreignKey:'topic_id', targetKey:'id', as:'topic_details'});
Validation.belongsTo( User, {foreignKey:'validation_meta', targetKey:'id'})
// contractor_metas.hasMany(User, {foreignKey:'contractor_id', targetKey:'id'})
project.hasMany(project_consultants,{foreignKey:'project_id',targetKey:'id'})
project_consultants.belongsTo(project,{foreignKey:'project_id',targetKey:'id'})
// project_consultants.hasMany(User,{foreignKey:'consultant_id',targetKey:'id'})
project_consultants.belongsTo(User,{foreignKey:'consultant_id',targetKey:'id', as:'user_details'})
User.hasMany(project_consultants,{foreignKey:'consultant_id',targetKey:'id'})
project.belongsTo(User,{foreignKey:'user_id', targetKey:'id'})
project.hasMany(notes,{foreignKey:'project_id', targetKey:'id'})
project.hasMany(project_stages,{foreignKey:'project_id', targetKey:'id'})
project_stages.hasMany(project_tasks,{foreignKey:'stage_id', targetKey:'id'})
project_templates.hasMany( project_stage_templates,{foreignKey:'project_template_id', targetKey:'id'})
project_stage_templates.hasMany(project_task_templates,{foreignKey:'template_stage_id', targetKey:'id'})
project_bids.belongsTo(project,{foreignKey:'project_id', targetKey:'id'})
project_bids.belongsTo(User,{foreignKey:'contractor_id', targetKey:'id'})
project.hasMany(project_bids,{foreignKey:'project_id', targetKey:'id'})
project_bids.belongsTo(User,{foreignKey:'contractor_id', targetKey:'id'})
project_metas.belongsTo(project_scopes,{foreignKey:'scope_id', targetKey:'id'})
project.hasMany(project_metas,{foreignKey:'project_id', targetKey:'id'})
project.hasMany(project_docs,{foreignKey:'project_id', targetKey:'id'})
User.hasMany(contractor_metas,{foreignKey:'contractor_id', targetKey:'id'})
User.hasMany(contractors_manpowers,{foreignKey:'contractor_id', targetKey:'id'})
User.hasMany(contractor_manpowers,{foreignKey:'contractor_id', targetKey:'id'})
project_docs.hasMany(project_doc_tags,{foreignKey:'project_doc_id', targetKey:'id',as:'tags'})
project_bids.hasMany(project_stage_estimates,{foreignKey:'bid_id', targetKey:'id'})
project_stage_estimates.belongsTo( project_stages,{foreignKey:'stage_id', targetKey:'id'})
User.hasMany(Resource, {foreignKey:'user_id', targetKey:'id'});
contract_banks.belongsTo(User,{foreignKey:'user_id',targetKey:'id'});
//contract_metas.belongsTo(project_contracts, {foreignKey:'contract_id', targetKey:'id',as:'user_details'})
project_contracts.hasMany(contract_metas, {foreignKey:'contract_id', targetKey:'id'})
project_contracts.hasMany(project_contract_stages,{foreignKey:'contract_id', targetKey:'id'})
project_contract_stages.belongsTo(project_stages,{foreignKey:'stage_id', targetKey:'id'})
contract_metas.belongsTo(project_scopes,{foreignKey:'scope_id', targetKey:'id'});
section_category_maps.belongsTo(section_scope_categories,{foreignKey:'section_category_id', targetKey:'id'})
section_category_maps.belongsTo(master_scope_categories,{foreignKey:'category_id', targetKey:'id'})
section_category_maps.belongsTo(project_scopes,{foreignKey:'scope_id', targetKey:'id'})
project_scopes.hasMany(section_category_maps,{foreignKey:'scope_id', targetKey:'id'})
section_category_maps.belongsTo(project_metas,{foreignKey:'scope_id', targetKey:'scope_id'})
section_category_maps.belongsTo(project_scopes,{foreignKey:'scope_id', targetKey:'id'})
section_category_maps.belongsTo(contract_metas,{foreignKey:'scope_id', targetKey:'scope_id'})
section_scope_categories.hasMany(section_category_maps,{foreignKey:'category_id', targetKey:'id'})


project_consultants.belongsTo( project_bids,{foreignKey:'project_id', targetKey:'project_id'})
User.hasMany( AdminConsultant,{foreignKey:'user_id', targetKey:'id'});

//temp_user.belongsTo(User,{foreignKey:'user_id', targetKey:'id'});
temp_user.hasMany(template_contractor_metas,{foreignKey:'contractor_id', targetKey:'id'})
temp_user.hasMany(tmp_contractor_manpowers,{foreignKey:'contractor_id', targetKey:'id'})

temp_user.hasMany(Resource, {foreignKey:'user_id', targetKey:'user_id'});

project_bids.hasMany(project_stages, {foreignKey:'project_id', targetKey:'project_id'})
//temp_user.hasMany(project,{foreignKey:'user_id',targetKey:'user_id'})


var publicVar = {};


publicVar.fetchConsultantHubData = function(data, sort_by){
    return new Promise(function(resolve, reject){
        AdminConsultant.findAndCountAll({
            // attributes:['id', 'category_id', 'parent_cat_id','unit_name','hourly_rate','hourly_rate'],
            where:data.where,
            include:[
                {	
                	where:{is_deleted:0},
                    // attributes:['name','type','cv', 'linkedIn_profile', 'facebook_profile', 'instagram_profile'],
                    attributes:['id','name','type', 'linkedIn_profile', 'facebook_profile', 'instagram_profile'],
                    model:CompanyEngineers,
                    required:false,
                     include:[{
                          model:Resource,
                        //   where:{type:"company_engineers_profile"},
                          where:{type:{$in:['company_engineer_profile_photo','company_engineer_cv']}},
                          required:false
                    }]
                },
                {
                    where:{is_deleted:0},
                    attributes:['id','Service_name', 'Service_description'],
                    model:CompanyServices,
                    required:false
                },
                {
                    // attributes:['Service_name', 'Service_description'],
                    
                    model:Resource,
                    where:{type:"admin_consultant_project",is_delete:0},
                    required:false
                }
            ],
            limit : data.limit,
            offset : data.offset,
            order:[sort_by]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
    })
}



publicVar.fetchArticleData = function(data,limit,offset,sort_by){
    return new Promise(function(resolve, reject){
        Article.findAndCountAll({
            // attributes:['id', 'category_id', 'parent_cat_id','unit_name','hourly_rate','hourly_rate'],
            where:data.where,
            include:[
                {   
                    model:ArticleTopic,
                    required:false,
                    
                },
                {
                    // attributes:['Service_name', 'Service_description'],
                    model:AdminConsultant,
                    required:false
                }
            ],
            limit : limit,
            offset : offset,
            order:[sort_by]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
    })
}

publicVar.fetchValidationData = function(where){
    return new Promise(function(resolve, reject){
        Validation.findAndCountAll({
            where:where,
            include:
            [
                {
                    model:Article,
                    include:[
                        {
                            model:ArticleTopic,
                            as:'topic_details'
                        }
                    ],
                    required:false
                },
                
            ]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
    })
}

publicVar.fetchContractorData=function(data){
    return new Promise(function(resolve, reject){
        Validation.findAndCountAll({
            where:data.where,
            include:
            [
                {
                    model:User,
                    include:[
                        {
                            model:contractor_metas,
                            as:'topic_details'
                        }
                    ],
                    required:false
                },
                
            ]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
    })
}

publicVar.fetchProjectData=function(data,limit,offset,order){
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
                {
                    model:project_consultants,
                    include:[
                        {
                            model:User,
                            as: 'user_details'
                        },
                    ],

                    
                   

                },
                
            ],
            limit:limit,
            offset:offset,
            order:order
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}


publicVar.fetchProjectDataOther=function(data,limit,offset,order){
    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            where:data.where,
            include:[

                {
                  
                    model:User
                }
            ],
                   

                    
                   

                
                
            
            limit:limit,
            offset:offset,
            order:order
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}




publicVar.fetchProjectDataAdmin=function(data,limit,offset,order,sort){
    console.log(data);
    console.log("///////////////////////////");
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            //where:data.where,
            include:[
                {
                    model:User,
                    //required:true
                    order:sort
                          
                   },
                   {
                       model:notes,

                   },

                   {
                    model: project_stages,
                    where:{is_deleted:0},
                    required:false

                   },
                   

            ],
            where:data.where,
            limit:limit,
            offset:offset,
            order:order
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}



publicVar.fetchProjectDataConsultant=function(data,limit,offset,order){
   
    return new Promise(function(resolve, reject){
        project_consultants.findAndCountAll({
            //where:data.where,
            include:[
                {
                    model: project,
                    include:[{
                        model:User,
                        //as:'user_details'

                    }]
                    //required:true
                          
                   },
                  
            ],
            where:data.where,
            limit:limit,
            offset:offset,
            order:order
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}

publicVar.ProjectDataforListing=function(data,limit,offset){
   
    return new Promise(function(resolve, reject){
        project_consultants.findAndCountAll({
            //where:data.where,
            include:[
                {
                    model: project,
                    
                    
                   },
                  
            ],
            where:data.where,
            limit:limit,
            offset:offset,
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}

publicVar.ProjectDataforListingContractor=function(data,limit,offset){
   
    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            //where:data.where,
            include:[
                {
                    model: project,
                    
                    
                   },
                  
            ],
            where:data.where,
            limit:limit,
            offset:offset,
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}


publicVar.fetchConsultantForContractPdf=function(data,limit,offset,order){
   
    return new Promise(function(resolve, reject){
        project_consultants.findAndCountAll({
            where:data.where,
            include:[
                {
                    
                        model:User,
                        as:'user_details'

                },
                  
            ],
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}


publicVar.fetchContractSignPdf=function(data){
   
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
                {
                    model: User,
                    
                    //required:true
                          
                   },
                  
            ],
           
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}




publicVar.fetchProjectTemplate=(data,order)=>{

    return new Promise(function(resolve, reject){
        project_templates.findAll({
            where:data.where,
            include:[
                {
                    model: project_stage_templates,
                    where:{is_deleted:0},
                     required:false,
                    include:[
                        {
                            model:project_task_templates,
                            where:{is_deleted:0},
                            required:false
                        }
                    ]
                          
                   },
            ],
           
            order:order
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}




publicVar.fetchProjectTemplateView=(data,limit,offset)=>{

    return new Promise(function(resolve, reject){
        project_templates.findAndCountAll({
            where:data.where,
            include:[
                {
                    model: project_stage_templates,
                    where:{is_deleted:0},
                     required:false,
                    include:[
                        {
                            model:project_task_templates,
                            where:{is_deleted:0},
                            required:false
                        }
                    ]
                          
                   },
            ],
           
           
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.fetchProjectTemplateViewnew=(data,limit,offset,order)=>{

    return new Promise(function(resolve, reject){
        project_templates.findAndCountAll({
            where:data.where,
            include:[
                {
                    model: project_stage_templates,
                    where:{is_deleted:0},
                     required:false,
                    include:[
                        {
                            model:project_task_templates,
                            where:{is_deleted:0},
                            required:false
                        }
                    ]
                          
                   },
            ],
            limit:limit,
            offset:offset,
            order:order
           
           
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}



publicVar.fetchProjectContractor=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
                {
                   
                    //required:true
                   
                 model:project_bids,
                 required:false,
                 include:[{
                     model:project_stage_estimates,
                     required:false,
                 }],

                },
                           
                                {
                                    model:project_consultants,
                                    include:[{
                                        model:User,
                                        as:'user_details'
                                    }]
                                },
                                   
                                        {
                                            model:User,
                                            //as: 'user_details'
                                        },
                                    
                                   
                
                                

                            

                    
                          
                   
            ],
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.fetchContractor=(data,limit,offset,order)=>{

    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            where:data.where,
            include:[
                {
                 model:User,
                   include:[
                       {
                       model:contractor_metas,
                       where:{key_name:{$in:['years_of_experience','cr_exp_date','projects_delivered']}},
                       required:false,


                   },
                   {
                     model:contractor_manpowers,
                     where:{employee_type:{$in:[1,2]}},
                     required:false,

                   }
                ],
                }
            ],
            //where:data.where,
            limit:limit,
            offset:offset,
            order:order
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.fetchContractorCoverPage=(data,limit,offset,order)=>{

    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            where:data.where,
            include:[
                {
                 model:User,
                   include:[
                       {
                       model:contractor_metas,
                       where:{key_name:{$in:['years_of_experience','cr_exp_date','projects_delivered','is_owner_or_civil']}},
                       required:false,


                   },
                   {
                     model:contractor_manpowers,
                     where:{employee_type:{$in:[1,2]}},
                     required:false,

                   }
                ],
                }
            ],
            //where:data.where,
            limit:limit,
            offset:offset,
            order:order
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}



publicVar.fetchStage=(data)=>{

    return new Promise(function(resolve, reject){
        project_stages.findAndCountAll({
            where:data.where,
            include:[
                {
                    model:project_tasks,
                    where:{is_delete:0},
                    required:false
                   
                          
                   },
            ],
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.fetchProjectDetails=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
               {
                    model: project_stages,
                    where:{is_deleted:0},
                    required:false,
                    include:[
                        {
                            model:project_tasks,
                            where:{is_delete:0},
                            required:false

                        },
                       
                    ],
                                     
                }
            ],
            //where:data.where,
           
        }).then(result=>{
             project.findAndCountAll({
            where:data.where,
            include:[
                {
                    model:project_docs,
                    where:{
                        is_delete : 0
                    },
                    //required:true
                        include:[{
                           model:project_doc_tags,
                           as: 'tags' 
                       }],
                       required:false

                          
                },
                {
                       model:project_metas,
                       include:[{
                           model:project_scopes
                       }],
                       required:false

                }
            ],
            //where:data.where,
           
        }).then(result1=>{
            if(result.rows[0] && result1.rows[0]){
                result.rows[0].dataValues.project_metas = result1.rows[0].project_metas;
                result.rows[0].dataValues.project_docs = result1.rows[0].project_docs;
            }
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
            // resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.fetchProjectDetailsStatus=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
               {
                    model: project_stages,
                    where:{is_default:1,is_deleted:0},
                   required:true,
                    include:[
                        {
                            model:project_tasks,
                            where:{is_delete:0},
                            required:false

                        }
                    ],

                          
                },
               
            ],
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.fetchProjectDetailsStatusEqual=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
               {
                    model: project_stages,
                    where:{is_default:0,is_deleted:0},
                   required:true,
                    include:[
                        {
                            model:project_tasks,
                            where:{is_delete:0},
                            required:false

                        }
                    ],

                          
                },
                
            ],
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.fetchProjectDetailsDocs=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
               {
                  
                    model:project_docs,
                    where:{
                        is_delete : 0
                    },
                    //required:true
                        include:[{
                           model:project_doc_tags,
                           as: 'tags' 
                       }],
                       required:false

                          
                   },
                   {
                       model:project_metas,
                       include:[{
                           model:project_scopes
                       }]

                   },
                   {
                       model:notes
                   }
            ],
            //where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}




publicVar.fetchProjectForImport=(data)=>{

    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            include:[
                {
                    model: project_stages,
                    //required:true
                    include:[
                        {
                            model:project_tasks,
                            where:{is_delete:0},
                            required:false

                        }
                    ],

                          
                   },
                   {
                       model:project_bids,
                       include:[{
                           model:User
                       }]
                   },
                  
                ]
            }).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
        })
}


publicVar.contractorProjectListing=(data,limit,offset,order)=>{
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:data.where,
            
            include:[
               {
                   model:project_bids,
                  //where:{contractor_id:{$ne:contract_id}},
                 required:false
               }
                ],
                
                limit:limit,
                offset:offset,
                order:order
            }).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
            
        })
}

publicVar.consultantProjectListing=(data,limit,offset,order)=>{
    return new Promise(function(resolve, reject){
        User.findAndCountAll({
            where:data.where,
            
            include:[
               {
                  model:AdminConsultant,
                  //where:{contractor_id:{$ne:contract_id}},
                 
               }
                ],
                
                limit:limit,
                offset:offset,
                order:order
                
            }).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
            
        })
}


publicVar.userDetails=(data)=>{
    return new Promise(function(resolve, reject){
        User.findAndCountAll({
            where:data.where,
            include:[
                {
                 model:contractor_metas,
                 required:false,
                 
                },
                {
                    model:contractors_manpowers,
                    required:false
                },
                {
                    model:Resource,
                        //   where:{type:"company_engineers_profile"},
                          where:{type:{$in:['contractor_cr_certificate','owners_national_id','man_powers_report','company_profile_contractor','other_files']}},
                          required:false
                }
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.tenderData=(data,limit,offset,order)=>{

    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            //where:data.where,
            include:[
                
                {
                    model:project,
                    required:true,
                    where:{status:{$in:[2,5]}}
                },
                {
                    model:User,
                    required:false,
                    required:true,
                    
                   },
            ],
            where:data.where,
            limit:limit,
            offset:offset,
            order:order
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.scopeDetails=(data)=>{
    return new Promise(function(resolve, reject){
        project_metas.findAndCountAll({
            where:data.where,
            include:[
                {
                 model:project_scopes,
                 where:{type:2},
                 required:true,
                }
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.staticScopeDetails=(data)=>{
    return new Promise(function(resolve, reject){
        project_metas.findAndCountAll({
            where:data.where,
            include:[
                {
                 model:project_scopes,
                 where:{type:1},
                 required:true,
                }
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.modePayment=(data)=>{
    return new Promise(function(resolve, reject){
        project_bids.findAll({
            where:data.where,
            include:[
                {

                model:project_stage_estimates,
                //where:{status:1},
                //required:true,
                include:[{
                    model:project_stages,
                    where:{is_default:0,is_deleted:0},
                    include:[{
                        model:project_tasks,
                        required:false,
                    }]

                }],

                },
               
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.modePayment_default=(data)=>{
    return new Promise(function(resolve, reject){
        project_bids.findAll({
            where:data.where,
            include:[
                {

                model:project_stage_estimates,
                //where:{status:1},
                //required:true,
                include:[{
                    model:project_stages,
                    where:{is_default:1,name:'maintenance',is_deleted:0},
                    include:[{
                        model:project_tasks,
                        required:false,
                    }]


                }],

                },
               
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.modePayment_default_primary=(data)=>{
    return new Promise(function(resolve, reject){
        project_bids.findAll({
            where:data.where,
            include:[
                {

                model:project_stage_estimates,
                //where:{status:1},
                //required:true,
                include:[{
                    model:project_stages,
                    where:{is_default:1,name:'primary_payment',is_deleted:0},
                    include:[{
                        model:project_tasks,
                        required:false,
                    }]


                }],

                },
               
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}

publicVar.allortMent=(data)=>{
    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            where:data.where,
            include:[
                {

                model:User,
                //where:{status:1},
                //required:true,
               
                },
                {
                    model:project,
                    include:[{
                        model:User,
                        
                    }]

                }
               
            ],
            //where:data.where,
           
            
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })

}


publicVar.taskCount=(data,assigne)=>{
    return new Promise(function(resolve, reject){

    project_stages.findAndCountAll({
        where:data.where,
        include:[
           {
                
                        model:project_tasks,
                        where:{is_delete:0,assignee:assigne},
                        required:true

           }
                ],

                      
            

}).then(result=>{
    resolve(result);
}).catch(err=>{
    reject(err);
})

})

}


publicVar.contrctorMyProjects=(data,order,limit,offset)=>{

    return new Promise(function(resolve, reject){

        project_bids.findAndCountAll({
            where:data.where,
            include:[
               {
                    
                            model:project,
                            where:{is_delete:0},
                            required:true,
                            order:order,
                            include:[
                                {
                                model:User,

                                },
                                {
                                    model:project_consultants,
                                    include:[{
                                        model:User,
                                        as:'user_details'
                                    }]
                                }

                        ]
    
               }
                    ],
                    limit:limit,
                    offset:offset,
                    order:order,
    
                          
                
    
    }).then(result=>{
        resolve(result);
    }).catch(err=>{
        reject(err);
    })
    
    })

}


publicVar.bankData=(data)=>{

    return new Promise(function(resolve, reject){

        contract_banks.findAndCountAll({
            where:data.where,
            include:[
               {
                    model:User
                          
    
               }
                    ],
                    
    
                          
                
    
    }).then(result=>{
        resolve(result);
    }).catch(err=>{
        reject(err);
    })
    
    })

}


publicVar.scopeDetails_for_pdf=(data,group_name,order)=>{

return new Promise(function(resolve, reject){

project_contracts.findAndCountAll({
where:data.where,
include:[
{
model:contract_metas,
//as:'user_details'
include:[{

    model:project_scopes,
    where:{type:1,group_name:group_name}
}],


}
],


order:order




}).then(result=>{
resolve(result);
}).catch(err=>{
reject(err);
})

})


}



publicVar.scopeDetails_for_pdf_custom=(data,group,order)=>{

    return new Promise(function(resolve, reject){
    
    project_contracts.findAndCountAll({
    where:data.where,
    include:[
    {
    model:contract_metas,
    //as:'user_details'
    include:[{
    
        model:project_scopes,
        where:{type:2,group_name:group}
    }],
    
    
    }
    ],
    
    
    order:order
    
    
    
    
    }).then(result=>{
    resolve(result);
    }).catch(err=>{
    reject(err);
    })
    
    })
    
    
    }


    publicVar.sectionMasterScope=(data,limit,offset)=>{

        return new Promise(function(resolve, reject){
    
            section_category_maps.findAndCountAll({
                where:data.where,
                include:[
                   {
                        model:section_scope_categories
                              
        
                   },
                   {
                       model:master_scope_categories
                   },
                   {
                       model:project_scopes
                   }
                        ],
                        limit:limit,
                        offset:offset,
                        
        
                              
                    
        
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
        })
    
    }



    publicVar.tender_submit_pdf=(data)=>{

        return new Promise(function(resolve, reject){
        
        project_bids.findAndCountAll({
        where:data.where,
        include:[
        {
        model:project_stage_estimates
        
        
        }
        ],
        
        
       
        
        
        
        
        }).then(result=>{
        resolve(result);
        }).catch(err=>{
        reject(err);
        })
        
        })
        
        
        }



        publicVar.project_contract_fetch=(data,order)=>{

            return new Promise(function(resolve, reject){
            
            project_contracts.findAndCountAll({
            where:data.where,
            include:[
            {
            model:project_contract_stages,
            include:[{
                model:project_stages,
                where:{is_default:0},
                include:[{
                    model:project_tasks,
                    requied:false
                }]
            }]
            
            
            }
            ],
            order:order
            
           
            
            
            
            
            }).then(result=>{
            resolve(result);
            }).catch(err=>{
            reject(err);
            })
            
            })
            
            
            }


            publicVar.project_contract_fetch_defult=(data,order)=>{

                return new Promise(function(resolve, reject){
                
                project_contracts.findAndCountAll({
                where:data.where,
                include:[
                {
                model:project_contract_stages,
                include:[{
                    model:project_stages,
                    where:{is_default:1,name:'primary_payment'},
                    include:[{
                        model:project_tasks,
                        requied:false
                    }]
                }]
                
                
                }
                ],
                order:order
                
               
                
                
                
                
                }).then(result=>{
                resolve(result);
                }).catch(err=>{
                reject(err);
                })
                
                })
                
                
                }

                publicVar.project_contract_fetch_defult_maintain=(data,order)=>{

                    return new Promise(function(resolve, reject){
                    
                    project_contracts.findAndCountAll({
                    where:data.where,
                    include:[
                    {
                    model:project_contract_stages,
                    include:[{
                        model:project_stages,
                        where:{is_default:1,name:'maintenance'},
                        include:[{
                            model:project_tasks,
                            requied:false
                        }]
                    }]
                    
                    
                    }
                    ],
                    order:order
                    
                   
                    
                    
                    
                    
                    }).then(result=>{
                    resolve(result);
                    }).catch(err=>{
                    reject(err);
                    })
                    
                    })
                    
                    
                    }



            publicVar.project_scope_section=(data,project_id,order)=>{

                return new Promise(function(resolve, reject){
                
                section_category_maps.findAndCountAll({
                where:data.where,
                include:[
                {
                model:project_metas,
                where:{project_id:project_id},
                },
               
                    {
                    model:project_scopes,
                    },
                
        
                    {

                        model:section_scope_categories
                    }
               
            

                
                
                
                ],
           order:order
                
                
               
                
                
                
                
                }).then(result=>{
                resolve(result);
                }).catch(err=>{
                reject(err);
                })
                
                })
                
                
                }



                publicVar.project_user_table=(data)=>{

                    return new Promise(function(resolve, reject){
                    
                    project.findAndCountAll({
                    where:data.where,
                    include:[
                    {
                    model:User,
                
    
                    
                    
                    },
                    ],
               
                    
                    
                   
                    
                    
                    
                    
                    }).then(result=>{
                    resolve(result);
                    }).catch(err=>{
                    reject(err);
                    })
                    
                    })
                    
                    
                    }


                    publicVar.project_contract_user=(data)=>{

                        return new Promise(function(resolve, reject){
                        
                        project_bids.findAndCountAll({
                        where:data.where,
                        include:[
                        {
                        model:User,
                        include:[{
                            model:contractor_metas,
                            type:{key_name:'cr_number'}
                        }]
                    
        
                        
                        
                        },
                        ],
                   
                        
                        
                       
                        
                        
                        
                        
                        }).then(result=>{
                        resolve(result);
                        }).catch(err=>{
                        reject(err);
                        })
                        
                        })
                        
                        
                        }






                        publicVar.project_contract_user_specifications=(data,contract_id,order)=>{

                            return new Promise(function(resolve, reject){
                            
                            section_category_maps.findAndCountAll({
                            where:data.where,
                            include:[
                            {
                            model:contract_metas,
                            where:{contract_id:contract_id}
                            },
                            {
                                model:project_scopes
                            },
                            {
                                model:section_scope_categories
                            }

                        
            
                            
                            
                            
                            ],
                       
                            
                            order:order
                           
                            
                            
                            
                            
                            }).then(result=>{
                            resolve(result);
                            }).catch(err=>{
                            reject(err);
                            })
                            
                            })
                            
                            
                            }
    



                            publicVar.specifications_fetch=(data,order)=>{

                                return new Promise(function(resolve, reject){
                                
                                    project_scopes.findAndCountAll({
                                where:data.where,
                                include:[
                                {
                                model:section_category_maps,
                                
                                
                                
                                }
                                ],
                                order:order
                                
                               
                                
                                
                                
                                
                                }).then(result=>{
                                resolve(result);
                                }).catch(err=>{
                                reject(err);
                                })
                                
                                })
                                
                                
                                }




publicVar.fetchProjectDataClientConsultant=function(data){
   
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
        
            include:[
                {
                    model: project_consultants,
                    include:[{
                        model:User,
                        as: 'user_details'
                    }],
                    },
                    {
                        model:User
                    },

                {
                model:project_bids,
                where:{status:1},
                include:[{
                    model:User

                }],
                required:false
                          
                   },
                  
                  
            ],
            where:data.where,
           
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
        
    })
}



publicVar.project_bid_deatils=(data)=>{

    return new Promise(function(resolve, reject){
    
    project_bids.findAndCountAll({
    where:data.where,
    include:[{
        model:User
    }]
    }).then(result=>{
    resolve(result);
    }).catch(err=>{
    reject(err);
    })
    
    })
    
    
    }




    publicVar.userDetailsDemo=(data)=>{
        return new Promise(function(resolve, reject){
            temp_user.findAndCountAll({
                where:data.where,
                include:[
                    {
                     model:template_contractor_metas,
                     required:false,
                     
                    },
                    {
                        model:tmp_contractor_manpowers,
                        required:false
                    },
                   
                    
                    
                ],
                //where:data.where,
               
                
            }).then(result=>{
                resolve(result);
            }).catch(err=>{
                reject(err);
            })
            
        })
    
    }

    publicVar.viewBid=(data)=>{
        return new Promise(function(resolve, reject){
    
            project.findAndCountAll({
            where:data.where,
            include:[
                {
                    model:project_bids,
                    where:{is_draft:0},
                    order:[['id','ASC']],
                    include:[{
                        model:User,
                    include:[
                        {
                    model:contractor_metas,
                    required:false,
                        }
                    
                    ]

                    }]
                
                
            },
            {
            model:project_stages,
            where:{is_default:0},
            include:[{
                model:project_tasks,
                where:{assignee:'Contractor'},
                required:false
            }]
            },
           
        ],
        
            }).then(result=>{
            resolve(result);
            }).catch(err=>{
            reject(err);
            })
            
            })

    }


    publicVar.viewBidDeafult=(data)=>{
        return new Promise(function(resolve, reject){
    
            project_stages.findAndCountAll({
            where:data.where,
            include:[
               
            {
           
           
                model:project_tasks,
                where:{assignee:'Contractor'},
                required:false

           
            },
           
        ]
            }).then(result=>{
            resolve(result);
            }).catch(err=>{
            reject(err);
            })
            
            })

    }


    publicVar.viewBidNormal=(data)=>{
        return new Promise(function(resolve, reject){
    
            project_stages.findAndCountAll({
            where:data.where,
            include:[
               
            {
           
           
                model:project_tasks,
                where:{assignee:'Contractor'},
                required:false

           
            },
           
        ]
            }).then(result=>{
            resolve(result);
            }).catch(err=>{
            reject(err);
            })
            
            })

    }

    

module.exports = publicVar;