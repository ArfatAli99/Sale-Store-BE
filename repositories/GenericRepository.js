const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const _ = require('lodash');



/* Importing schemas */
const  User = require('../models/user')(sequelize, DataTypes);
const  Admin = require('../models/admin')(sequelize, DataTypes);
const  Validation = require('../models/validation')(sequelize, DataTypes);
const  Site_settings = require('../models/site_setting')(sequelize, DataTypes);
const  Refresh_token = require('../models/refresh_token')(sequelize, DataTypes);
const Emailtemplate = require('../models/emailtemplate')(sequelize, DataTypes);
const Admin_consultant = require('../models/admin_consultant')(sequelize, DataTypes);
const Cms = require('../models/cms')(sequelize, DataTypes);
const Cms_grids = require('../models/cms_grids')(sequelize, DataTypes);
const Resource = require('../models/resource')(sequelize, DataTypes);
const Contacet_us=require('../models/contact_us')(sequelize, DataTypes);
const Articles=require('../models/articles')(sequelize, DataTypes);
const Article_topic=require('../models/article_topics')(sequelize, DataTypes);
const Company_service=require('../models/company_services')(sequelize, DataTypes);
const Company_engineer=require('../models/company_engineers')(sequelize, DataTypes);
const Project=require('../models/projects')(sequelize, DataTypes);
const Project_scopes=require('../models/project_scopes')(sequelize, DataTypes);
const Project_metas=require('../models/project_metas')(sequelize, DataTypes);
const Project_docs=require('../models/project_docs')(sequelize, DataTypes);
const Project_consultants=require('../models/project_consultants')(sequelize, DataTypes);
const contractor_metas=require('../models/contractor_metas')(sequelize, DataTypes);
const contractor_manpowers=require('../models/contractor_manpowers')(sequelize, DataTypes);
const project_scopes=require('../models/project_scopes')(sequelize, DataTypes);
const project_consultants=require('../models/project_consultants')(sequelize, DataTypes);
const project_doc_tags=require('../models/project_doc_tags')(sequelize, DataTypes);
const project_stage_estimates=require('../models/project_stage_estimates')(sequelize, DataTypes);
//const project_stages=require('../models/project_stages')(sequelize, DataTypes);
const admin_project_notes=require('../models/admin_project_notes')(sequelize, DataTypes);
const project_templates=require('../models/project_templates')(sequelize, DataTypes);
const project_stages=require('../models/project_stages')(sequelize, DataTypes);
const project_task_templates=require('../models/project_task_templates')(sequelize, DataTypes);
const project_stage_templates=require('../models/project_stage_templates')(sequelize, DataTypes);

const notifications=require('../models/notifications')(sequelize, DataTypes);
const languages = require('../models/languages')(sequelize, DataTypes);
const project_contracts=require('../models/project_contracts')(sequelize, DataTypes);
const project_contract_stages=require('../models/project_contract_stages')(sequelize, DataTypes);

const contract_metas=require('../models/contract_metas')(sequelize, DataTypes);
const contract_banks=require('../models/contract_banks')(sequelize, DataTypes);
const project_managers=require('../models/project_managers')(sequelize, DataTypes);
const contract_info=require('../models/contract_info')(sequelize, DataTypes);
const section_scope_categories=require('../models/section_scope_categories')(sequelize, DataTypes);
const  master_scope_categories=require('../models/master_scope_categories')(sequelize, DataTypes);
const section_category_maps=require('../models/section_category_maps')(sequelize, DataTypes);
const temp_user=require('../models/temp_user')(sequelize, DataTypes);
const tmp_contractor_manpowers=require('../models/temp_contractor_manpowers')(sequelize, DataTypes);
const template_contractor_metas=require('../models/template_contractor_metas')(sequelize,DataTypes);
const task_templates=require('../models/task_templates')(sequelize,DataTypes);
const task_template_data=require('../models/task_templates_data')(sequelize,DataTypes);
const resources_demo=require('../models/resources_demo')(sequelize,DataTypes);
const notes=require('../models/notes')(sequelize,DataTypes);
const master_services=require('../models/master_services')(sequelize,DataTypes);
//const site_settings=require('../models/site_setting')(sequelize, DataTypes);

