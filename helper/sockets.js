var db 				= require('../config/database');
//var schemas 		= require('../models/schemas');
var fs 				= require('fs');
var path 			= require('path');
var moment 			= require('moment');
var async 			= require("async");
var EventEmitter    = require('events')
const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');
var GenericRepository = require('../repositories/GenericRepository');

// var common = require('./common');
// var commonEmitter = common.commonEmitter;
const _ = require('lodash');


// exports.intialize = function(server){
//   io = require('socket.io')(server);
//   io.on('connection', function(socket) {
//       console.log('connect');
//       socket.on('join', function(room) {
//           console.log('join',room);
//           socket.join(room);
//       });

//       commonEmitter.on('entry',function(data){
//         new Promise(function(resolve, reject){
//           sequelize.model(data.table).create(data.data).then(result=>{
//               resolve(result);
//               socket.username=result;
//           }).catch(err=>{
//               console.log(199, err);
//               reject(err);
//           });
//       });
//         socket.emit('Release',data);
//     });
//     })
//   }

// global.io = require('socket.io')();
//var sellerDealController = require('../services/Seller/deal');
//console.log(db);

// console.log("sssssssssssss");
// var numUsers = 0;


//   setInterval(() => {
//     global.io.emit('forAll', {
//      // console.log("habjhabs")
//       msg: 'hello'
//     })
//   }, 1000)

  global.io.on('connection', function (socket) {

    


    socket.on('new_notifications_entry', async function (req) {

      console.log("hello")
      //console.log(req)

      let info={};
      info=req.note;



 
    let data={};
    data.table='notifications',
    data.data=
    {
      notification_from:info.notification_from,
      notification_to:info.notification_to,
      project_id:info.project_id,
      title:info.title,
      title_arabic:info.title_arabic,
      description_arabic:info.description_arabic,
      description:info.description,
      notification_type:info.type


    }

    let entry= await GenericRepository.createData(data);


    
    
    global.io.emit('new_notifications_entry', {
      message: info
    });

  })

  socket.on('new_notifications_entry_admin', async function (req) {

    console.log("hello")
    //console.log(req)

    let info_data={};
    info_data=req.value;




  let data_note={};
  data_note.table='notifications',
  data_note.data=
  {
    notification_from:info_data.notification_from,
    notification_to:info_data.notification_to,
    project_id:info_data.project_id,
    title:info_data.title,
    description:info_data.description,
    notification_type:"both"


  }

  let entry_table= await GenericRepository.createData(data_note);


  
  
  global.io.emit('new_notifications_entry_admin', {
    message: info_data
  });

})




  socket.on('typing', function () { 
      	console.log("adasdasdasdads");
        socket.broadcast.emit('typing', {
          username: socket.username
        });
      });
})

// global.io.on('connection', function (socket) {
//   //var addedUser = false;

//   // when the client emits 'new message', this listens and executes
//   socket.on('new_notifications_entry', function (data) {

//      new Promise(function(resolve, reject){
//       sequelize.model(data.table).create(data.data).then(result=>{
//           resolve(result);
//           socket.username=result;
//       }).catch(err=>{
//           console.log(199, err);
//           reject(err);
//       });
//   });

//     // we tell the client to execute 'new message'
//     socket.broadcast.emit('new message', {
//       result: socket.username,
//       message: data
//     });
//   });

//   // when the client emits 'add user', this listens and executes
//   socket.on('add user', function (username) {
//     if (addedUser) return;

//     // we store the username in the socket session for this client
//     socket.username = username;
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers
//     });
//     // echo globally (all clients) that a person has connected
//     socket.broadcast.emit('user joined', {
//       username: socket.username,
//       numUsers: numUsers
//     });
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on('typing', function () { 
//   	console.log("adasdasdasdads");
//     socket.broadcast.emit('typing', {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on('stop typing', function () {
//     socket.broadcast.emit('stop typing', {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on('disconnect', function () {
//     if (addedUser) {
//       --numUsers;

//       // echo globally that this client has left
//       socket.broadcast.emit('user left', {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });

//   // socket.broadcast.emit('baba', function () {
//   //     console.log("asdadsasd");
//   // });
// });

