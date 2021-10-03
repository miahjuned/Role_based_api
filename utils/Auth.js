const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const User = require("../models/User");
const { SECRET } = require("../config");


//*************************  To register the user (ADMIN, SUPER_ADMIN, USER)  ***************************************

 exports.userRegister = async (userData, role, res) => {
  try {
    // Validate the username
    let usernameNotTaken = await validateUsername(userData.username);
    if (!usernameNotTaken) {
      return res.status(400).json({
        message: `Username is already taken.`,
        success: false
      });
    }

    // validate the email
    let emailNotRegistered = await validateEmail(userData.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
        success: false
      });
    }

    // Get the hashed password
    const password = await bcrypt.hash(userData.password, 12);
    // create a new user
    const newUser = new User({
      ...userData,
      password,
      role
    });

    await newUser.save();
    return res.status(201).json({
      message: "Hurry! now you are successfully registered. Please now login.",
      success: true
    });
  } catch (err) {
    // Implement logger function (winston)
    return res.status(500).json({
      message: "Unable to create your account.",
      success: false
    });
  }
};


//*************************  To Login the user (ADMIN, SUPER_ADMIN, USER)  ***************************************

 exports.userLogin = async (userCreds, role, res) => {
  let { email, password } = userCreds;
  // First Check if the username is in the database
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "Email is not found. Invalid login credentials.",
      success: false
    });
  }
  // 
  
//*******  check the role  ******
  if (user.role !== role) {
    return res.status(403).json({
      message: "Please make sure you are logging in from the right portal.",
      success: false
    });
  }

//********  check for the password  *****
  let isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    // 
    
//*****  Sign in the token and issue it to the user  ***
    let token = jwt.sign(
      {
        user_id: user._id,
        role: user.role,
        username: user.username,
        email: user.email
      },
      SECRET,
      { expiresIn: "7 days" }
    );

    let result = {
      username: user.username,
      role: user.role,
      email: user.email,
      token: `Bearer ${token}`,
      expiresIn: 168
    };

    return res.status(200).json({
      ...result,
      message: "Hurray! You are now logged in.",
      success: true
    });
  } else {
    return res.status(403).json({
      message: "Incorrect password.",
      success: false
    });
  }
};

const validateUsername = async username => {
  let user = await User.findOne({ username });
  return user ? false : true;
};


//*************************  Passport middleware for check  ***************************************
 exports.userAuth = passport.authenticate("jwt", { session: false });
 

//*************************  Check Role Middleware  ***************************************

 exports.checkRole = roles => (req, res, next) =>
  !roles.includes(req.user.role)
    ? res.status(401).json("Unauthorized")
    : next();

const validateEmail = async email => {
  let user = await User.findOne({ email });
  return user ? false : true;
};

//*************************************** user profile  ***************************************

exports.serializeUser = user => {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name,
    _id: user._id,
    updatedAt: user.updatedAt,
    createdAt: user.createdAt
  };
};




//************************* Get single user  ***************************************

exports.single_user = (req, res, next) => {
  User.findById({ _id: req.params.userId })
      .exec()
      .then( doc => {
          console.log('single user', doc)
          if (doc) {
              res.status(201).json({
                  message: "successfully get all single user",
                  _id: doc._id,
                  email: doc.email,
                  name: doc.name,
                  username: doc.username,
                  role: doc.role,
                  status: doc.status,
                  vendor: {
                      ShopName: doc.shopname,
                      ShopUrl: "https://mamar-dukan.web.app/seller/" + doc.shopurl,
                      phone: doc.phone
                  }
              });
          } else {
              res.status(400).json({
                  message: 'No valid entry found for provided ID!'
              });
          }
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({
              error: err,
              message: "single user not found"
          });
      });
};




//************************* Get All users ***************************************

exports.all_user = (req, res, next) => {
  User.find()
      .exec()
      .then( result => {
          const allUser = {
              count: result.length,
              user: result.map( doc => {
                  return {
                      _id: doc._id,
                      email: doc.email,
                      name: doc.name,
                      role: doc.role,
                      vendor: {
                          ShopName: doc.shopname,
                          ShopUrl: "https://mamar-dukan.web.app/seller/" + doc.shopurl,
                          Phone: doc.phone
                      }
                  };
              })
          };

          console.log('all user', allUser);
          if (result.length >= 0) {
              res.status(201).json({
                  message: "successfully get all user",
                  allUser
              });
          } else {
              res.status(400).json({
                  message: 'No valid entry found for provided ID!'
              });
          }
          
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({
              error: err
          });
      });
};



//************************* updated user  ***************************************

exports.updated_user = async (req, res, next) => {
  try {
      const products = await User.findById(req.params.userId);
      
      Object.assign(products, req.body);
      products.save();

      res.status(200).json({
          message: 'successfully updated a user info.',
      });

  } catch {
      res.status(404).json({
          message: "user not updated"
      });
  }
}

//************************* User delete  ***************************************

exports.user_deleted = (req, res, next) => {
  User.remove({ _id: req.params.userId })
      .exec()
      .then( result => {
          res.status(200).json({
              message: "User deleted"
          });
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({
              error: err
          });
      });
};



//************************* End! ***************************************