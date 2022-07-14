const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
const Sequelize = require('sequelize');



/* Importing schemas */
const  User = require('../models/user')(sequelize, DataTypes);

/*all relations of user model will be defined here only*/
// User.hasMany(Post, {foreignKey:'user_id', targetKey:'id'})



var publicVar = {};


publicVar.fetchUserDatas = function(where,limit,offset){
    return new Promise(function(resolve, reject){
        User.findAndCountAll({
            where:where,
            limit : limit,
            offset : offset,
            // order:[sort_by]
        }).then(result=>{
            resolve(result);
        }).catch(err=>{
            reject(err);
        })
    })
}





module.exports = publicVar;