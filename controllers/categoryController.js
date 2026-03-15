import categoryModel from "../models/catagoryModel.js";
import productModel from "../models/productModel.js";

//create category controller
export const createCategoryController = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).send({
        success: false,
        message: "Category is required",
      });
    }
    await categoryModel.create({ category });
    res.status(201).send({
      success: true,
      message: `Category ${category} created successfully`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create category API",
      error,
    });
  }
};
// get all categories controller
export const getAllCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});
    res.status(200).send({
      success: true,
      message: "All categories fetched successfully",
      totalCategories: categories.length,
      categories,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all categories API",
      error,
    });
  }
};
// delete category controller
export const deleteCategoryController = async (req, res) => {
  try {
    // find category by id
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // find product with this category id
    const products = await productModel.find({ category: category._id });
    // update product category

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = undefined;
      await product.save();
    }
    // delete category
    await category.deleteOne();
    res.status(200).send({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.log(error);
    // casting error handling
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid category ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in delete category API",
      error,
    });
  }
};
// update category controller
export const updateCategoryController = async (req, res) => {
  try {
    // find category by id
    const category = await categoryModel.findById(req.params.id);
    if (!category) {
      return res.status(404).send({
        success: false,
        message: "Category not found",
      });
    }
    // get new category name
    const { updatedcatname } = req.body;
    // find product with this category id
    const products = await productModel.find({ category: category._id });
    // update product category

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      product.category = updatedcatname;
      await product.save();
    }
    if (updatedcatname) category.category = updatedcatname;
    // save
    await category.save();
    res.status(200).send({
      success: true,
      message: "Category name updated successfully",
    });
  } catch (error) {
    console.log(error);
    // casting error handling
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid category ID",
        error,
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update category API",
      error,
    });
  }
};