// sequelize.model('post').hasMany(sequelize.model('bookmark'), {foreignKey:'post_id'});

/*requiring ORM*/
/* import db configure file */

module.exports.fetchDataSort = function(data, sort_by) {
    return new Promise(function(resolve, reject){
               if (data.where && !_.isEmpty(data.where)) {

                      sequelize.model(data.table).findAndCountAll({
                          where:data.where,
                          order:[sort_by],
                        }).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{

                    sequelize.model(data.table).findAndCountAll().then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err); 
                    });     
               }
    })
};
module.exports.fetchDataSortWithAttributes = function(data, sort_by) {
    return new Promise(function(resolve, reject){
               if (data.where && !_.isEmpty(data.where)) {

                      sequelize.model(data.table).findAndCountAll({
                          where:data.where,
                          attributes:data.attributes,
                          order:[sort_by],
                        }).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{

                    sequelize.model(data.table).findAndCountAll().then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};

module.exports.fetchData = function(data) {
    return new Promise(function(resolve, reject){

               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({where:data.where}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll().then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};


module.exports.fetchDataOrder = function(data,order) {
    return new Promise(function(resolve, reject){

               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({where:data.where,order:order}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll({order:order}).then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};


module.exports.fetchDataWithPegination = function(data) {
    return new Promise(function(resolve, reject){

               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({where:data.where,limit:data.limit,offset:data.offset}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll().then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};

module.exports.fetchDataWithAttributes = function(data) {
    return new Promise(function(resolve, reject){
               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({attributes:data.attributes,where:data.where}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll({attributes:data.attributes}).then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};

module.exports.createData = function(data) {
    return new Promise(function(resolve, reject){
        sequelize.model(data.table).create(data.data, {transaction: data.transaction}).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(199, err);
            reject(err);
        });
    })
};



module.exports.deleteData = function(data) {
    return new Promise(function(resolve, reject){
        sequelize.model(data.table).destroy(data.where).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(199, err);
            reject(err);
        });
    })
};



module.exports.bulkCreateData = function(data) {
    return new Promise(function(resolve, reject){
        sequelize.model(data.table).bulkCreate(data.data).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(199, err);
            reject(err);
        });
    })
};



module.exports.updateData = function(data) {
    return new Promise(function(resolve, reject){
        sequelize.model(data.table).update(data.data, {where:data.where},{transaction: data.transaction}).then(result=>{
          sequelize.model(data.table).findOne({where:data.where}).then(result=>{
                        resolve(result);
                    }).catch(err=>{
                        console.log(err);
                        reject(err);
                    }); 
        }).catch(err=>{
            console.log(209, err);
            reject(err);
        });
    })
};
module.exports.deleteData = function(data) {
    return new Promise(function(resolve, reject){
        sequelize.model(data.table).destroy({where:data.where}).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(220, err);
            reject(err);
        });
    })
};


module.exports.fetchDatalimit = function(data,limit,offset,order) {
    return new Promise(function(resolve, reject,req){
       
        
               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({where:data.where,limit:limit,offset:offset,order:order}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll({limit:limit,offset:offset,order:order}).then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};


module.exports.fetchDatafind= function(data) {
    return new Promise(function(resolve, reject){

               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAll({where:data.where}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll().then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};


module.exports.fetchDataGroupby = function(data,group_by) {
    return new Promise(function(resolve, reject,req){
       
        
               if (data.where && !_.isEmpty(data.where)) {
                      sequelize.model(data.table).findAndCountAll({where:data.where,group:group_by}).then(result=>{
                            resolve(result);
                        }).catch(err=>{
                            console.log(err);
                            reject(err);
                        });     
               }else{
                    sequelize.model(data.table).findAndCountAll({group:group_by}).then(result=>{
                            resolve(result);
                    }).catch(err=>{
                            console.log(err);
                            reject(err);
                    });     
               }
    })
};


