const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator/check')


//var UserValidationMiddleware = require('../../middlewares/UserValidationMiddleware');
//const consultenthubcontroller=require('../../controllers/consultenthub');
//const admincontroller=require('../../controllers/AdminController');

var ClientController = require('../../controllers/ClientController');
var ProjectController = require('../../controllers/ProjectController');
var UserController = require('../../controllers/UserController');
var NotificationsController=require('../../controllers/NotificationsController');
var CommonController = require('../../controllers/CommonController');
var CommonValidationMiddleware = require('../../middlewares/CommonValidationMiddleware');
var AdminController = require('../../controllers/AdminController'); 
var fileUploadMiddleware = require('../../middlewares/fileUpload');

router.post('/client-invite-consultent',CommonValidationMiddleware.client_validate('mail_required'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ClientController.inviteConsultent);

router.get('/verify-email-client',CommonValidationMiddleware.verifyToken,ClientController.verifyLink); 

router.post('/project', CommonValidationMiddleware.verifyToken, ProjectController.createProject);

router.put('/project', CommonValidationMiddleware.verifyToken, ProjectController.updateProject);

router.post('/project-doc',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.project_docs),ProjectController.uploadProjectDoc);


router.put('/remove-project-doc',CommonValidationMiddleware.project_validate('deleteProjectProjectDocs'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.deleteProjectProjectDocs);

router.get('/project-scope',CommonValidationMiddleware.verifyToken, UserController.projectScope);

router.get('/project',CommonValidationMiddleware.verifyToken,ProjectController.projectListingSearching);

router.get('/project-zip',CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectDoc);

router.get('/project-details',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return, ProjectController.projectDetailsForclient);

router.get('/project-contractor',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,ProjectController.contractorDetails)

router.get('/project-tender-data',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.contractotrProject);

router.get('/project-tender-data-view',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectContractor);

router.get('/scope-pdf',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectScopePdf);

router.get('/project-sign-details',CommonValidationMiddleware.client_validate('projectSignDetails'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.projectSignDetails);

router.get('/payment-pdf',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.modeOfPayment);



router.put('/sign-update',CommonValidationMiddleware.verifyToken,ProjectController.signUpdate);




router.post('/sign',CommonValidationMiddleware.verifyToken,ProjectController.ProjectSignUpdate)

router.put('/project-reject',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectBidsReject);


router.get('/version-list',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.versionListing);

router.get('/notifications',CommonValidationMiddleware.verifyToken,NotificationsController.notificationsListing);

router.put('/notifications',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,NotificationsController.notificationUpdate);

router.post('/profile-photo',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.client_profile_photo),ClientController.profilePhoto);

router.put('/notifications-statuschage',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,NotificationsController.notifictionsDelete);

router.get('/cover-page',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.clientTenderingCoverPage);

router.get('/contract-pdf',CommonValidationMiddleware.contract_validate('contract_pdf'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.contractSignPdf);



router.put('/request-contact',CommonValidationMiddleware.admin_validate('projectContractorId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.requestContact);

router.post('/signature',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.clientSign);

router.get('/task-details',CommonValidationMiddleware.verifyToken,ProjectController.taskCount)

router.post('/base-image-upload',CommonValidationMiddleware.verifyToken,CommonController.baseImageUpload)


router.get('/sign-finall',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.signMailSent);

router.get('/scope-pdf-demo',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectScopePdfImage);

router.get('/specifications',CommonValidationMiddleware.verifyToken,ProjectController.specifiactionsView);


router.post('/contractor-pdf',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,AdminController.ContractorProfile);


router.post('/view-bid',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.viewPdfDemo);

router.get('/scope',AdminController.scopeList);

router.post('/email-update',ProjectController.mailCheckForCreateProject);


router.get('/random-string',ClientController.getRandomString);

module.exports = router;