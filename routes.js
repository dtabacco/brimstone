exports.routes = {
  
  get: [
    /*{ path: "/users", action: "usersList" },*/
    { path: "/users/:username", action: "userProfileList" },  
    { path: "/users/lite/list", action: "userListLite" }, 
    { path: "/users/lite/:username", action: "userProfileLite" }, 
    { path: "/listings", action: "getAllListing" },
    { path: "/listings/:id", action: "getListing" }, 
    { path: "/listings/profile/:username", action: "getMyListings" }, 
    { path: "/listings/:query/:zip", action: "listingSearch" },
  ],

  post: [
    { path: "/users", action: "userAdd" },
    { path: "/users/authenticate", action: "userAuthenticate" },
    { path: "/users/verifyToken", action: "userVerifyToken" },
    { path: "/listings", action: "listingAdd" },
    { path: "/uploader", action: "uploader" },
  ],

  put: [
    { path: "/users/:username", action: "userEdit" },
    { path: "/users/password/:username", action: "userPasswordEdit" },
    { path: "/listings/:id", action: "listingEdit" },    
    { path: "/listings/renew/:id", action: "listingRenew" },
    { path: "/listings/:id/imageRemove", action: "listingImageRemove" },
  ],

  delete: [
    /*{ path: "/users", action: "usersDelete" },*/
    /*{ path: "/users/:id", action: "usersDeleteID" },*/
    /*{ path: "/listings", action: "listingsDelete" },*/
    { path: "/listings/:id", action: "listingsDeleteID" },
  ]

};
