const express = require('express');
const router = express.Router();
const usersControllers = require("../utils/Auth");


// Users Registeration Route
router.post("/register-user", 
  async (req, res) => {
    await usersControllers.userRegister(req.body, "user", res)
  }
);

// Users Registeration Route
router.post("/register-vendor", 
  async (req, res) => {
    await usersControllers.userRegister(req.body, "vendor", res)
  }
);


// Admin Registration Route
router.post("/register-admin", 
  async (req, res) => {
    await usersControllers.userRegister(req.body, "admin", res)
  }
);

// Super Admin Registration Route
router.post("/register-super-admin", 
  async (req, res) => {
    await usersControllers.userRegister(req.body, "superadmin", res)
  }
);

// Users Login Route
router.post("/login-user", async (req, res) => {
  await usersControllers.userLogin(req.body, "user", res);
});



// Users Login Route
router.post("/login-vendor", async (req, res) => {
  await usersControllers.userLogin(req.body, "vendor", res);
});


//  Admin Login Route
router.post("/login-admin", async (req, res) => {
  await usersControllers.userLogin(req.body, "admin", res);
});

//  Super Admin Login Route
router.post("/login-super-admin", async (req, res) => {
  await usersControllers.userLogin(req.body, "superadmin", res);
});

//  Profile Route
router.get("/profile", usersControllers.userAuth, async (req, res) => {
  return res.json(usersControllers.serializeUser(req.user));
});

// Users Protected Route
router.get(
  "/user-protectd",
  usersControllers.userAuth,
  usersControllers.checkRole(["superadmin", "admin"]), 
  usersControllers.all_user);

// // Admin Protected Route
// router.get(
//   "/admin-protectd",
//   userAuth,
//   checkRole(["admin"]),
//   async (req, res) => {
//     return res.json("Hello Admin");
//   }
// );


// super admin and admin can Get single user 
router.get('/:userId',
  usersControllers.userAuth,
  usersControllers.checkRole(["superadmin", "admin"]), usersControllers.single_user);


// // only super admin and admin can Get all users 
// router.get("/allusers",
//   usersControllers.userAuth,
//   usersControllers.checkRole(["superadmin", "admin"]), usersControllers.all_user);


  
// only Super Admin Can deleted a user
router.delete('/:userId',
  usersControllers.userAuth,
  usersControllers.checkRole(["superadmin"]), usersControllers.user_deleted
);



// only Super Admin Can updated a user
router.patch('/:userId',
  usersControllers.userAuth,
  usersControllers.checkRole(["superadmin"]), 
  usersControllers.updated_user
);

// // Super Admin Protected Route
// router.get(
//   "/super-admin-and-admin-protectd",
//   userAuth,
//   checkRole(["superadmin", "admin"]),
//   async (req, res) => {
//     return res.json("Super admin and Admin");
//   }
// );

module.exports = router;
