exports.routes = {
  
  get: [
    { path: "/users", action: "usersList" },
    { path: "/users/:userName", action: "userProfileList" },   
  ],

  post: [
    { path: "/users", action: "userAdd" },
    { path: "/users/authenticate", action: "userAuthenticate" },
    //{ path: "/users/verifyToken", action: "userVerifyToken" },
  ],

  put: [
    { path: "/users/:username", action: "userEdit" },
  ],

  delete: [
    { path: "/users", action: "usersDelete" },
    { path: "/users/:id", action: "usersDeleteID" },
  ]

};
