const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms = require('../models/cms');
const commonFunnction = require('../helper/commonFunction');
const moment = require('moment');
const sequelize = require('../config/database').sequelize;

var Admincontroller = {};

/**verify_admin API
method:POST
input:body[email, password],
output:data,
purpose:To login for admin.
*/

/**
 * @swagger
 * /api/admin/admin-login:
 *  post:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: admin login details for login a admin
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            email:
 *              type: string
 *              example: enjamamul.unified@gmail.com
 *            password:
 *              type: string
 *              example: sahil354
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
Admincontroller.verifyAdmin = (req, res, next) => {
  // var passcode = md5(req.body.password+process.env.ADMINSALT);
  var passcode = md5(req.body.password);
  let data = {};
  data.table = 'admin';
  console.log(req.body.email, passcode);
  data.where = {};
  data.where.email = req.body.email;
  data.where.password = passcode;
  data.where.is_active = 1;
  data.where.is_delete = 0;
  console.log(data);
  return GenericRepository.fetchData(data).then((user) => {
    if (user.count > 0) {
      CommonValidationMiddleware.generateRefreshAndAccessToken(data.table, user.rows[0].id).then((token) => {
        let data = {};
        data.access_token = token.accessToken
        data.refresh_token = token.refreshToken
        data.role = 'admin'
        res.json({
          status: 200,
          msg: 'Logged in successfully',
          message: 'Logged in successfully',
          is_registered: 1,
          data: data
        })
      }).catch((err) => {
        console.error('59 ERROR :', err)
        res.json({
          status: -1,
          msg: 'Something went wrong',
          message: 'Something went wrong'
        })
      })

    } else {
      return res.json({
        status: 404,
        msg: "Please Provide a valid credentials",
        message: "Please Provide a valid credentials"

      })

    }
  }).catch((err) => {
    console.error('123 ERROR :', err)
    res.json({
      status: 500,
      msg: 'An error occured',
      message: 'An error occured'
    })
  })

}

// require('../models/cms')
/**Cmsadd API
method:POST
input:body[name,slug,description,body],
output:add and msg show,
purpose:To add cms,
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/cms:
 *  post:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: cms details for add a new one
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            slug:
 *              type: string
 *            description:
 *              type: string
 *            data:
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

Admincontroller.cmsAdd = (req, res) => {
  let data = {};
  data.table = 'cms',
    data.where = {}
  data.where.slug = req.body.slug
  console.log('data', data)
  GenericRepository.fetchData(data).then((result) => {
    console.log(result)
    if (result.count > 0) {
      res.json({
        status: 500,
        msg: 'slug must be unique',
        message: 'slug must be unique'
      })
    }
    else {


      let information = {};
      information.table = 'cms',
        information.data = {
          name: req.body.name,
          slug: req.body.slug,
          description: req.body.description,
          data: req.body.data
        }
      console.log(information)

      GenericRepository.createData(information).then((result) => {
        res.json({
          status: 201,
          msg: 'cms added',
          message: 'cms added',
          purpose:'cms added'
        })

      }).then((err) => {
        console.trace(err);
        res.json({
          status: 500,
          msg: 'an error occured',
          message: 'an error occured'
        })
      })
    }
  }).catch((err) => {
    res.json({
      status: 500,
      msg: 'error occured',
      message: 'error occured'
    })
  })
}

/*invite-to-consultant api
method:POST
input:body[ email,]
output:mail sent,
purpose:to invite consultent
created by arijit saha
*/

/**
 * @swagger
 * /api/admin/invite-to-consultant:
 *  post:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: name and email need  for invite to consultant
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *              example: ENJAMAMUL HOQUE
 *            email:
 *              type: string
 *              example: enjamamul.unified@gmail.com
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

Admincontroller.inviteToConsultant = function (req, res) {
  (async () => {
    let check_is_user_registered = await new Promise(function (resolve, reject) {
      let check_is_user_registered_data = {};
      check_is_user_registered_data.table = 'admin_consultants';
      check_is_user_registered_data.where = {};
      check_is_user_registered_data.where.email = req.body.email;
      GenericRepository.fetchData(check_is_user_registered_data).then(check_is_user_registered_result => {
        if (check_is_user_registered_result.rows.length > 0) {
          return res.send({ status: 409, msg: 'An user is already registered with provided email address', message: 'An user is already registered with provided email address' });
        }
        else {
          resolve()
        }
      }).catch(check_is_user_registered_err => {
        console.log(check_is_user_registered_err);
        return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
      })
    }).then(result => {
      return result;
    }).catch(err => {
      console.log(err);
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    })
    let check_previous_links = await new Promise(function (resolve, reject) {
      let check_previous_data = {};
      check_previous_data.table = 'validation';
      check_previous_data.where = {};
      check_previous_data.where.ref_email = req.body.email;
      check_previous_data.where.role = 0;
      check_previous_data.where.validation_type = 'ref';
      GenericRepository.fetchData(check_previous_data).then(check_previous_result => {
        if (check_previous_result.rows.length > 0) {
          ///// a links is shared previous also /////
          let update_data = {};
          update_data.table = 'validation';
          update_data.where = {};
          update_data.data = {};
          update_data.where.ref_email = req.body.email;
          update_data.where.role = 0;
          update_data.where.validation_type = 'ref';
          update_data.data.is_expired = 1;
          GenericRepository.updateData(update_data).then(update_result => {
            resolve()
          }).catch(update_err => {
            console.log(update_err);
            return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' })
          })
        }
        else {
          resolve()
        }
      }).catch(check_previous_err => {
        console.log(check_previous_err);
        return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' })
      })
    }).then(result => {
      return result;
    }).catch(err => {
      console.log(err);
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    })
    let validation_hash = await new Promise(function (resolve, reject) {
      let validation_hash;
      commonFunnction.getRandomString(10).then((randNum) => {
        validation_hash = randNum
        resolve(validation_hash)
      }).catch(randErr => {
        console.log(randErr);
        return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
      })

    }).then(result => {
      return result;
    }).catch(err => {
      console.log(err);
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    })
    let create_consultant_data = await new Promise(function (resolve, reject) {
      let create_consultant_data = {};
      create_consultant_data.name = req.body.name;
      create_consultant_data.email = req.body.email;
      // create_consultant_data.link = global.constants.WEBURL+'/ebinaa/html/consultant-hub/consultant-form/'+validation_hash;
      create_consultant_data.link = process.env.WEBURL + '/ebinaa/html/consultant-hub/consultant-form/' + validation_hash;
      let create_validation_data = {};
      create_validation_data.table = 'validation';
      create_validation_data.data = {};
      create_validation_data.data.role = 0;
      create_validation_data.data.validation_type = 'ref';
      create_validation_data.data.validation_hash = validation_hash;
      create_validation_data.data.ref_email = req.body.email;
      GenericRepository.createData(create_validation_data).then(create_validation_result => {
        resolve(create_consultant_data);
      }).catch(create_validation_err => {
        console.log(create_validation_err);
        return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });

      })
    }).then(result => {
      return result;
    }).catch(err => {
      console.log(err);
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    })
    global.eventEmitter.emit('client_invitation_email', create_consultant_data);
    return res.send({ status: 200, msg: 'Invitation link referral successful!', message: 'Invitation link referral successful!' });

  })()
}


/**image-upload API
method:POST
input:body[user_id,resource_type,resource_url,type],
output:data,
purpose:to upload image
created by Sayanti Nath.
*/

Admincontroller.imageUpload = (req, res) => {
  const errors = validationResult(req)
  console.error('Validation :', errors)
  if (!errors.isEmpty()) {
    return res.json({
      status: 500,
      msg: 'Validation failed',
      message: 'Validation failed',
      data: errors.array()
    })
  }


  let information = {};
  information.table = 'resources',
    information.data = {
      user_id: 0,
      resource_type: req.body.resource_type,
      resource_url: global.constants.IMG_URL.home_partner_url + req.files.image[0].filename,
      type: req.body.type
    }
    
  GenericRepository.createData(information).then((result) => {
    console.log(result)
    res.json({
      status: 201,
      msg: 'file uploaded',
      message: 'file uploaded'
    })

  }).then((err) => {
    console.trace(err);
    res.json({
      status: 500,
      msg: 'an error occured',
      message: 'an error occured'
    })
  })

}


/**image-upload API
method:POST
input:body[user_id,resource_type,resource_url,type],
output:data,
purpose:to upload video
created by anirban das.
*/

/**
 * @swagger
 * /api/admin/upload-video-home-slider:
 *  post:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: upload video of home slider
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            image:
 *              type: string
 *              format: binary
 *            
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


Admincontroller.videoUploadHomeSlider = (req, res) => {

  var information = {};
  information.table = 'resources';
  information.data = {
    user_id: 0,
    resource_type: req.body.resource_type,
    resource_url: global.constants.IMG_URL.home_slider_url + req.files.image[0].filename,
    type: req.body.type
  }

  GenericRepository.createData(information).then((result) => {
    let resultdata = JSON.parse(JSON.stringify(result));
    res.json({
      status: 201,
      msg: 'file uploaded',
      message: 'file uploaded',
      purpose:'file uploaded',
      data: resultdata
    })

  }).then((err) => {
    console.trace(err);
    res.json({
      status: 500,
      msg: 'an error occured',
      message: 'an error occured'

    })
  })
  // let update_resource

}


/**videoUploadHomeSliderImage API
method:POST
input:body[user_id,resource_type,resource_url,type],
output:data,
purpose:to upload image
created by anirban das.
*/

/**
 * @swagger
 * /api/admin/slider-image:
 *  post:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
 *            resource_type:
 *              type: string
 *              description: image / video / pdf
 *            image:
 *              type: string
 *              format: binary
 *            type:
 *              type: string
 *              description: admin_consultant_project / home_partner / home_slider / company_engineer_profile_photo / company_engineer_cv
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

Admincontroller.videoUploadHomeSliderImage = (req, res) => {

  var information = {};
  information.table = 'resources';
  information.data = {
    user_id: 0,
    resource_type: req.body.resource_type,
    resource_thumbnail: global.constants.IMG_URL.home_partner_url + req.files.image[0].filename,
    type: req.body.type
  }

  GenericRepository.createData(information).then((result) => {
    let resultdata = JSON.parse(JSON.stringify(result));
    res.json({
      status: 201,
      msg: 'file uploaded',
      message: 'file uploaded',
      data: resultdata
    })

  }).then((err) => {
    console.trace(err);
    res.json({
      status: 500,
      msg: 'an error occured',
      message: 'an error occured'

    })
  })
  // let update_resource

}

/**updateHomeSliderImage API
method:PUT
input:body[id],
output:data,
purpose:to update uploaded image
created by anirban das.
*/

/**
 * @swagger
 * /api/admin/slider-image-upload:
 *  put:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
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

Admincontroller.updateHomeSliderImage = (req, res) => {

  var information = {};
  information.table = 'resources';
  information.where = { id: req.body.id }
  information.data = {

    resource_thumbnail: global.constants.IMG_URL.home_partner_url + req.files.image[0].filename,
  }

  GenericRepository.updateData(information).then((result) => {
    let resultdata = JSON.parse(JSON.stringify(result));
    res.json({
      status: 201,
      msg: 'file uploaded',
      message: 'file uploaded',
      purpose:'file uploaded',
      data: resultdata

    })

  }).then((err) => {
    console.trace(err);
    res.json({
      status: 500,
      msg: 'an error occured',
      message: 'an error occured'

    })
  })
  // let update_resource

}












/**sliderDescriptionCreate API
method:POST
input:body[id, description, is_active], headers [x-access-token]
output:data,
purpose:To create a slider description.
created by Arijit Saha
*/
/**
     * To create a slider description with respect to `id`,`description`,`is_active`, `x-access-token`
     * @param {Number} `id`, `is_active`
     * @param {String} `description`,`x-access-token`
     * @return {data} `data`
*/

/**
 * @swagger
 * /api/admin/slider-description:
 *  put:
 *   tags:
 *    - CMS Management
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
 *            resource_description:
 *              type: string
 *            is_active:
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
Admincontroller.sliderDescriptionCreate = function (req, res) {
  (async () => {
    try {
      let check_resource = await new Promise(function (resolve, reject) {
        let check_resource = {};
        check_resource.table = 'resources';
        check_resource.where = {};
        check_resource.where.id = parseInt(req.body.id);
        GenericRepository.fetchData(check_resource).then(check_resource_result => {
          if (check_resource_result.rows.length > 0) {
            resolve()
          }
          else {
            return res.send({ status: 404, message: 'No such resource is found' });
          }
        }).catch(check_resource_err => {
          console.log(340, check_resource_err);
        })
      })
      let update_resource = await new Promise(function (resolve, reject) {
        let update_resource_data = {};
        update_resource_data.table = 'resources';
        update_resource_data.where = {};
        update_resource_data.where.id = parseInt(req.body.id);
        update_resource_data.data = {};
        // if(req.body.resource_description){
        update_resource_data.data.resource_description = req.body.resource_description;
        // }
        update_resource_data.data.is_active = parseInt(req.body.is_active);
        GenericRepository.updateData(update_resource_data).then(update_resource_result => {
          resolve();
        }).catch(update_resource_err => {
          console.log(358, update_resource_err);
        })

      })
      return res.send({ status: 200, message: 'Slide is updated successfully' });
    }
    catch (err) {
      return res.send({ status: 500, message: 'Something went wrong' })
    }
  })()
}



/**image-upload API
method:POST
input:body[user_id,resource_type,resource_url,type],
output:data,
purpose:to upload image
created by anirban das.
*/

/**
 * @swagger
 * /api/admin/upload-image-home-slider:
 *  put:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: upload image of home slider
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            image:
 *              type: string
 *              format: binary
 *            
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

Admincontroller.imageUploadHomeSlider = (req, res) => {


  (async () => {

    try {
      
      let information = {};
      information.table = 'resources';
      information.data = { resource_thumbnail: global.constants.IMG_URL.home_slider_url + req.files.image[0].filename }
      information.where = { id: req.body.id };
      // data.where={is_deleted:0};

      await GenericRepository.updateData(information)

      let imagedata = await GenericRepository.fetchData(information);

      res.send({ status: 200, data: imagedata, message: 'file uploaded and updated', purpose: "Admin article topic fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic fetching" });


    }


  })()

}

/**image-upload API
method:POST
input:body[user_id,resource_type,resource_url,type],
output:data,
purpose:to upload image
created by Sayanti Nath.
*/


/**
 * @swagger
 * /api/admin/image-home-slider-update:
 *  put:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: update image of home slider
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            image:
 *              type: string
 *              format: binary
 *            
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


Admincontroller.imageUploadHomeSliderUpdate = (req, res) => {


  (async () => {

    try {
      let information = {};
      information.table = 'resources';
      information.data = { resource_url: global.constants.IMG_URL.home_slider_url + req.files.image[0].filename }
      information.where = { id: req.body.id };
      // data.where={is_deleted:0};

      await GenericRepository.updateData(information)

      let imagedata = await GenericRepository.fetchData(information);

      res.send({ status: 200, data: imagedata, message: 'file uploaded and updated', purpose: "Admin article topic fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic fetching" });


    }


  })()

}


/**showimage API
method:POST
input:body[limit,offset,query_type],
output:data,
purpose:to show image
created by Sayanti Nath.
*/

/**
 * @swagger
 * /api/admin/images:
 *  get:
 *   tags:
 *    - CMS Management
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: string
 *       value: 3
 *    - in: query
 *      name: type
 *      required: true
 *      description: admin_consultant_project / home_partner / home_slider / company_engineer_profile_photo / company_engineer_cv
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

Admincontroller.showImage = (req, res) => {
  (async () => {
    try {
      let get_all_images = await new Promise(function (resolve, reject) {
        let get_all_images;
        let data = {};
        data.table = 'resources',
          data.where = {},
          // data.where.is_active=1,
          data.where.is_delete = 0,
          data.where.type = req.query.type

        GenericRepository.fetchData(data).then(resource_result => {
          get_all_images = resource_result;
          resolve(get_all_images);
        }).catch(resource_err => {
          console.log(539, resource_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      let get_all_images_with_pagination = await new Promise(function (resolve, reject) {
        let get_all_images_with_pagination;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit * (page - 1);
        let order = [['id', 'DESC']];
        let data = {};
        data.table = 'resources',
          data.where = {},
          // data.where.is_active=1,
          data.where.is_delete = 0,
          data.where.type = req.query.type;
        GenericRepository.fetchDatalimit(data, limit, offset, order).then(images_result => {
          get_all_images_with_pagination = images_result;
          resolve(get_all_images_with_pagination);
        }).catch(images_err => {
          console.log(556, images_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      return res.send({ status: 200, message: 'Image result', total_count: get_all_images.rows.length, data: get_all_images_with_pagination })
    } catch (err) {
      res.send({ status: 500, err: err });
    }
  })()
}

// Admincontroller.showImage=(req,res)=>{

// (async()=>{

//       try{

//           let data={};
//           data.table='resources',
//           data.where={},
//           // data.where.is_active=1,
//           data.where.is_delete=0,
//           data.where.type=req.query.type

//           let resImages = await GenericRepository.fetchData(data)

//           res.send({status:200, data:resImages});

//       } catch(err){

//           res.send({status:500, err:err});

//       }

//     })()

// }


/**invite-article API
method:POST
input:body[uid,validation_meta],
output:mail sent,
purpose:to invite article
created by arijit saha
*/


