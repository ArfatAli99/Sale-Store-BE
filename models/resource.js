'use strict';
module.exports = (sequelize, DataTypes) => {
  const resource = sequelize.define('resources', {
    user_id: DataTypes.INTEGER,
    resource_type: DataTypes.STRING,
    resource_url: DataTypes.STRING,
    resource_description: DataTypes.STRING,
    resource_thumbnail: DataTypes.STRING,
    type: DataTypes.STRING,
    external_link:DataTypes.STRING,
    is_visible_client:DataTypes.INTEGER,
    is_active: DataTypes.INTEGER,
    is_delete: DataTypes.INTEGER
  }, {});
  resource.associate = function(models) {
    // associations can be defined here
  };
  return resource;
};

/**
* @swagger
* components:
*  schemas:
*   resources:
*    type: object
*    properties:
*     user_id:
*       type: INTEGER
*     resource_type:
*       type: STRING
*     resource_url:
*       type: STRING
*     resource_description:
*       type: STRING
*     resource_thumbnail:
*       type: STRING
*     type:
*       type: STRING
*     external_link:
*       type: STRING
*     is_visible_client:
*       type: INTEGER
*     is_active:
*       type: INTEGER
*     is_delete:
*       type: INTEGER
*/