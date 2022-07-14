var request = require('request');



module.exports = (data)=>{
    data.userid = global.constants.SMS.USERNAME,
    data.password = global.constants.SMS.PASSWORD,
    console.log(data);
    request.post(
        global.constants.SMS.API,
        { json: data },
        function (error, response, body) {
            if (!error && response.body == 1) {
                console.log(13,body);
                return true;
            }else{
                console.log(15,body)
                return false;
            }
        }
    );
}