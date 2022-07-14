const Q = require('q'),
  _ = require('lodash'),
  moment = require('moment'),
  jwt = require('jsonwebtoken')

const { check ,validationResult } = require('express-validator/check');
//const Sequelize = require(global.appPath + '/app/config/database')
//const sequelize = require('../config/database').sequelize;
const sequelize = require('../config/database').sequelize;

var DataTypes = require('sequelize/lib/data-types');
const  Refresh_token = require('../models/refresh_token')(sequelize, DataTypes);

var GenericRepository = require('.././repositories/GenericRepository');
var commonFunction = require('.././helper/commonFunction');

module.exports.validation_return = (req, res, next) => {

   const errors = validationResult(req)
    console.error('Validation :', errors)
    if (!errors.isEmpty()) {
      return res.json({
        status : 422,
        msg: 'Validation failed',
        message: 'Validation failed',
        data: errors.array()
      })
    }else{
      next();
    }

}


module.exports.client_validate = (method) => {

switch (method) {
    case 'fb_signup': {
      return [
        check('facebook_id').not().isEmpty(),
        check('full_name').not().isEmpty(),
        check('user_type').not().isEmpty(),



      ]; 
    };
    case 'google_plus_signup': {
      return [
        check('google_plus_id').not().isEmpty(),
        check('full_name').not().isEmpty(),
        check('user_type').not().isEmpty(),
      ]; 
    };
    case 'cms_add' : {
      return [
        check('name').not().isEmpty().withMessage('name is required'),
        check('slug').not().isEmpty().withMessage('slug is required')
      ]
    }
    case 'manualy_signup': {
      return [
        check('full_name').not().isEmpty(),
        check('email').not().isEmpty(),
        check('user_type').not().isEmpty(),
        check('phone').not().isEmpty(),
        check('password').exists().not().isEmpty()
      ]; 
    };

    case 'mail_required':{
      return[

        check('email').not().isEmpty().withMessage('email is required'),
      ]

    };
    case 'projectSignDetails' : {
      return [
        check('id').not().isEmpty().withMessage('id is required'),
      ]
    }
  }
};
module.exports.consultant_validate = (method) => {

  switch (method) {
      // case 'fb_signup': {
      //   return [
      //     check('facebook_id').not().isEmpty(),
      //     check('full_name').not().isEmpty(),
      //     check('user_type').not().isEmpty(),
  
  
  
      //   ]; 
      // };
      // case 'google_plus_signup': {
      //   return [
      //     check('google_plus_id').not().isEmpty(),
      //     check('full_name').not().isEmpty(),
      //     check('user_type').not().isEmpty(),
      //   ]; 
      // };
      case 'manualy_signup': {
        return [
          check('full_name').not().isEmpty(),
          check('email').not().isEmpty(),
          check('user_type').not().isEmpty(),
          check('phone').not().isEmpty(),
          check('password').not().isEmpty()
        ]; 
      };
    }
  };
  module.exports.phone_validate = (method) => {

    switch (method) {
        case 'generateOtp': {
          return [
            check('phone').not().isEmpty(),
            check('country_code').not().isEmpty(),
          ]; 
        };
      }
    switch (method) {
      case 'verify_otp': {
        return [
          check('phone').not().isEmpty(),
          check('country_code').not().isEmpty(),
          check('role').not().isEmpty(),
          check('otp').not().isEmpty(),
        ]; 
      };
    }
    };
  module.exports.email_validate = (method) => {

    switch (method) {
        case 'detailsOfAccountActivationEmailLink': {
          return [
            check('validation_hash').not().isEmpty()
          ]; 
        };
      }
    };