/**
 * @swagger
 * /api/admin/invite-articles:
 *  post:
 *   tags:
 *    - Articles
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            uid:
 *              type: integer
 *            topic_id:
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
Admincontroller.inviteArticle = function (req, res) {
  (async () => {
    try {
      let validation_hash = await commonFunnction.getRandomString(10);
      let new_created_article_id = await new Promise(function (resolve, reject) {
        let new_created_article_id;
        let article_data = {};
        article_data.table = 'articles';
        article_data.data = {};
        article_data.data.user_id = req.body.uid;
        article_data.data.topic_id = req.body.topic_id;
        GenericRepository.createData(article_data).then(article_data => {
          new_created_article_id = article_data.dataValues.id;
          resolve(new_created_article_id);

        }).catch(article_err => {
          console.log(article_err);
        })
      })
      let insert_validation_data = await new Promise(function (resolve, reject) {
        let insert_data = {};
        insert_data.table = 'validation';
        insert_data.data = {};
        insert_data.data.uid = req.body.uid;
        insert_data.data.role = 4;
        insert_data.data.validation_type = 'invite_to_article';
        // insert_data.data.validation_meta = req.body.validation_meta;
        insert_data.data.validation_meta = new_created_article_id;
        insert_data.data.validation_hash = validation_hash;
        GenericRepository.createData(insert_data).then(insert_result => {
          resolve()
        }).catch(insert_err => {
          console.log(insert_err);
        })
      })
      let get_admin_consultant_details = await new Promise(function (resolve, reject) {
        let get_admin_consultant_details;
        let get_admin_consultant_data = {};
        get_admin_consultant_data.table = 'admin_consultants';
        get_admin_consultant_data.where = {};
        get_admin_consultant_data.where.id = req.body.uid;
        GenericRepository.fetchData(get_admin_consultant_data).then(get_admin_consultant_result => {
          get_admin_consultant_details = get_admin_consultant_result;
          resolve(get_admin_consultant_details);
        }).catch(get_admin_consultant_err => {
          console.log(get_admin_consultant_err);
        })
      })
      let admin_consultant_data = {};
      admin_consultant_data.name = get_admin_consultant_details.rows[0].dataValues.company_name;
      admin_consultant_data.email = get_admin_consultant_details.rows[0].email;
      admin_consultant_data.link = process.env.WEBURL + '/ebinaa/html/consultant-hub/article-form/' + validation_hash;
      global.eventEmitter.emit('invite_to_article_link', admin_consultant_data);
      return res.send({ status: 201, message: 'Article Request Sent' })
    }
    catch (err) {
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    }
  })()
}

/**
api name: Article Additions
method:POST
input:body[name, description],
output:data,
purpose:Admin article topic creation.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article:
 *  post:
 *   tags:
 *    - Articles
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            user_id:
 *              type: integer
 *            topic_id:
 *              type: integer
 *            title:
 *              type: string
 *            writer:
 *              type: string
 *            writer_name:
 *              type: string
 *            data:
 *              type: string
 *            is_draft:
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

Admincontroller.addArtical = (req, res) => {

  let information = {};
  information.table = 'articles';
  information.data = {
    user_id: req.body.user_id,
    topic_id: req.body.topic_id,
    title: req.body.title,
    // description:req.body.description,
    writer: req.body.writer,
    writer_name: req.body.writer_name,
    data: req.body.data,
    is_draft: req.body.is_draft,
    is_approved: 0,
    is_deleted: 0
  }

  GenericRepository.createData(information).then((result) => {
    res.json({ status: 201, msg: 'article added', message: 'article added', message: 'article added successfully', purpose: "Admin article topic creation" })

  }).then((err) => {
    console.trace(err);
    res.json({
      status: 500,
      msg: 'an error occured'
    })
  })
}


/**askme-from from API
method:POST
input:body[name,email,phone,description,type],
output:mail sent,
purpose:to invite article
created by sayanti nath
*/


/**
 * @swagger
 * /api/admin/askme-from:
 *  post:
 *   tags:
 *    - Ask me
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            email:
 *              type: string
 *            phone:
 *              type: string
 *            description:
 *              type: string
 *            type:
 *              type: integer
 *              description: '1-Client, 2-Consultant, 3-Contractor, 4-Others'
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

Admincontroller.askMeFrom = (req, res) => {
  let information = {};
  information.table = 'contact_us',
    information.data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      description: req.body.description,

    }

  if (req.body.type) {
    information.data.type = req.body.type
  }
  GenericRepository.createData(information).then((result) => {
    console.log(result.dataValues.email);

    console.log(result.dataValues.phone)

    let info = {};
    info.table = 'site_setting',
      info.where = {};
    GenericRepository.fetchData(info).then((sitesettings) => {
      console.log(sitesettings)
      console.log(result.dataValues.type)
      // if(result.dataValues.type==2){
      //   var text='others'
      // }
      // else{
      //   text='consultant'
      // }

      if (result.dataValues.type == null) {
        var text = '--'
      }
      else {
        if (result.dataValues.type == 1) {
          var text = 'Client'
        }
        else if (result.dataValues.type == 2) {
          var text = 'Consultant'
        }
        else if (result.dataValues.type == 3) {
          var text = 'Contractor'
        }
        else if (result.dataValues.type == 4) {
          var text = 'others'
        }
        else {
          var text = '--';
        }

      }
      let name = result.dataValues.name;
      name = name.split(' ').slice(0, -1).join(' ');
      console.log(text)
      let site_data = {};

      site_data.name = result.dataValues.name,
        site_data.email = sitesettings.rows[0].dataValues.admin_email;

      site_data.phone = result.dataValues.phone;



      site_data.description = result.dataValues.description,
        site_data.type = text;
      // site_data.user_email_address = req.userdetails.email;
      site_data.user_email_address = req.body.email;
      global.eventEmitter.emit('ask_me_email_admin', site_data);



    }).catch((err) => {
      console.trace(err)
      res.json({
        status: 500,
        msg: 'an error occured',
        message: 'an error occured'

      })
    })

    let name = result.dataValues.name;
    name = name.split(' ').slice(0, -1).join(' ');

    let data = {};
    data.username = name,
      data.name = result.dataValues.name,
      data.email = result.dataValues.email,
      data.phone = result.dataValues.phone,
      data.description = result.dataValues.description
    global.eventEmitter.emit('ask_me_email', data);
    console.log('mail sent');
    res.json({
      status: 201,
      msg: 'data created',
      message: 'data created'

    })

  }).catch((err) => {
    console.trace(err)
    res.json({
      status: 500,
      msg: 'an error occured',
      message: 'an error occured'

    })
  })

}

/**ask-me  API
method:GET
input:body[name,email,phone,description,type],
output:data,
purpose:to show askme from
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/ask-me:
 *  get:
 *   tags:
 *    - Ask me
 *   parameters:
 *    - in: query
 *      name: limit
 *      schema:
 *       type: string
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

Admincontroller.showAskMe = (req, res) => {
  let limit = 10;
  let offset = 0;
  if (req.query.limit) {
    limit = parseInt(req.query.limit)
  }
  if (req.query.offset) {
    offset = limit * parseInt(req.query.offset);
  }


  (async () => {

    try {

      let information = {};
      information.table = 'contact_us',
        information.where = {};




      let article_table = await GenericRepository.fetchDatalimit(information, limit, offset)

      res.send({ status: 200, msg: 'data', message: 'data', data: article_table });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()


}

/*ask-me  API
method:POST
input:body[id],
output:data,
purpose:to show askme from for a id
created by sayanti nath
*/
/**
 * @swagger
 * /api/admin/ask-me:
 *  post:
 *   tags:
 *    - Ask me
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
Admincontroller.showAskMeId = (req, res) => {

  (async () => {

    try {

      let information = {};
      information.where = {};
      information.table = 'contact_us',
        information.where.id = req.body.id
      let article = await GenericRepository.fetchData(information)

      res.send({ status: 200, msg: 'data', message: 'data', data: article });

    } catch (err) {

      res.send({ status: 500, err: err });

    }


  })()



}

/**cms api
method:PUT
input:body[name,data,is_published],
output:data,
purpose:to edit the cms
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/cms:
 *  put:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: update admin consultant profile
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
 *            name_arabic:
 *              type: string
 *            data:
 *              type: string
 *            data_arabic:
 *              type: string
 *            description:
 *              type: string
 *            is_published:
 *              type: string
 *            description_arabic:
 *              type: string
 *            signature:
 *              type: string
 *            signature_arabic:
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
Admincontroller.editCms = (req, res) => {
  let information = {};
  information.table = 'cms',
    information.data = {
      name: req.body.name,
      name_arabic: req.body.name_arabic,
      data: req.body.data,
      data_arabic: req.body.data_arabic,
      description: req.body.description,
      is_published: req.body.is_published,
      description_arabic: req.body.description_arabic,
      signature: req.body.signature,
      signature_arabic: req.body.signature_arabic
    }
  information.where = {},
    information.where.id = req.body.id
  GenericRepository.updateData(information).then(result => {
    res.json({
      status: 200,
      msg: 'updated',
      message: 'updated'
    })
  }).catch((err) => {
    console.log(err)
    res.json({
      status: 500,
      msg: 'server error',
      message: 'server error'
    })
  })

}

/**cms api
method:GET
input:body[LIMIT,OFFSET],
output:data,
purpose:to fetch the cms
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/cms:
 *  post:
 *   tags:
 *    - CMS Management
 *   parameters:
 *    - in: query
 *      name: limit
 *      schema:
 *       type: string
 *       value: 3
 *    - in: query
 *      name: offset
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


Admincontroller.fetchCms = (req, res) => {
  let limit = 10;
  let offset = 0;
  if (req.query.limit) {
    limit = parseInt(req.query.limit)
  }
  if (req.query.offset) {
    offset = limit * parseInt(req.query.offset);
  }

  (async () => {

    try {

      let information = {};
      information.table = 'cms',
        information.where = {};




      let cms_table = await GenericRepository.fetchDatalimit(information, limit, offset)

      res.send({ status: 200, msg: 'data', message: 'data', data: cms_table });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}


/**cms-grid api
method:GET
input:body[LIMIT,OFFSET],
output:data,
purpose:to fetch the cmsgrid
created by sayanti nath
*/



/**
 * @swagger
 * /api/admin/cms-grid-details:
 *  get:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: need id  for fetch cms grid details
 *    required: true
 *    content:
 *      multipart/form-data:
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
Admincontroller.fetchCmsGridDetails = (req, res) => {


  (async () => {

    try {

      let information = {};
      information.table = 'cms_grids';
      information.where = { is_deleted: 0, id: req.query.id };




      let cms_table = await GenericRepository.fetchData(information)

      res.send({ status: 200, msg: 'cms grid data fetch successfully', message: 'cms grid data fetch successfully', data: cms_table });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}


/**cms-grid api
method:GET
input:body[LIMIT,OFFSET],
output:data,
purpose:to fetch the cmsgrid
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/cms-grid:
 *  get:
 *   tags:
 *    - CMS Management
 *   parameters:
 *    - in: query
 *      name: limit
 *      schema:
 *       type: integer
 *       value: 3
 *    - in: query
 *      name: offset
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


Admincontroller.fetchCmsGrid = (req, res) => {
  let limit = 10;
  let offset = 0;
  if (req.query.limit) {
    limit = parseInt(req.query.limit)
  }
  if (req.query.offset) {
    offset = limit * parseInt(req.query.offset);
  }

  (async () => {

    try {

      let information = {};
      information.table = 'cms_grids';
      information.where = { is_deleted: 0 };




      let cms_table = await GenericRepository.fetchDatalimit(information, limit, offset)

      res.send({ status: 200, msg: 'cms grid data fetch successfully', message: 'cms grid data fetch successfully', data: cms_table });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}


/**cms-grid api
method:POST
input:body[type,title,image,link,description,is_active],
output:data,
purpose:to fetch the cms
created by sayanti nath
*/


/**
 * @swagger
 * /api/admin/cms-grid:
 *  post:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: need details of add cms grid
 *    required: true
 *    content:
 *      multipart/form-data:
 *        schema:
 *          type: object
 *          properties:
 *            type:
 *              type: integer
 *            title:
 *              type: string
 *            title_arabic:
 *              type: string
 *            image:
 *              type: string
 *              format: binary
 *            link:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            is_active:
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

Admincontroller.addCmsGrid = (req, res) => {
  // let limit = 10;
  // let offset = 0;
  // if (req.query.limit) {
  //   limit = parseInt(req.query.limit)
  // }
  // if (req.query.offset) {
  //   offset = limit * parseInt(req.query.offset);
  // }

  (async () => {

    try {

      let information = {};
      information.data = {
        type: req.body.type,
        title: req.body.title,
        image: req.body.image,
        link: req.body.link,
        description: req.body.description,
        is_active: req.body.is_active,
        title_arabic: req.body.title_arabic,
        description_arabic: req.body.description_arabic,
      };


      information.table = 'cms_grids';

      let cmsgriddata = await GenericRepository.createData(information)

      res.send({ status: 201, msg: 'cms grid data created successfully', message: 'cms grid data created successfully', data: cmsgriddata });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}


/**cms-grid api
method:PUT
input:body[type,title,image,link,description,is_active],
output:data,
purpose:to fetch the cms
created by sayanti nath
*/


/**
 * @swagger
 * /api/admin/cms-grid:
 *  put:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: need details for update cms grid
 *    required: true
 *    content:
 *      multipart/form-data:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            type:
 *              type: integer
 *            title:
 *              type: string
 *            title_arabic:
 *              type: string
 *            image:
 *              type: string
 *              format: binary
 *            link:
 *              type: string
 *            description:
 *              type: string
 *            description_arabic:
 *              type: string
 *            is_active:
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

Admincontroller.updateCmsGrid = (req, res) => {
  let limit = 10;
  let offset = 0;
  if (req.query.limit) {
    limit = parseInt(req.query.limit)
  }
  if (req.query.offset) {
    offset = limit * parseInt(req.query.offset);
  }

  (async () => {

    try {
      let information = {};
      information.data = {
        type: req.body.type,
        title: req.body.title,
        image: req.body.image,
        link: req.body.link,
        description: req.body.description,
        is_active: req.body.is_active,
        title_arabic: req.body.title_arabic,
        description_arabic: req.body.description_arabic

      };
      information.table = 'cms_grids';
      information.where = { id: req.body.id };

      let cmsgriddata = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'cms grid data updated successfully', message: 'cms grid data updated successfully', data: cmsgriddata });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}




/**cms-grid api
method:PUT
input:body[type,title,image,link,description,is_active],
output:data,
purpose:to fetch the cms
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/cms-grid:
 *  delete:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: need details for delete cms grid
 *    required: true
 *    content:
 *      multipart/form-data:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            is_deleted:
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

Admincontroller.deleteCmsGrid = (req, res) => {
  let limit = 10;
  let offset = 0;
  if (req.query.limit) {
    limit = parseInt(req.query.limit)
  }
  if (req.query.offset) {
    offset = limit * parseInt(req.query.offset);
  }

  (async () => {

    try {

      let information = {
        is_deleted: req.body.is_deleted
      };
      information.table = 'cms_grids';
      information.where = { id: req.body.id };

      let cmsgriddata = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'cms grid data deleted successfully', message: 'cms grid data deleted successfully', data: cmsgriddata });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}


/** article-approve-status API
method:PUT
input:body[ID,IS_APPROVED],
output:data,
purpose:to ACTIVE STATUS
created by Sayanti Nath.
*/


/**
 * @swagger
 * /api/admin/article-approve-status:
 *  put:
 *   tags:
 *    - Articles
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            is_approved:
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
Admincontroller.activrarticle = (req, res) => {
  (async () => {

    try {

      let information = {};
      information.table = 'articles',
        information.data = {
          is_approved: req.body.is_approved
        }
      information.where = {},

        information.where.id = req.body.id;



      let is_approved = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'approved', message: 'approved' });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/**view article api
method:GET
input:body[LIMIT,OFFSET],
output:data,
purpose:to view article
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/articles:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: integer
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: integer
 *       value: 3
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


Admincontroller.viewarticle = (req, res) => {

  (async () => {

    try {
      let page = parseInt(req.query.page);
      let limit = parseInt(req.query.limit);
      let offset = limit * (page - 1);
      //let data = []
      //let where={is_deleted:0};
      let information = {};
      let sort_by = ['createdAt', 'DESC'];


      let and_data = [];

      and_data.push({ is_deleted: 0 });

      let or_data = [];

      if (req.query.search_text) {
        or_data.push({ title: { $like: '%' + req.query.search_text + '%' } });
        //or_data.push({full_name:{$like:'%'+req.body.search_text+'%'}});
      }

      //information.table='user';
      if (or_data.length > 0) {
        information.where = { $or: or_data, $and: and_data };
      } else {
        information.where = and_data;
      }


      let is_approved = await ConsultationhubRepository.fetchArticleData(information, limit, offset, sort_by)

      res.send({ status: 200, msg: 'result', message: 'result', data: is_approved });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}







/**
api name: article-topic
method:POST
input:body[name, description],
output:data,
purpose:Admin article topic creation.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article-topic:
 *  post:
 *   tags:
 *    - Articles
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            name:
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

Admincontroller.addArticleTopic = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {
      let information = {};
      information.table = 'article_topics',
        information.data = {
          name: req.body.name,
          description: req.body.description,
          is_active: 1,
          is_deleted: 0
        }
        information.transaction=t;

      let data = await GenericRepository.createData(information)

      res.send({ status: 201, data: data, message: 'Article topic added successfully', purpose: "Admin article topic creation" });
      })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic creation" });

    }


  })()

}


/**
api name: article-topic
method:PUT
input:body[id, name, description],
output:data,
purpose:Admin article topic update.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article-topic:
 *  put:
 *   tags:
 *    - Articles
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
 *            status:
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

Admincontroller.UpdateArticleTopic = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {
      let information = {};
      information.table = 'article_topics',
        information.data = {
          name: req.body.name,
          description: req.body.description,
          is_active: req.body.status
        }
      information.where = {},
        information.where.id = req.body.id;

        information.transaction=t;
      await GenericRepository.updateData(information)

      let data = await GenericRepository.fetchData(information)

      res.send({ status: 201, data: data, message: 'Topic updated successfully', purpose: "Admin article topic creation" });
      })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic creation" });

    }


  })()

}


/**
api name: article-topic
method:PUT
input:body[status],
output:data,
purpose:Admin article topic status change.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article-topic-change-status:
 *  put:
 *   tags:
 *    - Articles
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
 *            status:
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

Admincontroller.changeStatusArticleTopic = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {
      let information = {};
      information.table = 'article_topics',
        information.data = {
          is_active: req.body.status
        }
      information.where = {},
        information.where.id = req.body.id;
        information.transaction=t;

      await GenericRepository.updateData(information)

      let data = await GenericRepository.fetchData(information)

      res.send({ status: 200, data: data, message: 'Article topic status updated successfully', purpose: "Admin article topic status change" });

      })
    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic status change" });

    }


  })()

}


/**
api name: article-topic 
method:GET
input:body[name, description,page,limit],
output:data,
purpose:Admin article topic fetching.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article-topics:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: string
 *       value: 3
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


Admincontroller.listArticleTopic = (req, res) => {

  (async () => {

    try {
      let data = []
      let page = parseInt(req.query.page);
      let or_data = [];
      let and_data = [];
      data.table = 'article_topics';
      data.limit = parseInt(req.query.limit);
      data.offset = data.limit * (page - 1);
      // data.where={is_deleted:0};

      if (req.body.user_type != 0) {
        and_data.push({ is_deleted: 0 });
      }

      if (req.query.search_text != "") {
        or_data.push({ name: { $like: '%' + req.query.search_text + '%' } });
        or_data.push({ description: { $like: '%' + req.query.search_text + '%' } });
      }

      if (or_data.length > 0) {
        data.where = { $or: or_data, $and: and_data };
      } else {
        data.where = and_data;
      }


      let articleTopicData = await GenericRepository.fetchDataWithPegination(data)

      res.send({ status: 200, data: articleTopicData, message: 'Article topic fetch successfully', purpose: "Admin article topic fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic fetching" });


    }


  })()

}


/**
api name: article-topic-details 
method:GET
input:body[name, description,page,limit],
output:data,
purpose:Admin article topic details fetching.
author:anirban das
*/


