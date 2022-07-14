'use strict';
module.exports = (sequelize, DataTypes) => {
  const company_engineers = sequelize.define('company_engineers', {
    user_id: DataTypes.INTEGER,
    user_type: DataTypes.INTEGER,
    name: DataTypes.STRING,
    // cv: DataTypes.STRING,
    type: DataTypes.STRING,
    linkedIn_profile: DataTypes.STRING,
    facebook_profile: DataTypes.STRING,
    instagram_profile: DataTypes.STRING,
    is_deleted: DataTypes.INTEGER
  }, {});
  company_engineers.associate = function(models) {
    // associations can be defined here
  };
  return company_engineers;
};

/**
* @swagger
* components:
*  schemas:
*   company_engineers:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
*     user_type:
*       type: INTEGER
*     name:
*       type: STRING
*     type:
*       type: STRING
*     linkedIn_profile:
*       type: STRING
*     facebook_profile:
*       type: STRING
*     instagram_profile:
*       type: STRING
*     is_deleted:
*       type: INTEGER
*/