var validate = require( '../../widget/validate/validate' );

$( '#registerForm' ).on( 'submit', function(){
    var data = {
        username:   $('#username').val(),
        password:   $('#password').val(),
        repassword: $('#repassword').val(),
        email:      $('#email').val()  
    }
    //定义验证规则
    var usernameRule = [{
        'noBlank': '请输入用户名',    //非空
        'min': [ 3, '用户名不能少于3位'],    //最小
        'max': [ 16, '用户名长度不能多于16位'],    //最大
        'typeEN': '用户名只能为字母及数字'     //准输入类型
    }, function( prompt ){    //错误提示回调
        $( '#usernameTip' ).html( prompt );
    }],
    passwordRule = [{
        'noBlank': '请输入密码',
        'self': function( cb ){    //自定义规则
            cb( '密码不能全为数字' );
            return isNaN( this.value - 0 );
        }
    }],
    email = [{
        'noBlank': '请输入注册邮箱',
        'typeEmail': '邮箱格式不正确'    //指定某定义规则
    }, function( prompt ){
        $( '#emailTip' ).html( prompt );
    }];
    //为指定指定表单添加指定触发事件的指定规则
    validate( username, [ 'keyup' ], usernameRule );
    validate( password, [ 'change' ], passwordRule );
    validate( repassword, [ 'change' ], passwordRule );
    validate( email, [ 'foucsOut' ], emailRule );

    $.ajax({
        url: '/register',
        type: 'post',
        dataType: 'json',
        data: data,
        success: function( ret ){
            console.log( ret );
        }
    });
    return false;
})
