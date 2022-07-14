require('dotenv').config();
const { validationResult } = require('express-validator/check');
var GenericRepository = require('.././repositories/GenericRepository');
const md5 = require('md5');
const  CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');


var AccountController = {};

/**verifyUser API
method:POST
input:body[email, password, role],
output:data,
purpose:To login for users and admin both.
*/
AccountController.verifyUser = (req, res, next) => {
  const errors = validationResult(req)
  console.error('Validation :', errors)
  if (!errors.isEmpty()) {
    return res.json({
      status : 422,
      msg: 'Validation failed',
      message: 'Validation failed',
      data: errors.array()
    })
  }
  var passcode = md5(req.body.password+process.env.ADMINSALT);
  if(req.body.role == 'user'){
    var data ={table:"user"};
  }
  else if(req.body.role == 'admin'){
    var data ={table:"admin"};
  }
  data.where = {email: req.body.email,password: passcode};

 return GenericRepository.fetchData(data).then((user) => {
  if (user.count>0) {
    CommonValidationMiddleware.generateRefreshAndAccessToken(data.table, user.rows[0].id).then((token) => {
            let data = {};
            data.access_token = token.accessToken
            data.refresh_token = token.refreshToken
            data.role = data.table
            res.json({
              status: 201,
              msg: 'Login successfully',
              message: 'Login successfully',
              is_registered: 1,
              data: data
            })
          }).catch((err) => {
            console.error('59 ERROR :', err)
            res.json({
              status: 500,
              msg: 'Something went wrong',
              message: 'Something went wrong'
            })
          })

  }else{
      return  res.json({
        status: 404,
        msg: "Please Provide a valid credentials",
        message: "Please Provide a valid credentials"

      })

  }
  }).catch((err) => {
    console.error('76 ERROR :', err)
    res.json({
      status: 500,
      msg: 'An error occured',
      message: 'An error occured'
    })
  })

}


module.exports = AccountController;