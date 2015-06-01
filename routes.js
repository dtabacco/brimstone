exports.routes = {
  
  get: [
    { path: "/users", action: "usersList" },
    { path: "/users/:username", action: "userProfileList" },   
  ],

  post: [
    { path: "/users", action: "userAdd" },
    { path: "/users/authenticate", action: "userAuthenticate" },
    { path: "/users/verifyToken", action: "userVerifyToken" },
  ],

  put: [
    { path: "/users/:username", action: "userEdit" },
    { path: "/users/password/:username", action: "userPasswordEdit" },
  ],

  delete: [
    { path: "/users", action: "usersDelete" },
    { path: "/users/:id", action: "usersDeleteID" },
  ]

};
