'use strict';
module.exports = (sequelize, DataTypes) => {
  const contact_us = sequelize.define('contact_us', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    description: DataTypes.STRING,
    type:DataTypes.INTEGER
  }, {});
  contact_us.associate = function(models) {
    // associations can be defined here
  };
  return contact_us;
};

/**
* @swagger
* components:
*  schemas:
*   contact_us:
*    type: object
*    properties:
*     name:
*       type: STRING
*     email:
*       type: STRING
*     phone:
*       type: STRING
*     description:
*       type: STRING
*     type:
*       type: INTEGER
*/