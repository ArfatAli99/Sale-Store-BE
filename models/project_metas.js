'use strict';
module.exports = (sequelize, DataTypes) => {
  const project_metas = sequelize.define('project_metas', {
    scope_id: DataTypes.INTEGER,
    project_id: DataTypes.INTEGER,
    supplied_by: DataTypes.INTEGER,
    installed_by: DataTypes.INTEGER,
    q_result: DataTypes.INTEGER,
    is_deleted: DataTypes.INTEGER
  }, {});
  project_metas.associate = function(models) {
    // associations can be defined here
  };
  return project_metas;
};

/**
* @swagger
* components:
*  schemas:
*   project_metas:
*    type: object
*    properties:
*     scope_id:
*       type: INTEGER
*     project_id:
*       type: INTEGER
*     supplied_by:
*       type: INTEGER
*     installed_by:
*       type: INTEGER
*     q_result:
*       type: INTEGER
*     is_deleted:
*       type: INTEGER
*/