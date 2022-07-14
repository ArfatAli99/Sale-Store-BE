'use strict';
module.exports = (sequelize, DataTypes) => {
  const validation = sequelize.define('validation', {
    phone: DataTypes.STRING,
    country_code: DataTypes.STRING,
    uid: DataTypes.INTEGER,
    otp: DataTypes.STRING,
    role: DataTypes.INTEGER,
    validation_type: DataTypes.ENUM('otp','email','ref','forget_password','invite_to_article','consultant_invite_client','client_invite_consultent','impersonate'),
    validation_hash: DataTypes.STRING,
    validation_meta: DataTypes.INTEGER,
    ref_email: DataTypes.STRING,
    ref_id: DataTypes.INTEGER,
    is_expired: DataTypes.INTEGER,
    is_verified: DataTypes.INTEGER
  }, {});
  validation.associate = function(models) {
    // associations can be defined here
  };
  return validation;
};


/**
* @swagger
* components:
*  schemas:
*   validation:
*    type: object
*    properties:
*     phone:
*       type: STRING
*     country_code:
*       type: STRING
*     uid:
*       type: INTEGER
*     otp:
*       type: STRING
*     role:
*       type: INTEGER
*     validation_type:
*       type: ENUM
*       enum:
*         - otp
*         - email
*         - ref
*         - forget_password
*         - invite_to_article
*         - consultant_invite_client
*         - client_invite_consultent
*         - impersonate
*     validation_hash:
*       type: STRING
*     validation_meta:
*       type: INTEGER
*     ref_email:
*       type: STRING
*     ref_id:
*       type: INTEGER
*     is_expired:
*       type: INTEGER
*     is_verified:
*       type: INTEGER
*/