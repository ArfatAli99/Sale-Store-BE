const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const Sequelize = require('sequelize');



/* Importing schemas */
const  User = require('../models/user')(sequelize, DataTypes);

/*all relations of user model will be defined here only*/
// User.hasMany(Post, {foreignKey:'user_id', targetKey:'id'})



var publicVar = {};





module.exports = publicVar;