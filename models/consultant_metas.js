'use strict';
module.exports = (sequelize, DataTypes) => {
  const consultant_metas = sequelize.define('consultant_metas', {
    user_id: DataTypes.INTEGER,
    facebook_link: DataTypes.STRING,
    linkedIn_link: DataTypes.STRING,
    instagram_link: DataTypes.STRING,
    website_link: DataTypes.STRING,
    pinterest_link: DataTypes.STRING,
    whatsapp_no: DataTypes.INTEGER,
    company_profile: DataTypes.STRING
  }, {});
  consultant_metas.associate = function(models) {
    // associations can be defined here
  };
  return consultant_metas;
};

/**
* @swagger
* components:
*  schemas:
*   consultant_metas:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
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
*       type: INTEGER
*     company_profile:
*       type: STRING
*/