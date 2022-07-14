const { validationResult } = require('express-validator/check');
var GenericRepository = require('../repositories/GenericRepository');
var ConsultationhubRepository = require('.././repositories/ConsultationhubRepository');
var ProjectRepository = require('.././repositories/ProjectRepository');
const md5 = require('md5');
const CommonValidationMiddleware = require('../middlewares/CommonValidationMiddleware');
const Cms=require('../models/cms');
const commonFunnction = require('../helper/commonFunction');
const moment = require('moment');
const sequelize = require('../config/database').sequelize;
var DataTypes = require('sequelize/lib/data-types');

ContractorController={};



/*add-contractor api
method:POST
input:body[full_name,city,phone,email,password,key_names,key_value,group_names,id,speca;ization,employee_types,employee_no_omans,employee_no_non_omans]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/



ContractorController.addContractor=(req,res)=>{



    (async()=>{

        try{

            if(!req.body.id){

            let user_check={};
            user_check.table='user',
            user_check.where={};
            user_check.where.email=req.body.email;
            //commented by sayanti nath for the client accepting three type users cant't signup with the same email address
            user_check.where.user_type=3;
            let user_check_create=await GenericRepository.fetchData(user_check);

            if(user_check_create.rows.length>0){
                res.send({status:409,message:'Email already exists'})
            }

            else{


                

              

                
            let password=md5(req.body.password);


            let user_information={};
            user_information.table='user',
            user_information.data={
            full_name:req.body.full_name,
            city:req.body.city,
            phone:req.body.phone,
            email:req.body.email,
            password:password,
            user_type:3,
            company_name:req.body.company_name
            }

            if(req.body.is_phone_verified){
                user_information.data.is_phone_verified=req.body.is_phone_verified
            }


var user_create=await GenericRepository.createData(user_information);




let result=[];

let key_names=req.body.key_names;
let key_values=req.body.key_values;
let group_names=req.body.group_names;
//console.log(JSON.PARSE(key_names))

console.log(req.body);
key_names.forEach(function(item,index,arr){
    let metas={

        key_name:item,
        key_value:key_values[index],
        group_name:group_names[index],
        contractor_id:user_create.dataValues.id


    }
    result.push(metas)
})

let data={};
data.table='contractor_metas',
data.data=result;

let contractormetas_create=await GenericRepository.bulkCreateData(data);


let validation_hash = await new Promise(function(resolve, reject){
    let validation_hash;
    commonFunnction.getRandomString(10).then((randNum) => {
      validationhash = randNum
      resolve(validation_hash)
    }).catch(randErr=>{
      console.log(randErr);
      return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
    })

  }).then(result=>{
    return result;
  }).catch(err=>{
    console.log(err);
    return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
  })

let validations={};
 validations.table='validation',
 validations.data={
    validation_type:'email',
    validation_hash:validationhash,
    role: 3,
    ref_email:req.body.email,
    uid:user_create.dataValues.id
 }
let email_data={};
email_data.name=user_create.dataValues.full_name;
email_data.email=req.body.email;
email_data.link= process.env.WEBURL+'/ebinaa/html/account-verified/'+validationhash;
global.eventEmitter.emit('account_activation_email_link',email_data);




 let validations_create=await GenericRepository.createData(validations);

 if(req.body.company_name){
    let company={};
    company.table='user',
    company.where={};
    company.where.id=user_create.dataValues.id;
    company.data={
        company_name:req.body.company_name
    }
    let conmpany_update=await GenericRepository.updateData(company);
}



let specalizations=req.body.specalizations;
let result_manpowers=[];

if(req.body.specalizations){
specalizations.forEach(function(item,index,arr){
    let manpowers={
        contractor_id:user_create.dataValues.id,
        specalization:item,
        employee_type:req.body.employee_type,
        employee_no_oman:req.body.employee_oman,
        employee_no_non_oman:req.body.employee_no_oman

    }

    result_manpowers.push(manpowers);
})

let manpowers_data={};
manpowers_data.table='contractor_manpowers',
manpowers_data.data=result_manpowers;

let contractormanpowers_create=await GenericRepository.bulkCreateData(manpowers_data);
}


res.send({status:201,message:' Form  submitted successfully',id:user_create.dataValues.id})
            }






}

else{

    if(req.body.company_name){
        let company={};
        company.table='user',
        company.where={};
        company.where.id=req.body.id;
        company.data={
            company_name:req.body.company_name
        }
        let conmpany_update=await GenericRepository.updateData(company);
    }


    
    

    let result=[];

let key_names=req.body.key_names;
let key_values=req.body.key_values;
let group_names=req.body.group_names;
//console.log(JSON.PARSE(key_names))

//console.log(req.body);

if(req.body.key_names){
key_names.forEach(async function(item,index,arr){
    //(async()=>{
    let information={};
    information.table='contractor_metas',
    information.where={};
    information.where.key_name=item;
    information.where.contractor_id=req.body.id;
    let data_create=await GenericRepository.fetchData(information);
    if( data_create.rows.length>0){
        let data={};
        data.table='contractor_metas',
        data.where={};
        data.where.id=data_create.rows[0].dataValues.id,
        data.data={
            key_value:key_values[index]
        }


        let contractormetas_update=await GenericRepository.updateData(data);
       


    }

else{

   


let data={};
data.table='contractor_metas',
data.data={
    key_name:item,
    key_value:key_values[index],
    group_name:group_names[index],
    contractor_id:req.body.id
};

let contractormetas_create=await GenericRepository.createData(data);
}

})
}

if(req.body.other_data){
    let metas={};
    metas=req.body.other_data;

    metas.forEach(async function(item,index,arr){
        if(item.id){
            let other_data_entry={};
            other_data_entry.table='contractor_metas',
            other_data_entry.where={};
            other_data_entry.where.id=item.id;
            other_data_entry.data={ 
                key_name:item.key_names,
                key_value:item.key_values,
                group_name:item.group_names,
                contractor_id:req.body.id



            }

            let other_data_table=await GenericRepository.updateData(other_data_entry);

        }

        else{
            let metas_entry={};
             metas_entry.table='contractor_metas',
             metas_entry.data={

                key_name:item.key_names,
                key_value:item.key_values,
                group_name:item.group_names,
                contractor_id:req.body.id

             }

             let metas_entry_table=await GenericRepository.createData(metas_entry);
        }
    })
    
}







if(req.body.data){

   
    let manpowers={};
    // manpowers=JSON.parse(req.body.data);
    manpowers=req.body.data;



    manpowers.forEach(async function(item,index,arr){
        console.log(item.id);
   
            
        if(item.id){
            let contractor_manpowers={};
            contractor_manpowers.table='contractor_manpowers',
            contractor_manpowers.where={};
            contractor_manpowers.where.id=item.id,
            contractor_manpowers.data={
               
                specalization:item.specalizations,
                employee_no_oman:item.employee_no_omans,
                employee_no_non_oman:item.employee_no_non_omans
            }


            let manpowers_table=await GenericRepository.updateData(contractor_manpowers);

        }
       
        else{

            let info={};
            info.table='contractor_manpowers',
            info.where={};
            info.where.specalization=item.specalizations;
            info.where.employee_type=item.employee_types,
            info.where.contractor_id=req.body.id
            let fetch_manpowers=await GenericRepository.fetchData(info);
            if(fetch_manpowers.rows.length>0){
               
            }
            else{
            let manpowers_data={};
            manpowers_data.table='contractor_manpowers',
            manpowers_data.data={
                 contractor_id:req.body.id,
                 specalization:item.specalizations,
                 employee_no_oman:item.employee_no_omans,
                 employee_no_non_oman:item.employee_no_non_omans,
                  employee_type:item.employee_types,
              
            }

        


            let contractormanpowers_create=await GenericRepository.createData(manpowers_data);
        }
    }
})
}
    

    if(req.body.delete_data){
        let d_data={};
        d_data=req.body.delete_data;
        d_data.forEach(async function(item,index,arr){

            let manpowers_delete={};
            manpowers_delete.table='contractor_manpowers',
            manpowers_delete.where={};
            manpowers_delete.where.id=item.id;

            let manpowers_delete_data=await GenericRepository.deleteData(manpowers_delete);

        })

    }


    if(req.body.key_name_delete){
        console.log(req.body);

        let key_name_deletes=req.body.key_name_delete;
        key_name_deletes.forEach(async function(item,index,arr){



            let delete_data={};
            delete_data.table='contractor_metas',
            delete_data.where={};
            delete_data.where.key_name=item;
            delete_data.where.contractor_id=req.body.id;
            let delete_data_table=await GenericRepository.deleteData(delete_data);

        })


   }

  

    

  

if(req.body.is_complete){
    let data_complete={};
    data_complete.table='user',
    data_complete.where={};
    data_complete.where.id=req.body.id,
    data_complete.data={
        is_complete:req.body.is_complete
    }

    if(req.body.is_complete==1){
        let user_table={};
        user_table.table='user',
        user_table.where={id:req.body.id}
        let user_fetch=await GenericRepository.fetchData(user_table);
       
        let admin={};
        admin.table='admin',
        admin.where={};
        let admin_fetch=await GenericRepository.fetchData(admin);
       

        let email_data={};
        email_data.email=admin_fetch.rows[0].dataValues.email;
        email_data.name=user_fetch.rows[0].dataValues.full_name;
        email_data.phone=user_fetch.rows[0].dataValues.phone;
        email_data.mail=user_fetch.rows[0].dataValues.email;
        global.eventEmitter.emit('contractor_registration',email_data);
        console.log('mail sent');




    }

let data_update=await GenericRepository.updateData(data_complete);


let update_data={};
update_data.table='user',
update_data.where={
    id:req.body.id
}
update_data.data={
    status:1
}

let pending=await GenericRepository.updateData(update_data);

}



console.log("hello")


res.send({status:201,message:' Form  submitted successfully'})


}

        } catch(err){
        console.trace(err)
        
        res.send({status:500, err:err});
        
        }
        
        
        })()
        
}

/*fetchDataUser api
method:GET
input:query[id]
output:data,
purpose:to fetch contractor data
created by sayanti Nath
*/

