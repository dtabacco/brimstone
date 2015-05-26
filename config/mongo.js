exports.default = {
  mongo: function(api) {
    return{

      env: process.env.BRIM_NODE_ENV, 
      url: process.env.BRIM_MONGO_URL, 
      port: process.env.BRIM_MONGO_PORT || 27017,
      database: process.env.BRIM_MONGO_DATABASE,
   
      //Common
      collections: ['users']
      // password: null,
      // options: null
    }
  }
}