module.exports.admin_project_scope = (method) => {

  switch (method) {
        case 'createProjectScope': {
          return [
            check('scope_description').not().isEmpty(),
            check('type').not().isEmpty(),
            check('group_name').not().isEmpty(),
            check('scope_type').not().isEmpty()
          ]; 
        };

        case 'updateProjectScope': {
          return [
            check('scope_description').not().isEmpty(),
            check('type').not().isEmpty(),
            check('group_name').not().isEmpty(),
            check('scope_type').not().isEmpty(),
            check('id').not().isEmpty()
          ]; 
        };


        case 'fetchProjectScopeDetails': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'deleteProjectScope': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'fetchProjectScope': {
          return [
            check('limit').not().isEmpty(),
            check('page').not().isEmpty(),
          ]; 
        };
      }

}    
module.exports.admin_project_stage = (method) => {

  switch (method) {
        case 'createProjectStage': {
          return [
            check('project_id').not().isEmpty(),
            check('name').not().isEmpty(),
            check('description').not().isEmpty(),
            check('maximum_allowed_percentage').not().isEmpty(),
            check('status').not().isEmpty(),
            check('max_allow_pullback').not().isEmpty(),
           

          ]; 
        };

        case 'createProjectStageTemplate': {
          return [
            check('project_template_id').not().isEmpty(),
            check('name').not().isEmpty(),
            check('description').not().isEmpty(),
            check('maximum_allowed_percentage').not().isEmpty(),
            check('status').not().isEmpty(),
            check('max_allow_pullback').not().isEmpty(),
           

          ]; 
        };

        case 'createOrUpdateProjectStage': {
          return [
            check('data').not().isEmpty(),
          ]; 
        };


        case 'fetchProjectScopeDetails': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'deleteProjectScope': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'fetchProjectScope': {
          return [
            check('limit').not().isEmpty(),
            check('page').not().isEmpty(),
          ]; 
        };
      }

}    

module.exports.cms_grid = (method) => {

  switch (method) {
        case 'createCmsGrid': {
          return [
            check('type').not().isEmpty(),
            check('title').not().isEmpty(),
            check('image').not().isEmpty(),
            check('description').not().isEmpty(),
          ]; 
        };

        case 'updateCmsGrid': {
          return [
            check('id').not().isEmpty(),
            check('type').not().isEmpty(),
            check('title').not().isEmpty(),
            check('image').not().isEmpty(),
            check('description').not().isEmpty(),
          ]; 
        };


        case 'fetchCmsGridDetails': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'deleteCmsGrid': {
          return [
            check('id').not().isEmpty(),
          ]; 
        };

        case 'fetchCmsGrid': {
          return [
            check('limit').not().isEmpty(),
            check('offset').not().isEmpty(),
          ]; 
        };
      }

} 