/**
 * @swagger
 * /api/admin/article-topic-details:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: id
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
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

Admincontroller.ArticleTopicDetails = (req, res) => {

  (async () => {

    try {
      let data = []
      let page = 1;
      let or_data = [];
      let and_data = [];
      data.table = 'article_topics';
      data.limit = 1;
      data.offset = data.limit * (page - 1);
      data.where = { is_deleted: 0, id: req.query.id };

      let articleTopicData = await GenericRepository.fetchDataWithPegination(data)

      res.send({ status: 200, data: articleTopicData, message: 'Article topic details fetch successfully', purpose: "Admin article topic details fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic fetching" });


    }


  })()

}



/**
api name: article-topic 
method:GET
input:body[name, description,page,limit],
output:data,
purpose:Admin article topic fetching.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/article-topic-user:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: string
 *       value: 3
 *    - in: query
 *      name: user_id
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

Admincontroller.listUserArticleTopic = (req, res) => {

  (async () => {

    try {
      let data = []
      let page = parseInt(req.query.page);
      let or_data = [];
      let and_data = [];
      data.table = 'article_topics';
      data.limit = parseInt(req.query.limit);
      data.offset = data.limit * (page - 1);
      data.where = { is_deleted: 0, is_active: 1, user_id: req.query.user_id };
      data.attributes = []
      if (req.body.user_type != 0) {
        and_data.push({ is_deleted: 0 });
      }

      if (or_data.length > 0) {
        data.where = { $or: or_data, $and: and_data };
      } else {
        data.where = and_data;
      }


      let articleTopicData = await GenericRepository.fetchDataWithAttributes(data)

      res.send({ status: 200, data: articleTopicData, message: 'Article topic fetch successfully', purpose: "Admin article topic fetching" });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, message: "Interneal server error", purpose: "Admin article topic fetching" });


    }


  })()

}

/**
api name:images
method:POST
input:body[ id],
output:data,
purpose:to change status.
author:anirban das
*/


/**
 * @swagger
 * /api/admin/images:
 *  post:
 *   tags:
 *    - CMS Management
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
Admincontroller.viewImageDetails = (req, res) => {
  (async () => {

    try {

      let information = {};
      information.table = 'resources',
        information.where = {},
        information.where.id = req.body.id;


      // console.log('************ information *********',information)
      let resource_table = await GenericRepository.fetchData(information)

      res.send({ status: 200, msg: 'result', message: 'result', data: resource_table });

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()
}

/**
api name:upload-image-home-partner
method:POST
input:body[ resource_type,resource_url,is_active],
output:data,
purpose:to upload image.
author:sayanti Nath
*/


/**
 * @swagger
 * /api/admin/upload-image-home-partner:
 *  put:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            resource_type:
 *              type: string
 *              description: 'image/video/pdf'
 *            image:
 *              type: string
 *              format: binary
 *            is_active:
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

Admincontroller.updateImage = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {

      let information = {};
      information.table = 'resources',
        information.data = {
          resource_type: req.body.resource_type,
          resource_url: global.constants.IMG_URL.home_partner_url + req.files.image[0].filename,
          is_active: req.body.is_active

        }
      information.where = {},
        information.where.id = req.body.id;
        information.transaction=t;


      let update_image = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'updated', message: 'updated',purpose:'updated',data:[] });
      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/**
api name: updateuserstatus
method:POST
input:body[id],
output:data,
purpose:to change image status.
author:anirban das
*/

/**
 * @swagger
 * /api/admin/image-change-status:
 *  put:
 *   tags:
 *    - CMS Management
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
 *            external_link:
 *              type: string
 *            is_active:
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


Admincontroller.imageStatusChange = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {
       let information = {};
      information.table = 'resources',
        information.data = {
          external_link: req.body.external_link,
          is_active: req.body.is_active
        }
      information.where = {},
        information.where.id = req.body.id;
       information.transaction=t;
      let update_image = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'updated', message: 'updated' ,purpose:'updated',data:[]});
      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}



/**
api name: updateuserstatus
method:POST
input:body[id],
output:data,
purpose:to change image status.
author:anirban das
*/


/**
 * @swagger
 * /api/admin/change-image-visibility:
 *  put:
 *   tags:
 *    - CMS Management
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
 *            is_visible_client:
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

Admincontroller.imageVisibilityChange = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {

      let information = {};
      information.table = 'resources',
        information.data = {
          is_visible_client: req.body.is_visible_client
        }
      information.where = {},
        information.where.id = req.body.id;


        information.transaction=t;


      let update_image = await GenericRepository.updateData(information)

      res.send({ status: 200, msg: 'updated', message: 'updated' ,purpose:'updated',data:[]});
      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/* upload-image-home-partner api
method:POst
input:body[ resource_type, type, user_id, resource_url,is_active]
output:data,
purpose:to create image
created by anirban das
*/



/**
 * @swagger
 * /api/admin/upload-image-home-partner:
 *  post:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            user_id:
 *              type: integer
 *            resource_type:
 *              type: string
 *              description: 'image/video/pdf'
 *            type:
 *              type: string
 *              description: 'admin_consultant_project / home_partner / home_slider / company_engineer_profile_photo / company_engineer_cv'
 *            image:
 *              type: string
 *              format: binary
 *            external_link:
 *              type: string
 *            is_active:
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

Admincontroller.createImage = (req, res) => {
  (async () => {

    try {
      await sequelize.transaction(async (t) => {

      let information = {};
      information.table = 'resources',
        information.data = {
          resource_type: req.body.resource_type,
          type: req.body.type,
          user_id: req.body.user_id,
          resource_url: global.constants.IMG_URL.home_partner_url + req.files.image[0].filename,
          is_active: req.body.is_active,
          external_link: req.body.external_link

        }

        information.transaction=t;


      let update_image = await GenericRepository.createData(information)

      res.send({ status: 200, msg: 'partner logo added successfully', message: 'partner logo added successfully' ,purpose:'partner logo added successfully',data:[]});
      })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}


/* sitesettings fetch api
method:GET
input:body[],
output:data,
purpose:to fetch sitesettings
created by arijit saha
*/


/**
 * @swagger
 * /api/admin/sitesettings:
 *  get:
 *   tags:
 *    - Site Setting Management
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
Admincontroller.siteSettings = (req, res) => {


  (async () => {

    try {

      let check_data = {};
      check_data.table = 'site_setting';
      check_data.where = {};
      check_data.attributes = ['max_tender_submission_limit', 'admin_contact', 'admin_email', 'facebook_link', 'linkedin_link', 'twitter_link', 'instagram_link', 'partner_text', 'service_text'];
      let site_settings = await GenericRepository.fetchDataWithAttributes(check_data)

      res.send({ status: 200,msg:'site settings',message:'site settings',purpose:'site settings', data: site_settings });

    } catch (err) {

      res.send({ status: 500, err: err });

    }

  })()


}


// Admincontroller.updateSiteSettings = (req,res)=>{


//     (async()=>{

//       try{

//           let check_data = {};
//           check_data.table = 'site_setting';
//           check_data.where = {};
//           check_data.attributes = ['admin_contact','admin_email','facebook_link','linkedin_link','twitter_link','instagram_link','partner_text','service_text'];
//           let site_settings = await GenericRepository.fetchDataWithAttributes(check_data)

//           res.send({status:200, data:site_settings});

//       } catch(err){

//           res.send({status:-1, err:err});

//       }

//     })()


// }

/**update sitesettings api
method:PUT
input:body[admin_contact,admin_email,facebook_link ,linkedin_link,instagram_link,partner_text,service_text],
output:data,
purpose:to fetch the cms
created by anirban das
*/


/**
 * @swagger
 * /api/admin/sitesettings:
 *  put:
 *   tags:
 *    - Site Setting Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            max_tender_submission_limit:
 *              type: integer
 *            admin_contact:
 *              type: string
 *            admin_email:
 *              type: string
 *            facebook_link:
 *              type: string
 *            linkedin_link:
 *              type: string
 *            twitter_link:
 *              type: string
 *            instagram_link:
 *              type: string
 *            partner_text:
 *              type: string
 *            service_text:
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
Admincontroller.updateSiteSettings = (req, res) => {


  (async () => {

    try {
      let update_site_settings = await new Promise(function (resolve, reject) {
        let update_data = {};
        update_data.table = 'site_setting';
        update_data.where = {};
        update_data.where.id = 1;
        update_data.data = {};
        update_data.data.max_tender_submission_limit = req.body.max_tender_submission_limit;
        update_data.data.admin_contact = req.body.admin_contact;
        update_data.data.admin_email = req.body.admin_email;
        update_data.data.facebook_link = req.body.facebook_link;
        update_data.data.linkedin_link = req.body.linkedin_link;
        update_data.data.twitter_link = req.body.twitter_link;
        update_data.data.instagram_link = req.body.instagram_link;
        update_data.data.partner_text = req.body.partner_text;
        update_data.data.service_text = req.body.service_text;
        GenericRepository.updateData(update_data).then(update_result => {
          resolve()
        }).catch(update_err => {
          console.log(update_err);
        })
      })
      return res.send({ status: 200, msg: 'Site settings updated successfully', message: 'Site settings updated successfully' ,purpose:'Site settings updated successfully',data:[]});


    } catch (err) {

      res.send({ status: 500, err: err });

    }

  })()


}

/**forget-password api
method:PUT
input:body[email],
output:mail sent,
purpose:to update password
created by arijit saha
*/

/**
 * @swagger
 * /api/admin/forget-password:
 *  put:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: email need  for forget password
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            email:
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
Admincontroller.forgetPassword = function (req, res) {
  (async () => {
    try {
      let get_user_details = await new Promise(function (resolve, reject) {
        let get_user_details;
        let user_data = {};
        user_data.table = 'admin';
        user_data.where = {};
        user_data.where.email = req.body.email;
        GenericRepository.fetchData(user_data).then(user_result => {
          if (user_result.rows.length > 0) {
            get_user_details = user_result;
            resolve(get_user_details)

          }
          else {
            return res.send({ status: 404, msg: 'No user found with provided email address', message: 'No user found with provided email address' });
          }
        }).catch(user_err => {
          console.log(user_err);
        })
      })
      console.log(get_user_details.rows[0].dataValues)

      // let remove_password = await new Promise(function(resolve, reject){
      //     let remove_user_password_data = {};
      //     remove_user_password_data.table = 'admin';
      //     remove_user_password_data.where = {};
      //     remove_user_password_data.data = {};
      //     remove_user_password_data.where.id = get_user_details.rows[0].dataValues.id;
      //     remove_user_password_data.data.password = ''
      //     GenericRepository.updateData(remove_user_password_data).then(remove_user_password_result=>{
      //         resolve();
      //     }).catch(remove_user_password_err=>{
      //         console.log(remove_user_password_err);
      //     })
      // });
      let validation_hash = await new Promise(function (resolve, reject) {
        let validation_hash;
        commonFunnction.getRandomString(10).then((randNum) => {
          validation_hash = randNum;
          resolve(validation_hash)
        }).catch(randErr => {
          console.log(randErr);
          return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
        })

      })
      let expire_previous_links = await new Promise(function (resolve, reject) {
        let check_validation_data = {};
        check_validation_data.table = 'validation';
        check_validation_data.where = {};
        check_validation_data.where.uid = get_user_details.rows[0].dataValues.id;
        check_validation_data.where.role = 0;
        check_validation_data.where.validation_type = 'forget_password';
        // console.log('************** check_validation_data ***************',check_validation_data)
        GenericRepository.fetchData(check_validation_data).then(check_validation_result => {
          if (check_validation_result.rows.length > 0) {
            let validation_update_data = {};
            validation_update_data.table = 'validation';
            validation_update_data.where = {}
            validation_update_data.where.uid = get_user_details.rows[0].dataValues.id;
            validation_update_data.where.role = 0;
            validation_update_data.where.validation_type = 'forget_password';
            validation_update_data.data = {};
            validation_update_data.data.is_expired = 1;
            // console.log('************** validation_update_data ****************', validation_update_data)
            GenericRepository.updateData(validation_update_data).then(validation_update_result => {
              let insert_validation_data = {};
              insert_validation_data.table = 'validation';
              insert_validation_data.data = {};
              insert_validation_data.data.uid = get_user_details.rows[0].dataValues.id;
              insert_validation_data.data.role = 0;
              insert_validation_data.data.validation_type = 'forget_password';
              insert_validation_data.data.validation_hash = validation_hash;
              GenericRepository.createData(insert_validation_data).then(insert_validation_result => {
                resolve();
              }).catch(insert_validation_err => {
                console.log(insert_validation_err);
              })


            }).catch(validation_update_err => {
              console.log(validation_update_err);
            })


          }
          else {
            let insert_validation_data = {};
            insert_validation_data.table = 'validation';
            insert_validation_data.data = {};
            insert_validation_data.data.uid = get_user_details.rows[0].dataValues.id;
            insert_validation_data.data.role = 0;
            insert_validation_data.data.validation_type = 'forget_password';
            insert_validation_data.data.validation_hash = validation_hash;
            GenericRepository.createData(insert_validation_data).then(insert_validation_result => {
              resolve();
            }).catch(insert_validation_err => {
              console.log(insert_validation_err);
            })


          }
        }).catch(check_validation_err => {
          console.log(check_validation_err);

        })
      })
      let user_details = await new Promise(function (resolve, reject) {
        let user_details = {};
        user_details.name = get_user_details.rows[0].dataValues.full_name;
        user_details.email = get_user_details.rows[0].dataValues.email;
        user_details.link = process.env.WEBURL + '/ebinaa/html/ebinaa-admin/dist/reset-password/' + validation_hash;
        resolve(user_details);
      })
      global.eventEmitter.emit('forget_password_email_link', user_details);
      return res.send({ status: 200, msg: 'You have successsfully reset your password, please confirm the link on your provided email address', message: 'You have successsfully reset your password, please confirm the link on your provided email address' })
    }
    catch (err) {
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });

    }
  })()
}
/**reset-password api
method:PUT
input:body[id,password],
output:data,
purpose:to update password
created by arijit saha
*/

/**
 * @swagger
 * /api/admin/reset-password:
 *  put:
 *   tags:
 *    - Admin Common Routes
 *   requestBody:
 *    description: id, uid and password need  for reset password
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: integer
 *            uid:
 *              type: integer
 *            password:
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

Admincontroller.resetPassword = function (req, res) {
  (async () => {
    try {
      let check_is_password_expired = await new Promise(function (resolve, reject) {
        let check_validation_data = {};
        check_validation_data.table = 'validation';
        check_validation_data.where = {};
        check_validation_data.where.id = req.body.id;
        GenericRepository.fetchData(check_validation_data).then(check_validation_result => {
          if (check_validation_result.rows[0].dataValues.is_expired == 1) {
            return res.send({ status: 401, msg: 'Link already expired', message: 'Link already expired' });
          }
          else {
            resolve()
          }
        }).catch(check_validation_err => {
          console.log(check_validation_err);
        })
      })
      let update_password = await new Promise(function (resolve, reject) {
        let update_password_data = {};
        update_password_data.table = 'admin';
        update_password_data.where = {};
        update_password_data.where.id = req.body.uid;
        update_password_data.where.role = 1;
        update_password_data.data = {};
        update_password_data.data.password = md5(req.body.password);
        GenericRepository.updateData(update_password_data).then(update_password_result => {
          let update_validation_data = {};
          update_validation_data.table = 'validation';
          update_validation_data.where = {};
          update_validation_data.where.id = req.body.id;
          update_validation_data.data = {};
          update_validation_data.data.is_expired = 1;
          update_validation_data.data.is_verified = 1;
          GenericRepository.updateData(update_validation_data).then(update_validation_result => {
            resolve();
          }).catch(update_validation_err => {
            console.log(update_validation_err);
          })
        }).catch(update_password_err => {
          console.log(update_password_err);
        })
      })
      return res.send({ status: 200, msg: 'You have successfully reset your password', message: 'You have successfully reset your password' });
    }
    catch (err) {
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
    }
  })()
}

/**topics api
method:POST
input:body[uid],
output:data,
purpose:to fetch topics
created by arijit saha
*/


