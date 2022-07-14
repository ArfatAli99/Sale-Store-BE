const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const Sequelize = require('sequelize');

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
const project=require('../models/projects')(sequelize, DataTypes);
const project_consultants=require('../models/project_consultants')(sequelize, DataTypes);
const project_stages=require('../models/project_stages')(sequelize, DataTypes);
const project_tasks=require('../models/project_tasks')(sequelize, DataTypes);
const project_templates=require('../models/project_templates')(sequelize, DataTypes);
const project_task_templates=require('../models/project_task_templates')(sequelize, DataTypes);
const project_stage_templates=require('../models/project_stage_templates')(sequelize, DataTypes);
const project_bids=require('../models/project_bids')(sequelize, DataTypes);
const project_stage_estimates=require('../models/project_stage_estimates')(sequelize, DataTypes);
const project_metas=require('../models/project_metas')(sequelize, DataTypes);
const project_scopes=require('../models/project_scopes')(sequelize, DataTypes);
const project_docs=require('../models/project_docs')(sequelize, DataTypes);
const contractor_manpowers=require('../models/contractor_manpowers')(sequelize, DataTypes);
const project_contracts=require('../models/project_contracts')(sequelize, DataTypes);
const project_contract_stages=require('../models/project_contract_stages')(sequelize, DataTypes);
const contract_metas=require('../models/contract_metas')(sequelize, DataTypes);
const project_doc_tags=require('../models/project_doc_tags')(sequelize, DataTypes);



project.hasMany(project_stages, {foreignKey:'project_id', targetKey:'id'});
project_stages.hasMany(project_tasks, {foreignKey:'stage_id', targetKey:'id'});
project.hasMany(project_bids, {foreignKey:'project_id', targetKey:'id'})
project_bids.hasMany(project_stage_estimates, {foreignKey:'bid_id', targetKey:'id'});
project.hasMany(project_metas, {foreignKey:'project_id', targetKey:'id'});
// project_metas.belongsTo(project_scopes, {foreignKey:'scope_id', targetKey:'id', as:'project_scopes'});
project_metas.belongsTo(project_scopes, {foreignKey:'scope_id', targetKey:'id', as:'project_scopes'});
project.hasMany(project_docs, {foreignKey:'project_id', targetKey:'id'});
project.hasMany(project_consultants, {foreignKey:'project_id', targetKey:'id'});
project_consultants.belongsTo(User, {foreignKey:'consultant_id', targetKey:'id', as:'consultant_details'});
// project_stage_estimates.belongsTo(project_stages, {foreignKey:'stage_id', targetKey:'id', as:''})
project_bids.belongsTo(User, {foreignKey:'contractor_id', targetKey:'id', as:'contractor_details'});
project.belongsTo(User, {foreignKey:'user_id', targetKey:'id', as:'project_client_details'});

contract_metas.belongsTo(project_scopes, {foreignKey:'scope_id', targetKey:'id', as:'project_scope_details'});
project_metas.belongsTo(project_scopes, {foreignKey:'scope_id', targetKey:'id', as:'project_scope_details'});
project_contracts.hasMany(project_contract_stages, {foreignKey:'contract_id', targetKey:'id'});
project_contracts.hasMany(contract_metas, {foreignKey:'contract_id', targetKey:'id'})
project_bids.hasMany(project_metas, {foreignKey:'project_id', targetKey:'project_id'})
project.hasMany(project_docs, {foreignKey:'project_id', targetKey:'id'});
project_docs.hasMany(project_doc_tags, {foreignKey:'project_doc_id', targetKey:'id'});
project_contract_stages.belongsTo(project_stages, {foreignKey:'stage_id', targetKey:'id', constraints:'false'})
project_stage_estimates.belongsTo(project_stages, {foreignKey:'stage_id', targetKey:'id', constraints:'false'})

var publicVar = {};

publicVar.fetchProject = function(where){
    return new Promise(function(resolve, reject){
     project.findAndCountAll({
         where:where,
         include:
         [
            {
                model:project_stages,
                include:
                [
                    {
                        model:project_tasks
                    }
                ],
                required:false
            }
         ]
     }).then(result=>{

        project.findAndCountAll({
             where:where,
             include:
             [
                {
                    model:project_metas,
                    where:{
                        is_deleted:0
                    },
                    include:
                    [
                        {
                            model:project_scopes,
                            as:'project_scope_details'
                        }
                    ],
                    required:false
                },
                {
                    model:project_bids,
                    include:
                    [
                        {
                            model:project_stage_estimates
                        }
                    ],
                    required:false
                }
             ]
         }).then(result1=>{
            if(result.rows[0] && result1.rows[0]){
                result.rows[0].dataValues.project_metas = result1.rows[0].project_metas;
                result.rows[0].dataValues.project_bids = result1.rows[0].project_bids;
            }
             resolve(result);
         }).catch(err=>{
             console.log(35, err);
             reject(err);
         })
         // resolve(result);
     }).catch(err=>{
         console.log(35, err);
         reject(err);
     })

        
    })
}