module.exports.admin_validate = (method) => {

  switch (method) {
      case 'verify_admin': {
        return [
          check('email').not().isEmpty(),
          check('password').not().isEmpty()
        ]; 
      };
      case 'invite_to_consultant': {
        return [
          check('name').not().isEmpty(),
          check('email').not().isEmpty()
        ]; 
      };

      case 'ask_me_from' :{
        return[
          check('name').not().isEmpty().withMessage('name is required'),
          check('email').not().isEmpty().withMessage('email is required'),
          check('description').not().isEmpty().withMessage('description is required'),
          check('type').not().isEmpty().withMessage('type is required'),
          check('phone').not().isEmpty().withMessage('phone is required'),
          

          
        ]
      };

      case 'type' : {
        return[
          check('type').not().isEmpty().withMessage('type is required'),
        ]
      };

      case 'showAskmeId' :{
        return[
          check('id').not().isEmpty().withMessage('id is required')

        ]
      };

      case 'fetchuserlist' :{
        return[
          check('page').not().isEmpty().withMessage('page is required'),
          check('limit').not().isEmpty().withMessage('limit is required')

        ]
      };
      case 'forget_password': {
        return [
          check('email').not().isEmpty()
        ]; 
      };
      case 'resetPassword': {
        return [
          check('id').not().isEmpty(),
          check('uid').not().isEmpty(),
          check('password').not().isEmpty(),
        ]; 
      };


      case 'getuserdetails' :{
        return[
          check('user_id').not().isEmpty().withMessage('user_id is required')

        ]
      };


      case 'updateuserstatus' :{
        return[
          check('user_id').not().isEmpty().withMessage('user_id is required'),
          check('is_active').not().isEmpty().withMessage('is_active is required')

        ]
      };
      case 'inviteArticle' :{
        return[
          check('uid').not().isEmpty().withMessage('uid is required'),
          check('topic_id').not().isEmpty().withMessage('topic_id is required')

        ]
      };

      case 'articleCreation' :{
        return[
          check('writer').not().isEmpty().withMessage('writer is required'),
          check('writer_name').not().isEmpty().withMessage('writer_name is required'),
          check('data').not().isEmpty().withMessage('data is required'),
          check('title').not().isEmpty().withMessage('title is required'),
          check('is_draft').not().isEmpty().withMessage('draft is required'),
          check('id').not().isEmpty().withMessage('id is required')

        ]
      };

      case 'articleupdation' :{
        return[
          check('writer').not().isEmpty().withMessage('writer is required'),
          check('writer_name').not().isEmpty().withMessage('writer_name is required'),
          check('data').not().isEmpty().withMessage('data is required'),
          check('title').not().isEmpty().withMessage('title is required'),
          check('is_draft').not().isEmpty().withMessage('draft is required'),
          check('id').not().isEmpty().withMessage('id is required')

        ]
      };



      case 'articleTopicCreation' :{
        return[
          check('name').not().isEmpty().withMessage('name is required'),
          check('description').not().isEmpty().withMessage('description is required')

        ]
      };

      case 'articleTopicFetch' :{
        return[
          check('page').not().isEmpty().withMessage('page is required'),
          check('limit').not().isEmpty().withMessage('limit is required')

        ]
      };

      case 'articleTopicDetailsFetch' :{
        return[
          check('id').not().isEmpty().withMessage('id is required'),
          ]
      };

       case 'articleTopicUpdate' :{
        return[
          check('id').not().isEmpty().withMessage('id is required'),
          check('name').not().isEmpty().withMessage('name is required'),
          check('description').not().isEmpty().withMessage('description is required'),
          check('status').not().isEmpty().withMessage('status is required')

        ]
      };

        case 'articleTopicChangeStatus' :{
        return[
          check('status').not().isEmpty().withMessage('status is required'),

        ]
      };


      case 'articleTopicactive' :{
        return[
          check('status').not().isEmpty().withMessage('status is required'),

        ]
      };
      case 'getTopicsToInvite' :{
        return[
          check('uid').not().isEmpty().withMessage('uid is required')

        ]
      };

      case 'show_image_id':{
        return[
          check('id').not().isEmpty().withMessage('id is required')
        ]
      };
      case 'sliderDescriptionCreate': {
        return [
          check('id').not().isEmpty(),
          check('is_active').not().isEmpty(),
        ]; 
      };

      case 'updateimagestatus':{
        return[
          check('id').not().isEmpty().withMessage('id is required')
        ];
      };

    case 'updateimagevisibility':{
        return[
          check('id').not().isEmpty().withMessage('id is required'),
          check('is_visible_client').not().isEmpty().withMessage('is_visible_client is required')
        ];
      };


      case 'importTemplate' :{
        return[
          check('project_id').not().isEmpty().withMessage('project_id is required'),
          check('template_id').not().isEmpty().withMessage('template_id is required')

        ];
      };

      case 'projectId':{
        return[
          check('project_id').not().isEmpty().withMessage('project_id is required')
        ];
      };

      case 'projectContractorId':{
        return[
          check('project_id').not().isEmpty().withMessage('project_id is required'),
          check('contractor_id').not().isEmpty().withMessage('contractor_id is required')
        ]
      };

      case 'uniqueId':{
        return [
          check('id').not().isEmpty().withMessage('id is required')

        ]
      };
      case 'addLanguage':{
        return [
          check('field_key').not().isEmpty(),
          check('group_name').not().isEmpty(),
          check('arabic').not().isEmpty(),
          check('english').not().isEmpty(),
          check('is_active').not().isEmpty(),

        ]
      };
      case 'editLanguage':{
        return [
          check('id').not().isEmpty(),
          check('arabic').not().isEmpty(),
          check('english').not().isEmpty(),
          check('is_active').not().isEmpty(),

        ]
      };
      case 'languages':{
        return [
          check('limit').not().isEmpty(),
          check('page').not().isEmpty(),

        ]
      };
      case 'languageDetails':{
        return [
          check('id').not().isEmpty(),
        ]
      };

      case 'catagoryMap':{
        return [

          check('category_id').not().isEmpty().withMessage('category_id is required'),
          check('section_category_id').not().isEmpty().withMessage('section_category_id is required'),
          check('scope_id').not().isEmpty().withMessage('scope_id is required'),
          check('description').not().isEmpty().withMessage('description is required'),
          check('description_arabic').not().isEmpty().withMessage('description_arabic is required')


        ]
      };


      case 'templateId' :{
        return[
          check('id').not().isEmpty().withMessage('id is required')

        ]
      };

      case 'validationhash' :{
        return[
          check('validationhash').not().isEmpty().withMessage('validationhash is required')

        ]
      };

      case 'validationhashEmail' :{
        return[
          check('validation_hash').not().isEmpty().withMessage('validation_hash is required')

        ]
      };

      case 'impersonate' :{
        return[
          check('id').not().isEmpty().withMessage('id is required'),
          check('role').not().isEmpty().withMessage('role is required'),

        ]
      };


      case 'templateTakAdd':{
        return[
          check('data').not().isEmpty().withMessage('data  is required'),
        ]
      }

      case 'import':{
        return[
          check('stage_id').not().isEmpty().withMessage('stage_id is required'),
          check('task_id').not().isEmpty().withMessage('task_id is required'),

        ]
      }
      

      case 'nameadd':{
        return[
          check('name').not().isEmpty().withMessage('name is required'),
        ]
      }

      case 'noteadd':{
        return[
          check('notes_holder').not().isEmpty().withMessage('notes_holder is required'),
          check('project_id').not().isEmpty().withMessage('project_id is required'),
          check('callback_date').not().isEmpty().withMessage('callback_date is required'),
          check('color_tag').not().isEmpty().withMessage('color_tag is required'),
        ]
      }

    }
  };
