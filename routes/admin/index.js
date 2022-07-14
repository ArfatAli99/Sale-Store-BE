const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator/check')

var AccountController = require('../../controllers/AccountController');
var AdminConsultantController = require('../../controllers/AdminConsultantController');
var AdminController = require('../../controllers/AdminController');
var UserController = require('../../controllers/UserController');
var ConsultenthubController = require('../../controllers/ConsultenthubController');
var fileUploadMiddleware = require('../../middlewares/fileUpload');
var CommonValidationMiddleware = require('../../middlewares/CommonValidationMiddleware'); 
var ProjectController= require('../../controllers/ProjectController');
var projectTemplateController=require('../../controllers/ProjectTemplateController');
var impersonateController=require('../../controllers/ImpersonateController');
var ContractorController = require('../../controllers/ContractorController');



              // //***************** Common routes ****************//


router.post('/admin-login',CommonValidationMiddleware.admin_validate('verify_admin'),CommonValidationMiddleware.validation_return, AdminController.verifyAdmin);

router.post('/invite-to-consultant',CommonValidationMiddleware.admin_validate('invite_to_consultant'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, AdminController.inviteToConsultant);

router.get('/inviteconsultant-list',CommonValidationMiddleware.admin_validate('fetchuserlist'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken,AdminController.inviteConsultantList);

router.post('/cms',CommonValidationMiddleware.client_validate('cms_add'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.cmsAdd);

router.put('/upload-image-home-slider',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_slider),CommonValidationMiddleware.verifyToken,AdminController.imageUploadHomeSlider);

router.put('/image-home-slider-update',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_slider),CommonValidationMiddleware.verifyToken,AdminController.imageUploadHomeSliderUpdate);

router.post('/upload-video-home-slider',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_slider),CommonValidationMiddleware.verifyToken,AdminController.videoUploadHomeSlider);

router.put('/forget-password',CommonValidationMiddleware.admin_validate('forget_password'),CommonValidationMiddleware.validation_return, AdminController.forgetPassword);

router.put('/reset-password', CommonValidationMiddleware.admin_validate('resetPassword'),CommonValidationMiddleware.validation_return, AdminController.resetPassword);

//********************* consultation hub *********************//

router.get('/consultation-hub',ConsultenthubController.fetchConsultantHub); 


router.get('/consultation-hub-frontend', CommonValidationMiddleware.general_validation('consultanthublist'),CommonValidationMiddleware.validation_return, ConsultenthubController.fetchConsultantHubFrontend);

router.post('/consultation-hub',CommonValidationMiddleware.verifyToken,CommonValidationMiddleware.general_validation('consultanthubdetails'),CommonValidationMiddleware.validation_return, ConsultenthubController.fetchConsultantFormDetails); 

router.put('/consultion-hub-change-status',CommonValidationMiddleware.verifyToken,ConsultenthubController.changeStatus)

router.put('/update-admin-consultant-profile',CommonValidationMiddleware.verifyToken,AdminConsultantController.updateAdminConsultant);

router.put('/update-company-logo',fileUploadMiddleware.uploadFiles([{name: 'company_logo', maxCount: 1}], global.constants.uploads.profile_photo),CommonValidationMiddleware.verifyToken,AdminConsultantController.updateCompanyLogo);


router.post('/pervious-projects',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}], global.constants.uploads.project_images),CommonValidationMiddleware.verifyToken,AdminConsultantController.perviousImages);


router.put('/project-image-status',CommonValidationMiddleware.verifyToken,AdminConsultantController.imagesStatusUpdate)


//********************* askme  *********************//

router.post('/askme-from',CommonValidationMiddleware.admin_validate('ask_me_from'),CommonValidationMiddleware.validation_return,AdminController.askMeFrom);

router.get('/ask-me',CommonValidationMiddleware.verifyToken,AdminController.showAskMe);