/**
 * @swagger
 * /api/admin/topics:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: uid
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
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
Admincontroller.getTopicsToInvite = function (req, res) {
  (async () => {
    try {
      let previous_invited_topicIds = await new Promise(function (resolve, reject) {
        let previous_invited_topicIds = [];
        let validation_where = {};
        validation_where.uid = req.query.uid;
        validation_where.role = 4;
        validation_where.validation_type = 'invite_to_article'
        console.log('********** validation_where ***********', validation_where)
        ConsultationhubRepository.fetchValidationData(validation_where).then(validation_result => {
          if (validation_result.rows.length > 0) {
            for (let i = 0; i < validation_result.rows.length; i++) {
              previous_invited_topicIds.push(validation_result.rows[i].dataValues.article.dataValues.topic_id);
            }
            resolve(previous_invited_topicIds);
          }
          else {
            resolve(previous_invited_topicIds);
          }
        }).catch(validation_err => {
          console.log(2058, validation_err);
        })
      })
      console.log('****** previous_invited_topicIds *******', previous_invited_topicIds);
      // return;
      let get_remaining_topics = await new Promise(function (resolve, reject) {
        let get_remaining_topics;
        let topic_data = {};
        topic_data.table = 'article_topics';
        topic_data.where = {};
        topic_data.where.id = { $notIn: previous_invited_topicIds };
        topic_data.where.is_active = 1;
        topic_data.where.is_deleted = 0;
        topic_data.attributes = ['id', 'name', 'title', 'description']
        let sort_by = ['name', 'ASC'];
        GenericRepository.fetchDataSortWithAttributes(topic_data, sort_by).then(topic_result => {
          get_remaining_topics = topic_result;
          resolve(get_remaining_topics);
        }).catch(topic_err => {
          console.log(topic_err);
        })
      })
      return res.send({ status: 200, message: 'Topics', purpose: 'To get listing of topics which are not previously invited', data: get_remaining_topics });

    }
    catch (err) {
      return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' })
    }
  })()
}
// Admincontroller.getTopicsToInvite = function(req, res){
//   (async()=>{
//     try{
//       let previous_invited_topicIds = await new Promise(function(resolve, reject){
//         let previous_invited_topicIds = [];
//         let validation_data = {};
//         validation_data.table = 'validation';
//         validation_data.where = {};
//         validation_data.where.uid = req.query.uid;
//         validation_data.where.role = 4;
//         validation_data.where.validation_type = 'invite_to_article';
//         GenericRepository.fetchData(validation_data).then(validation_result=>{
//           if(validation_result.rows.length > 0){
//             for(let i = 0; i < validation_result.rows.length; i++){
//               previous_invited_topicIds.push(validation_result.rows[i].dataValues.validation_meta)
//             }
//             resolve(previous_invited_topicIds)
//           }
//           else{
//             resolve(previous_invited_topicIds);

//           }
//         }).catch(validation_err=>{
//           console.log(validation_err);
//         })
//       })
//       let get_remaining_topics = await new Promise(function(resolve, reject){
//         let get_remaining_topics;
//         let topic_data = {};
//         topic_data.table = 'article_topics';
//         topic_data.where = {};
//         topic_data.where.id = {$notIn:previous_invited_topicIds};
//         topic_data.where.is_active = 1;
//         topic_data.where.is_deleted = 0;
//         topic_data.attributes = ['id', 'name', 'title', 'description']
//         let sort_by = ['name', 'ASC'];
//         GenericRepository.fetchDataSortWithAttributes(topic_data, sort_by).then(topic_result=>{
//           get_remaining_topics = topic_result;
//           resolve(get_remaining_topics);
//         }).catch(topic_err=>{
//           console.log(topic_err);
//         })
//       })
//       return res.send({status:200, message:'Topics', purpose:'To get listing of topics which are not previously invited', data:get_remaining_topics });

//     }
//     catch(err){
//       return res.send({status:500, msg:'Something went wrong'})
//     }
//   })()
// }

/**image-upload API
method:GET
input:body[id],
output:data,
purpose:to view articles
created by anirban das.
*/

/**
 * @swagger
 * /api/admin/article-details:
 *  get:
 *   tags:
 *    - Articles
 *   parameters:
 *    - in: query
 *      name: id
 *      required: true
 *      schema:
 *       type: integer
 *       value: 1
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
Admincontroller.viewArticleDetails = (req, res) => {

  (async () => {

    try {
      
      let information = {};
      information.table = 'articles';

      information.where = { id: parseInt(req.query.id), is_deleted: 0 };


      let data = await GenericRepository.fetchData(information)

      res.send({ status: 200, data: data, message: 'Article details data fetch successfully', purpose: "Article details article fetching" });



    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/**upload-image-our-story api
method:POST
input:body[upload],
output:data,
purpose:to update image
created by arijit saha
*/

/**
 * @swagger
 * /api/admin/upload-image-our-story:
 *  post:
 *   tags:
 *    - CMS Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      multipart/form-data:  
 *        schema:
 *          type: object
 *          properties:
 *            upload:
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

Admincontroller.uploadImageOurStory = (req, res) => {
  (async () => {
    try {
      // return res.send({status:200, msg:'Preview Image', uploaded:1, fileName:req.files.upload[0].filename, url: global.constants.IMG_URL.cms_content+req.files.upload[0].filename});
      return res.send({ status: 200, msg: 'Preview Image', message: 'Preview Image', uploaded: 1, fileName: req.files.upload[0].filename, url: process.env.APIURL + '/uploads/' + global.constants.IMG_URL.cms_content + req.files.upload[0].filename });

      // global.constants.WEBURL+':'+process.env.SERVER_PORT+'/uploads/'+global.constants.IMG_URL.cms_content+req.files.upload[0].filename 
    } catch (err) {
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({ status: 500, uploaded: 0, error: { message: "The file is too big." } });

    }


  })()

}

/**update article api
method:PUT
input:body[title,data,description,is_active,writer,writer_name],
output:message,purpose
purpose:to update the article
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/article-details:
 *  put:
 *   tags:
 *    - Articles
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
 *            title:
 *              type: string
 *            data:
 *              type: string
 *            description:
 *              type: string
 *            is_approved:
 *              type: integer
 *            writer:
 *              type: string
 *            writer_name:
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
Admincontroller.updateArticle = (req, res) => {
  (async () => {

    try {
    await sequelize.transaction(async (t) => {

      let information = {};
      information.table = 'articles';

      information.where = { id: parseInt(req.body.id) };
      information.data = {
        title: req.body.title,
        data: req.body.data,
        description: req.body.description,
        is_approved: req.body.is_approved,
        writer: req.body.writer,
        writer_name: req.body.writer_name
      }

      information.transaction=t;

      let data = await GenericRepository.updateData(information)

      res.send({ status: 200, message: 'Article details data updated successfully', purpose: "Article details article updated",data:[] });

    })

    } catch (err) {
      console.trace(err)

      res.send({ status: 500, err: err });

    }


  })()

}

/**upload image for article api
method:POST
input:body[upload],
output:image uploaded link,
purpose:to upload image
created by sayanti nath
*/

/**
 * @swagger
 * /api/admin/article_image:
 *  post:
 *   tags:
 *    - Articles
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      'multipart/form-data':  
 *        schema:
 *          type: object
 *          properties:
 *            upload:
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

Admincontroller.uploadArticleImage = (req, res) => {
  (async () => {
    try {
      // return res.send({status:200, msg:'Preview Image', uploaded:1, fileName:req.files.upload[0].filename, url: global.constants.IMG_URL.cms_content+req.files.upload[0].filename});
      return res.send({ status: 200, msg: 'Preview Image', message: 'Preview Image', uploaded: 1, fileName: req.files.upload[0].filename, url: process.env.APIURL + '/uploads/' + global.constants.IMG_URL.article_photo + req.files.upload[0].filename });

      // global.constants.WEBURL+':'+process.env.SERVER_PORT+'/uploads/'+global.constants.IMG_URL.cms_content+req.files.upload[0].filename 
    } catch (err) {
      console.trace(err)
      // res.send({status:500, err:err});
      res.send({ status: 500, uploaded: 0, error: { message: "The file is too big." } });

    }


  })()

}

/**addLanguage API
method:POST
input:body[`field_key`, `group_name`, `arabic`, `english`, `is_active`], headers[x-access-token]
purpose:To add languages.
created by:Arijit Saha
*/
/**
     * To add languages with respect to `field_key`, `group_name`, `arabic`, `english`, `is_active` and `x-access-token`
     * @param {Number} `is_active` 
     * @param {String} `x-access-token`, `field_key`, `group_name`, `arabic`, `english` 
     * @return {data} result
*/

/**
 * @swagger
 * /api/admin/language:
 *  post:
 *   tags:
 *    - Website Language
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            field_key:
 *              type: string
 *            group_name:
 *              type: string
 *            arabic:
 *              type: string
 *            english:
 *              type: string
 *            is_active:
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

Admincontroller.addLanguage = function (req, res) {
  (async () => {
    try {
      let check_is_language_exist = await new Promise(function (resolve, reject) {
        let check_language_data = {};
        check_language_data.table = 'languages';
        check_language_data.where = {};
        check_language_data.where.field_key = req.body.field_key;
        check_language_data.where.group_name = req.body.group_name;
        check_language_data.where.english = req.body.english;
        // check_language_data.where.is_active = parseInt(req.body.is_active);
        GenericRepository.fetchData(check_language_data).then(check_language_result => {
          if (check_language_result.rows.length > 0) {
            return res.send({ status: 409, message: 'Word is already exists.' })
          }
          else {
            resolve()
          }
        }).catch(check_language_err => {
          console.log(2276, check_language_err);
          return res.send({ status: 500, message: 'Something went wrong.' })
        })



      })
      let add_language = await new Promise(function (resolve, reject) {
        let add_language;
        let add_language_data = {};
        add_language_data.table = 'languages';
        add_language_data.data = {};
        add_language_data.data.field_key = req.body.field_key;
        add_language_data.data.group_name = req.body.group_name;
        add_language_data.data.arabic = req.body.arabic;
        add_language_data.data.english = req.body.english;
        add_language_data.data.is_active = parseInt(req.body.is_active);
        GenericRepository.createData(add_language_data).then(add_language_result => {
          add_language = add_language_result;
          resolve(add_language)
        }).catch(add_language_err => {
          console.log(2269, add_language_err);
        })
      })
      return res.send({ status: 201, message: 'Language is added successfully.', purpose: 'To add languages', data: add_language });
    }
    catch (err) {
      console.log(2260, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**editLanguage API
method:PUT
input:body[id], headers[x-access-token,`arabic`, `english`, `is_active`]
purpose:To update languages.
created by:Arijit Saha
*/
/**
     * To update languages with respect to `id`, `arabic`, `english`, `is_active` and `x-access-token`
     * @param {Number} `is_active`, `id` 
     * @param {String} `x-access-token`, `arabic`, `english` 
     * @return {data} result
*/


/**
 * @swagger
 * /api/admin/language:
 *  put:
 *   tags:
 *    - Website Language
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
 *              type: string
 *            arabic:
 *              type: string
 *            english:
 *              type: string
 *            is_active:
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

Admincontroller.editLanguage = function (req, res) {
  (async () => {
    try {
      let update_language = await new Promise(function (resolve, reject) {
        let update_data = {};
        update_data.table = 'languages';
        update_data.where = {};
        update_data.where.id = parseInt(req.body.id);
        update_data.data = {};
        // update_data.data.field_key = req.body.field_key;
        // update_data.data.group_name = req.body.group_name;
        update_data.data.arabic = req.body.arabic;
        update_data.data.english = req.body.english;
        update_data.data.is_active = parseInt(req.body.is_active);
        GenericRepository.updateData(update_data).then(update_result => {
          resolve();
        }).catch(update_err => {
          console.log(2327, update_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })

      })
      return res.send({ status: 200, message: 'Language is updated succesfully.', purpose: 'To update each language.' })
    }
    catch (err) {
      console.log(2316, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**languages API
method:GET
input:params[page,limit,search_text], headers[x-access-token]
purpose:To add languages.
created by:Arijit Saha
*/
/**
     * To edit languages with respect to `page`,`limit`, `search_text` and `x-access-token`
     * @param {Number} `page`,`limit` 
     * @param {String} `x-access-token`, `search_text` 
     * @return {data} result
*/


/**
 * @swagger
 * /api/admin/language:
 *  get:
 *   tags:
 *    - Website Language
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
 *    - in: query
 *      name: search_text
 *      schema:
 *       type: string
 *    - in: query
 *      name: group_name
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


Admincontroller.languages = function (req, res) {
  (async () => {
    try {
      let set_data = await new Promise(function (resolve, reject) {
        let set_data = {};
        set_data.table = 'languages';
        set_data.where = {}
        // set_data.is_active = 1;

        let and_data = [];
        let or_data = [];
        let name_data = [];
        and_data.push()

        if (req.query.search_text) {
          or_data.push({ $or: [{ field_key: { $like: '%' + req.query.search_text + '%' } }, { group_name: { $like: '%' + req.query.search_text + '%' } }, { arabic: { $like: '%' + req.query.search_text + '%' } }, { english: { $like: '%' + req.query.search_text + '%' } }] })
        }

        if (req.query.group_name) {
          name_data.push({ group_name: req.query.group_name })
        }




        if (name_data.length > 0 && or_data.length > 0) {
          set_data.where = { $or: or_data, $and: name_data };
        }

        else if (name_data.length > 0) {

          set_data.where = name_data;
        }

        else if (or_data.length > 0) {

          set_data.where = { $or: or_data, $and: and_data };
        }
        else {
          set_data.where = and_data;

        }






        resolve(set_data);
      })




      let get_languages = await new Promise(function (resolve, reject) {
        let get_languages;
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit * (page - 1);
        let order = [['createdAt', 'DESC']];
        GenericRepository.fetchDatalimit(set_data, limit, offset, order).then(languages_result => {
          if (languages_result.rows.length > 0) {
            get_languages = languages_result;
            resolve(get_languages)
          }
          else {
            return res.send({ status: 404, message: 'No languages found.' })
          }

        }).catch(languages_err => {
          console.log(2390, languages_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      let get_languages_count = await new Promise(function (resolve, reject) {
        let get_languages_count;
        GenericRepository.fetchData(set_data).then(all_languages_result => {
          get_languages_count = all_languages_result.rows.length;
          resolve(get_languages_count);
        }).catch(all_languages_err => {
          console.log(2399, all_languages_err);
          return res.send({ status: 500, message: 'Something went wrong' });
        })
      })
      return res.send({ status: 200, message: 'Languages', purpose: 'To get all language listings', no_of_languages: get_languages_count, data: get_languages });
    }
    catch (err) {
      console.log(2367, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**languageDetails API
method:GET
input:params[id], headers[x-access-token]
purpose:To get each language details.
created by:Arijit Saha
*/
/**
     * To get each language details with respect to `id` and `x-access-token`
     * @param {Number} `id` 
     * @param {String} `x-access-token` 
     * @return {data} result
*/


/**
 * @swagger
 * /api/admin/language-details:
 *  get:
 *   tags:
 *    - Website Language
 *   parameters:
 *    - in: query
 *      name: id
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

Admincontroller.languageDetails = function (req, res) {
  (async () => {
    try {
      let get_language_details = await new Promise(function (resolve, reject) {
        let get_language_details;
        let language_data = {};
        language_data.table = 'languages';
        language_data.where = {};
        language_data.where.id = parseInt(req.query.id);
        GenericRepository.fetchData(language_data).then(language_result => {
          get_language_details = language_result;
          resolve(get_language_details);
        }).catch(language_err => {
          console.log(2425, language_err);
          return res.send({ status: 500, message: 'Something went wrong.' })
        })
      })
      return res.send({ status: 200, message: 'Language details', purpose: 'To get each language details', data: get_language_details });

    }
    catch (err) {
      console.log(2418, err);
      return res.send({ status: 500, message: 'Something went wrong' });
    }
  })()
}

/**deactivateConsultant API
method:PUT
input:body[id, description], headers[x-access-token]
purpose:To deactivate a consultant.
created by:Arijit Saha
*/

/**
 * @swagger
 * /api/admin/reject:
 *  put:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

Admincontroller.deactivateConsultant = function (req, res) {
  (async () => {
    try {
      let get_user_details = await new Promise(function (resolve, reject) {
        let get_user_details;
        let get_user_data = {};
        get_user_data.table = 'user';
        get_user_data.where = {};
        get_user_data.where.id = parseInt(req.body.id);
        GenericRepository.fetchData(get_user_data).then(get_user_result => {
          if (get_user_result.rows.length > 0) {
            get_user_details = get_user_result;
            resolve(get_user_details);
          }
          else {
            return res.send({ status: 404, message: 'No user found.' });
          }
        }).catch(get_user_err => {
          console.log(2495, get_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })
      let update_user_data = await new Promise(function (resolve, reject) {
        let update_user_data = {};
        update_user_data.table = 'user';
        update_user_data.where = {};
        update_user_data.where.id = parseInt(req.body.id);
        update_user_data.data = {};
        update_user_data.data.is_complete = 0;
        update_user_data.data.status = 3;
        GenericRepository.updateData(update_user_data).then(update_user_result => {
          resolve();
        }).catch(update_user_err => {
          console.log(2515, update_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })

      let note = {};
      note.table = 'admin_project_notes',
        note.data = {
          type: 2,
          description: req.body.description,
          contractor_id: req.body.id
        }

      let note_entry = await GenericRepository.createData(note)

      let name = get_user_details.rows[0].dataValues.full_name;

      name = name.split(' ').slice(0, -1).join(' ');

      let email_data = {};
      email_data.email = get_user_details.rows[0].dataValues.email;
      email_data.username = name;
      email_data.link = process.env.WEBURL + '/login/contractor';
      global.eventEmitter.emit('consultant_deactivate_email', email_data);
      return res.send({ status: 200, message: 'You have deactivated the contractor successfully.' });



    }
    catch (err) {
      console.log(2491, err);
      return res.send({ status: 500, message: 'Something went wrong.' });
    }
  })()
}


/**activeContractor API
method:PUT
input:body[id], headers[x-access-token]
purpose:To activate a Contractor.
created by:Arijit Saha
*/

