const express = require('express'),
  router = express.Router(),
  { check, validationResult } = require('express-validator/check')
  var ContractorController = require('../../controllers/ContractorController');
  var ProjectController = require('../../controllers/ProjectController');
  var CommonController = require('../../controllers/CommonController');
  var fileUploadMiddleware = require('../../middlewares/fileUpload');
var CommonValidationMiddleware = require('../../middlewares/CommonValidationMiddleware'); 





                                     //User Locations

router.post('/add-contractor',ContractorController.addContractor);

router.post('/upload-cr-certificate',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.upload_cr_certificate),ContractorController.uploadCrCertificate);

router.post('/upload-owners-national-id',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads. upload_owners_national_id),ContractorController.uploadOwnersNationalId);

router.post('/upload-man-powers',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.upload_manpowers_report),ContractorController.uploadManPowersReport)

router.post('/upload-company-profile',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.company_profile),ContractorController.companyProfile)

router.post('/upload-other-documents',fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.other_files),ContractorController.otherFile)

router.get('/contractor-data',ContractorController.fetchDataUser );

router.get('/project-details',CommonValidationMiddleware.contractor_validate('fetchProject'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ContractorController.fetchProject);

router.post('/project-bids',CommonValidationMiddleware.project_validate('bid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.createProjectBids);

router.get('/project-zip',CommonValidationMiddleware.verifyToken,ProjectController.fetchProjectDoc);

router.put('/project-bids',CommonValidationMiddleware.project_validate('createBid'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken, ProjectController.updateBids);

router.get('/project-listing',CommonValidationMiddleware.verifyToken,ProjectController.contractorProjectListing);



router.get('/project-tender',CommonValidationMiddleware.verifyToken,ProjectController.contractorTenderData);


router.get('/version-list',CommonValidationMiddleware.verifyToken,ProjectController.versionListing);

router.get('/notifications',CommonValidationMiddleware.verifyToken,ProjectController.notificationsListing);


router.put('/notifications',CommonValidationMiddleware.admin_validate('uniqueId'),CommonValidationMiddleware.validation_return,CommonValidationMiddleware.verifyToken,ProjectController.notificationUpdate);


router.post('/bank',CommonValidationMiddleware.verifyToken,ContractorController.bankData);


router.put('/contractor',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.contractor_profile_photo),ContractorController.editContractorDataFlow);


router.get('/my-projects',CommonValidationMiddleware.verifyToken,ContractorController.MyProjects)


router.get('/profile-photo-fetch',CommonValidationMiddleware.verifyToken,ContractorController.fetchPhoto);


router.post('/profile-photo',CommonValidationMiddleware.verifyToken,fileUploadMiddleware.uploadFiles([{name: 'upload', maxCount: 1}],global.constants.uploads.contractor_profile_photo),ContractorController.uploadProfilePhoto);


router.post('/base-image-upload',CommonValidationMiddleware.verifyToken,CommonController.baseImageUpload)

router.post('/email-check',CommonValidationMiddleware.verifyToken,ContractorController.emailExist);

module.exports = router;