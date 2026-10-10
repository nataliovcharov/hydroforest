const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../database/User");

const router = express.Router();

// CHANGE PASSWORD (authenticated)
router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  [
    body("currentPassword").isString().notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isString()
      .isLength({ min: 6, max: 128 })
      .withMessage("Password must be 6 to 128 characters")
      .matches(/\d/)
      .withMessage("Password must contain at least one number"),
    body("reEnterNewPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error("Passwords do not match");
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id).select("+password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (!(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(401).json({ success: false, message: "Incorrect current password" });
      }

      if (await bcrypt.compare(newPassword, user.password)) {
        return res
          .status(400)
          .json({ success: false, message: "New password must be different from the current password" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.json({ success: true, message: "Password changed successfully!" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