/**
 * @swagger
 * /api/admin/approved:
 *  put:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

Admincontroller.activeContractor = (req, res) => {

  (async () => {
    try {
      let get_user_details = await new Promise(function (resolve, reject) {
        let get_user_details;
        let get_user_data = {};
        get_user_data.table = 'user';
        get_user_data.where = {};
        get_user_data.where.id = parseInt(req.body.id);
        GenericRepository.fetchData(get_user_data).then(get_user_result => {
          if (get_user_result.rows.length > 0) {
            get_user_details = get_user_result;
            resolve(get_user_details);
          }
          else {
            return res.send({ status: 404, message: 'No user found.' });
          }
        }).catch(get_user_err => {
          console.log(2495, get_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })
      let update_user_data = await new Promise(function (resolve, reject) {
        let update_user_data = {};
        update_user_data.table = 'user';
        update_user_data.where = {};
        update_user_data.where.id = parseInt(req.body.id);
        update_user_data.data = {};

        update_user_data.data.status = 2;
        GenericRepository.updateData(update_user_data).then(update_user_result => {
          resolve();
        }).catch(update_user_err => {
          console.log(2515, update_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })




      let note = {};
      note.table = 'admin_project_notes',
        note.data = {
          type: 2,
          description: 'contractor profile approved',
          contractor_id: req.body.id
        }

      let note_entry = await GenericRepository.createData(note)

      let name = get_user_details.rows[0].dataValues.full_name;

      name = name.split(' ').slice(0, -1).join(' ');

      let email_data = {};
      email_data.email = get_user_details.rows[0].dataValues.email;
      email_data.username = name;

      global.eventEmitter.emit('contractor_profile_approved', email_data);



      return res.send({ status: 200, message: 'You have approved the contractor successfully.' });
    }
    catch (err) {
      console.log(2491, err);
      return res.send({ status: 500, message: 'Something went wrong.' });
    }

  })()





}

/*active_Contractor_Edit api
method:PUT
input:body[id]
output:data,
purpose:to edit a activeContractor
created by sayanti Nath
*/


/**
 * @swagger
 * /api/admin/approved-edit:
 *  put:
 *   tags:
 *    - Users
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/x-www-form-urlencoded:
 *        schema:
 *          type: object
 *          properties:
 *            id:
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

Admincontroller.activeContractorEdit = (req, res) => {

  (async () => {
    try {
      let get_user_details = await new Promise(function (resolve, reject) {
        let get_user_details;
        let get_user_data = {};
        get_user_data.table = 'user';
        get_user_data.where = {};
        get_user_data.where.id = parseInt(req.body.id);
        GenericRepository.fetchData(get_user_data).then(get_user_result => {
          if (get_user_result.rows.length > 0) {
            get_user_details = get_user_result;
            resolve(get_user_details);
          }
          else {
            return res.send({ status: 404, message: 'No user found.' });
          }
        }).catch(get_user_err => {
          console.log(2495, get_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })
      let update_user_data = await new Promise(function (resolve, reject) {
        let update_user_data = {};
        update_user_data.table = 'user';
        update_user_data.where = {};
        update_user_data.where.id = parseInt(req.body.id);
        update_user_data.data = {};

        update_user_data.data.status = 2;
        GenericRepository.updateData(update_user_data).then(update_user_result => {
          resolve();
        }).catch(update_user_err => {
          console.log(2515, update_user_err);
          return res.send({ status: 500, message: 'Something went wrong.' });
        })
      })


      let validation_hash = await new Promise(function (resolve, reject) {
        let validation_hash;
        commonFunnction.getRandomString(10).then((randNum) => {
          validationhash = randNum
          resolve(validation_hash)
        }).catch(randErr => {
          console.log(randErr);
          return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
        })

      }).then(result => {
        return result;
      }).catch(err => {
        console.log(err);
        return res.send({ status: 500, msg: 'Something went wrong', message: 'Something went wrong' });
      })



      let order = [['id', 'DESC']];
      let user_demo = {};
      user_demo.table = 'temp_users',
        user_demo.where = { user_id: req.body.id };
      let user_fetch = await GenericRepository.fetchDataOrder(user_demo, order);

      if (user_fetch.rows.length > 0) {



        let user = {};
        user.table = 'user',
          user.where = { id: req.body.id };
        user.data = {
          full_name: user_fetch.rows[0].dataValues.full_name,
          email: user_fetch.rows[0].dataValues.email,
          phone: user_fetch.rows[0].dataValues.phone,
          city: user_fetch.rows[0].dataValues.city,
          company_name: user_fetch.rows[0].dataValues.company_name,
          is_phone_verified: user_fetch.rows[0].dataValues.is_phone_verified,
          is_email_verified: 1
          //password:user_fetch.rows[0].dataValues.password
        }

        let user_fetch_main = await GenericRepository.fetchData(user);

        if (user_fetch.rows[0].dataValues.password != null) {
          user.data.password = user_fetch.rows[0].dataValues.password;
        }

        let user_update = await GenericRepository.updateData(user);

      }



      let temp_contractor_metas = {};
      temp_contractor_metas.table = 'template_contractor_metas',
        temp_contractor_metas.where = { contractor_id: user_fetch.rows[0].dataValues.id };
      let temp_contractor_metas_fetch = await GenericRepository.fetchData(temp_contractor_metas);

      console.log(temp_contractor_metas_fetch);

      for (index in temp_contractor_metas_fetch.rows) {
        let contractor_metas_add = {};
        contractor_metas_add.table = 'contractor_metas',
          contractor_metas_add.where = { key_name: temp_contractor_metas_fetch.rows[index].dataValues.key_name, contractor_id: req.body.id };
        let contractor_metas_add_data = await GenericRepository.fetchData(contractor_metas_add);
        console.log(contractor_metas_add_data);
        if (contractor_metas_add_data.rows.length > 0) {
          let data = {};
          data.table = 'contractor_metas',
            data.where = { id: contractor_metas_add_data.rows[0].dataValues.id };
          data.data = { key_value: temp_contractor_metas_fetch.rows[index].dataValues.key_value }
          let data_update = await GenericRepository.updateData(data);
        }
        else {
          let data_add = {};
          data_add.table = 'contractor_metas',
            data_add.data = {
              key_name: temp_contractor_metas_fetch.rows[index].dataValues.key_value,
              group_name: temp_contractor_metas_fetch.rows[index].dataValues.group_name,
              key_value: temp_contractor_metas_fetch.rows[index].dataValues.key_value,
              contractor_id: req.body.id
            }
          let data_add_value = await GenericRepository.createData(data_add);

        }

      }









      let temp_contractor_manpowers = {};
      temp_contractor_manpowers.table = 'temp_contractor_manpowers',
        temp_contractor_manpowers.where = { contractor_id: user_fetch.rows[0].dataValues.id };
      let temp_contractor_manpowers_fetch = await GenericRepository.fetchData(temp_contractor_manpowers);


      if (temp_contractor_manpowers_fetch.rows.length > 0) {


        let contractor_manpowers = {};
        contractor_manpowers.table = 'contractor_manpowers',
          contractor_manpowers.where = { contractor_id: req.body.id };
        let contractor_manpowers_delete = await GenericRepository.deleteData(contractor_manpowers);

        for (index in temp_contractor_manpowers_fetch.rows) {
          let contractor_manpowers_add = {};
          contractor_manpowers_add.table = 'contractor_manpowers',
            contractor_manpowers_add.data = {
              contractor_id: req.body.id,
              specalization: temp_contractor_manpowers_fetch.rows[index].dataValues.specalization,
              employee_type: temp_contractor_manpowers_fetch.rows[index].dataValues.employee_type,
              employee_no_oman: temp_contractor_manpowers_fetch.rows[index].dataValues.employee_no_oman,
              employee_no_non_oman: temp_contractor_manpowers_fetch.rows[index].dataValues.employee_no_non_oman,



            }

          let contractor_manpowers_add_data = await GenericRepository.createData(contractor_manpowers_add);
        }
      }

      let resources_demo = {};
      resources_demo.table = 'resources_demo',
        resources_demo.where = {
          user_id: req.body.id,
          type: 'contractor_cr_certificate'

        }

      let resouces_demo_fetch = await GenericRepository.fetchData(resources_demo);


      if (resouces_demo_fetch.rows.length > 0) {
        let update = {}
        update.table = 'resources',
          update.where = { id: resouces_demo_fetch.rows[0].dataValues.id },
          update.data = {
            resource_url: resouces_demo_fetch.rows[0].dataValues.resource_url
          }

        let update_data = await GenericRepository.updateData(update);

      }

      let resources_demo_owners_national_id = {};
      resources_demo_owners_national_id.table = 'resources_demo',
        resources_demo_owners_national_id.where = {
          user_id: req.body.id,
          type: 'owners_national_id'

        }

      let resouces_demo_fetch_owners_national_id = await GenericRepository.fetchData(resources_demo_owners_national_id);

      if (resouces_demo_fetch_owners_national_id.rows.length > 0) {
        let update_resouces_demo_fetch_owners_national_id = {}
        update_resouces_demo_fetch_owners_national_id.table = 'resources',
          update_resouces_demo_fetch_owners_national_id.where = { id: resouces_demo_fetch_owners_national_id.rows[0].dataValues.id },
          update_resouces_demo_fetch_owners_national_id.data = {
            resource_url: resouces_demo_fetch_owners_national_id.rows[0].dataValues.resource_url
          }

        let update_data_1 = await GenericRepository.updateData(update_resouces_demo_fetch_owners_national_id);

      }


      let resources_demo_man = {};
      resources_demo_man.table = 'resources_demo',
        resources_demo_man.where = {
          user_id: req.body.id,
          type: 'man_powers_report'

        }

      let resouces_demo_man_fetch = await GenericRepository.fetchData(resources_demo_man);

      if (resouces_demo_man_fetch.rows.length > 0) {
        let update_man = {};
        update_man.table = 'resources',
          update_man.where = { id: resouces_demo_man_fetch.rows[0].dataValues.id },
          update_man.data = {
            resource_url: resouces_demo_man_fetch.rows[0].dataValues.resource_url
          }

        let update_man_data = await GenericRepository.updateData(update_man);

      }



      let resources_demo_company = {};
      resources_demo_company.table = 'resources_demo',
        resources_demo_company.where = {
          user_id: req.body.id,
          type: 'company_profile_contractor'

        }

      let resources_demo_company_fetch = await GenericRepository.fetchData(resources_demo_company);

      if (resources_demo_company_fetch.rows.length > 0) {
        let update_comapny = {};
        update_comapny.table = 'resources',
          update_comapny.where = { id: resources_demo_company_fetch.rows[0].dataValues.id },
          update_comapny.data = {
            resource_url: resources_demo_company_fetch.rows[0].dataValues.resource_url
          }

        let update_comapny_data = await GenericRepository.updateData(update_comapny);

      }


      let resources_demo_other = {};
      resources_demo_other.table = 'resources_demo',
        resources_demo_other.where = {
          user_id: req.body.id,
          type: 'other_files'

        }

      let resources_demo_other_fetch = await GenericRepository.fetchData(resources_demo_other);

      if (resources_demo_other_fetch.rows.length > 0) {

        let update_other = {};
        update_other.table = 'resources',
          update_other.where = { id: resources_demo_other_fetch.rows[0].dataValues.id },
          update_other.data = {
            resource_url: resources_demo_other_fetch.rows[0].dataValues.resource_url
          }

        let update_other_data = await GenericRepository.updateData(update_other);


      }



      if (get_user_details.rows[0].dataValues.email != user_fetch.rows[0].dataValues.email) {
        let validation_data = {};
        validation_data.table = 'validation';
        validation_data.data = {};
        validation_data.data.uid = req.body.id;
        validation_data.data.role = 3;
        validation_data.data.validation_type = 'email';
        validation_data.data.validation_hash = validationhash;
        validation_data.data.ref_email = user_fetch.rows[0].dataValues.email;
        await GenericRepository.createData(validation_data);
        let create_user_data = {};
        create_user_data.name = user_fetch.rows[0].dataValues.full_name;
        create_user_data.email = user_fetch.rows[0].dataValues.email;
        create_user_data.link = process.env.WEBURL + '/ebinaa/html/account-verified/' + validationhash;//change the url here
        global.eventEmitter.emit('account_activation_email_link', create_user_data);

      }


      let user_delete = {};
      user_delete.table = 'temp_users',
        user_delete.where = { user_id: req.body.id };
      let user_datele_data = await GenericRepository.deleteData(user_delete);


      let user_fetch_email = {};
      user_fetch_email.table = 'user',
        user_fetch_email.where = { id: req.body.id };
      let user_fetch_email_data = await GenericRepository.fetchData(user_fetch_email);




      let note = {};
      note.table = 'admin_project_notes',
        note.data = {
          type: 2,
          description: 'contractor profile approved',
          contractor_id: req.body.id
        }

      let note_entry = await GenericRepository.createData(note)

      let name = get_user_details.rows[0].dataValues.full_name;

      name = name.split(' ').slice(0, -1).join(' ');

      let email_data = {};
      email_data.email = get_user_details.rows[0].dataValues.email;
      email_data.username = name;

      global.eventEmitter.emit('contractor_profile_approved', email_data);



      return res.send({ status: 200, message: 'You have approved the contractor successfully.', data: user_fetch.rows[0] });
    }
    catch (err) {
      console.log(2491, err);
      return res.send({ status: 500, message: 'Something went wrong.' });
    }

  })()





}


/**project-status API
method:PUT
input:body[id], headers[x-access-token]
purpose:To delete stage.
created by:Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/stage-status:
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

Admincontroller.stageDelete = async (req, res) => {
  try {
    await sequelize.transaction(async (t) => {

    let stage = {};
    stage.table = 'project_stages',
      stage.where = { id: req.body.id };
    stage.data = {
      is_deleted: 1
    }
    stage.transction=t;

    let stage_delete = await GenericRepository.updateData(stage);

    return res.send({ status: 200, message: 'stage deleted' })
  })

  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }

}


/**project
method:GET
input:body[project_id], headers[x-access-token]
purpose:To show project details.
created by:Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project:
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

Admincontroller.projectClientConsultant = async (req, res) => {
  try {

    let project = {};
    project.where = { id: req.query.project_id };
    let project_view = await ConsultationhubRepository.fetchProjectDataClientConsultant(project);

    for (index in project_view.rows) {
      let sign = {};
      sign.table = 'project_contracts',
        sign.where = { project_id: project_view.rows[index].dataValues.id, cllient_acceptance: 1, contractor_acceptance: 1 }
      let sign_fetch = await GenericRepository.fetchData(sign);
      if (sign_fetch.rows.length > 0) {
        project_view.rows[index].dataValues.sign_complete = 1
      }
      else {
        project_view.rows[index].dataValues.sign_complete = 0
      }
    }

    return res.send({ status: 200, message: 'project client consultant details',purpose:'project client consultant details', data: project_view })
  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }

}



/**inviteconsultant-list
method:GET
input:query[limit,offset], headers[x-access-token]
purpose:To show invite consultant.
created by:Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/inviteconsultant-list:
 *  get:
 *   tags:
 *    - Admin Common Routes
 *   parameters:
 *    - in: query
 *      name: page
 *      required: true
 *      schema:
 *       type: string
 *       value: 1
 *    - in: query
 *      name: limit
 *      required: true
 *      schema:
 *       type: string
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

Admincontroller.inviteConsultantList = async (req, res) => {
  try {

    if (!req.query.page) return res.status(422).json({ status: 422, message: "page is required", fieldObject: 'query' });
    if (!req.query.limit) return res.status(422).json({ status: 422, message: "limit is required", fieldObject: 'query' });

    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let offset = limit * (page - 1);

    let and_data = [];
    let or_data = [];
    and_data.push({ validation_type: 'ref' });

    if (req.query.search_text) {


      or_data.push({ ref_email: { $like: '%' + req.query.search_text + '%' } });


    }

    let inviteConsultant = {};
    inviteConsultant.table = 'validation';
    if (or_data.length > 0) {
      inviteConsultant.where = { $or: or_data, $and: and_data };
    } else {
      inviteConsultant.where = and_data;
    }


    let order = [[]];
    order = [['id', 'DESC']];
    let inviteConsultant_list = await GenericRepository.fetchDatalimit(inviteConsultant, limit, offset, order);

    return res.send({ status: 200, message: 'invite people listing', data: inviteConsultant_list })
  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }

}



/**project-doc-upload
method:POST
input:body[project_docs_tags,project_id], headers[x-access-token]
purpose:To upload project docs
created by:Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-doc-upload:
 *  post:
 *   tags:
 *    - Project Doc
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

Admincontroller.uploadDocFromAdmin = async function (req, res) {
  try {

    var data = {};
    let project_docs_and_tags = {};
    project_docs_and_tags.data = JSON.parse(req.body.project_docs_and_tags);
    data.project_docs_data = [];
    if (req.body.project_docs_and_tags && project_docs_and_tags.data.length > 0) {
      var project_docs = {};
      var project_tags = {};


      project_docs_and_tags.data.forEach(async (item, index, arr) => {
        project_docs.data = JSON.parse(JSON.stringify(item));
        project_docs.data.project_id = req.body.project_id;
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
            let drawingEventEmmiter = { project_id: project_data.id, type: 'drawing', zip_type: 'drawing_zip' };
            global.eventEmitter.emit('createProjectDrawingZip', drawingEventEmmiter);
            let docEventEmmiter = { project_id: project_data.id, type: 'document', zip_type: 'document_zip' };
            global.eventEmitter.emit('createProjectDrawingZip', docEventEmmiter);
            let otherEventEmmiter = { project_id: project_data.id, type: 'other', zip_type: 'other_zip' };
            global.eventEmitter.emit('createProjectDrawingZip', otherEventEmmiter);
          }

          res.send({ status: 201, data: data, message: 'project docs successfully uploaded', purpose: "project docs successfully uploaded" });


        }

      })

    }

  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}

/**project-bids
method:POST
input:body[,project_id], headers[x-access-token]
purpose:To view project bids
created by:Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/project-bid:
 *  get:
 *   tags:
 *    - Project Management
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


Admincontroller.projectBid = async function (req, res) {
  try {

    let project_bid = {};
    project_bid.table = 'project_bids';
    project_bid.where = { project_id: req.query.project_id };
    let project_bid_fetch = await ConsultationhubRepository.project_bid_deatils(project_bid);
    return res.send({ status: 200, message: 'project bids', purpose: 'to fetch project bid', data: project_bid_fetch });


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}



/**project-doc-delete
method:PUT
input:body[id], headers[x-access-token]
purpose:To delete project doc
created by:Sayanti Nath
*/



