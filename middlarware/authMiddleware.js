import JWT from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

// user auth middleware
export const isAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return res.status(401).send({
      success: false,
      message: "UnAuthorised User",
    });
  }
  const decodeData = JWT.verify(token, process.env.JWT_SECRET);
  req.user = await UserModel.findById(decodeData._id);
  next();
};
// admin auth middleware
export const isAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};
