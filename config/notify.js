exports.default = {
  notify: function(api) {
    return {
    	//Common Properties
        email: "partialpallet@gmail.com",
        password: process.env.BRIM_EMAIL_PASSWORD,

    	senderAddress: '"Password Reset" <partialpallet@gmail.com>',
    	baselink: "www.partialpallet.com/resetPassword.html?sessionid=",
    }
  }
}
