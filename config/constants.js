
module.exports = {
  
  saltRounds: 10,
  allowMimeType: ['image/jpeg', 'image/png', 'application/pdf','video/mp4', 'image/svg'],
  jwt: {
    secret: 'UWHUx2eLpUr395XGVyfXQoA2xXQ5CAyyLZehbXCJ',
    options: {
      algorithm: 'HS256',
      expiresIn: 60 * 240,
      audience: 'aud:Ebinaa',
      issuer: 'Ebinaa-' + process.env.GIT_BRANCH + '-' + (process.env.NODE_ENV == 'development' ? 'DEV' : 'PROD') + '@' + require('os').hostname()
    }
  },
  uploads: {
    profile_photo: global.appPath + '/uploads/profile_photo/',
    home_partner:global.appPath + '/uploads/home_partner/',
    cms_content:global.appPath + '/uploads/cms_content/',
    article_photo:global.appPath + '/uploads/article_photo/',
    home_slider:global.appPath + '/uploads/home_slider/',//  localhost server path
    company_engineer_profile_photo:global.appPath + '/uploads/company_engineer_profile_photo/',
    company_engineer_cv:global.appPath + '/uploads/company_engineer_cv/',
    project_images:global.appPath + '/uploads/project_images/',
    project_docs:global.appPath + '/uploads/project_docs/',
    project_gnatt_chart:global.appPath + '/uploads/project_gnatt_chart/',
    upload_cr_certificate:global.appPath + '/uploads/contractor_documents/upload_cr_certificate',
    upload_owners_national_id:global.appPath + '/uploads/contractor_documents/upload_owners_national_id',
    upload_manpowers_report:global.appPath + '/uploads/contractor_documents/upload_manpowers_report',
    company_profile:global.appPath + '/uploads/contractor_documents/company_profile',
    other_files:global.appPath + '/uploads/contractor_documents/other_files',
    project_docs_zips:global.appPath + '/uploads/project_zips/',
    project_docs_zips:global.appPath + '/uploads/project_zips/',
    project_scope_pdf:global.appPath + '/uploads/project_scope_pdf/',
    project_works_pdf:global.appPath + '/uploads/project_works_pdf/',
    mode_of_payment_pdf:global.appPath + '/uploads/mode_of_payment_pdf/',
    project_contract_pdf:global.appPath + '/uploads/project_contract_pdf/',
    client_profile_photo:global.appPath + '/uploads/client_profile_photo/',
    consultant_profile_photo:global.appPath + '/uploads/consultant_profile_photo/',
    contract_documet:global.appPath + '/uploads/contract_documet/',
    contractor_profile_photo:global.appPath + '/uploads/contractor_profile_photo/',
    invoice_pdf:global.appPath + '/uploads/invoice_pdf/',
    commom_iamges:global.appPath + '/uploads/common_images/',
    contrctor_profile:global.appPath + '/uploads/contrctor_profile/',
    bid_view:global.appPath + '/uploads/bid_view/',
    
    // website_images:'/var/www/html/ebinaa-node/uploads/common_images/'


  },
  IMG_URL: {
    profile_photo: 'profile_photo/',
    home_partner_url:'home_partner/',
    home_partner_url:'home_partner/',
    home_slider_url:'home_slider/',
    cms_content:'cms_content/',
    article_photo:'article_photo/',
    company_engineer_profile_photo:'company_engineer_profile_photo/',
    company_engineer_cv:'company_engineer_cv/',
    project_images:'project_images/',
    project_docs:'project_docs/',
    project_gnatt_chart:'project_gnatt_chart/',
    contractor_cr_certificate_url:'upload_cr_certificate/',
    upload_owners_national_id_url:'upload_owners_national_id/',
    upload_manpowers_report_url:'upload_manpowers_report/',
    company_profile_url:'company_profile/',
    other_files_url:'other_files/',
    project_scope_url:'project_scope_pdf/',
    payment_url:'mode_of_payment_pdf/',
    project_works_pdf_url:'project_works_pdf/',
    project_contract_pdf_url:'project_contract_pdf/',
    client_profile_photo_url:'client_profile_photo/',
    consultant_profile_photo_url:'consultant_profile_photo/',
    contract_documet_url:'contract_documet/',
    contractor_profile_photo_url:'contractor_profile_photo/',
    contrctor_profile_url:'contrctor_profile/',
    bid_view_url:'bid_view/'




    //  localhost server path 
  },


  SMS: {
    API :'https://software.unifonic.com/',
    USERNAME :'buildassist.info@gmail.com',
    PASSWORD :'@TW5eQbKhr3A3rz'
  },
  GOOGLEAPIKEY: 'AIzaSyAAFKNh3anJV38Jw0g9NL0agjTow-mqdQE',
  FCMSERVERKEY: 'AAAAnAmc7SY:APA91bEFyiIXWyoZTW1NMvnI0coEIP53UjOjTlnwBzVWFWCjBIS5ifzwwdxS7MhBQEq0YTDdDLqetO85r52nZNsVXD5zOhrdjDrSBhraCriOvgRzYM-rrEUIHzMjO3xxxVClwig98Jgn',
  ACCOUNTSID: 'ACed3e395b748c915de61ac0dffb6fe37b',
  AUTHTOKEN: 'd88fcccefcd86a0f1f8a918a5c9b0fee',
  ADMINNO: '+12028041888',
  ADMINSALT: 'ASD5467A5SD675A',

  SMTP : {
     FROM : '"eBinaa"<ebinaa321@gmail.com>',
    HOST : 'smtp.gmail.com',
  USER: 'ebinaa321@gmail.com',
    PASS: 'UIpl#@2020',
   PORT : 587
},
PDFIMAGEPATH:'http://dev.uiplonline.com:4055'
}
