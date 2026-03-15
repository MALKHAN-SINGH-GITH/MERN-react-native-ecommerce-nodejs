import express from "express";
import colors from "colors";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import connectDB from "./config/db.js";
import UserRoute from "./routes/UserRoute.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import productRoutes from "./routes/productRoutes.js";
import categoryRoute from "./routes/categoryRoute.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import Stripe from "stripe";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
// dot env config
dotenv.config();

//database
connectDB();
// stripe config
export const stripe = new Stripe(process.env.STRIPE_API_SECRET);

//cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
//rest object
const app = express();
// mongo sentise error handling
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});
//middlewares
app.use(mongoSanitize()); // sanitize data to prevent NoSQL injection attacks
app.use(helmet()); // security headersnpi
app.use(morgan("dev")); // KONSA URL HIT HUA HAI KYA
app.use(express.json());
app.use(cors());
app.use(cookieParser());

//route
app.use("/api/v1", testRoutes);
app.use("/api/v1/user", UserRoute);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cat", categoryRoute);
app.use("/api/v1/order", ordersRoutes);

app.get("/", (req, res) => {
  return res.status(200).send("<h1>welcome to node server </h1>");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `server is running on PORT ${PORT} on ${process.env.NODE_ENV}`.bgMagenta
      .magenta,
  );
});
