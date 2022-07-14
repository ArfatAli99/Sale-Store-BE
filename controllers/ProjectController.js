const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
var ProjectRepository = require('.././repositories/ProjectRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms = require('../models/cms');
const commonFunnction = require('../helper/commonFunction');
const moment = require('moment');
const cron = require('node-cron');
const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
var AdmZip = require('adm-zip');
const { ensureAsync } = require('async');
const Op = sequelize.Op;
ProjectController = {}
/*email send when project 14 days is over
method:POST
input:
output:mail sent,
purpose:14 days over information
created by sayanti nath
*/


cron.schedule('01 00 12 * * *', () => {
  console.log("hello");
  ProjectController.emailList();
});

/*client-invite-consultent api
method:POST
input:body[ email,project_id]
output:mail sent,
purpose:to invite consultent
created by anirban das
*/

ProjectController.createProject = (req, res) => {
  console.log('*** body ***', req.body);
  
  (async () => {
  
  try {
  var string= await commonFunnction.getRandomString(12);
  var data = {};
  let project_info = {};
  project_info.table = 'projects';
  project_info.data = {
  project_type:req.body.project_type,
  name: req.body.name,//
  unique_name:string,
  project_location: req.body.project_location,//
  project_use_type: req.body.project_use_type,//
  plot_area: req.body.plot_area,//
  is_user_owner: req.body.is_user_owner,//
  current_state: req.body.current_state,//
  status: req.body.status//
  }

  if (req.body.is_consultant == 0) {
  project_info.data.user_id = req.user_id;
  }
  if (req.body.built_up_area && req.body.built_up_area != "") {
  project_info.data.built_up_area = req.body.built_up_area;
  }
  if(req.body.basement){
  project_info.data.basement = req.body.basement;
  }
   if(req.body.levelling_floor){
  project_info.data.levelling_floor = req.body.levelling_floor;
} 
   if(req.body.gound_floor){
  project_info.data.gound_floor = req.body.gound_floor;
}
   if(req.body.additional_floors){
  project_info.data.additional_floors = req.body.additional_floors;
   }
  if(req.body.pent_floor){
  project_info.data.pent_floor = req.body.pent_floor;
}
  project_info.data.is_all_drawing = req.body.is_all_drawing;
  project_info.data.is_drawing_available_comment = req.body.is_drawing_available_comment;
  project_info.data.land_serial_no = req.body.land_serial_no;
  project_info.data.national_id = req.body.national_id;
  if(req.body.bank_loan){
    project_info.data.bank_loan=req.body.bank_loan;
  }
  project_info.data.special_request = req.body.special_request;
  
  if(req.body.project_submit_date){
    project_info.data.project_submit_date=req.body.project_submit_date
  }
  // console.log('****** project_info ********', project_info)
  var project_data = await GenericRepository.createData(project_info);
  data.project_data = project_data;
  
  if (req.body.is_consultant == 1) {
  var consultant_data = {};
  consultant_data.where={
    consultant_id: req.user_id,
    project_id: project_data.id
  }
  consultant_data.table = 'project_consultants';
  let consultant_fetch=await GenericRepository.fetchData(consultant_data);
  
  consultant_data.data = {
  client_id: 0,
  consultant_id: req.user_id,
  project_id: project_data.id,
  }
 
  if(consultant_fetch.rows.length>0){
    data.consultant_data_val_update = await GenericRepository.updateData(consultant_data)
  }
  else{
  data.consultant_data_val = await GenericRepository.createData(consultant_data);
  }
  }
  
  let project_meta = {};
  project_meta.data = JSON.parse(req.body.project_meta);
  if (req.body.project_meta && project_meta.data.length > 0) {
  project_meta.table = 'project_metas';
  project_meta.data = project_meta.data.map(function (ele) {
  var o = Object.assign({}, ele);
  o.project_id = project_data.id;
  return o;
  })
  let project_meta_data = await GenericRepository.bulkCreateData(project_meta);
  data.project_meta_data = project_meta_data;
  }
  
  let project_docs_and_tags = {};
  project_docs_and_tags.data = JSON.parse(req.body.project_docs_and_tags);
  data.project_docs_data = [];
  if (req.body.project_docs_and_tags && project_docs_and_tags.data.length > 0) {
  var project_docs = {};
  var project_tags = {};
  
  
  project_docs_and_tags.data.forEach(async (item, index, arr) => {
  project_docs.data = JSON.parse(JSON.stringify(item));
  project_docs.data.project_id = project_data.id;
  project_docs.table = 'project_docs';
  delete project_docs.data.tags
  var project_docs_data = await GenericRepository.createData(project_docs);
  data.project_docs_data.push(JSON.parse(JSON.stringify(project_docs_data)));
  if (item.tags.length > 0) {
  let tags = item.tags;
  project_tags.data = tags.map(function (el) {
  var o = Object.assign({}, el);
  o.project_doc_id = project_docs_data.id;
  return o;
  })
  project_tags.table = 'project_doc_tags';
  
  let project_tags_data = await GenericRepository.bulkCreateData(project_tags);
  data.project_docs_data[index].project_tags_data = JSON.parse(JSON.stringify(project_tags_data));
  
  }
  
  if (index == project_docs_and_tags.data.length - 1) {
  
  if (req.body.status == 1) {
  // console.log('*************** I am here 1 *****************');

  let get_project_stages_data = {};
  get_project_stages_data.table = 'project_stages';
  get_project_stages_data.where = {};
  get_project_stages_data.where.project_id = project_data.id;
  get_project_stages_data.where.is_deleted = 0;
  let project_stages_result = await GenericRepository.fetchData(get_project_stages_data);
  // console.log('*************** I am here 2 *****************');
  if(project_stages_result.rows.length == 0){
  let post_project_stages_primary_payment_data = {};
  post_project_stages_primary_payment_data.table = 'project_stages';
  post_project_stages_primary_payment_data.data = {};
  post_project_stages_primary_payment_data.data.project_id = project_data.id;
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
  project_task.table='project_tasks',
  project_task.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Mobilize to Site',
    name_arabic:'التجهيز لمتطلبات الموقع',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data=await GenericRepository.createData(project_task);

  let project_task_second={};
  project_task_second.table='project_tasks',
  project_task_second.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Issuance of Building Permit ',
    name_arabic:'الشروع في البناء من البلدية المحلية',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data_second=await GenericRepository.createData(project_task_second);

  let project_task_third={};
  project_task_third.table='project_tasks',
  project_task_third.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Advance Payment ',
    name_arabic:  'دفع الدفعة المقدمة' ,
    status:1,
    type:'Invoice Payment',
    type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_third=await GenericRepository.createData(project_task_third);

  let project_task_fourth={};
  project_task_fourth.table='project_tasks',
  project_task_fourth.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Appoint Consultant ',
    name_arabic:  'تعيين الإستشاري'  ,
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_fourth=await GenericRepository.createData(project_task_fourth);




  // console.log('*************** I am here 3 *****************');

  
  let post_project_stages_maintenance_data = {};
  post_project_stages_maintenance_data.table = 'project_stages';
  post_project_stages_maintenance_data.data = {};
  post_project_stages_maintenance_data.data.project_id = project_data.id;
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
  project_task_maintain.table='project_tasks',
  project_task_maintain.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Complete all maintenance requirements ',
    name_arabic:'   إكمال جميع متطلبات الصيانة ',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'

  }

  let project_task_maintain_data=await GenericRepository.createData(project_task_maintain);


  let project_task_mintain_second={};
  project_task_mintain_second.table='project_tasks',
  project_task_mintain_second.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Witness and Approve completion of Maintenance Tasks ',
    name_arabic:   'الشهادة والموافقة الكتابية على إكتمال صيانة المبنى',
    status:1,
    type:'Inspection Request',
    type_arabic:'طلب تفتيش',
    creator:'system',
    assignee:'Consultant '


  }

  let project_task_mintain_second_data=await GenericRepository.createData(project_task_mintain_second);


  let project_task_mintain_third={};
  project_task_mintain_third.table='project_tasks',
  project_task_mintain_third.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Final Payment ',
    name_arabic:   'دفع الدفعة الأخيرة عند انتهاء الأعمال و موافقة الإستشاري',
    status:1,
    type:'Invoice Payment',
    type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client  '


  }

  let project_task_mintain_third_data=await GenericRepository.createData(project_task_mintain_third);

  
  
  //   let note_fetch={};
  //   note_fetch.table='notes',
  //   note_fetch.where={project_id:project_data.id};
  //   let note_fetch_data=await GenericRepository.fetchData(note_fetch);
  //   if(note_fetch_data.rows.length>0){
  //   let note={};
  //   note.table='notes',
  //   note.data={
  //       notes_holder:note_fetch_data.rows[0].dataValues.notes_holder,
  //       project_id:project_data.id,
  //       status:2,
  //       callback_date:note_fetch_data.rows[0].dataValues.callback_date,
  //       color_tag:'#808080'
  //   }
  

  // let note_add=await GenericRepository.createData(note);
  //   }


  // console.log('*************** I am here 4 *****************');

  
  }
  let drawingEventEmmiter = { project_id: project_data.id, type: 'drawing', zip_type: 'drawing_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', drawingEventEmmiter);
  let docEventEmmiter = { project_id: project_data.id, type: 'document', zip_type: 'document_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', docEventEmmiter);
  let otherEventEmmiter = { project_id: project_data.id, type: 'other', zip_type: 'other_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', otherEventEmmiter);
  }

  
  res.send({ status: 201, data: data, message: 'project successfully created', purpose: "project successfully created" });
  
  
  }
  
  })
  
  } else {
  
  res.send({ status: 201, data: data, message: 'project successfully created', purpose: "project successfully created" });
  
  
  }
  
  
  } catch (err) {
  console.trace(err)
  
  res.send({ status: 500, err: err });
  
  }
  
  
  })()
  
  }





/*project-doc api
method:POST
input:file[ image]
output:data
purpose:project document upload
created by Anirban Das
*/


/**
 * @swagger
 * /api/admin/project-doc:
 *  post:
 *   tags:
 *    - Project Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
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
ProjectController.uploadProjectDoc = (req, res) => {


  console.log(req.files.image);

  if (req.files.image) {

    let data = { resource_type: req.files.image[0].mimetype, resource_url: global.constants.IMG_URL.project_docs + req.files.image[0].filename }

    res.send({ status: 201, data: data, message: 'file uploaded and updated', purpose: "project document upload" });

  } else {

    res.send({ status: 500, message: 'file uploaded successfully', purpose: "project document upload" });

  }


}


/*client-invite-consultent api
method:POST
input:body[ email,project_id]
output:mail sent,
purpose:to invite consultent
created by anirban das
*/
/**
 * @swagger
 * /api/admin/project:
 *  put:
 *   tags:
 *    - Project Management
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
 *            project_type:
 *              type: integer
 *              description: 1=>structure,2=>turn key
 *            name:
 *              type: string
 *            project_location:
 *              type: string
 *            project_use_type:
 *              type: string
 *            plot_area:
 *              type: number
 *            basement:
 *              type: integer
 *            levelling_floor:
 *              type: integer
 *            gound_floor:
 *              type: integer
 *            additional_floors:
 *              type: integer
 *            pent_floor:
 *              type: integer
 *            is_user_owner:
 *              type: integer
 *              description: 0 => Yes, 1 => No
 *            current_state:
 *              type: integer
 *            status:
 *              type: integer
 *              description: 	0 => Not submitted yet(draft), 1 => pending_admin_approval, 2 => accept_by_admin/ready_for_bid, 3 => rejected_by_admin,4=>closed by admin,5=>project_awarded,6=>awarded and sign
 *            is_all_drawing:
 *              type: integer
 *            is_drawing_available_comment:
 *              type: string
 *            land_serial_no:
 *              type: string
 *            national_id:
 *              type: string
 *            special_request:
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
ProjectController.updateProject = (req, res) => {


  (async () => {
  
  try {
  var data = {};
  let project_info = {};
  project_info.table = 'projects',
  project_info.data = {
  project_type:req.body.project_type,
  name: req.body.name,
  project_location: req.body.project_location,
  project_use_type: req.body.project_use_type,
  plot_area: req.body.plot_area,
  basement: req.body.basement,
  levelling_floor: req.body.levelling_floor,
  gound_floor: req.body.gound_floor,
  additional_floors: req.body.additional_floors,
  pent_floor: req.body.pent_floor,
  is_user_owner: req.body.is_user_owner,
  current_state: req.body.current_state,
  status: req.body.status,
  is_all_drawing : req.body.is_all_drawing,
  is_drawing_available_comment :req.body.is_drawing_available_comment,
  land_serial_no :req.body.land_serial_no,
  national_id :req.body.national_id,
  special_request :req.body.special_request
  }
 
 
  if(req.body.project_submit_date){
    project_info.data.project_submit_date=req.body.project_submit_date
  }


  
  if (req.body.built_up_area && req.body.built_up_area != "") {
  project_info.data.built_up_area = req.body.built_up_area;
  }
  if(req.body.bank_loan){
    project_info.data.bank_loan=req.body.bank_loan;
  }
  
  project_info.where = { id: req.body.id };
  
  let project_data = await GenericRepository.updateData(project_info);

  var notes={};
  notes.data={
    notes_holder:req.body.notes,
    project_id:req.body.id,
    callback_date:req.body.call_back_date,
    color_tag:req.body.color_tag
  }
  notes.table='notes';
  notes.where={project_id:req.body.id};
  let notes_fetch=await GenericRepository.fetchData(notes);
  if(notes_fetch.rows.length>0){

    let notes_update=await GenericRepository.updateData(notes);
  }
  else{
  let notes_create=await GenericRepository.createData(notes);
  }
  
  
  data.project_data = project_data;
  var project_meta_add = {};
  var project_meta_update = [];
  var project_meta_add_data = [];
  var project_meta_update_data = [];
  var project_meta_update_val = {};
  var project_meta = JSON.parse(req.body.project_meta);
  
  if (req.body.project_meta && project_meta.length > 0) {
  project_meta_add.data = [];
  project_meta.forEach((item) => {
  if (item.id) {
  item.project_id = req.body.id;
  project_meta_update.push(item);
  } else {
  project_meta_add.data.push(item);
  }
  
  
  })
  
  if (project_meta_add.data.length > 0) {
  project_meta_add.table = 'project_metas';
  project_meta_add_data = await GenericRepository.bulkCreateData(project_meta_add);
  }
  
  if (project_meta_update.length > 0) {
  project_meta_update.forEach(async (item, index, arr) => {
  // console.log(item);
  project_meta_update_val.where = { id: project_meta_update[index].id };
  project_meta_update_val.data = item;
  project_meta_update_val.table = 'project_metas';
  // console.log(project_meta_update_val);
  project_meta_update_data.push(await GenericRepository.updateData(project_meta_update_val));
  
  })
  
  }
  
  }
  
  let project_docs_and_tags = {};
  project_docs_and_tags.data = JSON.parse(req.body.project_docs_and_tags);
  data.project_docs_data = [];
  if (req.body.project_docs_and_tags && project_docs_and_tags.data.length > 0) {
  var project_docs = {};
  var project_tags = {};
  
  
  project_docs_and_tags.data.forEach(async (item, index, arr) => {
  project_docs.data = JSON.parse(JSON.stringify(item));
  project_docs.data.project_id = req.body.id;
  project_docs.table = 'project_docs';
  delete project_docs.data.tags
  if (project_docs.data.id) {
  project_docs.where = { id: project_docs.data.id };
   GenericRepository.updateData(project_docs);
   console.log("////////////////////////////////////"+project_docs);
  } else {
  var project_docs_data = await GenericRepository.createData(project_docs);
  }
  // data.project_docs_data.push(JSON.parse(JSON.stringify(project_docs_data)));
  if (item.tags.length > 0) {
  let tags = item.tags;
  if (project_docs_data) {
  project_tags.data = tags.map(function (el) {
  var o = Object.assign({}, el);
  o.project_doc_id = project_docs_data.id;
  return o;
  })
  } else {
  project_tags.data = tags.map(function (el) {
  var o = Object.assign({}, el);
  o.project_doc_id = project_docs.data.id;
  return o;
  })
  }
  
  // project_tags.table = 'project_doc_tags';
  var project_tags_data = {};
  project_tags.data.forEach(async (item1, index1, arr1) => {
  project_tags_data = {};
  project_tags_data.data = item1;
  project_tags_data.table = 'project_doc_tags';
  if (item1.id) {
  project_tags_data.where = { id: item1.id };
  console.log(project_tags_data);
  
  await GenericRepository.updateData(project_tags_data);
  
  } else {
  
  await GenericRepository.createData(project_tags_data);
  
  }
  
  })
  
  
  // let project_tags_data = await GenericRepository.bulkCreateData(project_tags);
  // data.project_docs_data[index].project_tags_data = JSON.parse(JSON.stringify(project_tags_data));
  
  }
  
  // if(index == project_docs_and_tags.data.length-1 ){
  
  
  
  // }
  
  // })
  
  
  if (req.body.status == 1 && index == project_docs_and_tags.data.length - 1) {
  let get_project_stages_data = {};
  get_project_stages_data.table = 'project_stages';
  get_project_stages_data.where = {};
  get_project_stages_data.where.project_id = req.body.id;
  get_project_stages_data.where.is_deleted = 0;
  let project_stages_result = await GenericRepository.fetchData(get_project_stages_data);
  if(project_stages_result.rows.length == 0){
  let post_project_stages_primary_payment_data = {};
  post_project_stages_primary_payment_data.table = 'project_stages';
  post_project_stages_primary_payment_data.data = {};
  post_project_stages_primary_payment_data.data.project_id = req.body.id;
  post_project_stages_primary_payment_data.data.name = 'primary_payment';
  post_project_stages_primary_payment_data.data.description = 'primary_payment';
  post_project_stages_primary_payment_data.data.maximum_allowed_percentage = 5;
  // post_project_stages_primary_payment_data.data.status = 4;
  post_project_stages_primary_payment_data.data.status = 0;
  post_project_stages_primary_payment_data.data.is_default = 1;
  post_project_stages_primary_payment_data.data.max_allow_pullback = 0;
  post_project_stages_primary_payment_data.data.sequence = 0;
  let post_project_stages_primary_payment_result = await GenericRepository.createData(post_project_stages_primary_payment_data);

  let project_task={};
  project_task.table='project_tasks',
  project_task.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Mobilize to Site',
    name_arabic:'التجهيز لمتطلبات الموقع',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data=await GenericRepository.createData(project_task);

  let project_task_second={};
  project_task_second.table='project_tasks',
  project_task_second.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Issuance of Building Permit ',
    name_arabic:' الشروع في البناء من البلدية المحلية ',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'
  }

  let project_task_data_second=await GenericRepository.createData(project_task_second);

  let project_task_third={};
  project_task_third.table='project_tasks',
  project_task_third.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Advance Payment ',
    name_arabic:'  دفع الدفعة المقدمة ',
    status:1,
    type:'Invoice Payment',
    type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_third=await GenericRepository.createData(project_task_third);

  let project_task_fourth={};
  project_task_fourth.table='project_tasks',
  project_task_fourth.data={
    stage_id:post_project_stages_primary_payment_result.dataValues.id,
    name:'Appoint Consultant ',
    name_arabic:'  تعيين الإستشاري  ',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Client'
  }

  let project_task_data_fourth=await GenericRepository.createData(project_task_fourth);



  
  let post_project_stages_maintenance_data = {};
  post_project_stages_maintenance_data.table = 'project_stages';
  post_project_stages_maintenance_data.data = {};
  post_project_stages_maintenance_data.data.project_id = req.body.id;
  post_project_stages_maintenance_data.data.name = 'maintenance';
  post_project_stages_maintenance_data.data.description = 'maintenance';
  post_project_stages_maintenance_data.data.maximum_allowed_percentage = 5;
  post_project_stages_maintenance_data.data.status = 0;
  post_project_stages_maintenance_data.data.is_default = 1;
  post_project_stages_maintenance_data.data.max_allow_pullback = 0;
  post_project_stages_maintenance_data.data.sequence = 0;
  let post_project_stages_maintenance_result = await GenericRepository.createData(post_project_stages_maintenance_data);


  let project_task_maintain={};
  project_task_maintain.table='project_tasks',
  project_task_maintain.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Complete all maintenance requirements ',
    name_arabic:'   إكمال جميع متطلبات الصيانة ',
    status:1,
    type:'Custom Request',
    type_arabic:'طلب مخصص',
    creator:'system',
    assignee:'Contractor'

  }

  let project_task_maintain_data=await GenericRepository.createData(project_task_maintain);


  let project_task_mintain_second={};
  project_task_mintain_second.table='project_tasks',
  project_task_mintain_second.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Witness and Approve completion of Maintenance Tasks ',
    name_arabic:'   الشهادة والموافقة الكتابية على إكتمال صيانة المبنى ',
    status:1,
    type:'Inspection Request',
    type_arabic:'طلب تفتيش',
    creator:'system',
    assignee:'Consultant '


  }

  let project_task_mintain_second_data=await GenericRepository.createData(project_task_mintain_second);


  let project_task_mintain_third={};
  project_task_mintain_third.table='project_tasks',
  project_task_mintain_third.data={
    stage_id:post_project_stages_maintenance_result.dataValues.id,
    name:'Final Payment ',
    name_arabic:'   دفع الدفعة الأخيرة عند انتهاء الأعمال و موافقة الإستشاري  ',
    status:1,
    type:'Invoice Payment',
    type_arabic:'دفع الفاتورة',
    creator:'system',
    assignee:'Client  '


  }

  let project_task_mintain_third_data=await GenericRepository.createData(project_task_mintain_third);




  
  }
  let drawingEventEmmiter = { project_id: req.body.id, type: 'drawing', zip_type: 'drawing_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', drawingEventEmmiter);
  let docEventEmmiter = { project_id: req.body.id, type: 'document', zip_type: 'document_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', docEventEmmiter);
  let otherEventEmmiter = { project_id: req.body.id, type: 'other', zip_type: 'other_zip' };
  global.eventEmitter.emit('createProjectDrawingZip', otherEventEmmiter);
  }
  
  })
  }
  var project_info_val = { project_id: req.body.id };
  
  res.send({ status: 201, data: project_info_val, message: 'project successfully updated', purpose: "project successfully created" });
  // }
  
  
  } catch (err) {
  console.trace(err)
  
  res.send({ status: 500, err: err });
  
  }
  
  
  })()
  
  }

/*mail-Check-For-Create-Project api
method:POST
input:body[ email,user_id]
output:mail sent,
purpose:to updated and mail send
created by sayanti nath
*/

ProjectController.mailCheckForCreateProject=async(req,res)=>{
  try{
      let user={};
  user.table='user',
  user.where={id:req.body.user_id};

  user.data={
    email:req.body.email
   }
   let user_update=await GenericRepository.updateData(user);
   let email_data={};
   email_data.email=req.body.email;
   global.eventEmitter.emit(email_data);


return res.send({status:200,message:'value updated and mail send',purpose:'value updated and mail send',data:[]})

  } catch (err) {
  console.trace(err)
  
  res.send({ status: 500, err: err });
}
}



/*project-zip
method:POST
input:file[ id,type]
output:data
purpose:project document fetch
created by Anirban Das
*/

ProjectController.fetchProjectDoc = (req, res) => {


  (async () => {
    try {
      var data = {};
      data.table = 'project_docs';
      data.where = { is_delete: 0, is_active: 1, project_id: req.query.id, type: req.query.type };

      let projectDocsData = await GenericRepository.fetchData(data)

      res.send({ status: 200, data: projectDocsData, message: 'Project docs details fetch successfully', purpose: "Project docs details fetch successfully" });


    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: 'Project docs details fetching error', err: err });

    }

  })()

}


/*project api
method:GET
output:data,
purpose:to show project and implement searching,sorting,filtering
created by sayanti Nath
*/


ProjectController.projectListingSearching = (req, res) => {


  (async () => {

    try {

      if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);




      let and_data = [];
      let or_data = [];
      let name_data = [];
      console.log(req.user_id)
      and_data.push({ is_delete: 0, user_id: req.user_id })


      if (req.query.search_text) {

        or_data.push({ name: { $like: '%' + req.query.search_text + '%' } });
        
        or_data.push({ user_id: { $in: [sequelize.literal('SELECT id FROM `users` WHERE `full_name` LIKE "%' + req.query.search_text + '%"')] } })



      }




      if (req.query.search == 'active') {
        name_data.push({ is_active: 1, is_delete: 0, user_id: req.user_id })

      }
      if (req.query.search == 'reject') {
        name_data.push({ status: 3, is_delete: 0, user_id: req.user_id })
      }

      if (req.query.search == 'draft') {
        name_data.push({ status: 0, is_delete: 0, user_id: req.user_id })
      }
      let info = {};
      //info.table='projects';
      if (name_data.length > 0 && or_data.length > 0) {
        info.where = { $or: or_data, $and: name_data };
      }
      // info.user_where = user_where
      else if (name_data.length > 0) {

        info.where = name_data;
      }

      else if (or_data.length > 0) {
        // info.where= { $or:or_data,$and:name_data};
        info.where = { $or: or_data, $and: and_data };
      }
      else {
        info.where = and_data;
        //info.user_where = {};
      }
      let order = [[]];
      console.log(req.query.order)
      if (req.query.order == 'createatasc') {
        order = [['createdAt', 'ASC']];

      }
      else if (req.query.order == 'createatdsc') {
        order = [['createdAt', 'DESC']];

      }

      else if (req.query.order == 'buildareadsc') {
        order = [['built_up_area', 'DESC']];

      }
      else if (req.query.order == 'buildareaasc') {
        order = [['built_up_area', 'ASC']];

      }




      else {
        order = [['id', 'DESC']];
      }

      let fetch_project = await ConsultationhubRepository.fetchProjectData(info, limit, offset, order);

      for(index in fetch_project.rows){
        let sign={};
        sign.table='project_contracts',
        sign.where={project_id:fetch_project.rows[index].dataValues.id,cllient_acceptance:1,contractor_acceptance:1};

        let sign_update=await GenericRepository.fetchData(sign);

        if(sign_update.rows.length>0){
          fetch_project .rows[index].dataValues.sign_complete_for_project=1;
        }
        else{
          fetch_project .rows[index].dataValues.sign_complete_for_project=0;
        }


      

      //fetch_project .rows[index].dataValues.contractor_name=project_bids_data.rows[index].dataValues.id;

      //res.send({ status: 201, data: fetch_project,contractor:project_bids_data })


      }


      for(index in fetch_project.rows){

      let project_bids={};
     
       project_bids.where={project_id:fetch_project.rows[index].dataValues.id,status:1}
 
       var project_bids_data=await ConsultationhubRepository.fetchProjectDataOther(project_bids,limit,offset);

       fetch_project.rows[index].dataValues.sign_id=project_bids_data;

      // console.log(project_bids_data)
       //res.send({ status: 201, data: fetch_project,contractor:project_bids_data })
      }

      for(index in fetch_project.rows){
        let bid_count={};
        bid_count.table='project_bids',
        bid_count.where={project_id:fetch_project.rows[index].dataValues.id};
        let bid_count_fetch=await GenericRepository.fetchData(bid_count);
        fetch_project.rows[index].dataValues.bid_count=bid_count_fetch.count;
      }
 

     

      res.send({ status: 201, data: fetch_project,message:'project listing',purpose:'project listing'})

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()




}
/*project-listsort api
method:GET
output:data,
purpose:to show project and implement searching,sorting,filtering
created by sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-listsort:
 *  get:
 *   tags:
 *    - Project Scope
 *   parameters:
 *    - in: query
 *      name: limit
 *      required: ture
 *      schema:
 *       type: integer
 *       value: 3
 *    - in: query
 *      name: page
 *      required: ture
 *      schema:
 *       type: integer
 *    - in: query
 *      name: search_text
 *      schema:
 *       type: string
 *    - in: query
 *      name: search
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
ProjectController.projectFetchAdmin = (req, res) => {
  (async () => {

    try {

      if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

      let info = {};
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);

      let and_data = [];
      let user_where = [];
      let name_data = [];

      //let and_data=[];
      let or_data = [];
      console.log("hello")
      and_data.push({ is_delete: 0 })
      and_data.push({status:{$ne:1}})

      if (req.query.search_text) {

        or_data.push({ id : { $like: '%' + req.query.search_text + '%' } });
        or_data.push({ name: { $like: '%' + req.query.search_text + '%' } });
        or_data.push({ user_id: { $in: [sequelize.literal('SELECT id FROM `users` WHERE `full_name` LIKE "%' + req.query.search_text + '%"')] } })

      }

      if (req.query.search == "active") {
        name_data.push({ is_active: 1 })
      }

      if (req.query.search == "approved") {
        name_data.push({ status: 2 })
      }

      if (req.query.search == "pending") {
        name_data.push({ status: 1 })
      }

      if (req.query.search == "reject") {
        name_data.push({ status: 3 })

      }
      if (req.query.search == "closed") {
        name_data.push({ status: 4 })

      }
      if (req.query.search == "new") {
        let start_date = moment().format('YYYY-MM-DD');
        let end_date = moment(start_date).subtract(6, 'days').format('YYYY-MM-DD');



        name_data.push({ createdAt: { [Op.between]: [end_date, start_date] } })

      }

      if(req.query.search=='draft'){
        name_data.push({ status: 0 ,is_delete: 0})

      }
      if(req.query.search=='awarded'){
        name_data.push({ status: 5 ,is_delete: 0})

      }
      if(req.query.search=='signed'){
        name_data.push({ status: 6,is_delete: 0 })

      }







      if (name_data.length > 0 && or_data.length > 0) {
        info.where = { $or: or_data, $and: name_data };
      }
      // info.user_where = user_where
      else if (name_data.length > 0) {

        info.where = name_data;
      }

      else if (or_data.length > 0) {
        // info.where= { $or:or_data,$and:name_data};
        info.where = { $or: or_data, $and: and_data };
      }
      else {
        info.where = and_data;
        //info.user_where = {};
      }
      let order = [[]];
      let sort = [[]];
      if (req.query.order == 'projectnameasc') {

        order = [['name', 'ASC']];

      }

      else if (req.query.order == 'projectnamedsc') {

        order = [['name', 'DESC']];

      }
      else if (req.query.order == 'usernamedsc') {
        let user_id = sequelize.literal('SELECT full_name FROM `users`')
        // console.log(user_id)


        order = [['user_id', 'DESC']];

      }
      else if (req.query.order == 'usernameasc') {

        sort = [['full_name', 'ASC']];

      }


      else if (req.query.order == 'lastupdate') {

        order = [['updatedAt', 'DESC']];


      }
      else if (req.query.order == 'newupdate') {

        order = [['updatedAt', 'ASC']];


      }
      else if(req.query.order == 'creatAtasc'){

        order=[['createdAt','ASC']]
      }

      else if(req.query.order == 'creatAtdsc'){

        order=[['createdAt','DESC']]
      }





      else if (req.query.order == 'id') {

        order = [['id', 'ASC']];


      }

      else {
        order = [['id', 'DESC']];
      }
      console.log(info)

      let fetch_data = await ConsultationhubRepository.fetchProjectDataAdmin(info, limit, offset, order, sort);

      for(index in fetch_data.rows){

      //   console.log('//////////');
        let notes={};
        notes.table='notes';
        notes.where={
          project_id:fetch_data.rows[index].dataValues.id
        }
        let notes_fetch=await GenericRepository.fetchData(notes);
        console.log( notes_fetch.rows);

        fetch_data.rows[index].dataValues.notes=notes_fetch.rows;

      //   if(notes_fetch.rows.length>0){
      //     fetch_data.rows[index].dataValues.notes=notes_fetch.rows.dataValues.notes;
      //     fetch_data.rows[index].dataValues.callback_note=notes_fetch.rows.dataValues.note;
      //     fetch_data.rows[index].dataValues.color_tag=notes_fetch.rows.color_tag;
      //   }



      }
     // console.log(fetch_data.length)
      let limit_new=9999999999999999;
      let offset_new=0;
      let fetch_data_count = await ConsultationhubRepository.fetchProjectDataAdmin(info, limit_new, offset_new, order, sort);
     
      res.send({ status: 201, total_count: fetch_data_count.rows.length, data: fetch_data,message:'project listing',purpose:'project listing' })





    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}


/**
api name: project-scope
method:GET
input:body[page,limit],
output:data,
purpose:Admin Project Scope fetching.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/project-scope:
 *  get:
 *   tags:
 *    - Project Scope
 *   parameters:
 *    - in: query
 *      name: limit
 *      required: ture
 *      schema:
 *       type: integer
 *       value: 3
 *    - in: query
 *      name: page
 *      required: ture
 *      schema:
 *       type: integer
 *    - in: query
 *      name: search_text
 *      schema:
 *       type: string
 *    - in: query
 *      name: type
 *      schema:
 *       type: integer
 *    - in: query
 *      name: scope_type
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

ProjectController.fetchProjectScope = (req, res) => {

  (async () => {

    try {

      console.log("hello");
      let data = {};
      let page = parseInt(req.query.page);
      let or_data = [];
      let and_data = [];
      let name_data=[];
      data.table = 'project_scopes';
      data.limit = parseInt(req.query.limit);
      data.offset = data.limit * (page - 1);
      //data.where = { is_deleted: 0 };
      and_data.push({is_deleted: 0})

     

      if(req.query.search_text){
        console.log("hii");
        or_data.push({scope_description:{$like:'%'+req.query.search_text+'%'}});
       or_data.push({scope_description_arabic:{$like:'%'+req.query.search_text+'%'}});
        or_data.push({scope_type:{$like:'%'+req.query.search_text+'%'}});
      }

      if(req.query.type){
        name_data.push({is_deleted: 0,type:req.query.type})
      }

      if(req.query.scope_type){
        name_data.push({is_deleted: 0,scope_type:req.query.scope_type})
      }



      if (name_data.length > 0 && or_data.length > 0) {
        data.where = { $or: or_data, $and: name_data };
      }
      // info.user_where = user_where
      else if (name_data.length > 0) {

        data.where = name_data;
      }

      else if (or_data.length > 0) {
        // info.where= { $or:or_data,$and:name_data};
        data.where = { $or: or_data, $and: and_data };
      }
      else {
      data.where = and_data;
        //info.user_where = {};
      }


      let articleTopicData = await GenericRepository.fetchDataWithPegination(data)

      res.send({ status: 200, data: articleTopicData, message: 'Project scope fetch successfully', purpose: "Admin Project Scope fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin Project Scope fetching" });


    }


  })()

}




/* project-scope
method:POST
input:body[scope_description,type,group_name,scope_type],
output:data,
purpose:Project Scope Created"
created by Anirban das
*/

/**
 * @swagger
 * /api/admin/project-scope:
 *  post:
 *   tags:
 *    - Project Scope
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            scope_description:
 *              type: string
 *            type:
 *              type: integer
 *              description: 1:-default,2:-custom
 *            group_name:
 *              type: string
 *            scope_type:
 *              type: integer
 *              description: 1:-choice,2:-question,3:-notes
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


ProjectController.createProjectScope = (req, res) => {


  (async () => {

    try {
      await sequelize.transaction(async (t) => {

      let project_scopes = {};
      project_scopes.table = 'project_scopes',
        project_scopes.data = {
          scope_description: req.body.scope_description,
          type: req.body.type,
          group_name: req.body.group_name,
          scope_type: req.body.scope_type
        }

        if(req.body.scope_description_arabic){
          project_scopes.data.scope_description_arabic = req.body.scope_description_arabic
        }

        project_scopes.transaction=t;

      let project_data = await GenericRepository.createData(project_scopes);

      res.send({ status: 201, data: project_data, message: 'Project Scope data Created successfully', purpose: "Project Scope Created" });
      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err, purpose: "Project Scope Created" });

    }


  })()

}


/* project-scope
method:POST
input:body[scope_description,type,group_name,scope_type],
output:data,
purpose:Project Scope updated"
created by Anirban das
*/

/**
 * @swagger
 * /api/admin/project-scope-details:
 *  put:
 *   tags:
 *    - Project Scope
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
 *            scope_description:
 *              type: string
 *            type:
 *              type: integer
 *              description: 1:-default,2:-custom
 *            group_name:
 *              type: string
 *            scope_type:
 *              type: integer
 *              description: 1:-choice,2:-question,3:-notes
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

ProjectController.updateProjectScope = (req, res) => {


  (async () => {

    try {
      await sequelize.transaction(async (t) => {

      let project_scopes = {};
      project_scopes.table = 'project_scopes';

      project_scopes.where = { id: parseInt(req.body.id) };
      project_scopes.data = {
        scope_description: req.body.scope_description,
        type: req.body.type,
        group_name: req.body.group_name,
        scope_type: req.body.scope_type
      }

      if(req.body.scope_description_arabic){
        project_scopes.data.scope_description_arabic = req.body.scope_description_arabic
      }


      project_scopes.transaction=t;
      let data = await GenericRepository.updateData(project_scopes)

      res.send({ status: 200, message: 'Project Scope data updated successfully', purpose: "Project Scope data updated",data:[] });

    })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err, purpose: "Project Scope Created" });

    }


  })()

}


/* project-scope
method:POST
input:body[scope_description,type,group_name,scope_type],
output:data,
purpose:Project Scope delete"
created by Anirban das
*/

/**
 * @swagger
 * /api/admin/project-scope:
 *  delete:
 *   tags:
 *    - Project Scope
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
ProjectController.deleteProjectScope = (req, res) => {


  (async () => {

    try {
      await sequelize.transaction(async (t) => {
      let project_scopes = {};
      project_scopes.table = 'project_scopes';

      project_scopes.where = { id: parseInt(req.body.id) };
      project_scopes.data = { is_deleted: 0 }
      project_scopes.transaction=t;

      let data = await GenericRepository.updateData(project_scopes)

      res.send({ status: 200, message: 'Project Scope data deleted successfully', purpose: "Project Scope data deleted",data:[] });

      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err, purpose: "Project Scope data deleted" });

    }


  })()

}

/**
api name: project-scope-details
method:GET
input:body[id,page,limit],
output:data,
purpose:Admin Project Scope details fetching.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/project-scope-details:
 *  get:
 *   tags:
 *    - Project Scope
 *   parameters:
 *    - in: query
 *      name: id
 *      required: ture
 *      schema:
 *       type: integer
 *       value: 3
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


ProjectController.fetchProjectScopeDetails = (req, res) => {

  (async () => {

    try {
      let data = []
      data.table = 'project_scopes';
      data.where = { is_deleted: 0, id: req.query.id };

      let articleTopicData = await GenericRepository.fetchData(data)

      res.send({ status: 200, data: articleTopicData, message: 'Project scope details fetch successfully', purpose: "Admin project scope details fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin project scope details fetching" });


    }


  })()

}

/* project-scope
method:POST
input:body[scope_description,type,group_name,scope_type],
output:data,
purpose:Project Scope Created"
created by Anirban das
*/


/**
 * @swagger
 * /api/admin/project-stage:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description:
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
 *              type: integer
 *            name:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            maximum_allowed_percentage:
 *              type: integer
 *            status:
 *              type: integer
 *              description: 0:-In Tendering,1:-on track,2:-Delay,3:-completed
 *            max_allow_pullback:
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

ProjectController.createProjectStage = (req, res) => {


  (async () => {

    try {

      console.log(req.body);
      var project_stages = {};
      project_stages.table = 'project_stages';
      project_stages.where = { project_id: req.body.project_id,is_default:0,is_deleted:0};
     // project_stages_fet.where = {is_default:0};


      var project_stage_data_fetch = await GenericRepository.fetchData(project_stages);
      console.log(project_stage_data_fetch.rows.length);
      project_stages.data={};

     


      if(project_stage_data_fetch.rows.length>0 ){
        console.log("hello");

        var b=project_stage_data_fetch.rows.length;
        var c=b+1;
        console.log(c)
        

        project_stages.data.sequence=c;

       
      }

      else{

        project_stages.data.sequence=1;
        

      }

      project_stages.data.project_id =  req.body.project_id,
      project_stages.data.name=req.body.name,
      project_stages.data.description=  req.body.description,
      project_stages.data.description_arabic=  req.body.description_arabic,

      project_stages.data.maximum_allowed_percentage=req.body.maximum_allowed_percentage,
      project_stages.data.status=req.body.status,
      project_stages.data.max_allow_pullback=req.body.max_allow_pullback;
       
        

       


      let project_data = await GenericRepository.createData(project_stages);


      let project_task={};
      project_task.table='project_tasks',
      project_task.data={
        stage_id:project_data.dataValues.id,
        name:'Stage Scope Completion in accordance to Drawings & Specifications',
        name_arabic:'إكمال المرحلة وفقًا للرسومات والمواصفات',
        status:1,
        type:'Custom Request',
        type_arabic:'طلب مخصص',
        creator:'system',
        assignee:'Contractor'

      }

      let project_task_data=await GenericRepository.createData(project_task);

      let project_task_second={};
      project_task_second.table='project_tasks',
      project_task_second.data={
        stage_id:project_data.dataValues.id,
        name:'Witness and Approve technical compliance with Drawings & Specifications',
        name_arabic: 'الشهادة والموافقة كتابيا على الامتثال الفني للرسومات والمواصفات',
        status:1,
        type:'Inspection Request',
        type_arabic:'طلب تفتيش',
        creator:'system',
        assignee:'Consultant'

      }

      let project_task_data_second=await GenericRepository.createData(project_task_second);

      let project_task_third={};
      project_task_third.table='project_tasks',
      project_task_third.data={
        stage_id:project_data.dataValues.id,
        name:'Pay Stage Payment upon Scope Completion and Consultant Approval',
        name_arabic: 'دفع الدفعة المرحلية عند انتهاء الأعمال و موافقة الإستشاري',
        status:1,
        type:'Invoice Payment',
        type_arabic:'دفع الفاتورة',
        creator:'system',
        assignee:'Client'

      }

      let project_task_data_third=await GenericRepository.createData(project_task_third);



      res.send({ status: 201, data: project_data, message: 'Project stage created successfully', purpose: "Project Stage Created" });


    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err, purpose: "Project Stage Created" });

    }


  })()

}

/* project-tasks
method:POST
input:data
output:data,
purpose:to add and edit project task
created by sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-task:
 *  put:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            stage_id:
 *              type: integer
 *            data:
 *              type: array
 *              items:
 *                properties:
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
 *                      description: System,Admin
 *                    assignee:
 *                      type: string
 *                      description: Contractor, Client, Consultant
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

ProjectController.createProjectTasks = (req, res) => {


  (async () => {

    try {
     


      let data = {};
      data = req.body.data;

      data.forEach(async function (item, index, arr) {
        if (item.id) {
          let project_tasks = {};
          project_tasks.table = 'project_tasks',
            project_tasks.data = {
              //stage_id:req.body.stage_id,
              name: item.name,
              name_arabic:item.name_arabic,
              status: item.status,
              type: item.type,
              type_arabic:item.type_arabic,
              instruction: item.instruction,
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
          project_tasks.table = 'project_tasks',
            project_tasks.data = {
              stage_id: req.body.stage_id,
              name: item.name,
              name_arabic:item.name_arabic,
              status: item.status,
              type: item.type,
              type_arabic:item.type_arabic,
              instruction: item.instruction,
              instruction_arabic:item.instruction_arabic,
              creator: item.creator,
              assignee: item.assignee,
              // is_delete:item.is_delete

            }

          let project_tasks_create = await GenericRepository.createData(project_tasks);
        }

      })


      res.send({ status: 200, message: 'tasks created' ,purpose:'tasks created',data:[]})

     

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err, purpose: "Project Stage Created" });

    }


  })()


}

/* project-status-change api
method:PUT
input:body[project_id,status],
output:data,
purpose:Project status updated"
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-status-change:
 *  put:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
 *              type: integer
 *            status:
 *              type: integer
 *              description: 0 => Not submitted yet(draft), 1 => pending_admin_approval, 2 => accept_by_admin/ready_for_bid, 3 => rejected_by_admin,4=>closed by admin,5=>project_awarded,6=>awarded and sign
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


ProjectController.projectApproveOrDisapprove = (req, res) => {



  (async () => {

    try {
      let project_status = {};
      project_status.table = 'projects';
      project_status.where = {};
      project_status.where.id = req.body.project_id;
      project_status.data = {
        status: req.body.status
      }
      let project_status_table = await GenericRepository.updateData(project_status);
      // let date=project_status_table.dataValues.updatedAt.format('YYYY-MM-DD');
      let closed_data = moment(project_status_table.dataValues.updatedAt).add(14, 'days').format("YYYY-MM-DD");

      console.log(closed_data)

      if (req.body.status == 2) {

        let data = {};
        data.table = 'projects',
          data.where = {};
        data.where.id = project_status_table.dataValues.id;
        data.data = {
          bid_closed_date: closed_data
        }

        let project_updatedate = await GenericRepository.updateData(data);


        let info = {};
        info.where = {};
        info.where.id = req.body.project_id;

        let project_user = await ConsultationhubRepository.fetchProjectDataAdmin(info);

        let name = project_user.rows[0].dataValues.user.full_name;


        let email_data = {};
        email_data.username = name;

        email_data.projectname = project_user.rows[0].dataValues.name;
        email_data.location = project_user.rows[0].dataValues.project_location,
          email_data.email = project_user.rows[0].dataValues.user.email;

        global.eventEmitter.emit('project_approved', email_data);


        let user={};
        user.table='user',
        user.where={user_type:3};
        let user_fetch=await GenericRepository.fetchData(user);

        console.log(user_fetch);


        


        var sender=[];

        for(index in user_fetch.rows){
          sender.push(user_fetch.rows[index].dataValues.email);
        }
        console.log(sender);
        var email_data_project= {};
        

        email_data_project.projectname = project_user.rows[0].dataValues.name;
        email_data_project.location = project_user.rows[0].dataValues.project_location;

       
         email_data_project.email =[];
         email_data_project.email=sender;
         console.log(email_data_project);
        
           global.eventEmitter.emit('new_project_submit',  email_data_project);
       
        
        

        





        
      }


      res.send({ status: 201, data: project_status_table, message: 'status updated',purpose:'status updated' })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}

/* projectDetailsForclient api
method:GET
input:query[project_id],
output:data,
purpose:Project details for client
created by Sayanti Nath
*/

ProjectController.projectDetailsForclient = (req, res) => {

  (async () => {
  
  try {
  
  let project_details = {};
  
  project_details.table = 'projects',
  
  project_details.where = {};
  
  project_details.where.id = req.query.project_id;
  
  let project_details_table = await ConsultationhubRepository.fetchProjectDetails(project_details);

  for(index in project_details_table.rows){






  }
  
  // for(index in project_details_table.rows){
  
  // console.log(project_details_table.rows[index].dataValues.project_stages.rows[index].dataValues.id)
  
  // }
  
  let project_stages = [];
  
  for(let i = 0; i < project_details_table.rows[0].dataValues.project_stages.length; i++){
  
  if(project_details_table.rows[0].dataValues.project_stages.length>0){
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
  
  for(let j = 0; j < project_details_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++){
  
  if(project_details_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length>0){
  
  if(project_details_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor'){
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor ++;
  
  }
  
  else if(project_details_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client'){
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient ++;
  
  }
  
  else{
  
  project_details_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant ++;
  
  }
  
  }
  
  project_stages.push(project_details_table.rows[0].dataValues.project_stages[i]);
  
  if(i == project_details_table.rows[0].dataValues.project_stages.length - 1){
  
  //resolve(project_stages)
  
  }
  
  }
  
  }
  
  }


  var client_mail = "";
  var consultent_mail = "";
  let info={};
  info.table='project_consultants',
  info.where={project_id:parseInt(req.query.project_id)};
  let project_consultant_info=await GenericRepository.fetchData(info);
 
  console.log("client client_info"+JSON.stringify(project_consultant_info));

  if(project_consultant_info.count > 0 && project_consultant_info.rows[0].client_id != 0 && project_consultant_info.rows[0].client_id != null){
    let info={};
    info.table='user',
    info.where={id:project_consultant_info.rows[0].client_id};
    let client_info = await GenericRepository.fetchData(info);
    client_mail = client_info.rows[0].email
  }else if(project_details_table.rows[0].user_id != null){  
    let info={};
    info.table='user',
    info.where={id:project_details_table.rows[0].user_id};
    let client_info = await GenericRepository.fetchData(info);
    client_mail = client_info.rows[0].email
  }else{
    client_mail = "";
  }

   if(project_consultant_info.count > 0 ){
    let info={};
    info.table='user',
    info.where={id:project_consultant_info.rows[0].consultant_id};
    let consultant_info=await GenericRepository.fetchData(info);
    consultent_mail = consultant_info.rows[0].email
    // console.log(consultant_info.rows);

  }

  info={};
  info.table='validation',
  info.where={validation_meta:req.query.project_id,validation_type:'client_invite_consultent'};
  let info_fetch=await GenericRepository.fetchData(info);

  

  let info_invite={};
  info_invite.table='validation',
  info_invite.where={validation_meta:req.query.project_id,validation_type:'consultant_invite_client'}

  let info_invite_fetch=await GenericRepository.fetchData(info_invite);
 // console.log(info_invite_fetch.rows[0].dataValues.ref_email);


 if(info_fetch.rows.length>0 && info_invite_fetch.rows.length>0){


  res.send({ status: 201, message: 'data fetched',client_email:client_mail,consultent_email:consultent_mail, client_invite_consultant_mail:info_fetch.rows[0].dataValues.ref_email,consultant_mail:info_invite_fetch.rows[0].dataValues.ref_email,data: project_details_table })
  

 }

 else if(info_fetch.rows.length>0 ){

  res.send({ status: 201, message: 'data fetched',client_email:client_mail,consultent_email:consultent_mail, client_invite_consultant_mail:info_fetch.rows[0].dataValues.ref_email,consultant_mail:null,data: project_details_table })

 }

 else if(info_invite_fetch.rows.length>0){

  res.send({ status: 201, message: 'data fetched',client_email:client_mail,consultent_email:consultent_mail, client_invite_consultant_mail:null,consultant_mail:info_invite_fetch.rows[0].dataValues.ref_email,data: project_details_table })
  

 }

else{
  
  res.send({ status: 201, message: 'data fetched',client_email:client_mail,consultent_email:consultent_mail, client_invite_consultant_mail:null,consultant_mail:null,data: project_details_table })
}
  
  } catch (err) {
  
  console.trace(err)
  
  res.send({ status: 500, err: err });
  
  }
  
  })()
  
  }

/* project-details api
method:GET
input:body[project_id],
output:data,
purpose:Project details for a project
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-details:
 *  get:
 *   tags:
 *    - Project Stage & Project Task
 *   parameters:
 *    - in: query
 *      name: project_id
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

ProjectController.projectDetails = (req, res) => {
  (async () => {

    try {
      let project_details = {};
      project_details.table = 'projects',
        project_details.where = {};
      project_details.where.id = req.query.project_id;
     
      let project_details_table = await ConsultationhubRepository.fetchProjectDetailsDocs(project_details);

      let notes={};
      notes.table='notes';
      notes.where={project_id:req.query.project_id};
      let notes_fetch=await GenericRepository.fetchData(notes);

      

      let project_docs={};
      project_docs.where={id:req.query.project_id}
      let project_docs_table=await ConsultationhubRepository.fetchProjectDetailsDocs(project_docs);

      let project_stages = [];
     

      let project_satge={};
     
      project_satge.where = {};
       project_satge.where.id = req.query.project_id

    
    let project_satge_table = await ConsultationhubRepository.fetchProjectDetailsStatus(project_satge);

   

    //if(project_satge_table.rows.length>0){


    //let project_stages = [];
  //   for(let i = 0; i < project_satge_table.rows[0].dataValues.project_stages.length; i++){
  //     if(project_satge_table.rows[0].dataValues.project_stages.length>0){
  //       project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
  //       project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
  //       project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
  //       for(let j = 0; j < project_satge_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++){

  //         if(project_satge_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length>0){
  //           if(project_satge_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor'){
  //             project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor ++;
  //           }
  //           else if(project_satge_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client'){
  //             project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient ++;
  //           }
  //           else{
  //             project_satge_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant ++;
  //           }
  //       }

  //       project_stages.push(project_details_table.rows[0].dataValues.project_stages[i]);
  //       if(i == project_details_table.rows[0].dataValues.project_stages.length - 1){
  //           //resolve(project_stages)
  //       }
  //     }
  //     }
  //   }
  // }


    let first_array=[];
    let fourth_array=[];



if(project_satge_table.rows.length>0){
    first_array.push(project_satge_table.rows[0].dataValues.project_stages[0]);
    console.log(first_array[0]);
  
   fourth_array.push(project_satge_table.rows[0].dataValues.project_stages[1])
}
  

    let project_stage_status={};
    project_stage_status.where = {};
    project_stage_status.where.id = req.query.project_id;
    
  let project_stage_status_table = await ConsultationhubRepository.fetchProjectDetailsStatusEqual(project_stage_status);

// if(project_stage_status_table.rows.length>0){
//   for(let i = 0; i < project_stage_status_table.rows[0].dataValues.project_stages.length; i++){
//     if(project_stage_status_table.rows[0].dataValues.project_stages.length>0){
//       project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
//       project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
//       project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
//       for(let j = 0; j < project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++){

//         if(project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length>0){
//           if(project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor'){
//             project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor ++;
//           }
//           else if(project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client'){
//             project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient ++;
//           }
//           else{
//             project_stage_status_table.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant ++;
//           }
//       }

//       project_stages.push(project_details_table.rows[0].dataValues.project_stages[i]);
//       if(i == project_details_table.rows[0].dataValues.project_stages.length - 1){
//           //resolve(project_stages)
//       }
//     }
//     }
//   }
// }
  let second_array=[];

  second_array.push(project_stage_status_table);


  let third_array=[];
  if(first_array.length>0)
{  
  third_array.push(first_array[0]);
}
if(second_array.length>0)
{
  for(let u=0;u<second_array.length;u++){
  third_array.push(second_array[u]);
  }
}

if(fourth_array.length>0){
  third_array.push(fourth_array[0])
}





      res.send({ status: 201, message: 'data fetched', data:  third_array ,project_details:project_docs_table,draft:project_details_table,notes_fetch:notes_fetch})

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}



/* project-reject api
method:POST
input:body[project_id,status,description,title],
output:data,
purpose:Project status updated and entry the reject reason
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-reject:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
 *              type: integer
 *            status:
 *              type: integer
 *              description: 0 => Not submitted yet(draft), 1 => pending_admin_approval, 2 => accept_by_admin/ready_for_bid, 3 => rejected_by_admin,4=>closed by admin,5=>project_awarded,6=>awarded and sign
 *            title:
 *              type: string
 *            description:
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

ProjectController.projectClosed = (req, res) => {

  (async () => {

    try {
      let project_status = {};
      project_status.table = 'projects';
      project_status.where = {};
      project_status.where.id = req.body.project_id;
      project_status.data = {
        status: req.body.status
      }
      let project_status_table = await GenericRepository.updateData(project_status);

      let project_notes = {};
      project_notes.table = 'admin_project_notes',
        project_notes.data = {
          description: req.body.description,
          title: req.body.title,
          type:1,
          project_id: req.body.project_id
        }

      let admin_notes = await GenericRepository.createData(project_notes);

      let info = {};
      info.where = {};
      info.where.id = req.body.project_id;

      let project_user = await ConsultationhubRepository.fetchProjectDataAdmin(info);
      console.log(project_user.rows[0].dataValues.user.full_name)

      let name = project_user.rows[0].dataValues.user.full_name;
      name = name.split(' ').slice(0, -1).join(' ');



      let email_data = {};
      email_data.username = name;
      email_data.clientname = project_user.rows[0].dataValues.user.full_name;
      email_data.projectname = project_user.rows[0].dataValues.name;
      email_data.reason = admin_notes.dataValues.title,
      email_data.comment = admin_notes.dataValues.description;
      email_data.email = project_user.rows[0].dataValues.user.email;

      global.eventEmitter.emit('project_closed', email_data);


     



      res.send({ status: 201, message: 'project rejected',purpose:'project rejected',data:[] })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}


/* project-listing api
method:GET
input:,
output:data,
purpose:Project listing.searching,sorting,filtering
created by Sayanti Nath
*/

ProjectController.consultentProjectListing = (req, res) => {



  (async () => {

    try {


      if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);
      //let order=[['id','DESC']];
      let project_listing = {};
      //   or_data=[];
      let or_data = [];
      let and_data = [];
      let name_data = [];

      and_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `is_delete`=0 ')] }, consultant_id: req.user_id })

      if (req.query.search_text) {
        or_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `name` LIKE "%' + req.query.search_text + '%"')] } })
        or_data.push({ client_id: { $in: [sequelize.literal('SELECT id FROM `users` WHERE `full_name` LIKE "%' + req.query.search_text + '%"')] } })


      }

      if (req.query.search == 'active') {
        name_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `is_delete`=0 AND `is_active`=1')] }, consultant_id:  req.user_id })

      }

      if (req.query.search == 'reject') {
        name_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `is_delete`=0 AND `status`=3')] }, consultant_id:  req.user_id })

      }

      if (req.query.search == 'draft') {
        name_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `is_delete`=0 AND `status`=0')] }, consultant_id:  req.user_id })

      }


      let order = [[]];
      //console.log(req.query.order)
      if (req.query.order == 'createatasc') {
        order = [['createdAt', 'ASC']];

      }
      else if (req.query.order == 'createatdsc') {
        order = [['createdAt', 'DESC']];

      }

      else if (req.query.order == 'buildareadsc') {
        order = [['built_up_area', 'DESC']];

      }
      else if (req.query.order == 'buildareaasc') {
        order = [['built_up_area', 'ASC']];

      }




      else {
        order = [['id', 'DESC']];
      }



      

      let info = {};

      if (name_data.length > 0 && or_data.length > 0) {
        info.where = { $or: or_data, $and: name_data };
      }
      // info.user_where = user_where
      else if (name_data.length > 0) {

        info.where = name_data;
      }

      else if (or_data.length > 0) {
        // info.where= { $or:or_data,$and:name_data};
        info.where = { $or: or_data, $and: and_data };
      }
      else {
        info.where = and_data;
        //info.user_where = {};
      }

      let project_table = await ConsultationhubRepository.fetchProjectDataConsultant(info, limit, offset, order);

      for(index in project_table.rows){
        let sign={};
        sign.table='project_contracts',
        sign.where={project_id:project_table.rows[index].dataValues.id,cllient_acceptance:1,contractor_acceptance:1};

        let sign_update=await GenericRepository.fetchData(sign);

        if(sign_update.rows.length>0){
          project_table .rows[index].dataValues.sign_complete_for_project=1;
        }
        else{
          project_table.rows[index].dataValues.sign_complete_for_project=0;
        }


      

      //fetch_project .rows[index].dataValues.contractor_name=project_bids_data.rows[index].dataValues.id;

      //res.send({ status: 201, data: fetch_project,contractor:project_bids_data })


      }


     


      res.send({ status: 201, data: project_table, message: 'data fetched' ,purpose:'data fetched'})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()




}


/* project-details api
method:POST
input:body[project_id],
output:data,
purpose:Project details for a project
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-details:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
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

ProjectController.projectDetailsTaskStage = (req, res) => {




  (async () => {

    try {

      let project = {};
      project.where = {};
      project.where.id = req.body.project_id;
      let project_fetch = await ConsultationhubRepository.fetchProjectTaskStage(project);
      res.send({ status: 201, message: 'fetched', data: project_fetch })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}


/* add-template api
method:POST
input:body[name,stage_data,task_data],
output:data,
purpose:Project templated add
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/add-template:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            stage_data:
 *              type: array
 *              items:
 *                properties:
 *                    name:
 *                      type: string
 *                    description:
 *                      type: string
 *                    description_arabic:
 *                      type: string
 *                    is_default:
 *                      type: integer
 *                    sequence:
 *                      type: integer
 *                    maximum_allowed_percentage:
 *                      type: integer
 *                    max_allow_pullback:
 *                      type: integer
 *            task_data:
 *              type: array
 *              items:
 *                properties:
 *                    task_name:
 *                      type: string
 *                    task_name_arabic:
 *                      type: string
 *                    type_arabic:
 *                      type: string
 *                    Instruction_arabic:
 *                      type: string
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

ProjectController.projectTemplate = (req, res) => {


  (async () => {

    try {




      let project_template = {};
      project_template.table = 'project_templates',
        project_template.data = {
          name: req.body.name
        }
      var project_template_create = await GenericRepository.createData(project_template);

      
     
      var and_array=[];

      let stage_data = {};
      stage_data = req.body.stage_data;


      

      var project_stage_template = {};
      project_stage_template.table = 'project_stage_templates';

      var project_task_template = {};
      project_task_template.table = 'project_task_templates';

      
     
     
        stage_data.forEach(async function (item, index, arr) {
          console.log(item.task_data);

        project_stage_template.data = {
          project_template_id: project_template_create.dataValues.id,
          name:item.name,
          description: item.description,
          description_arabic: item.description_arabic,
          is_default: item.is_default,
          sequence:item.sequence,
          maximum_allowed_percentage: item.maximum_allowed_percentage,
          max_allow_pullback: item.max_allow_pullback
        }

        var project_stage_template_create = await GenericRepository.createData(project_stage_template);

      

       


      
        let  task_data=item.task_data;
       


        project_task_template.data =  task_data.map(function (el) {
          var o = Object.assign({}, el);
          console.log(o);
          o.template_stage_id = project_stage_template_create.id;
          o.name=o.task_name;
          o.name_arabic=o.task_name_arabic;
          o.Type_arabic=o.type_arabic;
          o.instruction_arabic=o.Instruction_arabic;
          return o;
          })

         let projaect_task_template_craete = await GenericRepository.bulkCreateData(project_task_template);
    })

    return res.send({ status: 200, message: 'data created',purpose:'data created',data:[] })



    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}

/* project-template api
method:GET
input:body,
output:data,
purpose:Project templated LISTING
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-template:
 *  get:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description:
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

ProjectController.projectTemplateList = (req, res) => {


  (async () => {

    try {
      let project_template = {};
      project_template.table = 'project_templates',
        project_template.where = {};
      project_template.where.is_delete = 0;
      project_template.where.is_active = 1;



      let project_template_fetch = await GenericRepository.fetchData(project_template);
      res.send({ status: 201, message: 'fetched', data: project_template_fetch })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}


/* project-template api
method:POST
input:body[project_id],
output:data,
purpose:Project templated details
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-template:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
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
ProjectController.projectTemplateFetch = (req, res) => {
  (async () => {

    try {
      let project_template = {};
      project_template.where = {};
      project_template.where.id = req.body.project_id;




      let project_template_fetch = await ConsultationhubRepository.fetchProjectTemplate(project_template);
      res.send({ status: 201, message: 'template fetched', data: project_template_fetch })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}


/* update-stage api
method:PUT
input:body[id,name,description, maximum_allowed_percentage,status,max_allow_pullback],
output:data,
purpose:update stage
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/update-stage:
 *  put:
 *   tags:
 *    - Project Stage & Project Task
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
 *            name:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            maximum_allowed_percentage:
 *              type: integer
 *            status:
 *              type: integer
 *              description: 0:-In Tendering,1:-on track,2:-Delay,3:-completed
 *            max_allow_pullback:
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


ProjectController.updateStage = (req, res) => {



  (async () => {

    try {

      let stage={};
      stage.table='project_stages',
      stage.where={id:req.body.id};
      var stage_data=await GenericRepository.fetchData(stage);
      console.log("hello");


      console.log(stage_data.rows[0].dataValues.project_id);

      var project_length={};
      project_length.table='project_stages',
      project_length.where={project_id:stage_data.rows[0].dataValues.project_id,is_default:0};
      var project_length_data=await GenericRepository.fetchData(project_length);
      console.log("length",project_length_data.rows.length);

      if(req.body.sequence>project_length_data.rows.length){
        console.log("here",project_length_data.rows.length);
  
  
        let project_stages_entry={};
        project_stages_entry.table='project_stages',
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
        project_stages_fet_data.table = 'project_stages';
  
        project_stages_fet_data.where = {is_default:0};
        project_stages_fet_data.where.project_id = stage_data.rows[0].dataValues.project_id;
        project_stages_fet_data.where.id={$ne:req.body.id};
        project_stages_fet_data.where.sequence={$lte:req.body.sequence}
        //project_stages_fet.where.is_default=
        //project_stages_fet.where.sequence={$gte:stage_data.rows[0].dataValues.sequence}
        let order=[['id','ASC']]
        //project_stages_fetch.where.sequence={$gte:req.body.sequence}
       var project_stage_data_less_data = await GenericRepository.fetchDataOrder( project_stages_fet_data);
  
       //console.log(project_stage_data_less.rows[1].dataValues.sequence);
  
       //let sequn_data=project_stage_data_less.rows[2].dataValues.sequence;
       let sequn_data=project_length_data.rows.length;
      console.log(sequn_data--)
      //console.log(sequn_data--)
  
       for(let i = 0; i < project_stage_data_less_data.rows.length; i++){
  
        let order_data={};
        order_data.table='project_stages';
        order_data.where={id:project_stage_data_less_data.rows[i].dataValues.id};
         c=sequn_data--;
         console.log(c);
         order_data.data={
          sequence:c
         }
         let order_update=await GenericRepository.updateData(order_data);
  
  
  
         //res.send({ status: 201,data:project_stages_entry_data,message:'updated' })
  
  
      }


      // res.send({
      //   status:200,
      //   message:'updated',
      //   data:project_stages_entry_data
      // })

    }
  



      // if(req.body.sequence>project_length_data.rows.length){
      //   var b=project_length_data.rows.length;
      //   var c=b+1;
      //   console.log(c)
      //   let project_stages_entry={};
      //   project_stages_entry.table='project_stages',
      //   project_stages_entry.data={
      //     project_id:stage_data.rows[0].dataValues.project_id,
      //     name: req.body.name,
      //     description: req.body.description,
      //     maximum_allowed_percentage: req.body.maximum_allowed_percentage,
      //     status: req.body.status,
      //     max_allow_pullback: req.body.max_allow_pullback,
      //     sequence:c

      //   }

      //   let  project_stages_entry_data=await GenericRepository.createData(project_stages_entry);
      // }

      else{
      let project_stages = {};
      project_stages.table = 'project_stages';
      //let project_stage_data = await GenericRepository.fetchData(project_stages);
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
          //project_stages.data.max_allow_pullback=1
          
        
      // console.log(project_stage_data);
      // if(project_stage_data.count <= 0)
      // {
      //     project_stages.data.sequence = 1;

      // }else{
      //   console.log(JSON.parse(JSON.stringify(project_stage_data)));
      //     project_stages.data.sequence = parseInt(project_stage_data.rows[0].sequence) + 1;
      // }

      if(stage_data.rows[0].dataValues.sequence>req.body.sequence){
      let project_stages_fetch = {};
      project_stages_fetch.table = 'project_stages';

      project_stages_fetch.where = {is_default:0};
      project_stages_fetch.where.project_id = stage_data.rows[0].dataValues.project_id;
      project_stages_fetch.where.sequence={$gte:req.body.sequence}
      project_stages_fetch.where.id={$ne:req.body.id}
     var project_stage_data = await GenericRepository.fetchData(project_stages_fetch);
     console.log("id",project_stage_data.rows[0].dataValues.id);



     




      //let project_stages_table = await GenericRepository.updateData(project_stages);
      let sequncn=req.body.sequence;
      console.log(sequncn)
      // if(req.body.sequence < stage_data.rows[0].dataValues.sequence && req.body.sequence ==stage_data.rows[0].dataValues.sequence)
      // {

       console.log(sequncn++)
      //  }
      

     //let project_stage_data = await GenericRepository.fetchData(project_stages);

     if(req.body.id > project_stage_data.rows[0].dataValues.id){

     for(let i =0; i < project_stage_data.rows.length; i++){
       console.log(project_stage_data.rows[i].dataValues.id)
      

      let order={};
       order.table='project_stages';
       order.where={};
       order.where.id = project_stage_data.rows[i].dataValues.id;
      // order.where={id:project_stage_data.rows[i].dataValues.id};
     // console.log(sequncn++)
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
        //console.log(project_stage_data.rows[i].dataValues.id)
       
 
       let order={};
        order.table='project_stages';
        order.where={};
        order.where.id = project_stage_data.rows[i].dataValues.id;
       // order.where={id:project_stage_data.rows[i].dataValues.id};
      // console.log(sequncn++)
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
      project_stages_fet.table = 'project_stages';

      project_stages_fet.where = {is_default:0};
      project_stages_fet.where.project_id = stage_data.rows[0].dataValues.project_id;
      project_stages_fet.where.id={$ne:req.body.id};
      project_stages_fet.where.sequence={$lte:req.body.sequence}
      //project_stages_fet.where.is_default=0;
      //project_stages_fet.where.sequence={$gte:stage_data.rows[0].dataValues.sequence}
      let order=[['id','ASC']]
      //project_stages_fetch.where.sequence={$gte:req.body.sequence}
     var project_stage_data_less = await GenericRepository.fetchDataOrder( project_stages_fet);

     //console.log(project_stage_data_less.rows[1].dataValues.sequence);

     //let sequn_data=project_stage_data_less.rows[2].dataValues.sequence;
     let sequn_data=req.body.sequence
    console.log(sequn_data--)

     for(let i = 0; i < project_stage_data_less.rows.length; i++){

      let order_data={};
      order_data.table='project_stages';
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

       








    

    

    // else {

    //   project_stages.data.max_allow_pullback=req.body.max_allow_pullback;
    // }
    project_stages.where={id:req.body.id};
    
     var project_stages_table = await GenericRepository.updateData(project_stages);

     //res.send({ status: 201,data:project_stages_table,message:'updated' })
  
      }
      res.send({ status: 201,data:project_stages_table,message:'updated' })


      //res.send({ status: 201,data:project_stages_table,message:'updated' })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}






/* project-tender-data api
method:GET
input:body[project_id],
output:data,
purpose:fetch
created by Sayanti Nath
*/
ProjectController.contractotrProject = (req, res) => {



  (async () => {

    try {
      //var b=req.query.user_id
      let contractor_project = {};
      contractor_project.where = {};
      contractor_project.where.id = req.query.project_id;
      // contractor_project.where.project_id={$in:[sequelize.literal('SELECT id FROM `projects` WHERE  `is_delete`=0')]}
      let contractor_data = await ConsultationhubRepository.fetchProjectContractor(contractor_project);

      for(index in contractor_data.rows){

        let project_bids={};
     
        project_bids.where={project_id:req.query.project_id,status:1}
  
        var project_bids_data=await ConsultationhubRepository.fetchProjectDataOther(project_bids);
 
        contractor_data.rows[index].dataValues.sign_id=project_bids_data;
        
      }



      let info = {};
      info.table = 'project_bids',
        info.where = {};
      info.where.project_id = req.query.project_id;
      info.where.is_draft = 0;
      let bits = await GenericRepository.fetchData(info);
      console.log(bits.rows.length);
      

      let site = {};
      site.table = 'site_setting',
        site.where = {};
      let site_fetch = await GenericRepository.fetchData(site);






      res.send({ status: 201, data: contractor_data, message: 'data', total_bid_count: site_fetch.rows[0].dataValues.max_tender_submission_limit, bid_count: bits.rows.length });


    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}


/* project-contractor api
method:GET
input:body[project_id],
output:data,
purpose:fetch
created by Sayanti Nath
*/

ProjectController.contractorDetails = (req, res) => {

  (async () => {

    try {
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);

      let order = [[]];
      if (req.query.order == 'pricehigh') {
        order = [['price', 'DESC']]

      }

      else if (req.query.order == 'pricelow') {
        order = [['price', 'ASC']]

      }
      else if (req.query.order == 'timehigh') {
        order = [['days', 'DESC']]

      }

      else if (req.query.order == 'timelow') {
        order = [['days', 'ASC']]

      }



      else {


        order = [['id', 'DESC']]
      }

      let info = {};
      info.where = {};
      info.where.project_id = req.query.project_id;
      let fetch = await ConsultationhubRepository.fetchContractor(info, limit, offset, order);
      console.log(fetch);
      for (index in fetch.rows) {
        //  console.log(fetch.rows[index])
        //  console.log(fetch.rows[index].dataValues.id)

        let info = {};
        info.table = 'contractor_manpowers',
          info.where = {};
        info.where.contractor_id = fetch.rows[index].dataValues.contractor_id;
        info.where.employee_type = 2;
        let fetch_data = await GenericRepository.fetchData(info);
        fetch.rows[index].dataValues.count = fetch_data.rows.length;


        let project_version={};
        project_version.table='project_contracts',
        project_version.where={contractor_id:fetch.rows[index].dataValues.contractor_id,project_id:req.query.project_id}
        let order_new=[['version_no','DESC']];
  
        let project_vrsion_fetch=await GenericRepository.fetchDataOrder(project_version,order_new);

        if(project_vrsion_fetch.rows.length>0){

        fetch.rows[index].dataValues.project_version=project_vrsion_fetch.rows[0].dataValues
        }
        else{
          fetch.rows[index].dataValues.project_version=null
        }


        let info_photo={};
            
        info_photo.table='resources',
        info_photo.where={user_id:fetch.rows[index].dataValues.contractor_id,type:'contractor_profile_photo'}
        let fetch_photo=await GenericRepository.fetchData(info_photo);

        if(fetch_photo.rows.length>0){
          fetch.rows[index].dataValues.profile_photo_contractor=fetch_photo

        }

        else{
          fetch.rows[index].dataValues.profile_photo_contractor=null
        }


      }

      
        res.send({ status: 200, data: fetch,message:'contractor details',purpose:'contractor details'})
      

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}

/* project-list api
method:GET
input:body,
output:data,
purpose:fetch
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-list:
 *  get:
 *   tags:
 *    - Project Stage & Project Task
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
ProjectController.listProject = (req, res) => {



  (async () => {

    try {
      let project = {};
      project.table = 'projects',
        project.where = {};
      let project_fetch = await GenericRepository.fetchData(project);
      res.send({ status: 201, data: project_fetch,message:'project lists',purpose:'project lists' });
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}


/* stage  api
method:GET
input:,
output:data,
purpose:fetch
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/stage:
 *  get:
 *   tags:
 *    - Project Stage & Project Task
 *   parameters:
 *    - in: query
 *      name: limit
 *      required: ture
 *      schema:
 *       type: integer
 *    - in: query
 *      name: page
 *      required: ture
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


ProjectController.stageListing = (req, res) => {

  (async () => {

    try {

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);
      let order = [['id', 'DESC']]

      let stage = {};
      stage.table = 'project_stages',
        stage.where = {};
      let stage_fetch = await GenericRepository.fetchDatalimit(stage, limit, offset, order);
      res.send({ status: 200, data: stage_fetch, message: 'fetch' ,purpose:'fetch'})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}


/* stage  api
method:POST
input:body[project_id],
output:data,
purpose:fetch
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/stage:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
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

ProjectController.fetchProjectTask = (req, res) => {


  (async () => {

    try {
      let info = {};
      info.where = {};
      info.where.id = req.body.id;
      let fetch_table = await ConsultationhubRepository.fetchStage(info);
      res.send({ status: 201, data: fetch_table,message:'project task details',purpose:'project task details'});
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/* projectDetailsClient  api
method:GET
input:body[project_id],
output:data,
purpose:fetch
created by Sayanti Nath
*/

ProjectController.projectDetailsClient = (req, res) => {

  (async () => {

    try {

      let project = {};
      project.where = {};
      project.where.id = req.query.project_id;
      let project_fetch = await ConsultationhubRepository.fetchProjectTaskStage(project);
     

      res.send({ status: 201, message: 'fetched', data: project_fetch })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/* import-stage  api
method:POST
input:body[project_id],
output:data,
purpose:to import the template
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/import-stage:
 *  post:
 *   tags:
 *    - Project Stage & Project Task
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            project_id:
 *              type: integer
 *            template_id:
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
ProjectController.importStage = (req, res) => {


  (async () => {

    try {



      let project_delete = {};
      project_delete.table = 'project_stages',
        project_delete.where = {};
      project_delete.where.project_id = req.body.project_id;
      //project_delete.where.is_default=0;
      //let project_delete_data=await GenericRepository.deleteData(project_delete);


      let project_fetch = await GenericRepository.fetchData(project_delete);
      console.log(project_fetch)

      let project_delete_data = await GenericRepository.deleteData(project_delete);

     


      for (index in project_fetch.rows) {
        let project_task_delete = {};
        project_task_delete.table = 'project_tasks',
          project_task_delete.where = {};
        project_task_delete.where.id = project_fetch.rows[index].dataValues.id;
        let project_delete_task_data = await GenericRepository.deleteData(project_task_delete);

      }
      // for(let i=0;i<project_delete_data.length)






      let project_template = {};
      project_template.where = {};
      project_template.where.id = req.body.template_id;




      let project_template_fetch = await ConsultationhubRepository.fetchProjectTemplate(project_template);

      //console.log(project_template_fetch);
    

      for (project_template_fetchs of project_template_fetch) {
        console.log(project_template_fetchs);
        for (project_stage_template of project_template_fetchs.project_stage_templates) {



         



          var data = project_template_fetchs.project_stage_templates[0].id;
          //console.log("hg",data)
          var d = project_stage_template.dataValues.id;
          console.log(d)
          console.log(project_stage_template.project_task_templates.id)



          let project = {};
          project.table = 'project_stages',
            
            project.data = {
              project_id: req.body.project_id,
              name: project_stage_template.dataValues.name,
              description: project_stage_template.dataValues.description,
              description_arabic: project_stage_template.dataValues.description_arabic,
              sequence: project_stage_template.dataValues.sequence,
              is_default: project_stage_template.dataValues.is_default, 
              maximum_allowed_percentage: project_stage_template.dataValues.maximum_allowed_percentage,
              max_allow_pullback: project_stage_template.dataValues.max_allow_pullback
            }

          var update_data = await GenericRepository.createData(project);



          for (project_task_template of project_stage_template.project_task_templates) {

            let project_task = {};
            project_task.table = 'project_tasks',
             
              project_task.data = {
                stage_id: update_data.dataValues.id,
                name: project_task_template.name,
                name_arabic: project_task_template.name_arabic,
                status: project_task_template.status,
                type: project_task_template.Type,
                type_arabic:project_task_template.Type_arabic,
                instruction: project_task_template.Instruction,
                instruction_arabic: project_task_template.instruction_arabic,
                creator: project_task_template.creator,
                assignee: project_task_template.assignee
              }

            var task_update = await GenericRepository.createData(project_task);

          }
        }
      }

      res.send({ status: 201, message: 'template imported',purpose:'template imported', data: project_template_fetch })





    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}


/* createProjectBids  api
method:POST
input:body[project_id,contractor_id,days, price, is_draft, project_estimates, ],
output:data,
purpose:to import the template
created by Sayanti Nath
*/

ProjectController.createProjectBids = (req, res) => {

  (async () => {

    try {
      let project_bids = {};
      project_bids.table = 'project_bids';
      project_bids.data = {
        project_id: req.body.project_id,
        contractor_id: req.body.contractor_id,
        days: req.body.days,
        price: req.body.price,
        Structure_price:req.body.Structure_price,
        additional_price:req.body.additional_price,
        is_draft: req.body.is_draft,
        
      }

      let projectBidData = await GenericRepository.createData(project_bids)
      let project_estimates = {};
      var project_estimates_val = {};
      project_estimates_val = JSON.parse(req.body.project_estimates);
      project_estimates.data = project_estimates_val.map(function (ele) {
        var o = Object.assign({}, ele);
        o.bid_id = projectBidData.id;
        return o;
      })
      project_estimates.table = 'project_stage_estimates';

      let project_estimates_data = await GenericRepository.bulkCreateData(project_estimates);

      var data = { "projectBidData": projectBidData, "project_estimates_data": project_estimates_data };
      let info = {};
      info.table = 'projects',
        info.where = {};
      info.where.id = req.body.project_id;
      let fetch = await GenericRepository.fetchData(info)

      info.data = {
        project_total_bids: parseInt(fetch.rows[0].dataValues.project_total_bids) + 1
      }

      let update = await GenericRepository.updateData(info);

     return res.send({ status: 200, data: data, message: 'Project bids fetch successfully', purpose: "Project bids Scope fetching" });

      

     

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error"});


    }


  })()

}


/* project-bids  api
method:PUT
input:body[project_id,contractor_id,days,price,is_draft,stage_estimates],
output:data,
purpose:to update project bids
created by Sayanti Nath
*/

ProjectController.updateBids = (req, res) => {


  (async () => {

    try {

      let project_bids = {};
      project_bids.table = 'project_bids';
      project_bids.data = {


        days: req.body.days,
        price: req.body.price,
        Structure_price:req.body.Structure_price,
        additional_price:req.body.additional_price,
        is_draft: req.body.is_draft,
        
      }


      project_bids.where = {};
      project_bids.where.project_id = req.body.project_id;
      project_bids.where.contractor_id = req.body.contractor_id

      let projectBidData = await GenericRepository.updateData(project_bids);
      console.log(typeof (req.body))
      console.log(JSON.parse(req.body.stage_estimates).length)
      var b = JSON.parse(req.body.stage_estimates);
      console.log(b);


      //for(let i=0;i<JSON.parse(req.body.stage_estimates.length; i++)
      for (let i = 0; i < b.length; i++) {

        let project_estimates = {};
        project_estimates.table = 'project_stage_estimates',
          project_estimates.where = {};
        project_estimates.where.id = b[i].id;
        project_estimates.data = {
          price_amount: b[i].price_amount,
          price_percentage: b[i].price_percentage,
          days: b[i].days,
          actual_pullback:b[i].actual_pullback,
        }


        let project_estimates_data = await GenericRepository.updateData(project_estimates);

      }

      let information = {};
      //information.table='project_bids',
      information.where = {
        project_id: req.body.project_id,
        contractor_id: req.body.contractor_id

      }

      if(req.body.is_draft==0){

      var contractor_details = await ConsultationhubRepository.allortMent(information);

     // console.log(contractor_details.rows[0].dataValues.project.user.full_name)


      let name = contractor_details.rows[0].dataValues.project.user.full_name;
      name = name.split(' ').slice(0, -1).join(' ');
      console.log(name)


      let email_data = {};
      email_data.username = name;
      
      email_data.link='https://ebinaa.com/login/client';
      // email_data.days = projectBidData.dataValues.days;
      // email_data.price = projectBidData.dataValues.price;
      email_data.email = contractor_details.rows[0].dataValues.project.user.email;

      console.log(email_data);


      global.eventEmitter.emit('project_tender', email_data);

      let notifications = {};
      notifications.table = 'notifications',
        notifications.data = {
          notification_from: req.user_id,
          notification_to: contractor_details.rows[0].dataValues.project.user.id,
          project_id: req.body.project_id,
          title: "project tender",
          notification_type: "email"
        }

      let notifications_entry = await GenericRepository.createData(notifications);
      }





      return res.send({ status: 201, message: 'updated',purpose:'bid up'})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

ProjectController.downloadProjectDrawingZip_example = function (req, res) {
  (async () => {
    try {
      var zip = new AdmZip();

      // add local file
      // zip.addLocalFile("/home/me/some_picture.png");
      zip.addLocalFile("/home/arijit/Downloads/fish_water_swimming_135611_1366x768.jpg");
      zip.addLocalFile("/home/arijit/Downloads/EBinaa-Logo-Colored.png");

      // or write everything to disk
      zip.writeZip(/*target file name*/"/home/arijit/Documents/files.zip");
      return res.send({ status: 200, message: 'ZIP is downloaded' });
    }
    catch (err) {
      console.log(1962, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/* project-bids  api
method:GET
input:query[id],
output:data,
purpose:to download project drawings zip
created by Arijit Saha
*/

ProjectController.downloadProjectDrawingZip = function (req, res) {
  (async () => {
    try {
      var zip = new AdmZip();
      let get_zip_file_name_for_project_drawings = await commonFunnction.getRandomString(5);
      let create_drawning_zip = await new Promise(function (resolve, reject) {
        let id = parseInt(req.query.id);
        let get_project_doc_data = {};
        get_project_doc_data.table = 'project_docs';
        get_project_doc_data.where = {};
        get_project_doc_data.where.project_id = id;
        get_project_doc_data.where.type = 'drawing';
        get_project_doc_data.where.is_active = 1;
        get_project_doc_data.where.is_delete = 0;
        GenericRepository.fetchData(get_project_doc_data).then(get_project_doc_result => {
          if (get_project_doc_result.rows.length > 0) {
            // Project drawings found //
            for (let i = 0; i < get_project_doc_result.rows.length; i++) {

              // zip.addLocalFile(process.env.WEBURL+"/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
              // zip.addLocalFile("/home/devuipl/public_html/uploads/"+get_project_doc_result.rows[i].dataValues.resource_url);
              zip.addLocalFile("/var/www/html/ebinaa-node/uploads/" + get_project_doc_result.rows[i].dataValues.resource_url);
              if (i == get_project_doc_result.rows.length - 1) {
                console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')

                // zip.writeZip(/*target file name*/process.env.WEBURL+"/uploads/project_zips/"+get_zip_file_name_for_project_drawings+".zip");
                zip.writeZip(/*target file name*/"/var/www/html/ebinaa-node/uploads/project_zips/" + get_zip_file_name_for_project_drawings + ".zip");
                let project_docs_create_data = {};
                project_docs_create_data.table = 'project_docs';
                project_docs_create_data.data = {};
                project_docs_create_data.data.project_id = id;
                project_docs_create_data.data.type = 'drawing_zip';
                project_docs_create_data.data.resource_type = 'zip';
                project_docs_create_data.data.resource_url = 'project_zips/' + get_zip_file_name_for_project_drawings + '.zip';
                project_docs_create_data.data.is_active = 1;
                project_docs_create_data.data.is_delete = 0;
                GenericRepository.createData(project_docs_create_data).then(project_docs_create_result => {
                  resolve()
                }).catch(project_docs_create_err => {
                  console.log(2016, project_docs_create_err);
                  return res.send({ status: 500, message: 'Something went wrong' });
                })

              }
            }

          }
          else {
            // No project drawings found //
            resolve()
          }
        }).catch(get_project_doc_err => {
          console.log(1995, get_project_doc_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })

      })
      let get_zip_file_name_for_project_scopes = await commonFunnction.getRandomString(5);


      // //=======================================================================//
      // var zip = new AdmZip();
      // // add local file
      // // zip.addLocalFile("/home/me/some_picture.png");
      // zip.addLocalFile("/home/arijit/Downloads/fish_water_swimming_135611_1366x768.jpg");
      // zip.addLocalFile("/home/arijit/Downloads/EBinaa-Logo-Colored.png");

      // // or write everything to disk
      // zip.writeZip(/*target file name*/"/home/arijit/Documents/files.zip");
      // //=======================================================================//

      return res.send({ status: 200, message: 'ZIP is downloaded' });
    }
    catch (err) {
      console.log(1962, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

// ProjectController.downloadProjectScopePdf = function(req, res){
//   (async()=>{
//     try{

//       // var html = fs.readFileSync('./test/businesscard.html', 'utf8');
//       var html = '<html>Test</html>';
//       var options = { format: 'Letter' };

//       pdf.create(html, options).toFile('./businesscard.pdf', function(err, res) {
//         if (err) return console.log(err);
//         console.log(res); // { filename: '/app/businesscard.pdf' }
//       });
//     }
//     catch(err){
//       console.log(2065, err);
//       return res.send({status:500, message:'Something went wrong'});
//     }
//   })()
// }


/* project-listing  api
method:GET
input:query[page,limit],
output:data,
purpose:fetch projects
created by Sayanti Nath
*/
ProjectController.contractorProjectListing = (req, res) => {
  (async () => {

    try {


      if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

      let start_data = moment().format('YYYY-MM-DD');

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);

      let and_data = [];
      let or_data = [];
      let name_data = [];


      var array=[];

      let bid_count={};
        bid_count.table='project_bids',
        bid_count.where={contractor_id:req.user_id,is_draft:0};
      var bid_fetch=await GenericRepository.fetchData(bid_count);
        console.log(bid_fetch)
        for(index in bid_fetch.rows){
          array.push(bid_fetch.rows[index].dataValues.project_id);
        }
        //console.log(array);  




      and_data.push({ bid_closed_date: { $gte: start_data }, status: { $in: [2, 5] },id:{$notIn:array} })


      if (req.query.search_text) {

        or_data.push({ name: { $like: '%' + req.query.search_text + '%' } });
        or_data.push({ user_id: { $in: [sequelize.literal('SELECT id FROM `users` WHERE `full_name` LIKE "%' + req.query.search_text + '%"')] } })

      }

      if (req.query.search == "active") {
       
        name_data.push({ is_active: 1,bid_closed_date: { $gte: start_data }, status: { $in: [2, 5] },id:{$notIn:array}  })
        
      }
      if (req.query.search == "reject") {
       
        name_data.push({ bid_closed_date: { $gte: start_data }, status: { $in: [2, 5] }, id: { $in: [sequelize.literal('SELECT id FROM `project_bids` WHERE `status`=2')] }})
        
      }





      // let info={};
      // info.where={};
      // //info.where.bid_closed_date={$gte:start_data};
      // info.where.project_total_bids={$lte:6};
      // console.log("hello")

      let info = {};
      //info.table='projects';
      if (name_data.length > 0 && or_data.length > 0) {
        info.where = { $or: or_data, $and: name_data };
      }
      // info.user_where = user_where
      else if (name_data.length > 0) {

        info.where = name_data;
      }

      else if (or_data.length > 0) {
        // info.where= { $or:or_data,$and:name_data};
        info.where = { $or: or_data, $and: and_data };
      }
      else {
        info.where = and_data;
        //info.user_where = {};
      }

      let order = [[]];
      console.log(req.query.order)
      if (req.query.order == 'createatasc') {
        order = [['createdAt', 'ASC']];

      }
      else if (req.query.order == 'createatdsc') {
        order = [['createdAt', 'DESC']];

      }

      else if (req.query.order == 'buildareadsc') {
        order = [['built_up_area', 'DESC']];

      }
      else if (req.query.order == 'buildareaasc') {
        order = [['built_up_area', 'ASC']];

      }




      else {
        order = [['id', 'DESC']];
      }
      //let contract_id=req.user_id;

      let fetch_data = await ConsultationhubRepository.contractorProjectListing(info, limit, offset, order);

      let user={};
      user.table='user',
      user.where={id:req.user_id};
      user.attributes =['status'];

      user_table=await GenericRepository.fetchDataWithAttributes(user);

      let bid={};
      bid.table='project_bids',
      bid.where={contractor_id:req.user_id,is_draft:1};
      bid_table=await GenericRepository.fetchData(bid);

      var bid_flag = 0;
      var bid_projects = [];

      if(bid_table.rows){

      bid_table.rows.forEach(async(item,index)=>{ bid_projects.push(item.project_id); });

      let bid_project_query = {};
      bid_project_query.table = 'projects',
      bid_project_query.where = {};
      bid_project_query.where.id = { $in: bid_projects }
      var bid_project_data = await GenericRepository.fetchData(bid_project_query);
        if(bid_project_data.rows){
          bid_project_data.rows.forEach(async(item1,index1)=>{ 

        let today_date = moment();
        let end_date = moment(item1.bid_closed_date);
        let status = parseInt(item1.status);

        // if(status == 2){
        //    bid_flag = 1;
        // }

        if(today_date.diff(end_date, 'day')  <= 0){
                 
           bid_flag = 1;

        }
        console.log(today_date.diff(end_date, 'day'));
        console.log("//////////////////////////");
        // if( item1.status == 2 )
        // {
        //   bid_flag = 1;
        // }

           });

        }
      }

      // for(index in fetch_data.rows){
      //   i=index;
      //   let bid_count={};
      //   bid_count.table='project_bids',
      //   bid_count.where={project_id:fetch_data.rows[index].dataValues.id,contractor_id:req.user_id};
      //   let bid_fetch=await GenericRepository.fetchData(bid_count);
      //   console.log(bid_fetch.rows)
      //   if(bid_fetch.rows.length>0){

      //     //delete fetch_data.rows[index];


      //    // fetch_data.rows.splice(index,1);
      //     fetch_data.rows.splice(index,1);
         
         
        
         


          

      //   }
       

        
      //}
      
      
      

      




      res.send({ status: 200,user_status: user_table, bid_count:bid_flag,data: fetch_data, message: 'Project  fetch successfully' });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}



/* project-tender api
method:GET
input:query[page,limit,project_id],
output:data,
purpose:fetch projects and contractor details
created by Sayanti Nath
*/


ProjectController.contractorTenderData = (req, res) => {


  (async () => {

    try {

      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);

      let info = {};
     
      info.where = {};
      info.where.project_id = req.query.project_id;
      info.where.is_draft=0;
      //info.where.project_id={$in:[sequelize.literal('SELECT id FROM `projects` WHERE `status`=5')]}

      let order = [['id', 'DESC']]

      let project_data = await ConsultationhubRepository.tenderData(info, limit, offset, order);

      res.send({ status: 201, message: 'fetched',purpose:'fetch contractor tender data', data: project_data })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}

/**projectSignDetails API
method:POST
input: headers[x-access-token], params['id']
output:data,
purpose:To get details of project after project sign.
*/
/**
     * To get details of project after project sign with respect to `id` and `x-access-token`
     * @param {Number} `id` 
     * @param {String} `x-access-token` 
     * @return {data} `data`
*/
ProjectController.projectSignDetails = function (req, res) {
  (async () => {
    try {
      let get_project_details = await new Promise(function (resolve, reject) {
        let get_project_details;
        let project_where = {};
        project_where.id = parseInt(req.query.id);
        // project_where.status = 5;
        project_where.is_active = 1;
        project_where.is_delete = 0;
        ProjectRepository.fetchProjectWithBidDetails(project_where).then(project_result => {
          if (project_result.rows.length > 0) {
            get_project_details = project_result;
            // resolve(get_project_details);
            for (let i = 0; i < get_project_details.rows[0].dataValues.project_bids.length; i++) {
              get_project_details.rows[0].dataValues.project_bids[i].dataValues.updatedAt = moment(get_project_details.rows[0].dataValues.project_bids[i].dataValues.updatedAt).utc().format('YYYY-MM-DD HH:mm:ss');
              resolve(get_project_details);
            }

          }
          else {
            return res.send({ status: 404, message: 'No details found.' })
          }
        })
      })
      // setting project_start_date & project_finish_date in below code //
      get_project_details.rows[0].dataValues.project_sign_date = get_project_details.rows[0].dataValues.project_bids[0].dataValues.updatedAt;
      let finish_date = moment(get_project_details.rows[0].dataValues.project_bids[0].dataValues.updatedAt).add(parseInt(get_project_details.rows[0].dataValues.project_bids[0].dataValues.days), 'days');
      get_project_details.rows[0].dataValues.project_finish_date = moment(finish_date).utc().format('YYYY-MM-DD HH:mm:ss');
      return res.send({ status: 200, message: 'Project details', purpose: 'To get details of project after project sign', data: get_project_details });
    }
    catch (err) {
      console.log(2412, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**downloadProgramOfWorksPdf API
method:GET
input:body[id], headers[x-access-token]
purpose:To download project work pdf.
created by:Arijit Saha
*/
/**
     * To download project work pdf with respect to `id` and `x-access-token`
     * @param {Number} `id` 
     * @param {String} `x-access-token` 
     * @return {data} result
*/

ProjectController.downloadProgramOfWorksPdf = function (req, res) {
  (async () => {
    try {
      let project_details = await new Promise(function (resolve, reject) {
        let project_details;
        let project_data_where = {};
        // let project_bids_where = {contractor_id:req.user_id};
        project_data_where.id = parseInt(req.query.id);
        ProjectRepository.fetchProject(project_data_where).then(project_result => {
          project_details = project_result;
          resolve(project_details);
        }).catch(project_err => {
          console.log(805, project_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })

      let project_stages = await new Promise(function (resolve, reject) {
        let project_stages = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor++;
            }
            else if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient++;
            }
            else {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant++;
            }
          }

          project_stages.push(project_details.rows[0].dataValues.project_stages[i]);
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            resolve(project_stages)
          }
        }

      })
      project_details.rows[0].dataValues.project_stages = project_stages;

      // return res.send({status:200, message:'Project Details', data:project_details, purpose:'To get details of project'});
      let consultant_stage_task_details = await new Promise(function (resolve, reject) {
        let consultant_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          let consultant_stage_task_details_object = {};
          // contractor_stage_task_details.push(contractor_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Consultant') {
              consultant_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              consultant_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              consultant_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              consultant_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              consultant_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              consultant_stage_task_details.push(consultant_stage_task_details_object);

            }
            // else{
            //   contractor_stage_task_details.push(contractor_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            consultant_stage_task_details = [...new Set(consultant_stage_task_details)];

            resolve(consultant_stage_task_details)
          }
        }
      })
      // return res.send({status:200, message:'consultant_stage_task_details', data:consultant_stage_task_details})
      let client_stage_task_details = await new Promise(function (resolve, reject) {
        let client_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          let client_stage_task_details_object = {};
          // client_stage_task_details.push(client_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
              client_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              client_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              client_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              client_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              client_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              client_stage_task_details.push(client_stage_task_details_object);

            }
            // else{
            //   client_stage_task_details.push(client_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            client_stage_task_details = [...new Set(client_stage_task_details)];

            resolve(client_stage_task_details)
          }
        }
      })
      // return res.send({status:200, message:'client_stage_task_details', data:client_stage_task_details})

      let contractor_stage_task_details = await new Promise(function (resolve, reject) {
        let contractor_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          let contractor_stage_task_details_object = {};
          // contractor_stage_task_details.push(contractor_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
              contractor_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              contractor_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              contractor_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              contractor_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              contractor_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              contractor_stage_task_details.push(contractor_stage_task_details_object);

            }
            // else{
            //   contractor_stage_task_details.push(contractor_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            contractor_stage_task_details = [...new Set(contractor_stage_task_details)];

            resolve(contractor_stage_task_details)
          }
        }
      })
      // return res.send({status:200, message:'contractor_stage_task_details', data:contractor_stage_task_details})
      var  get_list_of_project_stages_with_task = await new Promise(function(resolve, reject){
        var  get_list_of_project_stages_with_task = [];
        if(project_details.rows[0].dataValues.project_stages.length > 0){
          for(let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++){
            if(project_details.rows[0].dataValues.project_stages[i].project_tasks.length > 0){
              get_list_of_project_stages_with_task.push(project_details.rows[0].dataValues.project_stages[i]);
              if(i == project_details.rows[0].dataValues.project_stages.length - 1){
                resolve(get_list_of_project_stages_with_task);
              }
            }
            else{
              if(i == project_details.rows[0].dataValues.project_stages.length - 1){
                resolve(get_list_of_project_stages_with_task);
              }
            }

          }

        }
        else{
          resolve(get_list_of_project_stages_with_task)
        }
      })
      var  project_stage_and_task_details = await new Promise(function(resolve, reject){
        var  project_stage_and_task_details = [];
        if(get_list_of_project_stages_with_task.length > 0){
          for(let i = 0; i < get_list_of_project_stages_with_task.length; i++){
            let stage_obj = {};
            stage_obj.id = get_list_of_project_stages_with_task[i].id;
            stage_obj.name = get_list_of_project_stages_with_task[i].name;
            stage_obj.description = get_list_of_project_stages_with_task[i].description;
            stage_obj.client_assigned = [];
            stage_obj.consultant_assigned = [];
            stage_obj.contractor_assigned = [];
            for(let j = 0; j < get_list_of_project_stages_with_task[i].project_tasks.length; j++){
              if(get_list_of_project_stages_with_task[i].project_tasks[j].assignee == 'Client'){
                stage_obj.client_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
              }
              else if(get_list_of_project_stages_with_task[i].project_tasks[j].assignee == 'Consultant'){
                stage_obj.consultant_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
              }
              else{
                stage_obj.contractor_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
  
              }
              project_stage_and_task_details.push(stage_obj);
              if(i == get_list_of_project_stages_with_task.length - 1){
                resolve(project_stage_and_task_details);
              }
  
            }
  
            // project_stage_and_task_details.push(stage_obj);
            // if(i == get_list_of_project_stages_with_task.length - 1){
            //   resolve(project_stage_and_task_details);
            // }
          }
        }
        else{
          resolve(project_stage_and_task_details);
        }


      })
      project_stage_and_task_details = [...new Set(project_stage_and_task_details)]



      let project_gnatt_chart={};
      project_gnatt_chart.table='project_docs',
      project_gnatt_chart.where={project_id:req.query.id,type:'gantt_chart',resource_description:parseInt(req.query.contractor_id)}
      let project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);

      let html = await new Promise(function (resolve, reject) {
        let html = `<title>Stage Task Details</title>
        <style>
          /* page setup */
          @page{
            size:A4 portrait;
            margin:1.5cm;
          }
          /*@page :first{
            margin:0cm;
          }*/
          /* common */
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#1a1a1a;
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            position:relative;
            display:block;
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          .page.full-height-page{
            min-height:25cm; /* 29.7cm - 3cm */
            background:url(images/Full-Page-Background.svg) center bottom repeat-x;
            background-size:1200px auto;
            background-color:#fff;
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:25px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:120px;
          }
          /* page-heading */
          .page-heading{
            margin-bottom:25px;
            text-align:center;
          }
          .page-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .page-heading .title{
            margin-bottom:10px;
            text-transform:uppercase;
            font-weight:700;
            font-size:24px;
            color:#1a1a1a;
          }
          .page-heading .subtitle{
            margin-bottom:6px;
            font-weight:600;
            font-size:20px;
          }
          .page-heading .description{
            margin-bottom:15px;
            font-weight:400;
            font-size:18px;
          }
          /* section-heading */
          .section-heading{
            margin-bottom:15px;
          }
          .section-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .section-heading .title{
            margin-bottom:7px;
            font-weight:600;
            font-size:15px;
            color:#1a1a1a;
          }
          .section-heading .subtitle{
            margin-bottom:7px;
            font-weight:600;
            font-size:12px;
            color:#004e98;
          }
          .section-heading .description{
            margin-bottom:12px;
            font-weight:600;
            font-size:10px;
            color:#a2a2a2;
          }
          /* subject-heading */
          .subject-heading{
            margin-top:8cm;
            margin-bottom:15px;
            text-align:center;
          }
          .subject-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .subject-heading .title{
            margin-bottom:7px;
            font-weight:600;
            font-size:28px;
            color:#004e98;
          }
          .subject-heading .subtitle{
            margin-bottom:25px;
            font-weight:400;
            font-size:40px;
            color:#1a1a1a;
          }
          /* user-info */
          .user-info{
            margin-bottom:15px;
            text-align:center;
          }
          .user-info > *:last-child{
            margin-bottom:0 !important;
          }
          .user-info .title{
            margin-bottom:35px;
            font-weight:600;
            font-size:18px;
            color:#004e98;
          }
          .user-info .title strong{
            display:block;
            margin-top:5px;
            font-weight:400;
            font-size:22px;
            color:#1a1a1a;
          }
          .user-info .subtitle{
            margin-bottom:30px;
            font-weight:600;
            font-size:16px;
            color:#1a1a1a;
          }
          /* user-image */
          .user-image{
            margin-bottom:50px;
            text-align:center;
          }
          .user-image > .holder{
            display:inline-block;
            vertical-align:top;
            padding-left:10px;
            padding-right:10px;
            box-sizing:border-box;
          }
          .user-image > .holder > .pic{
            margin-bottom:20px;
          }
          .user-image > .holder > .pic img{
            width:150px;
            height:150px;
            object-fit:cover;
            object-position:center center;
            border-radius:50%;
          }
          .user-image > .holder > .data{
          }
          .user-image > .holder > .data .title{
            margin-bottom:0;
            font-weight:600;
            font-size:22px;
            color:#004e98;
          }
          /* default-text */
          .default-text.text-center{
            text-align:center;
          }
          .default-text.text-left{
            text-align:justify;
          }
          .default-text > *:last-child{
            margin-bottom:0 !important;
          }
          .default-text h1{
            margin-bottom:10px;
            font-weight:600;
            font-size:22px;
            color:#1a1a1a;
          }
          .default-text h3{
            margin-bottom:10px;
            font-weight:600;
            font-size:16px;
            color:#1a1a1a;
          }
          .default-text p{
            margin-bottom:12px;
            font-weight:400;
            font-size:12px;
          }
          .default-text p.tab-space-1{
            padding-left:30px;
          }
          .default-text p strong{
            color:#1a1a1a;
          }
          .default-text p strong.blue{
            color:#004e98;
          }
          .default-text table{
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .default-text table > tbody > tr > td{
            vertical-align:top;
          }
          .default-text table > tbody > tr > td:first-child{
            width:30%;
            padding-right:15px;
          }
          .default-text table.signature-table > tbody > tr > td:first-child{
            width:50%;
          }
          .default-text table.signature-table > tbody > tr > td.text-left{
            text-align:left;
          }
          .default-text table.signature-table > tbody > tr > td.text-right{
            text-align:right;
          }
          .default-text table > tbody > tr > td img{
            margin-bottom:10px;
            max-height:50px;
          }
          .default-text table > tbody > tr > td hr{
            width:100%;
            max-width:260px;
            border-top:1px solid #1a1a1a;
          }
          /* page-agreement */
          .page-agreement{
            margin-bottom:25px;
          }
          /* project-drawings */
          .project-drawings{
          }
          .project-drawings-item{
            /*width:33.33%;*/
            width:100%;
            /*float:left;*/
            margin-bottom:20px;
            /*page-break-inside:avoid;*/
          }
          .project-drawings-item > .holder{
            padding-left:10px;
            padding-right:10px;
            box-sizing:border-box;
          }
          .project-drawings-item > .holder > .pic{
            margin-bottom:10px;
          }
          .project-drawings-item > .holder > .pic img{
            width:100%;
            border-radius:4px;
          }
          .project-drawings-item > .holder > .document{
            margin-bottom:10px;
            padding:20px 10px 20px 10px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-radius:5px;
            text-align:center;
          }
          .project-drawings-item > .holder > .document > .document-icon{
            margin-bottom:15px;
          }
          .project-drawings-item > .holder > .document > .document-icon svg{
            display:inline-block;
            vertical-align:top;
            width:90px;
            height:100px;
            margin-left:-15px;
          }
          .project-drawings-item > .holder > .document > .document-link{
            margin-bottom:0;
          }
          .project-drawings-item > .holder > .document > .document-link .link{
            margin-bottom:0;
            font-weight:400;
            font-size:9px;
            color:inherit;
            text-decoration:none;
          }
          .project-drawings-item > .holder > .data{
          }
          .project-drawings-item > .holder > .data ul.tags{
            padding-left:0;
            text-align:left;
            list-style:none;
            font-size:0;
          }
          .project-drawings-item > .holder > .data ul.tags li{
            position:relative;
            display:inline-block;
            vertical-align:top;
            margin-right:7px;
            margin-bottom:7px;
            padding:3px 7px 4px 7px;
            background-color:#f3f3f3;
            border-radius:3px;
            font-weight:400;
            font-size:9px;
          }
          .project-drawings-item > .holder > .data ul.tags li:last-child{
            margin-right:0;
          }
          /* project-ganttchart */
          .project-ganttchart{
            position:relative;
            margin-bottom:25px;
            border:1px solid #e3e3e3;
          }
          .project-ganttchart img{
            width:100%;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table thead tr th{
            padding:7px 10px 8px 10px;
            background-color:#f6f6f8;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:11px;
            color:#0047ba;
          }
          .table thead tr th:last-child{
            border-right:none;
          }
          .table thead tr th.text-left{
            text-align:left;
          }
          .table thead tr th.task-no{
            width:50px;
          }
          .table thead tr th.status,
          .table thead tr th.type,
          .table thead tr th.creator{
            width:80px;
          }
          .table tbody tr th{
            padding:7px 10px 8px 10px;
            background-color:#f0f6ff;
            border-top:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:left;
            font-weight:400;
            font-size:11px;
            color:#0047ba;
          }
          .table tbody tr td{
            padding:5px 10px 7px 10px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:9px;
          }
          .table tbody tr td:last-child{
            border-right:none;
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.success{
            color:#02d94f;
          }
          .table tbody tr td.failed{
            color:#FF0000;
          }
          .table tbody tr td.cell-xl{
            padding-top:10px;
            padding-bottom:12px;
          }
          .table tbody tr td .subject{
            margin-bottom:7px;
            font-weight:400;
            font-size:14px;
            color:#a2a2a2;
          }
          .table tbody tr td .data{
            margin-bottom:0;
            font-weight:600;
            font-size:16px;
            color:#1a1a1a;
          }
          /* project-scope */
          .project-scope{
            width:100%;
            margin-top:10px;
            margin-bottom:35px;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .project-scope thead tr th{
            vertical-align:top;
            padding:0 10px 10px 10px;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:700;
            font-size:14px;
            color:#1a1a1a;
          }
          .project-scope tbody tr td{
            vertical-align:top;
            padding:13px 10px 0 10px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
          }
          .project-scope tbody tr td:last-child{
            border-right:none;
          }
          .project-scope tbody tr td ul.scope-list{
            padding-left:0;
            text-align:left;
            list-style:none;
          }
          .project-scope tbody tr td ul.scope-list li{
            position:relative;
            margin-bottom:10px;
            padding-left:20px;
            font-weight:400;
            font-size:9px;
          }
          .project-scope tbody tr td ul.scope-list li:last-child{
            margin-bottom:0;
          }
          .project-scope tbody tr td ul.scope-list li .list-icon{
            position:absolute;
            top:0;
            left:0;
          }
          /* page-userdata */
          .page-userdata{
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .page-userdata tbody tr td{
            padding-right:10px;
            padding-left:10px;
            border-right:1px solid #e3e3e3;
          }
          .page-userdata tbody tr td:last-child{
            border-right:none;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>
        <!-- start of page 7 -->
<div class="page">
	<!-- page-header -->
	<header class="page-header">
		<div class="site-logo">
			<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
		</div>
	</header>
	<!-- page-header -->
	<!-- page-heading -->
	<div class="page-heading">
		<h3 class="description">Program of Works</h3>
	</div>
	<!-- page-heading -->
  <!-- project-ganttchart -->`
  if(project_gnatt_table.rows.length>0){
    html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="Gantt Chart Image">`
       }
       else{
         html+= ` <img src="../html-pdf/images/chart-2.svg" alt="Gantt Chart Image">` 
       }

    html+=`</div>
    <!-- project-ganttchart -->
    <!-- page-heading -->`
    if(project_stage_and_task_details.length > 0){
      html+=`<div class="page-heading">
      <h3 class="description">Program of Tasks</h3>
    </div>
    <!-- page-heading -->
    <!-- section-heading -->`
      for(let i = 0; i < project_stage_and_task_details.length; i++){
        html+=`<div class="section-heading">
        <h3 class="title">`+(i+1)+` - `+project_stage_and_task_details[i].description+`</h3>
      </div>
      <!-- section-heading -->
      <!-- table -->
      <table class="table">
        <thead>
          <tr>
            <th class="task-no text-center">Task No</th>
            <th class="task-name text-left">Task Name</th>
            <th class="type text-center">Type</th>
            <th class="instructions text-left">Instructions</th>
          </tr>
        </thead>
        <tbody>`
        if(project_stage_and_task_details[i].client_assigned.length > 0){
          html+=`<tr>
          <th colspan="4" class="full-width text-left">Client</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].client_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-left">`+project_stage_and_task_details[i].client_assigned[j].name+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].client_assigned[j].type+`</td>
            <td class="text-left">`+project_stage_and_task_details[i].client_assigned[j].instruction+`</td>
          </tr>`
          }
        }	
        if(project_stage_and_task_details[i].consultant_assigned.length > 0){
          html+=`<tr>
          <th colspan="4" class="full-width text-left">Consultant</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].consultant_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-left">`+project_stage_and_task_details[i].consultant_assigned[j].name+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].consultant_assigned[j].type+`</td>
            <td class="text-left">`+project_stage_and_task_details[i].consultant_assigned[j].instruction+`</td>
          </tr>`
          }
        }
        if(project_stage_and_task_details[i].contractor_assigned.length > 0){
          html+=`<tr>
          <th colspan="4" class="full-width text-left">Contractor</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].contractor_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-left">`+project_stage_and_task_details[i].contractor_assigned[j].name+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].contractor_assigned[j].type+`</td>
            <td class="text-left">`+project_stage_and_task_details[i].contractor_assigned[j].instruction+`</td>
          </tr>`
          }
        }		

      html+=`</tbody>
      </table>`
      }
    }
	html+=`<!-- table -->
</div>
<!-- end of page 7 -->`
        resolve(html)
      })
      console.log(html)
      let pdf_name = await commonFunnction.getRandomString(5);
      let create_pdf = await new Promise(function (resolve, reject) {
        let create_pdf;
        let pdf = require('html-pdf');
        let options = {
          format: 'Letter', "border": {
            "top": "0.5in",            // default is 0, units: mm, cm, in, px
            "right": "0.2in",
            "bottom": "0.2in",
            "left": "0.2in"
          }
        };
        pdf.create(html, options).toFile(global.constants.uploads.project_works_pdf + './' + pdf_name + '.pdf', function (err, resp) {
          if (err) return console.log(err);
          else {
            create_pdf = resp;
            resolve(create_pdf)
          }
        })
      })
      return res.send({ status: 200, message: 'Project work PDF is downloaded', purpose: 'To download project work PDF', data: global.constants.IMG_URL.project_works_pdf_url + pdf_name + '.pdf' })


    }
    catch (err) {
      console.log(2505, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}
// ProjectController.downloadProgramOfWorksPdf = function (req, res) {
//   (async () => {
//     try {
//       let project_details = await new Promise(function (resolve, reject) {
//         let project_details;
//         let project_data_where = {};
//         // let project_bids_where = {contractor_id:req.user_id};
//         project_data_where.id = parseInt(req.query.id);
//         ProjectRepository.fetchProject(project_data_where).then(project_result => {
//           project_details = project_result;
//           resolve(project_details);
//         }).catch(project_err => {
//           console.log(805, project_err);
//           return res.send({ status: 500, message: 'Something went wrong' });
//         })
//       })

//       let project_stages = await new Promise(function (resolve, reject) {
//         let project_stages = [];
//         for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
//           project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
//           project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
//           project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
//           for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
//             if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
//               project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor++;
//             }
//             else if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
//               project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient++;
//             }
//             else {
//               project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant++;
//             }
//           }

//           project_stages.push(project_details.rows[0].dataValues.project_stages[i]);
//           if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
//             resolve(project_stages)
//           }
//         }

//       })
//       project_details.rows[0].dataValues.project_stages = project_stages;

//       // return res.send({status:200, message:'Project Details', data:project_details, purpose:'To get details of project'});
//       let consultant_stage_task_details = await new Promise(function (resolve, reject) {
//         let consultant_stage_task_details = [];
//         for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
//           let consultant_stage_task_details_object = {};
//           // contractor_stage_task_details.push(contractor_stage_task_details_object);
//           for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
//             if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Consultant') {
//               consultant_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
//               consultant_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
//               consultant_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
//               consultant_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
//               consultant_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
//               consultant_stage_task_details.push(consultant_stage_task_details_object);

//             }
//             // else{
//             //   contractor_stage_task_details.push(contractor_stage_task_details_object);

//             // }
//           }
//           if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
//             consultant_stage_task_details = [...new Set(consultant_stage_task_details)];

//             resolve(consultant_stage_task_details)
//           }
//         }
//       })
//       // return res.send({status:200, message:'consultant_stage_task_details', data:consultant_stage_task_details})
//       let client_stage_task_details = await new Promise(function (resolve, reject) {
//         let client_stage_task_details = [];
//         for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
//           let client_stage_task_details_object = {};
//           // client_stage_task_details.push(client_stage_task_details_object);
//           for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
//             if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
//               client_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
//               client_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
//               client_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
//               client_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
//               client_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
//               client_stage_task_details.push(client_stage_task_details_object);

//             }
//             // else{
//             //   client_stage_task_details.push(client_stage_task_details_object);

//             // }
//           }
//           if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
//             client_stage_task_details = [...new Set(client_stage_task_details)];

//             resolve(client_stage_task_details)
//           }
//         }
//       })
//       // return res.send({status:200, message:'client_stage_task_details', data:client_stage_task_details})

//       let contractor_stage_task_details = await new Promise(function (resolve, reject) {
//         let contractor_stage_task_details = [];
//         for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
//           let contractor_stage_task_details_object = {};
//           // contractor_stage_task_details.push(contractor_stage_task_details_object);
//           for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
//             if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
//               contractor_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
//               contractor_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
//               contractor_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
//               contractor_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
//               contractor_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
//               contractor_stage_task_details.push(contractor_stage_task_details_object);

//             }
//             // else{
//             //   contractor_stage_task_details.push(contractor_stage_task_details_object);

//             // }
//           }
//           if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
//             contractor_stage_task_details = [...new Set(contractor_stage_task_details)];

//             resolve(contractor_stage_task_details)
//           }
//         }
//       })
//       // return res.send({status:200, message:'contractor_stage_task_details', data:contractor_stage_task_details})



//       let project_gnatt_chart={};
//       project_gnatt_chart.table='project_docs',
//       project_gnatt_chart.where={project_id:req.query.id,type:'gantt_chart',resource_description:parseInt(req.query.contractor_id)}
//       let project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);

//       let html = await new Promise(function (resolve, reject) {
//         let html = `<!doctype html>
//         <html xmlns:v="urn:schemas-microsoft-com:vml">
//            <head>
//               <meta charset="utf-8">
//               <meta http-equiv="X-UA-Compatible" content="IE=edge">
//               <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
//               <title>eBinaa</title>
//            </head>
        
//         <style type="text/css">
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-Medium.eot');
//             src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
//             font-weight:500;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-SemiBold.eot');
//             src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
//             font-weight:600;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-Bold.eot');
//             src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
//             font-weight:700;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         body { 
//             font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
//             background-color: #ffffff;
//             padding: 0;
//             margin: 0;
//             font-size: 13px;
//             line-height: 1.5;
//             font-weight: normal;
//         }
//         * { 
//             padding: 0; 
//             margin: 0;
//         }
//         .container {
//             width:100%;
//             max-width:23cm;
//             margin: 0 auto;
//             /*padding-right: 9%;
//             padding-left: 9%;*/
//             padding-right:1cm;
//             padding-left:1cm;
//             box-sizing:border-box;
//         }
//         .site-logo { 
//             padding: 40px 0;
//         }
//         .site-logo img{ 
//             max-width:100px;
//         }
//         table { 
//             width: 100%;
//         }
//         table, table tr, table td, table th { 
//             padding: 0;
//         }
//         .img-responsive { 
//             max-width: 100%;
//             width: 100%;
//             height: auto;
//             display: block;
//         }
//         .text-center { 
//             text-align: center;
//         }
//         .text-left {
//             text-align: left;
//         }
//         .text-right{
//             text-align: right;
//         }
//         .copy-txt {   
//             font-size: 12px;
//             line-height: 18px;
//             font-weight: 500;
//             text-align: center;
//             color: #969696;
//             padding: 30px 0;
//             margin: 0;
//         }
//         h1 {
//             font-size: 15px;
//             font-weight: 600;
//             line-height: 0.85;
//             color: #000000;  
//             padding: 0;
//             margin: 0 0 20px 0;
//         }
//         p {
//             font-size: 17px;
//             font-weight: 500;
//             line-height: 1.29;
//             color: #000000;
//             padding: 0;
//             margin: 0 0 20px 0;
//         }
//         .blue-color { 
//             color: #004e98; 
//         }
//         .table2 {
//             /*table-layout:fixed;*/
//             border: 1px solid #e5e5e5;
//             margin: 0 auto;
//             border-radius: 2px;
//             margin-bottom: 30px;
//         }
//         .table2 th, .table2 td {
//             padding: 7px 10px;
//         }
//         .table2 thead {
//             background-color: #f6f6f8; 
//         }
//         .table2 thead th {
//             background-color: #f6f6f8;
//             font-size: 11px;
//             font-weight: 500;
//             line-height: 1;
//             color: #0047ba;
//         }
//         .table2 thead th.stage-no{
//             width:80px;
//         }
//         .table2 thead th.contractor,
//         .table2 thead th.client,
//         .table2 thead th.consultant{
//             width:100px;
//         }
//         .table2 thead .thead-tb-inner th, .table2 tbody .tbody-tb-inner td { text-align: center; }
//         .table2 h3 { font-size: 15px; line-height: 1.5; }
//         .table2 h4 { font-size: 14px; line-height: 1.5; }
//         .table2 h5 { font-size: 13px; line-height: 1.5; }
//         .bl-1 { border-left: 1px solid #e6e6e8; }
//         .br-1 { border-right: 1px solid #e6e6e8; }
//         .bt-1 { border-top: 1px solid #e6e6e8; }
//         .bb-1 { border-bottom: 1px solid #e6e6e8; }
//         .p-0, .table2 .p-0 { padding: 0;}
//         .pb-0, .contractor-tbl td.pb-0 { padding-bottom: 0;}
//         .table2 thead th.rp-lr { padding-left: 0; padding-right: 0; }
//         .table2 tbody td {
//             font-size: 10px;
//             line-height: 1.6;
//             padding: 5px 10px;
//         }
//         .mb-30 {margin-bottom: 30px;}
//         .contractor-tbl td { padding-top: 20px; padding-bottom: 30px;}

//         .contractor-tbl h1, .contractor-heading-txt  { font-size: 14px; line-height: 1; color: #004e98; font-weight: 600; margin: 10px 0 15px 0; }
//         .contractor-tbl h2 { font-size: 18px; line-height: 1.22; color: #004e98; font-weight: normal; margin: 0 0 10px 0;}
//         .contractor-tbl p { font-size: 16px; line-height: 1.5; color: #000000; font-weight: normal; margin: 0 0 10px 0; }
//         .contractor-tbl2 {
//             border: 1px solid #e5e5e5;
//             margin: 0 0 30px 0;
//         }
//         .contractor-tbl2 thead th {
//             font-size: 11px;
//             line-height: 1.6;
//             color: #0047ba;
//             font-weight: 500;
//             padding: 7px 10px;
//             background-color: #f6f6f8;
//             vertical-align: middle;
//             border-bottom: 1px solid #e5e5e5;
//             text-align: center;
//         }
//         .contractor-tbl2 td {
//             font-size: 10px;
//             line-height: 1.36;
//             color: #1a1a1a;
//             font-weight: 500;
//             padding: 5px 10px;
//             vertical-align: middle;
//             text-align: center;
//         }
//         .contractor-tbl2 td p {
//             font-size: 10px;
//             line-height: 1.36;
//             color: #1a1a1a;
//             font-weight: 500;
//             margin: 0;
//         }
//         .mb-0 { margin-bottom: 0;}
//         .success-colour, .contractor-tbl p.success-colour, .contractor-tbl2 p.success-colour { color: #14b105;}
//         </style>
//         <body>
//         <div class="container">
        
        
//             <table class="table1" width="100" border="0" cellpadding="0" cellspacing="0">
//                 <tr>
//                     <td class="text-center site-logo"><img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/general_images/eb-logo.svg" class="" alt="logo"></td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <h1>Program of Works</h1>
//                     </td>
//                 </tr>
//                 <tr>
//                     <td>
//                         <table class="table2" width="100" border="0" cellpadding="0" cellspacing="0">
//                             <thead>
//                                 <tr>
//                                     <th rowspan="2" class="bb-1 stage-no">Stage No</th>
//                                     <th rowspan="2" class="bl-1 bb-1 stage-description text-left">Stage Description</th>
//                                     <th colspan="3" class="bl-1 bb-1">Tasks Count</th>
//                                 </tr>
//                                 <tr>
//                                     <th class="bl-1 bb-1 contractor">Contractor</th>
//                                     <th class="bl-1 bb-1 client">Client</th>
//                                     <th class="bl-1 bb-1 consultant">Consultant</th>
//                                 </tr>
//                             </thead>
//                             <tbody>`
//         for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
//           html += `<tr>
//                         <td class="text-center">`+ (i + 1) + `.</td>
//                         <td class="bl-1">`+ project_details.rows[0].dataValues.project_stages[i].dataValues.description + `</td>
//                         <td class="bl-1 text-center">`+ project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor + `</td>
//                         <td class="bl-1 text-center">`+ project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient + `</td>
//                         <td class="bl-1 text-center">`+ project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant + `</td>
//                     </tr>`
//         }
//         html += `</tbody>
//                 </table> 
//             </td>
//         </tr>
//         <tr>
//             <td>
//                 <table class="mb-30" width="100" border="0" cellpadding="0" cellspacing="0">
//                     <tr>`

//                     if(project_gnatt_table.rows.length>0){
//                       html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="Gantt Chart Image">`
//                          }
//                          else{

//                        html+=` <td class="text-center"><img src="../html-pdf/images/chart-2.svg" class="img-responsive" alt="program-img"></td>`
//                         }
//                    html+=`</tr>
//                 </table>
//             </td>
//         </tr>`
//         if (contractor_stage_task_details.length > 0) {
//           html += `<tr>
//               <td>
//                   <h1 class="contractor-heading-txt">Contractor</h1>
//                   <table class="contractor-tbl contractor-tbl2" width="100" border="0" cellpadding="0" cellspacing="0">
//                       <thead>
//                           <tr>
//                               <th>Stage No</th>
//                               <th class="bl-1">Stage Description</th>
//                               <th class="bl-1">Name</th>
//                               <th class="bl-1">Type</th>
//                               <th class="bl-1">Status</th>
//                               <th width="20%" class="bl-1">Instructions</th>
//                           </tr>
//                       </thead>
//                       <tbody>`
//           for (let i = 0; i < contractor_stage_task_details.length; i++) {
//             if (contractor_stage_task_details[i].status == 1) {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                               <td class="bl-1">`+ contractor_stage_task_details[i].description + `</td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].name + `</td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].type + `</td>
//                               <td class="bl-1"><p class="success-colour">In Tendering</p></td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].instruction + `</td></tr>`
//             }
//             else {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                               <td class="bl-1">`+ contractor_stage_task_details[i].description + `</td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].name + `</td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].type + `</td>
//                               <td class="bl-1"><p class="success-colour">On Track</p></td>
//                               <td class="bl-1">`+ contractor_stage_task_details[i].instruction + `</td></tr>`

//             }
//           }

//           html += `</tbody>
//                   </table>
//               </td>
//           </tr>`

//         }
//         if (client_stage_task_details.length > 0) {
//           html += `<tr>
//           <td>
//               <h1 class="contractor-heading-txt">Client</h1>
//               <table class="contractor-tbl contractor-tbl2" width="100" border="0" cellpadding="0" cellspacing="0">
//                   <thead>
//                       <tr>
//                           <th>Stage No</th>
//                           <th class="bl-1">Stage Description</th>
//                           <th class="bl-1">Name</th>
//                           <th class="bl-1">Type</th>
//                           <th class="bl-1">Status</th>
//                           <th width="20%" class="bl-1">Instructions</th>
//                       </tr>
//                   </thead>
//                   <tbody>`
//           for (let i = 0; i < client_stage_task_details.length; i++) {
//             if (client_stage_task_details[i].status == 1) {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                           <td class="bl-1">`+ client_stage_task_details[i].description + `</td>
//                           <td class="bl-1">`+ client_stage_task_details[i].name + `</td>
//                           <td class="bl-1">`+ client_stage_task_details[i].type + `</td>
//                           <td class="bl-1"><p class="success-colour">In Tendering</p></td>
//                           <td class="bl-1">`+ client_stage_task_details[i].instruction + `</td></tr>`
//             }
//             else {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                           <td class="bl-1">`+ client_stage_task_details[i].description + `</td>
//                           <td class="bl-1">`+ client_stage_task_details[i].name + `</td>
//                           <td class="bl-1">`+ client_stage_task_details[i].type + `</td>
//                           <td class="bl-1"><p class="success-colour">On Track</p></td>
//                           <td class="bl-1">`+ client_stage_task_details[i].instruction + `</td></tr>`

//             }
//           }

//           html += `</tbody>
//               </table>
//           </td>
//       </tr>`

//         }
//         if (consultant_stage_task_details.length > 0) {
//           html += `<tr>
//           <td>
//               <h1 class="contractor-heading-txt">Consultant</h1>
//               <table class="contractor-tbl contractor-tbl2" width="100" border="0" cellpadding="0" cellspacing="0">
//                   <thead>
//                       <tr>
//                           <th>Stage No</th>
//                           <th class="bl-1">Stage Description</th>
//                           <th class="bl-1">Name</th>
//                           <th class="bl-1">Type</th>
//                           <th class="bl-1">Status</th>
//                           <th width="20%" class="bl-1">Instructions</th>
//                       </tr>
//                   </thead>
//                   <tbody>`
//           // for(let i = 0; i < consultant_stage_task_details.length; i++){
//           //   html+=`<tr> <td class="bl-1">`+(i+1)+`.</td> 
//           //   <td class="bl-1">`+consultant_stage_task_details[i].description+`</td>
//           //   <td class="bl-1">`+consultant_stage_task_details[i].name+`</td>
//           //   <td class="bl-1">`+consultant_stage_task_details[i].type+`</td>
//           //   <td class="bl-1"><p class="success-colour">`+consultant_stage_task_details[i].status+`</p></td>
//           //   <td class="bl-1">`+consultant_stage_task_details[i].instruction+`</td></tr>`

//           // }
//           for (let i = 0; i < consultant_stage_task_details.length; i++) {
//             if (consultant_stage_task_details[i].status == 1) {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                           <td class="bl-1">`+ consultant_stage_task_details[i].description + `</td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].name + `</td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].type + `</td>
//                           <td class="bl-1"><p class="success-colour">In Tendering</p></td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].instruction + `</td></tr>`
//             }
//             else {
//               html += `<tr> <td class="bl-1">` + (i + 1) + `.</td> 
//                           <td class="bl-1">`+ consultant_stage_task_details[i].description + `</td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].name + `</td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].type + `</td>
//                           <td class="bl-1"><p class="success-colour">On Track</p></td>
//                           <td class="bl-1">`+ consultant_stage_task_details[i].instruction + `</td></tr>`

//             }
//           }
//           html += `</tbody>
//               </table>
//           </td>
//         </tr>`

//         }
//         html += `<tr>
//             <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
//         </tr>
//         </table>
//         </div>
//         </body>`
//         resolve(html)
//       })
//       console.log(html)
//       let pdf_name = await commonFunnction.getRandomString(5);
//       let create_pdf = await new Promise(function (resolve, reject) {
//         let create_pdf;
//         let pdf = require('html-pdf');
//         let options = {
//           format: 'Letter', "border": {
//             "top": "0.5in",            // default is 0, units: mm, cm, in, px
//             "right": "0.2in",
//             "bottom": "0.2in",
//             "left": "0.2in"
//           }
//         };
//         pdf.create(html, options).toFile(global.constants.uploads.project_works_pdf + './' + pdf_name + '.pdf', function (err, resp) {
//           if (err) return console.log(err);
//           else {
//             create_pdf = resp;
//             resolve(create_pdf)
//           }
//         })
//       })
//       return res.send({ status: 200, message: 'Project work PDF is downloaded', purpose: 'To download project work PDF', data: global.constants.IMG_URL.project_works_pdf_url + pdf_name + '.pdf' })


//     }
//     catch (err) {
//       console.log(2505, err);
//       return res.send({ status: 500, message: 'Something went wrong' });
//     }
//   })()
// }




ProjectController.projectScopePdfdemo= (req, res) => {



  (async () => {

    try {

      let scope = {};
      scope.table = 'project_scopes',
        scope.where = {};
      scope.where.project_id = req.query.project_id,
        scope.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
      let scope_table = await ConsultationhubRepository.staticScopeDetails(scope);


      let scope_group = {};
      scope_group.table = 'project_scopes',
        scope_group.where = {};
      scope_group.where.project_id = req.query.project_id,
        scope_group.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
      let scope_table_fetch = await ConsultationhubRepository.staticScopeDetails(scope_group);

      let scope_data = {};
      scope_data.table = 'project_scopes',
        scope_data.where = {};
      scope_data.where.project_id = req.query.project_id,
        scope_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
      let scope_data_fetch = await ConsultationhubRepository.staticScopeDetails(scope_data);


      let custom = {};
      custom.table = 'project_scopes',
        custom.where = {};

      custom.where.project_id = req.query.project_id,
        custom.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
      let custom_table = await ConsultationhubRepository.scopeDetails(custom);


      let custom_data = {};
      custom_data.table = 'project_scopes',
        custom_data.where = {};
      custom_data.where.project_id = req.query.project_id,
        custom_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
      let custom_table_fetch = await ConsultationhubRepository.scopeDetails(custom_data);


      let custom_value = {};
      custom_value.table = 'project_scopes',
        custom_value.where = {};
        custom_value.project_id = req.query.project_id,
        custom_value.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
      let custom_value_fetch = await ConsultationhubRepository.scopeDetails(custom_value);


      let project_value={};
      project_value.table='projects',
      project_value.where={
        id:req.query.project_id,

      };
      let project_table=await GenericRepository.fetchData(project_value)

      console.log(project_table.rows[0].dataValues.name)


      let project_contracts={};
      project_contracts.where={project_id:req.query.project_id};
    
      let group_name='supply_and_install_by_contractor'
      let order=[['version_no','DESC']]
      let project_contracts_table=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);




      let project_contracts_groupname={};
      project_contracts_groupname.where={project_id:req.query.project_id};
     
       group_name='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_groupname=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);


      let project_contracts_groupname_install={};
      project_contracts_groupname_install.where={project_id:req.query.project_id};
     
       group_name='supplied_by_client_and_installed_by_contractor'
       order=[['version_no','DESC']]
      let project_contracts_table_groupname_install=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);



      let project_contracts_custom={};
      project_contracts_custom.where={project_id:req.query.project_id};
      
     let group='supply_and_install_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);


      let project_contracts_custom_groupname={};
      project_contracts_custom_groupname.where={project_id:req.query.project_id};
       //type=2;
     group='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_groupname=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);



      let project_contracts_custom_install={};
      project_contracts_custom_install.where={project_id:req.query.project_id};
       type=2;
     group='supplied_by_client_and_installed_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_install=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);






      let project_scope = {};
      //project_scope.table = 'project_scopes',
      project_scope.where = {};
      let order_for=[['id','ASC']]
      let project_scope_table = await ConsultationhubRepository.project_scope_section(project_scope,order_for);

      console.log(project_scope_table);


      // let i=0;
      // var v=0;


      let project_scope_version={};
      project_scope_version.where={project_id:req.query.project_id};
      let  order_sort=[['id','DESC']];
      let project_scope_version_data=await ConsultationhubRepository.project_contract_user_specifications(project_scope_version, order_sort);
      let oder_data=[];


      for(let i=0;i<project_scope_table.rows.length;i++){ 
               

                

        for(j=0;j<project_scope_table.rows[i].dataValues.section_category_maps.length;j++){
order_data.push()

        }
        }











      var fs = require('fs');
      var pdf = require('html-pdf');
      var options = {
        format: 'A4', "border": {
          "top": "1.0cm",            // default is 0, units: mm, cm, in, px
          "right": "0.5cm",
          "bottom": "1.0cm",
          "left": "0.5cm"
        }
      };

      var html = `<title>Project Scope</title>
        <style>
          /* page setup */
          /*@page{
            size:A4 portrait;
            margin:1.5cm;
          }
          @page :first{
            margin:0cm;
          }*/
          /* common */
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#1a1a1a;
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            position:relative;
            display:block;
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:25px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:120px;
          }
          /* page-heading */
          .page-heading{
            margin-bottom:25px;
            text-align:center;
          }
          .page-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .page-heading .title{
            margin-bottom:10px;
            text-transform:uppercase;
            font-weight:700;
            font-size:18px;
            color:#1a1a1a;
          }
          .page-heading .subtitle{
            margin-bottom:6px;
            font-weight:600;
            font-size:16px;
          }
          /* section-heading */
          .section-heading{
            margin-bottom:15px;
          }
          .section-heading.text-center{
            text-align:center;
          }
          .section-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .section-heading .title{
            margin-bottom:7px;
            font-weight:600;
            font-size:15px;
            color:#1a1a1a;
          }
          .section-heading .subtitle{
            margin-bottom:7px;
            font-weight:600;
            font-size:12px;
            color:#b7b7b8;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table thead tr th{
            padding:4px 10px 5px 10px;
            background-color:#f6f6f8;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:9px;
            color:#0047ba;
          }
          .table thead tr th:last-child{
            border-right:none;
          }
          .table thead tr th.text-left{
            text-align:left;
          }
          .table thead tr th.task-no{
            width:50px;
          }
          .table thead tr th.status,
          .table thead tr th.type,
          .table thead tr th.creator{
            width:80px;
          }
          .table tbody tr th{
            padding:7px 7px 8px 7px;
            background-color:#f0f6ff;
            border-top:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:left;
            font-weight:400;
            font-size:11px;
            color:#0047ba;
          }
          .table tbody tr th.text-left{
            text-align:left;
          }
          .table tbody tr th.text-center{
            text-align:center;
          }
          .table tbody tr th.description{
            width:100px;
          }
          .table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
          }
          .table tbody tr td:last-child{
            border-right:none;
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.text-center{
            text-align:center;
          }
          .table tbody tr td.success{
            color:#02d94f;
          }
          .table tbody tr td.failed{
            color:#FF0000;
          }
          .table tbody tr td.default-cell{
            background-color:#f4ba00;
          }
          .table tbody tr td.custom-cell{
            background-color:#02d94f;
            color:#fff;
          }
          .table tbody tr td.cell-xl{
            padding-top:10px;
            padding-bottom:12px;
          }
          .table tbody tr td .subject{
            margin-bottom:7px;
            font-weight:400;
            font-size:12px;
            color:#a2a2a2;
          }
          .table tbody tr td .data{
            margin-bottom:0;
            font-weight:600;
            font-size:14px;
            color:#1a1a1a;
          }
          /* table.specification-details */
          .table.specification-details-table{
            table-layout:auto;
          }
          .table.specification-details-table thead tr th{
            font-size:8px;
          }
          .table.specification-details-table tbody tr th{
            font-size:7px;
          }
          .table.specification-details-table tbody tr td{
            font-size:6px;
          }
          .table.specification-details-table tbody tr th.supply{
            width:50px;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>

        <!-- start of page 1 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/general_images/eb-logo.svg" alt="EBinaa Logo Colored">
            </div>
          </header>
          <!-- page-header -->
          <!-- table -->
          <table class="table">
            <tbody>
              <tr>
                <td class="text-left"><strong>Name of Project:</strong> ${project_table.rows[0].dataValues.name}</td>
                <td class="text-left"><strong>Plot Area:</strong> ${project_table.rows[0].dataValues.plot_area}</td>
              </tr>
              <tr>
                <td class="text-left"><strong>Location of Project:</strong> ${project_table.rows[0].dataValues.project_location}</td>
                <td class="text-left"><strong>Built Up Area:</strong> ${project_table.rows[0].dataValues.built_up_area}</td>
              </tr>
              <tr>
                <td class="text-left"><strong>Project Use:</strong> ${project_table.rows[0].dataValues.project_use_type}</td>
                <td class="text-left"><strong>Land Serial No:</strong> ${project_table.rows[0].dataValues.land_serial_no}</td>
              </tr>
            </tbody>
          </table>
          <!-- table -->
          <!-- section-heading -->
          <div class="section-heading text-center">
            <p class="title">Scope Specification Details</p>
            <p class="subtitle">Check scope specification details below</p>
          </div>
          <!-- section-heading -->
          <!-- table -->
          <table class="table">
            <thead>
              <tr>
                <th colspan="4" class="specifications text-left">Specifications</th>
                <th colspan="3" class="detailed-scope text-left">Detailed Scope of work</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colspan="4" class="specification-details text-left">The following standard specifications of all the works that shall be carried out in accordance with the standard codes of practices that is implemented and used in the Sultanate of Oman</th>
                <th rowspan="2" class="specification-details text-center">Supply and Installation by Contractor (1)</th>
                <th rowspan="2" class="specification-details text-center">Supply and Installation by Employer (2)</th>
                <th rowspan="2" class="specification-details text-center">Supply by Employer and Installation by Contractor (3)</th>
              </tr>
              <tr>
                <th class="specification-details text-left">Section Category</th>
                <th class="specification-details text-center">Section No.</th>
                <th class="specification-details description text-left">Description</th>
                <th class="specification-details text-center">Make or Equivelant*</th>
              </tr>
             `
             if(project_scope_version_data.rows.length>0){
               console.log(project_scope_version_data.rows[0].dataValues.id)
               console.log("hello")
               for(i=0;i<project_scope_version_data.rows[0].dataValues.contract_metas.length;i++){
                console.log("id",project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.section_category_maps.length);
                 for(j=0;j<project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.section_category_maps.length;j++){
                  




                    html+=` <tr><td><rowspan="10" class="text-left">${i+1}.${project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.scope_description}</td>`
                  
                  
                
              
                
                
                  //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
                  
                 
                 html+=`<td class="text-center">${i+1}.${j+1}</td>`
                 
                 html+=` <td class="text-left">${project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.section_category_maps[j].dataValues.description}</td>
                  <td class="text-center">${project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.section_category_maps[j].dataValues.make_or_equivelant}</td> `


           if(project_scope_version_data.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.type==2){

            html+= `<td class="text-center"></td>
            <td class="text-center"></td>
            <td class="custom-cell text-center"></td>`

           }       

                  
                 else{
                 
                  html+=`<td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td></tr>`

                 }
             

                  
                

              


                   }
                 
               }
             }
             else{

              for(let i=0;i<project_scope_table.rows.length;i++){ 
               

                

                for(j=0;j<project_scope_table.rows[i].dataValues.section_category_maps.length;j++){
                  var v=project_scope_table.rows[i].dataValues.section_category_maps.length;
                  console.log(v);
                console.log(project_scope_table.rows[i].dataValues.scope_description);
                //let v=1;
                //console.log(i--);

               
                
                //let v=project_scope_table.rows.length;
                //if(project_scope_table.rows[i].dataValues.section_category_maps.length>1){}


                
               html+='<tr>'
                
                html+=` <td><rowspan="10" class="text-left">${i+1}.${project_scope_table.rows[i].dataValues.scope_description}</td>`
                
                
                
            
              
              
                //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
                
               
               html+=`<td class="text-center">${i+1}.${j+1}</td>`
               
               html+=` <td class="text-left">${project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description}</td>
                <td class="text-center">${project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.make_or_equivelant}</td> `

if(project_scope_table.rows[i].dataValues.type==2){
                

                
               
               html+= `<td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`
}
              
              else{

                
                html+=`<td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td></tr>`



              }

            }
              
            }
               
          }
             
               
             
             html+=` 
             
            
             <tr>
                <td colspan="7" class="text-left">* Make or Equivelant: The Contractor may propose alternatrive companies to the one proposed by the specifications for the Engineer or Employers approval. It is suggested to share all project material supplier names with the Employer or Engineer .</td>
              </tr>
            </tbody>
          </table>
          <!-- table -->
        </div>
        <!-- end of page 1 -->`


              




      //console.log(html)

      pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + req.query.project_id + '.pdf', function (err, resp) {
        res.send({ status: 200, message: 'fetched', data: scope_table, resp: global.constants.IMG_URL.project_scope_url + req.query.project_id + '.pdf' ,data:project_scope_version_data})
        if (err) return console.log(err);
        console.log(resp);
      })


      //res.send({status:201,message:'fetched',data:custom_table,resp:resp})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}







/**scope-pdf API
method:GET
input:query[project_id]
output:data,
purpose:To download pdf.
created by-Sayanti Nath
*/

ProjectController.projectScopePdf = (req, res) => {



  (async () => {

    try {

      let scope = {};
      scope.table = 'project_scopes',
        scope.where = {};
      scope.where.project_id = req.query.project_id,
        scope.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
      let scope_table = await ConsultationhubRepository.staticScopeDetails(scope);


      let scope_group = {};
      scope_group.table = 'project_scopes',
        scope_group.where = {};
      scope_group.where.project_id = req.query.project_id,
        scope_group.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
      let scope_table_fetch = await ConsultationhubRepository.staticScopeDetails(scope_group);

      let scope_data = {};
      scope_data.table = 'project_scopes',
        scope_data.where = {};
      scope_data.where.project_id = req.query.project_id,
        scope_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
      let scope_data_fetch = await ConsultationhubRepository.staticScopeDetails(scope_data);


      let custom = {};
      custom.table = 'project_scopes',
        custom.where = {};

      custom.where.project_id = req.query.project_id,
        custom.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
      let custom_table = await ConsultationhubRepository.scopeDetails(custom);


      let custom_data = {};
      custom_data.table = 'project_scopes',
        custom_data.where = {};
      custom_data.where.project_id = req.query.project_id,
        custom_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
      let custom_table_fetch = await ConsultationhubRepository.scopeDetails(custom_data);


      let custom_value = {};
      custom_value.table = 'project_scopes',
        custom_value.where = {};
        custom_value.project_id = req.query.project_id,
        custom_value.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
      let custom_value_fetch = await ConsultationhubRepository.scopeDetails(custom_value);


      let project_value={};
      project_value.table='projects',
      project_value.where={
        id:req.query.project_id,

      };
      let project_table=await GenericRepository.fetchData(project_value)

      console.log(project_table.rows[0].dataValues.name)


      let project_contracts={};
      project_contracts.where={project_id:req.query.project_id};
    
      let group_name='supply_and_install_by_contractor'
      let order=[['version_no','DESC']]
      let project_contracts_table=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);




      let project_contracts_groupname={};
      project_contracts_groupname.where={project_id:req.query.project_id};
     
       group_name='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_groupname=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);


      let project_contracts_groupname_install={};
      project_contracts_groupname_install.where={project_id:req.query.project_id};
     
       group_name='supplied_by_client_and_installed_by_contractor'
       order=[['version_no','DESC']]
      let project_contracts_table_groupname_install=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);



      let project_contracts_custom={};
      project_contracts_custom.where={project_id:req.query.project_id};
      
     let group='supply_and_install_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);


      let project_contracts_custom_groupname={};
      project_contracts_custom_groupname.where={project_id:req.query.project_id};
       //type=2;
     group='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_groupname=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);



      let project_contracts_custom_install={};
      project_contracts_custom_install.where={project_id:req.query.project_id};
       type=2;
     group='supplied_by_client_and_installed_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_install=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);






      // let project_scope = {};
      // project_scope.table = 'project_scopes',
      // project_scope.where = {};
      
      // let project_scope_table = await ConsultationhubRepository.scopeDetails(project_scope);



      let project_scope = {};
      //project_scope.table = 'project_scopes',
     // project_scope.where = {project_id:req.query.project_id};
     let project_id=req.query.project_id;
      let order_section=[['section_no','ASC']]
      let project_scope_table = await ConsultationhubRepository.project_scope_section(project_scope,project_id,order_section);

      console.log(project_scope_table);
      let array=[];

      if(req.userdetails.user_type == 3){
      let bid_table={};
      bid_table.table='project_bids',
      bid_table.where={project_id:req.query.project_id,contractor_id:req.user_id};
      var bid_table_fetch=await GenericRepository.fetchData(bid_table);
      }


     


let v=1;




      var fs = require('fs');
      var pdf = require('html-pdf');
      var options = {
        format: 'A4', "border": {
          "top": "1.0cm",            // default is 0, units: mm, cm, in, px
          "right": "1cm",
          "bottom": "1.0cm",
          "left": "1cm"
        },
        "orientation": "portrait",
        "footer": {
          "height": "10px",
          "contents": {
            // Any page number is working. 1-based index
            default: '<span style="float:right; font-size:8px;">{{page}} / {{pages}}</span>',
            // fallback value
          }
        },
      
      };

      if(req.query.lang=='ara'){


        var html = `<title>Project Scope Arabic</title>
        <style>
          /* page setup */
          /*@page{
            size:A4 portrait;
            margin:1.5cm;
          }
          @page :first{
            margin:0cm;
          }*/
          /* common */
          @font-face{
            font-family:'Dubai';
            src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.eot');
            src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.eot?#iefix') format('embedded-opentype'),
                url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.woff') format('woff'),
                url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.ttf') format('truetype');
            font-weight:400;
            font-style:normal;
            font-display:swap;
          }
          @font-face{
            font-family:'Dubai';
            src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.eot');
            src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.eot?#iefix') format('embedded-opentype'),
                url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.woff') format('woff'),
                url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.ttf') format('truetype');
            font-weight:700;
            font-style:normal;
            font-display:swap;
          }
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:'Dubai',Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#323130; /* rgb(50,49,48) */
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            direction:rtl;
            position:relative;
            display:block;
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:25px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:120px;
          }
          /* page-heading */
          .page-heading{
            margin-bottom:25px;
            text-align:center;
          }
          .page-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .page-heading .title{
            margin-bottom:10px;
            text-transform:uppercase;
            font-weight:700;
            font-size:18px;
            color:#1a1a1a;
          }
          .page-heading .subtitle{
            margin-bottom:6px;
            font-weight:600;
            font-size:16px;
          }
          /* section-heading */
          .section-heading{
            margin-bottom:15px;
          }
          .section-heading.text-center{
            text-align:center;
          }
          .section-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .section-heading .title{
            margin-bottom:3px;
            font-weight:600;
            font-size:15px;
            color:#1a1a1a;
          }
          .section-heading .subtitle{
            margin-bottom:7px;
            font-weight:400;
            font-size:11px;
            color:#b7b7b8;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
          }
          .table tbody tr td:last-child{
            /*border-right:none;*/
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.text-right{
            text-align:right;
          }
          /* specification-details-table */
          .specification-details-table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:auto;
          }
          .specification-details-table thead tr th{
            padding:4px 10px 5px 10px;
            background-color:#f6f6f8;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
            color:#0047ba;
          }
          .specification-details-table thead tr th:last-child{
            /*border-right:none;*/
          }
          .specification-details-table thead tr th.text-left{
            text-align:left;
          }
          .specification-details-table thead tr th.text-right{
            text-align:right;
          }
          .specification-details-table thead tr th.task-no{
            width:50px;
          }
          .specification-details-table thead tr th.status,
          .specification-details-table thead tr th.type,
          .specification-details-table thead tr th.creator{
            width:80px;
          }
          .specification-details-table tbody tr th{
            padding:7px 7px 8px 7px;
            background-color:#f0f6ff;
            border:1px solid #e3e3e3;
            text-align:left;
            font-weight:400;
            font-size:6px;
            color:#0047ba;
          }
          .specification-details-table tbody tr th.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr th.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr th.text-right{
            text-align:right;
          }
          .specification-details-table tbody tr th.description{
            width:100px;
          }
          .specification-details-table tbody tr th.supply{
            width:50px;
          }
          .specification-details-table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:6px;
            page-break-inside:avoid;
            word-wrap:break-all;
          }
          .specification-details-table tbody tr td:last-child{
            /*border-right:none;*/
          }
          .specification-details-table tbody tr td.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr td.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr td.text-right{
            text-align:right;
          }
          .specification-details-table tbody tr td.default-cell{
            background-color:#f4ba00;
          }
          .specification-details-table tbody tr td.custom-cell{
            background-color:#02d94f;
            color:#fff;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>

        <!-- start of page 1 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
              <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
            </div>
          </header>
          <!-- page-header -->
          <!-- table -->
          <table class="table">
            <tbody>
              <tr>
                <td class="text-right"><strong>اسم المشروع:</strong> ${project_table.rows[0].dataValues.name}</td>
                <td class="text-right"><strong>مساحة الأرض:</strong> ${project_table.rows[0].dataValues.plot_area}</td>
              </tr>
              <tr>
                <td class="text-right"><strong>موقع المشروع:</strong> ${project_table.rows[0].dataValues.project_location}</td>
                <td class="text-right"><strong>مساحة البناء:</strong> ${project_table.rows[0].dataValues.built_up_area}</td>
              </tr>
              <tr>
                <td class="text-right"><strong>استخدام المشروع:</strong> ${project_table.rows[0].dataValues.project_use_type}</td>`

                if(req.userdetails.user_type == 3 && bid_table_fetch.rows.length>0){

                html+=`<td class="text-right"><strong>رقم تسلسل الكروكي: </strong> ${project_table.rows[0].dataValues.land_serial_no}</td>`
                }
                  else if(req.userdetails.user_type == 1){
                 html+=` <td class="text-right"><strong>رقم تسلسل الكروكي: </strong>  ${project_table.rows[0].dataValues.land_serial_no} </td>`
                }
                else if(req.userdetails.user_type == 2){
                  html+=` <td class="text-right"><strong>رقم تسلسل الكروكي: </strong>  ${project_table.rows[0].dataValues.land_serial_no} </td>`
                 }
                 else{
                  html+=` <td class="text-right"><strong>رقم تسلسل الكروكي: </strong> ---- </td>`
                }

                 
                
                 

                
             html+=` </tr>
            </tbody>
          </table>
          <!-- table -->
          <!-- section-heading -->
          <div class="section-heading text-right">
            <p class="title">تفاصيل مواصفات النطاق</p>
            <p class="subtitle">تم إختيار نطاق العمل التفصيلي وفقا لرغبة العميل</p>
          </div>
          <!-- section-heading -->
          <!-- specification-details-table -->
          <table class="specification-details-table">
            <thead>
              <tr>
                <th colspan="4" class="specifications text-right">مواصفات</th>
                <th colspan="3" class="detailed-scope text-right">نطاق العمل التفصيلي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colspan="4" class="text-right">المواصفات القياسية التالية لجميع الأعمال التي سيتم تنفيذها وفقاً لقواعد الممارسات القياسية التي يتم تنفيذها واستخدامها في سلطنة عمان. </th>
                <th rowspan="2" class="supply text-center">توريد وتركيب من قبل المقاول </th>
                <th rowspan="2" class="supply text-center">توريد و تركيب من قبل العميل </th>
                <th rowspan="2" class="supply text-center">التوريد من قبل العميل و التركيب من قبل المقاول</th>
              </tr>
              <tr>
                <th class="section-category text-right">فئة القسم</th>
                <th class="section-no text-center">القسم رقم</th>
                <th class="spec-description text-right">وصف</th>
                <th class="equivelant text-center">صنع أو مكافئ *</th>
              </tr>`
              for(let i=0;i<project_scope_table.rows.length;i++){ 


                console.log(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by);
                           
            
                            
            
                
                 
                //   var v=project_scope_table.rows[i].dataValues.section_category_maps.length;
                //   console.log(v);
                // console.log(project_scope_table.rows[i].dataValues.scope_description);
                //let v=1;
                //console.log(i--);
            
               
                
                //let v=project_scope_table.rows.length;
                //if(project_scope_table.rows[i].dataValues.section_category_maps.length>1){}
            
            
                let ver=project_scope_table.rows[i].dataValues.section_no;
                let new_var= Math.trunc( ver );;
                console.log(new_var);
                
               html+='<tr>'
               
              
                
                html+=` <td><rowspan="2" class="text-right" >${new_var}.${project_scope_table.rows[i].dataValues.section_scope_category.dataValues.name_arabic}</td>`
                
                
                
            
              
              
                //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
                
                var section_no_data = parseFloat(project_scope_table.rows[i].dataValues.section_no).toFixed(2)
               html+=`<td class="text-center">${section_no_data}</td>`
               
               html+=` <td class="text-right">${project_scope_table.rows[i].dataValues.description_arabic}</td>`
               if(project_scope_table.rows[i].dataValues.make_or_equivelant_arabic==null)
               {
                 html+=`<td class="text-center"></td>`
               }
               else
               {
                 html+=`<td class="text-center">${project_scope_table.rows[i].dataValues.make_or_equivelant_arabic}</td> `

               }
               
            
            if(project_scope_table.rows[i].dataValues.project_scope.dataValues.type==2){
                
            
                
              if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
                html+= ` <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
                html+= ` <td class="text-center"></td>
                <td class="custom-cell text-center"></td>
                <td class="text-center"></td>`
            
               }
              
              
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2){
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`
            
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){

                html+= `   <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){

                html+= `   <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }

               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){

                html+= `   <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`

               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){

                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
               }
               else{
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
            }
              
              else{
            
                
                if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
                  html+= ` <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
              
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
                  html+= ` <td class="text-center"></td>
                  <td class="default-cell text-center"></td>
                  <td class="text-center"></td>`
              
                 }
                
                
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2){
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="default-cell text-center"></td>`
              
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){
  
                  html+= `   <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){
  
                  html+= `   <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }


                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){
  
                  html+= `   <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="default-cell text-center"></td>`
  
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){
  
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else{
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
            
                 }
                }
              }
             
               
             
             html+=` 
             
            
             <tr>
                <td colspan="7" class="text-right">* جعل أو ما يعادلها : يجوز للمقاول أن يقترح شركات بديلة لتلك التي اقترحتها المواصفات على موافقة المهندس أو صاحب العمل. يُقترح مشاركة جميع أسماء موردي مواد المشروع مع صاحب العمل أو المهندس  </td>
              </tr>
            </tbody>
          </table>
          <!-- table -->
        </div>
        <!-- end of page 1 -->`




              




      //console.log(html)

      pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + req.query.project_id + '.pdf', function (err, resp) {
        res.send({ status: 200, message: 'fetched',  resp: global.constants.IMG_URL.project_scope_url + req.query.project_id + '.pdf' })
        if (err) return console.log(err);
        console.log(resp);
      })

      }
      else
      {

      var html = `<title>Project Scope English</title>
        <style>
          /* page setup */
          /*@page{
            size:A4 portrait;
            margin:1.5cm;
          }
          @page :first{
            margin:0cm;
          }*/
          /* common */
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#323130; /* rgb(50,49,48) */
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            position:relative;
            display:block;
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:25px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:120px;
          }
          /* page-heading */
          .page-heading{
            margin-bottom:25px;
            text-align:center;
          }
          .page-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .page-heading .title{
            margin-bottom:10px;
            text-transform:uppercase;
            font-weight:700;
            font-size:18px;
            color:#1a1a1a;
          }
          .page-heading .subtitle{
            margin-bottom:6px;
            font-weight:600;
            font-size:16px;
          }
          /* section-heading */
          .section-heading{
            margin-bottom:15px;
          }
          .section-heading.text-center{
            text-align:center;
          }
          .section-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .section-heading .title{
            margin-bottom:3px;
            font-weight:600;
            font-size:15px;
            color:#1a1a1a;
          }
          .section-heading .subtitle{
            margin-bottom:7px;
            font-weight:400;
            font-size:11px;
            color:#b7b7b8;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
          }
          .table tbody tr td:last-child{
            /*border-right:none;*/
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.text-center{
            text-align:center;
          }
          /* specification-details-table */
          .specification-details-table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:auto;
          }
          .specification-details-table thead tr th{
            padding:4px 10px 5px 10px;
            background-color:#f6f6f8;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
            color:#0047ba;
          }
          .specification-details-table thead tr th.text-left{
            text-align:left;
          }
          .specification-details-table thead tr th.task-no{
            width:50px;
          }
          .specification-details-table thead tr th.status,
          .specification-details-table thead tr th.type,
          .specification-details-table thead tr th.creator{
            width:80px;
          }
          .specification-details-table tbody tr th{
            padding:7px 7px 8px 7px;
            background-color:#f0f6ff;
            border:1px solid #e3e3e3;
            text-align:left;
            font-weight:400;
            font-size:6px;
            color:#0047ba;
          }
          .specification-details-table tbody tr th.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr th.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr th.description{
            width:100px;
          }
          .specification-details-table tbody tr th.supply{
            width:50px;
          }
          .specification-details-table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:6px;
          }
          .specification-details-table tbody tr td.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr td.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr td.default-cell{
            background-color:#f4ba00;
          }
          .specification-details-table tbody tr td.custom-cell{
            background-color:#02d94f;
            color:#fff;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>

        <!-- start of page 1 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
            </div>
          </header>
          <!-- page-header -->
          <!-- table -->
          <table class="table">
            <tbody>
              <tr>
                <td class="text-left"><strong>Name of Project:</strong> ${project_table.rows[0].dataValues.name}</td>
                <td class="text-left"><strong>Plot Area:</strong> ${project_table.rows[0].dataValues.plot_area}</td>
              </tr>
              <tr>
                <td class="text-left"><strong>Location of Project:</strong> ${project_table.rows[0].dataValues.project_location}</td>
                <td class="text-left"><strong>Built Up Area:</strong> ${project_table.rows[0].dataValues.built_up_area}</td>
              </tr>
              <tr>
                <td class="text-left"><strong>Project Use:</strong> ${project_table.rows[0].dataValues.project_use_type}</td>`
                if(req.userdetails.user_type == 3 && bid_table_fetch.rows.length>0){
                
                html+=`<td class="text-left"><strong>Land Serial No:</strong> ${project_table.rows[0].dataValues.land_serial_no}</td>`
                }
                else if(req.userdetails.user_type == 1){
                
                  html+=`<td class="text-left"><strong>Land Serial No:</strong> ${project_table.rows[0].dataValues.land_serial_no}</td>`
                  }
                  else if(req.userdetails.user_type == 2){
                
                    html+=`<td class="text-left"><strong>Land Serial No:</strong> ${project_table.rows[0].dataValues.land_serial_no}</td>`
                    }


                else{
                  html+=`<td class="text-left"><strong>Land Serial No:</strong> ---- </td>`
                }
              html+=`</tr>
            </tbody>
          </table>
          <!-- table -->
          <!-- section-heading -->
          <div class="section-heading text-center">
            <p class="title">Scope Specification Details</p>
            <p class="subtitle">Detailed Scope of Work as per Client requirements</p>
          </div>
          <!-- section-heading -->
          <!-- specification-details-table -->
          <table class="specification-details-table">
            <thead>
              <tr>
                <th colspan="4" class="specifications text-left">Specifications</th>
                <th colspan="3" class="detailed-scope text-left">Detailed Scope of work</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colspan="4" class="text-left">The following standard specifications of all the works that shall be carried out in accordance with the standard codes of practices that is implemented and used in the Sultanate of Oman</th>
                <th rowspan="2" class="supply text-center">Supply and Installation by Contractor</th>
                <th rowspan="2" class="supply text-center">Supply and Installation by Employer</th>
                <th rowspan="2" class="supply text-center">Supply by Employer and Installation by Contractor</th>
              </tr>
              <tr>
                <th class="section-category text-left">Section Category</th>
                <th class="section-no text-center">Section No.</th>
                 <th class="spec-description text-left">Description</th>
                <th class="equivelant text-center">Make or Equivelant*</th>
              </tr>`


           


             
              
          
            
            
              //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
              
            

              for(let i=0;i<project_scope_table.rows.length;i++){ 


                console.log(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by);
                           
            
                            
            
                
                 
                //   var v=project_scope_table.rows[i].dataValues.section_category_maps.length;
                //   console.log(v);
                // console.log(project_scope_table.rows[i].dataValues.scope_description);
                //let v=1;
                //console.log(i--);
            
               
                
                //let v=project_scope_table.rows.length;
                //if(project_scope_table.rows[i].dataValues.section_category_maps.length>1){}
            
            
                let ver=project_scope_table.rows[i].dataValues.section_no;
                let new_var= Math.trunc( ver );;
                console.log(new_var);
                
               html+='<tr>'
               
              
                
                html+=` <td><rowspan="2" class="text-left" >${new_var}.${project_scope_table.rows[i].dataValues.section_scope_category.dataValues.name}</td>`
                
                
                
            
              
              
                //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
                var section_no_data = parseFloat(project_scope_table.rows[i].dataValues.section_no).toFixed(2)

               
               
               html+=`<td class="text-center">${section_no_data}</td>`
                
               
               html+=` <td class="text-left">${project_scope_table.rows[i].dataValues.description}</td>`
               if(project_scope_table.rows[i].dataValues.make_or_equivelant==null)
               {
               html+= `<td class="text-center"></td> `
               }
               else
               {
               html+=` <td class="text-center">${project_scope_table.rows[i].dataValues.make_or_equivelant}</td> `
               }
            
            if(project_scope_table.rows[i].dataValues.project_scope.dataValues.type==2){
                
            
                
              if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
                html+= ` <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
                html+= ` <td class="text-center"></td>
                <td class="custom-cell text-center"></td>
                <td class="text-center"></td>`
            
               }
              
              
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2){
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`
            
               }
               
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){

                html+= `   <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){

                html+= `   <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }

               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){

                html+= `   <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`

               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){

                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
               }
               else{
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
            }
              
              else{
            
                
                if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
                  html+= ` <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
              
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
                  html+= ` <td class="text-center"></td>
                  <td class="default-cell text-center"></td>
                  <td class="text-center"></td>`
              
                 }
                
                
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2){
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="default-cell text-center"></td>`
              
                 }
                
                  else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){
  
                  html+= `   <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){
  
                  html+= `   <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }


                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){
  
                  html+= `   <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="default-cell text-center"></td>`
  
                 }
                 else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){
  
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else{
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
            
                 }
                }
              }
             
               
             
             html+=` 
             
            
             <tr>
                <td colspan="7" class="text-left">* Make or Equivelant: The Contractor may propose alternatrive companies to the one proposed by the specifications for the Engineer or Employers approval. It is suggested to share all project material supplier names with the Employer or Engineer .</td>
              </tr>
            </tbody>
          </table>
          <!-- table -->
        </div>
        <!-- end of page 1 -->`




              




      //console.log(html)

      pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + req.query.project_id + '.pdf', function (err, resp) {
        res.send({ status: 200, message: 'fetched',  resp: global.constants.IMG_URL.project_scope_url + req.query.project_id + '.pdf' })
        if (err) return console.log(err);
        console.log(resp);
      })

    }
      //res.send({status:201,message:'fetched',data:custom_table,resp:resp})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}


// ProjectController.projectScopePdf = (req, res) => {



//   (async () => {

//     try {

//       let scope = {};
//       scope.table = 'project_scopes',
//         scope.where = {};
//       scope.where.project_id = req.query.project_id,
//         scope.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
//       let scope_table = await ConsultationhubRepository.staticScopeDetails(scope);


//       let scope_group = {};
//       scope_group.table = 'project_scopes',
//         scope_group.where = {};
//       scope_group.where.project_id = req.query.project_id,
//         scope_group.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
//       let scope_table_fetch = await ConsultationhubRepository.staticScopeDetails(scope_group);

//       let scope_data = {};
//       scope_data.table = 'project_scopes',
//         scope_data.where = {};
//       scope_data.where.project_id = req.query.project_id,
//         scope_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
//       let scope_data_fetch = await ConsultationhubRepository.staticScopeDetails(scope_data);


//       let custom = {};
//       custom.table = 'project_scopes',
//         custom.where = {};

//       custom.where.project_id = req.query.project_id,
//         custom.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
//       let custom_table = await ConsultationhubRepository.scopeDetails(custom);


//       let custom_data = {};
//       custom_data.table = 'project_scopes',
//         custom_data.where = {};
//       custom_data.where.project_id = req.query.project_id,
//         custom_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
//       let custom_table_fetch = await ConsultationhubRepository.scopeDetails(custom_data);


//       let custom_value = {};
//       custom_value.table = 'project_scopes',
//         custom_value.where = {};
//         custom_value.project_id = req.query.project_id,
//         custom_value.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
//       let custom_value_fetch = await ConsultationhubRepository.scopeDetails(custom_value);


//       let project_value={};
//       project_value.table='projects',
//       project_value.where={
//         id:req.query.project_id,

//       };
//       let project_table=await GenericRepository.fetchData(project_value)

//       console.log(project_table.rows[0].dataValues.name)












//       var fs = require('fs');
//       var pdf = require('html-pdf');
//       var options = {
//         format: 'A4', "border": {
//           "top": "1.5cm",            // default is 0, units: mm, cm, in, px
//           "right": "1.5cm",
//           "bottom": "1.5cm",
//           "left": "1.5cm"
//         }
//       };

//       var html = `<!doctype html>
//         <html xmlns:v="urn:schemas-microsoft-com:vml">
//            <head>
//               <meta charset="utf-8">
//               <meta http-equiv="X-UA-Compatible" content="IE=edge">
//               <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
//               <title>EBinaa</title>
//            </head>
        
//         <style type="text/css">
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-Medium.eot');
//             src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
//             font-weight:500;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-SemiBold.eot');
//             src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
//             font-weight:600;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         @font-face{
//             font-family:'Artegra Sans Alt';
//             src:url('fonts/ArtegraSansAlt-Bold.eot');
//             src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
//                 url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
//                 url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
//             font-weight:700;
//             font-style:normal;
//             font-display:swap;
//         }
        
//         body { 
//             font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
//             background-color: #ffffff;
//             padding: 0;
//             margin: 0;
//             font-size: 13px;
//             line-height: 1.5;
//             font-weight: normal;
//         }
//         * { 
//             padding: 0; 
//             margin: 0;
//         }
//         .container {
//             width: 82%;
//             margin: 0 auto;
//             padding-right: 9%;
//             padding-left: 9%;
//         }
//         .site-logo { 
//             padding: 40px 0;
//         }
//         .site-logo img{ 
//             max-width:100px;
//         }
//         table { 
//             width: 100%;
//         }
//         table, table tr, table td, table th { 
//             padding: 0;
//         }
//         .img-responsive { 
//             max-width: 100%;
//             width: 100%;
//             height: auto;
//             display: block;
//         }
//         .text-center { 
//             text-align: center;
//         }
//         .text-left {
//             text-align: left;
//         }
//         .text-right{
//             text-align: right;
//         }
//         .copy-txt {   
//             font-size: 12px;
//             line-height: 18px;
//             font-weight: 500;
//             text-align: center;
//             color: #969696;
//             padding: 30px 0;
//             margin: 0;
//         }
//         h1 {
//             font-size: 17px;
//             font-weight: 600;
//             line-height: 0.85;
//             color: #000000;  
//             padding: 0;
//             margin: 0 0 25px 0;
//         }
//         p {
//             font-size: 14px;
//             font-weight: 500;
//             line-height: 1.29;
//             color: #000000;
//             padding: 0;
//             margin: 0 0 20px 0;
//         }
//         .blue-color { 
//             color: #004e98; 
//         }
//         .table2 {
//             border: 1px solid #e5e5e5;
//             margin: 0 auto;
//             border-radius: 2px;
//             margin-bottom: 30px;
//         }
//         .table2 th, .table2 td {
//             padding: 5px 10px;
//         }
//         .table2 thead th {
//             background-color: #f6f6f8;
//             font-size: 15px;
//             font-weight: 500;
//             line-height: 1;
//             color: #0047ba;
//         }
//         .table2 thead .thead-tb-inner th, .table2 tbody .tbody-tb-inner td { text-align: center; }
//         .table2 h3 { font-size: 15px; line-height: 1.5; }
//         .table2 h4 { font-size: 14px; line-height: 1.5; }
//         .table2 h5 { font-size: 13px; line-height: 1.5; }
//         .bl-1 { border-left: 1px solid #e6e6e8; }
//         .br-1 { border-right: 1px solid #e6e6e8; }
//         .bt-1 { border-top: 1px solid #e6e6e8; }
//         .bb-1 { border-bottom: 1px solid #e6e6e8; }
//         .b-0 { border: 0;}
//         .p-0, .table2 .p-0 { padding: 0;}
//         .pb-0, .contractor-tbl td.pb-0, .table3 td.pb-0 { padding-bottom: 0;}
//         .table2 thead th.rp-lr { padding-left: 0; padding-right: 0; }
//         .table2 tbody td {
//             font-size: 15px;
//             line-height: 1.6;
//             padding:  15px 10px;
//         }
//         .mb-30 {margin-bottom: 30px;}
//         .contractor-tbl td { padding-top: 20px; padding-bottom: 30px;}

//         .contractor-tbl h1 { font-size: 20px; line-height: 1; color: #004e98; font-weight: 600; margin: 0 0 15px 0; }
//         .contractor-tbl h2 { font-size: 18px; line-height: 1.22; color: #004e98; font-weight: normal; margin: 0 0 10px 0;}
//         .contractor-tbl p { font-size: 16px; line-height: 1.5; color: #000000; font-weight: normal; margin: 0 0 10px 0; }
//         .project-price-tbl { margin-bottom: 30px;}
//         .project-price-tbl td {
//             border: 1px solid #e6e6e8;
//             padding: 20px 20px;
//         }
//         .project-price-tbl td.custom-td { border: 0; padding: 20px 5px; }
//         .project-price-tbl p {
//             font-size: 14px;
//             font-weight: 500;
//             line-height: 1;
//             color: #b7b7b8;
//             margin-bottom: 15px;
//         }
//         .project-price-tbl h6 {
//             font-size: 17px;
//             font-weight: 500;
//             line-height: 0.82;
//             color: #000000;
//         }
//         .pl-10 { padding-left: 10px;}
//         .pr-10 { padding-right: 10px;}
//         .mb-0 { margin-bottom: 0;}
//         .table3 {
//             margin: 0 0 30px 0;
//             table-layout: fixed;
//         }
//         .table3 td {
//             padding: 20px 10px; 
//             vertical-align: text-top;
//             position: relative;
//         }
//         .table3 thead h4 {
//             font-size: 17px;
//             line-height: 1.1;
//             font-weight: normal;
//             color: #004e98;
//             text-align: left;
//             margin: 0 0 10px 0;
//         }
//         .table3 thead p {
//         font-size: 12px;
//         font-weight: normal;
//         line-height: 1.22;
//         color: #b7b7b8;
//         text-align: left;
//         margin: 0 0 15px 0;
//         }
//         .table3 tbody h3 {
//             font-size: 13px;
//             font-weight: 600;
//             line-height: 1.33;
//             color: #000000;
//             margin: 0;
//             text-align: center;
//         }
//         ul.supply-list { margin: 0 auto;}
//         ul.supply-list li {
//             padding: 6px 10px 6px 23px;
//             margin: 0;
//             list-style-type: none;
//             font-size: 11px;
//             line-height: 1.43;
//             color: #444445;
//             font-weight: normal;
//             background: url("`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/general_images/green-check.svg" ) left top no-repeat;
//             background-position: top 9px left 0;
//         }
//          .h-line:after { content: ""; width: 80%; height: 2px; border-bottom:1px solid #e6e6e8; padding: 0 0 10px 0; margin: 0 auto; display: table; /*position: absolute; bottom: 0; left: 10%; right: 10%;*/ } 
//         .v-line:after { content: ""; width: 2px; height: 80%; background: url(images/v-line.png) right center no-repeat; background-size: 100%; padding: 0; margin: 0; display: table; position: absolute; right: 0; top: 0; bottom: 0; }
        
//         </style>
        
        
        
        
        
        
        
//         <body>
//         <div class="container">
        
//             <table class="table1" width="100" border="0" cellpadding="0" cellspacing="0">
                
//                 <tr>
//                     <td class="text-center site-logo"><img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/general_images/eb-logo.svg" class="" alt="logo"></td>
//                 </tr>

//                 <tr>
//                     <td>
//                         <h1>Annex 2 Project Scope</h1>
//                     </td>
//                 </tr>

//                 <tr>
//                     <td>
//                         <table class="table3" style="margin-bottom:20px" width="100" border="0" cellpadding="0" cellspacing="0">
//                           <thead>
//                             <tr>
//                               <th colspan="2">
//                                 <h4 style="margin-bottom:15px; padding-bottom:8px; border-bottom:1px solid #d6d6d6">General Information</h4>
//                               </th>
//                             </tr>
//                           </thead>
//                           <thead>
//                             <tr style="vertical-align:top">
//                               <th style="padding-right:20px;">
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Name of Project:</strong> ${project_table.rows[0].dataValues.name}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Location of Project:</strong> ${project_table.rows[0].dataValues.project_location}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Project Use:</strong> ${project_table.rows[0].dataValues.project_use_type}</p>
//                               </th>
//                               <th>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Plot Area:</strong> ${project_table.rows[0].dataValues.plot_area}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Built Up Area:</strong> ${project_table.rows[0].dataValues.built_up_area}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Land Serial No:</strong> 000-000-000-000</p>
//                               </th>
//                             </tr>
//                           </thead>
//                         </table>
//                         <table class="table3" style="margin-bottom:20px" width="100" border="0" cellpadding="0" cellspacing="0">
//                           <thead>
//                             <tr>
//                               <th colspan="2">
//                                 <h4 style="margin-bottom:15px; padding-bottom:8px; border-bottom:1px solid #d6d6d6">Project Information</h4>
//                               </th>
//                             </tr>
//                           </thead>
//                           <thead>
//                             <tr style="vertical-align:top">
//                               <th style="padding-right:20px;">
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Basement:</strong> ${project_table.rows[0].dataValues.basement}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Leveling Floor:</strong> ${project_table.rows[0].dataValues.levelling_floor}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Ground Floor:</strong> ${project_table.rows[0].dataValues.gound_floor}</p>
//                               </th>
//                               <th>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Additional Floors:</strong> ${project_table.rows[0].dataValues.additional_floors}</p>
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Penthouse Floor:</strong> ${project_table.rows[0].dataValues.pent_floor}</p>
//                               </th>
//                             </tr>
//                             <tr>
//                               <th colspan="2">
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Any Special Request:</strong> Rooftop garden</p>
//                               </th>
//                             </tr>
//                           </thead>
//                         </table>
//                         <table class="table3" style="margin-bottom:40px" width="100" border="0" cellpadding="0" cellspacing="0">
//                           <thead>
//                             <tr>
//                               <th colspan="2">
//                                 <h4 style="margin-bottom:15px; padding-bottom:8px; border-bottom:1px solid #d6d6d6">Owner Information</h4>
//                               </th>
//                             </tr>
//                           </thead>
//                           <thead>
//                             <tr style="vertical-align:top">
//                               <th colspan="2">
//                                 <p style="margin-bottom:8px"><strong style="font-weight:400; color:#000">Owner national ID:</strong> 0000-0000-0000-0000</p>
//                               </th>
//                             </tr>
//                           </thead>
//                         </table>
//                     </td>
//                 </tr>
                
//                 <tr>
//                     <td>
//                         <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
//                             <thead>
//                                 <tr>
//                                     <th colspan="3">
//                                         <h4>Default Scope</h4>
//                                         <p>This Scope is default in the contract </p>
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                             <tr>
//                                 <td width="20%" class="pb-0 h-line">
//                                     <h3>Supply and Install by Contractor <br> &nbsp; </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                                 <td width="20%" class="pb-0 h-line">
//                                     <h3>Supply and Install by Client <br> &nbsp; </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                                 <td class="pb-0 h-line">
//                                     <h3>Supplied by client and Installed by Contractor </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                             </tr>
//                             </tr>`


//       html += ` 
//                             <tr>
                            
//                                 <td class="v-line">
//                                     <ul class="supply-list">`
//       for (index in scope_table.rows) {


//         html += `<li>${scope_table.rows[index].dataValues.project_scope.scope_description} </li>`
//       }

//       html += '</ul></td>'
//       html += ` 
//                                        <td class="v-line">
//                                           <ul class="supply-list">`
//       for (index in scope_table_fetch.rows) {
//         html += `<li>${scope_table_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

//       }
//       html += '</ul></td>'
//       html += ` 
//                                           <td class="v-line">
//                                              <ul class="supply-list">`
//       for (index in scope_data_fetch.rows) {
//         html += `<li>${scope_data_fetch.rows[index].dataValues.project_scope.scope_description} </li>`


//       }
//       html += '</ul></td>'








//       html +=
//         `</tr>                      
//                             </tbody>
//                             </table> 
//                         </td>
//                     </tr> `

//       html += ` <tr>
//                     <td>
//                         <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
//                             <thead>
//                                 <tr>
//                                     <th colspan="3">
//                                         <h4>Custom Scope</h4>
//                                         <p>This Scope is customized and chosen by the client </p>
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                             <tr>
//                                 <td width="33.333333%" class="pb-0 h-line">
//                                     <h3>Supply and Install by Contractor <br> &nbsp; </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                                 <td width="33.333333%" class="pb-0 h-line">
//                                     <h3>Supply and Install by Client <br> &nbsp; </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                                 <td class="pb-0 h-line">
//                                     <h3>Supplied by client and Installed by Contractor </h3>
//                                     <!-- <span class="h-line"></span> -->
//                                 </td>
//                             </tr>`

//       html += ` <tr>
                            
//                             <td class="v-line">
//                                 <ul class="supply-list">`

//       for (index in custom_table.rows) {
//         console.log(custom_table.rows[index].dataValues.project_scope.scope_description)

//         html += `<li>${custom_table.rows[index].dataValues.project_scope.scope_description} </li>`

//       }
//       html += '</ul></td>'
//       html += `<td class="v-line">
//                                     <ul class="supply-list">`
//       for (index in custom_table_fetch.rows) {

//         html += `<li>${custom_table_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

//       }
//       html += '</ul></td>'
//       html += `<td class="v-line">
//                                     <ul class="supply-list">`

//       for (index in custom_value_fetch.rows) {

//         html += `<li>${custom_value_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

//       }
//       html += '</ul></td>'








//       html +=
//         `</tr>                      
//                                     </tbody>
//                                     </table> 
//                                 </td>
//                             </tr> 
//                             <tr>
//                             <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
//                         </tr>
//                     </table>
                
                
                
                
                
                
                
                
                
//                 </div>
//                 </body>`




//       //console.log(html)

//       pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + req.query.project_id + '.pdf', function (err, resp) {
//         res.send({ status: 200, message: 'fetched', data: scope_table, resp: global.constants.IMG_URL.project_scope_url + req.query.project_id + '.pdf' })
//         if (err) return console.log(err);
//         console.log(resp);
//       })


//       //res.send({status:201,message:'fetched',data:custom_table,resp:resp})
//     } catch (err) {
//       console.trace(err)

//       res.send({ status: 500, err: err });

//     }


//   })()



// }




















/**payment-pdf API
method:GET
input:query[project_id]
output:data,
purpose:To download mode of payment pdf.
created by-sayanti Nath
*/
ProjectController.modeOfPayment = (req, res) => {


  (async () => {

    try {
      console.log('*********************88')


      let data = {};
      data.where = {};
      data.where.project_id = req.query.project_id;
      data.where.status = 1;
      let payment = await ConsultationhubRepository.modePayment(data);
      var v=1;

      var i = 1;

      let data_deafult= {};
      data_deafult.where = {};
      data_deafult.where.project_id = req.query.project_id;
      data_deafult.where.status = 1;
      var payment_default= await ConsultationhubRepository.modePayment_default_primary(data_deafult);

      let data_defult_payment={};
      data_defult_payment.where={project_id : req.query.project_id};
      data_defult_payment.where.status = 1;
      var payment_default_primary=await ConsultationhubRepository.modePayment_default(data_defult_payment);



      



      let project_contracts_fetch={};

      project_contracts_fetch.where={project_id:req.query.project_id};


      let order_for=[['id','DESC']]
      
      let project_contracts_fetch_table=await ConsultationhubRepository.project_contract_fetch(project_contracts_fetch,order_for);

      let project_contracts_fetch_deafult={};
      project_contracts_fetch_deafult.where={project_id:req.query.project_id};


       order_for=[['version_no','DESC']]
      
      var  project_contracts_fetch_table_deafult=await ConsultationhubRepository.project_contract_fetch_defult(project_contracts_fetch_deafult,order_for);


      let project_contracts_fetch_deafult_maintain={};
      project_contracts_fetch_deafult_maintain.where={project_id:req.query.project_id};


       order_for=[['version_no','DESC']]
      
      var  project_contracts_fetch_table_deafult_maintain=await ConsultationhubRepository.project_contract_fetch_defult_maintain(project_contracts_fetch_deafult,order_for);


      console.log(project_contracts_fetch_table.rows[0].dataValues.price);

      var fs = require('fs');
      var pdf = require('html-pdf');
      var options = {
        format: 'A4', "border": {
          "top": "1.5cm",            // default is 0, units: mm, cm, in, px
          "right": "1.5cm",
          "bottom": "1.5cm",
          "left": "1.5cm"
        },
        "footer": {
          "height": "10px",
          "contents": {
            // Any page number is working. 1-based index
            default: '<span style="float:right; font-size:8px;">{{page}} / {{pages}}</span>',
            // fallback value
          }
        },
      
      };

      var html = `<title>Mode Of Payment</title>
        <style>
          /* page setup */
          /*@page{
            size:A4 portrait;
            margin:1.5cm;
          }
          @page :first{
            margin:0cm;
          }*/
          /* common */
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#1a1a1a;
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            position:relative;
            display:block;
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:25px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:120px;
          }
          /* page-heading */
          .page-heading{
            margin-bottom:20px;
            text-align:center;
          }
          .page-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .page-heading .title{
            margin-bottom:10px;
            text-transform:uppercase;
            font-weight:700;
            font-size:18px;
            color:#1a1a1a;
          }
          .page-heading .subtitle{
            margin-bottom:6px;
            font-weight:600;
            font-size:16px;
          }
          .page-heading .description{
            margin-bottom:15px;
            font-weight:400;
            font-size:14px;
          }
          /* section-heading */
          .section-heading{
            margin-bottom:15px;
          }
          .section-heading.text-center{
            text-align:center;
          }
          .section-heading > *:last-child{
            margin-bottom:0 !important;
          }
          .section-heading .title{
            margin-bottom:3px;
            font-weight:600;
            font-size:15px;
            color:#1a1a1a;
          }
          .section-heading .subtitle{
            margin-bottom:7px;
            font-weight:400;
            font-size:11px;
            color:#b7b7b8;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:9px;
            color:#b7b7b8;
          }
          .table tbody tr td:last-child{
            border-right:none;
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.text-center{
            text-align:center;
          }
          .table tbody tr td strong{
            font-weight:400;
            font-size:12px;
            color:#1a1a1a;
          }
          /* specification-details-table */
          .specification-details-table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:auto;
          }
          .specification-details-table thead tr th{
            padding:4px 10px 5px 10px;
            background-color:#f6f6f8;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:8px;
            color:#0047ba;
          }
          .specification-details-table thead tr th:last-child{
            border-right:none;
          }
          .specification-details-table thead tr th.text-left{
            text-align:left;
          }
          .specification-details-table thead tr th.stage-no{
            width:50px;
          }
          .specification-details-table thead tr th.percentage,
          .specification-details-table thead tr th.omr,
          .specification-details-table thead tr th.time{
            width:80px;
          }
          .specification-details-table tbody tr th{
            padding:7px 7px 8px 7px;
            background-color:#f0f6ff;
            border-top:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:left;
            font-weight:400;
            font-size:6px;
            color:#0047ba;
          }
          .specification-details-table tbody tr th.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr th.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr th.description{
            width:100px;
          }
          .specification-details-table tbody tr th.supply{
            width:50px;
          }
          .specification-details-table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            text-align:center;
            font-weight:400;
            font-size:6px;
            page-break-inside:avoid;
          }
          .specification-details-table tbody tr td:last-child{
            border-right:none;
          }
          .specification-details-table tbody tr td.text-left{
            text-align:left;
          }
          .specification-details-table tbody tr td.text-center{
            text-align:center;
          }
          .specification-details-table tbody tr td.default-cell{
            background-color:#f4ba00;
          }
          .specification-details-table tbody tr td.custom-cell{
            background-color:#02d94f;
            color:#fff;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>

        <!-- start of page 1 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
            <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </header>
          <!-- page-header -->
          <!-- page-heading -->
          <div class="page-heading">
            <h1 class="title">Mode Of Payment</h1>
            <h3 class="description">Both ACV and RCV shall be reflected in this schedule, as applicable.</h3>
          </div>
          <!-- page-heading -->
          <!-- table -->
          <table class="table">
            <tbody>
              <tr>
                <td class="text-left">
                  Project Price <br>`
                  if(project_contracts_fetch_table.rows.length>0){
                  html += '<strong>' + project_contracts_fetch_table.rows[0].dataValues.price + ' OMR</strong>'
                html += '</td>'         
                html += '<td class="text-left">'
                  html += 'Time of Project <br>'               
                  // console.log(payment.rows[index].dataValues.price)
                  html += '<strong>' + project_contracts_fetch_table.rows[0].dataValues.days + ' Days</strong>'
                  html += '</td>'
                  html += '</tr>'
                  html += '</tbody>'
                  html += '</table>'
                  html += '<!-- table -->'
                  html += '<!-- specification-details-table -->'
                  html += '<table class="specification-details-table">'
                  html += '<thead>'
                  html += '<tr>'
                  html += '<th rowspan="2" class="stage-no text-center">Stage No.</th>'
                  html += '<th rowspan="2" class="description text-left">Stage Name</th>'
                  html += '<th colspan="2" class="text-center">Value of Stages</th>'
                  html += '<th rowspan="2" class="time text-center">Time of Stage</th>'
                  html += '</tr>'
                  html += '<tr>'
                  html += '<th class="percentage text-center">Percentage</th>'
                  html += '<th class="omr text-center">OMR</th>'
                  html += '</tr>'
                  html += '</thead>'
                  html += '<tbody>'

        for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){
          html += `<tr><td class="text-center">` + 0 + `.</td><td class="text-left">`+project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.project_stage.name +`</td><td class="text-center">` +project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="text-center">` + project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_amount + `</td><td class="text-center">` + project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days + ` Days</td></tr>`
        }

        for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
          console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.id);
          //console.log(project_contracts_fetch_table.rows[0].project_contract_stages[i].project_stages.dataValues.length)
          // for(let j=0;j<project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stages.length;j++){
          html += `<tr><td class="text-center">` + v + `.</td><td class="text-left">`+project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.name +`</td><td class="text-center">` +project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="text-center">` + project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_amount + `</td><td class="text-center">` + project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days + ` Days</td></tr>`          
        v++;
          // }
        }
                        
        for(let i = 0; i < project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages.length; i++){
          html += `<tr><td class="text-center"></td><td class="text-left">`+project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.project_stage.name +`</td><td class="text-center">` +project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="text-center">` + project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_amount + `</td><td class="text-center">` + project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days + ` Days</td></tr>`
        }

    }

                              
else{

      for (payments of payment) {
          // console.log(payment.rows[index].dataValues.price)
          html += '<strong>' + payments.dataValues.price + ' OMR</strong>'
      }
      html += '</td>'
      html += '<td class="text-left">'
      html += 'Time of Project <br>'
      for (payments of payment) {
          // console.log(payment.rows[index].dataValues.price)
          html += '<strong>' + payments.dataValues.days + ' Days</strong>'
      }
      html += '</td>'
      html += '</tr>'
      html += '</tbody>'
      html += '</table>'
      html += '<!-- table -->'
      html += '<!-- specification-details-table -->'
      html += '<table class="specification-details-table">'
      html += '<thead>'
      html += '<tr>'
      html += '<th rowspan="2" class="stage-no text-center">Stage No.</th>'
      html += '<th rowspan="2" class="description text-left">Stage Name</th>'
      html += '<th colspan="2" class="text-center">Value of Stages</th>'
      html += '<th rowspan="2" class="time text-center">Time of Stage</th>'
      html += '</tr>'
      html += '<tr>'
      html += '<th class="percentage text-center">Percentage</th>'
      html += '<th class="omr text-center">OMR</th>'
      html += '</tr>'
      html += '</thead>'
      html += '<tbody>'

      //  for(let i = 1; i <=	payment.rows[0].dataValues.project_stage_estimates.length; i++)
      console.log("hello")



      for(payment_defaults of payment_default){
            for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

              html += `<tr><td class="text-center">` + 0 + `.</td><td class="text-left">` + stage_estimates_defaults.project_stage.dataValues.name + `</td><td class="text-center">` + stage_estimates_defaults.dataValues.price_percentage + `%</td><td class="text-center">` + stage_estimates_defaults.dataValues.price_amount + `</td><td class="text-center">` + stage_estimates_defaults.dataValues.days + ` Days</td></tr>`

            }
          }


          for (payments of payment) {
            for (stage_estimates of payments.project_stage_estimates) {
              console.log(payments.dataValues.id)
              // console.log(stage_estimates.project_stage.dataValues.id)
    
              //console.log(payment.rows[index].dataValues.price)
              //let i=1;

             
    
    
              html += `<tr><td class="text-center">` + i + `.</td><td class="text-left">` + stage_estimates.project_stage.dataValues.name + `</td><td class="text-center">` + stage_estimates.dataValues.price_percentage + `%</td><td class="text-center">` + stage_estimates.dataValues.price_amount + `</td><td class="text-center">` + stage_estimates.dataValues.days + ` Days</td></tr>`

            
              i++;
             
    
            }
    
          }


          for(payment_default_primarys of payment_default_primary){
            for (stage_estimates_primary of payment_default_primarys.project_stage_estimates){

              html += `<tr><td class="text-center"></td><td class="text-left">` + stage_estimates_primary.project_stage.dataValues.name + `</td><td class="text-center">` + stage_estimates_primary.dataValues.price_percentage + `%</td><td class="text-center">` + stage_estimates_primary.dataValues.price_amount + `</td><td class="text-center">` + stage_estimates_primary.dataValues.days + ` Days</td></tr>`

            }

          }


        
           
    }

    html += '</tbody>'
    html += '</table>'
    html += '<!-- specification-details-table -->'
    html += '</div>'
    html += '<!-- end of page 1 -->'



      pdf.create(html, options).toFile(global.constants.uploads.mode_of_payment_pdf + req.query.project_id + '.pdf', function (err, resp) {

        res.send({ status: 201, message: 'fetched', resp: global.constants.IMG_URL.payment_url + req.query.project_id + '.pdf' })

        if (err) return console.log(err);
        console.log(resp);
      })




    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}

/**downloadProjectContractPdf API
method:GET
input:body[id], headers[x-access-token]
purpose:To download project contract PDF.
created by:Arijit Saha
*/
/**
     * To download project contract PDF with respect to `id` and `x-access-token`
     * @param {Number} `id` 
     * @param {String} `x-access-token` 
     * @return {data} result
*/
ProjectController.downloadProjectContractPdf = function (req, res) {
  (async () => {
    try {
      let pdf_name = await commonFunnction.getRandomString(5);
      let get_project_details = await new Promise(function (resolve, reject) {
        let get_project_details;
        let project_where = {};
        project_where.id = parseInt(req.query.id);
        project_where.status = 5;
        project_where.is_active = 1;
        project_where.is_delete = 0;
        ProjectRepository.fetchProjectWithBidDetails(project_where).then(project_result => {
          if (project_result.rows.length > 0) {
            get_project_details = project_result;
            resolve(get_project_details);

          }
          else {
            return res.send({ status: 404, message: 'No details found.' })
          }
        })
      })
      // return res.send({data:get_project_details.rows[0].dataValues})

      let client_id = get_project_details.rows[0].dataValues.project_client_details.dataValues.id;
      let contract_made_date = moment(get_project_details.rows[0].dataValues.project_bids[0].dataValues.updatedAt).utc().format('Do MMM YYYY');
      // console.log(moment(get_project_details.rows[0].dataValues.project_bids[0].dataValues.updatedAt).utc().format('Do MMM YYYY'))
      // console.log('********** client_name **********', get_project_details.rows[0].dataValues.project_bids[0].contractor_details.full_name);
      // return;
      let html = await new Promise(function (resolve, reject) {
        let html = `<!doctype html>
        <html xmlns:v="urn:schemas-microsoft-com:vml">
           <head>
              <meta charset="utf-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
              <title><span style="color:rgb(50,49,48);">‘eBinaa’</span></title>
           </head>
        
        <style type="text/css">
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Medium.eot');
            src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
            font-weight:500;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-SemiBold.eot');
            src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
            font-weight:600;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Bold.eot');
            src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
            font-weight:700;
            font-style:normal;
            font-display:swap;
        }
        
        body { 
            font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
            background-color: #ffffff;
            padding: 0;
            margin: 0;
            font-size: 13px;
            line-height: 1.5;
            font-weight: normal;
        }
        * { 
            padding: 0; 
            margin: 0;
        }
        .container {
          width: 100%;
          margin: 0 auto;
          // padding-right: 9%;
          // padding-left: 9%;
          padding: 0;
      }
        .site-logo { 
            padding: 40px 0;
        }
        table { 
            width: 100%;
        }
        table, table tr, table td, table th { 
            padding: 0;
        }
        .img-responsive { 
            max-width: 100%;
            width: 100%;
            height: auto;
            display: block;
        }
        .text-center { 
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
        .text-right{
            text-align: right;
        }
        .copy-txt {   
            font-size: 11px;
            line-height: 18px;
            font-weight: 500;
            text-align: center;
            color: #969696;
            padding: 30px 0;
            margin: 0;
        }
        h1 {
            font-size: 26px;
            font-weight: 600;
            line-height: 0.85;
            color: #000000;  
            padding: 0;
            margin: 0 0 20px 0;
        }
        p {
            font-size: 17px;
            font-weight: 500;
            line-height: 1.29;
            color: #000000;
            padding: 0;
            margin: 0 0 20px 0;
        }
        .blue-color { 
            color: #004e98; 
        }
        .table2 {
            border: 1px solid #e5e5e5;
            margin: 0 auto;
            border-radius: 2px;
            margin-bottom: 30px;
        }
        .table2 th, .table2 td {
            padding: 5px 10px;
        }
        .table2 thead th {
            background-color: #f6f6f8;
            font-size: 15px;
            font-weight: 500;
            line-height: 1;
            color: #0047ba;
        }
        .table2 thead .thead-tb-inner th, .table2 tbody .tbody-tb-inner td { text-align: center; }
        .table2 h3 { font-size: 15px; line-height: 1.5; }
        .table2 h4 { font-size: 14px; line-height: 1.5; }
        .table2 h5 { font-size: 13px; line-height: 1.5; }
        .bl-1 { border-left: 1px solid #e6e6e8; }
        .br-1 { border-right: 1px solid #e6e6e8; }
        .bt-1 { border-top: 1px solid #e6e6e8; }
        .bb-1 { border-bottom: 1px solid #e6e6e8; }
        .b-0 { border: 0;}
        .p-0, .table2 .p-0 { padding: 0;}
        .pb-0, .contractor-tbl td.pb-0, .table3 td.pb-0 { padding-bottom: 0;}
        .table2 thead th.rp-lr { padding-left: 0; padding-right: 0; }
        .table2 tbody td {
            font-size: 15px;
            line-height: 1.6;
            padding:  15px 10px;
        }
        .mb-30 {margin-bottom: 30px;}
        .contractor-tbl td { padding-top: 20px; padding-bottom: 30px;}
        
        .contractor-tbl h1 { font-size: 20px; line-height: 1; color: #004e98; font-weight: 600; margin: 0 0 15px 0; }
        .contractor-tbl h2 { font-size: 18px; line-height: 1.22; color: #004e98; font-weight: normal; margin: 0 0 10px 0;}
        .contractor-tbl p { font-size: 16px; line-height: 1.5; color: #000000; font-weight: normal; margin: 0 0 10px 0; }
        .project-price-tbl { margin-bottom: 30px;}
        .project-price-tbl td {
            border: 1px solid #e6e6e8;
            padding: 20px 20px;
        }
        .project-price-tbl td.custom-td { border: 0; padding: 20px 5px; }
        .project-price-tbl p {
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            color: #b7b7b8;
            margin-bottom: 15px;
        }
        .project-price-tbl h6 {
            font-size: 17px;
            font-weight: 500;
            line-height: 0.82;
            color: #000000;
        }
        .pl-10 { padding-left: 10px;}
        .pr-10 { padding-right: 10px;}
        .mb-0 { margin-bottom: 0;}
        .table3 {
            margin: 0 0 30px 0;
        }
        .table3 td {
            padding: 20px 40px; 
            /* border: 1px solid #ccc;  */
            vertical-align: text-top;
            position: relative;
        }
        .table3 thead h4 {
            font-size: 20px;
            line-height: 1.1;
            font-weight: normal;
            color: #004e98;
            text-align: left;
            margin: 0 0 10px 0;
        }
        .table3 thead p {
        font-size: 18px;
        font-weight: normal;
        line-height: 1.22;
        color: #b7b7b8;
        text-align: left;
        margin: 0 0 15px 0;
        }
        .table3 tbody h3 {
            font-size: 18px;
            font-weight: 600;
            line-height: 1.33;
            color: #000000;
            margin: 0;
            text-align: center;
        }
        ul.supply-list { margin: 0 auto;}
        ul.supply-list li {
            padding: 10px 10px 10px 30px;
            margin: 0;
            list-style-type: none;
            font-size: 14px;
            line-height: 1.43;
            color: #444445;
            font-weight: normal;
            background: url(images/green-check.svg) left top no-repeat;
            background-position: top 12px left 0;
        }
         .h-line:after { content: ""; width: 80%; height: 2px; border-bottom:1px solid #e6e6e8; padding: 0 0 30px 0; margin: 0 auto; display: table; } 
        .v-line:after { content: ""; width: 2px; height: 80%; background: url(images/v-line.png) right center no-repeat; background-size: 100%; padding: 0; margin: 0; display: table; position: absolute; right: 0; top: 0; bottom: 0; }
        .cms-table.cms-table2 {
           margin-top: 20px;  
        }
        .cms-table td {
            padding: 15px 30px;
        }
        .cms-table td h1 {
            margin: 0;   
        }
        .cms-table td p {
            line-height: 1.5;
            margin: 0;
        }
        .cms-table .d-color {
            color: #000;
        }
        .cms-table2 td h2 {
            margin: 0 0 15px 0;
        }
        .cms-table2 td p {
            line-height: 1.5;
            margin: 0 0 15px 0;
        }
        .sub1, .cms-table td .sub1 { padding-left: 20px;}
        .signature, .cms-table2 .signature {
             width: 80%;
             border-top: 1px dotted #444445;
             padding: 5px 0;
             margin: 50px auto 10px  auto;
        }
        </style>
        <body>
        <div class="container">
        
        
            <table class="table1" width="100" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="text-center site-logo"><img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/general_images/eb-logo.svg" class="" alt="logo"></td>
                </tr>
                <tr>
                    <td> 
                        <table class="table3 cms-table" width="100" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td class="text-center"><h1>Construction Contract</h1></td>
                            </tr>
                            <tr>
                                <td class="text-center"><p>This Contract made and entered on the <span class="d-color"><b>`+ contract_made_date + `</b></span></p></td>
                            </tr>
                            <tr>
                                <td class="text-center"><p>By and between</p></td>
                            </tr>
                            <tr>
                                <td class="text-center"><p class="d-color"><b>`+ get_project_details.rows[0].dataValues.project_client_details.dataValues.full_name + `</b></p>
                                    <p>Herein referred to as the ‘Employer</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-center"><p>And</p></td>
                            </tr>
                            <tr>
                                <td class="text-center">
                                    <p class="d-color"><b>`+ get_project_details.rows[0].dataValues.project_bids[0].contractor_details.full_name + `</b></p>
                                    <p>Herein referred to as the ‘Contractor’</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Whereas the employer is desirous of constructing <b>`+ get_project_details.rows[0].dataValues.project_use_type + ` Villa</b> in Plot number <b>` + get_project_details.rows[0].dataValues.plot_area + `</b>, <b>` + get_project_details.rows[0].dataValues.project_location + `</b>. Herein after called the ‘Project’. As well as the contractor has agreed to undertake the construction of the said project in accordance with the approved drawings and specifications, all of which are made integral parts of this contract.</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p>Now, therefore the parties hereto have agreed to the following terms and conditions, covenants, agreements and stipulations set forth, do hereby agree as follows:</p>
                                </td>
                            </tr>
                        </table> 
                    </td>
                </tr>
                <tr>
                    <td>
                        <table class="table3 cms-table cms-table2 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
                            <tr>
                                <td colspan="2">
                                    <h2>1. SCOPE OF WORK:</h2>
                                    <p>1.1. Contractor agrees to undertake the construction of the project detailed in the ‘Set of Drawings’ in Annex 1 and in the ‘Specification and Detailed Scope of Work’ in Annex 2.</p>
                                    <p>1.2. Contractor shall guarantee the performance of supplied and installed materials of the project in conformity with the ‘Specification and Detailed Scope of Work’ in Annex 2. The acceptance of quality and final handover shall be to the Engineer’s satisfaction. </p>
                                    <p>1.3. The Employer appoints the Engineer as a supervising entity reviewing all aspects of the project, at least to the requirements of the Municipality. Otherwise, the Employer is responsible for all tasks assigned to the Engineer herein the Contract.</p>
                                    <p>1.4. Employer shall supply all materials listed in the ‘Specification and Detailed Scope of Work’ in Annex 2 in the timeframe defined in the ‘Program of Works’ in Annex 3.</p>
                                    <p>1.5. Contractor will be responsible for obtaining and paying costs of all necessary approvals from concerned authorities such as municipal, electrical, water etc. During the construction period and after completion of the project prior to handing over possession to the Employer.</p>
                                    <p>1.6. Contractor shall supply labour and necessary temporary materials and machinery required to complete the construction of the project, such as and not limited to cement, water, sand, plywood, nails, scaffolds, machines etc. The contractor will make available the materials, skilled labour and qualified project manager required for the completion of the project up to final handover to the Employer.</p>
                                    <p>1.7. At all times, Contractor is responsible for providing security and protection of  project premises and Employer stored materials, any losses incurred is the responsibility of the Contractor.</p>
                                    <p>1.8. Contractor must ensure safe conditions to all site visitors and workers. The project premises must be clean from debris and waste materials regularly.</p>
                                    <p>1.9. Contractor must ensure high level of hygiene and cleanness prior to final handover.</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>2. PROGRAM OF WORKS:</h2>
                                    <p>2.1. Contractor shall regularly proceed and complete the project in accordance to the ‘Program of Works’ in Annex 3, unless prevented by fortuitous events in which case the employer may extend the time accordingly. </p>
                                    <p>2.2. Contractor shall start mobilization in the first stage on the ‘Program of Works’, in Annex 3, on date of obtaining the Excavation Permit issued by the municipality and upon the Employer’s advance payment to the Contractor, whichever is later.</p>
                                    <p>2.3. Shall the Contractor delay the project completion in the timeframe mentioned in the ‘Program of Works’, the Employer will be entitled to a deduction of 1% of the total project value mentioned in the ‘Mode of Payment’ in Annex 4 for every delay of 30 days, up to a maximum of 8% of the project value.</p>
                                    <p>2.4. Shall the Employer delays the completion of the assigned tasks beyond 30 days of the agreed dates in the ‘Program of Works’, the Contractor is awarded an extension of time accordingly, but not entitled to a cost of idling of resources.</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>3. MODE OF PAYMENT:</h2>
                                    <p>3.1. The Employer agrees that for and in consideration of the faithful performance by the Contractor of this Contract, he shall pay the Contractor in the manner provided in the ‘Mode of Payment’ in Annex 4.</p>
                                    <p>3.2. The Employer shall make the first payment immediately upon signing the Contract, the Contractor shall start works on site in accordance to clause 2.2 .</p>
                                    <p>3.3. The Employer shall make payments within 15 working days from receipt of a bill certified by the appointed Engineer. In the case that the Employer delays the payment further, the Contractor will be awarded an extension of time accordingly, but not entitled to a cost of idling of resources.</p>
                                    <p>3.4. There shall be a 12-month maintenance period to commence immediately after the issuance of the completion certificate from the municipality, within which the Contractor agrees that at his own expense, repair and replace all defective works damaged and or which become defective during the term of the maintenance period. </p>
                                    <p>3.5. Retention money shall only be payable to the Contractor upon receiving the Maintenance Completion Certificate issued by the Engineer. </p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>4. VARIATIONS IN SCOPE OF WORK:</h2>
                                    <p>4.1. Shall the Employer instruct the Contractor with a variation from the agreed scope of work, a ‘Variation Order’ must be written and signed between both parties with an agreed value of instruction and agreed extension of time prior to any changes made on the project, otherwise no additional value or extension of time will be granted to the Contractor. The Engineer must review and witness this document.</p>
                                    <p>4.2. The Employer agrees that for and in consideration of any changes, modifications, or rectifications not mentioned either in the ‘set of drawings’ and ‘specifications and detailed scope of works’ as so ordered in whole or in part, the Contractor shall be paid by the Employer any price difference to original contract value and awarded an extension of time.</p>
                                    <p>4.3. In the case that the Employer reduces the scope of work from the Contractor, it shall be up to a maximum of 20% of the project value, otherwise the Contractor is entitled to claim 5% fees of the value of further reduced scope of work.</p>
                                    <p>4.4. Engineer can change the specifications in the condition that the Contractor does not claim additional costs unless agreed with the Employer as a variation.</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>5. OTHERS:</h2>
                                    <p>5.1. The Contractor agrees to provide on his own account the necessary Sign Boards in front of the project premises in accordance to Municipality requirements.</p>
                                    <p>5.2. The Employer agrees to provide the Contractor with one full set of A3 approved drawings for the execution of the project and shall remain with the Contractor.</p>
                                    <p>5.3. The Employer and the Contractor agree that the Engineer, for proper evaluation and advice, witnesses all written communications, requests, variation orders etc.</p>
                                    <p>5.4. The Employer will supply materials and appoint sub-contractors for the execution of some finishing works. The Contractor must provide assistance required for the execution of the said finishing works.</p>
                                    <p>5.5. Only for floor and wall tiles supplied by the Employer and Installed by the Contractor, a ‘Material Quantity Schedule’ must be prepared by the Contractor within 60 Days of project start date and handed over to the Employer for supply of tiles. It is the responsibility of the Employer to verify the quantities of tiles.</p>
                                    <p>5.6. Contractor must sign a ‘receipt of received materials’ confirming the date and quantity of received materials from the Employers upon delivery to the project premises. </p>
                                    <p>5.7. Contractor is responsible to provide security in the project at all times, any losses shall be borne by the Contractor.</p>
                                    <p>5.8. Contractor will be responsible for the cost of all defective works due to bad workmanship.</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>6. CONTRACT DOCUMENTS:</h2>
                                    <p>6.1. The following documents prepared, secured and supplied by the Employer, Designer, Engineer and the Contractor shall constitute as an integral part of this Contract as herein attached or herein stated except as otherwise modified by mutual agreement of both the parties:</p>
                                    <p class="sub1">- Annex 1: Copy of Municipality approved Structural & Architectural drawings, Ibaha (building permit), 3D Views, Mulkiya and Krookie.</p>
                                    <p class="sub1">- Annex 2: Specifications and Detailed Scope of Work</p>
                                    <p class="sub1">- Annex 3: Program of Works</p>
                                    <p class="sub1">- Annex 4: Mode of Payment</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>7. TERMINATION OF CONTRACT:</h2>
                                    <p>7.1. The Contractor shall have the right to terminate this Contract at any time with a 60 day period of notice. Within the 60 days all articles of the contract are obligated on both parties. The Employer has the right to maintain 10% of the value of completed works on site for a period of 12 months. Upon the expiration of the said period of notice, the Contractor shall stop the work, terminate all orders relating to the performance of the work and deliver to the Employer through the Engineer the documents relating to their services. All costs on the Employer associated with termination will borne by the Contractor, even the cost of assigning a new Contractor.</p>
                                    <p>7.2. The Employer shall have the right to terminate the contract at any time with a 60 day period of notice. The payments to the Contractor shall be made in accordance to Article 4.3 and to the scope completed on site.</p>
                                    <p>7.3. If the termination is decided, by any of the parties, because of force majeure; then termination shall become effective only if the force majeure has not ceased within the notice period. Neither party shall be considered in default in the performance of his obligations herein as a result of force majeure, which implies herein, shall mean Acts of God, extreme weather conditions and or of equivalent force not within the control of both the parties and renders impossible fulfilment of the Contract.</p>
                                    <p>7.4. If the performance of any obligations of responsibilities of any party is delayed for more than 90 days or totally prevented as herein above provided, the terms of this Contract shall either be extended for such suspension or terminated.</p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>8. LANGUAGE AND CODES:</h2>
                                    <p>The ruling language of the Contract is <b>English</b>. All reports, design, drawings, correspondence, etc. shall be in the English language.</p>
                                    <p></p>
                                    <p></p>
                                    <p></p>
                                </td>
                            </tr>
                            <tr>
                                <td colspan="2">
                                    <h2>9. SETTLEMENT OF DISPUTES:</h2>
                                    <p>The Engineer shall initially settle any disputes or differences arising out of the contents of this Contract including those considered as such by only one of the parties. If the dispute is not settled, it shall be forwarded to the court in the Sultanate of Oman. This Contract shall be governed by and construed according to the laws prevailing in the Sultanate of Oman.</p>
                                    <p>The Contractor and the Employer agree to carry out the above said works as per the clauses listed above. This Contract is signed on <b>`+ contract_made_date + `</b></p>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-center">
                                    <p class="signature">(Employer)</p>
                                </td>
                                <td class="text-center">
                                    <p class="signature">(Contractor)</p>
                                </td>
                            </tr>
                        </table> 
                    </td>
                </tr>
                <tr>
                    <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
                </tr>
            </table>
        </div>
        </body>`
        resolve(html)
      })
      let create_pdf = await new Promise(function (resolve, reject) {
        let create_pdf;
        let pdf = require('html-pdf');
        let options = {
          format: 'Letter', "border": {
            "top": "0.5in",            // default is 0, units: mm, cm, in, px
            "right": "0.2in",
            "bottom": "0.2in",
            "left": "0.2in"
          }
        };
        pdf.create(html, options).toFile(global.constants.uploads.project_contract_pdf + './' + pdf_name + '.pdf', function (err, resp) {
          if (err) return console.log(err);
          else {
            create_pdf = resp;
            resolve(create_pdf)
          }
        })
      })
      return res.send({ status: 200, message: 'Project contract PDF is downloaded', purpose: 'To download project contract PDF', data: global.constants.IMG_URL.project_contract_pdf_url + pdf_name + '.pdf', client_id: client_id })
    }
    catch (err) {
      console.log(3983, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}


/**sign-update API
method:PUT
input:body[project_id,contractor_id]
output:data,
purpose:To update data.
created by-sayanti Nath
*/




ProjectController.signUpdate = (req, res) => {

  (async () => {
    try {

      let info = {};
      info.table = 'project_bids',
        info.where = {};
      info.where.project_id = req.body.project_id,
        info.where.contractor_id = req.body.contractor_id;
      info.data = {
        status: 1
      }

      let info_update = await GenericRepository.updateData(info)


      let info_sataus={};
      info_sataus.table='project_bids',
      info_sataus.where={project_id:req.body.project_id,contractor_id:{$ne:req.body.contractor_id}};

      info_sataus.data = {
        status: 0
      }

      let info_status_update= await GenericRepository.updateData(info_sataus)


      let data = {};
      data.table = 'projects',
        data.where = {};

      data.where.id = req.body.project_id;
      data.data = {
        status: 5
      }


      let data_update = await GenericRepository.updateData(data)

      let information = {};
      //information.table='project_bids',
      information.where = {
        project_id: req.body.project_id,
        contractor_id: req.body.contractor_id

      }


      let contractor_details = await ConsultationhubRepository.allortMent(information);

      console.log(contractor_details.rows[0].dataValues.project.name)


      let name = contractor_details.rows[0].dataValues.user.full_name;
      name = name.split(' ').slice(0, -1).join(' ');

      let email_data = {};
      email_data.email = contractor_details.rows[0].dataValues.user.email;
      email_data.projectname = contractor_details.rows[0].dataValues.project.name;
      email_data.username = name;


      global.eventEmitter.emit('project_allortment', email_data);




      let notifications = {};
      notifications.table = 'notifications',
        notifications.data = {
          notification_from: req.user_id,
          notification_to: contractor_details.rows[0].dataValues.user.id,
          project_id: req.body.project_id,
          title: "project allortment",
          notification_type: "email"
        }

      let notifications_entry = await GenericRepository.createData(notifications);







      res.send({ status: 200, message: "data updated" });
    } catch (err) {
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({ status: 500, err: err });

    }


  })()

}
/**sign- API
method:POST
input:body[project_id,contractor_id,client_id]
output:data,
purpose:To add and update.
created by-sayanti Nath
*/

ProjectController.ProjectSignUpdate = (req, res) => {

  (async () => {
    try {

      let project_chechk = {};
      project_chechk.table = 'project_contracts',
        project_chechk.where = {
          project_id: req.body.project_id
        };

      console.log(req.userdetails)
      if (req.userdetails.user_type == 1) {
        project_chechk.where.client_id = req.user_id,
          project_chechk.where.contractor_id = req.body.contractor_id;
      }
      else if (req.userdetails.user_type == 3) {
        project_chechk.where.client_id = req.body.client_id,
          project_chechk.where.contractor_id = req.user_id;
      }
      let order=[['id','DESC']]

      let project_check_table = await GenericRepository.fetchDataOrder(project_chechk,order)
      if (project_check_table.rows.length > 0) {
        let project_update_data = {};
        project_update_data.table = 'project_contracts',
          project_update_data.where = {
            id: project_check_table.rows[0].dataValues.id
          }
        project_update_data.data = {};
        if (req.userdetails.user_type == 1) {
          console.log("hello")
          project_update_data.data.cllient_acceptance = 1;
        }
        else if (req.userdetails.user_type == 3) {
          project_update_data.data.contractor_acceptance = 1

        }

        let contracts = await GenericRepository.updateData(project_update_data)

        // if(req.userdetails.user_type == 1){

        //   let project_status_client = {};
        //   project_status_client.table = 'projects',
        //   project_status_client.where = {
        //       id: req.body.project_id
        //     }
    
        //     project_status_client.data = {
        //     status: 7
        //   }
    
        //   let project_status_update_client = await GenericRepository.updateData(project_status_client);
    

        // }

        // if(req.userdetails.user_type == 3){

        //   let project_status_contractor = {};
        //   project_status_contractor.table = 'projects',
        //   project_status_contractor.where = {
        //       id: req.body.project_id
        //     }
    
        //     project_status_contractor.data = {
        //     status: 6
        //   }
    
        //   let project_status_update_contractor = await GenericRepository.updateData(project_status_contractor);
    

        // }




      }




      else {

        let project_bid = {};
        project_bid.table = 'project_bids',
          project_bid.where = {};
        project_bid.where.project_id = req.body.project_id;
        if (req.userdetails.user_type == 1){
          project_bid.where.contractor_id = req.body.contractor_id

        }

        if (req.userdetails.user_type == 3){
          project_bid.where.contractor_id = req.user_id

        }


          //project_bid.where.contractor_id = req.body.contractor_id;

        let project_bid_table = await GenericRepository.fetchData(project_bid)

        let project_fetch = {};
        project_fetch.table = 'project_contracts',
          project_fetch.where = {};
        let order = [['id', 'DESC']]


        var project_fetch_table = await GenericRepository.fetchDataOrder(project_fetch, order)



        //console.log(project_fetch_table.rows[0].dataValues.version_no)



        let project_stage_update={};
        project_stage_update.table='project_contracts',
        project_stage_update.where={project_id:req.query.project_id};
        let order_for=[['id', 'DESC']]
        let project_stage_fetch=await GenericRepository.fetchDataOrder(project_stage_update, order_for)




        let project_contract = {};
        project_contract.table = 'project_contracts';

        if(project_stage_fetch.rows.length>0){


          project_contract.data = {
            project_id: project_stage_fetch.rows[0].dataValues.project_id,
            // client_id:req.user_id,
            // contractor_id:req.body.contractor_id,
            // version_no:parseInt(project_fetch_table.rows[0].dataValues.version_no)+1,
            //created_by:"contractor",
            days: project_stage_fetch.rows[0].dataValues.days,
            price: project_stage_fetch.rows[0].dataValues.price,
            cllient_acceptance: 1,
  
  
          }

        }
        else{
        project_contract.data = {
          project_id: project_bid_table.rows[0].dataValues.project_id,
          // client_id:req.user_id,
          // contractor_id:req.body.contractor_id,
          // version_no:parseInt(project_fetch_table.rows[0].dataValues.version_no)+1,
          //created_by:"contractor",
          days: project_bid_table.rows[0].dataValues.days,
          price: project_bid_table.rows[0].dataValues.price,
          cllient_acceptance: 1,


        }
      }

        if (req.userdetails.user_type == 1) {
          project_contract.data.created_by = "client"

        }
        else if (req.userdetails.user_type == 3) {
          project_contract.data.created_by = "contractor"

        }
        if (project_fetch_table.rows.length <= 0) {
          console.log("hello");


          project_contract.data.version_no = 1



        }
        else {
          console.log("hello");

          project_contract.data.version_no = parseInt(project_fetch_table.rows[0].dataValues.version_no) + 1;

        }


        if (req.userdetails.user_type == 1) {
          project_contract.data.client_id = req.user_id,
         project_contract.data.contractor_id = req.body.contractor_id;
        }
        else if (req.userdetails.user_type == 3) {
          project_contract.data.client_id = req.body.client_id,
          project_contract.data.contractor_id = req.user_id;
        }




        let project_contracet_table = await GenericRepository.createData(project_contract)
        console.log(project_contracet_table.dataValues.id)


        let stage_estimate = {};
        stage_estimate.table = 'project_stage_estimates',
          stage_estimate.where = {};
          console.log(project_bid_table.rows[0].dataValues.id)
        stage_estimate.where.bid_id = project_bid_table.rows[0].dataValues.id;
        

        let stage_estimates_data = await GenericRepository.fetchData(stage_estimate)


        // let project_stage_estimates={};
        // project_stage_estimates.table='project_contract_stages',
        // project_stage_estimates.where={contract_id:project_stage_fetch.rows[0].dataValues.id}

        // let project_stage_estimets_contracts=await GenericRepository.fetchData(project_stage_estimates)

        // if(project_stage_estimets_contracts.rows.length>0){


        //   for (index in project_stage_estimets_contracts.rows) {

        //     let project_stage_estimates = {};
        //     project_stage_estimates.table = 'project_contract_stages',
        //       project_stage_estimates.data = {
        //         contract_id: project_stage_estimets_contracts.dataValues.id,
        //         stage_id: project_stage_estimets_contracts.rows[index].dataValues.stage_id,
        //         price_amount: project_stage_estimets_contracts.rows[index].dataValues.price_amount,
        //         price_percentage: project_stage_estimets_contracts.rows[index].dataValues.price_percentage,
        //         days: project_stage_estimets_contracts.rows[index].dataValues.days
        //       }
  
        //     let project_stage_estimates_table = await GenericRepository.createData(project_stage_estimates)
        //   }

        // }
        

        for (index in stage_estimates_data.rows) {

          let project_stage_estimates = {};
          project_stage_estimates.table = 'project_contract_stages',
            project_stage_estimates.data = {
              contract_id: project_contracet_table.dataValues.id,
              stage_id: stage_estimates_data.rows[index].dataValues.stage_id,
              price_amount: stage_estimates_data.rows[index].dataValues.price_amount,
              price_percentage: stage_estimates_data.rows[index].dataValues.price_percentage,
              days: stage_estimates_data.rows[index].dataValues.days
            }

          let project_stage_estimates_table = await GenericRepository.createData(project_stage_estimates)
        }
      




        let project_metas = {};
        project_metas.table = 'project_metas',
          project_metas.where = {};
        project_metas.where.project_id = req.body.project_id;
        project_metas.where.is_deleted = 0;
        let project_metas_table = await GenericRepository.fetchData(project_metas);
        for (index in project_metas_table.rows) {

          let contract_metas = {};
          contract_metas.table = 'contract_metas',
            contract_metas.data = {
              contract_id: project_contracet_table.dataValues.id,

              scope_id: project_metas_table.rows[index].dataValues.scope_id,
              supplied_by: project_metas_table.rows[index].dataValues.supplied_by,
              installed_by: project_metas_table.rows[index].dataValues.installed_by,
            }
              if(project_metas_table.rows[index].dataValues.q_result==''){
                contract_metas.data.q_result=null

          }
          else{
            contract_metas.data.q_result=project_metas_table.rows[index].dataValues.q_result
          }

          let contract_metas_table = await GenericRepository.createData(contract_metas)
        }






        // res.send({status:200,message:"data created",data:project_metas_table});
      }


      let project_status = {};
        project_status.table = 'projects',
          project_status.where = {
            id: req.body.project_id
          }
  
        project_status.data = {
          status: 6
        }
  
        let project_status_update = await GenericRepository.updateData(project_status);


      let finall = {};
      finall.table = 'project_contracts',
        finall.where = {
          project_id: req.body.project_id,
          cllient_acceptance: 1,
          contractor_acceptance: 1
        }

      if (req.userdetails.user_type == 1) {
        finall.where.client_id = req.user_id,
          finall.where.contractor_id = req.body.contractor_id;
      }
      else if (req.userdetails.user_type == 3) {
        finall.where.client_id = req.body.client_id,
          finall.where.contractor_id = req.user_id;
      }

      let finall_fetch = await GenericRepository.fetchData(finall);
      if (finall_fetch.rows.length > 0) {

      
        console.log("data", finall_fetch.rows[0].dataValues.days)
        let final_project_bids = {};
        final_project_bids.table = 'project_bids',
          final_project_bids.data = {
            days: finall_fetch.rows[0].dataValues.days,
            price: finall_fetch.rows[0].dataValues.price,
          }
        final_project_bids.where = {
          project_id: req.body.project_id,
          // contractor_id:req.body.contractor_id

        }

        if (req.userdetails.user_type == 1) {

          final_project_bids.where.contractor_id = req.body.contractor_id;
        }
        else if (req.userdetails.user_type == 3) {

          final_project_bids.where.contractor_id = req.user_id;
        }




        let final_project_bids_table = await GenericRepository.updateData(final_project_bids);



        let finall_contract_metas = {};
        finall_contract_metas.table = 'contract_metas',
          finall_contract_metas.where = {};
        finall_contract_metas.where.contract_id = finall_fetch.rows[0].dataValues.id
        //project_metas.where.is_deleted=0;
        var finall_contract_metas_table = await GenericRepository.fetchData(finall_contract_metas);
        console.log("finall", finall_contract_metas_table)
        let delete_final_contract_data={};
        delete_final_contract_data.table='project_metas',
        delete_final_contract_data.where={project_id:req.body.project_id};
        let finall_contract_layout_data=await GenericRepository.deleteData(delete_final_contract_data);


        for (index in finall_contract_metas_table.rows) {
          console.log("hello",finall_contract_metas_table.rows[index].dataValues.supplied_by)

          let finall_project_metas = {};
          finall_project_metas.table = 'project_metas',
            finall_project_metas.data = {
              //contract_id:project_contracet_table.dataValues.id,

              scope_id: finall_contract_metas_table.rows[index].dataValues.scope_id,
              supplied_by: finall_contract_metas_table.rows[index].dataValues.supplied_by,
              installed_by: finall_contract_metas_table.rows[index].dataValues.installed_by,
              q_result: finall_contract_metas_table.rows[index].dataValues.q_result,
              project_id:req.body.project_id

            }
          

          let finall_contract_metas_table_value = await GenericRepository.createData(finall_project_metas)



        }



      }




     


      
      
        return res.send({ status: 200, message: "sign successfull" });
      




    } catch (err) {
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({ status: 500, err: err });

    }


  })()







}


/**searchProjectData API
method:GET
input:body[`project_id`], headers[x-access-token]
purpose:To check if any data exist in project_consultants for a particular project.
created by:Arijit Saha
*/
/**
     * To check if any data exist in project_consultants for a particular project respect to `project_id` and `x-access-token`
     * @param {Number} `project_id`
     * @param {String} `x-access-token` 
     * @return {data} result
*/
ProjectController.searchProjectData = function(req, res){
  (async()=>{
    try{
      let get_project_consultant_data = await new Promise(function(resolve, reject){
        let get_project_consultant_data;
        let project_consultant_data = {};
        project_consultant_data.table = 'project_consultants';
        project_consultant_data.where = {};
        project_consultant_data.where.project_id = parseInt(req.query.project_id);
        GenericRepository.fetchData(project_consultant_data).then(project_consultant_result=>{
          get_project_consultant_data = project_consultant_result;
          resolve(get_project_consultant_data);
        }).catch(project_consultant_err=>{
          console.log(5651, project_consultant_err);
          return res.send({status:500, message:'Something went wrong.'})
        })
      })
      if(get_project_consultant_data.rows.length == 0){
        return res.send({status:200, message:'Search result', purpose:'To check if any data exist in project_consultants for a particular project', is_found:0});
      }
      else{
        return res.send({status:200, message:'Search result',purpose:'To check if any data exist in project_consultants for a particular project', is_found:1});

      }
    }
    catch(err){
      console.log(5300, err);
      return res.send({status:500, message:'Something went wrong'});
    }
  })()
}

/**projectBidsReject API
method:PUT
input:body[project_id,contractor_id,client_id]
output:data,
purpose:To add and update.
created by-sayanti Nath
*/

ProjectController.projectBidsReject = (req, res) => {


  (async () => {
    try {

      let info = {};
      info.table = 'project_bids';
      if (req.userdetails.user_type == 3) {
        info.where = {
          project_id: req.body.project_id,
          contractor_id: req.user_id
        }
      }

      else {
        info.where = {
          project_id: req.body.project_id,
          contractor_id: req.body.contractor_id
        }
      }
      info.data = {
        status: 2
      }

      let info_table = await GenericRepository.updateData(info);
      if (req.userdetails.user_type == 3) {

        let information = {};
        //information.table='project_bids',
        information.where = {
          project_id: req.body.project_id,
          contractor_id: req.user_id

        }


        let contractor_details = await ConsultationhubRepository.allortMent(information);

        console.log(contractor_details.rows[0].dataValues.project.name)


        let name = contractor_details.rows[0].dataValues.project.user.full_name;
        name = name.split(' ').slice(0, -1).join(' ');

        let email_data = {};
        email_data.email = contractor_details.rows[0].dataValues.project.user.email;
        email_data.projectname = contractor_details.rows[0].dataValues.project.name;
        email_data.username = name;
        email_data.name = req.userdetails.full_name;


        global.eventEmitter.emit('project_bid_rejects', email_data);




        let notifications = {};
        notifications.table = 'notifications',
          notifications.data = {
            notification_from: req.user_id,
            notification_to: contractor_details.rows[0].dataValues.project.user.id,
            project_id: req.body.project_id,
            title: "project bid reject",
            notification_type: "email"
          }

        let notifications_entry = await GenericRepository.createData(notifications);
      }




      res.send({ status: 200, message: "contract has been rejected" })



    } catch (err) {
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({ status: 500, err: err });

    }


  })()

}

/**getProjectContractDetails API
method:GET
input:params[project_id, contractor_id or client_id], headers[x-access-token]
purpose:To get project contract details for client side.
created by:Arijit Saha
*/
/**
     * To get project contract details for client side with respect to `project_id`, `contractor_id` or `client_id` and `x-access-token`
     * @param {Number} `project_id`, `contractor_id` or `client_id` 
     * @param {String} `x-access-token` 
     * @return {data} result
*/
ProjectController.getProjectContractDetails = function (req, res) {
  (async () => {
    try {
        
        let project_info_data = {};
        project_info_data.table = 'contract_info';
        project_info_data.where = {project_id : parseInt(req.query.project_id)}
        var sign_data = await GenericRepository.fetchData(project_info_data);

      let getProjectContractDetails = await new Promise(function (resolve, reject) {
        let getProjectContractDetails;
        let project_contracts_where = {};
        project_contracts_where.project_id = parseInt(req.query.project_id);

      
        // project_contracts_where.client_id = req.query.client_id;
        // project_contracts_where.contractor_id = parseInt(req.query.contractor_id);
        ///if login user is client type////
        if (req.userdetails.user_type == 1) {
          project_contracts_where.client_id = req.user_id;
          project_contracts_where.contractor_id = parseInt(req.query.contractor_id);
        }
        ///if login user is contractor type////
        if (req.userdetails.user_type == 3) {
          project_contracts_where.contractor_id = req.user_id;
          project_contracts_where.client_id = parseInt(req.query.client_id);
        }
        let sort_by = ['id', 'DESC'];
        ProjectRepository.fetchProjectContractDetails(project_contracts_where, sort_by).then(project_contracts_result => {
          if (project_contracts_result.rows.length > 0) {
            getProjectContractDetails = project_contracts_result.rows[0].dataValues;
            getProjectContractDetails.sign_data = sign_data;
            return res.send({ status: 200, message: 'Contract details for client side', purpose: 'To get project contract details for client side_1', data: getProjectContractDetails })
            // resolve(getProjectContractDetails);
          }
          else {
            // return res.send({status:404, message:'No contract details found.'})
            resolve();
          }
        }).catch(project_contracts_err => {
          console.log(297, project_contracts_err);
          return res.send({ status: 500, message: 'Something went wrong.' })
        })
      })
      let getProjectBidDetails = await new Promise(function (resolve, reject) {
        let getProjectBidDetails;
        let project_contracts_where = {};
        project_contracts_where.project_id = parseInt(req.query.project_id);
        project_contracts_where.status = 1;
        ///if login user is client type////
        if (req.userdetails.user_type == 1) {
          project_contracts_where.contractor_id = parseInt(req.query.contractor_id);
        }
        ///if login user is contractor type////
        if (req.userdetails.user_type == 3) {
          project_contracts_where.contractor_id = req.user_id;
        }
        let sort_by = ['id', 'DESC'];
        ProjectRepository.fetchProjectBidDetails(project_contracts_where, sort_by).then(project_contracts_result => {
          if (project_contracts_result.rows.length > 0) {
            getProjectBidDetails = project_contracts_result.rows[0].dataValues;
            // getProjectBidDetails.contract_metas = getProjectBidDetails.project_metas
            // delete getProjectBidDetails.project_metas;
            getProjectBidDetails.project_contract_stages = project_contracts_result.rows[0].dataValues.project_stage_estimates;
            
            let get_project_where = {};
            get_project_where.id = parseInt(req.query.project_id);
            ProjectRepository.fetchProject(get_project_where).then(get_project_result=>{
              getProjectBidDetails.contract_metas = get_project_result.rows[0].dataValues.project_metas;
              getProjectBidDetails.sign_data = sign_data;
              delete getProjectBidDetails.project_metas;
              return res.send({ status: 200, message: 'Contract details for client side', purpose: 'To get project contract details for client side_2', data: getProjectBidDetails, test_count: get_project_result.rows[0].dataValues.project_metas.length})
            }).catch(get_project_err=>{
              console.log(297, get_project_err);
              return res.send({ status: 500, message: 'Something went wrong.' })
            })

            // console.log(getProjectBidDetails)

            // return res.send({ status: 200, message: 'Contract details for client side', purpose: 'To get project contract details for client side_2', data: getProjectBidDetails })
            // resolve(getProjectContractDetails);
          }
          else {
            return res.send({ status: 404, message: 'No contract details found.' })
            // resolve();
          }
        }).catch(project_contracts_err => {
          console.log(297, project_contracts_err);
          return res.send({ status: 500, message: 'Something went wrong.' })
        })
      })
      // let latest_project_contracts_details = getProjectContractDetails.rows[0].dataValues;
      // return res.send({status:200, message:'Contract details for client side', purpose:'To get project contract details for client side', data:latest_project_contracts_details})
    }
    catch (err) {
      console.log(290, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**submitProjectTender API
method:POST
input:body[`project_id`, `contractor_id` or`client_id`,`days`,`price`,`contract_metas`], headers[x-access-token]
purpose:To submit a new contract version.
created by:Arijit Saha
*/
/**
     * To submit a new contract version with respect to `project_id`, `contractor_id` or`client_id`,`days`,`price`,`contract_metas` and `x-access-token`
     * @param {Number} `project_id`, `contractor_id`, `client_id`,`days`,`price`, 
     * @param {String} `x-access-token` 
     * @param {Array} `contract_metas` 
     * @return {data} result
*/
ProjectController.submitProjectTender = function (req, res) {
  (async () => {
    try {
      // console.log(req.body);
      let get_previous_contract_version = await new Promise(function (resolve, reject) {
        let get_previous_contract_version = 0;
        let contract_data = {};
        contract_data.table = 'project_contracts';
        contract_data.where = {};
        contract_data.where.project_id = parseInt(req.body.project_id);
        if (req.userdetails.user_type == 1) {
          contract_data.where.client_id = req.user_id;
          contract_data.where.contractor_id = parseInt(req.body.contractor_id);
        }
        if (req.userdetails.user_type == 3) {
          contract_data.where.contractor_id = req.user_id;
          contract_data.where.client_id = parseInt(req.body.client_id);
        }
        GenericRepository.fetchData(contract_data).then(contract_result => {
          if (contract_result.rows.length > 0) {
            get_previous_contract_version = contract_result.rows[(contract_result.rows.length - 1)].dataValues.version_no
          }
          else {
            get_previous_contract_version = 0;
          }
          resolve(get_previous_contract_version);
        }).catch(contract_err => {
          console.log(396, contract_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      let post_contract_details = await new Promise(function (resolve, reject) {
        let post_contract_details;
        let project_contract_data = {};
        project_contract_data.table = 'project_contracts';
        project_contract_data.data = {};
        project_contract_data.data.project_id = parseInt(req.body.project_id);
        if (req.userdetails.user_type == 1) {
          project_contract_data.data.client_id = req.user_id;
          project_contract_data.data.contractor_id = parseInt(req.body.contractor_id);
          project_contract_data.data.created_by = 'client';
        }
        if (req.userdetails.user_type == 3) {
          project_contract_data.data.contractor_id = req.user_id;
          project_contract_data.data.client_id = parseInt(req.body.client_id);
          project_contract_data.data.created_by = 'contractor';

        }
        project_contract_data.data.version_no = parseInt(get_previous_contract_version + 1);
        project_contract_data.data.days = parseInt(req.body.days);
        project_contract_data.data.price = parseInt(req.body.price);
        project_contract_data.data.last_change = parseInt(req.body.last_change);
        GenericRepository.createData(project_contract_data).then(project_contract_result => {
          post_contract_details = project_contract_result;
          resolve(post_contract_details);
        }).catch(project_contract_err => {
          console.log(429, project_contract_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })


      })
      // let post_project_contract_stages = await new Promise(function (resolve, reject) {
      //   let project_bids_data = {};
      //   project_bids_data.table = 'project_bids';
      //   project_bids_data.where = {};
      //   project_bids_data.where.project_id = parseInt(req.body.project_id);
      //   project_bids_data.where.status = 1;
      //   GenericRepository.fetchData(project_bids_data).then(project_bids_result => {
      //     let project_stage_estimates_data = {};
      //     project_stage_estimates_data.table = 'project_stage_estimates';
      //     project_stage_estimates_data.where = {};
      //     project_stage_estimates_data.where.bid_id = project_bids_result.rows[0].dataValues.id;
      //     GenericRepository.fetchData(project_stage_estimates_data).then(project_stage_estimates_result => {
      //       for (let i = 0; i < project_stage_estimates_result.rows.length; i++) {
      //         let post_project_contract_stages_data = {};
      //         post_project_contract_stages_data.table = 'project_contract_stages';
      //         post_project_contract_stages_data.data = {};
      //         post_project_contract_stages_data.data.contract_id = post_contract_details.dataValues.id;
      //         post_project_contract_stages_data.data.stage_id = project_stage_estimates_result.rows[i].dataValues.stage_id;
      //         post_project_contract_stages_data.data.price_amount = project_stage_estimates_result.rows[i].dataValues.price_amount;
      //         post_project_contract_stages_data.data.price_percentage = project_stage_estimates_result.rows[i].dataValues.price_percentage;
      //         post_project_contract_stages_data.data.days = project_stage_estimates_result.rows[i].dataValues.days;
      //         GenericRepository.createData(post_project_contract_stages_data).then(post_project_contract_stages_result => {
      //           if (i == project_stage_estimates_result.rows.length - 1) {
      //             resolve()
      //           }
      //         }).catch(post_project_contract_stages_err => {
      //           console.log(464, post_project_contract_stages_err);
      //           return res.send({ status: 500, message: 'Something went wrong' });
      //         })

      //       }
      //     }).catch(project_stage_estimates_err => {
      //       console.log(450, project_stage_estimates_err);
      //       return res.send({ status: 500, message: 'Something went wrong' });
      //     })

      //   }).catch(project_bids_err => {
      //     console.log(475, project_bids_err);
      //     return res.send({ status: 500, message: 'Something went wrong' });
      //   })
      // })
      // console.log(req.body.old_price)
      // console.log('********* req.body.contract_metas ***********', JSON.parse(req.body.contract_metas));
      let post_contract_metas = await new Promise(function (resolve, reject) {
        for (let i = 0; i < JSON.parse(req.body.contract_metas).length; i++) {
          let contract_metas_data = {};
          contract_metas_data.table = 'contract_metas';
          contract_metas_data.data = {};
          contract_metas_data.data.contract_id = post_contract_details.dataValues.id;
          contract_metas_data.data.scope_id = parseInt(JSON.parse(req.body.contract_metas)[i].scope_id);
          contract_metas_data.data.supplied_by = JSON.parse(req.body.contract_metas)[i].supplied_by;
          contract_metas_data.data.installed_by = JSON.parse(req.body.contract_metas)[i].installed_by;
          contract_metas_data.data.q_result = JSON.parse(req.body.contract_metas)[i].q_result;
          GenericRepository.createData(contract_metas_data).then(contract_metas_result => {
            if (i == JSON.parse(req.body.contract_metas).length - 1) {
              resolve()
            }
          }).catch(contract_metas_err => {
            console.log(449, contract_metas_err);
            return res.send({ status: 500, message: 'Something went wrong' });
          })
        }

      })

      let bids={};
      bids.where={project_id:req.body.project_id,contractor_id:req.body.contractor_id,status:1};
      let bid_table=await ConsultationhubRepository.tender_submit_pdf(bids);

      console.log(JSON.stringify(bid_table.rows[0].dataValues.price));

      var old_price=bid_table.rows[0].dataValues.price;
      var new_price=req.body.price;
      var old_days=bid_table.rows[0].dataValues.days;
      var new_days=req.body.days;

    let project_fetch={};
    project_fetch.table='project_contracts';
  
    let order=[['version_no','DESC']]
  
    //let project_fetch_data=await 


        

      var total_days = 0;
      var length_val =bid_table.rows[0].dataValues.project_stage_estimates.length;

      for(let j = 0; j < bid_table.rows[0].dataValues.project_stage_estimates.length; j++){
          if(j == 0 || j == (bid_table.rows[0].dataValues.project_stage_estimates.length-1)){
            let new_percent_amt = parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.price_amount)/parseInt(old_price);

            var project_contract_stages={};
                project_contract_stages.table='project_contract_stages';
                project_contract_stages.data={
                contract_id:post_contract_details.dataValues.id,
                stage_id:bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.stage_id,
                price_amount:Math.round(new_price*new_percent_amt),
                price_percentage:parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.price_percentage),
                days:parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.days)
            }

          }else{

            let old_percent_days = parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.days)/old_days;
            let new_days_stage =  Math.round(old_percent_days * new_days);
            let new_percent_amt = parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.price_amount)/parseInt(old_price);
            let new_amount_stage = Math.round(new_price*new_percent_amt);
                if(j < length_val-2){
                  total_days = new_days_stage + total_days;
                }else{
                  new_days_stage = new_days - total_days;  
                }
                


        var project_contract_stages={};
            project_contract_stages.table='project_contract_stages';
            project_contract_stages.data={
              contract_id:post_contract_details.dataValues.id,
              stage_id:bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.stage_id,
              price_amount:new_amount_stage,
              price_percentage:parseInt(bid_table.rows[0].dataValues.project_stage_estimates[j].dataValues.price_percentage),
              days:new_days_stage
            }


          }

          console.log(project_contract_stages);
            let project_contract_table=await GenericRepository.createData(project_contract_stages);
     
        
      }
  
      return res.send({ status: 201, message: 'You have submitted your contract update successfully.', purpose: 'To submit a new contract version' ,data:bid_table})
    }
    catch (err) {
      console.log(382, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}




/**deleteProjectProjectDocs API

method:PUT

input:body[`id`], headers[x-access-token]

purpose:To remove a project doc.

created by:Arijit Saha

*/

/**

     * To remove a project doc with respect to `id` and `x-access-token`

     * @param {Number} `id`

     * @param {String} `x-access-token` 

     * @return {data} result

*/

ProjectController.deleteProjectProjectDocs = function(req, res){

  (async()=>{

    try{

      let get_project_doc_details = await new Promise(function(resolve, reject){

        let get_project_doc_details = {}

        let get_project_doc_data = {};

        get_project_doc_data.table = 'project_docs';

        get_project_doc_data.where = {};

        get_project_doc_data.where.id = parseInt(req.body.id);

        GenericRepository.fetchData(get_project_doc_data).then(get_project_doc_result=>{

          if(get_project_doc_result.rows.length > 0){

            if(get_project_doc_result.rows[0].dataValues.is_delete == 1){

              return res.send({status:404, message:'Document is already removed.'})

            }

            else{

              let [a, b] = get_project_doc_result.rows[0].dataValues.resource_url.split("/");

              console.log(a);

              console.log(b);

              get_project_doc_details.path = a;

              get_project_doc_details.file_name = b;

              resolve(get_project_doc_details);

            }

          }

          else{

            return res.send({status:404, message:'No such document found.'});

          }

        }).catch(get_project_doc_err=>{

          console.log(5306, get_project_doc_err);

          return res.send({status:500, message:'Something went wrong.'});

        })

      })

     

      let update_project_doc = await new Promise(function(resolve, reject){

        let update_project_doc_data = {};

        update_project_doc_data.table = 'project_docs';

        update_project_doc_data.where = {};

        update_project_doc_data.data = {};

        update_project_doc_data.where.id = parseInt(req.body.id);

        update_project_doc_data.data.is_delete = 1;

        // update_project_doc_data.data.is_active = 0;

        GenericRepository.updateData(update_project_doc_data).then(update_project_doc_result=>{

          resolve();

        }).catch(update_project_doc_err=>{

          console.log(5336, update_project_doc_err);

          return res.send({status:500, message:'Something went wrong.'});

        })

      })

      return res.send({status:200, message:'File has been removed successfully.', purpose:'To remove a project doc.'});

    }

    catch(err){

      console.log(5300, err);

      return res.send({status:500, message:'Something went wrong'});

    }

  })()

}



/**version-API
method:GET
input:query[project_id]
output:data,
purpose:To list of version.
created by-sayanti Nath
*/


ProjectController.versionListing=(req,res)=>{



(async()=>{

  try{
  let information = {};
  information.table='project_contracts';
  
  information.where = {project_id:req.query.project_id};

  let order=[['version_no','ASC']]
  
  
  let data = await GenericRepository.fetchDataOrder (information,order)
  
  res.send({status:200,data:data, message:'version Listing',purpose:"version listing"});
  
  
  
  } catch(err){
  console.trace(err)
  
  res.send({status:500, err:err});
  
  }
  
  
  })()

}

/**notifications-API
method:GET
input:query[id]
output:data,
purpose:To list of notifications.
created by-sayanti Nath
*/

ProjectController.notificationsListing=(req,res)=>{

  (async()=>{

    try{
    let information = {};
    information.table='notifications';
    
    information.where = {
      notification_to:req.query.id,
      notification_type:{$in:['socket notification','both']},
      is_deleted:'0'
      //status:1
    };
    let order=[['id','DESC']]
    
    
    let data = await GenericRepository.fetchDataOrder (information,order)
    
    res.send({status:200,data:data, message:'notifications Listing',purpose:"version listing"});
    
    
    
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

ProjectController.notificationUpdate=(req,res)=>{

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
    
    res.send({status:200, message:'notifications seen status update'});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()






}

/**notifictionsDelete API
method:PUT
input:query [ID]
output:data,
purpose:To delete notifications
created by-sayanti Nath
*/

ProjectController.notifictionsDelete=(req,res)=>{


  (async()=>{

    try{
    let information = {};
    information.table='notifications';
    
    information.where = {
      id:req.body.id,
      
    };

    information.data={
      is_deleted:'1'
    }
    
    
    
    let data = await GenericRepository.updateData (information)
    
    res.send({status:200, message:'notifications delete',purpose:"notifications deleted"});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()

}


/**editProjectAdmin API
method:PUT
input:body [id, name, project_location, project_use_type, plot_area, built_up_area, basement, levelling_floor, gound_floor, additional_floors, pent_floor, pent_floor]
output:data,
purpose:To edit project from admin panel
created by-sayanti Nath
*/

ProjectController.editProjectAdmin=(req,res)=>{

  (async()=>{

    try{
      var data = {};
      let project_info = {};
      project_info.table = 'projects',
        project_info.data = {
          name: req.body.name,
          project_location: req.body.project_location,
          project_use_type: req.body.project_use_type,
          plot_area: req.body.plot_area,
          built_up_area :req.body.built_up_area,
          basement: req.body.basement,
          levelling_floor: req.body.levelling_floor,
          gound_floor: req.body.gound_floor,
          additional_floors: req.body.additional_floors,
          pent_floor: req.body.pent_floor,
         
        }

      // if (req.body.built_up_area && req.body.built_up_area != "") {
      //   project_info.data.built_up_area = req.body.built_up_area;
      // }

      project_info.where = { id: req.body.id };

      let project_data = await GenericRepository.updateData(project_info);

    
    res.send({status:200, message:'project deatils updated'});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()


}


/**cover-page API
method:GET
input:query[project_id]
output:data,
purpose:To list data
created by-sayanti Nath
*/



ProjectController.clientTenderingCoverPage=(req,res)=>{

  (async()=>{

    try{
      let info={};
      info.where={id:req.query.project_id}
      let info_fetch=await ConsultationhubRepository.fetchProjectForImport(info)


      let data={};
      data.where={project_id:req.query.project_id};
      let data_fetch=await ConsultationhubRepository.fetchContractorCoverPage(data);

      for (index in data_fetch.rows) {
        //  console.log(fetch.rows[index])
        //  console.log(fetch.rows[index].dataValues.id)

        let info_labor = {};
        info_labor.table = 'contractor_manpowers',
        info_labor.where = {};
        info_labor.where.contractor_id = data_fetch.rows[index].dataValues.contractor_id;
        info_labor.where.employee_type = 2;
        let fetch_data = await GenericRepository.fetchData(info_labor);
        data_fetch.rows[index].dataValues.labor_count = fetch_data.rows.length;


        let info_eng={};
        info_eng.table='contractor_manpowers';
        info_eng.where={};
        info_eng.where.contractor_id = data_fetch.rows[index].dataValues.contractor_id;
        info_eng.where.employee_type = 1;
        let fetch_data_eng=await GenericRepository.fetchData(info_eng);

        data_fetch.rows[index].dataValues.eng_count = fetch_data_eng.rows.length;


        let info_photo={};
            
        info_photo.table='resources',
        info_photo.where={user_id:data_fetch.rows[index].dataValues.contractor_id,type:'contractor_profile_photo'}
        let fetch_photo=await GenericRepository.fetchData(info_photo);

        if(fetch_photo.rows.length>0){
          data_fetch.rows[index].dataValues.profile_photo_contractor=fetch_photo

        }

        else{
          data_fetch.rows[index].dataValues.profile_photo_contractor=null
        }




        let project_gnatt_chart={};
        project_gnatt_chart.table='project_docs',
        project_gnatt_chart.where={project_id:req.query.project_id,resource_description:parseInt(data_fetch.rows[index].dataValues.contractor_id),type:'gantt_chart'}
        let project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);
  
        if(project_gnatt_table.rows.length){
         
          data_fetch.rows[index].dataValues.gnatt_chartt=project_gnatt_table;
        }
        else{

          data_fetch.rows[index].dataValues.gnatt_chartt=null;
        }









        



      }


      


    
    res.send({status:200,data_contractor:data_fetch,data:info_fetch, message:'data fetched'});
      
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()
 




}

/**contractSignPdf API
method:GET
input:query[id, project_id]
output:data,
purpose:To download contract PDF
created by-Sayanti Nath and Arijit Saha
*/


/**
 * @swagger
 * /api/admin/contract-pdf:
 *  get:
 *   tags:
 *    - Users
 *   parameters:
 *    - in: query
 *      name: id
 *      required: true
 *      schema:
 *       type: integer
 *    - in: query
 *      name: project_id
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

ProjectController.contractSignPdf=(req,res)=>{
  (async()=>{
    try{


      //console.log(req);

      // let project_data_version={}
      // project_data_version.where={project_id:req.query.project_id};
      // project_data_version.table='project_contracts';
      // let order_data_version=[['id','Desc']]
      // let project_version_fetch=await GenericRepository.fetchDataOrder(project_data_version,order_data_version);

      // if(project_version_fetch.rows.length>0){
      //   if(project_version_fetch.rows[0].dataValues.cllient_acceptance==1 && project_version_fetch.rows[0].dataValues.contractor_acceptance==1)
      //   {
      //     return res.send({satus:200,message:"fetch",resp:global.constants.IMG_URL.contract_documet_url+ req.query.project_id+ '.pdf'})
      //   }
      // }
      

       //if(project_version_fetch.rows.length<0 || project_version_fetch.rows.length==0 || project_version_fetch.rows.length>0){

      let data = {};
      data.where = {};
      data.where.project_id = req.query.project_id;
      data.where.status = 1;
      var payment = await ConsultationhubRepository.modePayment(data);
      var i = 1;
      var v=1;


      let data_deafult= {};
      data_deafult.where = {};
      data_deafult.where.project_id = req.query.project_id;
      data_deafult.where.status = 1;
      var payment_default= await ConsultationhubRepository.modePayment_default_primary(data_deafult);

      let data_defult_payment={};
      data_defult_payment.where={project_id : req.query.project_id};
      data_defult_payment.where.status = 1;
      var payment_default_primary=await ConsultationhubRepository.modePayment_default(data_defult_payment);
      var i = 1;
      var v=1;
      //////////////////////////Start Of Arijit //////////////////////////


      var project_details = await new Promise(function (resolve, reject) {
        var  project_details;
        var  project_data_where = {};
        // let project_bids_where = {contractor_id:req.user_id};
        project_data_where.id = parseInt(req.query.project_id);
        var  project_docs_where = {};
        project_docs_where.type = {$in:['drawing', 'other']};
        project_data_where.is_active = 1;
        project_data_where.is_delete = 0;
        ProjectRepository.fetchProjectWithDrawings(project_data_where, project_docs_where).then(project_result => {
          project_details = project_result;
          resolve(project_details);
        }).catch(project_err => {
          console.log(805, project_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      console.log('##########################', project_details.rows[0].dataValues.project_stages.length);
      var project_stages = await new Promise(function (resolve, reject) {
        var  project_stages = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
          project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor++;
            }
            else if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient++;
            }
            else {
              project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant++;
            }
          }

          project_stages.push(project_details.rows[0].dataValues.project_stages[i]);
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            resolve(project_stages)
          }
        }

      })
      project_details.rows[0].dataValues.project_stages = project_stages;
      
      var  project_drawings_and_documents = project_details.rows[0].dataValues.project_docs;

      var  project_legal_documents = await new Promise(function (resolve, reject) {
        var  project_legal_documents;
        var project_data_where = {};
        // let project_bids_where = {contractor_id:req.user_id};
        project_data_where.id = parseInt(req.query.project_id);
        var  project_docs_where = {};
        project_docs_where.type = 'document';
        project_data_where.is_active = 1;
        project_data_where.is_delete = 0;
        ProjectRepository.fetchProjectWithDrawings(project_data_where, project_docs_where).then(project_result => {
          project_legal_documents = project_result.rows[0].dataValues.project_docs;
          resolve(project_legal_documents);
        }).catch(project_err => {
          console.log(805, project_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      // console.log('###########', project_drawings_and_documents.length);

      // return res.send({status:200, message:'Project Details', data:project_details, purpose:'To get details of project'});

      var consultant_stage_task_details = await new Promise(function (resolve, reject) {
        var  consultant_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          var  consultant_stage_task_details_object = {};
          // contractor_stage_task_details.push(contractor_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Consultant') {
              consultant_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              consultant_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              consultant_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              consultant_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              consultant_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              consultant_stage_task_details.push(consultant_stage_task_details_object);

            }
            // else{
            //   contractor_stage_task_details.push(contractor_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            consultant_stage_task_details = [...new Set(consultant_stage_task_details)];

            resolve(consultant_stage_task_details)
          }
        }
      })
      // return res.send({status:200, message:'consultant_stage_task_details', data:consultant_stage_task_details})
      var  client_stage_task_details = await new Promise(function (resolve, reject) {
        var client_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          var  client_stage_task_details_object = {};
          // client_stage_task_details.push(client_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client') {
              client_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              client_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              client_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              client_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              client_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              client_stage_task_details.push(client_stage_task_details_object);

            }
            // else{
            //   client_stage_task_details.push(client_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            client_stage_task_details = [...new Set(client_stage_task_details)];

            resolve(client_stage_task_details)
          }
        }
      })
      // return res.send({status:200, message:'client_stage_task_details', data:client_stage_task_details})

      var contractor_stage_task_details = await new Promise(function (resolve, reject) {
        var  contractor_stage_task_details = [];
        for (let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++) {
          let contractor_stage_task_details_object = {};
          // contractor_stage_task_details.push(contractor_stage_task_details_object);
          for (let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++) {
            if (project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor') {
              contractor_stage_task_details_object.description = project_details.rows[0].dataValues.project_stages[i].dataValues.description;
              contractor_stage_task_details_object.name = project_details.rows[0].dataValues.project_stages[i].dataValues.name;
              contractor_stage_task_details_object.type = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.type;
              contractor_stage_task_details_object.status = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.status;
              contractor_stage_task_details_object.instruction = project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.instruction;
              contractor_stage_task_details.push(contractor_stage_task_details_object);

            }
            // else{
            //   contractor_stage_task_details.push(contractor_stage_task_details_object);

            // }
          }
          if (i == project_details.rows[0].dataValues.project_stages.length - 1) {
            contractor_stage_task_details = [...new Set(contractor_stage_task_details)];

            resolve(contractor_stage_task_details)
          }
        }
      })
      ///////////////////////////// New Modified ///////////////////////////

      // return res.send({msg:'Check result', data:project_details.rows[0].dataValues.project_stages});
      // return;
      var  get_list_of_project_stages_with_task = await new Promise(function(resolve, reject){
        var  get_list_of_project_stages_with_task = [];
        if(project_details.rows[0].dataValues.project_stages.length > 0){
          for(let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++){
            if(project_details.rows[0].dataValues.project_stages[i].project_tasks.length > 0){
              get_list_of_project_stages_with_task.push(project_details.rows[0].dataValues.project_stages[i]);
              if(i == project_details.rows[0].dataValues.project_stages.length - 1){
                resolve(get_list_of_project_stages_with_task);
              }
            }
            else{
              if(i == project_details.rows[0].dataValues.project_stages.length - 1){
                resolve(get_list_of_project_stages_with_task);
              }
            }

          }

        }
        else{
          resolve(get_list_of_project_stages_with_task)
        }
      })
      // return res.send({msg:'Check result', data:get_list_of_project_stages_with_task});
      var  project_stage_and_task_details = await new Promise(function(resolve, reject){
        var  project_stage_and_task_details = [];
        if(get_list_of_project_stages_with_task.length > 0){
          for(let i = 0; i < get_list_of_project_stages_with_task.length; i++){
            let stage_obj = {};
            stage_obj.id = get_list_of_project_stages_with_task[i].id;
            stage_obj.name = get_list_of_project_stages_with_task[i].name;
            stage_obj.description = get_list_of_project_stages_with_task[i].description;
            stage_obj.description_arabic=get_list_of_project_stages_with_task[i].description_arabic
            stage_obj.client_assigned = [];
            stage_obj.consultant_assigned = [];
            stage_obj.contractor_assigned = [];
            for(let j = 0; j < get_list_of_project_stages_with_task[i].project_tasks.length; j++){
              if(get_list_of_project_stages_with_task[i].project_tasks[j].assignee == 'Client'){
                stage_obj.client_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
              }
              else if(get_list_of_project_stages_with_task[i].project_tasks[j].assignee == 'Consultant'){
                stage_obj.consultant_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
              }
              else{
                stage_obj.contractor_assigned.push(get_list_of_project_stages_with_task[i].project_tasks[j]);
  
              }
              project_stage_and_task_details.push(stage_obj);
              if(i == get_list_of_project_stages_with_task.length - 1){
                resolve(project_stage_and_task_details);
              }
  
            }
  
            // project_stage_and_task_details.push(stage_obj);
            // if(i == get_list_of_project_stages_with_task.length - 1){
            //   resolve(project_stage_and_task_details);
            // }
          }
        }
        else{
          resolve(project_stage_and_task_details);
        }


      })
      project_stage_and_task_details = [...new Set(project_stage_and_task_details)]
      // return res.send({msg:'Check result', data:project_stage_and_task_details});
      //////////////////////////End Of Arijit //////////////////////////

      let project_manager={};
      project_manager.table='project_managers'

      project_manager.where={project_id : req.query.project_id};
      var  project_manager_table=await GenericRepository.fetchData (project_manager)

      let contract_bank={};
      contract_bank.table='contract_banks',
      contract_bank.where={user_id:req.query.id};
      var  contract_bank_table=await GenericRepository.fetchData (contract_bank);


      let user={};
      user.table='user',
      user.where={id:req.query.id};
      var  user_table=await GenericRepository.fetchData (user);

      let client={};
      client.where={id:req.query.project_id};
      var  client_table=await ConsultationhubRepository.fetchContractSignPdf(client);
      console.log(client_table.rows[0].dataValues.user.full_name);


      let consultant={};
      consultant.where={project_id:req.query.project_id};
      let consultant_table=await ConsultationhubRepository.fetchConsultantForContractPdf(consultant);

      console.log('//////////',consultant_table);



      let scope = {};
      scope.table = 'project_scopes',
        scope.where = {};
      scope.where.project_id = req.query.project_id,
        scope.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
        var  scope_table = await ConsultationhubRepository.staticScopeDetails(scope);


      let scope_group = {};
      scope_group.table = 'project_scopes',
        scope_group.where = {};
      scope_group.where.project_id = req.query.project_id,
        scope_group.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
        var  scope_table_fetch = await ConsultationhubRepository.staticScopeDetails(scope_group);

      let scope_data = {};
      scope_data.table = 'project_scopes',
        scope_data.where = {};
      scope_data.where.project_id = req.query.project_id,
        scope_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
        var  scope_data_fetch = await ConsultationhubRepository.staticScopeDetails(scope_data);


      let custom = {};
      custom.table = 'project_scopes',
        custom.where = {};

      custom.where.project_id = req.query.project_id,
        custom.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
        var  custom_table = await ConsultationhubRepository.scopeDetails(custom);


      let custom_data = {};
      custom_data.table = 'project_scopes',
        custom_data.where = {};
      custom_data.where.project_id = req.query.project_id,
        custom_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
        var custom_table_fetch = await ConsultationhubRepository.scopeDetails(custom_data);


      let custom_value = {};
      custom_value.table = 'project_scopes',
        custom_value.where = {};
        custom_value.project_id = req.query.project_id,
        custom_value.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
        var  custom_value_fetch = await ConsultationhubRepository.scopeDetails(custom_value);


      let data_demo={};
      data_demo.table='contract_info',
      data_demo.where={key_name:'client_fullname',project_id:req.query.project_id}
      

      var  fetch_info=await GenericRepository.fetchData(data_demo)
      if(fetch_info.rows.length>0)
      {
        //var client_data=fetch_info.rows[0].dataValues.client_sign_date
        var final_client_date=moment(fetch_info.rows[0].dataValues.client_sign_date).format('YYYY-MM-DD') ;
        console.log(final_client_date)


      }

      console.log("hello",final_client_date)

      var  data_contractor={};
      data_contractor.table='contract_info',
      data_contractor.where={project_id:req.body.project_id}
      

      var  fetch_contractor=await GenericRepository.fetchData(data_contractor)


      if(fetch_contractor.rows.length>0){
        var contractor_data=fetch_contractor.rows[0].dataValues.contractor_sign_date;
        var final_contract_data=moment(contractor_data).format('Do MMMM  YYYY') ;
      }

     // console.log(fetch_info.rows[0].dataValues.key_value);


      let user_cotractor={};
      user_cotractor.table='user',
      user_cotractor.where={id:req.query.id};
      var  user_cotractor_fetch=await GenericRepository.fetchData(user_cotractor)
      //console.log(user_cotractor_fetch.rows[0].dataValues.full_name);

      let project_table={};
      project_table.table='projects',
      project_table.where={id:req.query.project_id};
      var  project_table_client=await GenericRepository.fetchData(project_table)
      //console.log(project_table_client.rows[0].dsy)



      

      const contract_user={};
      contract_user.where={user_id:req.query.id};
      const contract_user_table=await ConsultationhubRepository.bankData(contract_user);
      // console.log(contract_user_table.rows[0].dataValues.user.full_name);






      var  start_date = moment().format('Do MMMM  YYYY') ;
      let date=moment().format('YYYY-MM-DD')
      
      let end_date=moment(date).add(14, 'days').format('YYYY-MM-DD');
      var   format_date=moment(end_date).format('Do MMMM  YYYY') ;
      console.log(format_date)


      let project_contracts={};
      project_contracts.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
    
      let group_name='supply_and_install_by_contractor'
      let order=[['version_no','DESC']]
      var  project_contracts_table=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);




      let project_contracts_groupname={};
      project_contracts_groupname.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
     
       group_name='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_groupname=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);


      let project_contracts_groupname_install={};
      project_contracts_groupname_install.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
     
       group_name='supplied_by_client_and_installed_by_contractor'
       order=[['version_no','DESC']]
      let project_contracts_table_groupname_install=await ConsultationhubRepository.scopeDetails_for_pdf(project_contracts,group_name,order);



      let project_contracts_custom={};
      project_contracts_custom.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
      
     let group='supply_and_install_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);


      let project_contracts_custom_groupname={};
      project_contracts_custom_groupname.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
       //type=2;
     group='supply_and_install_by_client'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_groupname=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);



      let project_contracts_custom_install={};
      project_contracts_custom_install.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};
       type=2;
     group='supplied_by_client_and_installed_by_contractor'
      order=[['version_no','DESC']]
      let project_contracts_table_custom_install=await ConsultationhubRepository.scopeDetails_for_pdf_custom(project_contracts,group,order);



      let project_contracts_fetch={};

      project_contracts_fetch.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};


      let order_for=[['version_no','DESC']]
      
      var  project_contracts_fetch_table=await ConsultationhubRepository.project_contract_fetch(project_contracts_fetch,order_for);


      let project_contracts_fetch_deafult={};
      project_contracts_fetch_deafult.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};


       order_for=[['version_no','DESC']]
      
      var  project_contracts_fetch_table_deafult=await ConsultationhubRepository.project_contract_fetch_defult(project_contracts_fetch_deafult,order_for);


      let project_contracts_fetch_deafult_maintain={};
      project_contracts_fetch_deafult_maintain.where={contractor_id:req.query.id,project_id:req.query.project_id,client_id:project_table_client.rows[0].dataValues.user_id};


       order_for=[['version_no','DESC']]
      
      var  project_contracts_fetch_table_deafult_maintain=await ConsultationhubRepository.project_contract_fetch_defult_maintain(project_contracts_fetch_deafult,order_for);








      //console.log(project_contracts_fetch_table);


      // for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
      //   console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days);


      // }




      let project_gnatt_chart={};
      project_gnatt_chart.table='project_docs',
      project_gnatt_chart.where={project_id:req.query.project_id,type:'gantt_chart',resource_description:parseInt(req.query.id)}
      var  project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);
     // console.log(project_gnatt_table.rows[0].dataValues.resource_url);



      let project_user_name={};
      project_user_name.table='projects',
      project_user_name.where={id:req.query.project_id}
      var  project_data_value=await ConsultationhubRepository.project_user_table(project_user_name);


      let project_contract_fetch={};

project_contract_fetch.where={project_id:req.query.project_id,status:1};
let project_contract_data_fetch=await ConsultationhubRepository.project_contract_user(project_contract_fetch);





let contract_metas_data={};
contract_metas_data.table='contractor_metas',
contract_metas_data.where={key_name:'cr_number',contractor_id:req.query.id}

var  contract_metas_data_fetch=await GenericRepository.fetchData(contract_metas_data);



    //console.log("data",contract_metas_data_fetch.rows[0].dataValues.key_value)

if(consultant_table.rows.length>0){

     let info_photo={};
        
     info_photo.table='resources',
     info_photo.where={user_id:consultant_table.rows[0].dataValues.user_details.id,type:'consultant_profile_photo'}
     var fetch_photo=await GenericRepository.fetchData(info_photo);

    

}


let contract_metas_fetch={};
contract_metas_fetch.table='project_contracts',
contract_metas_fetch.where={project_id:req.query.project_id,contractor_acceptance:1}
var  contract_fetch_data_table=await GenericRepository.fetchData(contract_metas_fetch);

  let user_table_data_contractor={};
  user_table_data_contractor.table='user',
  user_table_data_contractor.where={id:req.query.id};
  var user_table_fetch=await GenericRepository.fetchData(user_table_data_contractor);




//   let project_satge_is_deafult={};
//   //project_details.table = 'projects',
//   project_satge_is_deafult.table='project_stages',
//   project_satge_is_deafult.where = {};
//    project_satge.where.project_id = req.query.project_id

//  //project_satge.where.id={$in:[sequelize.literal('SELECT id FROM `project_stages` WHERE `status`=4 ')] }
// let project_satge_table_isde = await ConsultationhubRepository.fetchData(project_satge_is_deafult);

// //console.log(project_satge_table.rows[0].dataValues.project_stages[0]);
// console.log("data//////",project_satge_table_isde);



;


        //console.log("data",project_contracts_table.rows[0].dataValues.days)


    
      //   for(let i = 0; i < project_contracts_table.rows[0].contract_metas.length; i++){
      //     // console.log("id",project_contracts_table.rows[0].contract_metas[i].dataValues.id)
      //     // console.log(project_contracts_table.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.length)
      //    // console.log(project_contracts_table.rows[0].dataValues.contract_metas[i].dataValues.project_scope[0].id)
      //    console.log(project_contracts_table.rows[0].dataValues.contract_metas[i].dataValues.project_scope.dataValues.scope_description)
         
         
      // }
       
      let project_scope = {};
      //project_scope.table = 'project_scopes',
      let project_id = req.query.project_id;
       order_for=[['section_no','ASC']]
      var project_scope_table = await ConsultationhubRepository.project_scope_section(project_scope,project_id,order_for);

      console.log(project_scope_table);

      var sign_date;
      var sign_date_alter;
      var completation_date;

      let project_data_stage_task={};
      project_data_stage_task.where={id:req.query.project_id};
      let project_data_task_fetch= await ConsultationhubRepository.fetchProjectDetails(project_data_stage_task);


      let project_start_data={};
      project_start_data.table='contract_info',
      project_start_data.where={project_id:req.query.project_id};
      let order_sign=[['id','DESC']]
      var project_start_date_fetch=await GenericRepository.fetchDataOrder(project_start_data,order_sign);
    
      let project_data_check_sign={};

project_data_check_sign.table='project_contracts';
project_data_check_sign.where={project_id:req.query.project_id};
let order_version=[['id','DESC']]
var project_data_check_sign_fetch=await GenericRepository.fetchDataOrder(project_data_check_sign,order_version);

console.log(project_data_check_sign_fetch);

if(project_data_check_sign_fetch.rows.length>0){

  let project_scope_version={};
  //project_scope_version.where={project_id:req.query.project_id};
  let  order_section=[['section_no','ASC']];
  let contract_id=project_data_check_sign_fetch.rows[0].dataValues.id;
  var project_scope_version_data=await ConsultationhubRepository.project_contract_user_specifications(project_scope_version, contract_id,order_section);
  console.log('///////////',project_scope_version_data);
}

if(project_data_check_sign_fetch.rows.length>0){

if(project_data_check_sign_fetch.rows[0].dataValues.cllient_acceptance==1 && project_data_check_sign_fetch.rows[0].dataValues.contractor_acceptance==1){
  var date_1=project_start_date_fetch.rows[0].dataValues.client_sign_date;
  var date_2=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;
if(date_1 > date_2){
  sign_date=project_start_date_fetch.rows[0].dataValues.client_sign_date;
  sign_date_alter=project_start_date_fetch.rows[0].dataValues.client_sign_date;
  completation_date=project_start_date_fetch.rows[0].dataValues.client_sign_date;
}
else{
  sign_date=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;
  sign_date_alter=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;
  completation_date=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;
}
}



else if(project_data_check_sign_fetch.rows[0].dataValues.cllient_acceptance==1){
  sign_date=project_start_date_fetch.rows[0].dataValues.client_sign_date;
  sign_date_alter=project_start_date_fetch.rows[0].dataValues.client_sign_date;
  completation_date=project_start_date_fetch.rows[0].dataValues.client_sign_date;

}

else if(project_data_check_sign_fetch.rows[0].dataValues.contractor_acceptance==1){
  sign_date=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;sign_date_alter=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;
  completation_date=project_start_date_fetch.rows[0].dataValues.contractor_sign_date;


}
else{
  sign_date=moment(project_data_check_sign_fetch.rows[0].dataValues.createdAt).format('YYYY-MM-DD');
  sign_date_alter=moment(project_data_check_sign_fetch.rows[0].dataValues.createdAt).format('YYYY-MM-DD');
  completation_date=moment(project_data_check_sign_fetch.rows[0].dataValues.createdAt).format('YYYY-MM-DD');


}

}
else{
   sign_date=moment().format('YYYY-MM-DD');
   sign_date_alter=moment().format('YYYY-MM-DD');
   completation_date=moment().format('YYYY-MM-DD');

 }

console.log(sign_date);

var w=1;
var t=1;

      

//var page=1;

      var fs = require('fs');
      var pdf = require('html-pdf');
      var options = {
        format: 'A4', "border": {
          "top": "1.5cm",            // default is 0, units: mm, cm, in, px
          "right": "1.5cm",
          "bottom": "1.5cm",
          "left": "1.5cm",
          
        },
        "quality": "50",
        "footer": {
          "height": "10px",
          "contents": {
            // Any page number is working. 1-based index
            first: '',
            default: '<span style="float:right; font-size:8px;">{{page}} / {{pages}}</span>',
            // fallback value
          }
        },
      
      };


if(req.query.lang=='ara')
{
  var html= `<title>Contract Arabic</title>
  <style>
    /* page setup */
    /*@page{
      size:A4 portrait;
      margin:1.5cm;
    }
    @page :first{
      margin:0cm;
    }*/
    /* common */
    @font-face{
      font-family:'Dubai';
      src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.eot');
      src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.eot?#iefix') format('embedded-opentype'),
          url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.woff') format('woff'),
          url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Regular.ttf') format('truetype');
      font-weight:400;
      font-style:normal;
      font-display:swap;
    }
    @font-face{
      font-family:'Dubai';
      src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.eot');
      src:url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.eot?#iefix') format('embedded-opentype'),
          url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.woff') format('woff'),
          url('http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/fonts/Dubai-Bold.ttf') format('truetype');
      font-weight:700;
      font-style:normal;
      font-display:swap;
    }
    *{
      margin:0 auto;
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    body{
      /*background-color:#ccc;*/
      font-family:'Dubai',Helvetica,Geneva,Tahoma,sans-serif;
      font-weight:400;
      font-size:12px;
      color:#323130; /* rgb(50,49,48) */
      line-height:1.35;
    }
    img{
      max-width:100%;
      height:auto;
    }
    /* page */
    .page{
      direction:rtl;
      position:relative;
      display:block;
      background-color:#fff;
      box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
      /*box-sizing:border-box;*/
    }
    .page.full-height-page{
      min-height:calc( 20cm - 10px ); /* 29.7cm - 3cm */
      background:url(http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/Full-Page-Background.svg) center bottom repeat-x;
      background-size:1200px auto;
      background-color:#fff;
    }
    /* page-break */
    .page-break{
      page-break-after:always;
    }
    /* cover-image */
    .cover-image{
      position:relative;
    }
    .cover-image-pic img{
      width:100%;
    }
    .cover-image-data{
      position:absolute;
      top:40%;
      left:50%;
      z-index:1;
      -webkit-transform:translateX(-50%);
      transform:translateX(-50%);
    }
    .cover-image-data > *:last-child{
      margin-bottom:0 !important;
    }
    .cover-image-data .title{
      margin-bottom:25px;
      text-align:center;
      text-transform:uppercase;
      font-weight:500;
      font-size:40px;
      color:#14b105;
      line-height:1.2;
      letter-spacing:1px;
    }
    .cover-image-data .title strong{
      display:block;
      font-weight:700;
      color:#0346b1;
    }
    .cover-image-data .between{
      margin-bottom:15px;
      text-align:center;
      font-weight:500;
      font-size:12px;
      color:#262626;
      line-height:1.3;
    }
    .cover-image-data .between strong{
      display:block;
      margin-top:8px;
      font-weight:inherit;
      font-size:20px;
      color:#0346b1;
    }
    .cover-image-data .dated{
      margin-bottom:10px;
      text-align:center;
      font-weight:500;
      font-size:12px;
      color:#262626;
      line-height:1.2;
    }
    .cover-image-data .dated strong{
      font-weight:700;
    }
    /* page-header */
    .page-header{
      margin-bottom:25px;
    }
    .page-header .site-logo{
      text-align:center;
    }
    .page-header .site-logo img{
      width:100px;
    }
    /* page-heading */
    .page-heading{
      margin-bottom:25px;
      text-align:center;
    }
    .page-heading > *:last-child{
      margin-bottom:0 !important;
    }
    .page-heading .title{
      margin-bottom:10px;
      text-transform:uppercase;
      font-weight:700;
      font-size:18px;
      color:#323130;
    }
    .page-heading .subtitle{
      margin-bottom:6px;
      font-weight:600;
      font-size:16px;
    }
    .page-heading .description{
      margin-bottom:15px;
      font-weight:400;
      font-size:14px;
    }
    /* section-heading */
    .section-heading{
      margin-bottom:15px;
    }
    .section-heading > *:last-child{
      margin-bottom:0 !important;
    }
    .section-heading .title{
      margin-bottom:7px;
      font-weight:600;
      font-size:15px;
      color:#323130;
    }
    .section-heading .subtitle{
      margin-bottom:7px;
      font-weight:600;
      font-size:12px;
      color:#004e98;
    }
    .section-heading .description{
      margin-bottom:12px;
      font-weight:600;
      font-size:10px;
      color:#a2a2a2;
    }
    /* subject-heading */
    .subject-heading{
      margin-top:8cm;
      margin-bottom:15px;
      text-align:center;
    }
    .subject-heading > *:last-child{
      margin-bottom:0 !important;
    }
    .subject-heading .title{
      margin-bottom:7px;
      font-weight:600;
      font-size:22px;
      color:#004e98;
    }
    .subject-heading .subtitle{
      margin-bottom:25px;
      font-weight:400;
      font-size:30px;
      color:#323130;
    }
    /* user-info */
    .user-info{
      margin-bottom:15px;
      text-align:center;
    }
    .user-info > *:last-child{
      margin-bottom:0 !important;
    }
    .user-info .title{
      margin-bottom:35px;
      font-weight:600;
      font-size:10px;
      color:#004e98;
    }
    .user-info .title strong{
      display:block;
      margin-top:5px;
      font-weight:400;
      font-size:12px;
      color:#323130;
    }
    .user-info .subtitle{
      margin-bottom:30px;
      font-weight:600;
      font-size:12px;
      color:#323130;
    }
    /* user-image */
    .user-image{
      margin-bottom:50px;
      text-align:center;
    }
    .user-image > .holder{
      display:inline-block;
      vertical-align:top;
      padding-left:10px;
      padding-right:10px;
      box-sizing:border-box;
    }
    .user-image > .holder > .pic{
      margin-bottom:20px;
    }
    .user-image > .holder > .pic img{
      width:150px;
      height:150px;
      object-fit:cover;
      object-position:center center;
      border-radius:50%;
    }
    .user-image > .holder > .data{
    }
    .user-image > .holder > .data .title{
      margin-bottom:0;
      font-weight:600;
      font-size:19px;
      color:#004e98;
    }
    /* default-text */
    .default-text.text-center{
      text-align:center;
    }
    .default-text.text-left{
      text-align:justify;
    }
    .default-text > *:last-child{
      margin-bottom:0 !important;
    }
    .default-text h1{
      margin-bottom:10px;
      font-weight:600;
      font-size:18px;
      color:#323130;
    }
    .default-text h3{
      margin-bottom:10px;
      font-weight:600;
      font-size:13px;
      color:#323130;
    }
    .default-text p{
      margin-bottom:12px;
      font-weight:400;
      font-size:9px;
    }
    .default-text p.i-am-point{
      position:relative;
      padding-right:25px;
    }
    .default-text strong.number-system{
      position:absolute;
      top:0;
      right:0;
    }
    .default-text p.tab-space-1{
      position:relative;
      padding-right:52px;
    }
    .default-text p.tab-space-1 strong.number-system{
      right:20px;
    }
    .default-text p strong{
      color:#323130;
    }
    .default-text p strong.blue{
      color:#004e98;
    }
    .default-text table{
      width:100%;
      border-collapse:collapse;
      table-layout:fixed;
    }
    .default-text table > tbody > tr > td{
      vertical-align:top;
    }
    .default-text table > tbody > tr > td:first-child{
      width:30%;
      padding-left:15px;
    }
    .default-text table.signature-table > tbody > tr > td:first-child{
      width:50%;
    }
    .default-text table.signature-table > tbody > tr > td.text-left{
      text-align:left;
    }
    .default-text table.signature-table > tbody > tr > td.text-right{
      text-align:right;
    }
    .default-text table > tbody > tr > td img{
      margin-bottom:10px;
      max-height:40px;
    }
    .default-text table > tbody > tr > td hr{
      width:100%;
      max-width:200px;
      margin-bottom:10px;
      border-top:1px solid #323130;
    }
    /* page-agreement */
    .page-agreement{
      margin-bottom:25px;
    }
    /* project-drawings */
    .project-drawings{
    }
    .project-drawings-item{
      /*width:33.33%;*/
      width:100%;
      /*float:left;*/
      margin-bottom:20px;
      /*page-break-inside:avoid;*/
    }
    .project-drawings-item > .holder{
      padding-left:10px;
      padding-right:10px;
      box-sizing:border-box;
    }
    .project-drawings-item > .holder > .pic{
      margin-bottom:10px;
    }
    .project-drawings-item > .holder > .pic img{
      width:100%;
      border-radius:4px;
    }
    .project-drawings-item > .holder > .document{
      margin-bottom:10px;
      padding:20px 10px 20px 10px;
      background-color:#fff;
      border:1px solid #e3e3e3;
      border-radius:5px;
      text-align:center;
    }
    .project-drawings-item > .holder > .document > .document-icon{
      margin-bottom:15px;
    }
    .project-drawings-item > .holder > .document > .document-icon svg{
      display:inline-block;
      vertical-align:top;
      width:90px;
      height:100px;
      margin-left:-15px;
    }
    .project-drawings-item > .holder > .document > .document-link{
      margin-bottom:0;
    }
    .project-drawings-item > .holder > .document > .document-link .link{
      margin-bottom:0;
      font-weight:400;
      font-size:9px;
      color:inherit;
      text-decoration:none;
    }
    .project-drawings-item > .holder > .data{
    }
    .project-drawings-item > .holder > .data ul.tags{
      padding-right:0;
      text-align:right;
      list-style:none;
      font-size:0;
    }
    .project-drawings-item > .holder > .data ul.tags li{
      position:relative;
      display:inline-block;
      vertical-align:top;
      margin-left:7px;
      margin-bottom:7px;
      padding:3px 7px 4px 7px;
      background-color:#f3f3f3;
      border-radius:3px;
      font-weight:400;
      font-size:9px;
    }
    .project-drawings-item > .holder > .data ul.tags li:last-child{
      margin-left:0;
    }
    /* project-ganttchart */
    .project-ganttchart{
      position:relative;
      margin-bottom:25px;
      border:1px solid #e3e3e3;
    }
    .project-ganttchart img{
      width:100%;
    }
    /* table */
    .table{
      width:100%;
      margin-bottom:25px;
      background-color:#fff;
      border:1px solid #e3e3e3;
      border-collapse:collapse;
      table-layout:fixed;
    }
    .table thead tr th{
      padding:4px 10px 5px 10px;
      background-color:#f6f6f8;
      border:1px solid #e3e3e3;
      text-align:center;
      font-weight:400;
      font-size:9px;
      color:#0047ba;
    }
    .table thead tr th:last-child{
      /*border-right:none;*/
    }
    .table thead tr th.text-left{
      text-align:left;
    }
    .table thead tr th.text-right{
      text-align:right;
    }
    .table thead tr th.task-no{
      width:50px;
    }
    .table thead tr th.status,
    .table thead tr th.type,
    .table thead tr th.creator{
      width:80px;
    }
    .table thead tr th.stage-no{
      width:35px;
    }
    .table thead tr th.number-of-days{
      width:45px;
    }
    .table tbody tr th{
      padding:7px 7px 8px 7px;
      background-color:#f0f6ff;
      border:1px solid #e3e3e3;
      text-align:left;
      font-weight:400;
      font-size:11px;
      color:#0047ba;
    }
    .table tbody tr th.text-left{
      text-align:left;
    }
    .table tbody tr th.text-center{
      text-align:center;
    }
    .table tbody tr th.text-right{
      text-align:right;
    }
    .table tbody tr th.description{
      width:100px;
    }
    .table tbody tr td{
      padding:3px 7px 5px 7px;
      background-color:#fff;
      border:1px solid #e3e3e3;
      text-align:center;
      font-weight:400;
      font-size:8px;
      page-break-inside:avoid;
    }
    .table tbody tr td:last-child{
      /*border-right:none;*/
    }
    .table tbody tr td.text-left{
      text-align:left;
    }
    .table tbody tr td.text-center{
      text-align:center;
    }
    .table tbody tr td.text-right{
      text-align:right;
    }
    .table tbody tr td.success{
      color:#02d94f;
    }
    .table tbody tr td.failed{
      color:#FF0000;
    }
    .table tbody tr td.default-cell{
      background-color:#f4ba00;
    }
    .table tbody tr td.custom-cell{
      background-color:#02d94f;
      color:#fff;
    }
    .table tbody tr td.cell-xl{
      padding-top:10px;
      padding-bottom:12px;
    }
    .table tbody tr td .subject{
      margin-bottom:7px;
      font-weight:400;
      font-size:12px;
      color:#a2a2a2;
    }
    .table tbody tr td .data{
      margin-bottom:0;
      font-weight:600;
      font-size:14px;
      color:#323130;
    }
    /* table.specification-details */
    .table.specification-details-table{
      table-layout:auto;
    }
    .table.specification-details-table thead tr th{
      font-size:8px;
    }
    .table.specification-details-table tbody tr th{
      font-size:7px;
    }
    .table.specification-details-table tbody tr td{
      font-size:6px;
    }
    .table.specification-details-table tbody tr th.supply{
      width:50px;
    }
    /* project-scope */
    .project-scope{
      width:100%;
      margin-top:10px;
      margin-bottom:35px;
      border-collapse:collapse;
      /*table-layout:fixed;*/
    }
    .project-scope thead tr th{
      width:33.33%;
      vertical-align:top;
      padding:0 10px 10px 10px;
      border-bottom:1px solid #e3e3e3;
      text-align:center;
      font-weight:700;
      font-size:11px;
      color:#323130;
    }
    .project-scope tbody tr td{
      vertical-align:top;
      padding:13px 10px 0 10px;
      background-color:#fff;
      border-left:1px solid #e3e3e3;
    }
    .project-scope tbody tr td:last-child{
      border-left:none;
    }
    .project-scope tbody tr td ul.scope-list{
      padding-right:0;
      text-align:right;
      list-style:none;
    }
    .project-scope tbody tr td ul.scope-list li{
      position:relative;
      margin-bottom:7px;
      padding-right:19px;
      font-weight:400;
      font-size:9px;
    }
    .project-scope tbody tr td ul.scope-list li:last-child{
      margin-bottom:0;
    }
    .project-scope tbody tr td ul.scope-list li .list-icon{
      position:absolute;
      top:1px;
      right:0;
      -webkit-transform:rotateY(180deg);
      transform:rotateY(180deg);
    }
    /* page-userdata */
    .page-userdata{
      width:100%;
      border-collapse:collapse;
      table-layout:fixed;
    }
    .page-userdata tbody tr td{
      padding-right:10px;
      padding-left:10px;
      border-left:1px solid #e3e3e3;
    }
    .page-userdata tbody tr td:last-child{
      border-left:none;
    }
    @media print{
      .page{
        width:auto;
        margin-top:0;
        margin-bottom:0;
        box-shadow:initial;
      }
    }
  </style>

  <!-- start of page 1 -->
  <div class="page">
    <!-- cover-image -->
    <div class="cover-image">
      <!-- cover-image-pic -->
      <div class="cover-image-pic">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
      <!-- cover-image-pic -->
      <!-- cover-image-data -->
      <div class="cover-image-data">
        <h1 class="title">إتفاقية  <strong>المقاولة </strong></h1>
        <h2 class="between">بين  <strong>${project_data_value.rows[0].dataValues.user.full_name} <br> و  <br> ${project_contract_data_fetch.rows[0].dataValues.user.full_name}</strong></h2>
        <h2 class="between">إعتبارا من <br><br><strong class="black"> ${start_date}</strong></h2>
       
      </div>
      <!-- cover-image-data -->
    </div>
    <!-- cover-image -->
  </div>
  <!-- end of page 1 -->

  <div class="page-break"></div>

  <!-- start of page 2 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
        <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-agreement default-text -->
    <div class="page-agreement default-text text-center">
      <h1> إتفاقية مقاولة</h1>
      <p>حُررت اتفاقية المقاولة هذه (والمشار إليها فيما يلي باسم "الاتفاقية")، وتسري اعتباراً من  <strong class="black">${start_date}</strong> وتحل محل أية اتفاقيات  أخرى ذات صلة </p>
      <h3>بين كل من:</h3>
      <p><strong class="black">1. ${project_data_value.rows[0].dataValues.user.full_name}</strong>،<br> مواطن عماني يحمل بطاقة مدنية رقم  ${project_table_client.rows[0].dataValues.national_id} (ويشار إليه فيما يلي بـ "العميل" والذي يعني) ويشمل، حيثما يسمح السياق أو يتطلب ذلك، المتنازل لهم والورثة القانونيين وأصحاب الحق )</p>
      <p>و </p>
      <p><strong class="black">2. ${project_contract_data_fetch.rows[0].dataValues.user.full_name}</strong>،<br>تأسست وفق القوانين والأحكام العمانية بسجل تجاري رقم ,`
      if(contract_metas_data_fetch.rows.length>0) {
      html+=`&nbsp; ${contract_metas_data_fetch.rows[0].dataValues.key_value} &nbsp;`
      }
      html+=`(ويشار إليها فيما يلي بـ "المقاول" وتشمل هذه الكلمة، حيثما يتطلب السياق ذلك، المتنازل لهم والورثة القانونيين وأصحاب الحق).</p>
      <p>(يشار إلى العميل والمقاول مجتمعين بـ "الأطراف" أو بـ "الطرف" حسبما يتطلبه السياق).</p>
      <p>هذه الاتفاقية هي معاملة إلكترونية بموجب قانون المعاملات الإلكترونية (وفق المرسوم السلطاني 69/2008)، وبموجب ذلك يعبر الأطراف عن عرضهم وقبولهم من خلال الرسائل الإلكترونية.</p>
    </div>
    <!-- page-agreement default-text -->
    <!-- page-agreement default-text -->
    <div class="page-agreement default-text text-left">
      
    <h3>تمهيد:</h3>
		<p class="i-am-point"><strong class="number-system"> أ </strong> بما أن العميل والمقاول هما مستخدمين مسجلين لـدى بناء الإلكترونية <span style="color:rgb(50,49,48);">‘eBinaa’</span> (يشار إليها فيما يلي باسم "المنصة")، وهي مزود خدمة تقديم العطاءات إلكترونياً عبر الإنترنت وإدارة المشاريع أوتوماتيكيا</p>
		<p class="i-am-point"><strong class="number-system">ب </strong> وحيث يقر الطرفان بأن دور المنصة يقتصر على توفير مساحة عبر الإنترنت لكل من العميل والمقاول للاتصال وتحديد الشروط والأحكام التي تحكم العلاقة بين الطرفين.</p>
		<p class="i-am-point"><strong class="number-system">ك </strong> ج-  و يقران بأن المنصة لا تتحمل أي التزام أو مسؤولية نيابة عن العميل أو المقاول؛د-  و بأن المنصة لا تمثل ضامناً أو ضماناً أو وكيلاً أو شريكاً أو ممثلاً للمقاول أو العميل؛</p>
		<p class="i-am-point"><strong class="number-system">د </strong> هـ- وحيث أن العميل هو المالك الكلي والقانوني للعقار الموجود في</p>
		<p class="i-am-point"><strong class="number-system">ي </strong> هـ- وحيث أن العميل هو المالك الكلي والقانوني للعقار الموجود في `
    if(project_table_client.rows[0].dataValues.land_serial_no)
    {
     html+=project_table_client.rows[0].dataValues.land_serial_no+`,`+project_table_client.rows[0].dataValues.project_location
    }
    else
    {
      html+=project_table_client.rows[0].dataValues.project_location
    }
    html += `</strong> (فيما يلي <strong>“خاصية”</strong>) ورغبة في بناء أ `
    if(project_table_client.rows[0].dataValues.project_use_type=="Commercial"){
      html+='تجاري'
    }
    else{
      html+='سكني'
    }
    html+=` وحدة فوق العقار;</p>
    <p class="i-am-point"><strong class="number-system">ف </strong> الإضافية الأخرى (والمشار إليه فيما يلي بـ "المشروع")؛ </p>
		<p class="i-am-point"><strong class="number-system">ج </strong> ز- وبما أنه وفقاً لرغبة إنشاء المشروع من قبل العميل على المنصة، قدم المقاول عرضاً يحدد السعر الإجمالي الذي سيتحمله العميل لاستكمال المشروع وفقاً لمتطلبات المشروع؛</p>
		<p class="i-am-point"><strong class="number-system">ه </strong> ح- وحيث اعتبر العميل اقتراح المقاول بأنه مرضٍ ووافقت الأطراف وفقاً لذلك على العمل معاً؛</p>
		<p class="i-am-point"><strong class="number-system">ي </strong> ط- وحيث حدد التمهيد في هذه الاتفاقية فهماً واضحاً لا لبس فيه بين الطرفين وسيتم التعامل معه كجزء لا يتجزأ من هذه الاتفاقية؛</p>
		<p class="i-am-point"><strong>وبالتالي، تشهد هذه الاتفاقية على أنه وفقاً للوعود والمواثيق والاتفاقيات والشروط الواردة في هذه الاتفاقية، فإنه يتم التعهد بها والاتفاق عليها والإعلان عنها من قبل الأطراف (كما هو موضح هنا) على النحو التالي:</strong></p>

    <div class="page-break"></div>

    <h3>1. تعريفات</h3>
    <p>سيتم تطبيق التعريفات التالية في هذه الاتفاقية، ما لم يتطلب السياق خلاف ذلك</p>

    <table>
      <tbody>
        <tr>
          <td>
            <p><strong>المواصفات</strong></p>
          </td>
          <td>
            <p>تفاصيل نطاق الأعمال المحددة للأطراف والمواد والتركيبات والمستلزمات اللازمة لإكمال المشروع كما هو موضح في الجدول (هـ) من هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>الرسومات</strong></p>
          </td>
          <td>
            <p>مجموعة من رسومات البناء التي تعكس تنظيم استخدام الأراضي، وتقسيم إلى مناطق، والدخول، والحركة، والخصوصية، والأمن، وأماكن العيش، وأماكن التصريف الصحي، والمظهر، والمشاهد ثلاثية الأبعاد، والتفاصيل الهيكلية، ومخطط الأساسات، وغيرها من العوامل المماثلة المرفقة .بالجدول (و) من هذه الاتفاقية</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>الاستشاري</strong></p>
          </td>
          <td>
            <p>استشاري هندسي مرخص من وزارة التجارة والصناعة لتقديم الرسومات والخرائط والمواصفات والشروط والتصاميم والمسح والتخطيط والإشراف على التنفيذ وإسداء المشورة بشأن المشروع.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>البلدية</strong></p>
          </td>
          <td>
            <p>الهيئة الحاكمة للبلدية التي يقع فيها العقار.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>السلطة المختصة</strong></p>
          </td>
          <td>
            <p>هيئة حكومية أو شبه حكومية تؤدي وظيفتها/ وظائفها المحددة.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>تاريخ البدء بأعمال البناء</strong></p>
          </td>
          <td>
            <p>التاريخ الذي سيبدأ فيه المقاول أعمال البناء في العقار حسب المذكور في الجدول (أ) من هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>تاريخ تسليم المشروع</strong></p>
          </td>
          <td>
            <p>التاريخ الذي يتم فيه تسليم الوحدة للعميل للحيازة بعد أن يحصل المقاول على شهادة إتمام البناء من البلدية في التاريخ الذي يجب أن يكون تاريخ الانتهاء أو تاريخ الانتهاء المعدل أو قبله؛</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>تاريخ الانتهاء</strong></p>
          </td>
          <td>
            <p>التاريخ المحدد في الجدول (ب) من هذه الاتفاقية عند الانتهاء أو قبل الانتهاء من جميع أعمال البناء من قبل المقاول.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>تاريخ الانتهاء المعدل</strong></p>
          </td>
          <td>
            <p>التاريخ المحدد في الجدول (ب) من هذه الاتفاقية في وقت إنهاء أعمال البناء من قبل المقاول أو قبله وذلك بعد الأمر التغييري أو تمديد الوقت الذي يحق للمقاول الحصول عليه وفقًا لشروط هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>برنامج العمل</strong></p>
          </td>
          <td>
            <p>هو الوقت المخصص لكل مرحلة من مراحل أعمال البناء مع المهمات الواجب أداؤها من قبل المقاول والعميل في كل مرحلة من مراحل البناء حسب المنصوص عليه في الجدول (د) من هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>القيمة الفعلية للعقد "ACV"</strong></p>
          </td>
          <td>
            <p>يدفع العميل مبلغاً مقطوعاً للمقاول لإكمال أعمال البناء حسب المنصوص عليه في الجدول (ج) من هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>قيمة العقد المعدلة "RCV"</strong></p>
          </td>
          <td>
            <p>زيادة أو نقصان في القيمة الفعلية للعقد "ACV" بعد الأمر التغييري في أعمال البناء أو .الرسومات أو المواصفات على النحو المبين في الجدول (ج) من هذه الاتفاقية</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>الحساب البنكي</strong></p>
          </td>
          <td>
            <p>الحساب البنكي للمقاول المذكور في الجدول (ح) من هذه الاتفاقية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>إباحة البناء</strong></p>
          </td>
          <td>
            <p>موافقة رسمية، حسب الجدول (ز) من هذه الاتفاقية، صادرة من البلدية لإنشاء البناء على العقار بعد الاطلاع على الرسومات وتقرير التربة حسب ما هو مطبق، والموافقات من البلدية و / أو السلطات المختصة، حسب المطلوب.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>تصريح الشروع في البناء</strong></p>
          </td>
          <td>
            <p>يتم إصدار تصريح الشروع في البناء من البلدية حيث يُسمح للمقاول أن يبدأ بأعمال الحفر في العقار.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>شهادة إتمام البناء</strong></p>
          </td>
          <td>
            <p>شهادة صادرة من البلدية عند انتهاء المشروع بعد الالتزام بمتطلبات السلطات المختصة.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>س.ت.</strong></p>
          </td>
          <td>
            <p>وثيقة السجل التجاري.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>الملكية الفكرية</strong></p>
          </td>
          <td>
            <p>يعني براءات الاختراع، وحقوق الاختراعات، والتصاميم، والتخطيط الهيكلي، والتصميم المعماري، والمواصفات، ومخطط الموقع، والأسماء التجارية، والعلم بالأمور، وإظهار المعرفة والأسرار التجارية، وحقوق التأليف والنشر والحقوق ذات الصلة، والتصاميم المسجلة، وحقوق التصميم، وحقوق قواعد البيانات، والعلامات التجارية وعلامات الخدمة (في كل حالة، سواء كانت مسجلة أو غير مسجلة، بما في ذلك جميع طلبات التسجيل وحقوق التقدم بطلب تسجيل لأي منهم وجميع الحقوق في رفع دعوى على أي انتهاك سابق أو حالي) وجميع الحقوق أو أشكال الحماية التي لها ما يعادلها أو ما يشابها في التأثير في أي سلطة قضائية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>المعلومات السرية</strong></p>
          </td>
          <td>
            <p>جميع المعلومات المتعلقة ، على سبيل المثال لا الحصر، بالتصاميم، المخططات، الخرائط الأولية، المواصفات، تقرير التربة، الرسومات، الدراسات الفنية، التكاليف، الأعمال والمعلومات ذات الصلة، الأسرار التجارية، معلومات العميل، المعرفة بالأمور، الفواتير، سياسات التوظيف، الموظفين، معلومات حول المنتجات، معلومات حول الشركات المصنعة، والعمليات، بما في ذلك الأفكار والتصورات والتوقعات والعلم بالشيء والمواصفات وجميع البيانات والمستندات والتطبيقات والكشوفات والبرامج والخطط والأوراق والسير الذاتية والسجلات وغيرها من الوثائق التي تحتوي على و/أو تتعلق بهذه المعلومات السرية، وأية معلومات وجميع المعلومات ذات القيمة للطرف أو الأطراف، أو التي تمنح الطرف أو الأطراف ميزة على المنافسة، أو التي تعاملها الأطراف وتحددها على أنها سرية.</p>
          </td>
        </tr>
        <tr>
          <td>
            <p><strong>القانون الواجب التطبيق</strong></p>
          </td>
          <td>
            <p>قوانين سلطنة عمان.</p>
          </td>
        </tr>
      </tbody>
    </table>

    <h3>2.تفسيرات</h3>
    <p class="i-am-point"><strong class="number-system">1.2.</strong> الإشارة إلى طرف من الأطراف هي إشارة لأي طرف قام بالتوقيع على هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">2.2.</strong> الإشارة إلى بند من البنود أو إلى جدول أو ملحق هو إشارة إلى بند أو جدول في هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">3.2.</strong> تشكل الجداول جزءأً من هذه الاتفاقية ولديها ذات التأثير كما لو أنها ضمن نص الاتفاقية. والإشارة إلى هذه الاتفاقية تعني أيضاً الإشارة إلى الجداول المرفقة بها. </p>  
    <p class="i-am-point"><strong class="number-system">4.2.</strong> الإشارة إلى هذه الاتفاقية أو إلى أي مستند آخر يتضمن أيضاً الإشارة إلى أي تعديل أو استبدال لأي منهما.</p>
    <p class="i-am-point"><strong class="number-system">5.2.</strong> الإشارة إلى أي قانون يعني أيضاً الإشارة إلى الأحكام والنظم والتشريعات والتعديلات وإعادة الإصدار أو الاستبدال لأي منها.</p>
    <p class="i-am-point"><strong class="number-system">6.2.</strong> إذا تم تحديد فترة وهي جزء من يوم معين أو يوم عمل أو حدث، فيجب احتساب وضم ذلك اليوم.</p>
    <p class="i-am-point"><strong class="number-system">7.2.</strong> كان سيتم تنفيذ الالتزام في يوم معين يقع في عطلة عامة أو يوم الجمعة، فسيتم تنفيذ هذا الالتزام في يوم العمل التالي الذي يلي هذه العطلة الرسمية أو يوم الجمعة.</p>

    <h3>3.نطاق العمل، والموافقات والغرامات</h3>
    <p class="i-am-point"><strong class="number-system">1.3.</strong> يكون العميل مسؤولاً عما يلي:</p>
    <p class="tab-space-1"><strong class="number-system">1.1.3.</strong> 1 أداء المهمات المحددة للعميل في برنامج الأعمال ضمن الفترة المحددة وفق المنصوص عليه بالنسبة لأداء كل مهمة من المهمات. أداء المهمات خلال فترة 14 يوم التي تتبع استلام الطلب من المقاول. وأي تمديد مطلوب للوقت سيخضع للبند رقم 11.</p>
    <p class="tab-space-1"><strong class="number-system">2.1.3.</strong>  تعيين استشاري، التفاصيل مذكورة في الجدول (ك) من هذه الاتفاقية، للإشراف على تنفيذ الرسومات والالتزام بالمواصفات وأعمال البناء وفق المهمات المحددة للاستشاري في برنامج الأعمال. وفي حال فشل العميل في تعيين استشاري للإشراف على تنفيذ الرسومات والالتزام بالمواصفات وأعمال البناء عندها سيكون العميل مسؤولاً على ضمان تنفيذ مهمات الاستشاري ضمن الفترة المطلوبة من الوقت حسب المنصوص عليه في برنامج الأعمال.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.3.</strong> الحصول على تقرير تربة من شركة متخصصة أو من مختبر معتمد في حال كان ذلك مطلوباً من البلدية أو من الاستشاري.</p>
    <p class="tab-space-1"><strong class="number-system">4.1.3.</strong>الحصول على موافقات من الجهات المختصة حسب ما تتطلبه قوانين البلدية لحين إصدار إباحة البناء من البلدية.</p>
    <p class="tab-space-1"><strong class="number-system">5.1.3.</strong>التأكد أنه تم وضع علامات على حدود العقار بالشكل المناسب وبالارتفاع المطلوب من قبل الجهات المختصة.</p>
    <p class="tab-space-1"><strong class="number-system">6.1.3.</strong>الحصول على أية موافقات أخرى مطلوب الحصول عليها من البلدية أو من الجهات المختصة قبل إصدار إباحة البناء من البلدية.</p>
    <p class="i-am-point"><strong class="number-system">2.3.</strong> يكون المقاول مسؤولاً عما يلي:</p>
    <p class="tab-space-1"><strong class="number-system">1.2.3.</strong>تنفيذ المهمات المحددة له في برنامج الأعمال ضمن الفترة المحددة من الوقت المنصوص عليه في أداء كل مهمة من المهام.</p>
    <p class="tab-space-1"><strong class="number-system">2.2.3.</strong> وضع سور للعقار قبل البدء بأعمال البناء.</p>
    <p class="tab-space-1"><strong class="number-system">3.2.3.</strong> التأكد أن تبدأ أعمال البناء في العقار على الفور ودون تأخير بحلول التاريخ المحدد للبدء بالبناء.</p>
    <p class="tab-space-1"><strong class="number-system">4.2.3.</strong> دفع تكاليف تصريح الشروع في البناء والحصول على التصريح من البلدية فوراً بعد التوقيع على هذه الاتفاقية.</p>
    <p class="tab-space-1"><strong class="number-system">5.2.3.</strong>ضمان أن تكون أعمال البناء متوافقة مع الرسومات والمواصفات.</p>
    <p class="tab-space-1"><strong class="number-system">6.2.3.</strong> التأكد أن تنتهي أعمال البناء بحلول تاريخ الانتهاء أو التاريخ الانتهاء المعدل أو قبله، حسب ما هو مطبق.</p>
    <p class="tab-space-1"><strong class="number-system">7.2.3.</strong>تقديم لائحة المواد والكميات المطلوب توريدها من قبل العميل وفق المواصفات إلى العميل خلال 30 يوم من بدء تاريخ أعمال البناء.</p>
    <p class="tab-space-1"><strong class="number-system">8.2.3.</strong> التأكد أن التفتيش المطلوب من البلدية قد تم تنفيذه. </p>
    <p class="tab-space-1"><strong class="number-system">9.2.3.</strong>السماح للاستشاري بأن يقوم بالتفتيش على أعمال البناء في كل مرحلة من مراحل العمل حسب المذكور في برنامج الأعمال أو كيفما أو عندما يرى الاستشاري أو العميل ذلك مناسباً؛</p>
    <p class="tab-space-1"><strong class="number-system">10.2.3.</strong> الالتزام بموافقات الاستشاري وتوصياته وملاحظاته للتوافق مع الرسومات والمواصفات.</p>
    <p class="tab-space-1"><strong class="number-system">11.2.3.</strong>الحصول على شهادة إتمام البناء الصادرة من البلدية ودفع تكاليفها بعد أن تقوم البلدية بتفتيش المشروع  عقب الانتهاء من أعمال البناء.</p>
    <p class="tab-space-1"><strong class="number-system">12.2.3.</strong>التأكد أن المشروع متوافق مع متطلبات البلدية و/أو الهيئات المختصة لتوصيله بالخدمات العامة قبل تسليم الوحدة إلى العميل بتاريخ تسليم المشروع</p>
    <p class="i-am-point"><strong class="number-system">3.3.</strong>بالإضافة إلى التفاصيل السابقة الموضحة في الفقرة 3-1 و3-2، المفهوم بشكل عام وموافق عليه من قبل الطرفين هو أن جميع التصاريح والموافقات المطلوبة للحصول على إباحة البناء يجب أن يتم الحصول عليها و/أو دفع تكاليفها من قبل العميل، في حين يجب الحصول على جميع التصاريح والموافقات منذ بدء أعمال البناء حتى تاريخ تسليم المشروع و دفع تكاليفها من قبل المقاول.</p>
    <p class="i-am-point"><strong class="number-system">4.3.</strong>ية غرامات تفرضها البلدية أو السلطة المختصة والتي تنشأ من أعمال البناء بسبب عدم الالتزام بأحكام القانون الواجب التطبيق أو التي تتعلق بالمقاول، يجب أن يتحملها المقاول.</p>

    <h3>4. المواد والمعدات واللافتات</h3>
    <p class="i-am-point"><strong class="number-system">1.4.</strong>المواد </p>
    <p class="tab-space-1"><strong class="number-system">1.1.4.</strong> المواد التي سيقدمها العميل وفقاً للمواصفات المدرجة في الجدول (ز) يجب أن يوفرها في العقار حسب الوقت المحدد المنصوص عليه في برنامج الأعمال.</p>
    <p class="tab-space-1"><strong class="number-system">2.1.4.</strong>يقدم المقاول إلى العميل لائحة بالمواد التي سيتم توريدها من قبل العميل خلال 30 يوم من بدء تاريخ أعمال البناء، حيث يحدد بوضوح الكميات والمراحل التي سيتم فيها توريد المواد من قبل العميل.</p>
    <p class="tab-space-1">شرط في حال كانت المواد الموفرة من قبل العميل غير متوافقة مع الكميات المحددة في لائحة المواد، عندها يقوم المقاول فوراً بإبلاغ العميل لتوريد مواد إضافية، ويتحمل المقاول غرامات تأخير المشروع في حال أن الكميات المحددة في لائحة المواد غير كافية لإتمام الأعمال.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.4.</strong>يضمن المقاول أن المواد التي سيتم توريدها من قبله من حيث المواصفات المذكورة في الجدول (هـ) هي متوفرة في العقار وأنه لا يوجد تأخير في  أعمال البناء بسبب عدم توفر المواد.</p>
    <p class="tab-space-1"><strong class="number-system">4.1.4.</strong>يضمن المقاول أن جميع المواد المستخدمة في أعمال البناء هي وفق المواصفات، وفي حال عدم وجود مواصفات/متطلبات عندها يجب أن تكون المواد متوافقة مع المعايير العمانية ويجب أن يتم تقديمها للاستشاري للموافقة عليها.</p>
    <p class="tab-space-1">شريطة أن تستوفي المواد المدرجة في المواصفات، على الأقل، الحد الأدنى لمتطلبات البلدية أو السلطة المختصة.</p>
    <p class="tab-space-1"><strong class="number-system">5.1.4.</strong> يجب على المقاول التأكد من أن جميع المواد المؤقتة المستخدمة في أعمال البناء تتوافق مع المعايير المعتمدة في سلطنة عمان.</p>
    <p class="tab-space-1"><strong class="number-system">6.1.4.</strong>يجب على المقاول التأكد من أن جميع المواد المستخدمة في أعمال البناء ، بما في ذلك المواد التي يوفرها العميل، يتم صيانتها وتأمينها بشكل صحيح داخل حدود العقار وأنه يتم إزالة المواد بشكل صحيح من العقار عندما لم تعد هناك حاجة إلى مادة معينة لأعمال بناء.</p>
    <p class="tab-space-1"><strong class="number-system">7.1.4.</strong>يجب على المقاول إعادة المواد التي قدمها العميل إلى المقاول والتي بقيت غير مستخدمة بعد الانتهاء من الأنشطة وفقاً لبرامج الأعمال حيث كان يتوجب استخدام هذه المواد.</p>
    <p class="tab-space-1"><strong class="number-system">8.1.4.</strong>يجب على المقاول التأكد من إزالة نفايات أعمال البناء بشكل صحيح من حدود العقار خلال برنامج الأعمال وبعد الحصول على الموافقات اللازمة من البلدية، إذا لزم الأمر، إلى المناطق التي تحددها البلدية للتخلص من نفايات أعمال البناء.</p>
    <p class="i-am-point"><strong class="number-system">2.4.</strong>يبقى المقاول مسؤولاً عن جميع الخسائر الناشئة عن سرقة أو فقدان أو تلف للمواد الموجودة في العقار، سواء تم توفيرها من قبل العميل أو المقاول من الباطن.</p>
    <p class="i-am-point"><strong class="number-system">3.4.</strong>معدات  </p>
    <p class="tab-space-1"><strong class="number-system">1.3.4.</strong> إن المقاول مسؤولاً عن التأكد من أن المعدات التي سيتم استخدامها في أعمال البناء متوفرة في العقار وتكون آمنة ويتم صيانتها بشكل صحيح داخل حدود العقار وإزالتها على الفور عندما لم تعد هذه المعدات مطلوبة لأعمال البناء</p>
    <p class="i-am-point"><strong class="number-system">4.4.</strong>لافتات  </p>
    <p class="tab-space-1"><strong class="number-system">1.4.4.</strong> يجب على المقاول، وقبل تاريخ البدء بأعمال البناء، تثبيت لافتة في العقار تعرض جميع المعلومات التي تطلبها البلدية بالتفاصيل المذكورة في الجدول (ل).</p>

    <h3>5. القوى العاملة للمقاول</h3>
    <p class="i-am-point"><strong class="number-system">1.5.</strong>فيما يتعلق بأعمال البناء في العقار يقوم المقاول بتوفير وتوظيف ما يلي: </p>
    <p class="tab-space-1"><strong class="number-system">1.1.5.</strong> مدير مشروع كفء وذو خبرة، وفق التفاصيل الواردة في الجدول (ح) من هذه الاتفاقية، مع مؤهل هندسي معتمد لضمان اكتمال أعمال البناء بما يتماشى مع شروط هذه الاتفاقية.</p>
    <p class="i-am-point"><strong>موعد الإكمال </strong></p>
    <p class="tab-space-1"><strong class="number-system">2.1.5.</strong>  المساعدين الفنيين  ومشرفي العمال من ذوي المهارات والخبرة في اختصاصاتهم فقط، وذلك لتقديم الإشراف المناسب على العمل المطلوب منهم الإشراف عليه.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.5.</strong>تعيين عمال ماهرين ونصف ماهرين وغير ماهرين، حسب الضرورة، من أجل تنفيذ العمل ضمن الوقت المحدد والانتهاء منه وصيانة الوحدة. </p>
    <p class="i-am-point"><strong class="number-system">2.5.</strong>يكون المقاول مسؤولاً عن التعاقد مع جميع العمال، محليين أو غيرهم، وعن النقل والسكن وتوفير الطعام والرواتب، وذلك وفقاً للقانون المعمول به. </p>
    <p class="i-am-point"><strong class="number-system">3.5.</strong>لا يستخدم المقاول العقار كسكن أو مكان إقامة للعمال ما لم يحصل على موافقة العميل على ذلك.</p>
    <p class="i-am-point"><strong class="number-system">4.5.</strong>عند الانتهاء من أعمال البناء يجب على المقاول التأكد من إزالة أية هياكل مؤقتة تم نصبها كسكن للقوى العاملة، وفقًا للقانون المعمول به، وأنها قد تمت إزالتها من العقار قبل تاريخ تسليم المشروع.</p>

    <h3>6. المقاول من الباطن</h3>
    <p class="i-am-point"><strong class="number-system">1.6.</strong> لا يجوز للمقاول التعاقد من الباطن لأعمال البناء بالكامل باستثناء أجزاء من أعمال البناء على ألا تتجاوز 50% من إجمالي أعمال البناء</p>
    <p class="i-am-point"><strong class="number-system">2.6.</strong> يجب على المقاول التأكد من التزام المقاول من الباطن بأحكام هذه الاتفاقية فيما يتعلق ببرنامج الأعمال والمواصفات والرسومات وأية متطلبات أخرى تتعلق بأعمال البناء.</p>
    <p class="i-am-point"><strong class="number-system">3.6.</strong>بموجب هذا العقد، يتحمل المقاول المسؤولية الكاملة عن أعمال البناء التي ينفذها المقاول من الباطن إلى جانب مسؤولية دفع المبالغ المستحقة للمقاول من الباطن لأعمال البناء التي ينفذها المقاول من الباطن.</p>
    <p class="i-am-point"><strong class="number-system">4.6.</strong>يخلي العميل في هذه الاتفاقية أية مسؤولية تجاه المقاول من الباطن بما يخص الدفع أو توفير المواد والعمالة والمعدات أو أية متطلبات إضافية للمقاول من الباطن لتنفيذ أعمال البناء.بالإضافة إلى أنه في حال تم التعاقد مع المقاول من الباطن من قبل العميل لأداء بعض الأعمال في العقار، فيجب على المقاول تقديم المساعدة الكاملة إلى هذا المقاول من الباطن وتسهيل إتمام أعماله في العقار.</p>
    <p class="i-am-point">شريطة أيضاً ألا يتحمل المقاول أية مسؤولية دفع للمقاول من الباطن الذي استأجره العميل ولا عن العمل الذي يقوم به هذا المقاول من الباطن.</p>
    <p class="i-am-point"><strong class="number-system">5.6.</strong>يلا تخضع هذه الاستحقاقات والتزامات المقاول من الباطن لهذه الاتفاقية وهي مسألة تقع ضمن النطاق الحصري بين المقاول والمقاول من الباطن.</p>

    <h3>7. الصحة والسلامة والأمن</h3>
    <p class="i-am-point"><strong class="number-system">1.7.</strong>يجب على المقاول خلال فترة أعمال البناء أن يراعي تماماً سلامة جميع الأشخاص في العقار. </p>
    <p class="i-am-point"><strong class="number-system">2.7.</strong> على المقاول أن يقوم بشكل خاص بما يلي:</p>
    <p class="tab-space-1"><strong class="number-system">1.2.7.</strong>ضمان السلامة الكافية عند حواف السطح أو الطوابق العالية.</p>
    <p class="tab-space-1"><strong class="number-system">2.2.7.</strong>ضمان القيام بأعمال تشييد آمنة للهياكل المؤقتة. </p>
    <p class="tab-space-1"><strong class="number-system">3.2.7.</strong>الحفاظ على الممتلكات وأعمال البناء في حالة منظمة مناسبة لتجنب الخطر على جميع الأشخاص في الممتلكات.</p>
    <p class="tab-space-1"><strong class="number-system">4.2.7.</strong>المحافظة على جميع الأضواء والأسوار والعلامات التحذيرية على النحو المطلوب بموجب القانون المعمول به، وعلى حساب المقاول.</p>
    <p class="tab-space-1"><strong class="number-system">5.2.7.</strong>وظيف حارس أو حراس في العقار ، وفقاً للقانون المعمول به، من تاريخ بدء البناء حتى تاريخ تسليم المشروع، والتأكد من أن العقار لا يزال محمياً في جميع الأوقات في اليوم.</p>

    <h3>8.الفترة الزمنية</h3>
    <p class="i-am-point"><strong class="number-system">1.8.</strong>يتفق الأطراف بموجب هذه الاتفاقية على أن حساب الفترة الزمنية لإنجاز أعمال البناء يتم حسابها من بداية تاريخ البدء بأعمال البناء وينتهي بتاريخ الانتهاء أو تاريخ الانتهاء المعدل، حسب المطبق، بينما يتم تحديد تاريخ البدء وتاريخ الانتهاء أو تاريخ الانتهاء المعدل، على النحو التالي:</p>
    <p class="i-am-point"><strong>تاريخ البدء بأعمال البناء:</strong></p>
    <p class="tab-space-1"><strong class="number-system">1.1.8.</strong>هو 14 يوم من تاريخ التوقيع الإلكتروني على هذه الاتفاقية أو من تاريخ استلام الدفعة المقدمة من العميل، أيهما أبعد، سيمثل تاريخ البدء بأعمال البناء.</p>
    <p class="i-am-point"><strong>تاريخ الانتهاء:</strong></p>
    <p class="tab-space-1"><strong class="number-system">2.1.8.</strong>يقع تاريخ الانتهاء في التاريخ الذي يلي انتهاء فترة بناء المشروع حسب برنامج الأعمال التي تبدأ فيه الفترة الزمنية من تاريخ البدء بأعمال البناء.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.8.</strong>ييمكن أن يتم تعديل تاريخ الانتهاء حسب البند 11 من هذه الاتفاقية أو تبعاً للأمر التغييري، ويتم التعامل مع تاريخ الانتهاء المعدل كتاريخ معدل للانتهاء من الأعمال ويتم تسجيله في ذات الجدول كتاريخ للانتهاء، وهو الجدول (ب).</p>

    <h3>9.شروط الدفع</h3>
    <p class="i-am-point"><strong class="number-system">1.9.</strong>يحق للمقاول فقط الحصول على مبلغ مقطوع بإجمالي قيمة العقد الفعلية أو المعدلة، حسب ما هو مطبق، لكامل أعمال البناء مقسمة إلى عدد المراحل المدرجة في برنامج الأعمال، وأي متغيرات في أسعار المواد أو المعدات أو العمالة أو المقاول من الباطن أو أي عنصر إضافي للانتهاء من أعمال البناء، سيكون على نفقة المقاول</p>
    <p class="i-am-point"><strong class="number-system">2.9.</strong>يحق للمقاول الحصول على المدفوعات عند الانتهاء من كل مرحلة من الأعمال المدرجة في برنامج الأعمال وفقاً لشروط الدفع المنصوص عليها في الجدول (ج) من هذه الاتفاقية ومصدقة من قبل الاستشاري، حيث تم تعيينه من قبل العميل للإشراف على تنفيذ أعمال البناء.</p>
    <p class="i-am-point">بشرط في حال عدم تعيين استشاري، يجب على المقاول تقديم تعهد مكتوب بأن مرحلة العمل المتوجب الدفع لها وفقاً لبرنامج الأعمال تكون مكتملة وفقاً لمتطلبات القانون المعمول به والرسومات والمواصفات.</p>
    <p class="i-am-point"><strong class="number-system">3.9.</strong>يجب على العميل إيداع الدفعة في الحساب المصرفي خلال أربعة عشر (14) يوماً من استلام الفاتورة التي وافق عليها الاستشاري بعد أن يقوم الاستشاري بفحص العمل المكتمل وفق برنامج الأعمال.</p>
    <p class="i-am-point">بشرط أنه في حال عدم تعيين استشاري، يجب على العميل إيداع الدفعة في الحساب المصرفي خلال أربعة عشر (14) يوماً بعد استلام التعهد الخطي الذي قدمه المقاول من حيث الشرط المنصوص عليه في البند 9-2 من هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">4.9.</strong>في حال تأخر الدفع لفترة أكثر من أربعة عشر (14) يوماً على النحو المنصوص عليه في البند 9-3 من هذه الاتفاقية، عندها فقط يحق للمقاول المطالبة بتمديد للوقت وفق البند 11 من هذه الاتفاقية.</p>
    <p class="i-am-point">شريطة ألا يؤثر التأخير في الدفع على التزامات المقاول للمضي في أعمال البناء وفقاً لبرنامج الأعمال ولغاية ستين (60) يوم من تاريخ إصدار الفاتورة حيث يمكن للمقاول أن يعلق أعمال البناء في حال عدم الدفع لغاية أن يتم الدفع.</p>
    <p class="i-am-point">بالإضافة إلى أن المقاول لن يحق له المطالبة بأي رسوم عن التأخير بالدفع أو أي تكاليف أخرى مرتبطة بذلك التأخير بالدفع.</p>
    <p class="i-am-point"><strong class="number-system">5.9.</strong>بموجب البند 11، في حال فشل المقاول في إكمال أعمال البناء وفقاً لبرنامج الأعمال، عندها يحق للعميل أن يطالب المقاول بـ 0,5% من قيمة العقد الفعلية أو المعدلة، وفق ما هو مطبق، عن كل تأخير لمدة ثلاثين (30) يوم تُحسب من تاريخ الانتهاء أو من تاريخ الانتهاء المعدل، حسب ما هو مطبق، على ألا تتجاوز 8% من قيمة العقد الفعلية أو المعدلة، وفق ما هو مطبق، أو أن يتم خصم المبلغ المستحق للعميل من الرصيد المستحق للمقاول.</p>

    <h3>10. المتغيرات</h3>
    <p class="i-am-point"><strong class="number-system">1.10.</strong>يسمح المقاول للعميل بإجراء تعديلات طفيفة بحيث لا يتم تغيير الرسوم أو المواصفات بشكل جوهري، وذلك وفقاً لتقدير المقاول.</p>
    <p class="i-am-point"><strong class="number-system">2.10.</strong>أية متغيرات في الرسومات أو المواصفات أو أي جانب آخر متعلق بأعمال البناء للوحدة إما زيادة أو نقصان في القيمة الفعلية للعقد، يتوجب حلها من قبل الأطراف بشكل متبادل عندما تدعو الحاجة لذلك.</p>
    <p class="i-am-point">شريطة ألا تؤثر المفاوضات بين الطرفين بشأن المتغيرات على التزامات كل طرف تحت هذه الاتفاقية، ما لم تؤدي المفاوضات إلى اتفاق لتعديل نطاق هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">3.10.</strong>يجب توثيق المتغيرات المتفق عليها كأمر تغييري ويجب أن تحدد بوضوح المعايير التالية:</p>
    <p class="tab-space-1"><strong class="number-system">1.3.10.</strong>تفاصيل المرحلة: تحديد التعديلات التي تمت على المرحلة أو إضافة مرحلة جديدة في برنامج الأعمال.</p>
    <p class="tab-space-1"><strong class="number-system">2.3.10.</strong>التغيير في نطاق العمل: تحديد التعديلات التي تمت على الرسومات أو المواصفات بشكل واضح.</p>
    <p class="tab-space-1"><strong class="number-system">3.3.10.</strong> التغيير في الوقت: يجب تحديد تمديد الوقت، إن وجد، بشكل واضح.</p>
    <p class="tab-space-1"><strong class="number-system">4.3.10.</strong> التغيير في القيمة النقدية: يجب تحديد مبلغ قيمة العقد المعدلة بشكل واضح.</p>
    <p class="tab-space-1"><strong class="number-system">5.3.10.</strong>عندما لا يكون عامل محدد من العوامل جزءاً من الأمر التغييري، يجب أن يتم ذكر ذلك.يجب تسجيل التغييرات الخاصة بالأمر التغييري في الجدول ذو الصلة في هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">4.10.</strong>يتحمل المقاول تكلفة أي انحراف عن الرسومات و/أو المواصفات في حالة عدم وجود أي أمر تغييري.</p>

    <h3>11.تمديد الوقت</h3>
    <p class="i-am-point"><strong class="number-system">1.11.</strong>يحق للمقاول المطالبة بتمديد الوقت لعدد من الأيام التي تساوي التأخير الذي حصل بسبب العميل في حال قام العميل بما يلي: </p>
    <p class="tab-space-1"><strong class="number-system">1.1.11.</strong> تأخير الدفع لأكثر من أربعة عشر (14) يوماً من تاريخ استحقاق الدفع وفق البند 9-3 من هذه الاتفاقية ولغاية التاريخ الذي يتم فيه الدفع، </p>
    <p class="tab-space-1"><strong class="number-system">2.1.11.</strong>التأخير غير المبرر في طلب الموافقة الذي قدمه المقاول ودون أي عذر لمدة تفوق أربعة عشر (14) يوماً من تاريخ استحقاق الموافقة ولغاية تاريخ تسليم الموافقة</p>
    <p class="tab-space-1"><strong class="number-system">3.1.11.</strong>التأخير في تسليم المواد أو أداء المهام المسندة للعميل في برنامج الأعمال لأكثر من أربعة عشر (14) يوماً من تاريخ استحقاق توفير المواد أو أداء المهمة المعينة ولغاية وقت تسليم المواد أو لغاية تنفيذ المهمة.</p>
    <p class="i-am-point"><strong class="number-system">2.11.</strong>كما يحق للمقاول المطالبة بتمديد الوقت عن التأخير في تنفيذ أعمال البناء المنفذة وفقاً لبرنامج الأعمال حيث لا يعزى هذا التأخير إلى المقاول أو موظفي المقاول أو المقاول من الباطن ولكنه نشأ عن وضع خارج عن سيطرة المقاول. دون المساس بعمومية ما سبق، يعتبر ما يلي أسباباً خارجة عن إرادة المقاول بشكل معقول: القضاء والقدر، الانفجارات، الفيضانات، الأعاصير، الحريق أو الحرب العرضية أوالتهديد بالحرب، أعمال التخريب، التمرد، أو الاضطراب المدني أو أعمال الحيازة والاستيلاء.</p>
    <p class="i-am-point">بالإضافة إلى أن تمديد الوقت الممنوح للمقاول يجب أن يغطي فقط عدد الأيام المحسوبة بشكل مرضٍ من قبل المقاول مبيناً عدم قدرته على تنفيذ أعمال البناء لأسباب خارجة عن إرادته.</p>

    <h3>12. استخدام المنصة</h3>
    <p class="i-am-point"><strong class="number-system">1.12.</strong>يجوز للعميل فرض استخدام المنصة لأغراض مراقبة تقدم أعمال البناء والمسائل الأخرى المتعلقة بالمشروع عن طريق إلزام المقاول بما يلي:</p>
    <p class="tab-space-1"><strong class="number-system">1.1.12.</strong>تحديث المنصة بشكل دوري بتحديثات حول أعمال البناء.</p>
    <p class="tab-space-1"><strong class="number-system">2.1.12.</strong> إدراج إكمال الأنشطة وفقا لبرنامج الأعمال.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.12.</strong>تحميل صور توضيحية عن الالتزام بالمواصفات والرسومات.</p>
    <p class="tab-space-1"><strong class="number-system">4.1.12.</strong>أداء المهام المسندة إلى كل طرف من الأطراف في برنامج الأعمال، على سبيل المثال لا الحصر، طلب عمليات التفتيش، وتقديم الفواتير، طلب الموافقات على المواد، وإصدار الأوامر التغييرية، والرد على مسائل الجودة، وما إلى ذلك.</p>
    <p class="tab-space-1"><strong class="number-system">5.1.12.</strong>بتوجيه جميع الاتصالات من خلال المنصة لأغراض التسجيل. </p>

    <h3>13.فترة الصيانة والضمان</h3>
    <p class="i-am-point"><strong class="number-system">1.13.</strong>يدفع العميل 5% من قيمة العقد الفعلية أو من القيمة المعدلة، حسب المطبق، بعد الانتهاء من فترة الصيانة والانتهاء من أعمال الإصلاحات المطلوبة. </p>
    <p class="i-am-point"><strong class="number-system">2.13.</strong>يتفق الطرفان في هذه الاتفاقية على أن فترة الصيانة التي تمتد على فترة اثني عشر (12) شهراً على النحو المنصوص عليه في برنامج الأعمال تبدأ من اليوم الذي تصدر فيه البلدية شهادة إتمام البناء.</p>
    <p class="i-am-point"><strong class="number-system">3.13.</strong>خلال فترة الصيانة، يكون المقاول مسؤولاً عن إزالة أي عيوب تنشأ عن أعمال البناء.</p>
    <p class="i-am-point"><strong class="number-system">4.13.</strong>في حال فشل المقاول في تنفيذ الأعمال التصحيحية خلال فترة الصيانة، يحق للعميل استخدام 5 ٪ من قيمة العقد الفعلية أو المعدلة، حسب ما هو مطبق، والتي يحتفظ بها العميل خلال فترة الصيانة لإكمال الأعمال التصحيحية، وفي حال لم يكن المبلغ كافياً، يتحمل المقاول أية تكلفة ينفقها العميل تزيد عن 5٪ لإنجاز الأعمال التصحيحية.</p>
    <p class="i-am-point"><strong class="number-system">5.13.</strong>يوافق المقاول بموجب هذه الاتفاقية ويتعهد بأن يظل مسؤولاً عن أعمال البناء التي أنجزها لمدة عشرة (10) سنوات من تاريخ تسليم المشروع.</p>

    <h3>14.التمثيل والضمانات</h3>
    <p class="i-am-point"><strong class="number-system">1.14.</strong>يمثل كل طرف للطرف الآخر، بالانفراد وليس بالتضامن، ما يلي:</p>
    <p class="tab-space-1"><strong class="number-system">1.1.14.</strong> يتمتع كل طرف بالسلطة والصلاحية الكاملة لإبرام هذه الاتفاقية وتنفيذها وتسليمها وأداء المهام المتوخاة بموجبها، وأن هذا الطرف قد تم تأسيسه أو تنظيمه وتواجده أصولاً بموجب القوانين المختصة في سلطنة عمان، وأن التنفيذ والتسليم بواسطة ذلك الطرف في هذه الاتفاقية وأداء هذا الطرف للمهام المتوخاة بموجب هذه الاتفاقية هو مرخص أصولاً على النحو الواجب حسب الإجراءات التجارية وغيرها المتخذة من ذلك الطرف وحسب السلطة المختصة أو البلدية .</p>
    <p class="tab-space-1"><strong class="number-system">2.1.14.</strong>بافتراض وجود التفويض والتنفيذ والتسليم الواجب من قبل الطرف الآخر، فإن هذه الاتفاقية تشكل التزاماً قانونياً وصالحاً وملزماً لهذا الطرف، وتكون سارية على هذا الطرف وفقاً لشروطها، باستثناء أن قابلية الإلزام هذه قد تكون محدودة في حال الإفلاس والإعسار أو إعادة التنظيم أو الوقف الاختياري أو تلك القوانين المماثلة التي تمس حقوق الدائنين بشكل عام.</p>
    <p class="tab-space-1"><strong class="number-system">3.1.14.</strong>يكون كل طرف، اعتباراً من تاريخ هذه الاتفاقية، مقتدراً ولديه الموارد اللازمة، العينية والنقدية، للوفاء بالالتزامات النقدية و/أو الالتزامات الأخرى بموجب هذه الاتفاقية.</p>

    <h3>15.التعويض</h3>
    <p class="i-am-point"><strong class="number-system">1.15.</strong>يوافق المقاول على إبقاء العميل والشركات التابعة له ومديريه ومسؤوليه وموظفيه ومقاوليه والوكلاء والموردين والمستخدمين وورثته والمتنازل لهم بعيدين عن أية تكاليف وجميع التكاليف (بما في ذلك أجور المحاماة وتكاليف المحاكم على أساس التعويض) والدفاع عنهم وحمايتهم وتعويضهم من جميع المصاريف والغرامات والعقوبات والخسائر والأضرار والالتزامات الناشئة عن أي ضرر يلحق بالمباني المجاورة أو قطع الأرض أو المرافق العامة أثناء أعمال البناء أو ما ينشأ عن أعمال البناء.</p>

    <h3>16.إنهاء الاتفاقية</h3>
    <p class="i-am-point"><strong class="number-system">1.16.</strong>يجوز للعميل إنهاء هذه الاتفاقية بإخطار مكتوب يرسله للمقاول مدته ستين (60) يوماً.شريطة أن يتحقق الإنهاء فقط عند انتهاء فترة الإشعار البالغة 60 يوماً والدفع مقابل جميع أعمال البناء المكتملة إلى أن يصبح تاريخ الإنهاء ساري المفعول.</p>
    <p class="i-am-point"><strong class="number-system">2.16.</strong>يجوز للمقاول إنهاء هذه الاتفاقية بإخطار مكتوب يرسله للعميل مدته ستين (60) يوماً.شريطة أن يتحقق الإنهاء فقط بعد الانتهاء من مرحلة برنامج الأعمال التي يقع ضمنها فترة الستين 60 يوم والدفع عن جميع أعمال البناء المكتملة حتى ذلك التاريخ يصبح تاريخ الإنهاء سارياً<</p>
    <p class="i-am-point">وأيضاً شرط أن يكون المقاول مسؤولاً عن تعويض العميل عن أي اختلاف في القيمة الفعلية للعقد أو القيمة المعدلة للعقد، حسب ما هو مطبق، والذي قد ينشأ نتيجة لتوظيف خدمات مقاول جديد لإكمال أعمال البناء وفقًا لبرنامج الأعمال.</p>
    <p class="i-am-point">ووكذلك شرط أن يقوم العميل باحتجاز المبلغ المستحق للمقاول عن كامل أعمال البناء المكتملة حتى تاريخ الإنهاء الذي يصبح سارياً بما لا يتجاوز 10٪ من القيمة الفعلية للعقد أو القيمة المعدلة للعقد لمدة 12 شهراً.</p>
    <p class="i-am-point"><strong class="number-system">3.16.</strong>ينتهي العقد بشكل فوري عندما يصبح أي من الطرفين معسراً أو حين يَصدر قراراً بحل أو أمراً بتصفية من المحكمة المختصة أو أن يقوم الطرف بترتيب أو تسوية مع دائنيه بشكل عام أو يتقدم بطلب إلى محكمة مختصة للحماية من دائنيه.</p>
    <p class="i-am-point"><strong class="number-system">4.16.</strong>الالتزامات بموجب البند 9 والبند 15 وأي التزامات نقدية مستحقة تبقى سارية بعد إنهاء هذه الاتفاقية.</p>

   
    <h3>17.القانون الواجب التطبيق</h3>
    <p class="i-am-point"><strong class="number-system">1.17.</strong>يحكم هذه الاتفاقية القانون المعمول به في سلطنة عمان وتفسر بموجبه.</p>

    <h3>18.حل النزاعات</h3>
    <p class="i-am-point"><strong class="number-system">1.18.</strong>يتفق الطرفان على أن أي مطالبة أو نزاع ينشأ عن هذه الاتفاقية أو فيما يتعلق بها أو بموضوعها أو صياغتها يتم حله بين الأطراف إما:</p>
    <p class="tab-space-1"><strong class="number-system">1.1.18.</strong>بالتسوية الودية خلال فترة 15 يوم من تاريخ بداية النزاع، </p>
    <p class="tab-space-1"><strong class="number-system">2.1.18.</strong>أو بالوساطة عن طريق محامٍ واستشاري معتمد من وزارة العدل في سلطنة عمان، (ويشار إليهم في هذه الاتفاقية بـ "هيئة الوساطة"). ويوافق الأطراف على الالتزام بقرار هيئة الوساطة شرط أن يكون القرار متماشياً مع القانون الواجب التطبيق ولا يشكل ظلماً أو احتيالاً.</p>
    <p class="i-am-point"><strong class="number-system">2.18.</strong>إذا تعذر على الأطراف حل نزاعهم وفق البند 18-1 من هذه الاتفاقية، عندها يتم إحالة النزاع إلى المحاكم المحلية.</p>

    <h3>19.الأطراف الثالثة</h3>
    <p class="i-am-point"><strong class="number-system">1.19.</strong>هذه الاتفاقية حصرية لمنفعة الأطراف ولا يجوز تفسيرها على أنها تمنح أية حقوق أو أسباب لدخول أطراف ثالثة، بشكل مباشر أو غير مباشر.</p>

    <h3>20.معلومات مشروطة والملكية الفكرية</h3>
    <p class="i-am-point"><strong class="number-system">1.20.</strong>المعلومات السرية سواء المكتوبة أو الشفوية أو الإلكترونية أو المرئية أو المرسومة أو الفوتوغرافية أو التي تمت ملاحظتها أو غير ذلك، والمستندات التي قدمها العميل أو التي تم الكشف عنها أو نشرها بأي شكل أو طريقة من العميل للمقاول، أو التي أعدها أو أنشأها المقاول للعميل أدناه هي ملكية فكرية وهي سرية بالنسبة للعميل والمقاول وسرية استخدامها ، ويجب أن يستخدمها المقاول فقط لأغراض هذه الاتفاقية. </p>
    <p class="i-am-point">يجب على المقاول التعامل مع جميع هذه المعلومات وحمايتها على أنها سرية للغاية ولا يتم الكشف عنها لأي طرف ثالث دون موافقة كتابية مسبقة من العميل، وعلى المقاول أن يفصح عنها لموظفيه أو عماله أو المقاول من الباطن فقط على أساس الحاجة للمعرفة.</p>
    <p class="i-am-point"><strong class="number-system">2.20.</strong>يجب أن يكون هناك اتفاقية فردية عن السرية مع موظفي المقاول والمقاول من الباطن والموظفون الآخرون المشاركون في تنفيذ هذه الاتفاقية قبل أي إفشاء للمعلومات السرية لهؤلاء الأشخاص.</p>
    <p class="i-am-point"><strong class="number-system">3.20.</strong>لا تسري القيود الواردة في هذا البند على الإفصاح عن المعلومات السرية إذا كان الإفشاء إلى الحد الذي يكون فيه: (أ) مطلوباً بموجب القانون أو (ب) مطلوباً من قبل أية سلطة مختصة يخضع لها الطرفان.</p>
    <p class="i-am-point"><strong class="number-system">4.20.</strong>لا يحق للمقاول استخدام أي ملكية فكرية تخص العميل دون موافقة كتابية مسبقة من العميل.</p>

    <h3>21.شروط عامة</h3>
    <p class="i-am-point"><strong class="number-system">1.21.</strong>لا تسري أي تغييرات أو تعديلات على هذه الاتفاقية ما لم تكن مكتوبة وموقعة من الأطراف، وبموافقة من السلطة المختصة، إذا اقتضى الأمر.</p>
    <p class="i-am-point"><strong class="number-system">2.21.</strong>في حال عدم قابلية نفاذ أو بطلان بند أو أكثر في هذه الاتفاقية، لن يكون لهذا أي تأثير على أي بند آخر فيها. وسيتم تعديل أي بند غير قابل للتنفيذ أو غير صالح في هذه الاتفاقية، إن أمكن، لإظهار الهدف الأصلي للطرفين.</p>
    <p class="i-am-point"><strong class="number-system">3.21.</strong>لا يُعتبر أي تنازل من قبل العميل عن أي انتهاك لهذه الاتفاقية من قبل المقاول، أو بالعكس، على أنه تنازل عن أي انتهاك يحدث لاحقاً لنفس الشرط أو لأي شرط آخر.</p>

    <h3>22.ملاحظات</h3>
    <p class="i-am-point"><strong class="number-system">1.22.</strong>يجوز لأي من الطرفين، بموجب هذه الاتفاقية، إرسال إشعار إلى الطرف الآخر على العناوين أو عناوين البريد الإلكتروني الموضحة في الجدول (ي) من هذه الاتفاقية</p>

    <h3>23.الاتفاقية بالكامل</h3>
    <p class="i-am-point"><strong class="number-system">1.23.</strong>تشكل هذه الاتفاقية الكاملة بين الطرفين وتحل محل جميع الاتفاقيات والوعود والتأكيدات والضمانات والتمثيل والتفاهمات المبرمة بينهما، سواء كانت كتابية أو شفوية، فيما يتعلق بموضوعها.</p>
    <p class="i-am-point"><strong class="number-system">2.23.</strong>يقر كل طرف بأنه عند الدخول في هذه الاتفاقية فإنه لا يعتمد على أي تصريح أو تمثيل أو تأكيد أو ضمان (سواء تم بنية طيبة أو بإهمال)، ولن يكون هناك أية التزامات أو تعويضات ما لم يتم تحديدها في هذه الاتفاقية.</p>
    <p class="i-am-point"><strong class="number-system">3.23.</strong>لا شيء في هذه الاتفاقية يحد من المسؤولية عن الاحتيال أو يستثنيها.</p>

  </div>
  <!-- page-agreement default-text -->
  </div>
  <!-- end of page 2 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 3 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
    </header>
    <!-- page-header -->
    <!-- page-agreement default-text -->
    <div class="page-agreement default-text text-center">
      <h1>صفحة التوقيع</h1>
    </div>
    <!-- page-agreement default-text -->
    <!-- page-agreement default-text -->
    <div class="page-agreement default-text text-left">
      <h3>التوقيعات:</h3>
      <table class="signature-table">
        <tbody>
          <tr>
            <td class="text-right">
              <p>عميل</p>`

              if(fetch_info.rows.length>0)
              {
               html+=`<p><b>${fetch_info.rows[0].dataValues.key_value}</b></p>`
              }
              else
              {
                html+=`<p><b></b></p>`
              }
              html+=`<hr style="margin-right:0">`
              if(fetch_info.rows.length>0)
              {
              
             html+= `<p>بتاريخ:${fetch_info.rows[0].dataValues.client_sign_date}<br>تم التوقيع عليها <strong class="blue">www.ebinaa.com</strong></p>`

              }
              else
              {

                html+= `<p>بتاريخ:<br>تم التوقيع عليها <strong class="blue">www.ebinaa.com</strong></p>`


              }
              
           html+= `</td>
            <td class="text-left">
              <p>مقاول</p>`
              if(contract_fetch_data_table.rows.length>0){
              if(user_table_fetch.rows.length>0){
               
              html+=`<p><b>${user_table_fetch.rows[0].dataValues.full_name}</b></p>`

              }
            }
              else{
                html+=`<p><b></b></p>`
              }
             
              html+=`<hr style="margin-left:0">`
              if(contract_fetch_data_table.rows.length>0){


                let contract_date=moment().format('YYYY-MM-DD')
             
              html+=`<p>بتاريخ:${contract_date}<br>تم التوقيع عليها<strong class="blue">www.ebinaa.com</strong></p>`
              }
              else
              {
                html+=`<p>بتاريخ:<br>تم التوقيع عليها<strong class="blue">www.ebinaa.com</strong></p>`
              }

             

            html+=`</td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- page-agreement default-text -->
  </div>
  <!-- end of page 3 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 4 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
        <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/EBinaa-Logo-Colored.svg"  alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول أ</h1>
    </div>
    <!-- page-heading -->
    <!-- subject-heading -->
    <div class="subject-heading">
      <p class="title">تاريخ البدء بأعمال البناء</p>
      <p class="subtitle">${format_date}</p>
    </div>
    <!-- subject-heading -->
  </div>
  <!-- end of page 4 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 5 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title"> تاريخ الانتهاء</h1>
    </div>
    <!-- page-heading -->
    <!-- subject-heading -->
    <div class="subject-heading">
      <p class="title">تاريخ الانتهاء</p>`
      if(project_contracts_fetch_table.rows.length>0){
        for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){
          var finall_date=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days ;

          var completatin_date_start=moment(completation_date).add(finall_date, 'days').format('YYYY-MM-DD')
      
        }
        for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
         
  
          completatin_date=moment(completatin_date_start).add(1,'day').format('YYYY-MM-DD');
            let finall_day_second=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
            var completatin_date_start=moment( completatin_date).add(finall_day_second, 'days').format('YYYY-MM-DD');
        }









       html+=`<p class="subtitle">${completatin_date_start}</p>`
        


      }
      else
      {

        for(payment_defaults of payment_default){
          for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

          var finall_date=stage_estimates_defaults.dataValues.days ;

          var completatin_date_start=moment(completation_date).add(finall_date, 'days').format('YYYY-MM-DD')
      
        }
      }
      for (payments of payment) {
        for (stage_estimates of payments.project_stage_estimates) {
         
  
          completatin_date=moment(completatin_date_start).add(1,'day').format('YYYY-MM-DD');
            let finall_day_second=stage_estimates.dataValues.days  ;
            var completatin_date_start=moment( completatin_date).add(finall_day_second, 'days').format('YYYY-MM-DD');
        }
      }



     








        html+=`<p class="subtitle">${completatin_date_start}</p>`
       

      }
        
     html+=` <p class="title">تاريخ الانتهاء المعدل</p>
      <p class="subtitle">NA</p>
    </div>
    <!-- subject-heading -->
  </div>
  <!-- end of page 5 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 6 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول ج</h1>
      <h2 class="subtitle">برنامج الدفع</h2>
      <h3 class="description">يجب تسجيل كل من القيمة الفعلية للعقد "ACV" والقيمة المعدلة للعقد "RCV"، حسب المعمول به</h3>
    </div>
    <!-- page-heading -->
    <!-- project-quickinfo -->
    <div class="project-quickinfo">
      <table class="table">
        <tbody>
          <tr>
            <td class="text-right">
              <p class="subject">سعر المشروع(ACV)</p>`

              if(project_contracts_table.rows.length>0){
                html+=`<p class="data">`+project_contracts_table.rows[0].dataValues.price+` OMR</p>`


                html+=`</td>`
                html+=`<td class="text-right">
                  <p class="subject">مدة المشروع </p>`


                  html+=`<p class="data">`+project_contracts_table.rows[0].dataValues.days+` أيام </p>`


              }

              else
              {

              for (payments of payment) {
               

                  html+=`<p class="data">`+payments.dataValues.price+` OMR</p>`
                
              }




              


             
            html+=`</td>`
            html+=`<td class="text-right">
              <p class="subject">مدة المشروع</p>`

              for (payments of payment) {
                


              html+=`<p class="data">`+payments.dataValues.days+` أيام </p>`
                
              }
            }




           html+=` </td>
          </tr>
        </tbody>
      </table>
    </div>`
   html+=` <!-- project-quickinfo -->
    <!-- table -->
    <table class="table">
      <thead>
        <tr>
          <th rowspan="2" class="task-no text-center">المرحلة رقم</th>
          <th rowspan="2" class="task-name text-right">اسم المرحلة</th>
          <th colspan="2" class="text-center">قيمة المراحل</th>
          <th rowspan="2" class="type text-center">تاريخ السداد </th>
        </tr>
        <tr>
          <th class="type text-center">النسبة المئوية</th>
          <th class="type text-center">OMR</th>
        </tr>
      </thead>
      <tbody>`


      if(project_contracts_fetch_table.rows.length>0){

        //for(project_contracts_fetch_table_deafult)
        for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){







          var d=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days;

          var finish_date=moment(sign_date).add(d, 'days').format('YYYY-MM-DD')
          
          html += `<tr><td class="cell-xl text-center">` + 0 + `.</td> <td class="cell-xl text-right">الدفعة المقدمة</td> <td class="cell-xl text-center">` +project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date+ ` </td></tr>`

        }





       


        for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
          console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.id);
          //console.log(project_contracts_fetch_table.rows[0].project_contract_stages[i].project_stages.dataValues.length)
          // for(let j=0;j<project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stages.length;j++){
            sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
            let b=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
            var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
           
        
        html += `<tr><td class="cell-xl text-center">` + v + `.</td> <td class="cell-xl text-right">`+project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.description_arabic +`</td> <td class="cell-xl text-center">` +project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

       


        v++;
          // }
        }

        for(let i = 0; i < project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages.length; i++){

          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let c=project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days;
          var finish_date=moment(sign_date).add(c, 'days').format('YYYY-MM-DD');

          html += `<tr><td class="cell-xl text-center"></td> <td class="cell-xl text-right"> افترةالصيانة</td> <td class="cell-xl text-center">` +project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + ` </td></tr>`

        }

      }


     else{

      for(payment_defaults of payment_default){
        for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

          var d=stage_estimates_defaults.dataValues.days ;

          var finish_date=moment(sign_date).add(d, 'days').format('YYYY-MM-DD')
          

          html += `<tr><td class="cell-xl text-center">` + 0 + `.</td> <td class="cell-xl text-right">الدفعة المقدمة</td> <td class="cell-xl text-center">` + stage_estimates_defaults.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates_defaults.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + ` </td></tr>`

        }
      }


      for (payments of payment) {
        for (stage_estimates of payments.project_stage_estimates) {
          console.log(payments.dataValues.id)
          // console.log(stage_estimates.project_stage.dataValues.id)

          //console.log(payment.rows[index].dataValues.price)
          //let i=1;


          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=stage_estimates.dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');

          html += `<tr><td class="cell-xl text-center">` + w + `.</td> <td class="cell-xl text-right">` + stage_estimates.project_stage.dataValues.description_arabic + `</td> <td class="cell-xl text-center">` + stage_estimates.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + ` </td></tr>`

        
          w++;
         

        }

      }


      for(payment_default_primarys of payment_default_primary){
        for (stage_estimates_primary of payment_default_primarys.project_stage_estimates){
          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=stage_estimates_primary.dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
          

          html += `<tr><td class="cell-xl text-center"></td> <td class="cell-xl text-right">فترةالصيانة </td> <td class="cell-xl text-center">` + stage_estimates_primary.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates_primary.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

        }

      }


    }
       
      html+=`</tbody>
    </table>`

    html+=`<!-- table -->
  </div>
  <!-- end of page 6 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 7 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
       <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول د</h1>
      <h2 class="subtitle">برنامج الأشغال والمهام</h2>
      <h3 class="description">برنامج الأشغال</h3>
    </div>
    <!-- page-heading -->
    <!-- table -->
    <table class="table">
      <thead>
        <tr>
          <th class="stage-no text-center">المرحلة رقم </th>
          <th class="text-right">وصف المرحلة </th>
          <th class="number-of-days text-center">عدد الأيام </th>
          <th class="number-of-days text-center">تاريخ البدء </th>
          <th class="number-of-days text-center">تاريخ الانتهاء </th>
          <th class="number-of-days text-center">إجمالي عدد المهام </th>
        </tr>
      </thead>
      <tbody>`
      if(project_contracts_fetch_table.rows.length>0){
      for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){


        let d=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days;

        var finish_date=moment(sign_date_alter).add(d, 'days').format('YYYY-MM-DD')
              // if(i>0)
              // {
              //   sign_date=moment(finish_date).format('YYYY-MM-DD');
              //   finish_date=moment(sign_date).add(14, 'days').format('YYYY-MM-DD');
              // }

              
            

             html+=` <tr><td class="text-center">0.</td>
              <td class="text-right">الدفعة المقدمة</td>
              <td class="text-center">${project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days}</td>
              <td class="text-center">${sign_date_alter}</td>
              <td class="text-center">${finish_date}</td>
              <td class="text-center">${project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`
       }


       for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
        console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.id);
        //console.log(project_contracts_fetch_table.rows[0].project_contract_stages[i].project_stages.dataValues.length)
        // for(let j=0;j<project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stages.length;j++){
          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');

          html+=` <tr><td class="text-center">${i+1}.</td>
          <td class="text-right">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.description_arabic}</td>
          <td class="text-center">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days}</td>
          <td class="text-center">${sign_date}</td>
          <td class="text-center">${finish_date}</td>
          <td class="text-center">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`
         
       }
       for(let i = 0; i < project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages.length; i++){

        sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
        let c=project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days;
        var finish_date=moment(sign_date).add(c, 'days').format('YYYY-MM-DD');


        html+=` <tr><td class="text-center"></td>
        <td class="text-right">افترةالصيانة</td>
        <td class="text-center">${project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days}</td>
        <td class="text-center">${sign_date}</td>
        <td class="text-center">${finish_date}</td>
        <td class="text-center">${project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`

      }
    }
    else{

      for(payment_defaults of payment_default){
        for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

          var d=stage_estimates_defaults.dataValues.days ;

          var finish_date=moment(sign_date_alter).add(d, 'days').format('YYYY-MM-DD')

          html+=` <tr><td class="text-center">0.</td>
          <td class="text-right">الدفعة المقدمة</td>
          <td class="text-center">${stage_estimates_defaults.dataValues.days}</td>
          <td class="text-center">${sign_date_alter}</td>
          <td class="text-center">${finish_date}</td>
          <td class="text-center">${stage_estimates_defaults.project_stage.dataValues.project_tasks.length}</td></tr>`


        }
      }

      for (payments of payment) {
        for (stage_estimates of payments.project_stage_estimates) {

          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=stage_estimates.dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');

          html+=` <tr><td class="text-center">`+i+`</td>
          <td class="text-right">${stage_estimates.project_stage.dataValues.description_arabic}</td>
          <td class="text-center">${stage_estimates.dataValues.days}</td>
          <td class="text-center">${sign_date}</td>
          <td class="text-center">${finish_date}</td>
          <td class="text-center">${stage_estimates.project_stage.dataValues.project_tasks.length}</td></tr>`
i++;

        }
      }

      for(payment_default_primarys of payment_default_primary){
        for (stage_estimates_primary of payment_default_primarys.project_stage_estimates){


          sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=stage_estimates_primary.dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');


          html+=` <tr><td class="text-center"></td>
          <td class="text-right">افترةالصيانة</td>
          <td class="text-center">${stage_estimates_primary.dataValues.days}</td>
          <td class="text-center">${sign_date}</td>
          <td class="text-center">${finish_date}</td>
          <td class="text-center">${stage_estimates_primary.project_stage.dataValues.project_tasks.length}</td></tr>`

        }
      }

    }


     html+=` </tbody>
    </table>
    <!-- table -->

    <div class="page-break"></div>

    <!-- page-heading -->
    <div class="page-heading">
      <h2 class="subtitle">عورﺷﻣﻟالﺣارﻣططﺧﻣ  </h2>
    </div>
    <!-- page-heading -->
    <!-- project-ganttchart -->
    <div class="project-ganttchart">`
  if(project_gnatt_table.rows.length>0){
     html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="Gantt Chart Image">`
        }
        else{
          html+= ` <img src="images/Gantt-Chart-Image.png" alt="Gantt Chart Image">` 
        }
   html+=`  </div>
    <!-- project-ganttchart -->

    <div class="page-break"></div>

    <!-- page-heading -->`
    if(project_stage_and_task_details.length > 0){
      html+=`<div class="page-heading">
      <h3 class="description">برنامج المهام</h3>
    </div>
    <!-- page-heading -->
    <!-- section-heading -->`
      for(let i = 0; i < project_stage_and_task_details.length; i++){
        console.log('/////',project_stage_and_task_details)
        html+=`<div class="section-heading">
        <h3 class="title">`+(i+1)+` - `+project_stage_and_task_details[i].description_arabic+`</h3>
      </div>
      <!-- section-heading -->
      <!-- table -->
      <table class="table">
        <thead>
          <tr>
            <th class="task-no text-center">المهمة رقم</th>
            <th class="task-name text-right">اسم المهمة</th>
            <th class="type text-center">نوع</th>
          </tr>
        </thead>
        <tbody>`
        if(project_stage_and_task_details[i].client_assigned.length > 0){
          html+=`<tr>
          <th colspan="3" class="full-width text-right">العميل</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].client_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-right">`+project_stage_and_task_details[i].client_assigned[j].name_arabic+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].client_assigned[j].type_arabic+`</td>
          </tr>`
          }
        }	
        if(project_stage_and_task_details[i].consultant_assigned.length > 0){
          html+=`<tr>
          <th colspan="3" class="full-width text-right">الإستشاري</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].consultant_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-right">`+project_stage_and_task_details[i].consultant_assigned[j].name_arabic+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].consultant_assigned[j].type_arabic+`</td>
          </tr>`
          }
        }
        if(project_stage_and_task_details[i].contractor_assigned.length > 0){
          html+=`<tr>
          <th colspan="3" class="full-width text-right">المقاول</th>
        </tr>`
          for(let j = 0; j < project_stage_and_task_details[i].contractor_assigned.length; j++){
            html+=`<tr>
            <td class="text-center">`+(j+1)+`.</td>
            <td class="text-right">`+project_stage_and_task_details[i].contractor_assigned[j].name_arabic+`</td>
            <td class="text-center">`+project_stage_and_task_details[i].contractor_assigned[j].type_arabic+`</td>
            
          </tr>`
          }
        }		

      html+=`</tbody>
      </table>`
      }
    }

    html+=`<!-- table -->
  </div>
  <!-- end of page 7 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 8 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول هـ</h1>
      <h2 class="subtitle">المواصفات ومجال العمل التفصيلي</h2>
    </div>
    <!-- page-heading -->
    <!-- section-heading -->`
  


html+=`<!-- table -->
<table class="table specification-details-table">
<thead>
<tr>
<th colspan="4" class="specifications text-right">مواصفات</th>
<th colspan="3" class="detailed-scope text-right">نطاق العمل التفصيلي</th>
</tr>
</thead>
<tbody>
<tr>
<th colspan="4" class="text-right">المواصفات القياسية التالية لجميع الأعمال التي سيتم تنفيذها وفقاً لقواعد الممارسات القياسية التي يتم تنفيذها واستخدامها في سلطنة عمان. </th>
<th rowspan="2" class="supply text-center">توريد وتركيب من قبل المقاول </th>
<th rowspan="2" class="supply text-center">توريد و تركيب من قبل العميل </th>
<th rowspan="2" class="supply text-center">التوريد من قبل العميل و التركيب من قبل المقاول</th>
</tr>
<tr>
<th class="section-category text-right">فئة القسم</th>
<th class="section-no text-center">القسم رقم</th>
<th class="spec-description text-right">وصف</th>
<th class="equivelant text-center">صنع أو مكافئ *</th>
</tr>`
if(project_data_check_sign_fetch.rows.length>0){


for(i=0;i<project_scope_version_data.rows.length;i++){

  console.log(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by);



      let ver=project_scope_version_data.rows[i].dataValues.section_no;
   let new_var= Math.trunc( ver );;
   console.log(new_var);


       html+=` <tr><td><rowspan="10" class="text-right">${new_var}.${project_scope_version_data.rows[i].dataValues.section_scope_category.dataValues.name_arabic}</td>`
     
     
   
 
   
   
     //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)

     var section_no_data = parseFloat(project_scope_version_data.rows[i].dataValues.section_no).toFixed(2)
     
    
    html+=`<td class="text-center">${section_no_data}</td>`
    
    html+=` <td class="text-right">${project_scope_version_data.rows[i].dataValues.description_arabic}</td>`
    if(project_scope_version_data.rows[i].dataValues.make_or_equivelant_arabic==null)
    {
      html+=`<td class="text-center"></td> `


    }
    else
    {
     html+=`<td class="text-center">${project_scope_version_data.rows[i].dataValues.make_or_equivelant_arabic}</td> `
    }


if(project_scope_version_data.rows[i].dataValues.project_scope.dataValues.type==2){



if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==2 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                html+= ` <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }
               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==1){
                html+= ` <td class="text-center"></td>
                <td class="custom-cell text-center"></td>
                <td class="text-center"></td>`

               }
              
              
              else  if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`

               }
               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 1){
  
                html+= ` <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }
               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == null){

                html+= `  <td class="custom-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }


               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3){

                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="custom-cell text-center"></td>`

               }
               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 0){

                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`

               }
               else{
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
          
               }
              
              
}
              
              else{

                
                if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==2 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                  html+= `  <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                <td class="text-center"></td>`
  
                 }
                else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==1){
                  html+= ` <td class="text-center"></td>
                   <td class="default-cell text-center"></td>
                   <td class="text-center"></td>`
  
                 }
                
                
                else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                   <td class="default-cell text-center"></td>`
  
                 }

                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 1){
  
                  html+= `  <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == null){
  
                  html+= ` <td class="default-cell text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
  
  
                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3){
  
                  html+= `   <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="default-cell text-center"></td>`
  
                 }
                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 0){
  
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
  
                 }
                 else{
                  html+= ` <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>`
            
                 }
                


              


     
   
            }
          

          


      }
    
  
  html+=` 
             
            
  <tr>
     <td colspan="7" class="text-right">*جعل أو ما يعادلها : يجوز للمقاول أن يقترح شركات بديلة لتلك التي اقترحتها المواصفات على موافقة المهندس أو صاحب العمل. يُقترح مشاركة جميع أسماء موردي مواد المشروع مع صاحب العمل أو المهندس </td>
   </tr>
 </tbody>
</table>
<!-- table -->
</div>`

}
 else{


  for(let i=0;i<project_scope_table.rows.length;i++){ 


    console.log(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by);
               

                

    
     
    //   var v=project_scope_table.rows[i].dataValues.section_category_maps.length;
    //   console.log(v);
    // console.log(project_scope_table.rows[i].dataValues.scope_description);
    //let v=1;
    //console.log(i--);

   
    
    //let v=project_scope_table.rows.length;
    //if(project_scope_table.rows[i].dataValues.section_category_maps.length>1){}


    let ver=project_scope_table.rows[i].dataValues.section_no;
    let new_var= Math.trunc( ver );;
    console.log(new_var);
    
   html+='<tr>'
   
  
    
    html+=` <td><rowspan="2" class="text-left" >${new_var}.${project_scope_table.rows[i].dataValues.section_scope_category.dataValues.name_arabic}</td>`
    
    
    

  
  
    
    
    var section_no_data = parseFloat(project_scope_table.rows[i].dataValues.section_no).toFixed(2)
    console.log("no",section_no_data);

   html+=`<td class="text-center">${section_no_data}</td>`
    

   
   html+=` <td class="text-left">${project_scope_table.rows[i].dataValues.description_arabic}</td> `
   if(project_scope_table.rows[i].dataValues.make_or_equivelant_arabic==null){
     html+=  `<td class="text-center"></td> `
   }
   else{
   html+= `<td class="text-center">${project_scope_table.rows[i].dataValues.make_or_equivelant_arabic}</td> `
   }

if(project_scope_table.rows[i].dataValues.project_scope.dataValues.type==2){
    

    
  if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
    html+= ` <td class="custom-cell text-center"></td>
    <td class="text-center"></td>
    <td class="text-center"></td>`

   }
   else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
    html+= ` <td class="text-center"></td>
    <td class="custom-cell text-center"></td>
    <td class="text-center"></td>`

   }
  
  
   else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){

    html+= `   <td class="custom-cell text-center"></td>
    <td class="text-center"></td>
    <td class="text-center"></td>`

   }
   else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){

    html+= `   <td class="custom-cell text-center"></td>
    <td class="text-center"></td>
    <td class="text-center"></td>`

   }

   else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){

    html+= `   <td class="text-center"></td>
    <td class="text-center"></td>
    <td class="custom-cell text-center"></td>`

   }
   else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){

    html+= ` <td class="text-center"></td>
    <td class="text-center"></td>
    <td class="text-center"></td>`
   }
   else{
    html+= ` <td class="text-center"></td>
    <td class="text-center"></td>
    <td class="text-center"></td>`

   }
}
  
  else{

    
    if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
      html+= ` <td class="default-cell text-center"></td>
      <td class="text-center"></td>
      <td class="text-center"></td>`
  
     }
     else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
      html+= ` <td class="text-center"></td>
      <td class="default-cell text-center"></td>
      <td class="text-center"></td>`
  
     }
    
    
     else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){

      html+= `   <td class="default-cell text-center"></td>
      <td class="text-center"></td>
      <td class="text-center"></td>`

     }
     else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){

      html+= `   <td class="default-cell text-center"></td>
      <td class="text-center"></td>
      <td class="text-center"></td>`

     }

     else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){

      html+= `   <td class="text-center"></td>
      <td class="text-center"></td>
      <td class="default-cell text-center"</td>`

     }
     else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){

      html+= ` <td class="text-center"></td>
      <td class="text-center"></td>
      <td class="text-center"></td>`
     }
     else{
      html+= ` <td class="text-center"></td>
      <td class="text-center"></td>
      <td class="text-center"></td>`
  
     }
    }
  }

 



 

 
   
 
 html+=` 
 

  <tr>
    <td colspan="7" class="text-right">*جعل أو ما يعادلها : يجوز للمقاول أن يقترح شركات بديلة لتلك التي اقترحتها المواصفات على موافقة المهندس أو صاحب العمل. يُقترح مشاركة جميع أسماء موردي مواد المشروع مع صاحب العمل أو المهندس </td>
  </tr>
</tbody>
</table>
<!-- table -->
</div>`


 }

  




  html+= `  <!-- project-scope -->
  </div>
  <!-- end of page 8 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 9 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول و</h1>
      <h2 class="subtitle">الرسومات</h2>
      <h3 class="description">وثائق رسومات المشروع</h3>
    </div>
    <!-- page-heading -->
    <!-- project-drawings -->
    <div class="project-drawings">
      <!-- project-drawings-item -->`
      for(let i = 0; i < project_drawings_and_documents.length; i++){
        if(project_drawings_and_documents[i].resource_type == 'application/pdf'){
          html += `<div class="project-drawings-item">
          <div class="holder">
            <div class="document">
              <div class="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="512px" viewBox="-16 0 512 512" width="512px" class=""><g><path d="m378.90625 394.292969h-210.046875c-4.171875 0-7.554687 3.386719-7.554687 7.558593 0 4.171876 3.382812 7.554688 7.554687 7.554688h210.042969c4.175781 0 7.558594-3.382812 7.558594-7.554688 0-4.171874-3.382813-7.558593-7.554688-7.558593zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m378.90625 341.214844h-210.046875c-4.171875 0-7.554687 3.382812-7.554687 7.554687 0 4.175781 3.382812 7.558594 7.554687 7.558594h210.042969c4.175781 0 7.558594-3.382813 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.554688-7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m161.304688 295.660156c0 4.175782 3.382812 7.558594 7.554687 7.558594h133.660156c4.175781 0 7.558594-3.382812 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.558594-7.554687h-133.660156c-4.171875 0-7.554687 3.382812-7.554687 7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m458.664062 99.132812-13.625-14.789062v-52.894531c0-17.339844-14.148437-31.449219-31.542968-31.449219h-338.003906c-17.394532 0-31.542969 14.109375-31.542969 31.449219v59.664062h-13.820313c-16.613281 0-30.128906 13.523438-30.128906 30.144531v91.480469c0 16.621094 13.515625 30.144531 30.128906 30.144531h13.820313v210.800782c0 17.339844 14.148437 31.449218 31.542969 31.449218h17.265624c1.859376 15.121094 14.777344 26.867188 30.398438 26.867188h325.1875c16.910156 0 30.664062-13.738281 30.664062-30.625v-326.421875c0-26.714844-.804687-34.578125-20.34375-55.820313zm4.917969 40.269532h-56.609375c-8.574218 0-15.550781-6.957032-15.550781-15.503906l.050781-65.714844c9.9375.738281 12.589844 3.675781 21.300782 13.363281 1.445312 1.609375 3.023437 3.359375 4.777343 5.265625l14.445313 15.679688c.050781.054687.101562.113281.15625.167968l15.390625 16.707032c12 13.046874 15.191406 18.523437 16.039062 30.035156zm-404.519531-107.953125c0-9.007813 7.371094-16.335938 16.429688-16.335938h338.003906c9.058594 0 16.429687 7.328125 16.429687 16.335938v36.488281l-1.257812-1.367188c-1.714844-1.855468-3.246094-3.5625-4.652344-5.128906-12.421875-13.8125-17.851563-18.589844-40.085937-18.589844h-.003907-260.769531c-16.894531 0-30.636719 13.738282-30.636719 30.625v17.636719h-33.457031zm404.832031 449.925781c0 8.550781-6.976562 15.511719-15.550781 15.511719h-325.1875c-8.558594 0-15.523438-6.957031-15.523438-15.511719v-109.507812c0-4.171876-3.382812-7.554688-7.558593-7.554688-4.171875 0-7.554688 3.382812-7.554688 7.554688v98.152343h-17.027343c-9.058594 0-16.429688-7.328125-16.429688-16.332031v-210.804688h33.457031v94.382813c0 4.171875 3.382813 7.554687 7.554688 7.554687 4.175781 0 7.558593-3.382812 7.558593-7.554687v-94.382813h39.226563c4.171875 0 7.554687-3.382812 7.554687-7.558593 0-4.171875-3.382812-7.554688-7.554687-7.554688h-116.730469c-8.28125 0-15.015625-6.742187-15.015625-15.03125v-91.480469c0-8.289062 6.734375-15.03125 15.015625-15.03125h199.011719c8.292969 0 15.042969 6.742188 15.042969 15.03125v91.480469c0 8.289063-6.75 15.03125-15.042969 15.03125h-47.660156c-4.175781 0-7.558594 3.382813-7.558594 7.554688 0 4.175781 3.382813 7.558593 7.558594 7.558593h47.660156c16.628906 0 30.15625-13.523437 30.15625-30.144531v-91.480469c0-16.621093-13.527344-30.144531-30.15625-30.144531h-121.507813v-17.636719c0-8.554687 6.964844-15.511718 15.523438-15.511718h253.203125l-.050781 65.929687c0 16.886719 13.757812 30.625 30.664062 30.625h56.921875v.433594zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m75.648438 134.636719h-18.101563c-2.222656 0-4.113281.777343-5.667969 2.335937-1.554687 1.554688-2.332031 3.472656-2.332031 5.757813v53.515625c0 2.222656.761719 4.09375 2.285156 5.617187 1.523438 1.527344 3.335938 2.289063 5.429688 2.289063 2.097656 0 3.90625-.761719 5.429687-2.289063 1.527344-1.523437 2.289063-3.332031 2.289063-5.425781v-15.519531h11.621093c7.050782 0 12.703126-2.109375 16.957032-6.332031 4.253906-4.222657 6.382812-9.761719 6.382812-16.617188 0-6.917969-2.253906-12.539062-6.761718-16.855469-4.511719-4.316406-10.355469-6.476562-17.53125-6.476562zm5.621093 29.996093c-1.84375 1.84375-4 2.761719-6.476562 2.761719h-9.8125v-18.949219h9.90625c2.605469 0 4.777343.9375 6.527343 2.808594 1.746094 1.875 2.617188 4.144532 2.617188 6.808594 0 2.539062-.917969 4.730469-2.761719 6.570312zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m163.273438 152.777344c-2.253907-4.917969-5.414063-8.871094-9.476563-11.855469-5.652344-4.125-12.957031-6.1875-21.910156-6.1875h-15.910157c-2.226562 0-4.097656.792969-5.621093 2.378906-1.527344 1.589844-2.289063 3.398438-2.289063 5.429688v53.039062c0 2.285157.730469 4.15625 2.191406 5.617188 1.585938 1.398437 3.523438 2.09375 5.8125 2.09375h17.148438c9.269531 0 16.703125-2.507813 22.292969-7.523438 7.429687-6.789062 11.144531-15.773437 11.144531-26.945312 0-5.777344-1.128906-11.125-3.382812-16.046875zm-17.480469 30.996094c-3.304688 3.746093-7.683594 5.617187-13.148438 5.617187h-9.144531v-40.660156h8.289062c5.84375 0 10.464844 1.808593 13.863282 5.429687 3.394531 3.617188 5.09375 8.503906 5.09375 14.664063 0 6.222656-1.652344 11.203125-4.953125 14.949219zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m184.402344 204.34375c2.15625 0 3.984375-.765625 5.476562-2.289062 1.492188-1.523438 2.238282-3.332032 2.238282-5.425782v-20.472656h14.671874c2.097657 0 3.84375-.679688 5.238282-2.046875 1.398437-1.363281 2.097656-3 2.097656-4.90625 0-1.964844-.714844-3.632813-2.144531-4.996094-1.429688-1.363281-3.160157-2.046875-5.191407-2.046875h-14.671874v-13.429687h17.339843c1.96875 0 3.621094-.695313 4.953125-2.09375 1.335938-1.394531 2-3.015625 2-4.855469 0-2.03125-.679687-3.730469-2.046875-5.09375-1.367187-1.367188-3-2.046875-4.90625-2.046875h-24.960937c-2.222656 0-4.097656.792969-5.621094 2.378906-1.523438 1.589844-2.285156 3.429688-2.285156 5.523438v54.085937c0 2.097656.792968 3.90625 2.382812 5.429688 1.585938 1.519531 3.394532 2.285156 5.429688 2.285156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/></g></svg>
              </div>
              <div class="document-link">
                <a class="link" href="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`">
                  `+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`
                </a>
              </div>
            </div>`
            if(project_drawings_and_documents[i].project_doc_tags.length > 0){
              html += `<div class="data">
              <ul class="tags">`
              for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
                html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
              }

              html += `</ul>
            </div>`
            }

          html += `</div>
        </div>
        <div class="page-break"></div>`
        }
        else{
          html += `<div class="project-drawings-item">
          <div class="holder">
            <div class="pic">

              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`" class="" alt="logo">
              
            </div>`
            if(project_drawings_and_documents[i].project_doc_tags.length > 0){
              html += `<div class="data">
              <ul class="tags">`
              for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
                html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
              }

              html += `</ul>
            </div>`
            }

          html += `</div>
        </div>
        <div class="page-break"></div>`

        }

      }


      html += `
      <!-- project-drawings-item -->
    </div>
    <!-- project-drawings -->
  </div>
  <!-- end of page 10 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 11 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/EBinaa-Logo-Colored.svg"  alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول ز</h1>
      <h2 class="subtitle">سند الملكية وإباحة البناء</h2>
      <h3 class="description">وثائق قانونية</h3>
    </div>
    <!-- page-heading -->
    <!-- project-drawings -->
    <div class="project-drawings">
      <!-- project-drawings-item -->`
      // for(let i = 0; i < project_drawings_and_documents.length; i++){
      //   if(project_drawings_and_documents[i].resource_type == 'application/pdf'){
      //     html += `<div class="project-drawings-item">
      //     <div class="holder">
      //       <div class="document">
      //         <div class="document-icon">
      //           <svg xmlns="http://www.w3.org/2000/svg" height="512px" viewBox="-16 0 512 512" width="512px" class=""><g><path d="m378.90625 394.292969h-210.046875c-4.171875 0-7.554687 3.386719-7.554687 7.558593 0 4.171876 3.382812 7.554688 7.554687 7.554688h210.042969c4.175781 0 7.558594-3.382812 7.558594-7.554688 0-4.171874-3.382813-7.558593-7.554688-7.558593zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m378.90625 341.214844h-210.046875c-4.171875 0-7.554687 3.382812-7.554687 7.554687 0 4.175781 3.382812 7.558594 7.554687 7.558594h210.042969c4.175781 0 7.558594-3.382813 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.554688-7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m161.304688 295.660156c0 4.175782 3.382812 7.558594 7.554687 7.558594h133.660156c4.175781 0 7.558594-3.382812 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.558594-7.554687h-133.660156c-4.171875 0-7.554687 3.382812-7.554687 7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m458.664062 99.132812-13.625-14.789062v-52.894531c0-17.339844-14.148437-31.449219-31.542968-31.449219h-338.003906c-17.394532 0-31.542969 14.109375-31.542969 31.449219v59.664062h-13.820313c-16.613281 0-30.128906 13.523438-30.128906 30.144531v91.480469c0 16.621094 13.515625 30.144531 30.128906 30.144531h13.820313v210.800782c0 17.339844 14.148437 31.449218 31.542969 31.449218h17.265624c1.859376 15.121094 14.777344 26.867188 30.398438 26.867188h325.1875c16.910156 0 30.664062-13.738281 30.664062-30.625v-326.421875c0-26.714844-.804687-34.578125-20.34375-55.820313zm4.917969 40.269532h-56.609375c-8.574218 0-15.550781-6.957032-15.550781-15.503906l.050781-65.714844c9.9375.738281 12.589844 3.675781 21.300782 13.363281 1.445312 1.609375 3.023437 3.359375 4.777343 5.265625l14.445313 15.679688c.050781.054687.101562.113281.15625.167968l15.390625 16.707032c12 13.046874 15.191406 18.523437 16.039062 30.035156zm-404.519531-107.953125c0-9.007813 7.371094-16.335938 16.429688-16.335938h338.003906c9.058594 0 16.429687 7.328125 16.429687 16.335938v36.488281l-1.257812-1.367188c-1.714844-1.855468-3.246094-3.5625-4.652344-5.128906-12.421875-13.8125-17.851563-18.589844-40.085937-18.589844h-.003907-260.769531c-16.894531 0-30.636719 13.738282-30.636719 30.625v17.636719h-33.457031zm404.832031 449.925781c0 8.550781-6.976562 15.511719-15.550781 15.511719h-325.1875c-8.558594 0-15.523438-6.957031-15.523438-15.511719v-109.507812c0-4.171876-3.382812-7.554688-7.558593-7.554688-4.171875 0-7.554688 3.382812-7.554688 7.554688v98.152343h-17.027343c-9.058594 0-16.429688-7.328125-16.429688-16.332031v-210.804688h33.457031v94.382813c0 4.171875 3.382813 7.554687 7.554688 7.554687 4.175781 0 7.558593-3.382812 7.558593-7.554687v-94.382813h39.226563c4.171875 0 7.554687-3.382812 7.554687-7.558593 0-4.171875-3.382812-7.554688-7.554687-7.554688h-116.730469c-8.28125 0-15.015625-6.742187-15.015625-15.03125v-91.480469c0-8.289062 6.734375-15.03125 15.015625-15.03125h199.011719c8.292969 0 15.042969 6.742188 15.042969 15.03125v91.480469c0 8.289063-6.75 15.03125-15.042969 15.03125h-47.660156c-4.175781 0-7.558594 3.382813-7.558594 7.554688 0 4.175781 3.382813 7.558593 7.558594 7.558593h47.660156c16.628906 0 30.15625-13.523437 30.15625-30.144531v-91.480469c0-16.621093-13.527344-30.144531-30.15625-30.144531h-121.507813v-17.636719c0-8.554687 6.964844-15.511718 15.523438-15.511718h253.203125l-.050781 65.929687c0 16.886719 13.757812 30.625 30.664062 30.625h56.921875v.433594zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m75.648438 134.636719h-18.101563c-2.222656 0-4.113281.777343-5.667969 2.335937-1.554687 1.554688-2.332031 3.472656-2.332031 5.757813v53.515625c0 2.222656.761719 4.09375 2.285156 5.617187 1.523438 1.527344 3.335938 2.289063 5.429688 2.289063 2.097656 0 3.90625-.761719 5.429687-2.289063 1.527344-1.523437 2.289063-3.332031 2.289063-5.425781v-15.519531h11.621093c7.050782 0 12.703126-2.109375 16.957032-6.332031 4.253906-4.222657 6.382812-9.761719 6.382812-16.617188 0-6.917969-2.253906-12.539062-6.761718-16.855469-4.511719-4.316406-10.355469-6.476562-17.53125-6.476562zm5.621093 29.996093c-1.84375 1.84375-4 2.761719-6.476562 2.761719h-9.8125v-18.949219h9.90625c2.605469 0 4.777343.9375 6.527343 2.808594 1.746094 1.875 2.617188 4.144532 2.617188 6.808594 0 2.539062-.917969 4.730469-2.761719 6.570312zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m163.273438 152.777344c-2.253907-4.917969-5.414063-8.871094-9.476563-11.855469-5.652344-4.125-12.957031-6.1875-21.910156-6.1875h-15.910157c-2.226562 0-4.097656.792969-5.621093 2.378906-1.527344 1.589844-2.289063 3.398438-2.289063 5.429688v53.039062c0 2.285157.730469 4.15625 2.191406 5.617188 1.585938 1.398437 3.523438 2.09375 5.8125 2.09375h17.148438c9.269531 0 16.703125-2.507813 22.292969-7.523438 7.429687-6.789062 11.144531-15.773437 11.144531-26.945312 0-5.777344-1.128906-11.125-3.382812-16.046875zm-17.480469 30.996094c-3.304688 3.746093-7.683594 5.617187-13.148438 5.617187h-9.144531v-40.660156h8.289062c5.84375 0 10.464844 1.808593 13.863282 5.429687 3.394531 3.617188 5.09375 8.503906 5.09375 14.664063 0 6.222656-1.652344 11.203125-4.953125 14.949219zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m184.402344 204.34375c2.15625 0 3.984375-.765625 5.476562-2.289062 1.492188-1.523438 2.238282-3.332032 2.238282-5.425782v-20.472656h14.671874c2.097657 0 3.84375-.679688 5.238282-2.046875 1.398437-1.363281 2.097656-3 2.097656-4.90625 0-1.964844-.714844-3.632813-2.144531-4.996094-1.429688-1.363281-3.160157-2.046875-5.191407-2.046875h-14.671874v-13.429687h17.339843c1.96875 0 3.621094-.695313 4.953125-2.09375 1.335938-1.394531 2-3.015625 2-4.855469 0-2.03125-.679687-3.730469-2.046875-5.09375-1.367187-1.367188-3-2.046875-4.90625-2.046875h-24.960937c-2.222656 0-4.097656.792969-5.621094 2.378906-1.523438 1.589844-2.285156 3.429688-2.285156 5.523438v54.085937c0 2.097656.792968 3.90625 2.382812 5.429688 1.585938 1.519531 3.394532 2.285156 5.429688 2.285156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/></g></svg>
      //         </div>
      //         <div class="document-link">
      //           <a class="link" href="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`">
      //             `+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`
      //           </a>
      //         </div>
      //       </div>`
      //       if(project_drawings_and_documents[i].project_doc_tags.length > 0){
      //         html += `<div class="data">
      //         <ul class="tags">`
      //         for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
      //           html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
      //         }

      //         html += `</ul>
      //       </div>`
      //       }

      //     html += `</div>
      //   </div>
      //   <div class="page-break"></div>`
      //   }
      //   else{
      //     html += `<div class="project-drawings-item">
      //     <div class="holder">
      //       <div class="pic">

      //         <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`" class="" alt="logo">
              
      //       </div>`
      //       if(project_drawings_and_documents[i].project_doc_tags.length > 0){
      //         html += `<div class="data">
      //         <ul class="tags">`
      //         for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
      //           html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
      //         }

      //         html += `</ul>
      //       </div>`
      //       }

      //     html += `</div>
      //   </div>
      //   <div class="page-break"></div>`

      //   }

      // }

      for(let i = 0; i < project_legal_documents.length; i++){
        if(project_legal_documents[i].resource_type == 'application/pdf'){
          html += `<div class="project-drawings-item">
          <div class="holder">
            <div class="document">
              <div class="document-icon">
                <svg xmlns="http://www.w3.org/2000/svg" height="512px" viewBox="-16 0 512 512" width="512px" class=""><g><path d="m378.90625 394.292969h-210.046875c-4.171875 0-7.554687 3.386719-7.554687 7.558593 0 4.171876 3.382812 7.554688 7.554687 7.554688h210.042969c4.175781 0 7.558594-3.382812 7.558594-7.554688 0-4.171874-3.382813-7.558593-7.554688-7.558593zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m378.90625 341.214844h-210.046875c-4.171875 0-7.554687 3.382812-7.554687 7.554687 0 4.175781 3.382812 7.558594 7.554687 7.558594h210.042969c4.175781 0 7.558594-3.382813 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.554688-7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m161.304688 295.660156c0 4.175782 3.382812 7.558594 7.554687 7.558594h133.660156c4.175781 0 7.558594-3.382812 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.558594-7.554687h-133.660156c-4.171875 0-7.554687 3.382812-7.554687 7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m458.664062 99.132812-13.625-14.789062v-52.894531c0-17.339844-14.148437-31.449219-31.542968-31.449219h-338.003906c-17.394532 0-31.542969 14.109375-31.542969 31.449219v59.664062h-13.820313c-16.613281 0-30.128906 13.523438-30.128906 30.144531v91.480469c0 16.621094 13.515625 30.144531 30.128906 30.144531h13.820313v210.800782c0 17.339844 14.148437 31.449218 31.542969 31.449218h17.265624c1.859376 15.121094 14.777344 26.867188 30.398438 26.867188h325.1875c16.910156 0 30.664062-13.738281 30.664062-30.625v-326.421875c0-26.714844-.804687-34.578125-20.34375-55.820313zm4.917969 40.269532h-56.609375c-8.574218 0-15.550781-6.957032-15.550781-15.503906l.050781-65.714844c9.9375.738281 12.589844 3.675781 21.300782 13.363281 1.445312 1.609375 3.023437 3.359375 4.777343 5.265625l14.445313 15.679688c.050781.054687.101562.113281.15625.167968l15.390625 16.707032c12 13.046874 15.191406 18.523437 16.039062 30.035156zm-404.519531-107.953125c0-9.007813 7.371094-16.335938 16.429688-16.335938h338.003906c9.058594 0 16.429687 7.328125 16.429687 16.335938v36.488281l-1.257812-1.367188c-1.714844-1.855468-3.246094-3.5625-4.652344-5.128906-12.421875-13.8125-17.851563-18.589844-40.085937-18.589844h-.003907-260.769531c-16.894531 0-30.636719 13.738282-30.636719 30.625v17.636719h-33.457031zm404.832031 449.925781c0 8.550781-6.976562 15.511719-15.550781 15.511719h-325.1875c-8.558594 0-15.523438-6.957031-15.523438-15.511719v-109.507812c0-4.171876-3.382812-7.554688-7.558593-7.554688-4.171875 0-7.554688 3.382812-7.554688 7.554688v98.152343h-17.027343c-9.058594 0-16.429688-7.328125-16.429688-16.332031v-210.804688h33.457031v94.382813c0 4.171875 3.382813 7.554687 7.554688 7.554687 4.175781 0 7.558593-3.382812 7.558593-7.554687v-94.382813h39.226563c4.171875 0 7.554687-3.382812 7.554687-7.558593 0-4.171875-3.382812-7.554688-7.554687-7.554688h-116.730469c-8.28125 0-15.015625-6.742187-15.015625-15.03125v-91.480469c0-8.289062 6.734375-15.03125 15.015625-15.03125h199.011719c8.292969 0 15.042969 6.742188 15.042969 15.03125v91.480469c0 8.289063-6.75 15.03125-15.042969 15.03125h-47.660156c-4.175781 0-7.558594 3.382813-7.558594 7.554688 0 4.175781 3.382813 7.558593 7.558594 7.558593h47.660156c16.628906 0 30.15625-13.523437 30.15625-30.144531v-91.480469c0-16.621093-13.527344-30.144531-30.15625-30.144531h-121.507813v-17.636719c0-8.554687 6.964844-15.511718 15.523438-15.511718h253.203125l-.050781 65.929687c0 16.886719 13.757812 30.625 30.664062 30.625h56.921875v.433594zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m75.648438 134.636719h-18.101563c-2.222656 0-4.113281.777343-5.667969 2.335937-1.554687 1.554688-2.332031 3.472656-2.332031 5.757813v53.515625c0 2.222656.761719 4.09375 2.285156 5.617187 1.523438 1.527344 3.335938 2.289063 5.429688 2.289063 2.097656 0 3.90625-.761719 5.429687-2.289063 1.527344-1.523437 2.289063-3.332031 2.289063-5.425781v-15.519531h11.621093c7.050782 0 12.703126-2.109375 16.957032-6.332031 4.253906-4.222657 6.382812-9.761719 6.382812-16.617188 0-6.917969-2.253906-12.539062-6.761718-16.855469-4.511719-4.316406-10.355469-6.476562-17.53125-6.476562zm5.621093 29.996093c-1.84375 1.84375-4 2.761719-6.476562 2.761719h-9.8125v-18.949219h9.90625c2.605469 0 4.777343.9375 6.527343 2.808594 1.746094 1.875 2.617188 4.144532 2.617188 6.808594 0 2.539062-.917969 4.730469-2.761719 6.570312zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m163.273438 152.777344c-2.253907-4.917969-5.414063-8.871094-9.476563-11.855469-5.652344-4.125-12.957031-6.1875-21.910156-6.1875h-15.910157c-2.226562 0-4.097656.792969-5.621093 2.378906-1.527344 1.589844-2.289063 3.398438-2.289063 5.429688v53.039062c0 2.285157.730469 4.15625 2.191406 5.617188 1.585938 1.398437 3.523438 2.09375 5.8125 2.09375h17.148438c9.269531 0 16.703125-2.507813 22.292969-7.523438 7.429687-6.789062 11.144531-15.773437 11.144531-26.945312 0-5.777344-1.128906-11.125-3.382812-16.046875zm-17.480469 30.996094c-3.304688 3.746093-7.683594 5.617187-13.148438 5.617187h-9.144531v-40.660156h8.289062c5.84375 0 10.464844 1.808593 13.863282 5.429687 3.394531 3.617188 5.09375 8.503906 5.09375 14.664063 0 6.222656-1.652344 11.203125-4.953125 14.949219zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m184.402344 204.34375c2.15625 0 3.984375-.765625 5.476562-2.289062 1.492188-1.523438 2.238282-3.332032 2.238282-5.425782v-20.472656h14.671874c2.097657 0 3.84375-.679688 5.238282-2.046875 1.398437-1.363281 2.097656-3 2.097656-4.90625 0-1.964844-.714844-3.632813-2.144531-4.996094-1.429688-1.363281-3.160157-2.046875-5.191407-2.046875h-14.671874v-13.429687h17.339843c1.96875 0 3.621094-.695313 4.953125-2.09375 1.335938-1.394531 2-3.015625 2-4.855469 0-2.03125-.679687-3.730469-2.046875-5.09375-1.367187-1.367188-3-2.046875-4.90625-2.046875h-24.960937c-2.222656 0-4.097656.792969-5.621094 2.378906-1.523438 1.589844-2.285156 3.429688-2.285156 5.523438v54.085937c0 2.097656.792968 3.90625 2.382812 5.429688 1.585938 1.519531 3.394532 2.285156 5.429688 2.285156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/></g></svg>
              </div>
              <div class="document-link">
                <a class="link" href="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`">
                  `+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`
                </a>
              </div>
            </div>`
            if(project_legal_documents[i].project_doc_tags.length > 0){
              html += `<div class="data">
              <ul class="tags">`
              for(let j = 0; j < project_legal_documents[i].project_doc_tags.length; j++){
                html += `<li>`+project_legal_documents[i].project_doc_tags[j].tag_name+`</li>`
              }

              html += `</ul>
            </div>`
            }

          html += `</div>
        </div>
        <div class="page-break"></div>`
        }
        else{
          html += `<div class="project-drawings-item">
          <div class="holder">
            <div class="pic">

              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`" class="" alt="logo">
              
            </div>`
            if(project_legal_documents[i].project_doc_tags.length > 0){
              html += `<div class="data">
              <ul class="tags">`
              for(let j = 0; j < project_legal_documents[i].project_doc_tags.length; j++){
                html += `<li>`+project_legal_documents[i].project_doc_tags[j].tag_name+`</li>`
              }

              html += `</ul>
            </div>`
            }

          html += `</div>
        </div>
        <div class="page-break"></div>`

        }

      }

      html += `<!-- project-drawings-item -->
    </div>
    <!-- project-drawings -->
  </div>
  <!-- end of page 10 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 11 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول ح</h1>
      <h2 class="subtitle">تفاصيل مدير المشروع</h2>
    </div>
    <!-- page-heading -->
    <!-- page-userdata -->
    <table class="page-userdata" style="margin-top:3cm">
      <tbody>
        <tr>
          <td>`
          if(project_manager_table.rows.length>0){
           html+= `<!-- user-info -->

            <div class="user-info">
            
              <p class="title">اسم مدير المشروع <strong>${project_manager_table.rows[0].dataValues.name}</strong></p>
              <p class="title">عنوان بريد الكتروني <strong>${project_manager_table.rows[0].dataValues.email}</strong></p>
              <p class="title">رقم الهاتف المحمول <strong>${project_manager_table.rows[0].dataValues.mobile_no}</strong></p>
            </div>`
          }
          else{

            html+= `<!-- user-info -->

            <div class="user-info">
            
              <p class="title">اسم مدير المشروع <strong></strong></p>
              <p class="title">عنوان بريد الكتروني <strong></strong></p>
              <p class="title">رقم الهاتف المحمول <strong></strong></p>
            </div>`

          }


          html+=  `<!-- user-info -->
          </td>
        </tr>
      </tbody>
    </table>
    <!-- page-userdata -->
  </div>
  <!-- end of page 11 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 11 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول ط</h1>
      <h2 class="subtitle">تفاصيل الحساب المصرفي للمقاول</h2>
    </div>
    <!-- page-heading -->
    <!-- page-userdata -->
    <table class="page-userdata" style="margin-top:3cm">
      <tbody>
        <tr>
          <td>`

          if(contract_bank_table.rows.length>0){
           html+=` <!-- user-info -->
            <div class="user-info">
              <p class="title">اسم البنك  <strong>${contract_bank_table.rows[0].dataValues.bank_name}</strong></p>
              <p class="title">إسم صاحب حساب البنك  <strong> ${contract_bank_table.rows[0].dataValues.account_holder_name}</strong></p>
              <p class="title">رقم حساب البنك  <strong> ${contract_bank_table.rows[0].dataValues.account_no}</strong></p>
            </div>`
          }

          else{

            html+=` <!-- user-info -->
            <div class="user-info">
              <p class="title">اسم البنك <strong></strong></p>
              <p class="title">اسم صاحب الحساب <strong></strong></p>
              <p class="title">رقم مكيفات الهواء<strong></strong></p>
            </div>`

          }
           html+=` <!-- user-info -->
          </td>
        </tr>
      </tbody>
    </table>
    <!-- page-userdata -->
  </div>
  <!-- end of page 11 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 11 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول  ي</h1>
      <h2 class="subtitle">البريد الإلكتروني للإشعارات</h2>
    </div>
    <!-- page-heading -->
    <!-- page-userdata -->
    <table class="page-userdata" style="margin-top:3cm">
      <tbody>
        <tr>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="subtitle">عميل</p>
              <p class="title">عنوان بريد الكتروني <strong>${client_table.rows[0].dataValues.user.email}</strong></p>
              <p class="title">رقم الموبايل <strong>${client_table.rows[0].dataValues.user.phone}</strong></p>
            </div>
            <!-- user-info -->
          </td>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="subtitle">مقاول</p>
              <p class="title">عنوان بريد الكتروني <strong>${user_table.rows[0].dataValues.email}</strong></p>
              <p class="title">رقم الموبايل <strong>${user_table.rows[0].dataValues.phone}</strong></p>
            </div>
            <!-- user-info -->
          </td>
        </tr>
      </tbody>
    </table>
    <!-- page-userdata -->
  </div>
  <!-- end of page 11 -->
  
  <div class="page-break"></div>
  
  <!-- start of page 11 -->
  <div class="page full-height-page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول  ك</h1>
      <h2 class="subtitle">تفاصيل الإستشاري</h2>
    </div>
    <!-- page-heading -->
    <!-- page-userdata -->
    <table class="page-userdata" style="margin-top:1.5cm">
      <tbody>
        <tr>
          <td colspan="2">
            <!-- user-image -->
            <div class="user-image">
              <div class="holder">
                <div class="pic">`
                if(fetch_photo && fetch_photo.rows.length>0){
                  html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+fetch_photo.rows[0].dataValues.resource_url+`" alt="User Image">`

                 }
                else{

                 html+=` <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg" alt="Image">`
                }
               html+=` </div>
                <div class="data">`
                if(consultant_table && consultant_table.rows.length>0){
                html+=`  <p class="title">${consultant_table.rows[0].dataValues.user_details.full_name}</p>
                </div>
              </div>
            </div>
            <!-- user-image -->
          </td>
        </tr>
        <tr>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="title">اسم الشركة <strong>${consultant_table.rows[0].dataValues.user_details.company_name}</strong></p>
              <p class="title">رقم الهاتف <strong>${consultant_table.rows[0].dataValues.user_details.phone}</strong></p>
            </div>
            <!-- user-info -->
          </td>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="title">العلاقة مع الشركة <strong>${consultant_table.rows[0].dataValues.user_details.relationship_with_company}</strong></p>
              <p class="title">عنوان بريد الكتروني <strong>${consultant_table.rows[0].dataValues.user_details.email}</strong></p>`
              }
              else{


                html+=`  <p class="title"></p>
                </div>
              </div>
            </div>
            <!-- user-image -->
          </td>
        </tr>
        <tr>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="title">اسم الشركة<strong></strong></p>
              <p class="title">رقم الهاتف<strong></strong></p>
            </div>
            <!-- user-info -->
          </td>
          <td>
            <!-- user-info -->
            <div class="user-info">
              <p class="title">العلاقة مع الشركة<strong></strong></p>
              <p class="title">عنوان بريد الكتروني <strong></strong></p>`
              }

              
              
            html+=`</div>
            <!-- user-info -->
          </td>
        </tr>
      </tbody>
    </table>
    <!-- page-userdata -->
  </div>
  <!-- end of page 11 -->

  <div class="page-break"></div>

  <!-- start of page 11 -->
  <div class="page">
    <!-- page-header -->
    <header class="page-header">
      <div class="site-logo">
      <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
      </div>
    </header>
    <!-- page-header -->
    <!-- page-heading -->
    <div class="page-heading">
      <h1 class="title">الجدول ل </h1>
      <h2 class="subtitle">تفاصيل اللافتة </h2>
    </div>
    <!-- page-heading -->
  </div>
  <!-- end of page 11 -->`




  // console.log('********', html)
  // return;
  pdf.create(html, options).toFile(global.constants.uploads.contract_documet + req.query.project_id+ '.pdf', function (err, resp) {

    res.send({ status: 201, message: 'fetched', resp: global.constants.IMG_URL.contract_documet_url+ req.query.project_id+ '.pdf',client_id:project_table_client.rows[0].dataValues.user_id,data:project_scope_table})

    if (err) return console.log(err);
    console.log(resp);
  })

}

  else
  {    
    var html= `<title>Contract English</title>
      <style>
        /* page setup */
        /*@page{
          size:A4 portrait;
          margin:1.5cm;
        }
        @page :first{
          margin:0cm;
        }*/
        /* common */
        *{
          margin:0 auto;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body{
          /*background-color:#ccc;*/
          font-family:Helvetica,Geneva,Tahoma,sans-serif;
          font-weight:400;
          font-size:12px;
          color:#323130; /* rgb(50,49,48) */
          line-height:1.35;
        }
        img{
          max-width:100%;
          height:auto;
        }
        /* page */
        .page{
          position:relative;
          display:block;
          background-color:#fff;
          box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
          /*box-sizing:border-box;*/
        }
        .page.full-height-page{
          min-height:calc( 20cm - 10px ); /* 29.7cm - 3cm */
          background:url(http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/Full-Page-Background.svg) center bottom repeat-x;
          background-size:1200px auto;
          background-color:#fff;
        }
        /* page-break */
        .page-break{
          page-break-after:always;
        }
        /* cover-image */
        .cover-image{
          position:relative;
        }
        .cover-image-pic img{
          width:100%;
        }
        .cover-image-data{
          position:absolute;
          top:40%;
          left:50%;
          z-index:1;
          -webkit-transform:translateX(-50%);
          transform:translateX(-50%);
        }
        .cover-image-data > *:last-child{
          margin-bottom:0 !important;
        }
        .cover-image-data .title{
          margin-bottom:25px;
          text-align:center;
          text-transform:uppercase;
          font-weight:500;
          font-size:40px;
          color:#14b105;
          line-height:1.2;
          letter-spacing:1px;
        }
        .cover-image-data .title strong{
          display:block;
          font-weight:700;
          color:#0346b1;
        }
        .cover-image-data .between{
          margin-bottom:15px;
          text-align:center;
          font-weight:500;
          font-size:12px;
          color:#262626;
          line-height:1.3;
        }
        .cover-image-data .between strong{
          display:block;
          margin-top:8px;
          font-weight:inherit;
          font-size:20px;
          color:#0346b1;
        }
        .cover-image-data .dated{
          margin-bottom:10px;
          text-align:center;
          font-weight:500;
          font-size:12px;
          color:#262626;
          line-height:1.2;
        }
        .cover-image-data .dated strong{
          font-weight:700;
        }
        /* page-header */
        .page-header{
          margin-bottom:25px;
        }
        .page-header .site-logo{
          text-align:center;
        }
        .page-header .site-logo img{
          width:120px;
        }
        /* page-heading */
        .page-heading{
          margin-bottom:25px;
          text-align:center;
        }
        .page-heading > *:last-child{
          margin-bottom:0 !important;
        }
        .page-heading .title{
          margin-bottom:10px;
          text-transform:uppercase;
          font-weight:700;
          font-size:18px;
          color:#323130;
        }
        .page-heading .subtitle{
          margin-bottom:6px;
          font-weight:600;
          font-size:16px;
        }
        .page-heading .description{
          margin-bottom:15px;
          font-weight:400;
          font-size:14px;
        }
        /* section-heading */
        .section-heading{
          margin-bottom:15px;
        }
        .section-heading > *:last-child{
          margin-bottom:0 !important;
        }
        .section-heading .title{
          margin-bottom:7px;
          font-weight:600;
          font-size:15px;
          color:#323130;
        }
        .section-heading .subtitle{
          margin-bottom:7px;
          font-weight:600;
          font-size:12px;
          color:#004e98;
        }
        .section-heading .description{
          margin-bottom:12px;
          font-weight:600;
          font-size:10px;
          color:#a2a2a2;
        }
        /* subject-heading */
        .subject-heading{
          margin-top:8cm;
          margin-bottom:15px;
          text-align:center;
        }
        .subject-heading > *:last-child{
          margin-bottom:0 !important;
        }
        .subject-heading .title{
          margin-bottom:7px;
          font-weight:600;
          font-size:22px;
          color:#004e98;
        }
        .subject-heading .subtitle{
          margin-bottom:25px;
          font-weight:400;
          font-size:30px;
          color:#323130;
        }
        /* user-info */
        .user-info{
          margin-bottom:15px;
          text-align:center;
        }
        .user-info > *:last-child{
          margin-bottom:0 !important;
        }
        .user-info .title{
          margin-bottom:35px;
          font-weight:600;
          font-size:10px;
          color:#004e98;
        }
        .user-info .title strong{
          display:block;
          margin-top:5px;
          font-weight:400;
          font-size:12px;
          color:#323130;
        }
        .user-info .subtitle{
          margin-bottom:30px;
          font-weight:600;
          font-size:12px;
          color:#323130;
        }
        /* user-image */
        .user-image{
          margin-bottom:50px;
          text-align:center;
        }
        .user-image > .holder{
          display:inline-block;
          vertical-align:top;
          padding-left:10px;
          padding-right:10px;
          box-sizing:border-box;
        }
        .user-image > .holder > .pic{
          margin-bottom:20px;
        }
        .user-image > .holder > .pic img{
          width:150px;
          height:150px;
          object-fit:cover;
          object-position:center center;
          border-radius:50%;
        }
        .user-image > .holder > .data{
        }
        .user-image > .holder > .data .title{
          margin-bottom:0;
          font-weight:600;
          font-size:19px;
          color:#004e98;
        }
        /* default-text */
        .default-text.text-center{
          text-align:center;
        }
        .default-text.text-left{
          text-align:justify;
        }
        .default-text > *:last-child{
          margin-bottom:0 !important;
        }
        .default-text h1{
          margin-bottom:10px;
          font-weight:600;
          font-size:18px;
          color:#323130;
        }
        .default-text h3{
          margin-bottom:10px;
          font-weight:600;
          font-size:13px;
          color:#323130;
        }
        .default-text p{
          margin-bottom:12px;
          font-weight:400;
          font-size:8px;
        }
        .default-text p.i-am-point{
          position:relative;
          padding-left:25px;
        }
        .default-text strong.number-system{
          position:absolute;
          top:0;
          left:0;
        }
        .default-text p.tab-space-1{
          position:relative;
          padding-left:55px;
        }
        .default-text p.tab-space-1 strong.number-system{
          left:20px;
        }
        .default-text p strong{
          color:#323130;
        }
        .default-text p strong.blue{
          color:#004e98;
        }
        .default-text table{
          width:100%;
          border-collapse:collapse;
          table-layout:fixed;
        }
        .default-text table > tbody > tr > td{
          vertical-align:top;
        }
        .default-text table > tbody > tr > td:first-child{
          width:30%;
          padding-right:15px;
        }
        .default-text table.signature-table > tbody > tr > td:first-child{
          width:50%;
        }
        .default-text table.signature-table > tbody > tr > td.text-left{
          text-align:left;
        }
        .default-text table.signature-table > tbody > tr > td.text-right{
          text-align:right;
        }
        .default-text table > tbody > tr > td img{
          margin-bottom:10px;
          max-height:40px;
        }
        .default-text table > tbody > tr > td hr{
          width:100%;
          max-width:200px;
          margin-bottom:10px;
          border-top:1px color:#323130;
        }
        /* page-agreement */
        .page-agreement{
          margin-bottom:25px;
        }
        /* project-drawings */
        .project-drawings{
        }
        .project-drawings-item{
          /*width:33.33%;*/
          width:100%;
          /*float:left;*/
          margin-bottom:20px;
          /*page-break-inside:avoid;*/
        }
        .project-drawings-item > .holder{
          padding-left:10px;
          padding-right:10px;
          box-sizing:border-box;
        }
        .project-drawings-item > .holder > .pic{
          margin-bottom:10px;
        }
        .project-drawings-item > .holder > .pic img{
          width:100%;
          border-radius:4px;
        }
        .project-drawings-item > .holder > .document{
          margin-bottom:10px;
          padding:20px 10px 20px 10px;
          background-color:#fff;
          border:1px solid #e3e3e3;
          border-radius:5px;
          text-align:center;
        }
        .project-drawings-item > .holder > .document > .document-icon{
          margin-bottom:15px;
        }
        .project-drawings-item > .holder > .document > .document-icon svg{
          display:inline-block;
          vertical-align:top;
          width:90px;
          height:100px;
          margin-left:-15px;
        }
        .project-drawings-item > .holder > .document > .document-link{
          margin-bottom:0;
        }
        .project-drawings-item > .holder > .document > .document-link .link{
          margin-bottom:0;
          font-weight:400;
          font-size:9px;
          color:inherit;
          text-decoration:none;
        }
        .project-drawings-item > .holder > .data{
        }
        .project-drawings-item > .holder > .data ul.tags{
          padding-left:0;
          text-align:left;
          list-style:none;
          font-size:0;
        }
        .project-drawings-item > .holder > .data ul.tags li{
          position:relative;
          display:inline-block;
          vertical-align:top;
          margin-right:7px;
          margin-bottom:7px;
          padding:3px 7px 4px 7px;
          background-color:#f3f3f3;
          border-radius:3px;
          font-weight:400;
          font-size:9px;
        }
        .project-drawings-item > .holder > .data ul.tags li:last-child{
          margin-right:0;
        }
        /* project-ganttchart */
        .project-ganttchart{
          position:relative;
          margin-bottom:25px;
          border:1px solid #e3e3e3;
        }
        .project-ganttchart img{
          width:100%;
        }
        /* table */
        .table{
          width:100%;
          margin-bottom:25px;
          background-color:#fff;
          border:1px solid #e3e3e3;
          border-collapse:collapse;
          table-layout:fixed;
        }
        .table thead tr th{
          padding:4px 10px 5px 10px;
          background-color:#f6f6f8;
          border-right:1px solid #e3e3e3;
          border-bottom:1px solid #e3e3e3;
          text-align:center;
          font-weight:400;
          font-size:9px;
          color:#0047ba;
        }
        .table thead tr th:last-child{
          border-right:none;
        }
        .table thead tr th.text-left{
          text-align:left;
        }
        .table thead tr th.task-no{
          width:50px;
        }
        .table thead tr th.status,
        .table thead tr th.type,
        .table thead tr th.creator{
          width:80px;
        }
        .table thead tr th.stage-no{
          width:35px;
        }
        .table thead tr th.number-of-days{
          width:45px;
        }
        .table tbody tr th{
          padding:7px 7px 8px 7px;
          background-color:#f0f6ff;
          border:1px solid #e3e3e3;
          text-align:left;
          font-weight:400;
          font-size:11px;
          color:#0047ba;
        }
        .table tbody tr th.text-left{
          text-align:left;
        }
        .table tbody tr th.text-center{
          text-align:center;
        }
        .table tbody tr th.description{
          width:100px;
        }
        .table tbody tr td{
          padding:3px 7px 5px 7px;
          background-color:#fff;
          border-right:1px solid #e3e3e3;
          border-bottom:1px solid #e3e3e3;
          text-align:center;
          font-weight:400;
          font-size:8px;
          page-break-inside:avoid;
        }
        .table tbody tr td.text-left{
          text-align:left;
        }
        .table tbody tr td.text-center{
          text-align:center;
        }
        .table tbody tr td.success{
          color:#02d94f;
        }
        .table tbody tr td.failed{
          color:#FF0000;
        }
        .table tbody tr td.default-cell{
          background-color:#f4ba00;
        }
        .table tbody tr td.custom-cell{
          background-color:#02d94f;
          color:#fff;
        }
        .table tbody tr td.cell-xl{
          padding-top:10px;
          padding-bottom:12px;
        }
        .table tbody tr td .subject{
          margin-bottom:7px;
          font-weight:400;
          font-size:12px;
          color:#a2a2a2;
        }
        .table tbody tr td .data{
          margin-bottom:0;
          font-weight:600;
          font-size:14px;
          color:#323130;
        }
        /* table.specification-details */
        .table.specification-details-table{
          table-layout:auto;
        }
        .table.specification-details-table thead tr th{
          font-size:8px;
        }
        .table.specification-details-table tbody tr th{
          font-size:7px;
        }
        .table.specification-details-table tbody tr td{
          font-size:6px;
        }
        .table.specification-details-table tbody tr th.supply{
          width:50px;
        }
        /* project-scope */
        .project-scope{
          width:100%;
          margin-top:10px;
          margin-bottom:35px;
          border-collapse:collapse;
          /*table-layout:fixed;*/
        }
        .project-scope thead tr th{
          width:33.33%;
          vertical-align:top;
          padding:0 10px 10px 10px;
          border-bottom:1px solid #e3e3e3;
          text-align:center;
          font-weight:700;
          font-size:11px;
          color:#323130;
        }
        .project-scope tbody tr td{
          vertical-align:top;
          padding:13px 10px 0 10px;
          background-color:#fff;
          border-right:1px solid #e3e3e3;
        }
        .project-scope tbody tr td:last-child{
          border-right:none;
        }
        .project-scope tbody tr td ul.scope-list{
          padding-left:0;
          text-align:left;
          list-style:none;
        }
        .project-scope tbody tr td ul.scope-list li{
          position:relative;
          margin-bottom:7px;
          padding-left:19px;
          font-weight:400;
          font-size:9px;
        }
        .project-scope tbody tr td ul.scope-list li:last-child{
          margin-bottom:0;
        }
        .project-scope tbody tr td ul.scope-list li .list-icon{
          position:absolute;
          top:1px;
          left:0;
        }
        /* page-userdata */
        .page-userdata{
          width:100%;
          border-collapse:collapse;
          table-layout:fixed;
        }
        .page-userdata tbody tr td{
          padding-right:10px;
          padding-left:10px;
          border-right:1px solid #e3e3e3;
        }
        .page-userdata tbody tr td:last-child{
          border-right:none;
        }
        @media print{
          .page{
            width:auto;
            margin-top:0;
            margin-bottom:0;
            box-shadow:initial;
          }
        }
      </style>

      <!-- start of page 1 -->
      <div class="page">
        <!-- cover-image -->
        <div class="cover-image">
          <!-- cover-image-pic -->
          <div class="cover-image-pic">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="Cover Image Arabic">
          </div>
          <!-- cover-image-pic -->
          <!-- cover-image-data -->
          <div class="cover-image-data">
            <h1 class="title">Muqawala <strong>Agreement</strong></h1>
            <h2 class="between">By and Between <strong>${project_data_value.rows[0].dataValues.user.full_name} <br> &amp; <br> ${project_contract_data_fetch.rows[0].dataValues.user.full_name}</strong></h2>
            <h2 class="dated"><strong>${start_date}</strong></h2>
          </div>
          <!-- cover-image-data -->
        </div>
        <!-- cover-image -->
      </div>
      <!-- end of page 1 -->

      <div class="page-break"></div>

      <!-- start of page 2 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-agreement default-text -->
        <div class="page-agreement default-text text-center">
          <h1>Muqawala Agreement</h1>
          <p>This Muqawala Agreement (hereinafter the “Agreement”) is executed, effective and replaces any other related agreements as of ${start_date}</p>
          <h3>By and Between</h3>
          <p>1.${project_data_value.rows[0].dataValues.user.full_name},Omani national, having identification number ${project_table_client.rows[0].dataValues.national_id} (hereinafter the <b>“Client”</b> which term shall, wherever the context so permits or requires, mean and include its successors in interest, legal heirs and, assigns)</p>
          <p>And</p>
          <p>2. ${project_contract_data_fetch.rows[0].dataValues.user.full_name}, incorporated in accordance with Omani Laws and Regulations under CR number `
          if(contract_metas_data_fetch.rows.length>0)
          { 
            html+=` ${contract_metas_data_fetch.rows[0].dataValues.key_value}`
        } 
        
        html+=` (hereinafter referred to as the <b>“Contractor”</b> which term shall, wherever the context so permits or requires, mean and include its successors in interest, legal heirs and, assigns)</p>
          <p>(Client and Contractor are hereinafter collectively referred to as the <strong>“Parties” or “Party”</strong> where the context so requires). This Agreement is an electronic transaction in terms of Electronic Transactions Law (Royal Decree 69/2008) and Parties hereby express their offer and acceptance through electronic message(s).</p>
        </div>
        <!-- page-agreement default-text -->
        <!-- page-agreement default-text -->
        <div class="page-agreement default-text text-left">
          
        <h3>RECITALS</h3>
        <p class="i-am-point"><strong class="number-system">A.</strong> WHEREAS the Client and the Contractor are registered users of <span style="color:rgb(50,49,48);">‘eBinaa’</span> (hereinafter the “Platform”), an online eTendering and automated project management service provider;</p>
        <p class="i-am-point"><strong class="number-system">B.</strong> WHEREAS the Parties acknowledge that the role of the Platform is limited to providing an online space for both the Client and Contractor to connect and determine the terms and conditions governing the relationship between the Parties;</p>
        <p class="i-am-point"><strong class="number-system">C.</strong> WHEREAS the Parties acknowledge that the Platform neither bears any liability nor responsibility on behalf of either the Client or the Contractor;</p>
        <p class="i-am-point"><strong class="number-system">D.</strong> WHEREAS the Parties acknowledge that the Platform does not stand as a guarantor, surety, agent, partner or representative for either the Contractor or the Client;</p>
        <p class="i-am-point"><strong class="number-system">E.</strong> WHEREAS the Client is a complete and lawful owner of the property located at `
        if(project_table_client.rows[0].dataValues.land_serial_no)
        {
         html+=project_table_client.rows[0].dataValues.land_serial_no+`,`+project_table_client.rows[0].dataValues.project_location
        }
        else
        {
          html+=project_table_client.rows[0].dataValues.project_location
        }
        html += `</strong> (hereinafter the <strong>“Property”</strong>) and desirous of building a `+project_table_client.rows[0].dataValues.project_use_type+` unit over the Property;</p>
        <p class="i-am-point"><strong class="number-system">F.</strong> WHEREAS the Client used the services available at the Platform to list the Property along with Drawings and Specifications and other ancillary requirements (hereinafter the “Project”); </p>
        <p class="i-am-point"><strong class="number-system">G.</strong> WHEREAS pursuant to creation of the Project by the Client over the Platform, the Contractor submitted a proposal setting out the total price to be charged by the Contractor for completing the Project as per the requirements of the Project;</p>
        <p class="i-am-point"><strong class="number-system">H.</strong> WHEREAS the Client deemed the proposal of Contractor satisfactory and Parties have accordingly agreed to work together;</p>
        <p class="i-am-point"><strong class="number-system">I.</strong> WHEREAS the recitals set out an unambiguous and clear understanding between the Parties and shall be treated as an integral part of this Agreement;</p>
        <p class="i-am-point"><strong>NOW THEREFORE THIS AGREEMENT WITNESSETH that in consideration of the promises and the mutual covenants, agreements and conditions herein contained, it is hereby covenanted, agreed and declared by and among the Parties (as defined herein) as follows:</strong></p>
    
        <h3>1. Definitions:</h3>
        <p>In this Agreement, unless the context otherwise requires, the following definitions will apply:</p>
    
      
          <table>
            <tbody>
              <tr>
                <td>
                  <p><strong>Actual Contract Value or “ACV”</strong></p>
                </td>
                <td>
                  <p>Lump sum value to be paid to the Contractor by the Client for completion of Construction Work as provided for in <strong>Schedule K</strong> of this Agreement</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Applicable Law</strong></p>
                </td>
                <td>
                  <p>Laws of Sultanate of Oman</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Bank Account</strong></p>
                </td>
                <td>
                  <p>Bank Account of the Contractor set out in <strong>Schedule A</strong> of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Building Permit</strong></p>
                </td>
                <td>
                  <p>Official approval, set out in Schedule G of this Agreement, issued from the Municipality to raise construction over the Property after perusal of the Drawings, Soil Report, where applicable, and other approvals from Municipality and/or Competent Authorities, where required;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Building Completion Certificate</strong></p>
                </td>
                <td>
                  <p>Certificate issued  by the Municipality upon completion of project after complying  with requirements of Competent Authorities</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Commencement of Construction Date</strong></p>
                </td>
                <td>
                  <p>Date on which the Contractor shall commence Construction Work at the Property as set out in <strong>Schedule B</strong> of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Competent Authority</strong></p>
                </td>
                <td>
                  <p>Government or Semi Government body performing its specific designated function(s);</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Completion Date</strong></p>
                </td>
                <td>
                  <p>Date set out in <strong>Schedule C</strong> of this Agreement on or before which all Construction Work shall be completed by the Contractor;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Confidential Information</strong></p>
                </td>
                <td>
                  <p>All information, not limited to, relating to designs, layout, sketches, Specifications, Soil Report, Drawings, technical studies, costs, the business and related information, trade secrets, Client information, know how, invoices, employment policies, personnel, information about products, information about manufacturers, processes, including ideas, concepts, projections, know-how, specification, all data, documents, application, statements, programs, plans, papers, resumes, records and other documents containing and/or relating to such confidential information, and any and all information of value to the Party or Parties, or which gives Party or Parties an edge over competition, or which Parties treat and designate as confidential;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Construction Work</strong></p>
                </td>
                <td>
                  <p>Works necessary for completion of the Project;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Consultant</strong></p>
                </td>
                <td>
                  <p>Engineering consultant licensed by Ministry of Commerce and Industry <strong>(“MOCI”)</strong> to provide Drawings, sketches, Specifications, conditions, designs, survey and planning, supervision of implementation and giving advice on the Project;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>CR</strong></p>
                </td>
                <td>
                  <p>Commercial Registration Certificate;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Drawings</strong></p>
                </td>
                <td>
                  <p>Set of construction drawings reflecting organization of land use, zoning, access, circulation, privacy, security, shelter, land drainage, appearance, 3D views, structural details, foundational layout and other similar factors attached as <strong>Schedule F</strong> to this Agreement</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Excavation Permit</strong></p>
                </td>
                <td>
                  <p>Permit issued by Municipality whereby the Contractor is allowed to begin excavation at the Property;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Handing Over Date</strong></p>
                </td>
                <td>
                  <p>Date on which the Unit shall be given in possession of the Client after the Contractor has obtained Building Completion Certificate from the Municipality which date shall be on or before the Completion Date or Revised Completion Date;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Intellectual Property</strong></p>
                </td>
                <td>
                  <p>Means patents, rights in inventions, designs, Drawings, structural layout, architectural design, Specifications, site plan, trade names, know how, show how and trade secrets, copyright and related rights, registered designs, design rights, database rights, trademarks and service marks(in each case, whether or not registered, and including all applications to register and rights to apply to register any of them and all rights to sue for any past or present infringement of them) and all rights or forms of protection having equivalent or similar effect in any jurisdiction;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Municipality</strong></p>
                </td>
                <td>
                  <p>Governing body of a municipality within which the Property is located;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Program of Works</strong></p>
                </td>
                <td>
                  <p>Time allocated for each stage of Construction Work along with tasks to be performed by the Consultant and the Client at each stage of Construction Work as set out in <strong>Schedule D</strong> of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Revised Completion Date</strong></p>
                </td>
                <td>
                  <p>Date set out in Schedule C of this Agreement on or before which Construction Work shall be completed by the Contractor following a Variation Order or extension of time which the Contractor is entitled to as per the terms of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Revised Contract Value or “RCV”</strong></p>
                </td>
                <td>
                  <p>Increase or decrease in the ACV following any variation in the Construction Work, Drawings or Specifications as set out in <strong>Schedule K</strong> of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Specifications</strong></p>
                </td>
                <td>
                  <p>Details of the assigned scope of work, materials, installations and supplies required to complete the Project as set out in <strong>Schedule F</strong> of this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Title Deed</strong></p>
                </td>
                <td>
                  <p>Document constituting evidence of Client’s ownership of Property attached as <strong>Schedule G</strong> to this Agreement;</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p><strong>Variation Order</strong></p>
                </td>
                <td>
                  <p>Amendments to or changes in Drawings and Specifications resulting in addition or deletion of Construction Work.</p>
                </td>
              </tr>
            </tbody>
          </table>
      
          <h3>2. Interpretation:</h3>
          <p class="i-am-point"><strong class="number-system">2.1.</strong> A reference to a party is a reference to any party signing this Agreement;</p>
          <p class="i-am-point"><strong class="number-system">2.2.</strong> A reference to a clause, schedule or annexure is a reference to a clause of or a schedule to this Agreement;</p>
          <p class="i-am-point"><strong class="number-system">2.3.</strong> Schedules form part of this Agreement and shall have effect as if set out in full in the body of this Agreement. Any reference to this Agreement shall also include the Schedules. </p>  
          <p class="i-am-point"><strong class="number-system">2.4.</strong> A reference to this Agreement or another instrument includes any amendment or replacement of either of them;</p>
          <p class="i-am-point"><strong class="number-system">2.5.</strong> A reference to a law includes regulations and other instruments under it and consolidations, amendments, re-enactment’s or replacements of any of them;</p>
          <p class="i-am-point"><strong class="number-system">2.6.</strong> If a period is specified and it is from a given day or the day of an act or event, it is to be calculated inclusive of that day.</p>
          <p class="i-am-point"><strong class="number-system">2.7.</strong> If an obligation is to be performed on a certain day which falls on a public holiday or Friday then such obligation shall be performed on the next working day following such public holiday or Friday.</p>

          <h3>3. Scope of Work, Approvals and Fines:</h3>
          <p class="i-am-point"><strong class="number-system">3.1.</strong> Client shall be responsible for:</p>
          <p class="tab-space-1"><strong class="number-system">3.1.1.</strong> Performing tasks assigned to Client in the Program of Works within such time limit as stipulated for performance of each of the task(s);</p>
          <p class="tab-space-1"><strong class="number-system">3.1.2.</strong> Providing approvals upon his satisfaction within a period of 14 days following the receipt of request from the Contractor seeking Client’s approval. Any unreasonable delay in providing the approval shall entitle the Contractor to an seek an extension of time;</p>
          <p class="tab-space-1"><strong class="number-system">3.1.3.</strong> Appointing a Consultant, details set out in Schedule H of this Agreement, to oversee the implementation of Drawings, compliance with Specifications and Construction Work in accordance with the tasks assigned to the Consultant in the Program of Works</p>
          <p class="tab-space-1">Provided that where the Client fails to appoint a Consultant for overseeing implementation of Drawings, compliance with Specifications and Construction Work then the Client shall be responsible for ensuring that the tasks of the Consultant are conducted within the required time period as provided for in the Program of Works.</p>
          <p class="tab-space-1"><strong class="number-system">3.1.4.</strong> Obtaining a Soil Report from a specialized firm or recognized laboratory, if required by the Municipality or the Consultant;</p>
          <p class="tab-space-1"><strong class="number-system">3.1.5.</strong> Obtaining approvals from Competent Authorities, where required as per the regulations of the Municipality till the Building Permit is approved by the Municipality;</p>
          <p class="tab-space-1"><strong class="number-system">3.1.6.</strong> Ensuring that the boundaries of the Property are surveyed and marked, as and when required by the Competent Authority;</p>
          <p class="tab-space-1"><strong class="number-system">3.1.7.</strong> Procuring any other approvals required to be obtained from the Municipality or Competent Authority till the Building Permit is approved by the Municipality;</p>
          <p class="i-am-point"><strong class="number-system">3.2.</strong> Contractor is responsible for:</p>
          <p class="tab-space-1"><strong class="number-system">3.2.1.</strong> Conducting tasks assigned to the Contractor in the Program of Works within such time limit as stipulated for performance of each of the task(s);</p>
          <p class="tab-space-1"><strong class="number-system">3.2.2.</strong> Fencing the Property before commencement of the Construction Work;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.3.</strong> Ensuring that the Construction Work at the Property is commenced promptly and without delay upon the occurrence of the Commencement of Construction Date;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.4.</strong> Obtaining and paying costs of the Excavation Permit from the Municipality immediately after signing of this Agreement;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.5.</strong> Ensuring that Construction Work is compliant with the Drawings and Specifications;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.6.</strong> Ensuring that the Construction Work is executed by or before the Completion Date or the Revised Completion Date, as the case may be;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.7.</strong> Submitting list of materials to be provided by the Client, as per the Specifications, to the Client within 30 days of Commencement of Construction Date;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.8.</strong> Ensuring that inspections required by the Municipality are carried out;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.9.</strong> Ensuring that the Consultant is allowed to carry out the inspection of Construction Work at each stage of activity as listed in Program of Works or as and when deemed appropriate by the Consultant or the Client;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.10.</strong> Adhering to the Consultant’s approvals, recommendations and comments to comply with Drawings and Specifications;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.11.</strong> Obtaining and paying costs of the Building Completion Certificate to be issued by the Municipality after the Project is inspected by the Municipality post completion of Construction Work;</p>
          <p class="tab-space-1"><strong class="number-system">3.2.12.</strong> Ensuring that the Project is compliant with the requirements of the Municipality and/or Competent Authorities to be connected with the public services before the Unit is handed over to the Client on the Handing Over Date.</p>
          <p class="i-am-point"><strong class="number-system">3.3.</strong> Apart from the foregoing details set out in Clause 3.1 and 3.2, it is generally understood and agreed upon by the Parties that all the permits and approvals required for obtaining the Building Permit are to be obtained, paid for and/or procured by the Client whereas all the permits and approvals from the commencement of Construction Work till the Handing Over Date are to be obtained and paid for by the Contractor.</p>
          <p class="i-am-point"><strong class="number-system">3.4.</strong> Any fines imposed by the Municipality or the Competent Authority arising out of the Construction Work for non-compliance with the provisions of Applicable Law or which are otherwise attributable to the Contractor shall be borne by the Contractor.</p>

          <h3>4. Materials, Equipment and Signboard:</h3>
          <p class="i-am-point"><strong class="number-system">4.1.</strong> Materials</p>
          <p class="tab-space-1"><strong class="number-system">4.1.1.</strong> Materials to be provided by the Client as per the Specifications listed in Schedule F shall be made available at the Property in accordance with the time limit set out in in the Program of Works;</p>
          <p class="tab-space-1"><strong class="number-system">4.1.2.</strong> Contractor shall submit list of materials to be supplied by the Client to the Client within 30 days of Commencement of Construction Date, clearly identifying the quantity and stages at which the material shall be delivered by the Client;</p>
          <p class="tab-space-1">Provided where the material made available by the Client does not conform to the standards adopted in Oman or where the material provided for does not meet the required quantity then the Contractor shall promptly inform the Client for provision of substitute or additional material, as the case may be.</p>
          <p class="tab-space-1"><strong class="number-system">4.1.3.</strong> Contractor shall ensure that the materials to be procured by the Contractor in terms of Specifications listed in Schedule F are available at the Property and that the Construction Work is not delayed due to non-availability of the materials.</p>
          <p class="tab-space-1"><strong class="number-system">4.1.4.</strong> Contractor shall ensure that all the materials used in the Construction Work conform to the Specifications and where no specification/requirement is provided then the materials shall conform with the standards adopted in Oman and shall be submitted for Consultant’s approval;</p>
          <p class="tab-space-1">Provided that the materials listed in the Specification shall, at least, meet the minimum requirements of the Municipality or the Competent Authority.</p>
          <p class="tab-space-1"><strong class="number-system">4.1.5.</strong> Contractor shall ensure that all the temporary materials used in the Construction Work conform to the standards adopted in Oman;</p>
          <p class="tab-space-1"><strong class="number-system">4.1.6.</strong> Contractor shall ensure that all the materials used in Construction Work, including the materials provided by the Client, are properly maintained and secured within the boundaries of the Property and that the materials are properly removed from the Property when a particular material is no longer required for Construction Work.</p>
          <p class="tab-space-1"><strong class="number-system">4.1.7.</strong> Contractor shall return the materials which were provided by the Client to the Contractor and remain unused after the completion of the activity as per the Programs of Works wherein such material was to be used. </p>
          <p class="tab-space-1"><strong class="number-system">4.1.8.</strong> Contractor shall ensure that the construction waste is properly removed from the Property during Program of Works and after obtaining necessary approval(s) of the Municipality, if required, to the areas designated by the Municipality for disposal of construction waste.</p>
          <p class="i-am-point"><strong class="number-system">4.2.</strong> Contractor shall remain liable for all the losses arising out of theft, loss or damage to the materials at the Property, whether provided by the Client or the subcontractor(s).</p>
          <p class="i-am-point"><strong class="number-system">4.3.</strong> Equipment:</p>
          <p class="tab-space-1"><strong class="number-system">4.3.1.</strong> Contractor shall be responsible for ensuring that the equipment to be used in the Construction Work is available at the Property and properly secured and maintained within the boundaries of the Property and removed promptly when such equipment is no longer required for Construction Work.</p>
          <p class="i-am-point"><strong class="number-system">4.4.</strong> Signboard:</p>
          <p class="tab-space-1"><strong class="number-system">4.4.1.</strong> Contractor shall, prior to the Commencement of Construction Date, install a signboard at the Property displaying all the information as required by the Municipality and the particulars set out in Schedule I.</p>

          <h3>5. Time Period:</h3>
          <p class="i-am-point"><strong class="number-system">5.1.</strong> Parties hereby agree that the calculation of time period for completion of Construction Work shall be calculated from the beginning of Commencement of Construction Date and ending on Completion Date or Revised Completion Date, as applicable, whereby Commencement of Construction Date and Completion Date or Revised Completion Date, as applicable, are determined as follows:</p>
          <p class="tab-space-1"><strong>Commencement of Construction Date:</strong></p>
          <p class="tab-space-1"><strong class="number-system">5.1.1.</strong> 14 days from either; the date of electronic signing of this Agreement or the date of receiving the mobilization payment from the Client, whichever is later, shall constitute the Commencement of Construction Date. </p>
          <p class="tab-space-1"><strong>Completion Date:</strong></p>
          <p class="tab-space-1"><strong class="number-system">5.1.2.</strong> Completion Date shall fall on the date following the conclusion of the project construction time period as per the Program of Works which time period shall begin to run from the Commencement of Construction Date.</p>
          <p class="tab-space-1"><strong class="number-system">5.1.3.</strong> Completion Date maybe modified as per Clause 11 of this Agreement or following a Variation Order and the modified Completion Date shall be treated as the Revised Completion Date and recorded in the same schedule as the Completion Date, that is, Schedule C.</p>

          <h3>6. Contractor’s Workforce:</h3>

          <p class="i-am-point"><strong class="number-system">6.1.</strong> The Contractor shall provide and employ on the Property in connection with the Construction Work:</p>
          <p class="tab-space-1"><strong class="number-system">6.1.1.</strong> Competent and experienced project manager, details set out in Schedule J of this Agreement, with a certified engineering qualification to ensure that the Construction Work is completed in line with the terms of this Agreement;</p>
          <p class="tab-space-1"><strong class="number-system">6.1.2.</strong> Only such technical assistants as are skilled and experienced in their respective task and such foremen and leading hands as are competent to give proper supervision to the work they are required to supervise; and</p>
          <p class="tab-space-1"><strong class="number-system">6.1.3.</strong> Such skilled, semi-skilled and unskilled labour as is necessary for the proper and timely execution, completion and maintenance of the Unit.</p>
          <p class="i-am-point"><strong class="number-system">6.2.</strong> The Contractor shall be responsible for the engagement of all labour, local or otherwise, and for the transport, housing, feeding and payment thereof in accordance with the Applicable Law.</p>
          <p class="i-am-point"><strong class="number-system">6.3.</strong> The Contractor shall not use the Property as accommodation or housing for the labour unless the consent of the Client is obtained.</p>
          <p class="i-am-point"><strong class="number-system">6.4.</strong> Upon completion of the Construction Work, Contractor shall ensure that any temporary structures raised for accommodating the labour, as per the Applicable Law, are removed from the Property before the Handing Over Date.</p>

          <h3>7. Health, Safety and Security:</h3>
          <p class="i-am-point"><strong class="number-system">7.1.</strong> The Contractor shall throughout the Construction Work have full regard for the safety of all persons at the Property.</p>
          <p class="i-am-point"><strong class="number-system">7.2.</strong> The Contract shall in particular:</p>
          <p class="tab-space-1"><strong class="number-system">7.2.1.</strong> Ensure appropriate protection at the edges of the roof or elevated floors,</p>
          <p class="tab-space-1"><strong class="number-system">7.2.2.</strong> Ensure safe erection of temporary structures; </p>
          <p class="tab-space-1"><strong class="number-system">7.2.3.</strong> Keep the Property and the Construction Work in an orderly state appropriate for the avoidance of danger to all persons at the Property; </p>
          <p class="tab-space-1"><strong class="number-system">7.2.4.</strong> Maintain, at Contractor’s cost, all lights, fencing and warning signs as required under the Applicable Law; and</p>
          <p class="tab-space-1"><strong class="number-system">7.2.5.</strong> Employ a guard or guards, as per the Applicable Law, at the Property from the Commencement of Construction Date till the Handing Over Date and ensure that the Property remains guarded at all times of the day;</p>

          <h3>8. Sub-Contractor:</h3>
          <p class="i-am-point"><strong class="number-system">8.1.</strong> Contractor shall not sub-contract whole of the Construction Work except for parts of the Construction Work which shall not exceed 50% of whole of the Construction Work.</p>
          <p class="i-am-point"><strong class="number-system">8.2.</strong> Contractor shall ensure that the sub-contractor remains compliant with the provisions of this Agreement pertaining to Program of Works, Specifications, Drawings and any other requirements related to Construction Work.</p>
          <p class="i-am-point"><strong class="number-system">8.3.</strong> Contractor hereby assumes complete and full responsibility and liability for the Construction Work executed by the sub-contractor along with the responsibility to pay the amounts due to the sub-contractor for Construction Work executed by the sub-contractor.</p>
          <p class="i-am-point"><strong class="number-system">8.4.</strong> Client hereby disclaims any liability towards the sub-contractor for payment or provision of materials, labour, equipment or any other requirement of the sub-contractor for carrying out the Construction Work;</p>
          <p class="i-am-point">Provided where a sub-contractor is hired by the Client for performance of certain works at the Property then the Contractor shall provide complete assistance and free access to the Property to such sub-contractor;</p>
          <p class="i-am-point">Provided further that the Contractor shall neither bear any liability of payment to the sub-contractor hired by the Client nor for the work carried out by such sub-contractor.</p>
          <p class="i-am-point"><strong class="number-system">8.5.</strong> Entitlements and obligations of the sub-contractor are not governed by this Agreement and are a matter falling within the exclusive domain of Contractor and sub-contractor.</p>

          <h3>9. Terms of Payment:</h3>
          <p class="i-am-point"><strong class="number-system">9.1.</strong> Contractor shall only be entitled to the lump sum ACV or RCV, as applicable, for the entire Construction Work divided in a number of stages as listed in the Program of Works and any variation in the prices of materials, equipment, labour, sub-contractor or any item ancillary to the completion of Construction Work shall be at the Contractor’s expense.</p>
          <p class="i-am-point"><strong class="number-system">9.2.</strong> Contractor shall be entitled to payments upon completion of each stage listed in the Program of Works as per the terms of payment set out in Schedule K of this Agreement and certified by the Consultant, where appointed by the Client for overseeing the implementation of Construction Work.</p>
          <p class="i-am-point">Provided where no Consultant is appointed, the Contractor shall provide a written undertaking that the stage for which payment is sought as per the Program of Works stands completed as per the requirements of the Applicable Law, Drawings and Specifications.</p>
          <p class="i-am-point"><strong class="number-system">9.3.</strong> Client shall deposit the payment in the Bank Account within fourteen (14) days after being in receipt of the invoice approved by the Consultant following Consultant’s inspection of the completed activity as per the Program of Works.</p>
          <p class="i-am-point">Provided where no Consultant is appointed, Client shall deposit the payment in the Bank Account within fourteen (14) days after being in receipt of the written undertaking provided by the Contractor in terms of proviso to Clause 9.2 of this Agreement. </p>
          <p class="i-am-point"><strong class="number-system">9.4.</strong> Where the payment is delayed beyond the period of fourteen (14) days as set out in Clause 9.3 of this Agreement then the Contractor shall only be entitled to claim an extension of time subject to Clause 11 of this Agreement;</p>
          <p class="i-am-point">Provided that the delay in payment shall not effect the Contractor’s obligations to proceed with the Construction Work as per the Program of Works up to a period of sixty (60) days from the date of service of invoice where after the Contractor, on account of non-payment, may suspend the Construction Works till such time the payment has been made.</p>
          <p class="i-am-point">Provided further that the Contractor shall not be entitled to claim any delayed payment charges or any other cost associated with such delayed payment. </p>
          <p class="i-am-point"><strong class="number-system">9.5.</strong> Subject to Clause 11, Contractor’s failure to complete the Construction Work as per the Program of Works shall entitle the Client to claim 0.5% of the ACV or RCV, as applicable, for each delay of thirty (30) days calculated from the Completion Date or the Revised Completion Date, as applicable, not exceeding 8% of the ACV or RCV, as applicable, from the Contractor or set off such amount that the Client is entitled to from the amount payable to the Contractor. </p>

          <h3>10. Variation:</h3>
          <p class="i-am-point"><strong class="number-system">10.1.</strong> Minor modifications which do not materially alter the Drawings or Specifications shall be allowed by the contractor for the client, subject to the Contractor’s estimation.</p>
          <p class="i-am-point"><strong class="number-system">10.2.</strong> Any variations in the Drawings or Specifications or any other aspect related to Construction Work of the Unit either increasing or decreasing the ACV shall be resolved by the Parties mutually, as and when the need arises.</p>
          <p class="i-am-point">Provided that the negotiations between the Parties regarding variation shall not affect each of the Parties obligations under this Agreement unless the negotiations conclude into an agreement amending the scope of this Agreement.</p>
          <p class="i-am-point"><strong class="number-system">10.3.</strong> The agreed variations must be documented as a Variation Order and must clearly identify the following parameters:</p>
          <p class="tab-space-1"><strong class="number-system">10.3.1.</strong> Stage Details: Identify modification to the stage or an addition of a new stage in the Program of Works</p>
          <p class="tab-space-1"><strong class="number-system">10.3.2.</strong> Change in Scope:  amendments made to the Drawings or Specifications shall be clearly identified;</p>
          <p class="tab-space-1"><strong class="number-system">10.3.3.</strong> Change in Time: RCD shall be clearly identified;</p>
          <p class="tab-space-1"><strong class="number-system">10.3.4.</strong> Change in Monetary Value: RCV shall be clearly quantified and identified;</p>
          <p class="tab-space-1"><strong class="number-system">10.3.5.</strong> Where a certain parameter is not a part of the Variation Order then it shall be mentioned accordingly.</p>
          <p class="tab-space-1">Changes made in term of the Variation Order shall be recorded in the relevant Schedule of this Agreement.</p>
          <p class="i-am-point"><strong class="number-system">10.4.</strong> Contractor shall bear the cost of any deviation from Drawings and/or Specifications in the absence of any Variation Order.</p>

          <h3>11. Extension of Time:</h3>
          <p class="i-am-point"><strong class="number-system">11.1.</strong> Contractor shall be entitled to claim an extension of time for such number of days as are equal to the delay cause by the Client where the Client:</p>
          <p class="tab-space-1"><strong class="number-system">11.1.1.</strong> Delays payment beyond a period of fourteen (14) days from the date on which the payment is due in terms of Clause 9.3 of this Agreement till such date the payment is made; or</p>
          <p class="tab-space-1"><strong class="number-system">11.1.2.</strong> Delays the approval required by the Contractor unnecessarily and without any sufficient cause or reason beyond a period of fourteen (14) days from the date on which such approval is requested till such date the approval is provided; or</p>
          <p class="tab-space-1"><strong class="number-system">11.1.3.</strong> Delays delivery of materials or performance of the tasks assigned to the Client in Program of Works beyond a period of fourteen (14) days from the due date for provision of materials or performance of the assigned task till such time the materials are delivered or the assigned task is performed.</p>
          <p class="i-am-point"><strong class="number-system">11.2.</strong> Contractor shall also be entitled to claim extension of time for delays in execution of the Construction Work carried out as per the Program of Works where such delay is not attributable to the Contractor, Contractor’s personnel or sub-contractor but arises out of a situation beyond Contractor’s reasonable control. Without prejudice to the generality of the foregoing, the following shall be regarded as causes beyond Contractor’s reasonable control: act of God, explosion, flood, tempest, fire or accident war or threat of war, sabotage, insurrection, civil disturbance or requisition.</p>
          <p class="i-am-point">Provided that extension of time granted to the Contractor shall only cover the number of days satisfactorily accounted for by the Contractor demonstrating his inability to carry out Construction Work for reasons beyond his control.</p>
          <p class="i-am-point"><strong class="number-system">11.3.</strong> Any extension of time shall be duly documented and identified as RCD.</p>

          <div class="page-break"></div>

          <h3>12. Usage of the Platform:</h3>
          <p class="i-am-point"><strong class="number-system">12.1.</strong> Parties hereby agree that  the Contractor, for the benefit of the Platform, undertakes to provide a weekly update on the Platform for the Construction Work throughout the period of the Construction Work till the Handing Over Date.</p> 
          <p class="i-am-point">Images of Construction Work must be uploaded on the system and tagged with the stage in the Program of Works, including but not limited to all materials listed in Specifications which will be covered such as, but not limited to, excavations, backfilling layers, waterproofing, steel bars in structure, plaster etc.</p>
          <p class="i-am-point"><strong class="number-system">12.2.</strong> Client may enforce the usage of the Platform for the purposes of monitoring the progress of the Construction Work and other matters related to the Project by way of obligating the Contractor to:</p>
          <p class="tab-space-1"><strong class="number-system">12.2.1.</strong> Regularly update the Platform with updates on Construction Work;</p>
          <p class="tab-space-1"><strong class="number-system">12.2.2.</strong> List the completion of activities as per the Program of Works;</p>
          <p class="tab-space-1"><strong class="number-system">12.2.3.</strong> Uploading pictures demonstrative of compliance with Specifications and Drawings;</p>
          <p class="tab-space-1"><strong class="number-system">12.2.4</strong> .Performance of tasks assigned to each of the Parties in the Program of Works, such as but not limited to raising inspections, submitting invoices, raising material request approvals, issuing variation orders, responding to quality concerns etc.</p>
          <p class="tab-space-1"><strong class="number-system">12.2.5.</strong> Channel all communications through the Platform for the purposes of record.</p>
          <p class="i-am-point"><strong class="number-system">12.3.</strong> Where the Contractor fails to use the Platform as per Clause 12.2 of this Agreement then the Client may penalize the Contractor for 0.25% of the ACV or RCV, as applicable, for every thirty (30) days of inactivity of the Contractor.</p>

          <h3>13. Maintenance & Warranty Period:</h3>
          <p class="i-am-point"><strong class="number-system">13.1.</strong> Client shall pay 5% of the ACV or RCV, as applicable, after the completion of the Maintenance Period and completion of required remedial works.</p>
          <p class="i-am-point"><strong class="number-system">13.2.</strong> Parties hereby agree that maintenance period spanning over a period of twelve (12) months as set out in the Program of Works shall commence from the day when the Municipality issues the Building Completion Certificate.</p>
          <p class="i-am-point"><strong class="number-system">13.3.</strong> During the maintenance period, Contractor shall be liable to remove any defects arising out of Construction Work.</p>
          <p class="i-am-point"><strong class="number-system">13.4.</strong> Where the Contractor fails to carry out the remedial works within the maintenance period, the Client shall be entitled to use 5% of the ACV or RCV, as applicable, retained by the Client during  the maintenance period  for completing remedial works and where amount is not sufficient, Contractor shall bear any cost spent by the Client in excess of 5% for completing  the remedial works.</p>
          <p class="i-am-point"><strong class="number-system">13.5.</strong> Contractor hereby agrees and undertakes that Contractor shall remain liable for the Construction Works completed by the Contractor for a period of ten (10) years from the Handing Over Date.</p>

          <h3>14. Representation and Warranties:</h3>
          <p class="i-am-point"><strong class="number-system">14.1.</strong> Each Party represents, severally and not jointly, to the other Party hereto that:</p>
          <p class="tab-space-1"><strong class="number-system">14.1.1.</strong> Each Party has the full power and authority to enter into, execute and deliver this Agreement and to  perform  the  tasks  contemplated  hereby  and  that  such  Party  is duly  incorporated  or organised and existing under the laws of the jurisdiction  of Oman and that the execution and delivery by such Party of this Agreement and the performance by such Party  of  the  tasks  contemplated  hereby  have  been  duly  authorised  by  all  necessary corporate or other actions of such Party and Competent Authority or Municipality;</p>
          <p class="tab-space-1"><strong class="number-system">14.1.2.</strong> Assuming the due authorisation, execution and delivery hereof by the other Party, this Agreement constitutes the legal, valid and binding obligation of such Party, enforceable against such Party in accordance with its terms, except as such enforceability may be limited by applicable bankruptcy, insolvency, reorganisation, moratorium or similar laws affecting creditors’ rights generally;</p>
          <p class="tab-space-1"><strong class="number-system">14.1.3.</strong> Each Party, as of the date of this Agreement, is solvent and have necessary resources, in kind and capital, to meet the monetary and/or other obligations under this Agreement.</p>

          <h3>15. Indemnification:</h3>
          <p class="i-am-point"><strong class="number-system">15.1.</strong> Contractor agrees to release, defend, protect, indemnify and hold Client and its affiliates, and their respective directors, officers, employees, contractors, agents, suppliers, users, successors, and assigns, harmless from and against any and all costs (including attorney fees and court costs on an indemnity basis), expenses, fines, penalties, losses, damages, and liabilities arising out of any damage caused to the neighboring buildings, plots or public utilities during or arising out of the Construction Work.</p>

          <h3>16. Termination</h3>
          <p class="i-am-point"><strong class="number-system">16.1.</strong> Client may terminate this Agreement by serving 60 days written notice upon the Contractor;</p>
          <p class="i-am-point">Provided that the termination shall only take effect after the completion of the stage of Program of Works within which the 60th day occurs in and payment of whole of the Construction Work completed till the date termination becomes effective. </p>
          <p class="i-am-point"><strong class="number-system">16.2.</strong> Contractor may terminate this Agreement by serving a 60 days’ written notice upon the Client;</p>
          <p class="i-am-point">Provided that the termination shall only take effect after the completion of the stage of Program of Works within which the 60th day occurs in and payment of whole of the Construction Work completed till the date termination becomes effective; ;</p>
          <p class="i-am-point">Provided further that the Contractor shall be liable to compensate the Client for any difference in ACV or RCV, as applicable, which may arise as a result of hiring the services of a new contractor for completing the Construction Work as per the Program of Works;</p>
          <p class="i-am-point">Provided further that Client shall withhold outstanding payment to be made to the Contractor for whole of the Construction Work completed till the date the termination becomes effective not exceeding 10% of the Contract Value for a period of 12 months. </p>
          <p class="i-am-point"><strong class="number-system">16.3.</strong> Contract shall automatically terminate where the Construction Work cannot be completed as per the Program of Works on account of reason(s) beyond Contractor’s reasonable control upon payment from Client to the Contractor for whole of the Construction Work completed till the date termination becomes effective.</p>
          <p class="i-am-point"><strong class="number-system">16.4.</strong> Contract shall terminate with immediate effect where either Party becomes insolvent or passes a resolution for a dissolution or is ordered to be liquidated by the competent court or makes an arrangement or settlement with its creditors generally or applies to a competent court for protection from its creditors</p>
          <p class="i-am-point"><strong class="number-system">16.5.</strong> Obligations under Clause 9 and Clause 15 and any outstanding monetary obligations shall survive the termination of this Agreement.</p>

          <h3>17. Governing Law:</h3>
          <p class="i-am-point"><strong class="number-system">17.1.</strong> This Agreement shall be governed by and construed in accordance with the Applicable Law.</p>

          <h3>18. Dispute Resolution:</h3>
          <p class="i-am-point"><strong class="number-system">18.1.</strong> Parties agree that any dispute or claim arising out of or in connection with this Agreement or its subject matter or formation shall be resolved by the Parties either; </p>
          <p class="tab-space-1"><strong class="number-system">18.1.1.</strong> By way of amicable settlement within a period 15 days from the date of the dispute; or</p>
          <p class="tab-space-1"><strong class="number-system">18.1.2.</strong> By way of mediation to be conducted by a lawyer and a consultant, approved by the Ministry of Justice of Sultanate of Oman, (hereinafter the “Mediation Panel”). Parties hereby agree to be bound by the decision of the Mediation Panel provided that the decision is line with the Applicable Law and not manifestly unjust or fraudulent.</p>
          <p class="i-am-point"><strong class="number-system">18.2.</strong> Where Parties are unable to resolve their dispute in terms of Clause 18.1 of this Agreement then the dispute shall be referred to Muscat Courts.</p>

          <h3>19. Third Parties</h3>
          <p class="i-am-point"><strong class="number-system">19.1.</strong> This Agreement is exclusively for the benefit of the Parties and shall not be construed as conferring, either directly or indirectly, any rights or causes of action upon third parties.</p>

          <h3>20. Confidential Information and Intellectual Property:</h3>
          <p class="i-am-point"><strong class="number-system">20.1.</strong> Confidential Information whether written, oral, electronic, visual, graphic, photographic, observational, or otherwise, and documents supplied, revealed or disclosed in any form or manner to the Contractor  by the Client, or produced or created by the Contractor for the Client hereunder are the intellectual property of, and confidential to the Client and Contractor and shall be used solely by the Contractor for purposes of this Agreement. All such information shall be treated and protected by the Contractor as strictly confidential and shall not be disclosed to any third party without the prior written consent of the Client and shall be disclosed by the Contractor to its employees or labour or sub-contractor only on a need-to-know basis.</p>
          <p class="i-am-point"><strong class="number-system">20.2.</strong> Contractor’s employees, sub-contractor(s) and other personnel involved in the performance of this Agreement to execute an individual confidentiality agreement prior to any disclosure of Confidential Information to such persons.</p>
          <p class="i-am-point"><strong class="number-system">20.3.</strong> Restrictions in this clause shall not apply to disclosure of Confidential Information if and to the extent the disclosure is: (a) required under the Law or (b) required by any Competent Authority to which the Parties are subject to.</p>
          <p class="i-am-point"><strong class="number-system">20.4.</strong> Contractor shall not be entitled to use any Intellectual Property belonging to the Client without Client’s prior approval in writing.</p>

          <h3>21. Miscellaneous:</h3>
          <p class="i-am-point"><strong class="number-system">21.1.</strong> No changes, amendments, alterations or modifications to this Agreement shall be effective unless in writing and signed by Parties and, if required, upon approval by the Competent Authority.</p>
          <p class="i-am-point"><strong class="number-system">21.2.</strong> Unenforceability or invalidity of one or more clauses in this Agreement shall not have an effect on any other clause in this Agreement. If it is possible, any unenforceable or invalid clause in this Agreement shall be modified to show the original intention of the Parties.</p>
          <p class="i-am-point"><strong class="number-system">21.3.</strong> No waiver by Client of any breach of this Agreement by the Contractor and vice versa shall be considered as a waiver of any subsequent breach of the same or any other provision.</p>

          <h3>22. Notices:</h3>
          <p class="i-am-point"><strong class="number-system">22.1.</strong> Either Party may serve a notice upon the other as required under this Agreement at the addresses or email addresses set out in Schedule L of this Agreement.</p>

          <h3>23. Entire Agreement:</h3>
          <p class="i-am-point"><strong class="number-system">23.1.</strong> This Agreement constitutes the entire agreement between the Parties and supersedes and extinguishes all previous agreements, promises, assurances, warranties, representations and understandings between them, whether written or oral, relating to its subject matter.</p>
          <p class="i-am-point"><strong class="number-system">23.2.</strong> Each Party acknowledges that, in entering into this Agreement it does not rely on, and shall have no remedies in respect of, any statement, representation, assurance or warranty (whether made innocently or negligently) that is not set out in this Agreement.</p>
          <p class="i-am-point"><strong class="number-system">23.3.</strong> Nothing in this Agreement shall limit or exclude any liability for fraud.</p>

        </div>
        <!-- page-agreement default-text -->
        <!-- page-agreement default-text -->
        <div class="page-agreement default-text text-center">
          <h3>Signature Page Follows</h3>
        </div>
        <!-- page-agreement default-text -->
      </div>
      <!-- end of page 2 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 3 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-agreement default-text -->
        <div class="page-agreement default-text text-center">
          <h1>Signature Page</h1>
        </div>
        <!-- page-agreement default-text -->
        <!-- page-agreement default-text -->
        <div class="page-agreement default-text text-left">
          <h3>SIGNATURES:</h3>
          <table class="signature-table">
          <table class="signature-table">
            <tbody>
              <tr>
                <td class="text-left">
                  <p>Client</p>`

                  if(fetch_info.rows.length>0)
                  {
                   html+=`<p><b>${fetch_info.rows[0].dataValues.key_value}</b></p>`
                  }
                  else
                  {
                    html+=`<p><b></b></p>`
                  }
                  html+=`<hr style="margin-left:0">`
                  if(fetch_info.rows.length>0)
                  {
                  
                 html+= `<p>Dated:${fetch_info.rows[0].dataValues.client_sign_date}<br>Signed through <strong class="blue">www.ebinaa.com</strong></p>`

                  }
                  else
                  {

                    html+= `<p>Dated:<br>Signed through <strong class="blue">www.ebinaa.com</strong></p>`


                  }
                  
               html+= `</td>
                <td class="text-right">
                  <p>Contractor</p>`
                  if(contract_fetch_data_table.rows.length>0){
                  if(user_table_fetch.rows.length>0){
                   
                  html+=`<p><b>${user_table_fetch.rows[0].dataValues.full_name}</b></p>`

                  }
                }
                  else{
                    html+=`<p><b></b></p>`
                  }
                 
                  html+=`<hr style="margin-right:0">`
                  if(contract_fetch_data_table.rows.length>0){


                    let contract_date=moment().format('YYYY-MM-DD')
                 
                  html+=`<p>Dated:${contract_date}<br>Signed through <strong class="blue">www.ebinaa.com</strong></p>`
                  }
                  else
                  {
                    html+=`<p>Dated:<br>Signed through <strong class="blue">www.ebinaa.com</strong></p>`
                  }

                 

                html+=`</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- page-agreement default-text -->
      </div>
      <!-- end of page 3 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 4 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE A</h1>
        </div>
        <!-- page-heading -->
        <!-- subject-heading -->
        <div class="subject-heading">
          <p class="title">Commencement of Construction Date</p>
          <p class="subtitle">${format_date}</p>
        </div>
        <!-- subject-heading -->
      </div>
      <!-- end of page 4 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 5 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE B</h1>
        </div>
        <!-- page-heading -->
        <!-- subject-heading -->
        <div class="subject-heading">
          <p class="title">Completion Date</p>`
          if(project_contracts_fetch_table.rows.length>0){
            for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){
              var finall_date=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days ;

              var completatin_date_start=moment(completation_date).add(finall_date, 'days').format('YYYY-MM-DD')
          
            }
            for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
             
      
              completatin_date=moment(completatin_date_start).add(1,'day').format('YYYY-MM-DD');
                let finall_day_second=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
                var completatin_date_start=moment( completatin_date).add(finall_day_second, 'days').format('YYYY-MM-DD');
            }



 





           html+=`<p class="subtitle">${completatin_date_start}</p>`
            


          }
          else
          {

            for(payment_defaults of payment_default){
              for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

              var finall_date=stage_estimates_defaults.dataValues.days ;

              var completatin_date_start=moment(completation_date).add(finall_date, 'days').format('YYYY-MM-DD')
          
            }
          }
          for (payments of payment) {
            for (stage_estimates of payments.project_stage_estimates) {
             
      
              completatin_date=moment(completatin_date_start).add(1,'day').format('YYYY-MM-DD');
                let finall_day_second=stage_estimates.dataValues.days  ;
                var completatin_date_start=moment( completatin_date).add(finall_day_second, 'days').format('YYYY-MM-DD');
            }
          }



         





 
 
            html+=`<p class="subtitle">${completatin_date_start}</p>`
           

          }
            
          


         
          html+=`<p class="title">Revised Completion Date</p>
          <p class="subtitle">NA</p>
        </div>
        <!-- subject-heading -->
      </div>
      <!-- end of page 5 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 6 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE C</h1>
          <h2 class="subtitle">Terms of Payment</h2>
          <h3 class="description">Both ACV and RCV shall be reflected in this schedule, as applicable.</h3>
        </div>
        <!-- page-heading -->
        <!-- project-quickinfo -->
        <div class="project-quickinfo">
          <table class="table">
            <tbody>
              <tr>
                <td class="text-left">
                  <p class="subject">Project Price (ACV)</p>`

                  if(project_contracts_table.rows.length>0){
                    html+=`<p class="data">`+project_contracts_table.rows[0].dataValues.price+` OMR</p>`


                    html+=`</td>`
                    html+=`<td class="text-left">
                      <p class="subject">Project Duration</p>`


                      html+=`<p class="data">`+project_contracts_table.rows[0].dataValues.days+` Days</p>`

    
                  }

                  else
                  {

                  for (payments of payment) {
                   

                      html+=`<p class="data">`+payments.dataValues.price+` OMR</p>`
                    
                  }




                  


                 
                html+=`</td>`
                html+=`<td class="text-left">
                  <p class="subject">Project Duration</p>`

                  for (payments of payment) {
                    


                  html+=`<p class="data">`+payments.dataValues.days+` Days</p>`
                    
                  }
                }




               html+=` </td>
              </tr>
            </tbody>
          </table>
        </div>`
       html+=` <!-- project-quickinfo -->
        <!-- table -->
        <table class="table">
          <thead>
            <tr>
              <th rowspan="2" class="task-no text-center">Stage No</th>
              <th rowspan="2" class="task-name text-left">Stage Name</th>
              <th colspan="2" class="text-center">Value of Stages</th>
              <th rowspan="2" class="type text-center">Date of Payment</th>
            </tr>
            <tr>
              <th class="type text-center">Percentage</th>
              <th class="type text-center">OMR</th>
            </tr>
          </thead>
          <tbody>`


          if(project_contracts_fetch_table.rows.length>0){

            //for(project_contracts_fetch_table_deafult)
            for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){
              let d=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days ;
              

              var finish_date=moment(sign_date).add(d, 'days').format('YYYY-MM-DD')
              
              html += `<tr><td class="cell-xl text-center">` + 0 + `.</td> <td class="cell-xl text-left">Advance Payment</td> <td class="cell-xl text-center">` +project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

            }





           


            for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
              console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.id);
              //console.log(project_contracts_fetch_table.rows[0].project_contract_stages[i].project_stages.dataValues.length)
              // for(let j=0;j<project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stages.length;j++){
      
                sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
                let b=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
                var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
            
            html += `<tr><td class="cell-xl text-center">` + t + `.</td> <td class="cell-xl text-left">`+project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.description +`</td> <td class="cell-xl text-center">` +project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

           t++;

    
           
              // }
            }

            for(let i = 0; i < project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages.length; i++){



              sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
              let c=project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days;
              var finish_date=moment(sign_date).add(c, 'days').format('YYYY-MM-DD');


              html += `<tr><td class="cell-xl text-center"></td> <td class="cell-xl text-left">Maintenance Period</td> <td class="cell-xl text-center">` +project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

            }

          }


         else{

          for(payment_defaults of payment_default){
            for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

              let b=stage_estimates_defaults.dataValues.days ;

              var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD')

              html += `<tr><td class="cell-xl text-center">` + 0 + `.</td> <td class="cell-xl text-left">Advance Payment</td> <td class="cell-xl text-center">` + stage_estimates_defaults.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates_defaults.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

            }
          }


          for (payments of payment) {
            for (stage_estimates of payments.project_stage_estimates) {
              console.log(payments.dataValues.id)
              // console.log(stage_estimates.project_stage.dataValues.id)
    
              //console.log(payment.rows[index].dataValues.price)
              //let i=1;

              sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
          let b=stage_estimates.dataValues.days ;
          var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
    
    
              html += `<tr><td class="cell-xl text-center">` + i + `.</td> <td class="cell-xl text-left">` + stage_estimates.project_stage.dataValues.description + `</td> <td class="cell-xl text-center">` + stage_estimates.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

            
              i++;
             
    
            }
    
          }


          for(payment_default_primarys of payment_default_primary){
            for (stage_estimates_primary of payment_default_primarys.project_stage_estimates){


              sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
              let b=stage_estimates_primary.dataValues.days ;
              var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');

              html += `<tr><td class="cell-xl text-center"></td> <td class="cell-xl text-left">Maintenance Period</td> <td class="cell-xl text-center">` + stage_estimates_primary.dataValues.price_percentage + `%</td><td class="cell-xl text-center">` + stage_estimates_primary.dataValues.price_amount + `</td> <td class="cell-xl text-center">` + finish_date + `</td></tr>`

            }

          }


        }
           
          html+=`</tbody>
        </table>`

        html+=`<!-- table -->
      </div>
      <!-- end of page 6 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 7 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.APIURL+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE D</h1>
          <h2 class="subtitle">Program of Works and Tasks</h2>
          <h3 class="description">Program of Works</h3>
        </div>
        <!-- page-heading -->
        <!-- table -->
        <table class="table">
          <thead>
            <tr>
           

              <th class="stage-no text-center">Stage No.</th>
              <th class="text-left">Stage Description</th>
              <th class="number-of-days text-center">Number of Days</th>
              <th class="number-of-days text-center">Start Date</th>
              <th class="number-of-days text-center">Finish Date</th>
              <th class="number-of-days text-center">Total Number of Tasks</th>
            </tr>
          </thead>
          <tbody>`
          if(project_contracts_fetch_table.rows.length>0){
            for(let i = 0; i < project_contracts_fetch_table_deafult.rows[0].project_contract_stages.length; i++){

              let d=project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days ;
              console.log('///////days',d);
      
              var finish_date=moment(sign_date_alter).add(d, 'days').format('YYYY-MM-DD')
                    // if(i>0)
                    // {
                    //   sign_date=moment(finish_date).format('YYYY-MM-DD');
                    //   finish_date=moment(sign_date).add(14, 'days').format('YYYY-MM-DD');
                    // }
      
                    
                  
      
                   html+=` <tr><td class="text-center">0.</td>
                    <td class="text-right">Advance Payment</td>
                    <td class="text-center">${project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.days}</td>
                    <td class="text-center">${sign_date_alter}</td>
                    <td class="text-center">${finish_date}</td>
                    <td class="text-center">${project_contracts_fetch_table_deafult.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`
             }
      
      
             for(let i = 0; i < project_contracts_fetch_table.rows[0].project_contract_stages.length; i++){
              console.log("hello",project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.id);
              //console.log(project_contracts_fetch_table.rows[0].project_contract_stages[i].project_stages.dataValues.length)
              // for(let j=0;j<project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stages.length;j++){
                sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
                let b=project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days ;
                var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
      
                html+=` <tr><td class="text-center">${i+1}.</td>
                <td class="text-right">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.description}</td>
                <td class="text-center">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.days}</td>
                <td class="text-center">${sign_date}</td>
                <td class="text-center">${finish_date}</td>
                <td class="text-center">${project_contracts_fetch_table.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`
               
             }
             for(let i = 0; i < project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages.length; i++){
      
              sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
              let c=project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days;
              var finish_date=moment(sign_date).add(c, 'days').format('YYYY-MM-DD');
      
      
              html+=` <tr><td class="text-center"></td>
              <td class="text-right">Maintenance Period</td>
              <td class="text-center">${project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.days}</td>
              <td class="text-center">${sign_date}</td>
              <td class="text-center">${finish_date}</td>
              <td class="text-center">${project_contracts_fetch_table_deafult_maintain.rows[0].project_contract_stages[i].dataValues.project_stage.dataValues.project_tasks.length}</td></tr>`
      
            }
          }
          else{
      
            for(payment_defaults of payment_default){
              for (stage_estimates_defaults of payment_defaults.project_stage_estimates){

                let d=stage_estimates_defaults.dataValues.days ;
      
                var finish_date=moment(sign_date_alter).add(d, 'days').format('YYYY-MM-DD')
      
                html+=` <tr><td class="text-center">0.</td>
                <td class="text-right">Advance Payment</td>
                <td class="text-center">${stage_estimates_defaults.dataValues.days}</td>
                <td class="text-center">${sign_date_alter}</td>
                <td class="text-center">${finish_date}</td>
                <td class="text-center">${stage_estimates_defaults.project_stage.dataValues.project_tasks.length}</td></tr>`
      
      
              }
            }
      
            for (payments of payment) {
              for (stage_estimates of payments.project_stage_estimates) {
      
                sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
                let b=stage_estimates.dataValues.days ;
                var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
      
                html+=` <tr><td class="text-center">`+w+`</td>
                <td class="text-right">${stage_estimates.project_stage.dataValues.description}</td>
                <td class="text-center">${stage_estimates.dataValues.days}</td>
                <td class="text-center">${sign_date}</td>
                <td class="text-center">${finish_date}</td>
                <td class="text-center">${stage_estimates.project_stage.dataValues.project_tasks.length}</td></tr>`
      w++;
      
              }
            }
      
            for(payment_default_primarys of payment_default_primary){
              for (stage_estimates_primary of payment_default_primarys.project_stage_estimates){
      
      
                sign_date=moment(finish_date).add(1,'day').format('YYYY-MM-DD');
                let b=stage_estimates_primary.dataValues.days ;
                var finish_date=moment(sign_date).add(b, 'days').format('YYYY-MM-DD');
      
      
                html+=` <tr><td class="text-center"></td>
                <td class="text-right">Maintenance Period</td>
                <td class="text-center">${stage_estimates_primary.dataValues.days}</td>
                <td class="text-center">${sign_date}</td>
                <td class="text-center">${finish_date}</td>
                <td class="text-center">${stage_estimates_primary.project_stage.dataValues.project_tasks.length}</td></tr>`
      
              }
            }
      
          }
      
           html+= `</tbody>
        </table>
        <!-- table -->
        <!-- project-ganttchart -->
        <div class="project-ganttchart">`
      if(project_gnatt_table.rows.length>0){
         html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="Gantt Chart Image">`
            }
            else{
              html+= ` <img src="images/Gantt-Chart-Image.png" alt="Gantt Chart Image">` 
            }
       html+=`  </div>
        <!-- project-ganttchart -->
        <!-- page-heading -->`
        if(project_stage_and_task_details.length > 0){
          html+=`<div class="page-heading">
          <h3 class="description">Program of Tasks</h3>
        </div>
        <!-- page-heading -->
        <!-- section-heading -->`
          for(let i = 0; i < project_stage_and_task_details.length; i++){
            html+=`<div class="section-heading">
            <h3 class="title">`+(i+1)+` - `+project_stage_and_task_details[i].description+`</h3>
          </div>
          <!-- section-heading -->
          <!-- table -->
          <table class="table">
            <thead>
              <tr>
                <th class="task-no text-center">Task No</th>
                <th class="task-name text-left">Task Name</th>
                <th class="type text-center">Type</th>
              </tr>
            </thead>
            <tbody>`
            if(project_stage_and_task_details[i].client_assigned.length > 0){
              html+=`<tr>
              <th colspan="3" class="full-width text-left">Client</th>
            </tr>`
              for(let j = 0; j < project_stage_and_task_details[i].client_assigned.length; j++){
                html+=`<tr>
                <td class="text-center">`+(j+1)+`.</td>
                <td class="text-left">`+project_stage_and_task_details[i].client_assigned[j].name+`</td>
                <td class="text-center">`+project_stage_and_task_details[i].client_assigned[j].type+`</td>
              </tr>`
              }
            }	
            if(project_stage_and_task_details[i].consultant_assigned.length > 0){
              html+=`<tr>
              <th colspan="3" class="full-width text-left">Consultant</th>
            </tr>`
              for(let j = 0; j < project_stage_and_task_details[i].consultant_assigned.length; j++){
                html+=`<tr>
                <td class="text-center">`+(j+1)+`.</td>
                <td class="text-left">`+project_stage_and_task_details[i].consultant_assigned[j].name+`</td>
                <td class="text-center">`+project_stage_and_task_details[i].consultant_assigned[j].type+`</td>
              </tr>`
              }
            }
            if(project_stage_and_task_details[i].contractor_assigned.length > 0){
              html+=`<tr>
              <th colspan="3" class="full-width text-left">Contractor</th>
            </tr>`
              for(let j = 0; j < project_stage_and_task_details[i].contractor_assigned.length; j++){
                html+=`<tr>
                <td class="text-center">`+(j+1)+`.</td>
                <td class="text-left">`+project_stage_and_task_details[i].contractor_assigned[j].name+`</td>
                <td class="text-center">`+project_stage_and_task_details[i].contractor_assigned[j].type+`</td>
                
              </tr>`
              }
            }		

          html+=`</tbody>
          </table>`
          }
        }

        html+=`<!-- table -->
      </div>
      <!-- end of page 7 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 8 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE E</h1>
          <h2 class="subtitle">Specifications And Detailed Scope Of Work</h2>
          <h3 class="description">Detailed Scope of Work as per Client requirements</h3>
        </div>
        <!-- page-heading -->
        <!-- section-heading -->`
      

   
        html+=` <div class="section-heading">
        <h3 class="title">Specification Details</h3>
        </div>
        <!-- section-heading -->
        <!-- table -->
        <table class="table specification-details-table">
        <thead>
        <tr>
        <th colspan="4" class="specifications text-left">Specifications</th>
        <th colspan="3" class="detailed-scope text-left">Detailed Scope of work</th>
        </tr>
        </thead>
        <tbody>
        <tr>
        <th colspan="4" class="text-left">The following standard specifications of all the works that shall be carried out in accordance with the standard codes of practices that is implemented and used in the Sultanate of Oman</th>
                <th rowspan="2" class="supply text-center">Supply and Installation by Contractor</th>
                <th rowspan="2" class="supply text-center">Supply and Installation by Employer</th>
                <th rowspan="2" class="supply text-center">Supply by Employer and Installation by Contractor</th>
              </tr>
              <tr>
                <th class="section-category text-left">Section Category</th>
                <th class="section-no text-center">Section No.</th>
                <th class="spec-description text-left">Description</th>
                <th class="equivelant text-center">Make or Equivelant*</th>
              </tr>`
        if(project_data_check_sign_fetch.rows.length>0){


          for(i=0;i<project_scope_version_data.rows.length;i++){
          
            console.log(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by);
          
          
          
                let ver=project_scope_version_data.rows[i].dataValues.section_no;
             let new_var= Math.trunc( ver );;
             console.log(new_var);
          
          
                 html+=` <tr><td><rowspan="10" class="text-right">${new_var}.${project_scope_version_data.rows[i].dataValues.section_scope_category.dataValues.name}</td>`
               
               
             
           
             
             
               //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)
          
               var section_no_data = parseFloat(project_scope_version_data.rows[i].dataValues.section_no).toFixed(2)
               
              
              html+=`<td class="text-center">${section_no_data}</td>`
              
              html+=` <td class="text-right">${project_scope_version_data.rows[i].dataValues.description}</td>`
              if(project_scope_version_data.rows[i].dataValues.make_or_equivelant==null){
                html+=`<td class="text-center"></td> `
              }
              else
              {
               html+=`<td class="text-center">${project_scope_version_data.rows[i].dataValues.make_or_equivelant}</td> `
              }
          
          
              if(project_scope_version_data.rows[i].dataValues.project_scope.dataValues.type==2){



                if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==2 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                                html+= ` <td class="custom-cell text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>`
                
                               }
                               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==1){
                                html+= ` <td class="text-center"></td>
                                <td class="custom-cell text-center"></td>
                                <td class="text-center"></td>`
                
                               }
                              
                              
                              else  if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                                html+= ` <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="custom-cell text-center"></td>`
                
                               }
                               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 1){
                  
                                html+= ` <td class="custom-cell text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>`
                
                               }
                               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == null){
                
                                html+= `  <td class="custom-cell text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>`
                
                               }
                
                
                               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3){
                
                                html+= ` <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="custom-cell text-center"></td>`
                
                               }
                               else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 0){
                
                                html+= ` <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>`
                
                               }
                               else{
                                html+= ` <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>`
                          
                               }
                              
                              
                }
                              
                              else{
                
                                
                                if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==2 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                                  html+= `  <td class="default-cell text-center"></td>
                                  <td class="text-center"></td>
                                <td class="text-center"></td>`
                  
                                 }
                                else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==1){
                                  html+= ` <td class="text-center"></td>
                                   <td class="default-cell text-center"></td>
                                   <td class="text-center"></td>`
                  
                                 }
                                
                                
                                else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==2){
                                  html+= ` <td class="text-center"></td>
                                  <td class="text-center"></td>
                                   <td class="default-cell text-center"></td>`
                  
                                 }
                
                                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 1){
                  
                                  html+= `  <td class="default-cell text-center"></td>
                                  <td class="text-center"></td>
                                  <td class="text-center"></td>`
                  
                                 }
                                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == null){
                  
                                  html+= ` <td class="default-cell text-center"></td>
                                  <td class="text-center"></td>
                                  <td class="text-center"></td>`
                  
                                 }
                  
                  
                                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==1 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3){
                  
                                  html+= `   <td class="text-center"></td>
                                  <td class="text-center"></td>
                                  <td class="default-cell text-center"></td>`
                  
                                 }
                                 else if(project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.supplied_by==3 &&project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.installed_by==3 && project_scope_version_data.rows[i].dataValues.contract_meta.dataValues.q_result == 0){
                  
                                  html+= ` <td class="text-center"></td>
                                  <td class="text-center"></td>
                                  <td class="text-center"></td>`
                  
                                 }
                                 else{
                                  html+= ` <td class="text-center"></td>
                                  <td class="text-center"></td>
                                  <td class="text-center"></td>`
                            
                                 }
                                
                
                
                           
          
          
          
                        
          
          
               
             
                      }
                    
          
                    
          
          
                }
              
            
            html+=` 
                       
                      
            <tr>
            <td colspan="7" class="text-left">* Make or Equivelant: The Contractor may propose alternatrive companies to the one proposed by the specifications for the Engineer or Employers approval. It is suggested to share all project material supplier names with the Employer or Engineer .</td>
          </tr>
        </tbody>
        </table>
        <!-- table -->
        </div>`
          
          }
         else{
        
        
          for(let i=0;i<project_scope_table.rows.length;i++){ 


            console.log(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by);
                       
        
                        
        
            
             
            //   var v=project_scope_table.rows[i].dataValues.section_category_maps.length;
            //   console.log(v);
            // console.log(project_scope_table.rows[i].dataValues.scope_description);
            //let v=1;
            //console.log(i--);
        
           
            
            //let v=project_scope_table.rows.length;
            //if(project_scope_table.rows[i].dataValues.section_category_maps.length>1){}
        
        
            let ver=project_scope_table.rows[i].dataValues.section_no;
            let new_var= Math.trunc( ver );;
            console.log(new_var);
            
           html+='<tr>'
           
          
            
            html+=` <td><rowspan="2" class="text-left" >${new_var}.${project_scope_table.rows[i].dataValues.section_scope_category.dataValues.name}</td>`
            
            
            
        
          
          
            //console.log(project_scope_table.rows[i].dataValues.section_category_maps[j].dataValues.description)

            var section_no_data = parseFloat(project_scope_table.rows[i].dataValues.section_no).toFixed(2)
            
           
           html+=`<td class="text-center">${section_no_data}</td>`
           
           html+=` <td class="text-left">${project_scope_table.rows[i].dataValues.description}</td>` 
           if(project_scope_table.rows[i].dataValues.make_or_equivelant==null)
           {
             html+=`<td class="text-center"></td> `
           }
           else
           {
            html+=`<td class="text-center">${project_scope_table.rows[i].dataValues.make_or_equivelant}</td> `
           }
        
           if(project_scope_table.rows[i].dataValues.project_scope.dataValues.type==2){
    

    
            if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
              html+= ` <td class="custom-cell text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>`
          
             }
             else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
              html+= ` <td class="text-center"></td>
              <td class="custom-cell text-center"></td>
              <td class="text-center"></td>`
          
             }
            
            
             else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){
          
              html+= `   <td class="custom-cell text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>`
          
             }
             else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){
          
              html+= `   <td class="custom-cell text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>`
          
             }
          
             else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){
          
              html+= `   <td class="text-center"></td>
              <td class="text-center"></td>
              <td class="custom-cell text-center"></td>`
          
             }
             else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){
          
              html+= ` <td class="text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>`
             }
             else{
              html+= ` <td class="text-center"></td>
              <td class="text-center"></td>
              <td class="text-center"></td>`
          
             }
          }
            
            else{
          
              
              if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==2 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==2 ){
                html+= ` <td class="default-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==1 ){
                html+= ` <td class="text-center"></td>
                <td class="default-cell text-center"></td>
                <td class="text-center"></td>`
            
               }
              
              
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 1){
          
                html+= `   <td class="default-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
          
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == null){
          
                html+= `   <td class="default-cell text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
          
               }
          
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==1 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3){
          
                html+= `   <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="default-cell text-center"</td>`
          
               }
               else if(project_scope_table.rows[i].dataValues.project_meta.dataValues.supplied_by==3 &&project_scope_table.rows[i].dataValues.project_meta.dataValues.installed_by==3 && project_scope_table.rows[i].dataValues.project_meta.dataValues.q_result == 0){
          
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
               }
               else{
                html+= ` <td class="text-center"></td>
                <td class="text-center"></td>
                <td class="text-center"></td>`
            
               }
            }
        
        
         
        
           
        }
         
           
         
         html+=` 
         
        
         <tr>
            <td colspan="7" class="text-left">* Make or Equivelant: The Contractor may propose alternatrive companies to the one proposed by the specifications for the Engineer or Employers approval. It is suggested to share all project material supplier names with the Employer or Engineer .</td>
          </tr>
        </tbody>
        </table>
        <!-- table -->
        </div>`
        
        
      }
        
          
        
        
        
        
      html+= `  <!-- project-scope -->
      </div>
      <!-- end of page 8 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 9 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE F</h1>
          <h2 class="subtitle">Drawings</h2>
          <h3 class="description">Project Drawings Documents</h3>
        </div>
        <!-- page-heading -->
        <!-- project-drawings -->
        <div class="project-drawings">
          <!-- project-drawings-item -->`
          for(let i = 0; i < project_drawings_and_documents.length; i++){
            if(project_drawings_and_documents[i].resource_type == 'application/pdf'){
              html += `<div class="project-drawings-item">
              <div class="holder">
                <div class="document">
                  <div class="document-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="512px" viewBox="-16 0 512 512" width="512px" class=""><g><path d="m378.90625 394.292969h-210.046875c-4.171875 0-7.554687 3.386719-7.554687 7.558593 0 4.171876 3.382812 7.554688 7.554687 7.554688h210.042969c4.175781 0 7.558594-3.382812 7.558594-7.554688 0-4.171874-3.382813-7.558593-7.554688-7.558593zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m378.90625 341.214844h-210.046875c-4.171875 0-7.554687 3.382812-7.554687 7.554687 0 4.175781 3.382812 7.558594 7.554687 7.558594h210.042969c4.175781 0 7.558594-3.382813 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.554688-7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m161.304688 295.660156c0 4.175782 3.382812 7.558594 7.554687 7.558594h133.660156c4.175781 0 7.558594-3.382812 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.558594-7.554687h-133.660156c-4.171875 0-7.554687 3.382812-7.554687 7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m458.664062 99.132812-13.625-14.789062v-52.894531c0-17.339844-14.148437-31.449219-31.542968-31.449219h-338.003906c-17.394532 0-31.542969 14.109375-31.542969 31.449219v59.664062h-13.820313c-16.613281 0-30.128906 13.523438-30.128906 30.144531v91.480469c0 16.621094 13.515625 30.144531 30.128906 30.144531h13.820313v210.800782c0 17.339844 14.148437 31.449218 31.542969 31.449218h17.265624c1.859376 15.121094 14.777344 26.867188 30.398438 26.867188h325.1875c16.910156 0 30.664062-13.738281 30.664062-30.625v-326.421875c0-26.714844-.804687-34.578125-20.34375-55.820313zm4.917969 40.269532h-56.609375c-8.574218 0-15.550781-6.957032-15.550781-15.503906l.050781-65.714844c9.9375.738281 12.589844 3.675781 21.300782 13.363281 1.445312 1.609375 3.023437 3.359375 4.777343 5.265625l14.445313 15.679688c.050781.054687.101562.113281.15625.167968l15.390625 16.707032c12 13.046874 15.191406 18.523437 16.039062 30.035156zm-404.519531-107.953125c0-9.007813 7.371094-16.335938 16.429688-16.335938h338.003906c9.058594 0 16.429687 7.328125 16.429687 16.335938v36.488281l-1.257812-1.367188c-1.714844-1.855468-3.246094-3.5625-4.652344-5.128906-12.421875-13.8125-17.851563-18.589844-40.085937-18.589844h-.003907-260.769531c-16.894531 0-30.636719 13.738282-30.636719 30.625v17.636719h-33.457031zm404.832031 449.925781c0 8.550781-6.976562 15.511719-15.550781 15.511719h-325.1875c-8.558594 0-15.523438-6.957031-15.523438-15.511719v-109.507812c0-4.171876-3.382812-7.554688-7.558593-7.554688-4.171875 0-7.554688 3.382812-7.554688 7.554688v98.152343h-17.027343c-9.058594 0-16.429688-7.328125-16.429688-16.332031v-210.804688h33.457031v94.382813c0 4.171875 3.382813 7.554687 7.554688 7.554687 4.175781 0 7.558593-3.382812 7.558593-7.554687v-94.382813h39.226563c4.171875 0 7.554687-3.382812 7.554687-7.558593 0-4.171875-3.382812-7.554688-7.554687-7.554688h-116.730469c-8.28125 0-15.015625-6.742187-15.015625-15.03125v-91.480469c0-8.289062 6.734375-15.03125 15.015625-15.03125h199.011719c8.292969 0 15.042969 6.742188 15.042969 15.03125v91.480469c0 8.289063-6.75 15.03125-15.042969 15.03125h-47.660156c-4.175781 0-7.558594 3.382813-7.558594 7.554688 0 4.175781 3.382813 7.558593 7.558594 7.558593h47.660156c16.628906 0 30.15625-13.523437 30.15625-30.144531v-91.480469c0-16.621093-13.527344-30.144531-30.15625-30.144531h-121.507813v-17.636719c0-8.554687 6.964844-15.511718 15.523438-15.511718h253.203125l-.050781 65.929687c0 16.886719 13.757812 30.625 30.664062 30.625h56.921875v.433594zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m75.648438 134.636719h-18.101563c-2.222656 0-4.113281.777343-5.667969 2.335937-1.554687 1.554688-2.332031 3.472656-2.332031 5.757813v53.515625c0 2.222656.761719 4.09375 2.285156 5.617187 1.523438 1.527344 3.335938 2.289063 5.429688 2.289063 2.097656 0 3.90625-.761719 5.429687-2.289063 1.527344-1.523437 2.289063-3.332031 2.289063-5.425781v-15.519531h11.621093c7.050782 0 12.703126-2.109375 16.957032-6.332031 4.253906-4.222657 6.382812-9.761719 6.382812-16.617188 0-6.917969-2.253906-12.539062-6.761718-16.855469-4.511719-4.316406-10.355469-6.476562-17.53125-6.476562zm5.621093 29.996093c-1.84375 1.84375-4 2.761719-6.476562 2.761719h-9.8125v-18.949219h9.90625c2.605469 0 4.777343.9375 6.527343 2.808594 1.746094 1.875 2.617188 4.144532 2.617188 6.808594 0 2.539062-.917969 4.730469-2.761719 6.570312zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m163.273438 152.777344c-2.253907-4.917969-5.414063-8.871094-9.476563-11.855469-5.652344-4.125-12.957031-6.1875-21.910156-6.1875h-15.910157c-2.226562 0-4.097656.792969-5.621093 2.378906-1.527344 1.589844-2.289063 3.398438-2.289063 5.429688v53.039062c0 2.285157.730469 4.15625 2.191406 5.617188 1.585938 1.398437 3.523438 2.09375 5.8125 2.09375h17.148438c9.269531 0 16.703125-2.507813 22.292969-7.523438 7.429687-6.789062 11.144531-15.773437 11.144531-26.945312 0-5.777344-1.128906-11.125-3.382812-16.046875zm-17.480469 30.996094c-3.304688 3.746093-7.683594 5.617187-13.148438 5.617187h-9.144531v-40.660156h8.289062c5.84375 0 10.464844 1.808593 13.863282 5.429687 3.394531 3.617188 5.09375 8.503906 5.09375 14.664063 0 6.222656-1.652344 11.203125-4.953125 14.949219zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m184.402344 204.34375c2.15625 0 3.984375-.765625 5.476562-2.289062 1.492188-1.523438 2.238282-3.332032 2.238282-5.425782v-20.472656h14.671874c2.097657 0 3.84375-.679688 5.238282-2.046875 1.398437-1.363281 2.097656-3 2.097656-4.90625 0-1.964844-.714844-3.632813-2.144531-4.996094-1.429688-1.363281-3.160157-2.046875-5.191407-2.046875h-14.671874v-13.429687h17.339843c1.96875 0 3.621094-.695313 4.953125-2.09375 1.335938-1.394531 2-3.015625 2-4.855469 0-2.03125-.679687-3.730469-2.046875-5.09375-1.367187-1.367188-3-2.046875-4.90625-2.046875h-24.960937c-2.222656 0-4.097656.792969-5.621094 2.378906-1.523438 1.589844-2.285156 3.429688-2.285156 5.523438v54.085937c0 2.097656.792968 3.90625 2.382812 5.429688 1.585938 1.519531 3.394532 2.285156 5.429688 2.285156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/></g></svg>
                  </div>
                  <div class="document-link">
                    <a class="link" href="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`">
                      `+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`
                    </a>
                  </div>
                </div>`
                if(project_drawings_and_documents[i].project_doc_tags.length > 0){
                  html += `<div class="data">
                  <ul class="tags">`
                  for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
                    html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
                  }
  
                  html += `</ul>
                </div>`
                }
  
              html += `</div>
            </div>
            <div class="page-break"></div>`
            }
            else{
              html += `<div class="project-drawings-item">
              <div class="holder">
                <div class="pic">
  
                  <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_drawings_and_documents[i].resource_url+`" class="" alt="logo">
                  
                </div>`
                if(project_drawings_and_documents[i].project_doc_tags.length > 0){
                  html += `<div class="data">
                  <ul class="tags">`
                  for(let j = 0; j < project_drawings_and_documents[i].project_doc_tags.length; j++){
                    html += `<li>`+project_drawings_and_documents[i].project_doc_tags[j].tag_name+`</li>`
                  }
  
                  html += `</ul>
                </div>`
                }
  
              html += `</div>
            </div>
            <div class="page-break"></div>`

            }

          }


          html += `
          <!-- project-drawings-item -->
        </div>
        <!-- project-drawings -->
      </div>
      <!-- end of page 10 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 11 -->
      <div class="page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
          <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE G</h1>
          <h2 class="subtitle">Deed & Building Permit</h2>
          <h3 class="description">Legal Documents</h3>
        </div>
        <!-- page-heading -->
        <!-- project-drawings -->
        <div class="project-drawings">
          <!-- project-drawings-item -->`
          for(let i = 0; i < project_legal_documents.length; i++){
            if(project_legal_documents[i].resource_type == 'application/pdf'){
              html += `<div class="project-drawings-item">
              <div class="holder">
                <div class="document">
                  <div class="document-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="512px" viewBox="-16 0 512 512" width="512px" class=""><g><path d="m378.90625 394.292969h-210.046875c-4.171875 0-7.554687 3.386719-7.554687 7.558593 0 4.171876 3.382812 7.554688 7.554687 7.554688h210.042969c4.175781 0 7.558594-3.382812 7.558594-7.554688 0-4.171874-3.382813-7.558593-7.554688-7.558593zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m378.90625 341.214844h-210.046875c-4.171875 0-7.554687 3.382812-7.554687 7.554687 0 4.175781 3.382812 7.558594 7.554687 7.558594h210.042969c4.175781 0 7.558594-3.382813 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.554688-7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m161.304688 295.660156c0 4.175782 3.382812 7.558594 7.554687 7.558594h133.660156c4.175781 0 7.558594-3.382812 7.558594-7.558594 0-4.171875-3.382813-7.554687-7.558594-7.554687h-133.660156c-4.171875 0-7.554687 3.382812-7.554687 7.554687zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m458.664062 99.132812-13.625-14.789062v-52.894531c0-17.339844-14.148437-31.449219-31.542968-31.449219h-338.003906c-17.394532 0-31.542969 14.109375-31.542969 31.449219v59.664062h-13.820313c-16.613281 0-30.128906 13.523438-30.128906 30.144531v91.480469c0 16.621094 13.515625 30.144531 30.128906 30.144531h13.820313v210.800782c0 17.339844 14.148437 31.449218 31.542969 31.449218h17.265624c1.859376 15.121094 14.777344 26.867188 30.398438 26.867188h325.1875c16.910156 0 30.664062-13.738281 30.664062-30.625v-326.421875c0-26.714844-.804687-34.578125-20.34375-55.820313zm4.917969 40.269532h-56.609375c-8.574218 0-15.550781-6.957032-15.550781-15.503906l.050781-65.714844c9.9375.738281 12.589844 3.675781 21.300782 13.363281 1.445312 1.609375 3.023437 3.359375 4.777343 5.265625l14.445313 15.679688c.050781.054687.101562.113281.15625.167968l15.390625 16.707032c12 13.046874 15.191406 18.523437 16.039062 30.035156zm-404.519531-107.953125c0-9.007813 7.371094-16.335938 16.429688-16.335938h338.003906c9.058594 0 16.429687 7.328125 16.429687 16.335938v36.488281l-1.257812-1.367188c-1.714844-1.855468-3.246094-3.5625-4.652344-5.128906-12.421875-13.8125-17.851563-18.589844-40.085937-18.589844h-.003907-260.769531c-16.894531 0-30.636719 13.738282-30.636719 30.625v17.636719h-33.457031zm404.832031 449.925781c0 8.550781-6.976562 15.511719-15.550781 15.511719h-325.1875c-8.558594 0-15.523438-6.957031-15.523438-15.511719v-109.507812c0-4.171876-3.382812-7.554688-7.558593-7.554688-4.171875 0-7.554688 3.382812-7.554688 7.554688v98.152343h-17.027343c-9.058594 0-16.429688-7.328125-16.429688-16.332031v-210.804688h33.457031v94.382813c0 4.171875 3.382813 7.554687 7.554688 7.554687 4.175781 0 7.558593-3.382812 7.558593-7.554687v-94.382813h39.226563c4.171875 0 7.554687-3.382812 7.554687-7.558593 0-4.171875-3.382812-7.554688-7.554687-7.554688h-116.730469c-8.28125 0-15.015625-6.742187-15.015625-15.03125v-91.480469c0-8.289062 6.734375-15.03125 15.015625-15.03125h199.011719c8.292969 0 15.042969 6.742188 15.042969 15.03125v91.480469c0 8.289063-6.75 15.03125-15.042969 15.03125h-47.660156c-4.175781 0-7.558594 3.382813-7.558594 7.554688 0 4.175781 3.382813 7.558593 7.558594 7.558593h47.660156c16.628906 0 30.15625-13.523437 30.15625-30.144531v-91.480469c0-16.621093-13.527344-30.144531-30.15625-30.144531h-121.507813v-17.636719c0-8.554687 6.964844-15.511718 15.523438-15.511718h253.203125l-.050781 65.929687c0 16.886719 13.757812 30.625 30.664062 30.625h56.921875v.433594zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m75.648438 134.636719h-18.101563c-2.222656 0-4.113281.777343-5.667969 2.335937-1.554687 1.554688-2.332031 3.472656-2.332031 5.757813v53.515625c0 2.222656.761719 4.09375 2.285156 5.617187 1.523438 1.527344 3.335938 2.289063 5.429688 2.289063 2.097656 0 3.90625-.761719 5.429687-2.289063 1.527344-1.523437 2.289063-3.332031 2.289063-5.425781v-15.519531h11.621093c7.050782 0 12.703126-2.109375 16.957032-6.332031 4.253906-4.222657 6.382812-9.761719 6.382812-16.617188 0-6.917969-2.253906-12.539062-6.761718-16.855469-4.511719-4.316406-10.355469-6.476562-17.53125-6.476562zm5.621093 29.996093c-1.84375 1.84375-4 2.761719-6.476562 2.761719h-9.8125v-18.949219h9.90625c2.605469 0 4.777343.9375 6.527343 2.808594 1.746094 1.875 2.617188 4.144532 2.617188 6.808594 0 2.539062-.917969 4.730469-2.761719 6.570312zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m163.273438 152.777344c-2.253907-4.917969-5.414063-8.871094-9.476563-11.855469-5.652344-4.125-12.957031-6.1875-21.910156-6.1875h-15.910157c-2.226562 0-4.097656.792969-5.621093 2.378906-1.527344 1.589844-2.289063 3.398438-2.289063 5.429688v53.039062c0 2.285157.730469 4.15625 2.191406 5.617188 1.585938 1.398437 3.523438 2.09375 5.8125 2.09375h17.148438c9.269531 0 16.703125-2.507813 22.292969-7.523438 7.429687-6.789062 11.144531-15.773437 11.144531-26.945312 0-5.777344-1.128906-11.125-3.382812-16.046875zm-17.480469 30.996094c-3.304688 3.746093-7.683594 5.617187-13.148438 5.617187h-9.144531v-40.660156h8.289062c5.84375 0 10.464844 1.808593 13.863282 5.429687 3.394531 3.617188 5.09375 8.503906 5.09375 14.664063 0 6.222656-1.652344 11.203125-4.953125 14.949219zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/><path d="m184.402344 204.34375c2.15625 0 3.984375-.765625 5.476562-2.289062 1.492188-1.523438 2.238282-3.332032 2.238282-5.425782v-20.472656h14.671874c2.097657 0 3.84375-.679688 5.238282-2.046875 1.398437-1.363281 2.097656-3 2.097656-4.90625 0-1.964844-.714844-3.632813-2.144531-4.996094-1.429688-1.363281-3.160157-2.046875-5.191407-2.046875h-14.671874v-13.429687h17.339843c1.96875 0 3.621094-.695313 4.953125-2.09375 1.335938-1.394531 2-3.015625 2-4.855469 0-2.03125-.679687-3.730469-2.046875-5.09375-1.367187-1.367188-3-2.046875-4.90625-2.046875h-24.960937c-2.222656 0-4.097656.792969-5.621094 2.378906-1.523438 1.589844-2.285156 3.429688-2.285156 5.523438v54.085937c0 2.097656.792968 3.90625 2.382812 5.429688 1.585938 1.519531 3.394532 2.285156 5.429688 2.285156zm0 0" data-original="#000000" class="active-path" data-old_color="#000000" fill="#02D94F"/></g></svg>
                  </div>
                  <div class="document-link">
                    <a class="link" href="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`">
                      `+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`
                    </a>
                  </div>
                </div>`
                if(project_legal_documents[i].project_doc_tags.length > 0){
                  html += `<div class="data">
                  <ul class="tags">`
                  for(let j = 0; j < project_legal_documents[i].project_doc_tags.length; j++){
                    html += `<li>`+project_legal_documents[i].project_doc_tags[j].tag_name+`</li>`
                  }
    
                  html += `</ul>
                </div>`
                }
    
              html += `</div>
            </div>
            <div class="page-break"></div>`
            }
            else{
              html += `<div class="project-drawings-item">
              <div class="holder">
                <div class="pic">
    
                  <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_legal_documents[i].resource_url+`" class="" alt="logo">
                  
                </div>`
                if(project_legal_documents[i].project_doc_tags.length > 0){
                  html += `<div class="data">
                  <ul class="tags">`
                  for(let j = 0; j < project_legal_documents[i].project_doc_tags.length; j++){
                    html += `<li>`+project_legal_documents[i].project_doc_tags[j].tag_name+`</li>`
                  }
    
                  html += `</ul>
                </div>`
                }
    
              html += `</div>
            </div>
            <div class="page-break"></div>`
    
            }
    
          }

          html += `<!-- project-drawings-item -->
        </div>
        <!-- project-drawings -->
      </div>
      <!-- end of page 10 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 11 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE H</h1>
          <h2 class="subtitle">Project Manager Details</h2>
        </div>
        <!-- page-heading -->
        <!-- page-userdata -->
        <table class="page-userdata" style="margin-top:3cm">
          <tbody>
            <tr>
              <td>`
              if(project_manager_table.rows.length>0){
               html+= `<!-- user-info -->

                <div class="user-info">
                
                  <p class="title">Project Manager Name <strong>${project_manager_table.rows[0].dataValues.name}</strong></p>
                  <p class="title">Email Address <strong>${project_manager_table.rows[0].dataValues.email}</strong></p>
                  <p class="title">Mobile Number <strong>${project_manager_table.rows[0].dataValues.mobile_no}</strong></p>
                </div>`
              }
              else{

                html+= `<!-- user-info -->

                <div class="user-info">
                
                  <p class="title">Project Manager Name <strong></strong></p>
                  <p class="title">Email Address <strong></strong></p>
                  <p class="title">Mobile Number <strong></strong></p>
                </div>`

              }


              html+=  `<!-- user-info -->
              </td>
            </tr>
          </tbody>
        </table>
        <!-- page-userdata -->
      </div>
      <!-- end of page 11 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 11 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE I</h1>
          <h2 class="subtitle">Bank Account Details of the Contractor</h2>
        </div>
        <!-- page-heading -->
        <!-- page-userdata -->
        <table class="page-userdata" style="margin-top:3cm">
          <tbody>
            <tr>
              <td>`

              if(contract_bank_table.rows.length>0){
               html+=` <!-- user-info -->
                <div class="user-info">
                  <p class="title">Bank Name <strong>${contract_bank_table.rows[0].dataValues.bank_name}</strong></p>
                  <p class="title">Account Holder Name <strong>${contract_bank_table.rows[0].dataValues.account_holder_name}</strong></p>
                  <p class="title">A/c Number <strong>${contract_bank_table.rows[0].dataValues.account_no}</strong></p>
                </div>`
              }

              else{

                html+=` <!-- user-info -->
                <div class="user-info">
                  <p class="title">Bank Name <strong></strong></p>
                  <p class="title">Account Holder Name <strong></strong></p>
                  <p class="title">A/c Number <strong></strong></p>
                </div>`

              }
               html+=` <!-- user-info -->
              </td>
            </tr>
          </tbody>
        </table>
        <!-- page-userdata -->
      </div>
      <!-- end of page 11 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 11 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE J</h1>
          <h2 class="subtitle">Email for Notices</h2>
        </div>
        <!-- page-heading -->
        <!-- page-userdata -->
        <table class="page-userdata" style="margin-top:3cm">
          <tbody>
            <tr>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="subtitle">Client</p>
                  <p class="title">Email Address <strong>${client_table.rows[0].dataValues.user.email}</strong></p>
                  <p class="title">Mobile No <strong>${client_table.rows[0].dataValues.user.phone}</strong></p>
                </div>
                <!-- user-info -->
              </td>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="subtitle">Contractor</p>
                  <p class="title">Email Address <strong>${user_table.rows[0].dataValues.email}</strong></p>
                  <p class="title">Mobile No <strong>${user_table.rows[0].dataValues.phone}</strong></p>
                </div>
                <!-- user-info -->
              </td>
            </tr>
          </tbody>
        </table>
        <!-- page-userdata -->
      </div>
      <!-- end of page 11 -->
      
      <div class="page-break"></div>
      
      <!-- start of page 11 -->
      <div class="page full-height-page">
        <!-- page-header -->
        <header class="page-header">
          <div class="site-logo">
            <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
          </div>
        </header>
        <!-- page-header -->
        <!-- page-heading -->
        <div class="page-heading">
          <h1 class="title">SCHEDULE K</h1>
          <h2 class="subtitle">Consultant Details</h2>
        </div>
        <!-- page-heading -->
        <!-- page-userdata -->
        <table class="page-userdata" style="margin-top:1.5cm">
          <tbody>
            <tr>
              <td colspan="2">
                <!-- user-image -->
                <div class="user-image">
                  <div class="holder">
                    <div class="pic">`
                    if(fetch_photo && fetch_photo.rows.length>0){
                      html+= `<img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+fetch_photo.rows[0].dataValues.resource_url+`" alt="User Image">`
    
                     }
                    else{
    
                     html+=` <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg" alt="Image">`
                    }
                   html+=` </div>
                    <div class="data">`
                    if(consultant_table && consultant_table.rows.length>0){
                    html+=`  <p class="title">${consultant_table.rows[0].dataValues.user_details.full_name}</p>
                    </div>
                  </div>
                </div>
                <!-- user-image -->
              </td>
            </tr>
            <tr>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="title">Company Name <strong>${consultant_table.rows[0].dataValues.user_details.company_name}</strong></p>
                  <p class="title">Phone Number <strong>${consultant_table.rows[0].dataValues.user_details.phone}</strong></p>
                </div>
                <!-- user-info -->
              </td>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="title">Relationship to the Company <strong>${consultant_table.rows[0].dataValues.user_details.relationship_with_company}</strong></p>
                  <p class="title">Email Address <strong>${consultant_table.rows[0].dataValues.user_details.email}</strong></p>`
                  }
                  else{


                    html+=`  <p class="title"></p>
                    </div>
                  </div>
                </div>
                <!-- user-image -->
              </td>
            </tr>
            <tr>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="title">Company Name <strong></strong></p>
                  <p class="title">Phone Number <strong></strong></p>
                </div>
                <!-- user-info -->
              </td>
              <td>
                <!-- user-info -->
                <div class="user-info">
                  <p class="title">Relationship to the Company <strong></strong></p>
                  <p class="title">Email Address <strong></strong></p>`
                  }

                  
                  
                  html+=`</div>
                  <!-- user-info -->
                </td>
              </tr>
            </tbody>
          </table>
          <!-- page-userdata -->
        </div>
        <!-- end of page 11 -->
      
        <div class="page-break"></div>
      
        <!-- start of page 11 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png"  alt="EBinaa Logo Colored">
            </div>
          </header>
          <!-- page-header -->
          <!-- page-heading -->
          <div class="page-heading">
            <h1 class="title">SCHEDULE L </h1>
            <h2 class="subtitle">Template of Signboard
            </h2>
          </div>
          <!-- page-heading -->
        </div>
        <!-- end of page 11 -->`



      // console.log('********', html)
      // return;
      pdf.create(html, options).toFile(global.constants.uploads.contract_documet + req.query.project_id+ '.pdf', function (err, resp) {

        res.send({ status: 201, message: 'fetched', resp: global.constants.IMG_URL.contract_documet_url+ req.query.project_id+ '.pdf',client_id:project_table_client.rows[0].dataValues.user_id,data:project_contracts_fetch_table,length:project_contracts_table})

        if (err) return console.log(err);
        console.log(resp);
      })
    }
  // }

      // let get_final_project_contracts_data = {};
      // get_final_project_contracts_data.table = 'project_contracts';
      // get_final_project_contracts_data.where = {};
      // get_final_project_contracts_data.where.project_id = req.query.project_id;
      // get_final_project_contracts_data.where.cllient_acceptance=1;
      // get_final_project_contracts_data.where.contractor_acceptance=1;
      // let get_final_project_contracts_result = await GenericRepository.fetchData(get_final_project_contracts_data);

      // //console.log()
      // if(get_final_project_contracts_result.rows.length > 0){
      //   /// Client Data Fetching ///
      //   let get_client_data = {};
      //   get_client_data.table = 'user';
      //   get_client_data.where = {};
      //   get_client_data.where.id = get_final_project_contracts_result.rows[0].dataValues.client_id;
      //   let get_client_details = await GenericRepository.fetchData(get_client_data);

      //   /// Contractor Data Fetching ///
      //   let get_contractor_data = {};
      //   get_contractor_data.table = 'user';
      //   get_contractor_data.where = {};
      //   get_contractor_data.where.id = get_final_project_contracts_result.rows[0].dataValues.contractor_id;
      //   let get_contractor_details = await GenericRepository.fetchData(get_contractor_data);

      //   /// Contractor Bank Data Fetching ///
      //   let get_contractor_bank_data = {};
      //   get_contractor_bank_data.table = 'contract_banks';
      //   get_contractor_bank_data.where = {};
      //   get_contractor_bank_data.where.user_id = get_final_project_contracts_result.rows[0].dataValues.contractor_id;
      //   let get_contractor_bank_details = await GenericRepository.fetchData(get_contractor_bank_data);

      //   /// Main table Project Data Fetching ///
      //   let get_main_table_project_data = {};
      //   get_main_table_project_data.table = 'projects';
      //   get_main_table_project_data.where = {};
      //   get_main_table_project_data.where.id = req.query.project_id;
      //   let get_main_table_project_result = await GenericRepository.fetchData(get_main_table_project_data);

      //   let email_obj_for_client = {};
      //   let email_obj_for_contractor = {};
      //   email_obj_for_client.username = get_client_details.rows[0].dataValues.full_name;
      //   email_obj_for_client.email = get_client_details.rows[0].dataValues.email;
      //   //email_obj_for_client.project_name = get_main_table_project_result.rows[0].dataValues.name;
      //  // email_obj_for_client.file=req.query.id+'.pdf';
      //   email_obj_for_client.path= global.appPath+'/uploads/contract_documet/'+req.query.id+'.pdf';
        
      //   email_obj_for_contractor.username = get_contractor_details.rows[0].dataValues.full_name;
      //   email_obj_for_contractor.email = get_contractor_details.rows[0].dataValues.email;
      //   email_obj_for_client.link=process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+global.constants.IMG_URL.contract_documet_url+req.query.id+'.pdf'

      //   email_obj_for_contractor.link=process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+global.constants.IMG_URL.contract_documet_url+req.query.id+'.pdf'
      //   //email_obj_for_contractor.file=req.query.id+'.pdf';
      //   email_obj_for_contractor.path=global.appPath+'/uploads/contract_documet/'+req.query.id+'.pdf';

      //   global.eventEmitter.emit('project_sign_to_client', email_obj_for_client);
      //   global.eventEmitter.emit('project_sign_to_contractor', email_obj_for_contractor);

      //  console.log(email_obj_for_contractor);



      // }

    
    
     
  } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()

}



/**request-contract API
method:PUT
input:query[project_id,contractor_id]
output:data,
purpose:To update data
created by-sayanti Nath
*/


ProjectController.requestContact=(req,res)=>{


  (async()=>{

    try{
      let data={};
      data.table='project_bids',
      data.where={project_id:req.body.project_id,contractor_id:req.body.contractor_id};
      data.data={
        request_contact:1
      }

  let data_update=await await GenericRepository.updateData(data)
    
    res.send({status:200,data: data_update,message: 'updated'});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()

  
}


/**signature API
method:POST
input:body[project_id]
output:data,
purpose:To update and insert data
created by-sayanti Nath
*/


ProjectController.clientSign=(req,res)=>{

  (async()=>{

    try{
      let data={};
      data.table='contract_info',
      data.where={key_name:'client_fullname',project_id:req.body.project_id}
      

      let fetch=await GenericRepository.fetchData(data)

      console.log(fetch.rows.length)

      
      if(fetch.rows.length>0){

        data.data={
          
          key_value:req.body.client_name,
          client_sign_date:moment().format('YYYY-MM-DD')
  
          
  
        }

        let data_update=await await GenericRepository.updateData(data)

      }
      //data.where={project_id:req.body.project_id,contractor_id:req.body.contractor_id};
    else{

      data.data={
        key_name:'client_fullname',
        key_value:req.body.client_name,
        project_id:req.body.project_id,
        client_sign_date:moment().format('YYYY-MM-DD')

       // let data_update=await GenericRepository.createData(data);

      }

      let data_update_create=await GenericRepository.createData(data);
      
    }

    // let data_update=await await GenericRepository.createData(data)
    
    res.send({status:200,message:'client name insert'});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    


   

    }
    
    
    })()

  


}


/**task-details API
method:PUT
input:query[stage_id]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/

ProjectController.taskCount=(req,res)=>{



  (async()=>{

    try{
      let data={};
      data.where={id:req.query.stage_id}
      let assigne=req.query.assigne;
      let fetch=await ConsultationhubRepository.taskCount(data,assigne)
      console.log(fetch.rows.length)
      if(fetch.rows.length>0){
        return res.send({status:200,message:"data",data:fetch})
      }
      else{
        return res.send({status:200,message:"no data found"})

      }
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
    
    
    })()
}

/**fetchProjectContractor API
method:GET
input:query[contractor_id, project_id]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/

ProjectController.fetchProjectContractor = function(req, res){
  (async()=>{
  try{
  let project_details = await new Promise(function(resolve, reject){
  let project_details;
  let project_data_where = {};
  let project_bids_where = {contractor_id:req.query.contractor_id};
  project_data_where.id = parseInt(req.query.project_id);
  ProjectRepository.fetchProjectContractor(project_data_where,project_bids_where).then(project_result=>{
  project_details = project_result;
  resolve(project_details);
  }).catch(project_err=>{
  console.log(805, project_err);
  return res.send({status:500, message:'Something went wrong'});
  })
  })
  
  // console.log(project_details.rows[0].dataValues.project_stages.length);
  // return res.send({status:200, message:'Project Bid Details', data:project_details, purpose:'To get details of project'});
  
  let project_stages = await new Promise(function(resolve, reject){
  let project_stages = [];
  let primary_payment = {};
  let maintenance = {};
  for(let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++){
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
  for(let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++){
  if(project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor'){
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor ++;
  }
  else if(project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client'){
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient ++;
  }
  else{
  project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant ++;
  }
  }
  if(project_details.rows[0].dataValues.project_stages[i].name == "primary_payment")
  {
  primary_payment = project_details.rows[0].dataValues.project_stages[i];
  }
  else if(project_details.rows[0].dataValues.project_stages[i].name == "maintenance")
  {
  maintenance = project_details.rows[0].dataValues.project_stages[i];
  }else{
  project_stages.push(project_details.rows[0].dataValues.project_stages[i]);
  }
  if(i == project_details.rows[0].dataValues.project_stages.length - 1){
  project_stages.sort(function(a, b) {
  return a.sequence - b.sequence;
  });
  project_stages.unshift(primary_payment);
  project_stages.push(maintenance);
  resolve(project_stages)
  }
  }
  
  })
  project_details.rows[0].dataValues.project_stages = project_stages;
  
  return res.send({status:200, message:'Project Details', data:project_details, purpose:'To get details of project'});
  
  }
  catch(err){
  console.log(799, err);
  return res.send({status:500, message:'Something went wrong'});
  }
  
  })()
  
  }


  /**section-scope API
method:GET
input:query[search_text]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/
/**
 * @swagger
 * /api/admin/section-scope:
 *  get:
 *   tags:
 *    - Scope
 *   parameters:
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

  ProjectController.scopeCatagoryFetch=(req,res)=>{

    (async()=>{

      try{
  
       let information={};
       information.table='section_scope_categories';

       let and_data=[];
       let or_data=[];
       and_data.push();

       if(req.query.search_text)
           {
            or_data.push({name:{$like:'%'+req.query.search_text+'%'}});
            or_data.push({name_arabic:{$like:'%'+req.query.search_text+'%'}});
           }


           if(or_data.length > 0){
            information.where= { $or:or_data,$and:and_data};
          }else{
            information.where= and_data ;
          }




      
        //information.where={};
     
       
  
       let update_data=await GenericRepository.fetchData(information)
       
       res.send({status:200, msg:'fetch', message:'fetch',data:update_data});
  
    } catch(err){
      console.trace(err)
  
        res.send({status:500, err:err});
  
    }
  
     
    })()
  
  }




  /**master-scope API
method:GET
input:query[search_text]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/
/**
 * @swagger
 * /api/admin/master-scope:
 *  get:
 *   tags:
 *    - Scope
 *   parameters:
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
  ProjectController.masterCatagoryFetch=(req,res)=>{

    (async()=>{

      try{
  
       let information={};
       information.table='master_scope_categories';

      
       let and_data=[];
       let or_data=[];
       and_data.push();

       if(req.query.search_text)
           {
            or_data.push({name:{$like:'%'+req.query.search_text+'%'}});
            or_data.push({name_arabic:{$like:'%'+req.query.search_text+'%'}});
           }


           if(or_data.length > 0){
            information.where= { $or:or_data,$and:and_data};
          }else{
            information.where= and_data ;
          }
     
       
  
       let update_data=await GenericRepository.fetchData(information)
       
       res.send({status:200, msg:'fetch', message:'fetch',data:update_data});
  
    } catch(err){
      console.trace(err)
  
        res.send({status:500, err:err});
  
    }
  
     
    })()
  
  }



   /**scope API
method:POST
input:[id,category_id,section_category_id,scope_id,description,description_arabic,make_or_equivelant,make_or_equivelant_arabic]
output:data,
purpose:To insert and update data
created by-sayanti Nath
*/

/**
 * @swagger
 * /api/admin/scope-map:
 *  post:
 *   tags:
 *    - Scope
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            category_id:
 *              type: string
 *            section_category_id:
 *              type: integer
 *            scope_id:
 *              type: integer
 *            section_no:
 *              type: number
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            make_or_equivelant:
 *              type: string
 *            make_or_equivelant_arabic:
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

  ProjectController.sectionCatagoryMap=(req,res)=>{

    (async()=>{

      try{
  
       var information={};
       information.table='section_category_maps';

       

       //let fetch=await GenericRepository.fetchData(information)


       if(req.body.id){


        information.where={id:req.body.id}

        information.data={
          category_id:req.body.category_id,
          section_category_id:req.body.section_category_id,
          scope_id:req.body.scope_id,
          section_no:req.body.section_no,
          description:req.body.description,
          description_arabic:req.body.description_arabic,
          make_or_equivelant:req.body.make_or_equivelant,
          make_or_equivelant_arabic:req.body.make_or_equivelant_arabic,

        }

     
       
  
       let update_data=await GenericRepository.updateData(information)

       }


       else{

      
        //information.where={};
        information.data={
          category_id:req.body.category_id,
          section_category_id:req.body.section_category_id,
          scope_id:req.body.scope_id,
          description:req.body.description,
          description_arabic:req.body.description_arabic,
          make_or_equivelant:req.body.make_or_equivelant,
          make_or_equivelant_arabic:req.body.make_or_equivelant_arabic,

        }

     
       
  
       let create_data=await GenericRepository.createData(information)
      }
      
       
       res.send({status:200, msg:'created', message:'created'});
  
    } catch(err){
      console.trace(err)
  
        res.send({status:500, err:err});
  
    }
  
     
    })()
  
  }


   /**scope API
method:GET
input:
output:data,
purpose:To fetch data
created by-sayanti Nath
*/

/**
 * @swagger
 * /api/admin/scope:
 *  get:
 *   tags:
 *    - Scope
 *   parameters:
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

  ProjectController.sectionScope=(req,res)=>{

    (async()=>{

      try{
  
       let information={};
       information.table='project_scopes',

      
        information.where={is_deleted:0};
     
       
  
       let fetch_data=await GenericRepository.fetchData(information)
       
       res.send({status:200, msg:'fetch', message:'fetch',data:fetch_data});
  
    } catch(err){
      console.trace(err)
  
        res.send({status:500, err:err});
  
    }
  
     
    })()
  
  }


   /**scope-map API
method:GET
input:query[limit,page]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/

/**
 * @swagger
 * /api/admin/scope-map:
 *  get:
 *   tags:
 *    - Scope
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

  ProjectController.masterMapFetch=(req,res)=>{

    (async()=>{

      try{

        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);
  
       let information={};
       information.table='section_category_maps';

       let and_data=[];
       let or_data=[];

       and_data.push();


       if (req.query.search_text) {

        or_data.push({ description: { $like: '%' + req.query.search_text + '%' } });

        or_data.push({ description_arabic: { $like: '%' + req.query.search_text + '%' } });
       
        or_data.push({ scope_id: { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `scope_description` LIKE "%' + req.query.search_text + '%"')] } })

       

      }



      
      if(or_data.length > 0){
        information.where= { $or:or_data,$and:and_data};
      }else{
        information.where= and_data ;
      }
 
     
       
  
       let update_data=await ConsultationhubRepository.sectionMasterScope(information,limit,offset);
       
       res.send({status:200, msg:'fetch', message:'fetch',data:update_data});
  
    } catch(err){
      console.trace(err)
  
        res.send({status:500, err:err});
  
    }
  
     
    })()
  
  }



  /**scope-map-data API
method:GET
input:body[id]
output:data,
purpose:To fetch data
created by-sayanti Nath
*/

/**
 * @swagger
 * /api/admin/scope-map-data:
 *  post:
 *   tags:
 *    - Scope
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


ProjectController.masterMapDetails=(req,res)=>{


  (async()=>{

    try{

      

     let information={};
     information.table='section_category_maps',

    
      information.where={id:req.body.id};
   
     

     let update_data=await GenericRepository.fetchData(information);
     
     res.send({status:200, msg:'fetch', message:'fetch',data:update_data});

  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()
}

/**sign-Mail-Sent API
method:GET
input:body[project_id]
output:data,
purpose:To sent sign mail
created by-sayanti Nath
*/
  
ProjectController.signMailSent=(req,res)=>{
setTimeout(function(){
  (async()=>{

    try{







      

      let get_final_project_contracts_data = {};
      get_final_project_contracts_data.table = 'project_contracts';
      get_final_project_contracts_data.where = {};
      get_final_project_contracts_data.where.project_id = req.query.project_id;
      get_final_project_contracts_data.where.cllient_acceptance=1;
      get_final_project_contracts_data.where.contractor_acceptance=1;
      let get_final_project_contracts_result = await GenericRepository.fetchData(get_final_project_contracts_data);

      //console.log()
      if(get_final_project_contracts_result.rows.length > 0){
        /// Client Data Fetching ///
        let get_client_data = {};
        get_client_data.table = 'user';
        get_client_data.where = {};
        get_client_data.where.id = get_final_project_contracts_result.rows[0].dataValues.client_id;
        let get_client_details = await GenericRepository.fetchData(get_client_data);

        /// Contractor Data Fetching ///
        let get_contractor_data = {};
        get_contractor_data.table = 'user';
        get_contractor_data.where = {};
        get_contractor_data.where.id = get_final_project_contracts_result.rows[0].dataValues.contractor_id;
        let get_contractor_details = await GenericRepository.fetchData(get_contractor_data);

        console.log(get_contractor_details);

        /// Contractor Bank Data Fetching ///
        let get_contractor_bank_data = {};
        get_contractor_bank_data.table = 'contract_banks';
        get_contractor_bank_data.where = {};
        get_contractor_bank_data.where.user_id = get_final_project_contracts_result.rows[0].dataValues.contractor_id;
        let get_contractor_bank_details = await GenericRepository.fetchData(get_contractor_bank_data);

        let get_contract_metas={};
        get_contract_metas.table='contractor_metas',
        get_contract_metas.where={contractor_id:get_final_project_contracts_result.rows[0].dataValues.contractor_id,key_name:'linkedin_account'};
        let get_contract_metas_fetch=await GenericRepository.fetchData(get_contract_metas);
        

        /// Main table Project Data Fetching ///
        let get_main_table_project_data = {};
        get_main_table_project_data.table = 'projects';
        get_main_table_project_data.where = {};
        get_main_table_project_data.where.id = req.query.project_id;
        let get_main_table_project_result = await GenericRepository.fetchData(get_main_table_project_data);

        var fs = require('fs');
        var pdf = require('html-pdf');
        var options = {
          format: 'A4', "border": {
            "top": "1.5cm",            // default is 0, units: mm, cm, in, px
            "right": "1.5cm",
            "bottom": "1.5cm",
            "left": "1.5cm"
          },
          "footer": {
            "height": "10px",
            "contents": {
              // Any page number is working. 1-based index
              default: '<span style="float:right; font-size:8px;">{{page}} / {{pages}}</span>',
              // fallback value
            }
          },
        
        };


        let i=0000;
        let date=moment().format('YYYY-MM-DD')


        let html=`<title>Invoice</title>
        <style>
          /* page setup */
          @page{
            size:A4 portrait;
            margin:1.5cm;
            /*margin:0cm;*/
          }
          /* common */
          *{
            margin:0 auto;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body{
            /*background-color:#ccc;*/
            font-family:Helvetica,Geneva,Tahoma,sans-serif;
            font-weight:400;
            font-size:12px;
            color:#1a1a1a;
            line-height:1.35;
          }
          img{
            max-width:100%;
            height:auto;
          }
          /* page */
          .page{
            position:relative;
            display:block;
            /*min-height:29.65cm;
            padding:1.5cm;
            background-image:url('images/Cover-Image.jpg');
            background-position:left top;
            background-size:cover;*/
            background-color:#fff;
            box-shadow:0 0 0.5cm rgba(0,0,0,0.5);
            /*box-sizing:border-box;*/
          }
          /* page-break */
          .page-break{
            page-break-after:always;
          }
          /* page-header */
          .page-header{
            margin-bottom:40px;
          }
          .page-header .site-logo{
            text-align:center;
          }
          .page-header .site-logo img{
            width:180px;
          }
          /* page-footer */
          .page-footer{
            text-align:center;
          }
          .page-footer > *:last-child{
            margin-bottom:0 !important;
          }
          .page-footer .foot-note{
            margin-bottom:10px;
            font-weight:400;
            font-size:9px;
            color:#0047ba;
          }
          /* table */
          .table{
            width:100%;
            margin-bottom:25px;
            background-color:#fff;
            border:1px solid #e3e3e3;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .table thead tr th,
          .table tfoot tr td{
            padding:4px 10px 5px 10px;
            background-color:#f6f6f8;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            font-weight:400;
            font-size:9px;
            color:#0047ba;
          }
          .table thead tr th:last-child,
          .table tfoot tr td:last-child{
            border-right:none;
          }
          .table thead tr th.text-left,
          .table tfoot tr td.text-left{
            text-align:left;
          }
          .table thead tr th.text-center,
          .table tfoot tr td.text-center{
            text-align:center;
          }
          .table thead tr th.text-right,
          .table tfoot tr td.text-right{
            text-align:right;
          }
          .table thead tr th.discription{
          }
          .table thead tr th.project-value{
            width:80px;
          }
          .table thead tr th.project-fee{
            width:50px;
          }
          .table tfoot tr td .total{
            font-weight:700;
            font-size:12px;
          }
          .table tbody tr td{
            padding:3px 7px 5px 7px;
            background-color:#fff;
            border-right:1px solid #e3e3e3;
            border-bottom:1px solid #e3e3e3;
            font-weight:400;
            font-size:8px;
          }
          .table tbody tr td:last-child{
            border-right:none;
          }
          .table tbody tr td.text-left{
            text-align:left;
          }
          .table tbody tr td.text-center{
            text-align:center;
          }
          /* info-table */
          .info-table{
            width:100%;
            margin-bottom:25px;
            border-collapse:collapse;
            table-layout:fixed;
          }
          .info-table thead tr th{
            vertical-align:top;
            background-color:#fff;
          }
          .info-table thead tr th.text-left{
            text-align:left;
          }
          .info-table thead tr th.text-right{
            text-align:right;
          }
          .info-table thead tr th .title{
            margin-bottom:5px;
            font-weight:700;
            font-size:15px;
            color:#0047ba;
          }
          .info-table thead tr th .subtitle{
            margin-bottom:5px;
            font-weight:700;
            font-size:10px;
            color:#0047ba;
          }
          .info-table tbody tr td{
            vertical-align:top;
          }
          .info-table tbody tr td.text-left{
            text-align:left;
          }
          .info-table tbody tr td.text-right{
            text-align:right;
          }
          .info-table tbody tr td .data{
            margin-bottom:5px;
            font-weight:400;
            font-size:8px;
          }
          @media print{
            .page{
              width:auto;
              margin-top:0;
              margin-bottom:0;
              box-shadow:initial;
            }
          }
        </style>
        
        <!-- start of page 1 -->
        <div class="page">
          <!-- page-header -->
          <header class="page-header">
            <div class="site-logo">
              <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png" alt="EBinaa Logo Colored">
            </div>
          </header>
          <!-- page-header -->
          <!-- info-table -->
          <table class="info-table">
            <thead>
              <tr>
                <th colspan="2" class="text-left">
                  <p class="title">${get_contractor_details.rows[0].dataValues.full_name}</p>
                </th>
                <th></th>
                <th colspan="2" class="text-right">
                  <p class="title">Invoice Details</p>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">
                
                  <p class="data"> ${get_contractor_details.rows[0].dataValues.city}</p>
                  
                </td>
                <td class="text-left">
                  <p class="data">Phone No: ${get_contractor_details.rows[0].dataValues.phone}</p>
                  <p class="data">Email: ${get_contractor_details.rows[0].dataValues.email}</p>
                  <p class="data">Website: ${get_contract_metas_fetch.rows[0].dataValues.key_value}</p>
                </td>
                <td></td>
                <td class="text-right">
                  <p class="data"><strong>INVOICE NUMBER</strong><br> ${i+1}</p>
                  <p class="data"><strong>DATE OF ISSUE</strong><br> ${date}</p>
                </td>
                <td class="text-right">
                  <p class="data"><strong>BANK ACCOUNT DETAILS</strong></p>
                  <p class="data">${get_contractor_bank_details.rows[0].dataValues.bank_name}</p>
                  <p class="data">${get_contractor_bank_details.rows[0].dataValues.account_no}r</p>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- info-table -->
          <!-- table -->
          <table class="table">
            <thead>
              <tr>
                <th class="discription text-left">DESCRIPTION</th>
                <th class="project-value text-left">SIGNED PROJECT VALUE <br> (OMR)</th>
                <th class="project-fee text-left">PROJECT AWARD FEE (%)</th>
                <th class="project-fee type text-left">PROJECT AWARD FEE <br> (OMR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">Client Muqwala Contract Sign Fee <br> <small><em>[2 % of the Total Project Cost]</em></small></td>
                <td class="text-left">1000</td>
                <td class="text-left">1</td>
                <td class="text-left">1000</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-right">TOTAL</td>
                <td class="text-left">0</td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td colspan="2" class="text-center">
                  INVOICE TOTAL
                  <p class="total">1000</p>
                </td>
              </tr>
            </tfoot>
          </table>
          <!-- table -->
          <!-- info-table -->
          <table class="info-table">
            <thead>
              <tr>
                <th class="text-left">
                  <p class="subtitle">TERMS</p>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-left">
                  <p class="data">1. Invoice to be paid within two weeks from  date of issue.</p>
                  <p class="data">2. This invoice is subject to the services agreement signed with Binaa Professional Services LLC.</p>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- info-table -->
          <!-- page-footer -->
          <footer class="page-footer">
            <p class="foot-note">Generated From www.ebinaa.com</p>
          </footer>
          <!-- page-footer -->
        </div>
        <!-- end of page 1 -->`


        pdf.create(html, options).toFile(global.constants.uploads.invoice_pdf + 'invoice_report_'+req.query.project_id+ '.pdf', function (err, resp) {

          console.log(global.constants.uploads.invoice_pdf + 'invoice_report_'+req.query.project_id+ '.pdf')

         
  
          if (err) return console.log(err);
          console.log(resp);
        })

        console.log("hello");


        let email_obj_for_client = {};
        let email_obj_for_contractor = {};
        email_obj_for_client.username = get_client_details.rows[0].dataValues.full_name;
        email_obj_for_client.email = get_client_details.rows[0].dataValues.email;
        var invoice_attachment = global.constants.uploads.invoice_pdf + 'invoice_report_'+req.query.project_id+ '.pdf';
        var contract_attachment = global.constants.uploads.contract_documet + req.query.project_id+ '.pdf';
        email_obj_for_client.attachments = [{  path: contract_attachment }];
        
        email_obj_for_contractor.username = get_contractor_details.rows[0].dataValues.full_name;
        email_obj_for_contractor.email = get_contractor_details.rows[0].dataValues.email;
        email_obj_for_contractor.attachments = [{  path: invoice_attachment },{  path: contract_attachment }];
        // email_obj_for_contractor.path=global.constants.uploads.contract_documet+req.query.project_id+'.pdf';

       console.log("/////////////////////////");
       console.log(email_obj_for_client);
       console.log(email_obj_for_contractor)
        global.eventEmitter.emit('project_sign_to_client', email_obj_for_client);
        global.eventEmitter.emit('project_sign_to_contractor', email_obj_for_contractor);

        res.send({ status: 201, message: 'fetched' ,data:email_obj_for_client});
      }
      else{
        res.send({status:400,message:"not signed from both end"});
      }

  } catch(err){
    console.trace(err)

      res.send({status:500, err:err});

  }

   
  })()
  }, 60000);
}

/* specifications
method:GET
input:body[],
output:data,
purpose:Project specifications fetch"
created by Sayanti Nath
*/


ProjectController.specifiactionsView=(req,res)=>{


  (async()=>{
   

    try{
      console.log('hello');
    let information = {};
    
    information.where = {};

    
    
    
    let data = await ConsultationhubRepository.specifications_fetch (information);
    console.log(data);
    
    return res.send({status:200, message:'specifications',purpose:"specifications",data:data});
    
    
    
    } catch(err){
    console.trace(err)
    
    res.send({status:500, err:err});
    
    }
  })();



}
  

/* scope-pdf-demo
method:GET
input:body[project_id],
output:data,
purpose:Project scope"
created by Sayanti Nath
*/


ProjectController.projectScopePdfImage = (req, res) => {



  (async () => {

    try {

      let scope = {};
      scope.table = 'project_scopes',
        scope.where = {};
      scope.where.project_id = req.query.project_id,
        scope.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_contractor"')] }
      let scope_table = await ConsultationhubRepository.staticScopeDetails(scope);

      console.log(scope_table);


      let scope_group = {};
      scope_group.table = 'project_scopes',
        scope_group.where = {};
      scope_group.where.project_id = req.query.project_id,
        scope_group.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supply_and_install_by_client"')] }
      let scope_table_fetch = await ConsultationhubRepository.staticScopeDetails(scope_group);

      console.log(scope_table_fetch);

      let scope_data = {};
      scope_data.table = 'project_scopes',
        scope_data.where = {};
      scope_data.where.project_id = req.query.project_id,
        scope_data.where.scope_id = { $in: [sequelize.literal('SELECT id FROM `project_scopes` WHERE `group_name`="supplied_by_client_and_installed_by_contractor"')] }
      let scope_data_fetch = await ConsultationhubRepository.staticScopeDetails(scope_data);


      //  let custom = {};
      //   custom.table = 'project_scopes',
      //   custom.where = {q_result:null};
      //   custom.where.project_id = req.query.project_id,
      //   custom.where.supplied_by=3;
      //   custom.where.installed_by=3
      //   let custom_table = await ConsultationhubRepository.scopeDetails(custom);


      let custom_data = {};
      custom_data.table = 'project_scopes',
        custom_data.where = {};
      custom_data.where.project_id = req.query.project_id,
      custom_data.where.supplied_by=1;
      custom_data.where.installed_by=1;
      let custom_table_fetch = await ConsultationhubRepository.scopeDetails(custom_data);


      let custom_value = {};
      custom_value.table = 'project_scopes',
        custom_value.where = {};
        custom_value.where.project_id = req.query.project_id,
        custom_value.where.supplied_by=1;
        custom_value.where.installed_by=2;
      let custom_value_fetch = await ConsultationhubRepository.scopeDetails(custom_value);




      let custom_qresult={};
      custom_qresult.table = 'project_scopes',
      custom_qresult.where = {q_result:1};
      custom_qresult.where.project_id = req.query.project_id,
      custom_qresult.where.supplied_by=2;
      custom_qresult.where.installed_by=2;
      let  custom_qresult_table = await ConsultationhubRepository.scopeDetails( custom_qresult);


      console.log('/////',custom_qresult_table);

      for (index in custom_qresult_table.rows) {
        console.log(custom_qresult_table .rows[index].dataValues.project_scope.scope_description);
       
       
         
      }



      var fs = require('fs');
      var pdf = require('html-pdf');
      var options = {
        format: 'A4', "border": {
          "top": "0.5in",            // default is 0, units: mm, cm, in, px
          "right": "0.2in",
          "bottom": "0.2in",
          "left": "0.2in"
        }
      };

      if(req.query.lang=='ara'){

        var html = `<!doctype html>
        <html xmlns:v="urn:schemas-microsoft-com:vml">
           <head>
              <meta charset="utf-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
              <title>eBinaa</title>
           </head>
        
        <style type="text/css">
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Medium.eot');
            src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
            font-weight:500;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-SemiBold.eot');
            src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
            font-weight:600;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Bold.eot');
            src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
            font-weight:700;
            font-style:normal;
            font-display:swap;
        }
        
        body { 
            font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
            background-color: #ffffff;
            padding: 0;
            margin: 0;
            font-size: 9px;
            line-height: 1.5;
            font-weight: normal;
        }
        * { 
            padding: 0; 
            margin: 0;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            // padding-right: 9%;
            // padding-left: 9%;
            padding: 0;
        }
        .site-logo { 
            padding: 30px 0;
        }
        .site-logo img {
            max-width: 100px;
        }
        table { 
            width: 100%;
        }
        table, table tr, table td, table th { 
            padding: 0;
        }
        .img-responsive { 
            max-width: 100%;
            width: 100%;
            height: auto;
            display: block;
        }
        .text-center { 
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
        .text-right{
            text-align: right;
        }
        .copy-txt {   
            font-size: 12px;
            line-height: 18px;
            font-weight: 500;
            text-align: center;
            color: #969696;
            padding: 30px 0;
            margin: 0;
        }
        h1 {
            font-size: 16px;
            font-weight: 600;
            line-height: 0.85;
            color: #000000;  
            padding: 0;
            margin: 0 0 15px 0;
        }
        p {
            font-size: 17px;
            font-weight: 500;
            line-height: 1.29;
            color: #000000;
            padding: 0;
            margin: 0 0 20px 0;
        }
        .blue-color { 
            color: #004e98; 
        }
        .table2 {
            border: 1px solid #e5e5e5;
            margin: 0 auto;
            border-radius: 2px;
            margin-bottom: 30px;
        }
        .table2 th, .table2 td {
            padding: 5px 10px;
        }
        .table2 thead th {
            background-color: #f6f6f8;
            font-size: 15px;
            font-weight: 500;
            line-height: 1;
            color: #0047ba;
        }
        .table2 thead .thead-tb-inner th, .table2 tbody .tbody-tb-inner td { text-align: center; }
        .table2 h3 { font-size: 15px; line-height: 1.5; }
        .table2 h4 { font-size: 14px; line-height: 1.5; }
        .table2 h5 { font-size: 13px; line-height: 1.5; }
        .bl-1 { border-left: 1px solid #e6e6e8; }
        .br-1 { border-right: 1px solid #e6e6e8; }
        .bt-1 { border-top: 1px solid #e6e6e8; }
        .bb-1 { border-bottom: 1px solid #e6e6e8; }
        .b-0 { border: 0;}
        .p-0, .table2 .p-0 { padding: 0;}
        .pb-0, .contractor-tbl td.pb-0, .table3 td.pb-0 { padding-bottom: 0;}
        .table2 thead th.rp-lr { padding-left: 0; padding-right: 0; }
        .table2 tbody td {
            font-size: 15px;
            line-height: 1.6;
            padding:  15px 10px;
        }
        .mb-30 {margin-bottom: 30px;}
        .contractor-tbl td { padding-top: 20px; padding-bottom: 30px;}
        
        .contractor-tbl h1 { font-size: 20px; line-height: 1; color: #004e98; font-weight: 600; margin: 0 0 15px 0; }
        .contractor-tbl h2 { font-size: 18px; line-height: 1.22; color: #004e98; font-weight: normal; margin: 0 0 10px 0;}
        .contractor-tbl p { font-size: 16px; line-height: 1.5; color: #000000; font-weight: normal; margin: 0 0 10px 0; }
        .project-price-tbl { margin-bottom: 30px;}
        .project-price-tbl td {
            border: 1px solid #e6e6e8;
            padding: 20px 20px;
        }
        .project-price-tbl td.custom-td { border: 0; padding: 20px 5px; }
        .project-price-tbl p {
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            color: #b7b7b8;
            margin-bottom: 15px;
        }
        .project-price-tbl h6 {
            font-size: 17px;
            font-weight: 500;
            line-height: 0.82;
            color: #000000;
        }
        .pl-10 { padding-left: 10px;}
        .pr-10 { padding-right: 10px;}
        .mb-0 { margin-bottom: 0;}
        .table3 {
            margin: 0 0 30px 0;
        }
        .table3 td {
            padding: 20px 40px; 
            vertical-align: text-top;
            position: relative;
        }
        .table3 thead h4 {
            font-size: 14px;
            line-height: 1.1;
            font-weight: normal;
            color: #004e98;
            text-align: left;
            margin: 0 0 10px 0;
        }
        .table3 thead p {
        font-size: 13px;
        font-weight: normal;
        line-height: 1.22;
        color: #b7b7b8;
        text-align: left;
        margin: 0 0 15px 0;
        }
        .table3 tbody h3 {
            font-size: 11px;
            font-weight: 600;
            line-height: 1.33;
            color: #000000;
            margin: 0;
            text-align: center;
        }
        ul.supply-list { margin: 0 auto;}
        ul.supply-list li {
            padding: 5px 10px 5px 30px;
            margin: 0;
            list-style-type: none;
            font-size: 10px;
            line-height: 1.43;
            color: #444445;
            font-weight: normal;
            background: url("`+global.constants.PDFIMAGEPATH+`/uploads/general_images/green-check.svg") left top no-repeat;
            background-position: top 12px left 0;
        }
         .h-line:after { content: ""; width: 80%; height: 2px; border-bottom:1px solid #e6e6e8; padding: 0 0 30px 0; margin: 0 auto; display: table; /*position: absolute; bottom: 0; left: 10%; right: 10%;*/ } 
        .v-line:after { content: ""; width: 2px; height: 80%; background: url(images/v-line.png) right center no-repeat; background-size: 100%; padding: 0; margin: 0; display: table; position: absolute; right: 0; top: 0; bottom: 0; }
        
        </style>
        
        
        
        
        
        
        
        <body>
        <div class="container">
        
        
            <table class="table1" width="100" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="text-center site-logo"><img src="`+global.constants.PDFIMAGEPATH+`/uploads/common_images/EBinaa-Logo-Colored.png"  class="" alt="logo"></td>
                </tr>
                <tr>
                    <td>
                        <h1>نطاق المشروع</h1>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <h4>النطاق الافتراضي</h4>
                                        <p>يتم تعيين هذا النطاق بشكل افتراضي في العقد.

                                        </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td width="20%" class="pb-0 h-line">
                                    <h3> توريد وتركيب<br> من قبل المقاول
                                    </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                                <td width="20%" class="pb-0 h-line">
                                    <h3>توريد وتركيب <br>من قبل العميل
                                    </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                                <td class="pb-0 h-line">
                                    <h3> يتم< توفيره بواسطة العميل ويتم<br> تثبيته بواسطة المقاول
                                    </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                            </tr>
                            </tr>`


      html += ` 
                            <tr>
                            
                                <td class="v-line">
                                    <ul class="supply-list">`
      for (index in scope_table.rows) {


        html += `<li>${scope_table.rows[index].dataValues.project_scope.scope_description_arabic} </li>`
      }
      

      html += '</ul></td>'
      html += ` 
                                       <td class="v-line">
                                          <ul class="supply-list">`
      for (index in scope_table_fetch.rows) {
        html += `<li>${scope_table_fetch.rows[index].dataValues.project_scope.scope_description_arabic} </li>`

      }
      html += '</ul></td>'
      html += ` 
                                          <td class="v-line">
                                             <ul class="supply-list">`
      for (index in scope_data_fetch.rows) {
        html += `<li>${scope_data_fetch.rows[index].dataValues.project_scope.scope_description_arabic} </li>`


      }
      html += '</ul></td>'








      html +=
        `</tr>                      
                            </tbody>
                            </table> 
                        </td>
                    </tr> `

      html += ` <tr>
                    <td>
                        <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <h4>نطاق مخصص</h4>
                                        <p>يتم تخصيص هذا النطاق واختياره من قبل العميل

                                        </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>`

      html += ` <tr>
                            
                            <td class="v-line">
                                <ul class="supply-list">`

      for (index in custom_qresult_table.rows) {
        console.log(custom_table.rows[index].dataValues.project_scope.scope_description_arabic)

        html += `<li>${custom_table.rows[index].dataValues.project_scope.scope_description_arabic} </li>`

      }
      // for (index in custom_qresult_table.rows) {
       
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description_arabic=='هل تحتاج إلى خزان للصرف الصحي في قطعة الأرض ؟'){
      //     console.log('//');


      //   html += `<li>خزان الصرف الصحي</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description_arabic=='هل تريد إضافة عازل حراري في الطابوق و السقف للمبنى؟'){
      //     html += `<li>الطابوق العازل و عازل السقف الحراري</li>`
      //   }
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description_arabic=='هل ستقوم بتركيب أجهزة المنزل الذكي؟'){
      //     html += `<li>تجهيزات للمنازل الذكية</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description_arabic=='هل تريد ملاط مقاوم للماء للمناطق الرطبة؟'){
      //     html += `<li>ملاط بوليمر</li>`
      //   }
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description_arabic=='هل تريد الاسمنت الأبيض للأرضيات الرخامية؟'){
      //     html += `<li>اسمنت أبيض للرخام</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description_arabic=='هل لديك ديكورات خارجية للمبنى بإسمنت الفايبر جلاس؟ '){
      //     html += `<li>ديكورات خارجية بإسمنت الفايبر جلاس</li>`
      //   }




      // }

      html += '</ul></td>'
      html += `<td class="v-line">
                                    <ul class="supply-list">`
      for (index in custom_table_fetch.rows) {

        html += `<li>${custom_table_fetch.rows[index].dataValues.project_scope.scope_description_arabic} </li>`

      }
      html += '</ul></td>'
      html += `<td class="v-line">
                                    <ul class="supply-list">`

      for (index in custom_value_fetch.rows) {

        html += `<li>${custom_value_fetch.rows[index].dataValues.project_scope.scope_description_arabic} </li>`

      }
      html += '</ul></td>'








      html +=
        `</tr>                      
                                    </tbody>
                                    </table> 
                                </td>
                            </tr> 
                            <tr>
                            <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
                        </tr>
                    </table>
                
                
                
                
                
                
                
                
                
                </div>
                </body>`




      //console.log(html)

      pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + 'scope_pdf_'+req.query.project_id + '.pdf', function (err, resp) {
        res.send({ status: 200, message: 'fetched', resp: global.constants.IMG_URL.project_scope_url + 'scope_pdf_'+req.query.project_id + '.pdf' })
        if (err) return console.log(err);
        console.log(resp);
      })


      }

      else{
      var html = `<!doctype html>
        <html xmlns:v="urn:schemas-microsoft-com:vml">
           <head>
              <meta charset="utf-8">
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
              <title>eBinaa</title>
           </head>
        
        <style type="text/css">
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Medium.eot');
            src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
            font-weight:500;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-SemiBold.eot');
            src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
            font-weight:600;
            font-style:normal;
            font-display:swap;
        }
        
        @font-face{
            font-family:'Artegra Sans Alt';
            src:url('fonts/ArtegraSansAlt-Bold.eot');
            src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
                url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
                url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
            font-weight:700;
            font-style:normal;
            font-display:swap;
        }
        
        body { 
            font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
            background-color: #ffffff;
            padding: 0;
            margin: 0;
            font-size: 9px;
            line-height: 1.5;
            font-weight: normal;
        }
        * { 
            padding: 0; 
            margin: 0;
        }
        .container {
            width: 100%;
            margin: 0 auto;
            // padding-right: 9%;
            // padding-left: 9%;
            padding: 0;
        }
        .site-logo { 
            padding: 30px 0;
        }
        .site-logo img {
            max-width: 100px;
        }
        table { 
            width: 100%;
        }
        table, table tr, table td, table th { 
            padding: 0;
        }
        .img-responsive { 
            max-width: 100%;
            width: 100%;
            height: auto;
            display: block;
        }
        .text-center { 
            text-align: center;
        }
        .text-left {
            text-align: left;
        }
        .text-right{
            text-align: right;
        }
        .copy-txt {   
            font-size: 12px;
            line-height: 18px;
            font-weight: 500;
            text-align: center;
            color: #969696;
            padding: 30px 0;
            margin: 0;
        }
        h1 {
            font-size: 16px;
            font-weight: 600;
            line-height: 0.85;
            color: #000000;  
            padding: 0;
            margin: 0 0 15px 0;
        }
        p {
            font-size: 17px;
            font-weight: 500;
            line-height: 1.29;
            color: #000000;
            padding: 0;
            margin: 0 0 20px 0;
        }
        .blue-color { 
            color: #004e98; 
        }
        .table2 {
            border: 1px solid #e5e5e5;
            margin: 0 auto;
            border-radius: 2px;
            margin-bottom: 30px;
        }
        .table2 th, .table2 td {
            padding: 5px 10px;
        }
        .table2 thead th {
            background-color: #f6f6f8;
            font-size: 15px;
            font-weight: 500;
            line-height: 1;
            color: #0047ba;
        }
        .table2 thead .thead-tb-inner th, .table2 tbody .tbody-tb-inner td { text-align: center; }
        .table2 h3 { font-size: 15px; line-height: 1.5; }
        .table2 h4 { font-size: 14px; line-height: 1.5; }
        .table2 h5 { font-size: 13px; line-height: 1.5; }
        .bl-1 { border-left: 1px solid #e6e6e8; }
        .br-1 { border-right: 1px solid #e6e6e8; }
        .bt-1 { border-top: 1px solid #e6e6e8; }
        .bb-1 { border-bottom: 1px solid #e6e6e8; }
        .b-0 { border: 0;}
        .p-0, .table2 .p-0 { padding: 0;}
        .pb-0, .contractor-tbl td.pb-0, .table3 td.pb-0 { padding-bottom: 0;}
        .table2 thead th.rp-lr { padding-left: 0; padding-right: 0; }
        .table2 tbody td {
            font-size: 15px;
            line-height: 1.6;
            padding:  15px 10px;
        }
        .mb-30 {margin-bottom: 30px;}
        .contractor-tbl td { padding-top: 20px; padding-bottom: 30px;}
        
        .contractor-tbl h1 { font-size: 20px; line-height: 1; color: #004e98; font-weight: 600; margin: 0 0 15px 0; }
        .contractor-tbl h2 { font-size: 18px; line-height: 1.22; color: #004e98; font-weight: normal; margin: 0 0 10px 0;}
        .contractor-tbl p { font-size: 16px; line-height: 1.5; color: #000000; font-weight: normal; margin: 0 0 10px 0; }
        .project-price-tbl { margin-bottom: 30px;}
        .project-price-tbl td {
            border: 1px solid #e6e6e8;
            padding: 20px 20px;
        }
        .project-price-tbl td.custom-td { border: 0; padding: 20px 5px; }
        .project-price-tbl p {
            font-size: 14px;
            font-weight: 500;
            line-height: 1;
            color: #b7b7b8;
            margin-bottom: 15px;
        }
        .project-price-tbl h6 {
            font-size: 17px;
            font-weight: 500;
            line-height: 0.82;
            color: #000000;
        }
        .pl-10 { padding-left: 10px;}
        .pr-10 { padding-right: 10px;}
        .mb-0 { margin-bottom: 0;}
        .table3 {
            margin: 0 0 30px 0;
        }
        .table3 td {
            padding: 20px 40px; 
            vertical-align: text-top;
            position: relative;
        }
        .table3 thead h4 {
            font-size: 14px;
            line-height: 1.1;
            font-weight: normal;
            color: #004e98;
            text-align: left;
            margin: 0 0 10px 0;
        }
        .table3 thead p {
        font-size: 13px;
        font-weight: normal;
        line-height: 1.22;
        color: #b7b7b8;
        text-align: left;
        margin: 0 0 15px 0;
        }
        .table3 tbody h3 {
            font-size: 11px;
            font-weight: 600;
            line-height: 1.33;
            color: #000000;
            margin: 0;
            text-align: center;
        }
        ul.supply-list { margin: 0 auto;}
        ul.supply-list li {
            padding: 5px 10px 5px 30px;
            margin: 0;
            list-style-type: none;
            font-size: 10px;
            line-height: 1.43;
            color: #444445;
            font-weight: normal;
            background: url("`+global.constants.PDFIMAGEPATH+`/uploads/general_images/green-check.svg") left top no-repeat;
            background-position: top 12px left 0;
        }
         .h-line:after { content: ""; width: 80%; height: 2px; border-bottom:1px solid #e6e6e8; padding: 0 0 30px 0; margin: 0 auto; display: table; /*position: absolute; bottom: 0; left: 10%; right: 10%;*/ } 
        .v-line:after { content: ""; width: 2px; height: 80%; background: url(images/v-line.png) right center no-repeat; background-size: 100%; padding: 0; margin: 0; display: table; position: absolute; right: 0; top: 0; bottom: 0; }
        
        </style>
        
        
        
        
        
        
        
        <body>
        <div class="container">
        
        
            <table class="table1" width="100" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="text-center site-logo"><img src="`+global.constants.PDFIMAGEPATH+`/uploads/common_images/EBinaa-Logo-Colored.png"  class="" alt="logo"></td>
                </tr>
                <tr>
                    <td>
                        <h1>Project Scope</h1>
                    </td>
                </tr>
                
                <tr>
                    <td>
                        <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <h4>Default Scope</h4>
                                        <p>This Scope is default in the contract </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td width="20%" class="pb-0 h-line">
                                    <h3>Supply and Install <br>by Contractor </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                                <td width="20%" class="pb-0 h-line">
                                    <h3>Supply and Install <br>by Client </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                                <td class="pb-0 h-line">
                                    <h3>Supplied by client and Installed <br>by Contractor </h3>
                                    <!-- <span class="h-line"></span> -->
                                </td>
                            </tr>
                            </tr>`


      html += ` 
                            <tr>
                            
                                <td class="v-line">
                                    <ul class="supply-list">`
      for (index in scope_table.rows) {


        html += `<li>${scope_table.rows[index].dataValues.project_scope.scope_description} </li>`
      }
      

      html += '</ul></td>'
      html += ` 
                                       <td class="v-line">
                                          <ul class="supply-list">`
      for (index in scope_table_fetch.rows) {
        html += `<li>${scope_table_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

      }
      html += '</ul></td>'
      html += ` 
                                          <td class="v-line">
                                             <ul class="supply-list">`
      for (index in scope_data_fetch.rows) {
        html += `<li>${scope_data_fetch.rows[index].dataValues.project_scope.scope_description} </li>`


      }
      html += '</ul></td>'








      html +=
        `</tr>                      
                            </tbody>
                            </table> 
                        </td>
                    </tr> `

      html += ` <tr>
                    <td>
                        <table class="table3 mb-0" width="100" border="0" cellpadding="0" cellspacing="0">
                            <thead>
                                <tr>
                                    <th colspan="3">
                                        <h4>Custom Scope</h4>
                                        <p>This Scope is customized and chosen by the client </p>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>`

      html += ` <tr>
                            
                            <td class="v-line">
                                <ul class="supply-list">`

      for (index in custom_qresult_table.rows) {
        console.log(custom_table.rows[index].dataValues.project_scope.scope_description)

        html += `<li>${custom_table.rows[index].dataValues.project_scope.scope_description} </li>`

      }
      // for (index in custom_qresult_table.rows) {
       
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description=='Do you need a septic tank?'){
      //     console.log('//');


      //   html += `<li>septic tank</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description=='Do you want to provide heat insulation for the building?'){
      //     html += `<li>Extra Building Insulation</li>`
      //   }
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description=='Do you need smart home provisions?'){
      //     html += `<li>Smart Home Provisions</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description=='Do you want waterproof grouts for wet areas?'){
      //     html += `<li>Waterproof Grout</li>`
      //   }
      //   if(custom_qresult_table.rows[index].dataValues.project_scope.scope_description=='Do you want white cement for marble flooring?'){
      //     html += `<li>White Cement for Marble</li>`
      //   }
      //   if(custom_qresult_table .rows[index].dataValues.project_scope.scope_description=='Do you have external decoration parts that require custom made GRC?'){
      //     html += `<li>GRC External Decoration</li>`
      //   }




      // }

      html += '</ul></td>'
      html += `<td class="v-line">
                                    <ul class="supply-list">`
      for (index in custom_table_fetch.rows) {

        html += `<li>${custom_table_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

      }
      html += '</ul></td>'
      html += `<td class="v-line">
                                    <ul class="supply-list">`

      for (index in custom_value_fetch.rows) {

        html += `<li>${custom_value_fetch.rows[index].dataValues.project_scope.scope_description} </li>`

      }
      html += '</ul></td>'








      html +=
        `</tr>                      
                                    </tbody>
                                    </table> 
                                </td>
                            </tr> 
                            <tr>
                            <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
                        </tr>
                    </table>
                
                
                
                
                
                
                
                
                
                </div>
                </body>`




      //console.log(html)

      pdf.create(html, options).toFile(global.constants.uploads.project_scope_pdf + 'scope_pdf_'+req.query.project_id + '.pdf', function (err, resp) {
        res.send({ status: 200, message: 'fetched', resp: global.constants.IMG_URL.project_scope_url + 'scope_pdf_'+req.query.project_id + '.pdf' })
        if (err) return console.log(err);
        console.log(resp);
      })

    }
      //res.send({status:201,message:'fetched',data:custom_table,resp:resp})
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()



}

/* import-task
method:POST
input:
output:data,
purpose:import Task
created by Sayanti Nath
*/



/**
 * @swagger
 * /api/admin/import-task:
 *  post:
 *   tags:
 *    - Import
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            task_id:
 *              type: integer
 *            stage_id:
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

ProjectController.importTask = (req, res) => {


  (async () => {

    try {



      
     


     
        // let project_task_delete = {};
        // project_task_delete.table = 'project_tasks',
        //   project_task_delete.where = {};
        // project_task_delete.where.stage_id = req.body.stage_id;
        // let project_delete_task_data = await GenericRepository.deleteData(project_task_delete);

      
      // for(let i=0;i<project_delete_data.length)






      let project_template = {};
      project_template.table='task_templates_data',
      project_template.where = {};
      project_template.where.id= req.body.task_id;




      let project_template_fetch = await GenericRepository.fetchData(project_template);

      //console.log(project_template_fetch);
    

  


         



         
for(index in project_template_fetch.rows){

         

            let project_task = {};
            project_task.table = 'project_tasks',
             
              project_task.data = {
                stage_id: req.body.stage_id,
                name: project_template_fetch.rows[index].dataValues.name,
                name_arabic: project_template_fetch.rows[index].dataValues.name_arabic,
                status: project_template_fetch.rows[index].dataValues.status,
                type:project_template_fetch.rows[index].dataValues.Type,
                type_arabic:project_template_fetch.rows[index].dataValues.Type_arabic,
                instruction: project_template_fetch.rows[index].dataValues.Instruction,
                instruction_arabic: project_template_fetch.rows[index].dataValues.instruction_arabic,
                creator: project_template_fetch.rows[index].dataValues.creator,
                assignee: project_template_fetch.rows[index].dataValues.assignee
              }

            var task_update = await GenericRepository.createData(project_task);

            }
      res.send({ status: 201, message: 'template imported', data: project_template_fetch })





    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/* import-task-template
method:POST
input:body[task_id]
output:data,
purpose:import Task template
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/import-task-templte:
 *  post:
 *   tags:
 *    - Import
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            task_id:
 *              type: integer
 *            stage_id:
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

ProjectController.importTaskTemplate = (req, res) => {


  (async () => {

    try {



      
     


     
        // let project_task_delete = {};
        // project_task_delete.table = 'project_task_templates',
        //   project_task_delete.where = {};
        // project_task_delete.where.template_stage_id = req.body.stage_id;
        // let project_delete_task_data = await GenericRepository.deleteData(project_task_delete);

      
      // for(let i=0;i<project_delete_data.length)






      let project_template = {};
      project_template.table='task_templates_data',
      project_template.where = {};
      project_template.where.id= req.body.task_id;




      let project_template_fetch = await GenericRepository.fetchData(project_template);

      //console.log(project_template_fetch);
    

  


         



         
for(index in project_template_fetch.rows){

         

            let project_task = {};
            project_task.table = 'project_task_templates',
             
              project_task.data = {
                template_stage_id: req.body.stage_id,
                name: project_template_fetch.rows[index].dataValues.name,
                name_arabic: project_template_fetch.rows[index].dataValues.name_arabic,
                status: project_template_fetch.rows[index].dataValues.status,
                Type:project_template_fetch.rows[index].dataValues.Type,
                Type_arabic:project_template_fetch.rows[index].dataValues.Type_arabic,
                Instruction: project_template_fetch.rows[index].dataValues.Instruction,
                instruction_arabic: project_template_fetch.rows[index].dataValues.instruction_arabic,
                creator: project_template_fetch.rows[index].dataValues.creator,
                assignee: project_template_fetch.rows[index].dataValues.assignee
              }

            var task_update = await GenericRepository.createData(project_task);

            }
      res.send({ status: 201, message: 'template imported', data: project_template_fetch })





    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}




ProjectController.viewBidPdf=async(req,res)=>{
  try{
    let info={};
    info.where={id:req.body.project_id};
    let info_fetch=await ConsultationhubRepository.viewBid(info);

    //console.log(info_fetch);
  
   

    let inform={};
    inform.where={project_id:req.body.project_id,is_default:1};
    let inform_fetch=await ConsultationhubRepository.viewBidDeafult(inform);


    let inform_data={};
    inform_data.where={project_id:req.body.project_id,is_default:0};
    let inform_fetch_data=await ConsultationhubRepository.viewBidNormal(inform_data);

    // for(let l=0;l<inform_fetch_data.rows.length;l++){
    //   console.log(inform_fetch_data.rows[l].dataValues.name)
    //    for(let k=0;k<info_fetch.rows[l].dataValues.project_tasks.length;k++){
    //     console.log('///',info_fetch.rows[l].dataValues.project_tasks.length);
    //    }
    // }
 
    var fs = require('fs');
    var pdf = require('html-pdf');
    var options = {
      format: 'A4', "border": {
        "top": "0.5in",            // default is 0, units: mm, cm, in, px
        "right": "0.2in",
        "bottom": "0.2in",
        "left": "0.2in"
      }
    };

   

var html=`<!doctype html>
<html xmlns:v="urn:schemas-microsoft-com:vml">
   <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
      <title>EBinaa</title>
   </head>

<style type="text/css">
@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-Medium.eot');
    src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
        url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
    font-weight:500;
    font-style:normal;
    font-display:swap;
}

@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-SemiBold.eot');
    src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
        url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
    font-weight:600;
    font-style:normal;
    font-display:swap;
}

@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-Bold.eot');
    src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
        url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
    font-weight:700;
    font-style:normal;
    font-display:swap;
}

body { 
    font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    font-weight: normal;
}
* { 
    padding: 0; 
    margin: 0;
}
.page-break{
  page-break-after:always;
}
.container {
    width:100%;
    max-width:800px;
    margin: 20px auto;
    padding-right:1cm;
    padding-left:1cm;
    box-sizing:border-box;
    border: 1px solid #eee;
}
.site-logo { 
    padding: 20px 0;
}
.site-logo img{ 
    max-width:100px;
}
table { 
    width: 100%;
}
table, table tr, table td, table th { 
    padding: 0;
}
.text-center { 
    text-align: center;
}
.text-left {
    text-align: left;
}
.text-right{
    text-align: right;
}
.copy-txt {   
    font-size: 10px;
    line-height: 18px;
    font-weight: 500;
    text-align: center;
    color: #969696;
    padding: 30px 0;
    margin: 0;
}
h3 {
    font-size: 14px;
    font-weight: 600;
    line-height: 0.85;
    color: #262626;
    padding: 0;
    margin: 0 0 5px;
}
h5 {
    font-size: 20px;
    font-weight: 600;
    line-height: 0.85;
    color: #004e98;  
    padding: 0;
    margin: 0 0 4px;
}
p {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.29;
    color: #004e98;
    padding: 0;
    margin: 0;
}
.pdf-h2 {
  color: #004e98;
    font-weight: 500;
    font-size: 21px;
    margin: 15px 0 0;
}
.pdf-h3 {
  color: #004e98;
    font-weight: 700;
    font-size: 20px;
    margin: 0;
}
.pdf-1 tbody th, .pdf-1 tbody td {
  padding: 10px 20px;
}
.circle-others.pdf-1 tbody td {
    border: 1px solid #eeeeee;
}
.pdf-1 tbody th {
    padding: 0;
}
.pdf-1 tbody th.th-shado {
    border: 1px solid #eeeeee;
}
.pdf-1 tbody td.td-shado {
    border: 1px solid #eeeeee;
    display: block;
    padding: 0;
}
.pdf-1.table-first tbody th, .pdf-1.table-first tbody td {
  height: 115px;
  padding: 0 15px !important;
}
.pdf-1.table-bid tbody td, .pdf-1.table-resours tbody td {
  padding: 15px 15px !important;
}
.pdf-1.gantt-chart-table {
  margin-bottom: 30px;
}
.pdf-1.gantt-chart-table tbody td {
  padding: 0 !important;
}
.pdf-1.table-first tbody th.th-img {
  width: 100px;
}
.th-img img {
  max-width: 100%;
  height: 80px;
  width: 80px;
  border-radius: 50%;
}
.pdf-1 tbody td.td-shado table tr td p, .pdf-2.his-td tr td p {
  font-size: 10px;
}
.pdf-1 tbody td.td-shado table tr td h6, .pdf-2.his-td tr td h6 {
  color: #1f1f1f;
  font-size: 10px;
  font-weight: 400;
}

/* table */
.table-stage {
  width:100%;
  margin-bottom:0;
  background-color:#fff;
  border:1px solid #e3e3e3;
  border-collapse:collapse;
  table-layout:fixed;
}
.table-stage thead tr th{
  padding:10px 10px 8px 10px;
  background-color:#f6f6f8;
  border-right:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:center;
  font-weight:400;
    font-size: 10px;
    color: #004e98;
}
.table-stage thead tr th:last-child{
  border-right:none;
}
.table-stage thead tr th.text-left{
  text-align:left;
}
.table-stage thead tr th.task-no{
  width:50px;
}
.table-stage thead tr th.task-name{
  width:140px;
}
.table-stage thead tr th.type{
  width:80px;
}
.table-stage tbody tr th {
  padding:10px 10px 8px 10px;
  background-color:#f0f6ff;
  border-top:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:left;
  font-weight:400;
  font-size: 10px;
    color: #004e98;
}
.table-stage tbody tr td{
  padding:10px 10px 8px 10px;
  background-color:#fff;
  border-right:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:center;
  font-weight:400;
    font-size:10px;
}
.gantt-chart-img {
  max-width: 100%;
}
.bl-1 { border-left: 1px solid #f5f5f5;}
.br-1 { border-right: 1px solid #f5f5f5; }
.bt-1 { border-top: 1px solid #f5f5f5; }
.bb-1 { border-bottom: 1px solid #f5f5f5; }
.td-mr-3 {  margin-left: 20px; }
@media print{
  .page{
    width:auto;
    margin-top:0;
    margin-bottom:0;
    box-shadow:initial;
}
</style>`
for(let i=0;i<info_fetch.rows[0].dataValues.project_bids.length;i++){
  var data={};
  data.table='contractor_manpowers',
  data.where={employee_type:1,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_fetch=await GenericRepository.fetchData(data);


  var data_labor={};
  data_labor.table='contractor_manpowers',
  data_labor.where={employee_type:2,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_labor_fetch=await GenericRepository.fetchData(data_labor);
  let project_gnatt_chart={};
  project_gnatt_chart.table='project_docs',
  project_gnatt_chart.where={project_id:req.body.project_id,type:'gantt_chart',resource_description:parseInt(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id)}
  let project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);


  var data_admin={};
  data_admin.table='contractor_manpowers',
  data_admin.where={employee_type:3,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_admin_fetch=await GenericRepository.fetchData(data_admin);

  let comapny_logo={};
  comapny_logo.table='resources',
  comapny_logo.where={user_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id,type:'contractor_profile_photo'};
  let company_logo_fetch=await GenericRepository.fetchData(comapny_logo)

html+=`<body>
<div class="page">
  <div class="container">
    <table class="table pdf-page-1" width="100" border="0" cellpadding="0" cellspacing="0">
          <tr>
              <td class="text-center site-logo">
                <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">
                  <h2 class="pdf-h2">Contractor Information</h2>
              </td>
          </tr>
          <tr>
              <td>
                  <h3 style="margin-bottom: 15px;">Tender Summary</h3>
              </td>
          </tr>
          <tr>
              <td>
                  <table class="pdf-1 table-first" width="100" border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                  <tr>
                      <th class="th-img th-shado" rowspan="4">`
                      if(company_logo_fetch.rows.length>0){
                       html+=` <img src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+company_logo_fetch.rows[0].dataValues.resource_url+`"  alt="">`
                      }
                      else{
                        html+=` <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg" alt="">`

                      }
                     html+=` </th>
                  </tr>
                  <tr>
                    <td class="td-shado td-mr-3">
                      <table>
                        <tr>
                        <td width="33.3333%">
                              <p>Company Name</p>
                        <h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.company_name}</h6>
                            </td>
                        <td width="33.3333%">
                              <p>Contact Person</p>
                        <h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.full_name}</h6>
                            </td>
                            <td width="33.3333%">
                              <p>Phone Number</p>
                        <h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.phone}</h6>
                            </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
            </tbody>
                  </table> 
              </td>
          </tr>
          <tr>
              <td>
                  <h3 style="margin-bottom: 15px; margin-top: 35px;">Contractor Resources</h3>
              </td>
          </tr>
          <tr>
              <td>
                  <table class="pdf-1 table-resours" width="100" border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                  <tr>
                    <td class="td-shado">
                      <table>
                        <tr>
                          <td width="25%">
                              <p>Number of Admin</p>`
                             
                        html+=`<h6>${data_admin_fetch.count}</h6>`
                            
                           html+` </td>`

                          html+=`<td width="25%">
                            <p>Number of Machniery</p>
                            <h6>12</h6>`
                          html+=`</td>`

                           html+=` <td width="25%">
                              <p>Years of Experience</p>`
                              for(let j=0;j<info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.contractor_metas.length;j++){
                                if(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_name=='years_of_experience'){
                          html+=`<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_value}</h6>`
                                }
                              }
                        html+=`</td>`
                           html+=` <td width="25%">
                              <p>Completed Projects</p>`
                              for(let j=0;j<info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.contractor_metas.length;j++){
                                if(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_name=='projects_delivered'){
                          html+=`<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_value}</h6>`
                                }
                              }
                           html+=`</td>`

                      html+=` </tr>
                      </table>
                          <table>
                        <tr>
                            <td width="25%">
                              <p>Number of Engineers</p>` 
                             
                              
                              html+=` <h6>${data_fetch.count}</h6>` 
                        
                            html+=` </td>`
                            html+=`<td width="25%">
                              <p>Number of Labors</p>
                        <h6>${data_labor_fetch.count}</h6>
                            </td>
                            <td width="25%">
                              <p>&nbsp;</p>
                              <h6>&nbsp;</h6>
                            </td>
                            <td width="25%">
                              <p>&nbsp;</p>
                              <h6>&nbsp;</h6>
                            </td>`
                      html+=` </tr>
                      </table>
                    </td>
                  </tr>
            </tbody>
                  </table> 
              </td>
          </tr>
          <tr>
              <td>
                  <h3 style="margin-bottom: 15px; margin-top: 35px;">Bid Details</h3>
              </td>
          </tr>
          <tr>
              <td>
                  <table class="pdf-1 table-bid" width="100" border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                  <tr>
                    <td class="td-shado">
                      <table>
                        <tr>
                        <td width="50%">
                              <p>Price (OMR)</p>
                        <h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.price}</h6>
                            </td>
                            <td width="50%">
                              <p>Time period (Days)</p>
                        <h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.days}</h6>
                        </td>
                    </tr>
                  </table>
                </td>
              </tr>
         </tbody>
              </table> 
          </td>
      </tr>`
          
          
    
         html+=` <tr>
              <td>
                  <h3 style="margin-bottom: 15px; margin-top: 35px;"> BID SUMMARY</h3>
              </td>
          </tr>
          <tr>
              <td>
                  <table class="pdf-1 gantt-chart-table" width="100" border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                  <tr>
                    <td class="td-shado">
                      <table>
                        <tr>
                        <td width="100%">`
                       
                            html+=` <img class="gantt-chart-img" src="`+process.env.WEBURL+`:`+process.env.SERVER_PORT+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="">`
                            html+=`</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                 </tbody>
                      </table> 
                  </td>
              </tr>
          </table>
          <div class="page-break"></div>`
          
                                
                              }

            html+=` 
            <table class="table pdf-page-1 margin-b" width="100" border="0" cellpadding="0" cellspacing="0">
            <tr>
                  <td>
                     <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch.rows[0].dataValues.name}</h3>
                 </td>
             </tr>
             <tr>
             <td>
             <table class="table-stage">
               <thead>
                 <tr>
                   <th class="task-no text-center">Task No</th>
                   <th class="task-name text-left">Task Name</th>
                   <th class="type text-left">Type</th>
                   <th class="instructions text-left">Instructions</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <th colspan="4" class="full-width text-left">Contractor</th>
                 </tr>`
               for(let m=0;m<inform_fetch.rows[0].dataValues.project_tasks.length;m++){
               html+=`  <tr>
               <td class="text-center">${m+1}</th>
               <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.name}</th>
               <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.type}</th>`
               if(inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.instruction==null){
                 html+=`<td class="text-left"></td>`
               }
               else{
               html+=`<td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.instruction}</th>`
               }
                html+=` </tr>`
               }
             html+=`  
             
                 </tr>
               </tbody>
             </table>
                 </td>
             </tr>`
             

          for(let l=0;l<inform_fetch_data.rows.length;l++){
         html+=` <tr>
              <td>
                  <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch_data.rows[l].dataValues.name}</h3>
              </td>
          </tr>
          <tr>
          <td>
          <table class="table-stage">
            <thead>
              <tr>
                <th class="task-no text-center">Task No</th>
                <th class="task-name text-left">Task Name</th>
                <th class="type text-left">Type</th>
                <th class="instructions text-left">Instructions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th colspan="4" class="full-width text-left">Contractor</th>
              </tr>`
            for(let k=0;k<inform_fetch_data.rows[l].dataValues.project_tasks.length;k++){
            html+=` <tr>
            <td class="text-center">${k+1}</th>
            <td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.name}</td>
            <td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.type}</td>`  
            if(inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.instruction==null){

              html+=`<td class="text-left"></td>`
            }
            else{
            html+=`<td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.instruction}</td>`
            }
              html+=`</tr>`
            }
          html+=` 
          
              </tr>
            </tbody>
          </table>
              </td>
          </tr>`
          }


          html+=`<tr>
          <td>
              <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch.rows[1].dataValues.name}</h3>
          </td>
      </tr>
      <tr>
      <td>
      <table class="table-stage">
        <thead>
          <tr>
            <th class="task-no text-center">Task No</th>
            <th class="task-name text-left">Task Name</th>
            <th class="type text-left">Type</th>
            <th class="instructions text-left">Instructions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th colspan="4" class="full-width text-left">Contractor</th>
          </tr>`
        for(let n=0;n<inform_fetch.rows[0].dataValues.project_tasks.length;n++){
        html+=` <tr>
        <td class="text-center">${n+1}</th>
        <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.name}</th>
        <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.type}</th>`
       if(inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.instruction==null){
        html+=`<td class="text-left"></td>`
       } 
       else{
       html+=` <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.instruction}</th>`
       }
          html+=`</tr>`
        }
      html+=` 
      
          </tr>
        </tbody>
        </table>
        </td>
    </tr>
                                 
</table>

      <div class="page-break"></div>

  </div>
</div>
</body>`
    
pdf.create(html, options).toFile(global.constants.uploads.bid_view + 'bid_view_pdf'+req.body.project_id + '.pdf', function (err, resp) {
  res.send({ status: 200, message: 'fetched', resp: global.constants.IMG_URL.bid_view_url + 'bid_view_pdf'+req.body.project_id + '.pdf',data:info_fetch })
  if (err) return console.log(err);
  console.log(resp);
})






  }
  catch (err) {
    console.trace(err)

    res.send({ status: 500, err: err });

  }

}


ProjectController.viewPdfDemo=async(req,res)=>{
  try{

    let info={};
    info.where={id:req.body.project_id};
    //let order=[['id','ASC']]
    let info_fetch=await ConsultationhubRepository.viewBid(info);

    //console.log(info_fetch);
  
   

    let inform={};
    inform.where={project_id:req.body.project_id,is_default:1};
    let inform_fetch=await ConsultationhubRepository.viewBidDeafult(inform);


    let inform_data={};
    inform_data.where={project_id:req.body.project_id,is_default:0};
    let inform_fetch_data=await ConsultationhubRepository.viewBidNormal(inform_data);


  var fs = require('fs');
    var pdf = require('html-pdf');
    var options = {
      format: 'A4', "border": {
        "top": "0.5in",            // default is 0, units: mm, cm, in, px
        "right": "0.2in",
        "bottom": "0.2in",
        "left": "0.2in"
      }
    };
var html=` <!doctype html>
<html xmlns:v="urn:schemas-microsoft-com:vml">
   <head>
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="width=device-width, initial-scale=1.0, shrink-to-fit=no, minimal-ui" name="viewport">
      <title>EBinaa</title>
   </head>

<style type="text/css">

@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-Medium.eot');
    src:url('fonts/ArtegraSansAlt-Medium.woff') format('woff'),
        url('fonts/ArtegraSansAlt-Medium.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-Medium.svg') format('svg');
    font-weight:500;
    font-style:normal;
    font-display:swap;
}

@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-SemiBold.eot');
    src:url('fonts/ArtegraSansAlt-SemiBold.woff') format('woff'),
        url('fonts/ArtegraSansAlt-SemiBold.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-SemiBold.svg') format('svg');
    font-weight:600;
    font-style:normal;
    font-display:swap;
}

@font-face{
    font-family:'Artegra Sans Alt';
    src:url('fonts/ArtegraSansAlt-Bold.eot');
    src:url('fonts/ArtegraSansAlt-Bold.woff') format('woff'),
        url('fonts/ArtegraSansAlt-Bold.ttf') format('truetype'),
        url('fonts/ArtegraSansAlt-Bold.svg') format('svg');
    font-weight:700;
    font-style:normal;
    font-display:swap;
}

body { 
    font-family: "Artegra Sans Alt", Verdana, Geneva, Tahoma, sans-serif;
    background-color: #ffffff;
    padding: 0;
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    font-weight: normal;
}
* { 
    padding: 0; 
    margin: 0;
}
.page-break{
	page-break-after:always;
}
.container {
    width:100%;
    max-width:800px;
    margin: 20px auto;
    padding-right:1cm;
    padding-left:1cm;
    box-sizing:border-box;
    border: 1px solid #eee;
}
.site-logo { 
    padding: 20px 0;
}
.site-logo img{ 
    max-width:100px;
}
table { 
    width: 100%;
}
table, table tr, table td, table th { 
    padding: 0;
}
.text-center { 
    text-align: center;
}
.text-left {
    text-align: left;
}
.text-right{
    text-align: right;
}
.copy-txt {   
    font-size: 10px;
    line-height: 18px;
    font-weight: 500;
    text-align: center;
    color: #969696;
    padding: 30px 0;
    margin: 0;
}
h3 {
    font-size: 14px;
    font-weight: 600;
    line-height: 0.85;
    color: #262626;
    padding: 0;
    margin: 0 0 5px;
}
h5 {
    font-size: 20px;
    font-weight: 600;
    line-height: 0.85;
    color: #004e98;  
    padding: 0;
    margin: 0 0 4px;
}
p {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.29;
    color: #004e98;
    padding: 0;
    margin: 0;
}
.pdf-h2 {
  color: #004e98;
    font-weight: 500;
    font-size: 21px;
    margin: 15px 0 0;
}
.pdf-h3 {
  color: #004e98;
    font-weight: 700;
    font-size: 20px;
    margin: 0;
}
.pdf-1 tbody th, .pdf-1 tbody td {
  padding: 10px 20px;
}
.circle-others.pdf-1 tbody td {
    border: 1px solid #eeeeee;
}
.pdf-1 tbody th {
    padding: 0;
}
.pdf-1 tbody th.th-shado {
    border: 1px solid #eeeeee;
}
.pdf-1 tbody td.td-shado {
    border: 1px solid #eeeeee;
    display: block;
    padding: 0;
}
.pdf-1.table-first tbody th, .pdf-1.table-first tbody td {
  height: 115px;
  padding: 0 15px !important;
}
.pdf-1.table-bid tbody td, .pdf-1.table-resours tbody td {
  padding: 15px 15px !important;
}
.pdf-1.gantt-chart-table {
  margin-bottom: 30px;
}
.pdf-1.gantt-chart-table tbody td {
  padding: 0 !important;
}
.pdf-1.table-first tbody th.th-img {
  width: 100px;
}
.th-img img {
  max-width: 100%;
  height: 80px;
  width: 80px;
  border-radius: 50%;
}
.pdf-1 tbody td.td-shado table tr td p, .pdf-2.his-td tr td p {
  font-size: 10px;
}
.pdf-1 tbody td.td-shado table tr td h6, .pdf-2.his-td tr td h6 {
  color: #1f1f1f;
  font-size: 10px;
  font-weight: 400;
}

/* table */
.table-stage {
  width:100%;
  margin-bottom:0;
  background-color:#fff;
  border:1px solid #e3e3e3;
  border-collapse:collapse;
  table-layout:fixed;
}
.table-stage thead tr th{
  padding:10px 10px 8px 10px;
  background-color:#f6f6f8;
  border-right:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:center;
  font-weight:400;
    font-size: 10px;
    color: #004e98;
}
.table-stage thead tr th:last-child{
  border-right:none;
}
.table-stage thead tr th.text-left{
  text-align:left;
}
.table-stage thead tr th.task-no{
  width:50px;
}
.table-stage thead tr th.task-name{
  width:140px;
}
.table-stage thead tr th.type{
  width:80px;
}
.table-stage tbody tr th {
  padding:10px 10px 8px 10px;
  background-color:#f0f6ff;
  border-top:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:left;
  font-weight:400;
  font-size: 10px;
    color: #004e98;
}
.table-stage tbody tr td{
  padding:10px 10px 8px 10px;
  background-color:#fff;
  border-right:1px solid #e3e3e3;
  border-bottom:1px solid #e3e3e3;
  text-align:center;
  font-weight:400;
    font-size:10px;
}
.gantt-chart-img {
  max-width: 100%;
  height: 460px;
  width: 100%;
}
.bl-1 { border-left: 1px solid #f5f5f5;}
.br-1 { border-right: 1px solid #f5f5f5; }
.bt-1 { border-top: 1px solid #f5f5f5; }
.bb-1 { border-bottom: 1px solid #f5f5f5; }
.td-mr-3 {  margin-left: 20px; }
.margin-b {
	margin-bottom: 30px;
}
@media print{
  .page{
    width:auto;
    margin-top:0;
    margin-bottom:0;
    box-shadow:initial;
}
}
</style><body>

<div class="page">
	<div class="container">
		<!-- *************** -->
		<table class="table pdf-page-1" width="100" border="0" cellpadding="0" cellspacing="0">
	        <tr>
	            <td class="text-center site-logo">
	            	<img src="`+global.constants.PDFIMAGEPATH+`/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">
	                <h2 class="pdf-h2">Tender Summary</h2>
	            </td>
	        </tr>`
for(let i=0;i<info_fetch.rows[0].dataValues.project_bids.length;i++){

  var data={};
  data.table='contractor_manpowers',
  data.where={employee_type:1,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_fetch=await GenericRepository.fetchData(data);


  var data_labor={};
  data_labor.table='contractor_manpowers',
  data_labor.where={employee_type:2,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_labor_fetch=await GenericRepository.fetchData(data_labor);
  let project_gnatt_chart={};
  project_gnatt_chart.table='project_docs',
  project_gnatt_chart.where={project_id:req.body.project_id,type:'gantt_chart',resource_description:parseInt(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id)}
  let project_gnatt_table=await GenericRepository.fetchData(project_gnatt_chart);
  console.log(project_gnatt_table);


  var data_admin={};
  data_admin.table='contractor_manpowers',
  data_admin.where={employee_type:3,contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id};
  var data_admin_fetch=await GenericRepository.fetchData(data_admin);

  let comapny_logo={};
  comapny_logo.table='resources',
  comapny_logo.where={user_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id,type:'contractor_profile_photo'};
  let company_logo_fetch=await GenericRepository.fetchData(comapny_logo)
  let machine_count={};
  machine_count.table='contractor_metas',
  machine_count.where={contractor_id:info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.id,group_name:'machinery',key_name:{$in:['number_of_machine_0','number_of_machine_1','number_of_machine_2','number_of_machine_3','number_of_machine_4','number_of_machine_5','number_of_machine_6','number_of_machine_7','number_of_machine_8','number_of_machine_9','number_of_machine_10']}} ;
  let machine_count_fetch=await GenericRepository.fetchData(machine_count);
  //var sum=0;
  var and_array=[];
  for(index in machine_count_fetch.rows){
    var b=parseInt(machine_count_fetch.rows[index].dataValues.key_value);
    console.log(b);
    and_array.push(b);
  }
  console.log(and_array);
  var sum = and_array.reduce(function(a, b){
    return a + b;
}, 0);

html+=`
	        <tr>
	            <td>
	                <h3 style="margin-bottom: 15px;">BID SUMMARY ${i+1}</h3>
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <table class="pdf-1 table-first" width="100" border="0" cellpadding="0" cellspacing="0">
	                    <tbody>
					        <tr>
					            <th class="th-img th-shado" rowspan="4">`
	            				if(company_logo_fetch.rows.length>0){
                        html+=` <img src="`+global.constants.PDFIMAGEPATH+`/uploads/`+company_logo_fetch.rows[0].dataValues.resource_url+`"  alt="">`
                       }
                       else{
                         html+=` <img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg" alt="">`
 
                       }
					           html+=` </th>
					        </tr>
					        <tr>
					        	<td class="td-shado td-mr-3">
					        		<table>
					        			<tr>
					        				<td width="33.3333%">
								            	<p>Company Name</p>
												<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.company_name}</h6>
								            </td>
								    		<td width="33.3333%">
								            	<p>Contact Person</p>
												<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.full_name}</h6>
								            </td>
								            <td width="33.3333%">
								            	<p>Phone Number</p>
												<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.phone}</h6>
								            </td>
					        			</tr>
					        		</table>
					        	</td>
					        </tr>
 						</tbody>
	                </table> 
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <h3 style="margin-bottom: 15px; margin-top: 35px;">Contractor Resources</h3>
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <table class="pdf-1 table-resours" width="100" border="0" cellpadding="0" cellspacing="0">
	                    <tbody>
					        <tr>
					        	<td class="td-shado">
					        		<table>
					        			<tr>
								    		<td width="25%">
								            	<p>Number of Admin</p>
												<h6>${data_admin_fetch.count}</h6>
								            </td>
								            <td width="25%">
								            	<p>Number of Machniery</p>
												<h6>${sum}</h6>
								            </td>
								            <td width="25%">
                              <p>Years of Experience</p>`
                              
                              for(let j=0;j<info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.contractor_metas.length;j++){
                                if(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_name=='years_of_experience'){
                          html+=`<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_value}</h6>`
                                }
                              }
								           html+=` </td>`
								           html+=` <td width="25%">
								            	<p>Completed Projects</p>`
                              for(let j=0;j<info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.contractor_metas.length;j++){
                                if(info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_name=='projects_delivered'){
                          html+=`<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.user.dataValues.contractor_metas[j].dataValues.key_value}</h6>`
                                }
                              }
								           html+=` </td>`
					        		html+=`	</tr>
					        		</table>
					                <table>
					        			<tr>
								            <td width="25%">
								            	<p>Number of Engineers</p>
												<h6>${data_fetch.count}</h6>
								            </td>
								            <td width="25%">
								            	<p>Number of Labors</p>
												<h6>${data_labor_fetch.count}</h6>
								            </td>
								            <td width="25%">
								            	<p>&nbsp;</p>
												<h6>&nbsp;</h6>
								            </td>
								            <td width="25%">
								            	<p>&nbsp;</p>
												<h6>&nbsp;</h6>
								            </td>
					        			</tr>
					        		</table>
					        	</td>
					        </tr>
 						</tbody>
	                </table> 
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <h3 style="margin-bottom: 15px; margin-top: 35px;">Bid Details</h3>
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <table class="pdf-1 table-bid" width="100" border="0" cellpadding="0" cellspacing="0">
	                    <tbody>
					        <tr>
					        	<td class="td-shado">
					        		<table>
					        			<tr>
								    		<td width="50%">
								            	<p>Price (OMR)</p>
												<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.price}</h6>
								            </td>
								            <td width="50%">
								            	<p>Time period (Days)</p>
												<h6>${info_fetch.rows[0].dataValues.project_bids[i].dataValues.days}</h6>
								            </td>
					        			</tr>
					        		</table>
					        	</td>
					        </tr>
 						</tbody>
	                </table> 
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <h3 style="margin-bottom: 15px; margin-top: 35px;">Program of Works</h3>
	            </td>
	        </tr>
	        <tr>
	            <td>
	                <table class="pdf-1 gantt-chart-table" width="100" border="0" cellpadding="0" cellspacing="0">
	                    <tbody>
					        <tr>
					        	<td class="td-shado">
					        		<table>
					        			<tr>
                        <td width="100%">
                        
	            								<img class="gantt-chart-img" src="`+global.constants.PDFIMAGEPATH+`/uploads/`+project_gnatt_table.rows[0].dataValues.resource_url+`" alt="">
								            </td>
					        			</tr>
					        		</table>
					        	</td>
					        </tr>
 						</tbody>
	                </table> 
	            </td>
	        </tr>
      </table>`
}
	

	    html+=`<div class="page-break"></div>

		<!-- *************** -->
		<table class="table pdf-page-1 margin-b" width="100" border="0" cellpadding="0" cellspacing="0">
	    	<tr>
        <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch.rows[0].dataValues.description}</h3>
        </td>
    </tr>
    <tr>
    <td>
    <table class="table-stage">
      <thead>
        <tr>
          <th class="task-no text-center">Task No</th>
          <th class="task-name text-left">Task Name</th>
          <th class="type text-left">Type</th>
          <th class="instructions text-left">Instructions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th colspan="4" class="full-width text-left">Contractor</th>
        </tr>`
      for(let m=0;m<inform_fetch.rows[0].dataValues.project_tasks.length;m++){
      html+=`  <tr>
      <td class="text-center">${m+1}</th>
      <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.name}</th>
      <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.type}</th>`
      if(inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.instruction==null){
        html+=`<td class="text-left"></td>`
      }
      else{
      html+=`<td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[m].dataValues.instruction}</th>`
      }
       html+=` </tr>`
      }
    html+=`  
    
        </tr>
      </tbody>
    </table>
        </td>
    </tr>`
    

 for(let l=0;l<inform_fetch_data.rows.length;l++){
html+=` <tr>
     <td>
         <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch_data.rows[l].dataValues.description}</h3>
     </td>
 </tr>
 <tr>
 <td>
 <table class="table-stage">
   <thead>
     <tr>
       <th class="task-no text-center">Task No</th>
       <th class="task-name text-left">Task Name</th>
       <th class="type text-left">Type</th>
       <th class="instructions text-left">Instructions</th>
     </tr>
   </thead>
   <tbody>
     <tr>
       <th colspan="4" class="full-width text-left">Contractor</th>
     </tr>`
   for(let k=0;k<inform_fetch_data.rows[l].dataValues.project_tasks.length;k++){
   html+=` <tr>
   <td class="text-center">${k+1}</th>
   <td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.name}</td>
   <td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.type}</td>`  
   if(inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.instruction==null){

     html+=`<td class="text-left"></td>`
   }
   else{
   html+=`<td class="text-left">${inform_fetch_data.rows[l].dataValues.project_tasks[k].dataValues.instruction}</td>`
   }
     html+=`</tr>`
   }
 html+=` 
 
     </tr>
   </tbody>
 </table>
     </td>
 </tr>`
 }


 html+=`<tr>
 <td>
     <h3 style="margin-bottom: 15px; margin-top: 35px;">${inform_fetch.rows[1].dataValues.description}</h3>
 </td>
</tr>
<tr>
<td>
<table class="table-stage">
<thead>
 <tr>
   <th class="task-no text-center">Task No</th>
   <th class="task-name text-left">Task Name</th>
   <th class="type text-left">Type</th>
   <th class="instructions text-left">Instructions</th>
 </tr>
</thead>
<tbody>
 <tr>
   <th colspan="4" class="full-width text-left">Contractor</th>
 </tr>`
for(let n=0;n<inform_fetch.rows[0].dataValues.project_tasks.length;n++){
html+=` <tr>
<td class="text-center">${n+1}</th>
<td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.name}</th>
<td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.type}</th>`
if(inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.instruction==null){
html+=`<td class="text-left"></td>`
} 
else{
html+=` <td class="text-left">${inform_fetch.rows[0].dataValues.project_tasks[n].dataValues.instruction}</th>`
}
 html+=`</tr>`
}
					html+=	`</tbody>
					</table>
	            </td>
	        </tr>
	    </table>
		<!-- *************** -->
	</div>
</div>
</body>` 

pdf.create(html, options).toFile(global.constants.uploads.bid_view + 'bid_view_pdf'+req.body.project_id + '.pdf', function (err, resp) {
  res.send({ status: 200, message: 'fetched', resp: global.constants.IMG_URL.bid_view_url + 'bid_view_pdf'+req.body.project_id + '.pdf'})
  if (err) return console.log(err);
  console.log(resp);
})
  }
  catch (err) {
    console.trace(err)

    res.send({ status: 500, err: err });

  }



}

/* import-task-template
method:POST
input:
output:data,
purpose:to get list of email
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/email:
 *  post:
 *   tags:
 *    - Contractor Profile
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
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

ProjectController.emailList=async()=>{
  try{
    let project={};
    project.table='projects';
    project.where={};
    let project_details=await GenericRepository.fetchData(project);

    let admin={};
    admin.table='admin',
    admin.where={};
    let admin_fetch=await GenericRepository.fetchData(admin);
    
    for(index in project_details.rows){
      console.log(project_details.rows[index]);
      let date=moment(project_details.rows[index].dataValues.bid_closed_date).add(1,'day').format('YYYY-MM-DD');
      let date_ob = moment(new Date()).format('YYYY-MM-DD');
      if(date_ob==date){
        let sender=[];
       console.log('dsbchjsbcjdshb');
        let contractor={};
        contractor.table='project_bids',
        contractor.where={project_id:project_details.rows[index].dataValues.id};
        let contractor_fetch=await ConsultationhubRepository.fetchProjectDataOther(contractor);
        for(index in contractor_fetch.rows){
          sender.push(contractor_fetch.rows[index].dataValues.user.email);
        }

        let client={};
        client.table='user',
        client.where={id:project_details.rows[index].dataValues.user_id}
        let client_fetch=await GenericRepository.fetchData(client);

        let email_data={};
        email_data.email=sender;
        email_data.name=client_fetch.rows[0].dataValues.full_name;
        email_data.number=client_fetch.rows[0].dataValues.phone;

        let email_admin={};
        email_admin.email=admin_fetch.rows[0].dataValues.email;
        email_admin.project=project_details.rows[index].dataValues.name;

        console.log(email_admin);

        console.log(email_data);

         global.eventEmitter.emit('client_details',email_data);
         global.eventEmitter.emit('completed_project_information',email_admin);

         console.log('mail sent');


      }
    }
    

  }
  catch (err) {
    console.trace(err)

    res.send({ status: 500, err: err });

  }
}

module.exports = ProjectController






