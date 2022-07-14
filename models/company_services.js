'use strict';
module.exports = (sequelize, DataTypes) => {
  const company_services = sequelize.define('company_services', {
    user_id: DataTypes.INTEGER,
    user_type: DataTypes.INTEGER,
    Service_name: DataTypes.STRING,
    Service_description: DataTypes.STRING,
    Service_id:DataTypes.INTEGER,
    is_deleted:DataTypes.INTEGER

  }, {});
  company_services.associate = function(models) {
    // associations can be defined here
  };
  return company_services;
};


/**
* @swagger
* components:
*  schemas:
*   company_services:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
*     user_type:
*       type: INTEGER
*     Service_name:
*       type: STRING
*     Service_description:
*       type: STRING
*     Service_id:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/