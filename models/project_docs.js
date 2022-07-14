'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_docs = sequelize.define('project_docs', {
    project_id: DataTypes.INTEGER,
    type: DataTypes.STRING,
    resource_type: DataTypes.STRING,
    resource_url: DataTypes.STRING,
    resource_thumbnail: DataTypes.STRING,
    resource_description: DataTypes.STRING,
    is_active: DataTypes.TINYINT,
    is_delete: DataTypes.TINYINT
  }, {});
  project_docs.associate = function(models) {
    // associations can be defined here
  };
  return project_docs;
};

/**
* @swagger
* components:
*  schemas:
*   project_docs:
*    type: object
*    properties:
*     project_id:
*       type: INTEGER
*     type:
*       type: STRING
*     resource_type:
*       type: STRING
*     resource_url:
*       type: STRING
*     resource_thumbnail:
*       type: STRING
*     resource_description:
*       type: STRING
*     is_active:
*       type: TINYINT
*     is_delete:
*       type: TINYINT
*/