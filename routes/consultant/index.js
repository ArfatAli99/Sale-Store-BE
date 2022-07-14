const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator/check')

var ConsultantController = require('../../controllers/ConsultantController.js');
var CommonValidationMiddleware = require('../../middlewares/CommonValidationMiddleware');
var ProjectController = require('../../controllers/ProjectController');
var CommonController = require('../../controllers/CommonController');
var fileUploadMiddleware = require('../../middlewares/fileUpload');


// //***************************** User routes ******************************************//

                                     //User Locations

// router.post('/get-user-locations',UserValidationMiddleware.verifyToken, commonController.get_user_locations)

router.post('/project',CommonValidationMiddleware.verifyToken,ProjectController.createProject);

router.put('/project',CommonValidationMiddleware.verifyToken,ProjectController.updateProject);

router.get('/verify-email-consultant',CommonValidationMiddleware.verifyToken,ConsultantController.verifyLink); 


router.get('/project-details',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.projectDetailsForclient);

router.post('/consultant-invite-client',CommonValidationMiddleware.user_validate('consultant_invite_client'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ConsultantController.consultant_invite_client)

router.get('/consultant-invite-client-link',CommonValidationMiddleware.user_validate('detailsOfConsultantInviteClientLink'),CommonValidationMiddleware.validation_return, ConsultantController.detailsOfConsultantInviteClientLink)

router.get('/project-listing',CommonValidationMiddleware.verifyToken,ProjectController.consultentProjectListing)

router.get('/scope-pdf',CommonValidationMiddleware.admin_validate('projectId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.projectScopePdf);

router.get('/notifications',CommonValidationMiddleware.verifyToken,ProjectController.notificationsListing);

router.put('/notifications',ProjectController.notificationUpdate);

router.get('/consultant-details',CommonValidationMiddleware.verifyToken,CommonController.fetchConsultant)


router.post('/profile-photo',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.consultant_profile_photo),ConsultantController.consultantProfilePhoto);

router.put('/profile-photo',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.consultant_profile_photo),ConsultantController.consultantProfilePhotoUpdate);

router.post('/consultant',ConsultantController.consulantProfileAdd);
module.exports = router;