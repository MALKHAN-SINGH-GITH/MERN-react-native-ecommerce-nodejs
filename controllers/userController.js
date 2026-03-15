import UserModel from "../models/UserModel.js";
import { getDataUri } from "../utils/feature.js";
import cloudinary from "cloudinary";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, address, city, country, phone, answer } =
      req.body;
    // validtion

    if (
      !name ||
      !email ||
      !password ||
      !address ||
      !city ||
      !country ||
      !phone ||
      !answer
    ) {
      return res.status(500).send({
        success: false,
        message: "Please provide all field",
      });
    }
    //check existing user
    const existingUser = await UserModel.findOne({ email });
    //validation
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "Email Already registered please log in",
      });
    }
    const user = await UserModel.create({
      name,
      email,
      password,
      address,
      city,
      country,
      phone,
      answer,
    });
    res.status(201).send({
      success: true,
      message: "Registration success, please login",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error. in Register API",
      error,
    });
  }
};

//log in controller function

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please enter email or password",
      });
    }
    //check user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found ",
      });
    }
    //check password correct or not

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "invalid user name or password",
      });
    }
    //TOKEN
    const token = user.generateToken();
    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Login Successfully",
        token,
        user,
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login Api",
    });
  }
};

// get user profile
export const getUserProfileController = async (req, res) => {
  try {
    const user = await UserModel.findOne(req.user._id);
    user.password = undefined; //   isse profie me password nahi  show hoga
    res.status(200).send({
      success: true,
      message: "User Profile Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in profile API",
      error,
    });
  }
};

//logout
export const logoutController = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", "", {
        expires: new Date(Date.now()), //+ 15 * 24 * 60 * 60 * 1000
        secure: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
        httpOnly: process.env.NODE_ENV === "development" ? true : false,
      })
      .send({
        success: true,
        message: "Logout successfully",
      });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in logout  API",
      error,
    });
  }
};

// update profile controller
export const updateProfileController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    if (user) {
      const { name, email, address, city, country, phone } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (address) user.address = address;
      if (city) user.city = city;
      if (country) user.country = country;
      if (phone) user.phone = phone;
    }
    //save user
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile API",
      error,
    });
  }
};

// update password controller
export const updatePasswordController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide old and new password",
      });
    }
    //check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(500).send({
        success: false,
        message: "Old password is incorrect",
      });
    }
    //update new password
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update password API",
      error,
    });
  }
};
// update profile pic controller
export const updateProfilePicController = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user._id);
    //  file get from client photo
    const file = getDataUri(req.file);
    // delete prev image from cloudinary
    await cloudinary.v2.uploader.destroy(user.profilePic.public_id);
    // upload new pic to cloudinary
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    // update user profilepic field
    // update user's profile picture field
    user.profilePic = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    // save user
    await user.save();
    res.status(200).send({
      success: true,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update profile pic API",
      error,
    });
  }
};

// forgot password controller
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email || !answer || !newPassword) {
      return res.status(500).send({
        success: false,
        message: "Please provide email, answer and new password",
      });
    }
    // check user
    const user = await UserModel.findOne({ email, answer });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "invalid email or answer",
      });
    }
    // update new password
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in forgot password API",
      error,
    });
  }
};
