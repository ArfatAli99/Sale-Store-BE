'use strict';
module.exports = (sequelize, DataTypes) => {
  const master_services = sequelize.define('master_services', {
    name: DataTypes.STRING
  }, {});
  master_services.associate = function(models) {
    // associations can be defined here
  };
  return master_services;
};

/**
* @swagger
* components:
*  schemas:
*   master_services:
*    type: object
*    properties:
*     name:
*       type: STRING
*/