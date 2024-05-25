const User = require("../models/users.model");
const bcrypt = require("bcryptjs"); //encrypts passwords
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

// Handle Errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "Incorrect username") {
    errors.username = "That username is not registered";
  }

  // incorrect password
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate email error code
  if (err.code === 11000) {
    errors.username = "That username is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// Create JSON web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: maxAge,
  });
};

exports.checkToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(403).json({ message: "Login first" });
  }

  jwt.verify(token, jwtSecret, (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decodedToken; // Attach decoded token to request object
    next();
  });
};

// POST a new User and return it
exports.register = async (req, res, next) => {
  const { username, password, firstName, lastName, email, phoneNumber } = req.body;
  if (password.length < 6) {
    return res.status(400).json({ message: "Password less than 6 characters" });
  }
  try {
    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      } else {
        await User.create({
          username,
          password: hash,
          firstName,
          lastName,
          email,
          phoneNumber,
        })
          .then((user) => {
            const token = createToken(user._id);
            res.cookie("jwt", token, {
              httpOnly: true,
              //secure: process.env.NODE_ENV === "production",
              maxAge: maxAge * 1000, // 3hrs in ms
            });

            res.status(201).json({
              message: "User successfully created",
              user: user._id,
            });
          })
          .catch((error) => {
            const errors = handleErrors(error);
            res.status(400).json({ errors: errors, message: "Error occurred" });
          });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occured",
      error: error.message,
    });
  }
};

/* // POST a login
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Both username & password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User or password combination not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      console.log(`Login successful: ${username}`);
      console.log(`User details: ${JSON.stringify(user)}`);

      // Check if user.role exists before signing the token
      if (!user.role) {
        console.error("Role is undefined for user:", user);
        return res.status(500).json({ message: "User role is undefined" });
      }

      // Create token
      const token = jwt.sign(
        {
          id: user._id,
          username: user.username,
          role: user.role,
        },
        jwtSecret,
        {
          expiresIn: "1h",
        }
      );

      console.log(`Token created: ${token}`);

      return res.status(200).json({
        message: "Auth successful",
        token: token,
        user: user,
        role: user.role,
      });
    } else {
      return res.status(401).json({ message: "User or password combination not found" });
    }
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message,
    });
  }
}; */

// POST a login (works but throws error)
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Both username & password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User or password combination not found" });
    }
    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        console.log(`Login successful: ${username}
        result: ${result}
        role: ${user.role}`);

        // Create token
        const token = jwt.sign(
          {
            userId: user._id,
            username: user.username,
            role: user.role,
          },
          jwtSecret,
          {
            expiresIn: "1h",
            //httpOnly: true,
          }
        );

        res.cookie("bearer", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: maxAge * 1000, // 3hrs in ms
          sameSite: "strict",
        });

        return res.status(200).json({
          message: "Auth successful",
          token: token,
          stashUser: user.username,
          stashRole: user.role,
          cookie: res.cookie,
        });
      } else {
        return res.status(401).json({ message: "User or password combination not found" });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occurred",
      error: error.message,
    });
  }
};

/* 
// POST a login (old)
exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Both username & password are required" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User or password combination not found" });
    }
    bcrypt.compare(password, user.password).then((result) => {
      if (result) {
        const maxAge = 3 * 60 * 60; // 3 hours in seconds
        const token = jwt.sign({ id: user._id, username, role: user.role }, jwtSecret, {
          expiresIn: maxAge,
        });
        //console.log("Setting cookie");
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: maxAge * 1000, // Convert to milliseconds
          //secure: process.env.NODE_ENV === "production", // Secure cookie in production
          //sameSite: "None", // Ensure cross-origin cookies are allowed
        });
        //console.log("Cookie set");
        res.status(200).json({
          message: "User successfully logged in",
          token: token,
          user: user._id,
        });
      } else {
        res.status(400).json({ message: "User or password combination not found" });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Error occurred",
      error: error.message,
    });
  }
};
 */

// PATCH an update to user Role
exports.update = async (req, res, next) => {
  const { role, id } = req.body;
  // Verifying if role and id is presnt
  if (role && id) {
    // Verifying if the value of role is admin
    if (role === "admin") {
      await User.findById(id)
        .then((user) => {
          // Third - Verifies the user is not an admin
          if (user.role !== "admin") {
            user.role = role;
            return user.save(); // Save the updated user object to the database
          } else {
            res.status(400).json({ message: "User is already an Admin" });
          }
        })
        .catch((error) => {
          res.status(400).json({ message: "An error occurred", error: error.message });
        });
    } else {
      res.status(400).json({
        message: "Role is not admin",
      });
    }
  } else {
    res.status(400).json({ message: "Role or Id not present" });
  }
};

exports.deleteUser = async (req, res, next) => {
  const { id } = req.body;
  await User.findById(id)
    .then((user) => user.remove())
    .then((user) => res.status(201).json({ message: "User successfully deleted", user }))
    .catch((error) => res.status(400).json({ message: "An error occurred", error: error.message }));
};

// GET all users
exports.getUsers = async (req, res, next) => {
  await User.find({})
    .then((users) => {
      const userFunction = users.map((user) => {
        const container = {};
        container.username = user.username;
        container.role = user.role;
        return container;
      });
      res.status(200).json({ user: userFunction });
    })
    .catch((err) => res.status(401).json({ message: "Not successful", error: err.message }));
};

module.exports.adminAuth = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(401).json({ message: "Not authorized" });
  }
};

module.exports.userAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ message: "Not authorized" });
      } else {
        if (decodedToken.role !== "Basic") {
          return res.status(401).json({ message: "Not authorized" });
        } else {
          next();
        }
      }
    });
  } else {
    return res.status(401).json({ message: "Not authorized, token not available" });
  }
};

// Function to Delete User
/* exports.deleteUser = async (req, res, next) => {
  const userId = req.body.userId; //
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optionally verify the role from the token instead of middleware
    const token = req.cookies.jwt; // Get JWT token from cookies
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User successfully deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
}; */