publicVar.fetchProjectWithDrawings = function(where, project_docs_where){
    return new Promise(function(resolve, reject){
     project.findAndCountAll({
         where:where,
         include:
         [
            {
                model:project_stages,
                include:
                [
                    {
                        model:project_tasks
                    }
                ],
                required:false
            },
            {
                model:project_bids,
                include:
                [
                    {
                        model:project_stage_estimates
                    }
                ],
                required:false
            },
            {
                model:project_docs,
                where:project_docs_where,
                include:
                [
                    {
                        model:project_doc_tags,
                        where:{
                            is_delete:0
                        }
                    }
                ],
                required:false
            }
         ]
     }).then(result=>{
         resolve(result);
     }).catch(err=>{
         console.log(35, err);
         reject(err);
     })

        
    })
}

publicVar.fetchProjectWithBidDetails = function(where){
    return new Promise(function(resolve, reject){
        project.findAndCountAll({
            where:where,
            attributes:['id', 'name', 'project_location', 'user_id', 'project_use_type', 'plot_area', 'built_up_area'],
            include:
            [
                // {
                //     model:project_metas,
                //     where:{
                //         is_deleted:0
                //     },
                //     include:
                //     [
                //         {
                //             model:project_scopes,
                //             where:{
                //                 is_deleted:0
                //             },
                //             as:'project_scopes'
                //         }
                //     ],
                //     required:false
                // },
                // {
                //     model:project_docs,
                //     where:{
                //         is_active:1,
                //         is_delete:0
                //     },
                //     required:false
                // },
                {
                    model:User,
                    attributes:['id', 'full_name'],
                    as:'project_client_details',
                    required:false
                },
                {
                    model:project_bids,
                    where:{
                        is_draft:0,
                        status:1
                    },
                    attributes:['id', 'project_id', 'contractor_id', 'days', 'price', 'is_draft', 'status', 'createdAt', 'updatedAt'],
                    include:
                    [
                        {
                            model:User,
                            attributes:['id', 'full_name'],
                            as:'contractor_details'
                        }
                    ],
                    // include:
                    // [
                    //     {
                    //         model:project_stage_estimates,
                    //         include:
                    //         [
                    //             {
                    //                 model:project_stages,
                    //                 where:{
                    //                     is_deleted:0
                    //                 },
                    //                 include:
                    //                 [
                    //                     {
                    //                         model:project_tasks,
                    //                         where:{
                    //                             is_delete:0
                    //                         }
                    //                     }
                    //                 ]
                    //             }
                    //         ]
                    //     },
                    //     {
                    //         model:User
                    //     }
                    // ],
                    required:false
                },
                {
                    model:project_consultants,
                    where:{
                        is_active:1,
                        is_delete:0
                    },
                    attributes:['id', 'client_id', 'consultant_id', 'project_id', 'is_active', 'is_delete'],
                    include:
                    [
                        {
                            model:User,
                            attributes:['id', 'full_name'],
                            as:'consultant_details'
                        }
                    ],
                    required:false
                }
            ]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(80, err);
            reject(err);
        })
    })
}


publicVar.fetchProjectContractor = function(where,where_bids){
    return new Promise(function(resolve, reject){
     project.findAndCountAll({
         where:where,
         include:
         [
            {
                model:project_stages,
                include:
                [
                    {
                        model:project_tasks
                    }
                ],
                required:false,
            },
            {
                model:project_metas,
                include:
                [
                    {
                        model:project_scopes,
                        as:'project_scope_details'
                    }
                ],


            },
            {
                model:project_bids,
                where:where_bids,
                include:
                [
                    {
                        model:project_stage_estimates
                    }
                ],
                required:false
            }
         ]
     }).then(result=>{
         resolve(result);
     }).catch(err=>{
         console.log(35, err);
         reject(err);
     })

        
    })
}

publicVar.fetchProjectContractDetails = function(where, sort_by){
    return new Promise(function(resolve, reject){
        project_contracts.findAndCountAll({
            where:where,
            include:
            [
                {
                    model:project_contract_stages,
                    required:false,
                    include:
                    [
                        {
                            model:project_stages
                        }
                    ]
                },
                {
                    model:contract_metas,
                    where:{
                        is_deleted:0
                    },
                    include:
                    [
                        {
                            model:project_scopes,
                            where:{
                                is_deleted:0
                            },
                            as:'project_scope_details'
                            
                        }
                    ],
                    required:false
                },
            ],
            order:[sort_by]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(242, err);
            reject(err);
        })
    })

}

publicVar.fetchProjectBidDetails = function(where, sort_by){
    return new Promise(function(resolve, reject){
        project_bids.findAndCountAll({
            where:where,
            include:
            [
                {
                    model:project_stage_estimates,
                    required:false,
                    include:
                    [
                        {
                            model:project_stages,
                        }
                    ]
                },
                {
                    model:project_metas,
                    where:{
                        is_deleted:0
                    },
                    include:
                    [
                        {
                            model:project_scopes,
                            where:{
                                is_deleted:0
                            },
                            as:'project_scope_details'
                            
                        }
                    ],
                    required:false
                },
            ],
            order:[sort_by]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            console.log(242, err);
            reject(err);
        })
    })

}


module.exports = publicVar;