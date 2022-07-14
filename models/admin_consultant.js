'use strict';
module.exports = (sequelize, DataTypes) => {
  const admin_consultant = sequelize.define('admin_consultants', {
    user_id:DataTypes.INTEGER,
    company_name: DataTypes.STRING,
    company_logo: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    facebook_link: DataTypes.STRING,
    facebook_link: DataTypes.STRING,
    linkedIn_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    website_link: DataTypes.STRING,
    pinterest_link: DataTypes.STRING,
    whatsapp_no: DataTypes.STRING,
    company_profile: DataTypes.STRING,
    status: DataTypes.INTEGER,
    established_year:DataTypes.INTEGER,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER
  }, {});
  admin_consultant.associate = function(models) {
    // associations can be defined here
  };
  return admin_consultant;
};

/**
* @swagger
* components:
*  schemas:
*   admin_consultants:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
*     company_name:
*       type: STRING
*     company_logo:
*       type: STRING
*     email:
*       type: STRING
*     phone:
*       type: STRING
*     facebook_link:
*       type: STRING
*     linkedIn_link:
*       type: STRING
*     instagram_link:
*       type: STRING
*     website_link:
*       type: STRING
*     pinterest_link:
*       type: STRING
*     whatsapp_no:
*       type: STRING
*     company_profile:
*       type: STRING
*     status:
*       type: INTEGER
*     established_year:
*       type: INTEGER
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*/