function deleteMethod(id,url){
    var r = confirm('Are you sure?');
    if(r == true){
        $.ajax({
            url: "/admin/delete-"+url,
            type: 'DELETE',
            data:{
                id : id
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Deleted successfully');
                    $('.success-msg').show();
                    $('#'+url+'_'+id).remove();
                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        });
    }else{
       return; 
    }
}

function active(id,link,text){
    var r = confirm('Are you sure?');
    let text_start = link.charAt(0).toUpperCase() + link.substr(1).toLowerCase();
    if(r == true){
        $.ajax({
            url:"/admin/"+link+"-status",
            type: "PUT",
            data : {
                id: id,
                status : 1
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Updated successfully');
                    $('.success-msg').show();
                    $('#status_btn_'+id).html("<button class=\"btn btn-secondary btn-sm-wordLitter\" onclick=\"inactive("+id+",'"+link+"','"+text_start+" Inactive')\">Mark inactive</button>");
                    $('#suspend_btn_'+id).html("<button class=\"btn btn-secondary btn-sm-wordLitter\" onclick=\"suspend("+id+",'"+link+"','"+text_start+" Suspended')\">Suspend</button>");
                    $('#status_'+id).text(text);
                    window.location.href = window.location;
                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        })
    }
}


function inactive(id,link,text){
    var r = confirm('Are you sure?');
    let text_start = link.charAt(0).toUpperCase() + link.substr(1).toLowerCase();

    if(r == true){
        $.ajax({
            url:"/admin/"+link+"-status",
            type: "PUT",
            data : {
                id: id,
                status : 2
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Updated successfully');
                    $('.success-msg').show();
                    $('#status_btn_'+id).html("<button class=\"btn btn-success btn-sm-wordLitter\" onclick=\"active("+id+",'"+link+"','"+text_start+" active')\">Mark active</button>");
                    $('#status_'+id).text(text);
                    window.location.href = window.location;
                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        })
    }
}

function suspend(id,link,text){
    var r = confirm('Are you sure?');
    let text_start = link.charAt(0).toUpperCase() + link.substr(1).toLowerCase();
    if(r == true){
        $.ajax({
            url:"/admin/"+link+"-status",
            type: "PUT",
            data : {
                id: id,
                status : 3
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Updated successfully');
                    $('.success-msg').show();
                    $('#suspend_btn_'+id).html("<button class=\"btn btn-success btn-sm-wordLitter\" onclick=\"active("+id+",'"+link+"','"+text_start+" active')\">Unsuspend</button>");
                    $('#status_'+id).text(text); 
                    window.location.href = window.location;

                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        })
    }
}

function changeStatus(id,link,status,status_text,next_status,next_status_text,css_class,next_css_class){
    var r = confirm('Are you sure?');
    let text_start = link.charAt(0).toUpperCase() + link.substr(1).toLowerCase();  
    if(r == true){
        $.ajax({
            url:"/admin/"+link+"-status",
            type: "PUT",
            data : {
                id: id,
                status : status
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Updated successfully');
                    $('.success-msg').show();
                    $('#suspend_button_'+id).html("<button class= 'btn " +css_class+" btn-sm-wordLitter' onclick=\"changeStatus("+id+",'"+link+"','"+next_status+"','"+next_status_text+"','"+status+"','"+status_text+"','"+next_css_class+"','"+css_class+"')\">"+next_status_text+"</button>");
                    $('#status_'+id).text((status==1)?text_start + ' active':(status == 2)? text_start + ' inactive' : text_start + ' suspended');
                    window.location.href = window.location;

                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        })
    }
}


function fetch(page,sort_by,sort_order,link,user_id = 0){
    var limit = $('#styledSelect1').val();
    var searchParam = $('#search').val(); 
    searchParam = searchParam.trim();
    var searchField = $('#search_field').val();
    let url = '';
    if(searchParam != ''){
        url = '/admin/'+link+'?search='+searchParam+'&page='+page+'&limit='+limit;
    }else{
       url = '/admin/'+link+'?page='+page+'&limit='+limit;
    }
    if(searchField != ''){
        url = '/admin/'+link+'?search='+searchParam+'&page='+page+'&limit='+limit+'&search_field='+searchField;
    }
    if((sort_by && sort_by != '') && (sort_order && sort_order != '')){
        url += '&sort_by='+sort_by+'&sort_order='+sort_order;
    }
    if(user_id != 0){
        url += '&user_id='+user_id;
    }
    window.location.href = url;
}

function list(link,limit,user_id = 0){
    var limit = $('#styledSelect1').val();
    var page = $('.active a').text();
    var searchParam = $('#search').val(); 
    searchParam = searchParam.trim();
    var searchField = $('#search_field').val();
    let url = '';
    if( limit != ''){
        url = '/admin/'+link+'?page='+page+'&limit='+limit;
    }
    else{
       url = '/admin/'+link+'?page='+page;
    }
    if(user_id != 0){
        url += '&user_id='+user_id;
    }
    if(searchField){
        url += '&search_field='+searchField;
    }
    if(searchParam){
        url += '&search='+searchParam;
    }
    window.location.href = url;
    
}

function goBack() {
    window.history.back();
}


function reportAction(id,status,litter_id){
    var r = confirm('Are you sure?');
    if(r == true){
        var btn_status = (status == 0)?1:(status == 1)?2:1;
        var btn_text = (btn_status == 1)?'Reject Report':(btn_status == 1)?'Accept Report':'Reject report';
        $.ajax({
            url:"/admin/change-report-status",
            type: "PUT",
            data : {
                id: id,
                status : status,
                litter_id : litter_id
            },
            success: function(result){
                if(result.status == 200){
                    $('.success-msg').text('Updated successfully');
                    $('.success-msg').show();
                    window.location.href = window.location.href;
                }else{
                    $('.error-msg').text(result.msg);
                    $('.error-msg').show();
                }
            }
        })
    }
}

function toggleComment(id){
    $('#admin_note_form'+id).toggle();
    $('#admin_note'+id).toggle();
}

function sortTable(field, order, text,limit,page,link){
    var searchParam = $('#search').val(); 
    searchParam = searchParam.trim();
    var searchField = $('#search_field').val();
    let url = "/admin/"+link+"?sort_by="+field+"&sort_order="+order;
    if(limit){
        url += '&limit='+limit;
    }
    if(page){
        url += '&page='+page
    }
    if(searchField){
        url += '&search_field='+searchField;
    }
    if(searchParam){
        url += '&search='+searchParam;
    }
    window.location.href = url;

}

function sortTable2(field, order, text,limit,page,link){
    var searchParam = $('#search').val(); 
    searchParam = searchParam.trim();
    var searchField = $('#search_field').val();
    let url = "/admin/"+link+"?sort_by="+field+"&sort_order="+order;
    if(limit){
        url += '&limit='+limit;
    }
    if(page){
        url += '&page='+page
    }
    if(searchField){
        url += '&search_field='+searchField;
    }
    if(searchParam){
        url += '&search='+searchParam;
    }

    window.location.href = url;

}


function export_data(link){
    var searchField = $('#search_field').val();
    var searchParam = $('#search').val(); 
    searchParam = searchParam.trim();
    let url = '/admin/export-'+link;
    if(searchField && searchParam){
        url += '/?search_field='+searchField;
        url += '&search='+searchParam;
    }else if(searchParam && !searchField){
        url += '/?search='+searchParam;
    }
    // return false;
    $.ajax({
        url:url,
        type: "GET",
        success: function(result){
            console.log(result);
            if(result.status == 200){
                window.location.href = '../'+result.url;
            }else{
                $('.err-msg').text(result.msg);
                $('.err-msg').show();
            }
        }
    })
}



function litters(id){
        window.location.href = "/admin/litters?user_id="+id; 
}




/*!
 * jQuery Floating Scrollbar - v0.4 - 02/28/2011
 * http://benalman.com/
 * 
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function($){
    var // A few reused jQuery objects.
        win = $(this),
        html = $('html'),
  
        // All the elements being monitored.
        elems = $([]),
  
        // The current element.
        current,
  
        // The previous current element.
        previous,
  
        // Create the floating scrollbar.
        scroller = $('<div id="floating-scrollbar"><div/></div>'),
        scrollerInner = scroller.children();
  
    // Initialize the floating scrollbar.
    scroller
      .hide()
      .css({
        position: 'fixed',
        bottom: 0,
        height: '30px',
        overflowX: 'auto',
        overflowY: 'hidden'
      })
      .scroll(function() {
        // If there's a current element, set its scroll appropriately.
        current && current.scrollLeft(scroller.scrollLeft())
      });
  
    scrollerInner.css({
      border: '1px solid #fff',
      opacity: 0.01
    });
     // Call on elements to monitor their position and scrollness. Pass `false` to
  // stop monitoring those elements.
  $.fn.floatingScrollbar = function( state ) {
    if ( state === false ) {
      // Remove these elements from the list.
      elems = elems.not(this);
      // Stop monitoring elements for scroll.
      this.unbind('scroll', scrollCurrent);
      if ( !elems.length ) {
        // No elements remain, so detach scroller and unbind events.
        scroller.detach();
        win.unbind('resize scroll', update);
      }
    } else if ( this.length ) {
      // Don't assume the set is non-empty!
      if ( !elems.length ) {
        // Adding elements for the first time, so bind events.
        win.resize(update).scroll(update);
      }
      // Add these elements to the list.
      elems = elems.add(this);
    }
    // Update.
    update();
    // Make chainable.
    return this;
  };

  // Call this to force an update, for instance, if elements were inserted into
  // the DOM before monitored elements, changing their vertical position.
  $.floatingScrollbarUpdate = update;

  // Hide or show the floating scrollbar.
  function setState( state ) {
    scroller.toggle(!!state);
  }

  // Sync floating scrollbar if element content is scrolled.
  function scrollCurrent() {
    current && scroller.scrollLeft(current.scrollLeft())
  }

  // This is called on window scroll or resize, or when elements are added or
  // removed from the internal elems list.
  function update() {
    previous = current;
    current = null;

    // Find the first element whose content is visible, but whose bottom is
    // below the viewport.
    elems.each(function(){
      var elem = $(this),
          top = elem.offset().top,
          bottom = top + elem.height(),
          viewportBottom = win.scrollTop() + win.height(),
          topOffset = 30;

      if ( top + topOffset < viewportBottom && bottom > viewportBottom ) {
        current = elem;
        return false;
      }
    });

    // Abort if no elements were found.
    if ( !current ) { setState(); return; }

    // Test to see if the current element has a scrollbar.
    var scroll = current.scrollLeft(),
        scrollMax = current.scrollLeft(90019001).scrollLeft(),
        widthOuter = current.innerWidth(),
        widthInner = widthOuter + scrollMax;

    current.scrollLeft(scroll);

    // Abort if the element doesn't have a scrollbar.
    if ( widthInner <= widthOuter ) { setState(); return; }

    // Show the floating scrollbar.
    setState(true);

    // Sync floating scrollbar if element content is scrolled.
    if ( !previous || previous[0] !== current[0] ) {
      previous && previous.unbind('scroll', scrollCurrent);
      current.scroll(scrollCurrent).after(scroller);
    }

    // Adjust the floating scrollbar as-necessary.
    scroller
      .css({
        left: current.offset().left - win.scrollLeft(),
        width: widthOuter
      })
      .scrollLeft(scroll);

    scrollerInner.width(widthInner);
  }

})(jQuery);





/**
 * @description add admin user from validation
 */

function adminFormValidation(){
    let is_valid = true;
    let required_fields = ['first_name','last_name','password','confirm_password','email','dob','pseudonym'];
    let non_duplicate_fields = ['email','pseudonym'];

    let password = $('#password').val();
    let confirm_password = $('#confirm_password').val();
  
    for(key in required_fields){
        let value = $('#'+required_fields[key]).val();
        if(value.length == 0){
            $('#'+required_fields[key]+'_error').text("This Field can't be empty");
            is_valid = false;
        }else{
            $('#'+required_fields[key]+'_error').text("");
        }
    }

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    let date = [year, month, day].join('-');

    // console.log(+new Date($('#dob').val()) == +new Date(date))
   
    if(+new Date($('#dob').val()) == +new Date(date)){
        is_valid = false;
        $('#dob_error').text("DOB can't be today");
    }

    if(+new Date($('#dob').val()) > +new Date(date)){
        is_valid = false;
        $('#dob_error').text("DOB can't be greater than today");
    }

    if(password != confirm_password){
        $('#confirm_password_error').text("Passwords Doesn't match");
        is_valid =  false;
    }

    if(password.length < 8){
        $('#password_error').text("Password length should be at least 8");
        is_valid = false;
    }else{
        $('#password_error').text("");
    }

    if(!is_valid) return false;
    for(index in non_duplicate_fields){
        let key = non_duplicate_fields[index];
        let value = $('#'+key).val();
        if(value.length > 0){
            $.ajax({
                url:"/admin/register-"+key+"check",
                type: "POST",
                async: false,
                data : {
                    [key] : value
                },
                success: function(result){
                    if(result.status != 200){
                       console.log(result);                        
                    }else{
                    }
                },
                error : function(error){
                    if(error.responseJSON.status != 500){
                        $('#'+key+'_error').text(error.responseJSON.msg);
                    }
                    is_valid = false;
                }
            })
        }
        
    }
    // console.log(is_valid);
    if(!is_valid) return false;

    $('#addAdminForm').submit();

}

/**
 * @description add admin user from validation
 */

function adminEditFormValidation(id){
    let is_valid = true;
  
    let required_fields = ['first_name','last_name','email','dob','pseudonym'];
    let non_duplicate_fields = ['email','pseudonym'];

    let password = $('#password').val();
    let confirm_password = $('#confirm_password').val();
  
    for(key in required_fields){
        let value = $('#'+required_fields[key]).val();
        if(value.length == 0){
            $('#'+required_fields[key]+'_error').text("This Field can't be empty");
            is_valid = false;
        }else{
            $('#'+required_fields[key]+'_error').text("");
        }
    }
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    let date = [year, month, day].join('-');

   
    if(+new Date($('#dob').val()) == +new Date(date)){
        is_valid = false;
        $('#dob_error').text("DOB can't be today");
    }

    if(+new Date($('#dob').val()) > +new Date(date)){
        is_valid = false;
        $('#dob_error').text("DOB can't be greater than today");
    }


    if(password.length > 0 && password.length < 8){
        $('#password_error').text("Password length should be at least 8");
        is_valid = false;
    }else{
        $('#new_password_error').text("");
    }

    if(password && (password != confirm_password)){
        $('#confirm_password_error').text("Passwords Doesn't match");
        is_valid =  false;
    }
    if(!is_valid) return false;
    for(index in non_duplicate_fields){
        let key = non_duplicate_fields[index];
        let value = $('#'+key).val();
        if(value.length > 0){
            $.ajax({
                url:"/admin/register-"+key+"check",
                type: "POST",
                async: false,
                data : {
                    [key] : value,
                    id : id
                },
                success: function(result){
                    if(result.status != 200){
                       console.log(result);                        
                    }else{
                    }
                },
                error : function(error){
                    if(error.responseJSON.status != 500){
                        $('#'+key+'_error').text(error.responseJSON.msg);
                    }
                    is_valid = false;
                }
            })
        }
        
    }
    // console.log(is_valid);
    if(!is_valid) return false;

    $('#addAdminForm').submit();

}

/**
 * @description change password form validation and submit
 */
function changePasswordFormSubmit(){
    let is_valid = true;
    let password = $('#new_password').val();
    let confirm_password = $('#confirm_password').val();
    let old_password = $('#old_password').val();

 
    if(old_password.length == 0){
        $('#old_password_error').text("This field can't be empty");
        is_valid =  false;
    }else{
        $('#old_password_error').text("");
    }
    if(password.length == 0){
        $('#new_password_error').text("This field can't be empty");
        is_valid =  false;
    }else if(password.length < 8){
        $('#new_password_error').text("Password length should be at least 8");
        is_valid = false;
    }else{
        $('#new_password_error').text("");
    }

    if(confirm_password.length == 0){
        $('#confirm_password_error').text("This field can't be empty");
        is_valid =  false;
    }else{
        $('#confirm_password_error').text("");
    }
    if(!is_valid) return false;

    if(password && (password != confirm_password)){
        $('#confirm_password_error').text("Passwords Doesn't match");
        is_valid =  false;
    }
    if(!is_valid) return false;

    $.ajax({
        url:"/admin/change-password",
        type: "POST",
        data : {
           "new_password" : password,
           "old_password" : old_password
        },
        success: function(result){
            if(result.status != 200){                       
            }else{
                alert('Password changed successfully please login with new password');
                // $('.success-msg').text('Password changed successfully please login with new password');
                // $('.success-msg').show(); 
                // setTimeout(()=>{
                    logout();  
                // },3000)
                // window.location = '/admin/dashboard';
            }
        },
        error : function(error){
            if(error.responseJSON.status == 401){
                $('#old_password_error').text(error.responseJSON.msg);
            }
            is_valid = false;
        }
    })

}
function logout(){
    var token = localStorage.getItem('wordlitter_authtoken');
    $.ajax({
        url:"/admin/log-out",
        type: "PUT",
        beforeSend: function(request) {
          request.setRequestHeader("wordlitter_authtoken", token);
          request.setRequestHeader("device-id", 'web');
          request.setRequestHeader("device_type", '');
        },
        data : {
        },
        success: function(result){
            if(result.status == 200){
                
                localStorage.removeItem('wordlitter_authtoken')
                window.location.href = '/admin/login';
            }else{
                $('.error-msg').text(result.msg);
                $('.error-msg').show();
            }
        }
    })
}

/**
 * @description reset form
 */
$(document).ready(function(){

    var pathname = window.location.pathname;
    pathname = pathname.split('/')
    
    $('#'+pathname[2]).addClass('active');
    console.log(pathname[2])
    if(pathname[2] == 'add-admin' || pathname[2] == 'edit-user'){
        $('#admins').addClass('active');
    }
    

    $('#reset_button').bind('click',function(){
        $('#search').val('');
        $('#search_field').val('');
        window.location = window.location.href.split("?")[0];
    });

    $('#search_field').change(()=>{
        $('#search').val('');
    })
    $('#search').blur(()=>{
        $('#search').val($('#search').val().trim())
    })
    $('#search').keypress((e)=>{
        if(e.which==13){
            $('#search').val($('#search').val().trim())
        }
    })


    
})


