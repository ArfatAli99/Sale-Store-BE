'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('section_category_maps', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category_id: {
        type: Sequelize.STRING
      },
      section_category_id: {
        type: Sequelize.INTEGER
      },
      scope_id: {
        type: Sequelize.INTEGER
      },
      description: {
        type: Sequelize.TEXT
      },
      description_arabic: {
        type: Sequelize.TEXT
      },
      make_or_equivelant: {
        type: Sequelize.TEXT
      },
      make_or_equivelant_arabic: {
        type: Sequelize.TEXT
      },
      is_active: {
        type: Sequelize.INTEGER
      },
      is_deleted: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('section_category_maps');
  }
};