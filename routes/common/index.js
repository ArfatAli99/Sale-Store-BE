const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator/check')

var AccountController = require('../../controllers/AccountController');
var AdminController = require('../../controllers/AdminController');
var AdminConsultantController = require('../../controllers/AdminConsultantController');
var CommonController = require('../../controllers/CommonController');
var ConsultenthubController = require('../../controllers/ConsultenthubController');
var fileUploadMiddleware = require('../../middlewares/fileUpload');
var CommonValidationMiddleware = require('../../middlewares/CommonValidationMiddleware');
var ConsultantController = require('../../controllers/ConsultantController.js');
var ProjectController = require('../../controllers/ProjectController.js');
var ContractorController = require('../../controllers/ContractorController');
var impersonateController=require('../../controllers/ImpersonateController');


              // //***************** Common routes ****************//

router.post('/client-and-consultant-sign-up', fileUploadMiddleware.uploadFiles([{name: 'profile_image', maxCount: 1}], global.constants.uploads.profile_photo), CommonController.client_and_consultant_sign_up);

router.post('/generate-otp', CommonValidationMiddleware.phone_validate('generateOtp'),CommonValidationMiddleware.validation_return, CommonController.generateOtp);

router.post('/verify-otp', CommonValidationMiddleware.phone_validate('verify_otp'),CommonValidationMiddleware.validation_return, CommonController.verify_otp);

router.get('/account-activation-email-link-details', CommonValidationMiddleware.email_validate('detailsOfAccountActivationEmailLink'),CommonValidationMiddleware.validation_return, CommonController.detailsOfAccountActivationEmailLink);

router.get('/verify-email-consultant',CommonController.verifyLink); 

router.get('/verify-email-client',CommonController.verifyLink); 

// router.post('/login', CommonValidationMiddleware.user_validate('login'), CommonController.login);
router.post('/login', CommonController.login);

router.put('/user-forget-password', CommonValidationMiddleware.user_validate('user_forget_password'),CommonValidationMiddleware.validation_return, CommonController.userForgetPassword);

router.get('/details-of-forget-password-link', CommonValidationMiddleware.user_validate('getDetailsOfForgetPasswordLink'),CommonValidationMiddleware.validation_return, CommonController.getDetailsOfForgetPasswordLink);

router.put('/reset-password', CommonValidationMiddleware.user_validate('resetPassword'),CommonValidationMiddleware.validation_return, CommonController.resetPassword);

router.put('/log-out', CommonValidationMiddleware.user_validate('logOut'),CommonValidationMiddleware.validation_return, CommonValidationMiddleware.verifyToken, CommonController.logOut);

router.post('/ask-me',CommonValidationMiddleware.admin_validate('ask_me_from'),CommonValidationMiddleware.validation_return,AdminController.askMeFrom);

router.post('/verify-token', CommonValidationMiddleware.verifyToken);

router.get('/articles',CommonController.viewArticle)

router.put('/article',CommonValidationMiddleware.admin_validate('articleupdation'),CommonValidationMiddleware.validation_return,CommonController.updateArtical);

router.post('/cms-page',CommonValidationMiddleware.general_validation('cmscheck'),CommonValidationMiddleware.validation_return, CommonController.get_cms_page);

router.get('/cms-grid',CommonController.fetchCmsGrid);

router.post('/info-data', CommonController.get_info_data);

router.get('/consultation-hub', CommonValidationMiddleware.general_validation('consultanthublist'),CommonValidationMiddleware.validation_return, ConsultenthubController.fetchConsultantHubFrontend); 

router.post('/consultation-hub',CommonValidationMiddleware.general_validation('consultanthubdetails'),CommonValidationMiddleware.validation_return, ConsultenthubController.fetchConsultantFormDetails); 








// router.get('/images',CommonValidationMiddleware.verifyPublicToken, CommonController.showImage);
router.get('/images', CommonController.showImage);

              // //***************** Admin Consultant routes ****************//


router.post('/verify-email-link_of-admin-consultant', CommonValidationMiddleware.admin_consultant_validate('verify_email_link_of_admin_consultant'),CommonValidationMiddleware.validation_return, AdminConsultantController.verify_email_link_of_admin_consultant);

// router.post('/register', CommonValidationMiddleware.admin_consultant_validate('verify_email_link_of_admin_consultant'),CommonValidationMiddleware.validation_return, AdminConsultantController.register);

router.post('/admin-consultant-register',fileUploadMiddleware.uploadFiles([{name: 'company_logo', maxCount: 1}], global.constants.uploads.profile_photo), AdminConsultantController.adminConsultantRegister);

router.get('/details-of-article-invitation-link',CommonValidationMiddleware.admin_consultant_validate('getDetailsOfArticleInvitationLink'),CommonValidationMiddleware.validation_return, AdminConsultantController.getDetailsOfArticleInvitationLink);

router.post('/upload-company-engineer-profile-picture',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.company_engineer_profile_photo),AdminConsultantController.uploadCompnayEngineerProfilePicture);

router.post('/upload-company-engineer-cv',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.company_engineer_cv),AdminConsultantController.uploadCompnayEngineerCv);

router.post('/upload-admin-consultant-project',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 60}],global.constants.uploads.project_images),AdminConsultantController.uploadAdminConsultantProjectImages);

router.post('/test-email', CommonController.test_email);

//router.get('/test', CommonController.test);

router.get('/downolad-project-drawing-zip', ProjectController.downloadProjectDrawingZip);

router.get('/download-program-work-pdf',CommonValidationMiddleware.user_validate('downloadProgramOfWorksPdf'),CommonValidationMiddleware.validation_return,ProjectController.downloadProgramOfWorksPdf);

router.get('/download-project-contract-pdf',CommonValidationMiddleware.user_validate('downloadProjectContractPdf'),CommonValidationMiddleware.validation_return, ProjectController.downloadProjectContractPdf);

router.get('/project-contract-details',CommonValidationMiddleware.contract_validate('getProjectContractDetails'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.getProjectContractDetails);

router.post('/tender-submit',CommonValidationMiddleware.contract_validate('submitProjectTender'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.submitProjectTender);

// router.post('/upload-image-in-server',fileUploadMiddleware.uploadFiles([{name: 'image', maxCount: 1}],global.constants.uploads.website_images),CommonController.image_upload)

router.get('/project-data-search',CommonValidationMiddleware.project_validate('searchProjectData'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.searchProjectData);

router.post('/email-test',CommonController.emailTest)


router.get('/user',CommonValidationMiddleware.verifyToken,CommonController.fetchUser)

router.post('/email-verification',CommonValidationMiddleware.verifyToken,CommonController.emailVerify)


router.put('/update',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.client_profile_photo),CommonController.editClientProfile)


router.put('/consultant-profile',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.consultant_profile_photo),CommonController.editConsultantProfile);


router.get('/language',CommonValidationMiddleware.general_validation('languages'),CommonValidationMiddleware.validation_return, CommonController.languagePageWise);


router.get('/profile-photo-fetch',CommonValidationMiddleware.verifyToken,ContractorController.fetchPhoto);


router.post('/impersonate-login',CommonValidationMiddleware.admin_validate('validationhash'),CommonValidationMiddleware.validation_return,impersonateController.login);

router.put('/mail-verification',CommonValidationMiddleware.admin_validate('validationhashEmail'),CommonValidationMiddleware.validation_return,CommonController.verifyemailLink);

router.get('/services',AdminConsultantController.fetchServices);

router.post('/client',CommonController.clientExistanceCheck);
module.exports = router;