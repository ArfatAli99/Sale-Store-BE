'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_doc_tags = sequelize.define('project_doc_tags', {
    project_doc_id: DataTypes.INTEGER,
    tag_name: DataTypes.STRING,
    is_delete: DataTypes.INTEGER
  }, {});
  project_doc_tags.associate = function(models) {
    // associations can be defined here
  };
  return project_doc_tags;
};

/**
* @swagger
* components:
*  schemas:
*   project_doc_tags:
*    type: object
*    properties:
*     project_doc_id:
*       type: INTEGER
*     tag_name:
*       type: STRING
*     is_delete:
*       type: INTEGER
*/