/**
 * @swagger
 * /api/admin/project-doc-delete:
 *  put:
 *   tags:
 *    - Project Doc
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

Admincontroller.projectDocumentDelete = async function (req, res) {
  try {
    await sequelize.transaction(async (t) => {

    let project_doc = {};
    project_doc.table = 'project_docs';
    project_doc.where = { id: req.body.id };
    project_doc.data = {
      is_delete: 1
    }
    project_doc.transction=t;

    let project_bid_fetch = await GenericRepository.updateData(project_doc);
    return res.send({ status: 200, message: 'project doc deleted', purpose: 'to delete project doc' ,data:[]});
  })

  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}

/**contractor-show
method:GET
input:body[id], headers[x-access-token]
purpose:To delete project doc
created by:Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/contractor-demo:
 *  get:
 *   tags:
 *    - Import
 *   parameters:
 *    - in: query
 *      name: id
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


Admincontroller.contractorDemoShow = async function (req, res) {
  try {

    let user = {};
    user.where = { user_id: req.query.id };
    let user_fetch = await ConsultationhubRepository.userDetailsDemo(user);
    for (index in user_fetch.rows) {
      let resource = {};
      resource.table = 'resources_demo',
        resource.where = { type: { $in: ['contractor_cr_certificate', 'owners_national_id', 'man_powers_report', 'company_profile_contractor', 'other_files'] }, user_id: req.query.id };
      let resource_data = await GenericRepository.fetchData(resource);
      user_fetch.rows[index].dataValues.resource = resource_data.rows

    }
    return res.send({ status: 200, message: 'user fetch',purpose:'user fetch', data: user_fetch });


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}

/**contractor-profile
method:POST
input:body[id], headers[x-access-token]
purpose:To make contractor profile
created by:Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/contractor-pdf:
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

Admincontroller.ContractorProfile = async (req, res) => {
  try {

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


    let contractor_metas = {};
    contractor_metas.table = 'contractor_metas',
      contractor_metas.where = { key_name: 'hq_location', contractor_id: req.body.id };
    let contractor_fetch = await GenericRepository.fetchData(contractor_metas)

    console.log(contractor_fetch)


    let contractor_metas_company = {};
    contractor_metas_company.table = 'contractor_metas',
      contractor_metas_company.where = { key_name: 'company_address', contractor_id: req.body.id };
    let contractor_company_fetch = await GenericRepository.fetchData(contractor_metas_company)


    let contractor_metas_cr = {};
    contractor_metas_cr.table = 'contractor_metas',
      contractor_metas_cr.where = { key_name: 'cr_number', contractor_id: req.body.id };
    let contractor_metas_cr_fetch = await GenericRepository.fetchData(contractor_metas_cr);




    let contractor_metas_start_date = {};
    contractor_metas_start_date.table = 'contractor_metas',
      contractor_metas_start_date.where = { key_name: 'cr_start_date', contractor_id: req.body.id };
    let contractor_metas_start_date_fetch = await GenericRepository.fetchData(contractor_metas_start_date);



    if (contractor_metas_start_date_fetch.rows[0].dataValues.key_value == '0') {
      var text1 = '0'
    }


    var datatime = [];
    var month = [];
    var year = [];
    var time = contractor_metas_start_date_fetch.rows[0].dataValues.key_value;
    //console.log( time.toString().length);
    var data = time.split('', 8);
    console.log(data.length);
    console.log(data[2]);



    if (data.length == 7) {

      console.log('//////');

      if (data[2] == 1) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('january');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }


      if (data[2] == 2) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('February');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }

      if (data[2] == 3) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('March');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }

      if (data[2] == 4) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('April');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }

      if (data[2] == 5) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('May');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }


      if (data[2] == 6) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('June');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }


      if (data[2] == 7) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('july');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }

      if (data[2] == 8) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('August');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }

      if (data[2] == 9) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('September');
        year.push(data[3]);
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
      }




    }


    else {


      if (data[2] == 0 && data[3] == 1) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('january');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 2) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('February');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 3) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('March');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 4) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('April');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 5) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('May');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }


      if (data[2] == 0 && data[3] == 6) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('June');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }


      if (data[2] == 0 && data[3] == 7) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('july');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 8) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('August');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 0 && data[3] == 9) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('September');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }




      if (data[2] == 1 && data[3] == 0) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('octobor');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }


      if (data[2] == 1 && data[3] == 1) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('November');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }

      if (data[2] == 1 && data[3] == 2) {

        datatime.push(parseInt(data[0]));
        datatime.push(data[1]);
        month.push('December');
        year.push(data[4]);
        year.push(data[5]);
        year.push(data[6]);
        year.push(data[7]);
      }
    }


    var data_time = datatime.join("");
    var month_time = month.join("");
    var year_timr = year.join("");
    var text1 = data_time.concat(" ", month_time, " ", year_timr);
    console.log(text1);

    //  console.log(datatime.join("",2));


    //   var datetime = moment(Number(new Date(21112019))).format('Do MMMM  YYYY');

    //   console.log('//date', datetime);




    let contractor_metas_company_web = {};
    contractor_metas_company_web.table = 'contractor_metas',
      contractor_metas_company_web.where = { key_name: 'company_address', contractor_id: req.body.id };
    let contractor_metas_company_web_fetch = await GenericRepository.fetchData(contractor_metas_company_web);


    let user = {};
    user.table = 'user',
      user.where = { id: req.body.id };
    let user_fetch = await GenericRepository.fetchData(user);

    let governate_of_work = {};
    governate_of_work.table = 'contractor_metas',
      governate_of_work.where = { group_name: 'governorate_work_at', key_value: 1, contractor_id: req.body.id };
    let governate_of_work_fetch = await GenericRepository.fetchData(governate_of_work);

    let eng_count = {};
    eng_count.table = 'contractor_manpowers',
      eng_count.where = { employee_type: 1, contractor_id: req.body.id };
    let eng_count_data = await GenericRepository.fetchData(eng_count);

    var eng_counting = [];
    for (index in eng_count_data.rows) {
      eng_counting.push(eng_count_data.rows[index].dataValues.employee_no_oman, eng_count_data.rows[index].dataValues.employee_no_non_oman)
    }


    var eng_sum = eng_counting.reduce(function (a, b) {
      return a + b;
    }, 0);

    console.log('eng count', eng_sum);


    let lab_count = {};
    lab_count.table = 'contractor_manpowers',
      lab_count.where = { employee_type: 2, contractor_id: req.body.id };
    let lab_count_data = await GenericRepository.fetchData(lab_count);


    var lab_counting = [];
    for (index in lab_count_data.rows) {
      lab_counting.push(lab_count_data.rows[index].dataValues.employee_no_oman, lab_count_data.rows[index].dataValues.employee_no_non_oman)
    }


    var lab_sum = lab_counting.reduce(function (a, b) {
      return a + b;
    }, 0);


    let admin_count = {};
    admin_count.table = 'contractor_manpowers',
      admin_count.where = { employee_type: 3, contractor_id: req.body.id };
    let admin_count_data = await GenericRepository.fetchData(admin_count);

    var admin_counting = [];
    for (index in admin_count_data.rows) {
      admin_counting.push(admin_count_data.rows[index].dataValues.employee_no_oman, admin_count_data.rows[index].dataValues.employee_no_non_oman)
    }


    var admin_sum = admin_counting.reduce(function (a, b) {
      return a + b;
    }, 0);




    let applicable_construction = {};
    applicable_construction.table = 'contractor_metas',
      applicable_construction.where = { group_name: 'applicable_construction_activities', contractor_id: req.body.id, key_value: 1 };
    let applicable_construction_fetch = await GenericRepository.fetchData(applicable_construction);

    let applicable_construction_notselect = {};
    applicable_construction_notselect.table = 'contractor_metas',
      applicable_construction_notselect.where = { group_name: 'applicable_construction_activities', contractor_id: req.body.id };
    let applicable_construction_fetch_notselect = await GenericRepository.fetchData(applicable_construction_notselect);


    let applicable_construction_other = {};
    applicable_construction_other.table = 'contractor_metas',
      applicable_construction_other.where = { group_name: 'applicable_services_provided', contractor_id: req.body.id, key_value: 1 };
    let applicable_construction_fetch_other = await GenericRepository.fetchData(applicable_construction_other);

    console.log(applicable_construction_fetch_other);


    let applicable_services_notselect = {};
    applicable_services_notselect.table = 'contractor_metas',
      applicable_services_notselect.where = { group_name: 'applicable_services_provided', contractor_id: req.body.id, key_value: 0 };
    let applicable_services_fetch_notselect = await GenericRepository.fetchData(applicable_services_notselect);

    console.log(applicable_construction_fetch_other);


    let owner = {};
    owner.table = 'contractor_metas',
      owner.where = { key_name: 'is_owner_or_civil', contractor_id: req.body.id };
    let owner_fetch = await GenericRepository.fetchData(owner);

    let year_exp = {};
    year_exp.table = 'contractor_metas',
      year_exp.where = { key_name: 'years_of_experience', contractor_id: req.body.id };
    let year_exp_fetch = await GenericRepository.fetchData(year_exp);

    let comapny_history = {};
    comapny_history.table = 'contractor_metas',
      comapny_history.where = { group_name: 'company_history', key_name: 'projects_worked_on_at_once', contractor_id: req.body.id };
    let company_fetch = await GenericRepository.fetchData(comapny_history);



    let company_history_projects_delivered = {};
    company_history_projects_delivered.table = 'contractor_metas',
      company_history_projects_delivered.where = { group_name: 'company_history', contractor_id: req.body.id, key_name: 'projects_delivered' };
    let company_history_projects_delivered_fetch = await GenericRepository.fetchData(company_history_projects_delivered);

    let company_history_measures_quality_management = {};
    company_history_measures_quality_management.table = 'contractor_metas',
      company_history_measures_quality_management.where = { group_name: 'contractor_resource', contractor_id: req.body.id, key_name: 'measures_quality_management' };
    let company_history_measures_quality_management_fetch = await GenericRepository.fetchData(company_history_measures_quality_management);

    console.log('////', company_history_measures_quality_management_fetch);

    let company_history_planning_software = {};
    company_history_planning_software.table = 'contractor_metas',
      company_history_planning_software.where = { group_name: 'contractor_resource', contractor_id: req.body.id, key_name: 'planning_software' };
    let company_history_planning_software_fetch = await GenericRepository.fetchData(company_history_planning_software);

    let company_history_largest_project_value = {};
    company_history_largest_project_value.table = 'contractor_metas',
      company_history_largest_project_value.where = { group_name: 'company_history', contractor_id: req.body.id, key_name: 'largest_project_value' };
    let company_history_largest_project_value_fetch = await GenericRepository.fetchData(company_history_largest_project_value);

    let client = {};
    client.table = 'contractor_metas',
      client.where = { group_name: 'client_reference_details', contractor_id: req.body.id, };
    let client_fetch = await GenericRepository.fetchData(client);


    let resource = {};
    resource.table = 'resources',
      resource.where = { type: { $in: ['contractor_cr_certificate', 'owners_national_id', 'man_powers_report', 'company_profile_contractor', 'other_files'] }, user_id: req.body.id };
    let resouces_fetch = await GenericRepository.fetchData(resource);



    let machine = {};
    machine.table = 'contractor_metas',
      machine.where = { contractor_id: req.body.id, group_name: 'machinery' };
    let machine_fetch = await GenericRepository.fetchData(machine);

    var type_of_machine_1 = [];
    var type_of_machine_2 = [];
    var number_of_machine_0 = [];
    var number_of_machine_1 = [];
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_0') {
        type_of_machine_1.push(machine_fetch.rows[index].dataValues.key_value)
      }
      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_1') {
        type_of_machine_2.push(machine_fetch.rows[index].dataValues.key_value)
      } if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_0') {
        number_of_machine_0.push(machine_fetch.rows[index].dataValues.key_value)
      }
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_1') {
        number_of_machine_1.push(machine_fetch.rows[index].dataValues.key_value)
      }



    }


    let machine_count = {};
    machine_count.table = 'contractor_metas',
      machine_count.where = { contractor_id: req.body.id, group_name: 'machinery', key_name: { $in: ['number_of_machine_0', 'number_of_machine_1', 'number_of_machine_2', 'number_of_machine_3', 'number_of_machine_4', 'number_of_machine_5', 'number_of_machine_6', 'number_of_machine_7', 'number_of_machine_8', 'number_of_machine_9', 'number_of_machine_10', 'number_of_machine_11', 'number_of_machine_12', 'number_of_machine_13', 'number_of_machine_14', 'number_of_machine_15', 'number_of_machine_16', 'number_of_machine_17', 'number_of_machine_18', 'number_of_machine_19', 'number_of_machine_20'] } };
    let machine_count_fetch = await GenericRepository.fetchData(machine_count);
    //var sum=0;


    var and_array = [];
    for (index in machine_count_fetch.rows) {
      var b = parseInt(machine_count_fetch.rows[index].dataValues.key_value);
      console.log(b);
      and_array.push(b);
    }
    console.log(and_array);
    var sum = and_array.reduce(function (a, b) {
      return a + b;
    }, 0);
    console.log(sum);


    let organizations = {};
    organizations.table = 'contractor_metas',
      organizations.where = { group_name: 'organization_registered_at', contractor_id: req.body.id };
    let organizations_fetch = await GenericRepository.fetchData(organizations);

    let comapny_logo = {};
    comapny_logo.table = 'resources',
      comapny_logo.where = { user_id: req.body.id, type: 'contractor_profile_photo' };
    let company_logo_fetch = await GenericRepository.fetchData(comapny_logo)


    let html = `<!doctype html>
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
        margin: 0px auto 10px;
        padding-right:1cm;
        padding-left:1cm;
        box-sizing:border-box;
        border: 1px solid #eee;
    }
    .site-logo { 
        padding: 20px 0;
    }
    .photo-preview {
      background: url(`+ global.constants.PDFIMAGEPATH + `/uploads/general_images/No-Client-Image.png) no-repeat;
     /* background: url(./image/No-Client-Image.png); */
        width: 100px;
        height: 100px;
        margin: 0 auto;
        background-size: 100%;
        overflow: hidden;
    }
    .photo-preview img {
        width: 100px;
        height: 100px;
        margin: 0 auto;
        border-radius: 50%;
        -o-object-fit: cover;
        object-fit: cover;
    }
    .header-photo-preview {
        background: url(`+ global.constants.PDFIMAGEPATH + `/uploads/general_images/No-Client-Image.png) no-repeat;
     /* background: url(./image/No-Client-Image.png); */
        width: 75px;
        height: 75px;
        background-size: 100%;
        overflow: hidden;
    }
    .header-photo-preview img {
        width: 75px;
        height: 75px;
        border-radius: 50%;
        -o-object-fit: cover;
        object-fit: cover;
    }
    .others-photo-preview img {
        height: 35px;
        max-width: 100%
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
        font-size: 14px;
        font-weight: 500;
        line-height: 1.29;
        color: #004e98;
        padding: 0;
        margin: 0;
    }
    .pdf-h2 {
        color: #004e98;
        font-weight: 500;
        font-size: 20px;
        margin: 10px 0 0;
    }
    .pdf-h3 {
        padding-bottom: 6px;
        border-bottom: 2px solid #cfcfcf;
        color: #004e98;
        font-weight: 700;
        font-size: 15px;
        line-height: 1.3;
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
    .pdf-1 tbody td.td-shado {
      border: 1px solid #eeeeee;
      display: block;
      padding: 0;
    }
    .th-img img {
      max-width: 100%;
      height: 120px;
    }
    .pdf-1 tbody td.td-shado table tr td p, .pdf-2.his-td tr td p {
      font-size: 10px;
    }
    .pdf-1 tbody td.td-shado table tr td h6, .pdf-2.his-td tr td h6 {
      color: #1f1f1f;
      font-size: 10px;
      font-weight: 400;
    }
    ul.contract-list { margin: 0 auto;}
    ul.contract-list li {
        padding: 6px 10px 6px 23px;
        margin: 0;
        list-style-type: none;
        font-size: 10px;
        line-height: 1.43;
        color: #444445;
        font-weight: normal;
        background: url("`+ global.constants.PDFIMAGEPATH + `/uploads/general_images/green-check.svg") left top no-repeat;
        background-position: top 9px left 0;
    }
    .td-circle {
        border: 1.5px solid #004e98;
        width: 70px;
        height: 70px;
        border-radius: 50%;
        background-color: #f0f6ff;
        margin: 0 auto 10px;
        text-align: center;
    }
    .border-right {
      border-right: 1px solid #f0eded;
    }
    .td-circle h4 {
      color: #004e98;
      font-size: 18px;
      line-height: 24px;
      padding: 25px 5px;
    }
    
    
    .pdf-2 tbody td.td-2 table tr td {
      vertical-align: top;
      height: 100%;
    }
    .pdf-2 tbody td table tr td .div-shado {
      border: 1px solid #eeeeee;
      padding: 20px;
      min-height: 380px;
      height: 100%
    }
    ul.service-list { margin: 0 auto;}
    ul.service-list li {
        padding: 6px 10px 6px 23px;
        margin: 0;
        list-style-type: none;
        font-size: 9px;
        line-height: 1.43;
        color: #828282;
        font-weight: normal;
    }
    ul.service-list li.check {
      background: url("`+ global.constants.PDFIMAGEPATH + `/uploads/general_images/green-check.svg") left top no-repeat;
      background-position: top 9px left 0;
      color: #1f1f1f;
    }
    
    ul.histry-list { margin: 0 auto;}
    ul.histry-list li {
        padding: 5px 10px 5px 15px;
        margin: 0 30px 0 0;
        list-style-type: none;
        font-size: 9px;
        line-height: 1.43;
        font-weight: normal;
        background: url("`+ global.constants.PDFIMAGEPATH + `/uploads/general_images/green-check.svg") left top no-repeat;
        background-position: top 8px left 0;
        background-size: 10px;
        color: #1f1f1f;
        display: inline-block;
    }
    
    .pdf-2.his-td tr td {
      padding: 10px 20px 10px 0;
    }
    .pdf-2 .div-shado h6 {
      color: #000000;
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 5px;
        text-align: center;
    }
    
    .table-pdf {
        margin: 0 auto;
        border-radius: 2px;
        margin-bottom: 15px;
    }
    .table-pdf thead th {
        padding: 10px 20px;
    }
    .table-pdf tbody th, .table-pdf tbody td {
      padding: 15px 20px;
    }
    .table-pdf thead th {
        font-size: 10px;
        font-weight: 500;
        line-height: 14px;
        color: #0047ba;
    }
    .table-pdf.owned thead th {
      background-color: #f6f6f8;
    }
    .table-pdf.owned tbody tr td {
        border-right: 1px solid #f5f5f5;
        border-left: 1px solid #f5f5f5;
        border-bottom: 0;
        width: 50% !important;
    }
    .table-pdf.owned tbody tr:nth-child(2) td {
        border-top: 0px solid #f5f5f5;
    }
    .table-pdf tbody tr th {
      background-color: #f0f6ff;
      color: #004e98;
      width: 140px;
      border-left: 1px solid #f5f5f5;
    }
    .table-pdf tbody tr td {
      border-right: 1px solid #f5f5f5;
      color: #424242;
        font-size: 10px
    }
    .table-pdf tbody tr td:nth-child(1) {
      width: 210px;
    }
    .table-pdf tbody tr td:nth-child(2) {
      width: 130px;
    }
    .table-pdf tbody tr td:nth-child(3) {
      width: 130px;
    }
    .table-pdf tbody tr:nth-child(2) td {
      border-top: 1px solid #f5f5f5;
    }
    .table-pdf tbody tr:last-child td {
      border-bottom: 1px solid #f5f5f5;
    }
    .bl-1 { border-left: 1px solid #f5f5f5;}
    .br-1 { border-right: 1px solid #f5f5f5; }
    .bt-1 { border-top: 1px solid #f5f5f5; }
    .bb-1 { border-bottom: 1px solid #f5f5f5; }
    .td-mr-3 {  margin-left: 20px; }
    .new-logo-title img {
        max-width: 100%;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
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
    <body>
    <div class="page">
      <div class="container">
        <table class="table pdf-page-1" width="100" border="0" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                                <td class="site-logo" width="35%">
                                  <div class="header-photo-preview">`
    if (company_logo_fetch.rows.length > 0) {
      html += ` <img src="` + global.constants.PDFIMAGEPATH + `/uploads/` + company_logo_fetch.rows[0].dataValues.resource_url + `"  alt="">`
    }
    else {
      html += `<img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg"  alt="">`
    }
    html += `</div>
                                </td>
                                <td width="65%" align="right">
                                  <h3 class="pdf-h3">${user_fetch.rows[0].dataValues.company_name}</h3>
                                </td>
                            </tr>
                          </tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td>
                      <h3 style="margin-bottom: 15px;">Company Information</h3>
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="pdf-1" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                          <th class="th-img" rowspan="4">
                            <img src="image/bitmap.png" alt="">
                          </th>
                      </tr>
                      
                      <tr>
                        <td class="td-shado">
                          <table>
                          
                            <tr>
                            <td width="40%">
                                  <p>Head Quater Location</p>
                            <h6>${contractor_fetch.rows[0].dataValues.key_value}</h6>
                                </td>
                                <td width="60%">
                                  <p>Company Address</p>
                            <h6>${contractor_metas_company_web_fetch.rows[0].dataValues.key_value}</h6>
                                </td>
                            </tr>
                          </table>
                              <table>
                            <tr>
                                <td width="40%">
                                  <p>CR Number</p>
                            <h6>${contractor_metas_cr_fetch.rows[0].dataValues.key_value}</h6>
                                </td>
                                <td width="60%">
                                  <p>Company Start Date</p>`
    if (contractor_metas_start_date_fetch.rows[0].dataValues.key_value == '0') {
      html += ` <h6>0</h6> `
    }
    else {
      html += ` <h6>${text1}</h6>`
    }
    html += `  </td>
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
                      <h3 style="margin-bottom: 12px; margin-top: 0px;">Personal Information</h3>
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="pdf-1" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                        <td class="td-shado">
                          <table>
                            <tr>
                            <td width="50%">
                                  <p>Name</p>
                            <h6>${user_fetch.rows[0].dataValues.full_name}</h6>
                                </td>
                                <td width="50%">
                                  <p>Phone Number</p>
                            <h6>${user_fetch.rows[0].dataValues.phone}</h6>
                                </td>
                            </tr>
                          </table>
                              <table>
                            <tr>
                                <td width="50%">
                                  <p>Website</p>
                            <h6>${contractor_metas_company_web_fetch.rows[0].dataValues.key_value}</h6>
                                </td>
                                <td width="50%">
                                  <p>Email Address</p>
                            <h6>${user_fetch.rows[0].dataValues.email}</h6>
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
                      <h3 style="margin-bottom: 12px; margin-top: 20px;">Contractor Works in Governorates</h3>
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="pdf-1" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                        <td class="td-shado">
                          <table>
                            <tr> 
                            <td width="33.3333%">`
    if (governate_of_work_fetch.rows.length > 0) {
      for (index in governate_of_work_fetch.rows)
        html += `<ul class="contract-list">
                                  <li>${governate_of_work_fetch.rows[index].dataValues.key_name}</li>
                              </ul> `

    }

    html += ` </td>  </tr>
                          </table>
    
                        </td>
                      </tr>
                 </tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="pdf-1 circle-others" width="100" border="0" cellpadding="0" cellspacing="0">
                          <thead>
                              <tr>
                                  <th align="left" width="200px"><h3 style="margin-bottom: 15px; margin-top: 25px;">Resources</h3></th>
                                  <th width="200px">&nbsp;</th>
                                  <th width="200px">&nbsp;</th>
                                  <th align="center" width="200px"><h3 style="margin-bottom: 15px; margin-top: 25px;">&nbsp;</h3></th>
                              </tr>
                          </thead>
                          <tbody>
                      <tr>
                          <td width="200px" align="center" class="border-right">
                      <div class="td-circle">
                        <h4>${eng_sum}</h4>
                      </div>
                      <h6>Engineer</h6>                             
                                </td>
                      <td width="200px" align="center" class="border-right">
                      <div class="td-circle">
                        <h4>${lab_sum}</h4>
                      </div>
                      <h6>Labour</h6>                                           
                      </td>
                      <td width="200px" align="center">
                      <div class="td-circle">
                        <h4>${admin_sum}</h4>
                      </div>
                      <h6>Admin</h6>                                            
                      </td>
                      <td width="200px" align="center">
                      <div class="td-circle">
                        <h4>${sum}</h4>
                      </div>
                      <h6>Machines</h6>                                            
                      </td>
                      </tr>
                    </tbody>
                    </table> 
                  </td>
              </tr>
          </table>
    
          <div class="page-break"></div>
    
          <table class="table pdf-page-2" width="100" border="0" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                                <td class="site-logo" width="35%">
                                  <div class="others-photo-preview">
                                    <img src="`+ global.constants.PDFIMAGEPATH + `/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">`
    html += `</div>
                                </td>
                                <td width="65%" align="right">
                                  <table>
                                      <tr>
                                        <td align="right" style="padding-right: 10px;">
                                           <h3 class="pdf-h3">Products and Services for Construction Activities</h3>
                                        </td>
                                        <td width="55px" class="text-center site-logo">
                                       <div class="new-logo-title">`
    if (company_logo_fetch.rows.length > 0) {
      html += ` <img src="` + global.constants.PDFIMAGEPATH + `/uploads/` + company_logo_fetch.rows[0].dataValues.resource_url + `"  alt="">`
    }
    else {
      html += `<img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg"  alt="">`
    }
    html += `</div>
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
                 
              </tr>
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                        <td class="td-2">
                          <table>
                            <tr>
                            <td width="50%" style="padding-right: 10px;">
                              <div class="div-shado">
                                <h6>Products</h6>`
    for (index in applicable_construction_fetch.rows) {
      html += `<ul class="service-list">
                                  <li class="check">${applicable_construction_fetch.rows[index].dataValues.key_name}</li>`
    }
    for (index in applicable_construction_fetch_notselect.rows) {
      html += `<ul class="service-list">
                                    <li>${applicable_construction_fetch_notselect.rows[index].dataValues.key_name}</li>`
    }

    html += ` </ul>`



    html += `</div>
                                      </td>
                            <td width="50%" style="padding-left: 10px;">
                              <div class="div-shado">
                                <h6>Services</h6>`
    for (index in applicable_construction_fetch_other.rows) {
      //console.log('/////////////',index);
      html += `<ul class="service-list">
                                  <li class="check">${applicable_construction_fetch_other.rows[index].dataValues.key_name}</li>`
    }
    for (index in applicable_services_fetch_notselect.rows) {
      html += `<ul class="service-list">
                                    <li>${applicable_services_fetch_notselect.rows[index].dataValues.key_name}</li>`
    }
    html += ` </ul>`


    html += `</div>
                                      </td>
                            </tr>
                          </table>
    
                        </td>
                      </tr>
                 </tbody>
                      </table> 
                  </td>
              </tr>
          </table>

          <div class="page-break"></div>

          <table class="table pdf-page-2" width="100" border="0" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                                <td class="site-logo" width="35%">
                                  <div class="others-photo-preview">
                                    <img src="`+ global.constants.PDFIMAGEPATH + `/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">`
    html += `</div>
                                </td>
                                <td width="65%" align="right">
                                  <table>
                                      <tr>
                                        <td align="right" style="padding-right: 10px;">
                                           <h3 class="pdf-h3">Company Additional Information</h3>
                                        </td>
                                        <td width="55px" class="text-center site-logo">
                                       <div class="new-logo-title">`
    if (company_logo_fetch.rows.length > 0) {
      html += ` <img src="` + global.constants.PDFIMAGEPATH + `/uploads/` + company_logo_fetch.rows[0].dataValues.resource_url + `"  alt="">`
    }
    else {
      html += `<img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg"  alt="">`
    }
    html += `</div>
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
                      <table class="pdf-2 his-td" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                        <td width="50%">
                            <p>Is the company owner a civil engineer?</p>
                      <h6>${owner_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                          <td width="50%">
                            <p>Years of Experienc in Construction </p>
                      <h6>${year_exp_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                      </tr>
                      <tr>
                    
                      <td width="50%">
                          
                            <p>Projects delivered by the Contractor</p>
                      <h6>${company_history_projects_delivered_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                          <td width="50%">
                            <p>Largest project value awarded to Contractor</p>
                      <h6>${company_history_largest_project_value_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                      </tr>
                        <tr>
                          <td width="50%">
                            <p>Projects worked on at once in the past</p>
                      <h6>${company_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                          <td width="50%">
                            <p>Please check organizations you are registered at</p>
                          <ul class="histry-list">`
    for (index in organizations_fetch.rows) {
      html += ` <li>${organizations_fetch.rows[index].dataValues.key_value}</li>`
    }

    html += ` </ul> 
                          </td>
                      </tr>
                            <tr>
                          <td width="50%">
                            <p>What measures do you use at your company to maintain quality management on-site?</p>
                      <h6>${company_history_measures_quality_management_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                          <td width="50%">
                            <p>What project planning software do you use at your company ?</p>
                      <h6>${company_history_planning_software_fetch.rows[0].dataValues.key_value}</h6>
                          </td>
                     </tr>
                 </tbody>
                      </table> 
                  </td>
              </tr>
          </table>  

    
          <div class="page-break"></div>
    
          <table class="table pdf-page-3" width="100" border="0" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                                <td class="site-logo" width="35%">
                                  <div class="others-photo-preview">
                                    <img src="`+ global.constants.PDFIMAGEPATH + `/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">`
    html += `</div>
                                </td>
                                <td width="65%" align="right">
                                  <table>
                                      <tr>
                                        <td align="right" style="padding-right: 10px;">
                                           <h3 class="pdf-h3">Resources</h3>
                                        </td>
                                        <td width="55px" class="text-center site-logo">
                                       <div class="new-logo-title">`
    if (company_logo_fetch.rows.length > 0) {
      html += ` <img src="` + global.constants.PDFIMAGEPATH + `/uploads/` + company_logo_fetch.rows[0].dataValues.resource_url + `"  alt="">`
    }
    else {
      html += `<img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg"  alt="">`
    }
    html += `</div>
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
                      <table class="table-pdf" width="100" border="0" cellpadding="0" cellspacing="0">
                          <thead>
                              <tr>
                                  <th>&nbsp;</th>
                                  <th>&nbsp;</th>
                                  <th>Omani</th>
                                  <th>Non Omani</th>
                              </tr>
                          </thead>
                          <tbody>
                      <tr>
                          <th class="bt-1 bb-1 br-1 bl-1" rowspan="1000">
                            <h5>${eng_count_data.count}</h5>
                            <p>Engineer</p>
                          </th>
                      </tr>`

    for (index in eng_count_data.rows) {
      html += `  <tr><td>${eng_count_data.rows[index].dataValues.specalization}</td>
                        <td class="text-center">${eng_count_data.rows[index].dataValues.employee_no_oman}</td>
                        <td class="text-center">${eng_count_data.rows[index].dataValues.employee_no_non_oman}</td></tr>`

    }

    html += `</tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="table-pdf" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                          <th class="bt-1 bb-1 br-1 bl-1" rowspan="1000">
                            <h5>${lab_count_data.count}</h5>
                            <p>Labor</p>
                          </th>
                      </tr>`
    for (index in lab_count_data.rows) {
      html += `<tr><td>${lab_count_data.rows[index].dataValues.specalization}</td>
                          <td class="text-center">${lab_count_data.rows[index].dataValues.employee_no_oman}</td>
                          <td class="text-center">${lab_count_data.rows[index].dataValues.employee_no_non_oman}</td></tr>`
    }
    html += `</tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="table-pdf" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                          <th class="bt-1 bb-1 br-1 bl-1" rowspan="1000">
                            <h5>${admin_count_data.count}</h5>
                            <p>Admin</p>
                          </th>
                      </tr>`
    for (index in admin_count_data.rows) {
      html += `<tr><td>${admin_count_data.rows[index].dataValues.specalization}</td>
                          <td class="text-center">${admin_count_data.rows[index].dataValues.employee_no_oman}</td>
                          <td class="text-center">${admin_count_data.rows[index].dataValues.employee_no_non_oman}</td></tr>`
    }
    html += `</tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td style="margin-top: 30px; margin-bottom: 20px; display: block;">
                      <h3>Machines</h3>
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="table-pdf owned" width="100" border="0" cellpadding="0" cellspacing="0">
                          <thead>
                              <tr>
                                  <th class="text-left bt-1 bb-1 br-1 bl-1">Machine Type</th>
                                  <th class="bt-1 bb-1 br-1 bl-1">Number of Machine</th>
                              </tr>
                          </thead>
                          <tbody>`

    //for(index in machine_fetch.rows){


    // if(machine_fetch.rows[index].dataValues.key_name=='type_of_machine_0'){

    html += ` <tr>`

    html += `<td>${type_of_machine_1}</td>`
    //}


    //}
    // for(index in machine_fetch.rows){
    //   if(machine_fetch.rows[index].dataValues.key_name=='number_of_machine_0'){

    html += `<td>${number_of_machine_0}</td>`
    html += ` </tr>`




    //   }





    // }
    // for(index in machine_fetch.rows){


    //   if(machine_fetch.rows[index].dataValues.key_name=='type_of_machine_1'){
    html += ` <tr>`

    html += `<td>${type_of_machine_2}</td>`
    //   }

    // }
    // for(index in machine_fetch.rows){

    //   if(machine_fetch.rows[index].dataValues.key_name=='number_of_machine_1'){

    html += `<td>${number_of_machine_1}</td>`
    html += ` </tr>`




    //   }





    // }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_2') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_2') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_3') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_3') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_4') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_4') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_5') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_5') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_6') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_6') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_7') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_7') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_8') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_8') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }
    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_9') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_9') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_10') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }
    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_10') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_11') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_11') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_12') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_12') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_13') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_13') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_14') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_14') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_15') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_15') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_16') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_16') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_17') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_17') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_18') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_18') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_19') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_19') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }

    for (index in machine_fetch.rows) {


      if (machine_fetch.rows[index].dataValues.key_name == 'type_of_machine_20') {
        html += ` <tr>`

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
      }

    }

    for (index in machine_fetch.rows) {
      if (machine_fetch.rows[index].dataValues.key_name == 'number_of_machine_20') {

        html += `<td>${machine_fetch.rows[index].dataValues.key_value}</td>`
        html += ` </tr>`




      }




    }



    html += ` </tbody>
                      </table> 
                  </td>
              </tr>
          </table>
    
          <div class="page-break"></div>
    
          <table class="table pdf-page-4" width="100" border="0" cellpadding="0" cellspacing="0">
              <tr>
                  <td>
                      <table class="pdf-2" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                            <tr>
                                <td class="site-logo" width="35%">
                                  <div class="others-photo-preview">
                                    <img src="`+ global.constants.PDFIMAGEPATH + `/uploads/common_images/EBinaa-Logo-Colored.png" class="" alt="logo">`
    html += `</div>
                                </td>
                                <td width="65%" align="right">
                                  <table>
                                      <tr>
                                        <td align="right" style="padding-right: 10px;">
                                           <h3 class="pdf-h3">Client References</h3>
                                        </td>
                                        <td width="55px" class="text-center site-logo">
                                       <div class="new-logo-title">`
    if (company_logo_fetch.rows.length > 0) {
      html += ` <img src="` + global.constants.PDFIMAGEPATH + `/uploads/` + company_logo_fetch.rows[0].dataValues.resource_url + `"  alt="">`
    }
    else {
      html += `<img src="http://dev.uiplonline.com/ebinaa/pdf-templates/stage-task-details/images/No-User-Image.jpg"  alt="">`
    }
    html += `</div>
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
                      <table class="pdf-2 his-td" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>`

    html += ` <td width="50%">
                            <p>Project Location</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_location_0') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
                          <td width="50%">
                          
                            <p>Project Type</p>`

    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_type_0') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
                      </tr>
                      <tr>
                          <td width="50%">
                            <p>Phone Number</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'phone_num_0') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
                          <td width="50%">
                            <p>Project Value</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_value_0') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
                      </tr>
                        <tr>
                          <td width="50%">
                            <p>Project Completion Date</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_completion_date_0') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += ` </td>
                          <td width="50%">
                          </td>
                      
                   </tr>

                   
                 </tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                <td>
                  <table class="pdf-2 his-td" width="100" border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                  <tr>`

    html += ` <td width="50%">
                        <p>Project Location</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_location_1') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
                      <td width="50%">
                      
                        <p>Project Type</p>`

    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_type_1') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
                  </tr>
                  <tr>
                      <td width="50%">
                        <p>Phone Number</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'phone_num_1') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
                      <td width="50%">
                        <p>Project Value</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_value_1') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
                  </tr>
                    <tr>
                      <td width="50%">
                        <p>Project Completion Date</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_completion_date_1') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += ` </td>
                      <td width="50%">
                      </td>
              </tr>
              </tbody>
            </table> 
            </td>
          </tr>
          <tr>
          <td>
              <table class="pdf-2 his-td" width="100" border="0" cellpadding="0" cellspacing="0">
                  <tbody>
              <tr>`

    html += ` <td width="50%">
                    <p>Project Location</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_location_2') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
                  <td width="50%">
                  
                    <p>Project Type</p>`

    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_type_2') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
              </tr>
              <tr>
                  <td width="50%">
                    <p>Phone Number</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'phone_num_2') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }


    html += ` </td>
                  <td width="50%">
                    <p>Project Value</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_value_2') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += `</td>
              </tr>
                <tr>
                  <td width="50%">
                    <p>Project Completion Date</p>`
    for (index in client_fetch.rows) {

      if (client_fetch.rows[index].dataValues.key_name == 'project_completion_date_2') {

        html += `<h6>${client_fetch.rows[index].dataValues.key_value}</h6>`
      }
    }

    html += ` </td>
                  <td width="50%">
                  </td>
              
           </tr>

           
         </tbody>
              </table> 
          </td>
      </tr>
                
              <tr>
                  <td>
                      <h3 style="margin-bottom: 5px; margin-top: 15px;">Documents</h3>
                  </td>
              </tr>
              <tr>
                  <td>
                      <table class="pdf-2 his-td" width="100" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                      <tr>
                        <td width="100%">`
    for (index in resouces_fetch.rows) {
      html += ` <p>${process.env.APIURL + `/uploads/` + resouces_fetch.rows[index].dataValues.resource_url}</p>`

    }
    html += ` </td>
                      </tr>
                 </tbody>
                      </table> 
                  </td>
              </tr>
              <tr>
                  <td class="text-center"><p class="copy-txt">© 2020 EBinaa. All Rights Reserved. </p></td>
              </tr>
          </table>
    
      </div>
    </div>
    </body>`

    pdf.create(html, options).toFile(global.constants.uploads.contrctor_profile + 'contractor_profile_pdf' + req.body.id + '.pdf', function (err, resp) {
      res.send({ status: 200, message: 'fetched', resp: global.constants.IMG_URL.contrctor_profile_url + 'contractor_profile_pdf' + req.body.id + '.pdf' })
      if (err) return console.log(err);
      console.log(resp);
    })



  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}

/**Edit-tags
method:POST
input:body[id]
purpose:To edit project tags
created by:Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/project-tags-edit:
 *  post:
 *   tags:
 *    - Project Doc
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

Admincontroller.editTags = async (req, res) => {
  try {

    let delete_tags = {};
    delete_tags.table = 'project_doc_tags',
      delete_tags.where = { project_doc_id: req.body.project_doc_id };
    let delete_tags_data = await GenericRepository.deleteData(delete_tags);

    var b = JSON.parse(req.body.tags);
    console.log(req.body.tags);
    console.log(b);

    for (let i = 0; i < b.length; i++) {
      let add_tags = {};
      add_tags.table = 'project_doc_tags',
        add_tags.data = {
          tag_name: b[i].tag_name,
          project_doc_id: req.body.project_doc_id
        }
      let add_tags_data = await GenericRepository.createData(add_tags);

    }

    return res.send({ status: 200, message: 'tags edit' });



  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}
/*scope edit from admin
method:POST
input:body[project_metas]
output:scope edit,
purpose:scope edit
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/scope:
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

Admincontroller.editScope = async (req, res) => {
  try {


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

    return res.send({ status: 200, message: "scope edited",purpose:"scope edited",data:[] });




  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}

/*clientlist
method:GET
input:body
output:client list,
purpose:client list
created by Sayanti Nath
*/


/**
 * @swagger
 * /api/admin/client-list:
 *  get:
 *   tags:
 *    - Contractor Profile
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
 *    - in: query
 *      name: order
 *      schema:
 *       type: string
 *    - in: query
 *      name: sort
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

Admincontroller.clientList = async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let offset = limit * (page - 1);
    let and_data = [];
    let or_data = [];
    and_data.push({ user_type: 1 });

    let user = {};
    user.table = 'user';
    if (req.query.search_text) {
      or_data.push({ id: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ email: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ full_name: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ phone: { $like: '%' + req.query.search_text + '%' } });

    }


    let order = [[]];
    if (req.query.order == "namedsc") {
      order = [['full_name', 'DESC']]
    }
    else if (req.query.order == "nameasc") {
      order = [['full_name', 'ASC']]
    }
    else if (req.query.order == "emaildsc") {
      order = [['email', 'DESC']]
    }
    else if (req.query.order == "emailasc") {
      order = [['email', 'ASC']]
    }

    else if (req.query.order == "createdatdsc") {
      order = [['createdAt', 'DESC']]
    }
    else if (req.query.order == "createdatasc") {
      order = [['createdAt', 'ASC']]
    }
    else if (req.query.order == "idasc") {
      order = [['id', 'ASC']]
    }
   else {
      order = [['id', 'DESC']]
    }
    if (or_data.length > 0) {
      user.where = { $or: or_data, $and: and_data };
    } else {
      user.where = and_data;
    }

    let client_fetch = await GenericRepository.fetchDatalimit(user,limit, offset);
    //console.log(client_fetch);
    for (index in client_fetch.rows) {
      let project = {};
      project.table = 'projects',
        project.where = { user_id: client_fetch.rows[index].dataValues.id };

      let project_count = await GenericRepository.fetchData(project);
      console.log(project_count);
      client_fetch.rows[index].dataValues.projectcount = project_count.count;
      
    }
    if(req.query.sort=='projectAsc'){
      console.log('sort');
      // var fetch=await GenericRepository.fetchData(user);
      let b=client_fetch.rows;
      b.sort((a, b) => {
         return (b.projectcount- a.projectcount);
    });
   // console.log(fetch.rows);
    }




    return res.send({ status: 200, message: 'client list', purpose: 'client list', data: client_fetch})

  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
}
/*contractorlist
method:GET
input:body
output:contractor list,
purpose:contractor list
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/contractor-list:
 *  get:
 *   tags:
 *    - Contractor Profile
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
 *    - in: query
 *      name: order
 *      schema:
 *       type: string
 *    - in: query
 *      name: user_status
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


Admincontroller.contractorList = async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let offset = limit * (page - 1);
    var array = [];
    let user_data = {};
    user_data.table = 'user',
      user_data.where = { user_type: 3, is_complete: 0 };
    let user_contractor = await GenericRepository.fetchData(user_data);
    for (index in user_contractor.rows) {
      array.push(user_contractor.rows[index].dataValues.id);
    }

    let and_data = [];
    let or_data = [];
    let name_data=[];
    and_data.push({ user_type: 3 }, { id: { $notIn: array } });

    let user = {};
    user.table = 'user';
    if (req.query.search_text) {
      or_data.push({ id: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ email: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ full_name: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ phone: { $like: '%' + req.query.search_text + '%' } });

    }
    if(req.query.user_status==1){
      name_data.push({ user_type: 3 }, { id: { $notIn: array } ,status:1});
    }
    if(req.query.user_status==2){
      name_data.push({ user_type: 3 }, { id: { $notIn: array } ,status:2});
    }
    if(req.query.user_status==3){
      name_data.push({ user_type: 3 }, { id: { $notIn: array } ,status:3});
    }
    


    let order = [[]];
    if (req.query.order == "namedsc") {
      order = [['full_name', 'DESC']]
    }
    else if (req.query.order == "nameasc") {
      order = [['full_name', 'ASC']]
    }
    else if (req.query.order == "emaildsc") {
      order = [['email', 'DESC']]
    }
    else if (req.query.order == "emailasc") {
      order = [['email', 'ASC']]
    }

    else if (req.query.order == "createdatdsc") {
      order = [['createdAt', 'DESC']]
    }
    else if (req.query.order == "createdatasc") {
      order = [['createdAt', 'ASC']]
    }
    else if (req.query.order == "idasc") {
      order = [['id', 'ASC']]
    }
   else {
      order = [['id', 'DESC']]
    }
    if (name_data.length > 0 && or_data.length > 0) {
      user.where  = { $or: or_data, $and: name_data };
    }
   
    else if (name_data.length > 0) {

      user.where = name_data;
    }

    else if (or_data.length > 0) {
      
      user.where  = { $or: or_data, $and: and_data };
    }
    else {
      user.where  = and_data;
     
    }

    let contractor_fetch = await GenericRepository.fetchDatalimit(user, limit, offset, order);
    //console.log(client_fetch);
    for (index in contractor_fetch.rows) {
      let project = {};
      project.table = 'project_bids',
        project.where = { contractor_id: contractor_fetch.rows[index].dataValues.id, is_draft: 0 };
      let project_count = await GenericRepository.fetchData(project);
      contractor_fetch.rows[index].dataValues.projectcount = project_count.count;

    }

    return res.send({ status: 200, message: 'contractor list', purpose: 'contractor list', data: contractor_fetch })


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }

}
/*consultantlist
method:GET
input:body
output:consultant list,
purpose:consultant list
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/consultant-list:
 *  get:
 *   tags:
 *    - Contractor Profile
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
 *    - in: query
 *      name: order
 *      schema:
 *       type: string
 *    - in: query
 *      name: user_status
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


Admincontroller.consultantList = async (req, res) => {
  try {
    let page = parseInt(req.query.page);
    let limit = parseInt(req.query.limit);
    let offset = limit * (page - 1);
    var array = [];
    let user_data = {};
    
    let and_data = [];
    let or_data = [];
    let name_data=[];
    and_data.push({ user_type: 2 });

    let user = {};
    user.table = 'user';
    if (req.query.search_text) {
      or_data.push({ id: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ email: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ full_name: { $like: '%' + req.query.search_text + '%' } });
      or_data.push({ phone: { $like: '%' + req.query.search_text + '%' } });

    }
    if(req.query.user_status==1){
      name_data.push({ user_type: 2,id: { $in: [sequelize.literal('SELECT user_id FROM `admin_consultants` WHERE `is_active`=1')]}});
    }
    if(req.query.user_status==0){
      name_data.push({ user_type: 2,id: { $in: [sequelize.literal('SELECT user_id FROM `admin_consultants` WHERE `is_active`=0')]}});
    }



    let order = [[]];
    if (req.query.order == "namedsc") {
      order = [['full_name', 'DESC']]
    }
    else if (req.query.order == "nameasc") {
      order = [['full_name', 'ASC']]
    }
    else if (req.query.order == "emaildsc") {
      order = [['email', 'DESC']]
    }
    else if (req.query.order == "emailasc") {
      order = [['email', 'ASC']]
    }

    else if (req.query.order == "createdatdsc") {
      order = [['createdAt', 'DESC']]
    }
    else if (req.query.order == "createdatasc") {
      order = [['createdAt', 'ASC']]
    }
    else if (req.query.order == "idasc") {
      order = [['id', 'ASC']]
    }
   else {
      order = [['id', 'DESC']]
    }
    if (name_data.length > 0 && or_data.length > 0) {
      user.where  = { $or: or_data, $and: name_data };
    }
   
    else if (name_data.length > 0) {

      user.where = name_data;
    }

    else if (or_data.length > 0) {
      
      user.where  = { $or: or_data, $and: and_data };
    }
    else {
      user.where  = and_data;
     
    }

    let consultant_fetch = await ConsultationhubRepository.consultantProjectListing(user, limit, offset, order);
    //console.log(client_fetch);
    for (index in consultant_fetch.rows) {
      let project = {};
      project.table ='project_consultants',
      project.where = { consultant_id: consultant_fetch.rows[index].dataValues.id };
      let project_count = await GenericRepository.fetchData(project);
      consultant_fetch.rows[index].dataValues.projectcount = project_count.count;

      let admin_consultant={};
      admin_consultant.table='admin_consultants',
      admin_consultant.where={user_id:consultant_fetch.rows[index].dataValues.id};
     let admin_consultant_fetch=await GenericRepository.fetchData(admin_consultant);
     if(admin_consultant_fetch.rows.length>0){
      consultant_fetch.rows[index].dataValues.consultant_profile_status= admin_consultant_fetch.rows[0].dataValues.is_active;
     }
     else{
      consultant_fetch.rows[index].dataValues.consultant_profile_status= 0;
     }


    }

    return res.send({ status: 200, message: 'consultant list', purpose: 'consultant list', data: consultant_fetch })


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }

}
/*notes
method:POST
input:body[notes_holder,project_id,callback_date,color_tag]
output:data,
purpose:add data
created by Sayanti Nath
*/



/**
 * @swagger
 * /api/admin/note:
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
 *            notes_holder:
 *              type: string
 *            project_id:
 *              type: integer
 *            callback_date:
 *              type: string
 *            color_tag:
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


Admincontroller.addNotes=async(req,res)=>{
    try{
    await sequelize.transaction(async (t) => {
    let note={};
    note.table='notes',
    note.data={
      notes_holder:req.body.notes_holder,
      project_id:req.body.project_id,
      callback_date:req.body.callback_date,
      color_tag:req.body.color_tag,

    }
    note.transaction=t;
    let note_add=await GenericRepository.createData(note);
    return res.send({status:200,message:'note added',purpose:'note added',data:[]});
    })
    }
    catch (err) {
      console.log(2491, err);
      return res.send({ status: 500, message: 'Something went wrong.' });
    }
}

/**edit-Notes
method:GET
input:body[id]
purpose:To edit project note
created by:Sayanti Nath
*/


Admincontroller.editNotes=async(req,res)=>{
  try{
    let note={};
    note.table='notes',
    note.where={id:req.body.id};
    note.data={
      notes_holder:req.body.notes_holder,
      project_id:req.body.project_id,
      callback_date:req.body.callback_date,
      color_tag:req.body.color_tag

    }
    let notes_update=await GenericRepository.updateData(note);
    return res.send({status:200,message:'note updated',purpose:'note updated',data:[]});

  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
  
}

/*draft-projects
method:GET
input:query[limit,page]
output:data,
purpose:data
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/draft-project:
 *  get:
 *   tags:
 *    - Project List
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

Admincontroller.draftProjects=async(req,res)=>{
  try{
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);

        let and_data=[];
        let or_data=[];
        and_data.push({status:0,is_delete:0});
        if(req.query.search_text)
        {
       or_data.push({name:{$like:'%'+req.body.search_text+'%'}});
        }
           let project={};
           project.table='projects';
           if(or_data.length > 0){
            project.where= { $or:or_data,$and:and_data};
           }else{
            project.where= and_data ;
           }
           let order=[['id','DESC']];

let project_list=await GenericRepository.fetchDatalimit(project,limit,offset,order);
return res.send({status:200,message:'draft project list',purpose:'draft project list',data:project_list})


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
 
}

/*pending-projects
method:GET
input:query[limit,page]
output:data,
purpose:data
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/peding-projects:
 *  get:
 *   tags:
 *    - Project List
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

Admincontroller.adminapprovedProjects=async(req,res)=>{
  try{
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);

        let and_data=[];
        let or_data=[];
        and_data.push({status:1,is_delete:0});
        if(req.query.search_text)
        {
       or_data.push({name:{$like:'%'+req.body.search_text+'%'}});
        }
           let project={};
           project.table='projects';
           if(or_data.length > 0){
            project.where= { $or:or_data,$and:and_data};
           }else{
            project.where= and_data ;
           }
           let order=[['id','DESC']];

let project_list=await GenericRepository.fetchDatalimit(project,limit,offset,order);
return res.send({status:200,message:'project list',purpose:'project list',data:project_list})


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
 


}
/*submitted-projects
method:GET
input:query[limit,page]
output:data,
purpose:data
created by Sayanti Nath
*/

/**
 * @swagger
 * /api/admin/submitted-projects:
 *  get:
 *   tags:
 *    - Project List
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

Admincontroller.submittedProjects=async(req,res)=>{
  try{
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);

        let and_data=[];
        let or_data=[];
        and_data.push({status: { $in: [2, 5] },is_delete:0});
        if(req.query.search_text)
        {
       or_data.push({name:{$like:'%'+req.body.search_text+'%'}});
        }
           let project={};
           project.table='projects';
           if(or_data.length > 0){
            project.where= { $or:or_data,$and:and_data};
           }else{
            project.where= and_data ;
           }
           let order=[['id','DESC']];

let project_list=await GenericRepository.fetchDatalimit(project,limit,offset,order);
return res.send({status:200,message:'project list',purpose:'project list',data:project_list})


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
 


}
/*signed-projects
method:GET
input:query[limit,page]
output:data,
purpose:data
created by Sayanti Nath
*/
/**
 * @swagger
 * /api/admin/signed-projects:
 *  get:
 *   tags:
 *    - Project List
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

Admincontroller.signedProjects=async(req,res)=>{
  try{
        let page = parseInt(req.query.page);
        let limit = parseInt(req.query.limit);
        let offset = limit*(page-1);

        let and_data=[];
        let or_data=[];
        and_data.push({status: 6,is_delete:0});
        if(req.query.search_text)
        {
       or_data.push({name:{$like:'%'+req.body.search_text+'%'}});
        }
           let project={};
           project.table='projects';
           if(or_data.length > 0){
            project.where= { $or:or_data,$and:and_data};
           }else{
            project.where= and_data ;
           }
           let order=[['id','DESC']];

let project_list=await GenericRepository.fetchDatalimit(project,limit,offset,order);
return res.send({status:200,message:'project list',purpose:'project list',data:project_list})


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
 


}
/*scope
method:GET
input:query[]
output:data,
purpose:data
created by Sayanti Nath
*/

Admincontroller.scopeList=async(req,res)=>{
  try{

    let array=[];
    array.push(36,37,41,43,44,45,46,47,49,50,69)

    let scope={};
    scope.table='project_scopes',
    scope.attributes=['id','scope_description','scope_description_arabic', 'type','group_name', 'project_question_in_english', 'project_question_in_arabic','scope_type',
  'Category'],
    scope.where={id:{$in:array}};
    let scope_fetch=await GenericRepository.fetchDataWithAttributes(scope);
    return res.send({status:200,data:scope_fetch,message:'scope list',purpose:'scope list'})


  }
  catch (err) {
    console.log(2491, err);
    return res.send({ status: 500, message: 'Something went wrong.' });
  }
 
}







module.exports = Admincontroller