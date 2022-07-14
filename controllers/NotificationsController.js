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
var AdmZip = require('adm-zip');

const Op = sequelize.Op;


notificationController = {}


/**notifications-API
method:GET
input:query[id]
output:data,
purpose:To list of notifications.
created by-sayanti Nath
*/

notificationController.notificationsListing=(req,res)=>{

    (async()=>{
  
      try{

        if(!req.query.page) return res.send({status:400,message:'enter the page',purpose:"notofications listing"})
        if(!req.query.limit) return res.send({status:400,message:'enter the limit',purpose:"notofications listing"})

        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);

  
      let information = {};
      information.table='notifications';
      
      information.where = {
        notification_to:req.query.id,
        notification_type:{$in:['socket notification','both']},
        is_deleted:'0'
        //status:1
      };
      let order=[['id','DESC']]
      
      
      let data = await GenericRepository.fetchDatalimit (information,limit,offset,order)
      
      res.send({status:200,data:data, message:'notifications Listing',purpose:"notofications listing"});
      
      
      
      } catch(err){
      console.trace(err)
      
      res.send({status:500, err:err});
      
      }
      
      
      })()
  
  }
  
  
  /**notifications- API
  method:PUT
  input:queryID]
  output:data,
  purpose:To update data
  created by-sayanti Nath
  */
  
 notificationController.notificationUpdate=(req,res)=>{
  
    (async()=>{
  
      try{

      let information = {};
      information.table='notifications';
      
      information.where = {
  
        id:req.body.id
        //status:1
      };
     
      information.data={
        status:'1'
      }
      
      
      let data = await GenericRepository.updateData (information)
      
      res.send({status:200, message:'notifications seen status update',purpose:'notifications seen status update',data:[]});
      
      
      
      } catch(err){
      console.trace(err)
      
      res.send({status:500, err:err});
      
      }
      
      
      })()
  
  
  
  
  
  
  }


  /**notifications-statuschange API
method:PUT
input:body[ID]
output:data,
purpose:To update data
created by-sayanti Nath
*/
  
  notificationController.notifictionsDelete=(req,res)=>{
  
  
    (async()=>{
  
      try{
        await sequelize.transaction(async (t) => {

      let information = {};
      information.table='notifications';
      
      information.where = {
        id:req.body.id,
        
      };
  
      information.data={
        is_deleted:'1'
      }
      information.transaction=t;
      
      
      let data = await GenericRepository.updateData (information)
      
      res.send({status:200, message:'notifications delete',purpose:"notifications deleted",data:[]});
      
    })
      
      } catch(err){
      console.trace(err)
      
      res.send({status:500, err:err});
      
      }
      
      
      })()
  
  }
  

  module.exports = notificationController
  