'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    full_name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    profile_image: DataTypes.STRING,
    city:DataTypes.STRING,
    facebook_id: DataTypes.STRING,
    google_plus_id: DataTypes.STRING,
    company_name: DataTypes.STRING,
    relationship_with_company: DataTypes.INTEGER,
    description_of_relationship_with_company: DataTypes.STRING,
    user_type: DataTypes.INTEGER,
    is_email_verified: DataTypes.INTEGER,
    is_phone_verified: DataTypes.INTEGER,
    referred_by_user_id: DataTypes.INTEGER,
    is_complete:DataTypes.INTEGER,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};

/**
* @swagger
* components:
*  schemas:
*   user:
*    type: object
*    properties:
*     full_name:
*       type: STRING
*     email:
*       type: STRING
*     phone:
*       type: STRING
*     password:
*       type: STRING
*     profile_image:
*       type: STRING
*     city:
*       type: STRING
*     facebook_id:
*       type: STRING
*     google_plus_id:
*       type: STRING
*     company_name:
*       type: STRING
*     relationship_with_company:
*       type: INTEGER
*     description_of_relationship_with_company:
*       type: STRING
*     user_type:
*       type: INTEGER
*     is_email_verified:
*       type: INTEGER
*     is_phone_verified:
*       type: INTEGER
*     referred_by_user_id:
*       type: INTEGER
*     is_complete:
*       type: INTEGER
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*     status:
*       type: INTEGER
*     createdAt:
*       type: DATE
*     updatedAt:
*       type: DATE
*/