ContractorController.fetchDataUser=(req,res)=>{


    (async()=>{

        try{
    
            let information={};
            information.table='user',
            information.where={};
            information.where.id=req.query.id;
        
            let fetchuser=await GenericRepository.fetchData(information);
            let metas={};
            metas.table='contractor_metas',
            metas.where={};
            metas.where.contractor_id=req.query.id,
            metas.where.key_name='years_of_experience';
            let fetchmetas=await GenericRepository.fetchData(metas);
            
            let metas_value={};
            metas_value.table='contractor_metas',
            metas_value.where={};
            metas_value.where.contractor_id=req.query.id,
            metas_value.where.key_name='is_owner_or_civil';
            let fetchmetasvalue=await GenericRepository.fetchData( metas_value);


            let page = 1;
            let limit = 300
            let offset = limit * (page - 1);
      




            let contractor_metas_limit={};
            contractor_metas_limit.table='contractor_metas',
            contractor_metas_limit.where={};
            contractor_metas_limit.where.contractor_id=req.query.id;

            let contractor_metas_fetch_limit=await GenericRepository.fetchDatalimit(contractor_metas_limit,limit,offset);

            


            let contractor_metas={};
            contractor_metas.table='contractor_metas',
            contractor_metas.where={};
            contractor_metas.where.contractor_id=req.query.id;

            let contractor_metas_fetch=await GenericRepository.fetchData(contractor_metas);

            let contractor_manpowers={};
            contractor_manpowers.table='contractor_manpowers',
            contractor_manpowers.where={};
            contractor_manpowers.where.contractor_id=req.query.id;

             let contractor_manpowers_fetch=await GenericRepository.fetchData(contractor_manpowers);

             let docs={};
             docs.table='resources',
             docs.where={
                 user_id:req.query.id,
                 type:{$in:['contractor_cr_certificate','owners_national_id','man_powers_report','company_profile_contractor','other_files']}


             }

            let  docs_fetch=await GenericRepository.fetchData(docs);




            let info={};
            
            info.table='resources',
            info.where={user_id:req.query.id,type:'contractor_profile_photo'}
            let fetch=await GenericRepository.fetchData(info);


            res.send({status:201,profile_photo:fetch,docs:docs_fetch,data:fetchuser,yearsofexp:fetchmetas,ownercivil:fetchmetasvalue,contractor_metas:contractor_metas_fetch_limit,contractor_manpowers:contractor_manpowers_fetch,message:'fetched'})
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()
    

    
}



/*upload-cr-certificate api
method:POST
input:body[id,image]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/

ContractorController.uploadCrCertificate=(req,res)=>{

    (async()=>{
        try{
       
        let url='contractor_documents/'+global.constants.IMG_URL.contractor_cr_certificate_url+req.files.upload[0].filename;


        if(req.body.is_edit==1){
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'contractor_cr_certificate'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'contractor_cr_certificate'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

            
        }



else{
    let info_demo={};
    info_demo.table='resources_demo',
    info_demo.where={
        user_id:req.body.id,
        type:'contractor_cr_certificate'
    };
    let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
    info_demo.data={
        user_id:req.body.id,
        resource_type:'file',
        resource_url:url,
        type:'contractor_cr_certificate'
    }
    if(resource_fetch_demo.rows.length>0){
        let user_demo_update=await GenericRepository.updateData(info_demo);
    }
    else{
    
        let user_demo_create=await GenericRepository.createData(info_demo);
    }

        let info={};

        info.table='resources',
        info.where={
            user_id:req.body.id,
            type:'contractor_cr_certificate'
        }

        let resource_fetch=await GenericRepository.fetchData(info)
        info.data={
            user_id:req.body.id,
            resource_type:'file',
            resource_url:url,
            type:'contractor_cr_certificate'
        }

        if(resource_fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
        }
        else{
        
        let resource_create=await GenericRepository.createData(info)
        }
    }
        res.send({status:201,url:url,message:'uploaded'})
       
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"error"}});
        
        }
        
        
        })()
        
        }

 /*upload-owners-national-id api
method:POST
input:body[id,image]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/


ContractorController.uploadOwnersNationalId=(req,res)=>{

    (async()=>{
        try{
        
        let url='contractor_documents/'+global.constants.IMG_URL.upload_owners_national_id_url+req.files.upload[0].filename;

        if(req.body.is_edit==1){
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'owners_national_id'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'owners_national_id'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

            
        }

        else{
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'owners_national_id'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'owners_national_id'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

        let info={};

        info.table='resources',
        info.where={
            user_id:req.body.id,
            type:'owners_national_id'
        }

        let resource_fetch=await GenericRepository.fetchData(info)
        info.data={
            user_id:req.body.id,
            resource_type:'file',
            resource_url:url,
            type:'owners_national_id'
        }
        if(resource_fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
        }
        else{
        
        let resource_create=await GenericRepository.createData(info)
        }

    }
        
        res.send({status:201,url:url,message:'uploaded'})
        
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"Error"}});
        
        }
        
        
        })()
        

}

/*upload-man-powers api
method:POST
input:body[id,image]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/

ContractorController.uploadManPowersReport=(req,res)=>{

    (async()=>{
        try{
       
        let url='contractor_documents/'+global.constants.IMG_URL.  upload_manpowers_report_url+req.files.upload[0].filename;

        if(req.body.is_edit==1){
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'man_powers_report'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'man_powers_report'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

            
        }

        else{
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'man_powers_report'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'man_powers_report'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }


        let info={};

        info.table='resources',
        
        info.where={
            user_id:req.body.id,
            type:'man_powers_report'
        }

        let resource_fetch=await GenericRepository.fetchData(info)
        info.data={
            user_id:req.body.id,
            resource_type:'file',
            resource_url:url,
            type:'man_powers_report'
        }

        if(resource_fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
        }
        else{
        
        let resource_create=await GenericRepository.createData(info)
        }
    }
        res.send({status:201,url:url,message:'uploaded'})
        
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"Error"}});
        
        }
        
        
        })()
        

}

 /*upload-company-profile api
method:POST
input:body[id,image]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/


ContractorController.companyProfile=(req,res)=>{

    (async()=>{
        try{
      
        let url='contractor_documents/'+global.constants.IMG_URL.  company_profile_url+req.files.upload[0].filename;

        if(req.body.is_edit==1){
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'company_profile_contractor'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'company_profile_contractor'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

            
        }
        else{
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'company_profile_contractor'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'company_profile_contractor'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

        let info={};

        info.table='resources',

        
        
        info.where={
            user_id:req.body.id,
            type:'company_profile_contractor'
        }

        let resource_fetch=await GenericRepository.fetchData(info)
        info.data={
            user_id:req.body.id,
            resource_type:'file',
            resource_url:url,
            type:'company_profile_contractor'
        }
        // let resource_create=await GenericRepository.createData(info)

        if(resource_fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
        }
        else{
        
        let resource_create=await GenericRepository.createData(info)
        }
    }
        res.send({status:201,url:url,message:'uploaded'})
        
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"Error"}});
        
        }
        
        
        })()
        

}

/*upload-other-file api
method:POST
input:body[id,image]
output:data,
purpose:to add contractor data
created by sayanti Nath
*/


ContractorController.otherFile=(req,res)=>{

    (async()=>{
        try{
        
        let url='contractor_documents/'+global.constants.IMG_URL.other_files_url+req.files.upload[0].filename;

        if(req.body.is_edit==1){
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'other_files'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'other_files'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }

            
        }

        else{
            let info_demo={};
            info_demo.table='resources_demo',
            info_demo.where={
                user_id:req.body.id,
                type:'other_files'
            };
            let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
            info_demo.data={
                user_id:req.body.id,
                resource_type:'file',
                resource_url:url,
                type:'other_files'
            }
            if(resource_fetch_demo.rows.length>0){
                let user_demo_update=await GenericRepository.updateData(info_demo);
            }
            else{
            
                let user_demo_create=await GenericRepository.createData(info_demo);
            }


        let info={};

        info.table='resources',

        info.where={
            user_id:req.body.id,
            type:'other_files'
        }

        let resource_fetch=await GenericRepository.fetchData(info)
        info.data={
            user_id:req.body.id,
            resource_type:'file',
            resource_url:url,
            type:'other_files'
        }
        if(resource_fetch.rows.length>0){
            let resource_update=await GenericRepository.updateData(info)
        }
        else{
        
        let resource_create=await GenericRepository.createData(info)
        }
    }
        res.send({status:201,url:url,message:'uploaded'})
        
        } catch(err){
        console.trace(err)
        // res.send({status:500, err:err});
        res.send({status:500,uploaded: 0, error:{message:"Error"}});
        
        }
        
        
        })()
        

}

/**fetchProject API
method:GET
input:query[id], headers[x-access-token]
output:data,
purpose:To get details of a project with stages and tasks.
created by sayanti Nath
*/
/**
     * To get details of a project with stages and tasks with respect to `id`, `x-access-token`
     * @param {Number} `id` 
     * @param {String} `x-access-token` 
     * @return {data} data
*/
ContractorController.fetchProject = function(req, res){
    (async()=>{
        try{
            let project_details = await new Promise(function(resolve, reject){
                let project_details;
                let project_data_where = {};
                let project_bids_where = {contractor_id:req.user_id};
                project_data_where.id = parseInt(req.query.id);
                ProjectRepository.fetchProjectContractor(project_data_where,project_bids_where).then(project_result=>{
                    project_details = project_result;
                    resolve(project_details);
                }).catch(project_err=>{
                    console.log(805, project_err);
                    return res.send({status:500, message:'Something went wrong'});
                })
            })

            // console.log(project_details.rows[0].dataValues.project_stages.length);
            // return res.send({status:200, message:'Project Bid Details', data:project_details, purpose:'To get details of project'});

            let project_stages = await new Promise(function(resolve, reject){
                let project_stages = [];
                let primary_payment = {};
                let maintenance = {};
                for(let i = 0; i < project_details.rows[0].dataValues.project_stages.length; i++){
                    project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor = 0;
                    project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient = 0;
                    project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant = 0;
                    for(let j = 0; j < project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks.length; j++){
                        if(project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Contractor'){
                             project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfContractor ++;
                        }
                        else if(project_details.rows[0].dataValues.project_stages[i].dataValues.project_tasks[j].dataValues.assignee == 'Client'){
                             project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfClient ++;
                        }
                        else{
                            project_details.rows[0].dataValues.project_stages[i].dataValues.taskCountOfConsultant ++;
                        }
                    }
                    if(project_details.rows[0].dataValues.project_stages[i].name == "primary_payment")
                    {
                       primary_payment = project_details.rows[0].dataValues.project_stages[i];
                    }
                    else if(project_details.rows[0].dataValues.project_stages[i].name == "maintenance")
                    {
                       maintenance = project_details.rows[0].dataValues.project_stages[i];
                    }else{
                       project_stages.push(project_details.rows[0].dataValues.project_stages[i]);
                    }
                    if(i == project_details.rows[0].dataValues.project_stages.length - 1){
                        project_stages.sort(function(a, b) {
                                return a.sequence - b.sequence;
                            });
                        project_stages.unshift(primary_payment);
                        project_stages.push(maintenance);
                        resolve(project_stages)
                    }
                }
                
            })
            project_details.rows[0].dataValues.project_stages = project_stages;

            return res.send({status:200, message:'Project Details', data:project_details, purpose:'To get details of project'});

        }
        catch(err){
            console.log(799, err);
            return res.send({status:500, message:'Something went wrong'});
        }

    })()

}



/*ProjectContractUpdateByContractor api
method:POST
input:body[project_id,client_id]
output:data,
purpose:to submit a tender
created by sayanti Nath
*/

ProjectController.ProjectContractUpdateByContractor=function(req,res){
    (async()=>{
      try{
        let project_bid={};
        project_bid.table='project_bids',
        project_bid.where={};
        project_bid.where.project_id=parseInt(req.body.project_id),
        project_bid.where.contractor_id=req.user_id;//
      
        let project_bid_table=await GenericRepository.fetchData(project_bid)
        let project_fetch={};
        project_fetch.table='project_contracts',
        project_fetch.where={};
        let order=[['id','DESC']]
      
        var project_fetch_table=await GenericRepository.fetchDataOrder(project_fetch,order)
    //    console.log(project_fetch_table.rows[0].dataValues.version_no)
        let project_contract={};
        project_contract.table='project_contracts';
        project_contract.data={
          project_id:project_bid_table.rows[0].dataValues.project_id,
          client_id:parseInt(req.body.client_id),
          contractor_id:req.user_id,//
          created_by:"client",
          days:project_bid_table.rows[0].dataValues.days,
          price:project_bid_table.rows[0].dataValues.price,
          cllient_acceptance:1,
        }
        if(project_fetch_table.rows.length<=0){ 
            project_contract.data.version_no=1
  
        }
        else{         
            project_contract.data.version_no=parseInt(project_fetch_table.rows[0].dataValues.version_no)+1;
        }
    let project_contracet_table=await GenericRepository.createData(project_contract)
    console.log(project_contracet_table.dataValues.id)
  
  
    let stage_estimate={};
    stage_estimate.table='project_stage_estimates',
    stage_estimate.where={};
    stage_estimate.where.bid_id=project_bid_table.rows[0].dataValues.id;
  
    let stage_estimates_data=await GenericRepository.fetchData( stage_estimate)
  
    for(index in stage_estimates_data.rows){
  
    let project_stage_estimates={};
    project_stage_estimates.table='project_contract_stages',
    project_stage_estimates.data={
      contract_id:project_contracet_table.dataValues.id,
      stage_id:stage_estimates_data.rows[index].dataValues.stage_id,
      price_amount:stage_estimates_data.rows[index].dataValues.price_amount,
      price_percentage:stage_estimates_data.rows[index].dataValues.price_percentage,
      days:stage_estimates_data.rows[index].dataValues.days
    }
  
    let project_stage_estimates_table=await GenericRepository.createData(project_stage_estimates)
  }
  
  
  let project_metas={};
  project_metas.table='project_metas',
  project_metas.where={};
  project_metas.where.project_id=req.body.project_id;
  project_metas.where.is_deleted=0;
   let project_metas_table=await GenericRepository.fetchData(project_metas);
   for(index in project_metas_table.rows ){
    let contract_metas={};
    contract_metas.table='contract_metas',
    contract_metas.data={
        contract_id:project_contracet_table.dataValues.id,
        scope_id:project_metas_table.rows[index].dataValues.scope_id,
        supplied_by:project_metas_table.rows[index].dataValues.supplied_by,
        installed_by:project_metas_table.rows[index].dataValues.installed_by,
        q_result:project_metas_table.rows[index].dataValues.q_result
    
    }
    
    let contract_metas_table=await GenericRepository.createData(contract_metas)
  }
    res.send({status:200,message:"Tender is submitted successfully.",purpose:"Tender submitted",data:project_metas_table});
      } 
      catch(err){
        console.log(1023,err)
        return res.send({status:500,err:err});
      
      }
    })()
}

/*bankData api
method:POST
input:body[bank_name, account_holder_name, account_no, client_id, mobile_number, project_manager_email, project_id]
output:data,
purpose:to add bank data
created by sayanti Nath
*/

ContractorController.bankData=(req,res)=>{

    (async()=>{

        try{
    
            let bank={};
        bank.table='contract_banks',
        bank.where={user_id:req.user_id, user_type:req.userdetails.user_type}
        let bank_fetch=await GenericRepository.fetchData(bank);
        if(bank_fetch.rows.length>0)
        {



            bank.data={
                bank_name:req.body.bank_name,
                account_holder_name:req.body.account_holder_name,
                account_no:req.body.account_no,
                
    
    
            }

            let bank_update=await GenericRepository.updateData(bank);

        }
        else{

        bank.data={
            bank_name:req.body.bank_name,
            account_holder_name:req.body.account_holder_name,
            account_no:req.body.account_no,
            user_id:req.user_id,
            user_type:req.userdetails.user_type


        }

        let bank_insert=await GenericRepository.createData(bank);
    }

        let manager={};
        manager.table='project_managers',
        manager.data={
            project_id	:req.body.project_id,
            name:req.body.project_manager_name,
            mobile_no:req.body.mobile_number,
            email:req.body.project_manager_email
        }
        let manager_data=await GenericRepository.createData(manager);


        let data={};
        data.table='contract_info',
        data.where={key_name:'client_fullname',project_id:req.body.project_id}
        
  
        let fetch=await GenericRepository.fetchData(data)
  
        console.log(fetch.rows.length)
  
        
        if(fetch.rows.length>0){
  
          data.data={
            
            
            contractor_sign_date:moment().format('YYYY-MM-DD')
    
            
    
          }
  
          let data_update=await await GenericRepository.updateData(data)
  
        }
        //data.where={project_id:req.body.project_id,contractor_id:req.body.contractor_id};
      else{
  
        data.data={
         key_name:'client_fullname',
          project_id:req.body.project_id,
          contractor_sign_date:moment().format('YYYY-MM-DD')
  
         // let data_update=await GenericRepository.createData(data);
  
        }
  
        let data_update_create=await GenericRepository.createData(data);
        
      }



            res.send({status:200,message:'bank data insert'})
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()

}


/*editContractorData api
method:PUT
input:body[other_data, data]
output:data,
purpose:to update contractor data
created by sayanti Nath
*/

/**
 * @swagger
 * /api/admin/contractor:
 *  put:
 *   tags:
 *    - Project Management
 *   requestBody:
 *    description: 
 *    required: true
 *    content:
 *      application/json:
 *        schema:
 *          type: object
 *          properties:
 *            data:
 *              type: array
 *              items:
 *                properties:
 *                    id:
 *                      type: integer
 *                    key_name:
 *                      type: string
 *                    key_value:
 *                      type: string
 *            other_data:
 *              type: array
 *              items:
 *                properties:
 *                    id:
 *                      type: integer
 *                    specalization:
 *                      type: string
 *                    employee_no_oman:
 *                      type: integer
 *                    employee_no_non_oman:
 *                      type: integer
 *            id:
 *              type: integer
 *            full_name:
 *              type: string
 *            email:
 *              type: string
 *            phone:
 *              type: string
 *            password:
 *              type: string
 *            city:
 *              type: string
 *   responses:
 *    '200':
 *      description: successful
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SuccessResponse'
 *    '500':
 *      description: error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ErrorResponse'
 *    '400':
 *      description: Bad request
 *    '401':
 *      description: Authorization invalid
 *    '404':
 *      description: Not found
 *    '422':
 *      description: validation error
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/ValidationResponse'
 */

ContractorController.editContractorData=(req,res)=>{


    (async()=>{

        try{


            let email_verify={};
            email_verify.table='user',
            email_verify.where={id:req.body.id};
            var email_verify_check=await GenericRepository.fetchData(email_verify);


            if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let email={};
                email.table='user',
                email.where={email:req.body.email,user_type:3}
                let email_check=await GenericRepository.fetchData(email);
                if(email_check.rows.length>0){
                    return res.send({status:409,message:'Email is already exist'})
                }

            }
           
            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                commonFunnction.getRandomString(10).then((randNum) => {
                  validationhash = randNum
                  resolve(validation_hash)
                }).catch(randErr=>{
                  console.log(randErr);
                  return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                })
          
              }).then(result=>{
                return result;
              }).catch(err=>{
                console.log(err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
              })
       


            if(req.body.data){
                let key_names={};
                key_names=req.body.data;
                key_names.forEach(async function(item,index,arr){
                    let contractor_metas={};
                    contractor_metas.table='contractor_metas',
                    contractor_metas.where={};
                    contractor_metas.where.id=item.id;
                    contractor_metas.data={
                        key_name:item.key_names,
                        key_value:item.key_values,
                        
                    }

                    let contractor_metas_update=await GenericRepository.updateData(contractor_metas);




                })


               


            }

            if(req.body.other_data){

                let manpowers={};
    // manpowers=JSON.parse(req.body.data);
    manpowers=req.body.other_data;



    manpowers.forEach(async function(item,index,arr){
        console.log(item.id);
  
            
        if(item.id){
            let contractor_manpowers={};
            contractor_manpowers.table='contractor_manpowers',
            contractor_manpowers.where={};
            contractor_manpowers.where.id=item.id,
            contractor_manpowers.data={
               
                specalization:item.specalizations,
                employee_no_oman:item.employee_no_omans,
                employee_no_non_oman:item.employee_no_non_omans
            }


            let manpowers_table=await GenericRepository.updateData(contractor_manpowers);

        }


    })

    
}


let user={};
user.table='user',
user.where={id:req.user_id};
user.data={
    status:1
}

if(req.body.full_name){
    user.data.full_name=req.body.full_name;
}

if(req.body.phone){
    user.data.phone=req.body.phone;
}

if(req.body.password){
    user.data.password=md5(req.body.password)
}
if(req.body.city){
    user.data.city=req.body.city;
}

if(req.body.is_phone_verified){
    user.data.is_phone_verified=req.body.is_phone_verified;
}

if(req.body.email){
    user.data.email=req.body.email;
    

}

let user_update=await GenericRepository.updateData(user);





if(email_verify_check.rows[0].dataValues.email!=req.body.email){
    // let validation_data = {};
    // validation_data.table = 'validation';
    // validation_data.data = {};
    // validation_data.data.uid = req.body.id;
    // validation_data.data.role = 3;
    // validation_data.data.validation_type = 'email';
    // validation_data.data.validation_hash = validation_hash;
    // validation_data.data.ref_email = req.body.email;
    // await GenericRepository.createData(validation_data);
    //     let create_user_data = {};
    //     create_user_data.name = user_update.dataValues.full_name;
    //     create_user_data.email = user_update.dataValues.email;
    //     create_user_data.link = process.env.WEBURL+'/account-verified/'+validation_hash;//change the url here
    //     global.eventEmitter.emit('account_activation_email_link', create_user_data);
    //   let update_emailverified={};
    //   update_emailverified.table='user',
    //  update_emailverified.where={id:req.body.id};
    // update_emailverified.data=
    // {
    //     is_email_verified:0
    //   }
    // let update_data=await GenericRepository.updateData(update_emailverified);
}



res.send({status:200,message:"data updated"})
    
       
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()


}

/*editContractorDataFlow api
method:PUT
input:body[other_data, data]
output:data,
purpose:to update contractor data flow
created by sayanti Nath
*/

ContractorController.editContractorDataFlow=(req,res)=>{


    (async()=>{

        try{


            let email_verify={};
            email_verify.table='user',
            email_verify.where={id:req.body.id};
            var email_verify_check=await GenericRepository.fetchData(email_verify);


            if(email_verify_check.rows[0].dataValues.email!=req.body.email){
                let email={};
                email.table='user',
                email.where={email:req.body.email,user_type:3}
                let email_check=await GenericRepository.fetchData(email);
                if(email_check.rows.length>0){
                    return res.send({status:409,message:'Email is already exist'})
                }

            }
           
            let validation_hash = await new Promise(function(resolve, reject){
                let validation_hash;
                commonFunnction.getRandomString(10).then((randNum) => {
                  validationhash = randNum
                  resolve(validation_hash)
                }).catch(randErr=>{
                  console.log(randErr);
                  return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
                })
          
              }).then(result=>{
                return result;
              }).catch(err=>{
                console.log(err);
                return res.send({status:500, msg:'Something went wrong', message:'Something went wrong'});
              })
       



              let user_demo={};
              user_demo.table='temp_users',

              user_demo.where={user_id:req.body.id};
              let user_fetch=await GenericRepository.fetchData(user_demo);

             

              user_demo.data={
                user_id:req.body.id,
                full_name:req.body.full_name,
                email:req.body.email,
                phone:req.body.phone,
                company_name:req.body.company_name,
                city:req.body.city,
                user_type:3,
                is_phone_verified:req.body.is_phone_verified,
    
}





        if(req.body.password){
        user_demo.data.password=md5(req.body.password)
        }

        if(user_fetch.rows.length>0){
             var user_demo_update=await GenericRepository.updateData(user_demo);
        }
        

        else{
       var user_demo_add=await GenericRepository.createData(user_demo);
        }

        let user_data_fetch={};
        user_data_fetch.table='temp_users',
        user_data_fetch.where={user_id:req.body.id};
        let user_data=await GenericRepository.fetchData(user_data_fetch);

        console.log(user_data);


        if(req.body.first_data){
            console.log('///',req.body.first_data);
            let first={};
            first=req.body.first_data;
            first.forEach(async function(item,index,arr){
                let info={};
                info.table='template_contractor_metas',
                info.where={};
                info.where.key_name=item.key_names;
                info.where.contractor_id=user_data.rows[0].dataValues.id;
                let info_create=await GenericRepository.fetchData(info);
                if( info_create.rows.length>0){
                    let data_first={};
                    data_first.table='template_contractor_metas',
                    data_first.where={};
                    data_first.where.id=info_create.rows[0].dataValues.id,
                    data_first.data={
                        key_value:item.key_values
                    }
            
            
                    let contractormetas_update_data=await GenericRepository.updateData(data_first);
                   
            
            
                }
            
            else{
            
               
            
            
            let data_second={};
            data_second.table='template_contractor_metas',
            data_second.data={
                key_name:item.key_names,
                key_value:item.key_values,
                group_name:item.group_names,
                contractor_id:user_data.rows[0].dataValues.id
            };
            
            let contractormetas_create_data=await GenericRepository.createData(data_second);
            }




            })
        }

        let key_names=req.body.key_names;
       let key_values=req.body.key_values;
       let group_names=req.body.group_names;

                     if(req.body.key_names){
                         //console.log(req.body.data);
                        // let key_names={};
                        // key_names=req.body.data;
                        key_names.forEach(async function(item,index,arr){
                        let information={};
                        information.table='template_contractor_metas',
                        information.where={};
                        information.where.key_name=item;
                        information.where.contractor_id=user_data.rows[0].dataValues.id;
                        let data_create=await GenericRepository.fetchData(information);
                        console.log(data_create);
                        if( data_create.rows.length>0){
                            let data={};
                            data.table='template_contractor_metas',
                            data.where={};
                            data.where.id=data_create.rows[0].dataValues.id,
                            data.data={
                                key_value:key_values[index]
                            }
                    
                    
                            let contractormetas_update=await GenericRepository.updateData(data);
                           
                    
                    
                        }
                    
                    else{
                    
                       
                    
                    
                    let data={};
                    data.table='template_contractor_metas',
                    data.data={
                        key_name:item,
                        key_value:key_values[index],
                        group_name:group_names[index],
                        contractor_id:user_data.rows[0].dataValues.id
                    };
                    
                    let contractormetas_create=await GenericRepository.createData(data);
                    }




                    })


               


            }



            if(req.body.data){



                let  contractor_manpowers={};
                contractor_manpowers.table='temp_contractor_manpowers',
                contractor_manpowers.where={contractor_id:user_data.rows[0].dataValues.id};
                let  contractor_manpowers_delete=await GenericRepository.deleteData(contractor_manpowers);

                

        

                let manpowers={};
              manpowers=req.body.data;



        manpowers.forEach(async function(item,index,arr){
       
  
            
       
            let contractor_manpowers={};
            contractor_manpowers.table='temp_contractor_manpowers',
            
            contractor_manpowers.data={
               
                contractor_id:user_data.rows[0].dataValues.id,
                specalization:item.specalizations,
                employee_no_oman:item.employee_no_omans,
                employee_no_non_oman:item.employee_no_non_omans,
                employee_type:item.employee_types
            }

            


            let manpowers_table=await GenericRepository.createData(contractor_manpowers);

        


    })

    
}


                    let user={};
                    user.table='user',
                    user.where={id:req.body.id};
                    user.data={
                        status:1
                    }
                    let user_update=await GenericRepository.updateData(user);











let admin={};
admin.table='admin',
admin.where={};
let admin_fetch=await GenericRepository.fetchData(admin);

let email_data={};
email_data.name=email_verify_check.rows[0].dataValues.full_name;
email_data.contemail=email_verify_check.rows[0].dataValues.email;
email_data.email=admin_fetch.rows[0].dataValues.email;

console.log(email_data);

global.eventEmitter.emit('contractor_edit_data',  email_data);



res.send({status:200,message:"data updated and waiting for admin to approved updated data"})
    
       
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()


}

/*MyProjects api
method:GET
input:query[page, limit, search_text, search, order]
output:data,
purpose:to view list of projects
created by sayanti Nath
*/

ContractorController.MyProjects=(req,res)=>{


    (async()=>{

        try{


            if (!req.query.page) return res.status(422).json({ status: 422,message: "page is required", fieldObject: 'query' });
      if (!req.query.limit) return res.status(422).json({ status: 422,message: "limit is required", fieldObject: 'query' });

           
              
                    //let start_data = moment().format('YYYY-MM-DD');
              
                    let page = parseInt(req.query.page);
                    let limit = parseInt(req.query.limit);
                    let offset = limit * (page - 1);
              
                    let and_data = [];
                    let or_data = [];
                    let name_data = [];
                    and_data.push({ contractor_id:req.user_id})
              
                    if (req.query.search_text) {
              
                        or_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `name` LIKE "%' + req.query.search_text + '%"')] } })
                      // or_data.push({id:{$like:'%'+req.query.search_text+'%'}});
                      // user_where = {full_name:req.query.search_text};
                      // user_where = {full_name:{$like:'%'+req.query.search_text+'%'}};
                     
                    }
              
                    if (req.query.search == "active") {
                        name_data.push({ project_id: { $in: [sequelize.literal('SELECT id FROM `projects` WHERE `is_active`=1')] } ,contractor_id:req.user_id})
                    }
                    if (req.query.search == "reject") {
                      name_data.push({ status:2,contractor_id:req.user_id})
                    }
              
              
              
              
              
                    // let info={};
                    // info.where={};
                    // //info.where.bid_closed_date={$gte:start_data};
                    // info.where.project_total_bids={$lte:6};
                    // console.log("hello")
              
                    let info = {};
                    //info.table='projects';
                    if (name_data.length > 0 && or_data.length > 0) {
                      info.where = { $or: or_data, $and: name_data };
                    }
                    // info.user_where = user_where
                    else if (name_data.length > 0) {
              
                      info.where = name_data;
                    }
              
                    else if (or_data.length > 0) {
                      // info.where= { $or:or_data,$and:name_data};
                      info.where = { $or: or_data, $and: and_data };
                    }
                    else {
                      info.where = and_data;
                      //info.user_where = {};
                    }
              
                    let order = [[]];
                    console.log(req.query.order)
                    if (req.query.order == 'createatasc') {
                      order = [['createdAt', 'ASC']];
              
                    }
                    else if (req.query.order == 'createatdsc') {
                      order = [['createdAt', 'DESC']];
              
                    }
              
                    else if (req.query.order == 'buildareadsc') {
                      order = [['built_up_area', 'DESC']];
              
                    }
                    else if (req.query.order == 'buildareaasc') {
                      order = [['built_up_area', 'ASC']];
              
                    }
              
              
              
              
                    else {
                      order = [['id', 'DESC']];
                    }
              
                    let fetch_data = await ConsultationhubRepository.contrctorMyProjects(info,order,limit,offset);

                    for(index in fetch_data.rows){


                        let sign={};
                        sign.table='project_contracts',
                        sign.where={project_id:fetch_data.rows[index].dataValues.project.dataValues.id,cllient_acceptance:1,contractor_acceptance:1}

                        let sign_update=await GenericRepository.fetchData(sign);

                        if(sign_update.rows.length>0){
                            fetch_data.rows[index].dataValues.sign_complete_for_project=1
                        }
                        else{
                            fetch_data.rows[index].dataValues.sign_complete_for_project=0
                        }
                        console.log(fetch_data.rows[index].dataValues.project.dataValues.id)
                    }

                    for(index in fetch_data.rows){

                        let project_version={};
                        project_version.table='project_contracts',
                        project_version.where={project_id:fetch_data.rows[index].dataValues.project.dataValues.id}
                        let order_new=[['version_no','DESC']];

                        let project_table=await GenericRepository.fetchData(project_version);
                        console.log(project_table);

                        if(project_table.rows.length>0){
                            fetch_data.rows[index].dataValues.latest_version=project_table.rows[0].dataValues;
                        }
                        else{
                            fetch_data.rows[index].dataValues.latest_version=null
                        }

                    }
              
                   
              
              
              
              
                    res.send({ status: 200,data: fetch_data, message: 'Project  fetch successfully' ,purpose:'Project  fetch successfully'});
              
              
              
             
              
              
              
    //    let info={};
    //    info.where={contractor_id:req.user_id}
    //    let info_fetch=await ConsultationhubRepository.contrctorMyProjects(info);

        
        //res.send({status:200, data:info_fetch,message:'fetch'});
        
        
        
        } catch(err){
        console.trace(err)
        
        res.send({status:500, err:err});
        
        }
        
        
        })()
    

}


/*fetchPhoto api
method:GET
input:query[type, limit, search_text, search, order]
output:data,
purpose:to view photo
created by sayanti Nath
*/

ContractorController.fetchPhoto=(req,res)=>{

    (async()=>{

        try{
    
            let info={};
            
            info.table='resources',
            info.where={user_id:req.user_id,type:req.query.type}
            let fetch=await GenericRepository.fetchData(info);

         res.send({status:200, msg:'fetch', message:'fetch',data:fetch});
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()

}

/*uploadProfilePhoto api
method:POST
input:files [upload]
output:data,
purpose:to upload photo
created by sayanti Nath
*/

ContractorController.uploadProfilePhoto=(req,res)=>{


    (async()=>{

        try{
    
            let url=global.constants.IMG_URL.contractor_profile_photo_url+req.files.upload[0].filename;


            if(req.body.is_edit==1){
                let info_demo={};
                info_demo.table='resources_demo',
                info_demo.where={
                    user_id:req.body.id,
                    type:'contractor_profile_photo'
                };
                let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
                info_demo.data={
                    user_id:req.body.id,
                    resource_type:'file',
                    resource_url:url,
                    type:'contractor_profile_photo'
                }
                if(resource_fetch_demo.rows.length>0){
                    let user_demo_update=await GenericRepository.updateData(info_demo);
                }
                else{
                
                    let user_demo_create=await GenericRepository.createData(info_demo);
                }
    
                
            }
  
else{

    let info_demo={};
    info_demo.table='resources_demo',
    info_demo.where={
        user_id:req.body.id,
        type:'contractor_profile_photo'
    };
    let resource_fetch_demo=await GenericRepository.fetchData(info_demo)
    info_demo.data={
        user_id:req.body.id,
        resource_type:'file',
        resource_url:url,
        type:'contractor_profile_photo'
    }
    if(resource_fetch_demo.rows.length>0){
        let user_demo_update=await GenericRepository.updateData(info_demo);
    }
    else{
    
        let user_demo_create=await GenericRepository.createData(info_demo);
    }

    
                let info={};
            
                info.table='resources',
                info.where={user_id:req.user_id,type:'contractor_profile_photo'}
                let fetch=await GenericRepository.fetchData(info);


                info.data={
                    user_id:req.user_id,
                    resource_type:'file',
                    resource_url:url,
                    type:'contractor_profile_photo'
                }

                if(fetch.rows.length>0){
                let resource_update=await GenericRepository.updateData(info)
                }
                else{
                    let resource_create=await GenericRepository.createData(info)
                }
}
         res.send({status:200, msg:'photo uploaded', message:'photo uploaded'});
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()

}

/*emailExist api
method:POST
input:body [email]
output:massage[ email already exist / email does not exist / email does not change /],
purpose:to check email exist or not
created by sayanti Nath
*/

ContractorController.emailExist=(req,res)=>{

    (async()=>{

        try{
            let email={};
            email.table='user',
            email.where={id:req.user_id};
            let email_exist=await GenericRepository.fetchData(email);
            if(email_exist.rows[0].dataValues.email!=req.body.email)
            {
            let info={};
            info.table='user',
            info.where={email:req.body.email,user_type:3}
            let fetch_data=await GenericRepository.fetchData(info);
           
            if(fetch_data.count>0) 
            {
                 return res.send({status:400, msg:'email already exist', message:'email already exist',purpose:'check email exist or not',data:[]});
        }
        else{
            return res.send({status:200, msg:'email does not exist', message:'email does not exist',purpose:'check email exist or not',data:[]});
        }
    }
    else{
        return res.send({status:200, msg:'email does not change', message:'email does not change',purpose:'check email exist or not',data:[]}); 
    }
    
      } catch(err){
        console.trace(err)
    
          res.send({status:500, err:err});
    
      }
    
       
      })()

}



module.exports=ContractorController
