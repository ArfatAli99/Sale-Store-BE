const _ = require('lodash')
    , path = require('path')
    , uuid = require('uuid')
    , multer = require('multer');

module.exports.uploadFiles = (fields, destination, mimeType = global.constants.allowMimeType, maxSize = 20000000) => {
  //console.log(fields, destination, mimeType);
  return multer({
    storage: multer.diskStorage({
      destination: destination,
      filename: function (req, file, cb) {
        cb(null, uuid.v4() + path.extname(file.originalname));
      }
    }),
    limits: {
      //fileSize: maxSize,
      fieldSize: '10MB',
    },
    fileFilter: (req, file, cb) => {
      if (_.includes(mimeType, file.mimetype) || mimeType.length === 0) {
        //console.log("fileFilter true file", file);
        cb(null, true);
      } else {
        //console.log("fileFilter false file", file);
        cb(null, false);
      }

    }
  }).fields(fields);
};

module.exports.upload = (fields, mimeType = global.constants.allowMimeType, maxSize = 20000000) => {
  console.log(fields);
 
 
  return multer({
    storage: multer.diskStorage({
      destination: global.constants.uploads.home_partner,
      filename: function (req, file, cb) {
        cb(null, uuid.v4() + path.extname(file.originalname));
      }
    }),
    limits: {
      //fileSize: maxSize,
      fieldSize: '10MB',
    },
    fileFilter: (req, file, cb) => {
      if (_.includes(mimeType, file.mimetype) || mimeType.length === 0) {
        //console.log("fileFilter true file", file);
        cb(null, true);
      } else {
        //console.log("fileFilter false file", file);
        cb(null, false);
      }

    }
  }).fields(fields);

// else{
//   return multer({
//     storage: multer.diskStorage({
//       destination: global.constants.uploads.home_slider,
//       filename: function (req, file, cb) {
//         cb(null, uuid.v4() + path.extname(file.originalname));
//       }
//     }),
//     limits: {
//       //fileSize: maxSize,
//       fieldSize: '10MB',
//     },
//     fileFilter: (req, file, cb) => {
//       if (_.includes(mimeType, file.mimetype) || mimeType.length === 0) {
//         //console.log("fileFilter true file", file);
//         cb(null, true);
//       } else {
//         //console.log("fileFilter false file", file);
//         cb(null, false);
//       }

//     }
//   }).fields(fields);

// }
};
