exports.default = {
  notify: function(api) {
    return {
    	//Common Properties
        email: "help@partialpallet.com",
        password: process.env.BRIM_EMAIL_PASSWORD,

    	senderAddress: '"Password Reset" <help@partialpallet.com>',
    	baselink: "www.partialpallet.com/resetpassword.html?sessionid=",
    }
  }
}
