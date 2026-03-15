import express from "express";
import {
  createProductController,
  createProductReviewController,
  deleteProductController,
  deleteProductImageController,
  getAllProductsController,
  getSingleProductController,
  getTopProductsController,
  updateProductController,
  updateProductImageController,
} from "../controllers/productController.js";
import { isAdmin, isAuth } from "../middlarware/authMiddleware.js";
import { singleupload } from "../middlarware/multer.js";

const router = express();
//routes
// get top products
router.get("/get-top", getTopProductsController);
//get  all products
router.get("/get-all", getAllProductsController);
// get singal product
router.get("/:id", getSingleProductController);
// crete product
router.post("/create", isAuth, singleupload, isAdmin, createProductController);
//  update product
router.put("/update/:id", isAuth, isAdmin, updateProductController);
// updat  product image
router.put(
  "/update-image/:id",
  isAuth,
  singleupload,
  updateProductImageController,
);
// delete product image
router.delete(
  "/delete-image/:id",
  isAuth,
  isAdmin,
  deleteProductImageController,
);
// delete product
router.delete("/delete/:id", isAuth, isAdmin, deleteProductController);

// review routes
router.put("/:id/review", isAuth, createProductReviewController);
// get top products

export default router;
