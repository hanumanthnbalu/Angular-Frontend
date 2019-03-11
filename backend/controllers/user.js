const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.createUser =  (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      email: req.body.email,
      password: hash
    });
    user
      .save()
      .then(result => {
        res.status(200).json({
          message: "user created successfully",
          result: result
        });
      })
      .catch(err => {
        res.status(500).json({
            message: "Invalid authentication credentials!!"
        });
      });
  });
}

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then(user => {
      console.log("User:" + user);
      if (!user) {
        return res.status(401).json({
          message: "Auth failed!!"
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then(result => {
      console.log("result:" + result);
      if (!result) {
        return res.status(401).json({
          message: "Invalid credentials!!"
        });
      }
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        "secret_this_should_be_longer",
        { expiresIn: "1h" }
      );
      console.log("token:" + token);
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
        });
    })
    .catch(err => {
      console.log("error:" + err);
      res.status(401).json({
        message: "Invalid credentials!!"
      });
    });
}