module.exports.user_validate = (method) => {

  switch (method) {
      case 'login': {
        return [
          check('email').not().isEmpty(),
          check('password').not().isEmpty()
        ]; 
      };
      case 'user_forget_password': {
        return [
          check('email').not().isEmpty()
        ]; 
      };
      case 'logOut': {
        return [
          check('refreshToken').not().isEmpty()
        ]; 
      };
      case 'getDetailsOfForgetPasswordLink': {
        return [
          check('validation_hash').not().isEmpty()
        ]; 
      };
      case 'consultant_invite_client': {
        return [
          check('name').not().isEmpty(),
          check('email').not().isEmpty(),
          check('project_id').not().isEmpty()
        ]; 
      };
      case 'detailsOfConsultantInviteClientLink': {
        return [
          check('validation_hash').not().isEmpty()
        ]; 
      };
      case 'downloadProgramOfWorksPdf': {
        return [
          check('id').not().isEmpty()
        ]; 
      };
      case 'downloadProjectContractPdf': {
        return [
          check('id').not().isEmpty()
        ]; 
      };
      case 'resetPassword': {
        return [
          check('id').not().isEmpty(),
          check('uid').not().isEmpty(),
          check('user_type').not().isEmpty(),
          check('password').not().isEmpty(),
        ]; 
      };
    }
  };

  module.exports.contract_validate = (method) => {

    switch (method) {
      case 'submitProjectTender': {
        return [
          check('project_id').not().isEmpty(),
          check('days').not().isEmpty(),
          check('price').not().isEmpty(),
          check('contract_metas').not().isEmpty(),
        ]; 
      };
      case 'getProjectContractDetails': {
        return [
          check('project_id').not().isEmpty(),
        ]; 
      };

      case 'contract_pdf': {
        return [
          check('id').not().isEmpty(),
          check('project_id').not().isEmpty(),
        ]; 
      };
      }
    };
module.exports.admin_consultant_validate = (method) => {

  switch (method) {
      case 'verify_email_link_of_admin_consultant': {
        return [
          check('validation_hash').not().isEmpty()
        ]; 
      };
      case 'getDetailsOfArticleInvitationLink': {
        return [
          check('validation_hash').not().isEmpty()
        ]; 
      };
      case 'adminConsultantRegister': {
        return [
          check('company_name').not().isEmpty(),
          check('email').not().isEmpty(),
          check('phone').not().isEmpty()
        ]; 
      };
      case 'updateAdminConsultant': {
        return [
          check('company_engineers').not().isEmpty()
        ]; 
      };
    }
  };

  module.exports.contractor_validate = (method) => {

    switch (method) {
        case 'fetchProject': {
          return [
            check('id').not().isEmpty()
          ]; 
        };
      }
  };


  module.exports.general_validation = (method) => {

  switch (method) {
      case 'cmscheck': {
        return [
          check('slug').not().isEmpty()
        ]; 
      };

      case 'consultanthublist': {
        return [
          check('page').not().isEmpty(),
          check('limit').not().isEmpty()
        ]; 
      };

      case 'consultanthubdetails': {
         return [
          check('user_id').not().isEmpty()
        ]; 
      };
         case 'languages': {
         return [
          check('group_name').not().isEmpty()
        ]; 
      };
    }

  };
  module.exports.project_validate = (method) => {

    switch (method) {
          case 'deleteProjectProjectDocs': {
            return [
              check('id').not().isEmpty()
            ]; 
          };
          case 'searchProjectData': {
            return [
              check('project_id').not().isEmpty()
            ]; 
          };


          case 'createBid': {
            return [
              check('project_id').not().isEmpty(),
              check('contractor_id').not().isEmpty(),
              check('days').not().isEmpty(),
              check('price').not().isEmpty(),
              check('is_draft').not().isEmpty(),
              check('stage_estimates').not().isEmpty(),


            ]; 
          };

          case 'bid': {
            return [
              check('project_id').not().isEmpty(),
              check('contractor_id').not().isEmpty(),
              check('days').not().isEmpty(),
              check('price').not().isEmpty(),
              check('is_draft').not().isEmpty(),
              check('project_estimates').not().isEmpty(),


            ]; 
          };
        }
  
  }


