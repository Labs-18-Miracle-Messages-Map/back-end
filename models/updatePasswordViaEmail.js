import bcrypt from "bcrypt";
import Sequelize from "sequelize";
import User from "../sequelize";

const Op = Sequelize.Op;

const BCRYPT_SALT_ROUNDS = 12;
module.exports = app => {
  app.put("/updatePasswordViaEmail", (req, res) => {
    User.findOne({
      where: {
        email: req.body.email,
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordExpires: {
          [Op.gt]: Date.now()
        }
      }
    }).then(user => {
      if (user == null) {
        console.error("password reset link is invalid or has expired");
        res.status(403).send("password reset link is invalid or has expired");
      } else if (user != null) {
        console.log("user exists in db");
        bcrypt
          .hash(req.body.password, BCRYPT_SALT_ROUNDS)
          .then(hashedPassword => {
            user.update({
              password: hashedPassword,
              resetPasswordToken: null,
              resetPasswordExpires: null
            });
          })
          .then(() => {
            console.log("password updated");
            res.status(200).send({ message: "password updated" });
          });
      } else {
        console.error("no user exists in db to update");
        res.status(401).json("no user exists in db to update");
      }
    });
  });
};
