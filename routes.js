exports.routes = {
  
  get: [
    { path: "/users", action: "usersList" },
    { path: "/users/:userName", action: "userProfileList" },   
  ],

  post: [
    { path: "/users/authenticate", action: "userAuthenticate" },
    { path: "/users/authenticateReal", action: "userAuthenticateReal" },
    { path: "/users/verifyToken", action: "userVerifyToken" },
  ],

  put: [
  ],

  delete: [
    { path: "/users", action: "usersDelete" },
  ]

};