/**createJWTToken function
purpose:Create JWT Token after user successfully login.
*/
module.exports.createJWTToken = (obj, callback) => {
  var deferred = Q.defer()
  // create a token
  jwt.sign(obj, global.constants.jwt.secret, global.constants.jwt.options,  (err, token) => {
    if (err) {
      deferred.reject(err)
    } else {
      deferred.resolve(token)
    }
  })

  deferred.promise.nodeify(callback)
  return deferred.promise
}

/**generateRefreshAndAccessToken function
purpose:Generate a refresh token if a JWT is expired.
*/
module.exports.generateRefreshAndAccessToken = (schemaName, id, customData, callback) => {
  const deferred = Q.defer()

  let condition = {}
  if (schemaName == 'user') {
    condition.id = id
  }
  else if (schemaName == 'admin') {
    condition.id = id
  }  
  sequelize.model(schemaName).findOne({
    where: condition
  }).then((user) => {
    if (_.isEmpty(user)) {
      deferred.reject('User is not found')
    } else {
      user = user.get({ plain: true })
      customData = customData || {}
      let dataToEncrypt = {};
      dataToEncrypt = Object.assign({}, {
        user_id: user.id,
        user_type:user.user_type,
        role: schemaName
      }, customData) 
      Promise.all([
        this.createJWTToken(dataToEncrypt),
        commonFunction.getRandomString(70)
      ]).then(([accessToken, refreshToken]) => {
        refreshToken = refreshToken + moment().format('x')
        let refreshTkn = {
          kind: schemaName,
          item: id,
          refreshToken: refreshToken,
          isExpire: 0
        }
        Promise.all([
          Refresh_token.create(refreshTkn)
        ]).then(([savedRefreshToken]) => {
          deferred.resolve({accessToken: accessToken, refreshToken: refreshToken})
        }).catch((err) => {
          deferred.reject(err)
        })
      }).catch((err) => {
        deferred.reject(err)
      })
    }
  }).catch((err) => {
    deferred.reject(err)
  })

  deferred.promise.nodeify(callback)
  return deferred.promise
}

/**verifyToken API
method:POST
input:header[x-access-token],
purpose:Middleware verification of logged in user and admin.
*/
module.exports.verifyToken = function(req, res, next){
  var accessToken = req.headers.authorization || req.headers['x-access-token'] || req.body['access-token']
  console.log('accessToken :', accessToken)

  var data = {};
  if (accessToken) {
    jwt.verify(accessToken, global.constants.jwt.secret, (err, decoded) => {
      if (err) {
        console.error('204 ERROR :', err)

        if (err.name == 'TokenExpiredError') {
          return res.json({
            last_login_more_than_aday:0,

            status: 403,

            msg: 'Access-token expired',
            message: 'Access-token expired'

          })
        } else {
          return res.json({
            status: 500,
            last_login_more_than_aday:0,
            msg: 'Something went wrong',
            message: 'Something went wrong',
            data: err
          })
        }
      } else {
        console.log('decoded Token :', decoded);
        if(decoded.role == 'user'){
          data.table = 'user';
        }
        else if(decoded.role == 'admin'){
          data.table = 'admin';
        }
        data.where = {
          id:decoded.user_id
        }
        GenericRepository.fetchData(data)
        .then((user) => {
          // console.log('#################### user ##################', user)
          if(data.table == 'user'){
            if (_.isEmpty(user)) {
              return res.json({
                status: 403,
                msg: 'User doesnot exists',
                message: 'User doesnot exists'

              })
            } 
            else if (user.is_active == 0) {
              return res.json({
                status: 403,
                msg: 'Account is not active. Please contact admin.',
                message: 'Account is not active. Please contact admin.'

              })
            }
            else if (user.is_delete == 1) {
              return res.json({
                status: 403,
                msg: 'Account is deleted.',
                message: 'Account is deleted.'

              })
            }
            else {
                  req.user_id = decoded.user_id
                  req.userdetails = user.rows[0].dataValues;
                  req.userdetails.role = decoded.role;
                  // return res.status(200).send({status:200, msg:'Middleware', data:req.userdetails});
                  next();
              }

          }
          else if(data.table == 'admin'){
            if (_.isEmpty(user)) {
              return res.json({
                status: 403,
                msg: 'User doesnot exists',
                message: 'User doesnot exists'

              })
            } 
            else if (user.is_active == 0) {
              return res.json({
                status: 403,
                msg: 'Account is not active. Please contact admin.',
                message: 'Account is not active. Please contact admin.'

              })
            }
            else if (user.is_delete == 0) {
              return res.json({
                status: 403,
                msg: 'Account is deleted.',
                message: 'Account is deleted.'

              })
            }
            else {
              req.user_id = decoded.user_id
              req.userdetails = user.rows[0].dataValues;
              req.userdetails.role = decoded.role;
              // return res.status(200).send({status:200, msg:'Middleware', data:req.userdetails});
              next();
            }
          }
          
        }).catch((err) => {
          console.error('263 ERROR :', err)

          return res.json({
            status: 500,
            msg: 'Something went wrong',
            message: 'Something went wrong'

          })
        })
      }
    })
  } else {
    return res.json({
      status: 403,
      msg: 'Please provide access-token',
      message: 'Please provide access-token'

    })
  }
}

