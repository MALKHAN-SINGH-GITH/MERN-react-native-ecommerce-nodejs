import express from "express";

import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";
import { isAdmin, isAuth } from "../middlarware/authMiddleware.js";

const router = express();
// routes
router.post("/create", isAuth, isAdmin, createCategoryController);
// get all categories
router.get("/get-all", getAllCategoryController);
// delete category
router.delete("/delete/:id", isAuth, isAdmin, deleteCategoryController);
// update category
router.put("/update/:id", isAuth, isAdmin, updateCategoryController);

export default router;
