'use strict';
module.exports = (sequelize, DataTypes) => {
  const site_setting = sequelize.define('site_setting', {
    otp_validity: DataTypes.INTEGER,
    max_tender_submission_limit: DataTypes.INTEGER,
    admin_contact: DataTypes.STRING,
    admin_email: DataTypes.STRING,
    facebook_link: DataTypes.STRING,
    linkedin_link: DataTypes.STRING,
    twitter_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    partner_text: DataTypes.STRING,
    service_text: DataTypes.STRING,
  }, { timestamps: false});
  site_setting.associate = function(models) {
    // associations can be defined here
  };
  return site_setting;
};

/**
* @swagger
* components:
*  schemas:
*   site_setting:
*    type: object
*    properties:
*     otp_validity:
*       type: INTEGER
*     max_tender_submission_limit:
*       type: INTEGER
*     admin_contact:
*       type: STRING
*     admin_email:
*       type: STRING
*     facebook_link:
*       type: STRING
*     linkedin_link:
*       type: STRING
*     twitter_link:
*       type: STRING
*     instagram_link:
*       type: STRING
*     partner_text:
*       type: STRING
*     service_text:
*       type: STRING
*/