module.exports.verifyPublicToken = function(req, res, next){
  var accessToken = req.headers.authorization || req.headers['x-access-token'] || req.body['access-token']
  // console.log('accessToken :', accessToken)
  var data = {};
  if (accessToken && accessToken.length > 0) {
    jwt.verify(accessToken, global.constants.jwt.secret, (err, decoded) => {
      if (err) {
        console.error('204 ERROR :', err)

        if (err.name == 'TokenExpiredError') {
          return res.json({
            last_login_more_than_aday:0,
            status: 200,
            msg: 'Access-token expired',
            message: 'Access-token expired'

          })
        } else {
          return res.json({
            status: 500,
            last_login_more_than_aday:0,
            msg: 'Something went wrong',
            message: 'Something went wrong',
            data: err
          })
        }
      } else {
        console.log('decoded Token :', decoded);
        if(decoded.role == 'user'){
          data.table = 'user';
        }
        else if(decoded.role == 'admin'){
          data.table = 'admin';
        }
        data.where = {
          id:decoded.user_id
        }
        GenericRepository.fetchData(data)
        .then((user) => {
          // console.log('#################### user ##################', user)
          if(data.table == 'user'){
            if (_.isEmpty(user)) {
              return res.json({
                status: 403,
                msg: 'User doesnot exists',
                message: 'User doesnot exists'

              })
            } 
            else if (user.is_active == 0) {
              return res.json({
                status: 403,
                msg: 'Account is not active. Please contact admin.',
                message: 'Account is not active. Please contact admin.'

              })
            }
            else if (user.is_delete == 1) {
              return res.json({
                status: 403,
                msg: 'Account is deleted.',
                message: 'Account is deleted.'

              })
            }
            else {
                  req.user_id = decoded.user_id
                  req.userdetails = user.rows[0].dataValues;
                  req.userdetails.role = decoded.role;
                  // return res.status(200).send({status:200, msg:'Middleware', data:req.userdetails});
                  next();
              }

          }
          else if(data.table == 'admin'){
            if (_.isEmpty(user)) {
              return res.json({
                status: 403,
                msg: 'User doesnot exists',
                message: 'User doesnot exists'

              })
            } 
            else if (user.is_active == 0) {
              return res.json({
                status: 403,
                msg: 'Account is not active. Please contact admin.',
                message: 'Account is not active. Please contact admin.'

              })
            }
            else if (user.is_delete == 0) {
              return res.json({
                status: 403,
                msg: 'Account is deleted.',
                message: 'Account is deleted.'

              })
            }
            else {
              req.user_id = decoded.user_id
              req.userdetails = user.rows[0].dataValues;
              req.userdetails.role = decoded.role;
              // return res.status(200).send({status:200, msg:'Middleware', data:req.userdetails});
              next();
            }
          }
          
        }).catch((err) => {
          console.error('263 ERROR :', err)

          return res.json({
            status: 500,
            msg: 'Something went wrong',
            message: 'Something went wrong'

          })
        })
      }
    })
  } else {
    console.log('**************** with out token ******************')
    req.user_id = -1;
    next();
    // return res.json({
    //   status: 2,
    //   msg: 'Please provide access-token'
    // })
  }
}


