const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./../swagger.js');
module.exports = function (app) {
  console.log('Initializing the routes. ooh, YEAH!!!')

  app.use('/api/client', require(global.appPath +'/routes/client/index')) 
  app.use('/api', require(global.appPath + '/routes/common/index'))
  app.use('/api/consultant', require(global.appPath +'/routes/consultant/index'))
  app.use('/api/contractor', require(global.appPath +'/routes/contractor/index'));
  app.use('/api/admin', require(global.appPath +'/routes/admin/index'));
  // app.use('/api/admin-consultant', require(global.appPath +'/routes/admin-consultant/index'));
  //for generating documents
  app.use('/api-docs', swaggerUi.serve,swaggerUi.setup(swaggerDocument));
}

