const express = require("express");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const User = require("../database/User");

const router = express.Router();

// CHANGE EMAIL (authenticated)
router.post(
  "/change-email",
  passport.authenticate("jwt", { session: false }),
  [
    body("currentEmail").isString().trim().toLowerCase().isEmail().withMessage("Invalid current email format"),
    body("newEmail").isString().trim().toLowerCase().isEmail().withMessage("Invalid new email format"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const { currentEmail, newEmail } = req.body;
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.email.toLowerCase() !== currentEmail) {
        return res.status(400).json({ success: false, message: "Current email does not match records" });
      }

      if (await User.exists({ email: newEmail })) {
        return res.status(409).json({ success: false, message: "New email is already in use" });
      }

      user.email = newEmail;
      await user.save();

      res.json({ success: true, message: "Email updated successfully!" });
    } catch (error) {
      console.error("Error changing email:", error);
      // Don't send internal error details to the client.
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
);

module.exports = router;