router.post('/ask-me',CommonValidationMiddleware.admin_validate('showAskmeId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.showAskMeId)

//********************* user management  *********************//

/*router.post('/users',CommonValidationMiddleware.admin_validate('fetchuserlist'),CommonValidationMiddleware.validation_return, UserController.fetchUserList);

router.post('/users',CommonValidationMiddleware.admin_validate('getuserdetails'),CommonValidationMiddleware.validation_return, UserController.userDetails);*/
router.post('/fetch-user-list',CommonValidationMiddleware.admin_validate('fetchuserlist'),CommonValidationMiddleware.validation_return, UserController.fetchUserList);

router.post('/get-user-details',CommonValidationMiddleware.admin_validate('getuserdetails'),CommonValidationMiddleware.validation_return,UserController.userDetails);

router.post('/update-user-status',CommonValidationMiddleware.admin_validate('updateuserstatus'),CommonValidationMiddleware.validation_return, UserController.userStatusChange);

router.get('/user-project-details',CommonValidationMiddleware.verifyToken, UserController.projectDetails);
//********************* cms management  *********************//

router.put('/cms',CommonValidationMiddleware.verifyToken,AdminController.editCms);

router.post('/cms',CommonValidationMiddleware.verifyToken,AdminController.fetchCms);

router.get('/cms-grid',CommonValidationMiddleware.cms_grid('fetchCmsGrid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.fetchCmsGrid);

router.post('/cms-grid',CommonValidationMiddleware.cms_grid('createCmsGrid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.addCmsGrid);

router.put('/cms-grid',CommonValidationMiddleware.cms_grid('updateCmsGrid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.updateCmsGrid);

router.delete('/cms-grid',CommonValidationMiddleware.cms_grid('deleteCmsGrid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.deleteCmsGrid);

router.get('/cms-grid-details',CommonValidationMiddleware.cms_grid('fetchCmsGridDetails'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.fetchCmsGridDetails);

router.put('/article-approve-status',CommonValidationMiddleware.verifyToken,AdminController.activrarticle);

router.post('/article',CommonValidationMiddleware.admin_validate('articleCreation'),CommonValidationMiddleware.validation_return,AdminController.addArtical);

router.get('/articles',AdminController.viewarticle);

router.get('/article-details',AdminController.viewArticleDetails);
router.put('/article-details',CommonValidationMiddleware.verifyToken,AdminController.updateArticle);
router.post('/article_image',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.article_photo),AdminController.uploadArticleImage);


//router.put('/article-details',CommonValidationMiddleware.verifyToken,AdminController.updateArticleDetails);

router.post('/article-topic',CommonValidationMiddleware.admin_validate('articleTopicCreation'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.addArticleTopic);

router.put('/article-topic',CommonValidationMiddleware.admin_validate('articleTopicUpdate'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.UpdateArticleTopic);

router.put('/article-topic-change-status',CommonValidationMiddleware.admin_validate('articleTopicChangeStatus'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.changeStatusArticleTopic);

router.get('/article-topics',CommonValidationMiddleware.admin_validate('articleTopicFetch'),CommonValidationMiddleware.validation_return,AdminController.listArticleTopic);

router.get('/article-topic-details',CommonValidationMiddleware.admin_validate('articleTopicDetailsFetch'),CommonValidationMiddleware.validation_return,AdminController.ArticleTopicDetails);

router.get('/article-topic-user',CommonValidationMiddleware.admin_validate('articleTopicFetch'),CommonValidationMiddleware.validation_return,AdminController.listUserArticleTopic);

router.post('/invite-articles',CommonValidationMiddleware.admin_validate('inviteArticle'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.inviteArticle);

router.get('/topics',CommonValidationMiddleware.admin_validate('getTopicsToInvite'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.getTopicsToInvite)

//********************* cms management  *********************//
router.get('/images',CommonValidationMiddleware.verifyToken,AdminController.showImage);

router.post('/images',CommonValidationMiddleware.admin_validate('show_image_id'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.viewImageDetails);

router.put('/upload-image-home-partner',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_partner),CommonValidationMiddleware.verifyToken,AdminController.updateImage)

router.post('/upload-image-home-partner',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_partner),CommonValidationMiddleware.verifyToken,AdminController.createImage)

router.put('/image-change-status',CommonValidationMiddleware.admin_validate('updateimagestatus'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.imageStatusChange)

router.put('/change-image-visibility',CommonValidationMiddleware.admin_validate('updateimagevisibility'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.imageVisibilityChange)

// router.post('/upload-image-our-story',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.cms_content))
router.post('/upload-image-our-story',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.cms_content), AdminController.uploadImageOurStory)

router.put('/slider-description',CommonValidationMiddleware.admin_validate('sliderDescriptionCreate'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.sliderDescriptionCreate)

//router.get('/fetch-project-scope', UserController.projectScope);


//********************* sitesettings management  *********************//


router.get('/sitesettings',CommonValidationMiddleware.verifyToken,AdminController.siteSettings)

router.put('/sitesettings',CommonValidationMiddleware.verifyToken,AdminController.updateSiteSettings)


//********************* Project Management  *********************//

router.post('/project-doc',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.project_docs),ProjectController.uploadProjectDoc);

router.put('/project', CommonValidationMiddleware.verifyToken, ProjectController.updateProject);

//********************* Project Scope Management  *********************//

router.post('/project-scope',CommonValidationMiddleware.admin_project_scope('createProjectScope'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.createProjectScope)

router.put('/project-scope-details',CommonValidationMiddleware.admin_project_scope('updateProjectScope'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.updateProjectScope)

router.get('/project-scope',CommonValidationMiddleware.admin_project_scope('fetchProjectScope'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectScope)

router.get('/project-scope-details',CommonValidationMiddleware.admin_project_scope('fetchProjectScopeDetails'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectScopeDetails)

router.delete('/project-scope',CommonValidationMiddleware.admin_project_scope('deleteProjectScope'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.deleteProjectScope)

router.get('/project-listsort',ProjectController.projectFetchAdmin);

//********************* Project stage and task Management  *********************//


router.post('/project-stage',CommonValidationMiddleware.admin_project_stage('createProjectStage'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.createProjectStage)

router.put('/project-task',CommonValidationMiddleware.admin_project_stage('createOrUpdateProjectStage'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.createProjectTasks)

router.post('/project-reject',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectClosed);
router.put('/project-status-change',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,ProjectController.projectApproveOrDisapprove);

router.post('/project-details',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectDetailsTaskStage);

router.get('/project-template',CommonValidationMiddleware.verifyToken,ProjectController.projectTemplateList);

router.post('/project-template',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectTemplateFetch);

router.get('/project-details',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectDetails);

router.get('/project',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.projectClientConsultant);

router.put('/stage-status',CommonValidationMiddleware.verifyToken,AdminController.stageDelete);

//router.get('/contractor-project-data',ProjectController.contractotrProject);

router.get('/project-list',CommonValidationMiddleware.verifyToken,ProjectController.listProject);

router.put('/update-stage',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,ProjectController.updateStage);

//router.get('/fetch-project-contractor',ProjectController.contractorDetails)

router.get('/stage',CommonValidationMiddleware.verifyToken,ProjectController.stageListing);

router.post('/stage',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectTask);


router.post('/add-template',CommonValidationMiddleware.verifyToken,ProjectController.projectTemplate);


router.post('/import-stage',CommonValidationMiddleware.admin_validate('importTemplate'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.importStage);

//********************* Website Language Management  *********************//

router.post('/language',CommonValidationMiddleware.admin_validate('addLanguage'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken, AdminController.addLanguage);

router.put('/language',CommonValidationMiddleware.admin_validate('editLanguage'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken, AdminController.editLanguage);

router.get('/language',CommonValidationMiddleware.admin_validate('languages'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken, AdminController.languages);

router.get('/language-details',CommonValidationMiddleware.admin_validate('languageDetails'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken, AdminController.languageDetails);

router.put('/reject',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.deactivateConsultant);

router.put('/approved',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.activeContractor);

router.put('/approved-edit',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.activeContractorEdit);

router.post('/slider-image',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_partner),CommonValidationMiddleware.verifyToken,AdminController.videoUploadHomeSliderImage);


router.put('/slider-image-upload',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.home_partner),CommonValidationMiddleware.verifyToken,AdminController.updateHomeSliderImage);


router.get('/section-scope',CommonValidationMiddleware.verifyToken,ProjectController.scopeCatagoryFetch);

router.get('/master-scope',CommonValidationMiddleware.verifyToken,ProjectController.masterCatagoryFetch);

router.post('/scope-map',CommonValidationMiddleware.admin_validate('catagoryMap'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.sectionCatagoryMap);

router.get('/scope',CommonValidationMiddleware.verifyToken,ProjectController.sectionScope);

router.get('/scope-map',CommonValidationMiddleware.verifyToken,ProjectController.masterMapFetch);

router.post('/scope-map-data',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.masterMapDetails);

// router.put('/project',ProjectController.editProjectAdmin);
router.put('/project',ProjectController.updateProject);

//********************* template Management  *********************//

router.put('/project-template-delete',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateDelete);

router.get('/project-template-list',CommonValidationMiddleware.verifyToken,projectTemplateController.templateShow);

router.post('/project-template-view',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateShowById);

router.post('/template-stage',CommonValidationMiddleware.admin_project_stage('createProjectStageTemplate'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateStageAdd);

router.post('/template-task',CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskAdd);

router.put('/template-stage',CommonValidationMiddleware.verifyToken,projectTemplateController.templateStageUpdate);

router.put('/template-stage-delete',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateStageDelete);


router.put('/template-task-delete',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskDeleteData);

router.post('/template-add',CommonValidationMiddleware.admin_validate('nameadd'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateAdd);

router.get('/template-task-list',CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskShow);

router.post('/template-task-add',CommonValidationMiddleware.admin_validate('nameadd'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskAddData);

router.get('/template-task-view',CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskListShow);

router.put('/project-template-task-delete',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskDelete);

router.post('/project-template-task-add',CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskDataAdd);

router.put('/task-template-delete',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.taskDelete);

router.get('/template-task-id',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,projectTemplateController.taskTempleShowId);

router.get('/template-task-dropdown',CommonValidationMiddleware.verifyToken,projectTemplateController.templateTaskShowDropdown);

//********************* Impersonate  *********************//


router.post('/impersonate',CommonValidationMiddleware.admin_validate('impersonate'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,impersonateController.validationEntry);

router.post('/impersonate-login',CommonValidationMiddleware.admin_validate('validationhash'),CommonValidationMiddleware.validation_return,impersonateController.login);

//*********************  project docs  *********************//

router.post('/project-doc-upload',CommonValidationMiddleware.verifyToken,AdminController.uploadDocFromAdmin);

router.put('/project-doc-delete',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.projectDocumentDelete);

router.post('/project-tags-edit',CommonValidationMiddleware.verifyToken,AdminController.editTags);



/********************* contract pdf  *********************/

router.get('/contract-pdf',CommonValidationMiddleware.verifyToken,ProjectController.contractSignPdf);


/********************* project bid  *********************/

router.get('/project-bid',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.projectBid);





router.put('/contractor',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.contractor_profile_photo),ContractorController.editContractorData);

/********************* import  *********************/
router.post('/import-task',CommonValidationMiddleware.admin_validate('import'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.importTask);

router.post('/import-task-templte',CommonValidationMiddleware.admin_validate('import'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.importTaskTemplate);


router.get('/contractor-demo',CommonValidationMiddleware.admin_validate('templateId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.contractorDemoShow);

/********************* contractor profile pdf *********************/

router.post('/contractor-pdf',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,AdminController.ContractorProfile);

router.post('/scope',CommonValidationMiddleware.verifyToken,AdminController.editScope);

router.post('/email',ProjectController.emailList);

router.get('/client-list',CommonValidationMiddleware.verifyToken,AdminController.clientList);
router.get('/contractor-list',CommonValidationMiddleware.verifyToken,AdminController.contractorList);
router.get('/consultant-list',CommonValidationMiddleware.verifyToken,AdminController.consultantList);
router.post('/note',AdminController.addNotes);

/********************* project lists  *********************/
router.get('/draft-project',CommonValidationMiddleware.verifyToken,AdminController.draftProjects); 
router.get('/peding-projects',CommonValidationMiddleware.verifyToken,AdminController.adminapprovedProjects);
router.get('/submitted-projects',CommonValidationMiddleware.verifyToken,AdminController.submittedProjects);
router.get('/signed-projects',CommonValidationMiddleware.verifyToken,AdminController.signedProjects);




module.exports = router;