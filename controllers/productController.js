// get all products

import productModel from "../models/productModel.js";
import { getDataUri } from "../utils/feature.js";
import cloudinary from "cloudinary";
// get all products

export const getAllProductsController = async (req, res) => {
  // SEARCH FILTER
  const { keyword, Category } = req.query;
  try {
    const products = await productModel
      .find({
        // search keyword
        name: {
          $regex: keyword ? keyword : "",
          $options: "i",
        },
        // filter by category
        // category: category ? category : undefined,
      })
      .populate("category");

    res.status(200).send({
      success: true,
      message: "All products fetched successfully",
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all products",
      error,
    });
  }
};

// get single product controller
export const getSingleProductController = async (req, res) => {
  try {
    // get product id from params

    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // console.log(req),
    res.status(200).send({
      success: true,
      message: "Single product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(404).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in get single product",
      error,
    });
  }
};

// create product controller
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Product image is required",
      });
    }
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      images: [image],
    });
    res.status(201).send({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(404).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in create product",
      error,
    });
  }
};

// update product controller
export const updateProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    const { name, description, price, category, stock } = req.body;
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (category) product.category = category;
    if (stock) product.stock = stock;
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    //cast error for invalid id
    if (error.name === "CastError") {
      return res.status(404).send({
        success: false,
        message: "Invalid product ID",
      });
    }
    res.status(500).send({
      success: false,
      message: "Error in update product Api",
      error,
    });
  }
};
// update product image controller
export const updateProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    if (!req.file) {
      return res.status(400).send({
        success: false,
        message: "Product image  not found",
      });
    }
    // agar file milti hai to getdatauri ki madad se file le le lenge
    const file = getDataUri(req.file);
    const cdb = await cloudinary.v2.uploader.upload(file.content);
    const image = {
      public_id: cdb.public_id,
      url: cdb.secure_url,
    };
    product.images.push(image);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product image updated successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update product image Api",
      error,
    });
  }
};
// delete product controller
export const deleteProductImageController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // image id  find
    const id = req.query.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: "Image id is required",
      });
    }
    let isExist = -1;
    product.images.forEach((item, index) => {
      if (item._id.toString() === id.toString()) isExist = index;
    });
    if (isExist < 0) {
      return res.status(404).send({
        success: false,
        message: "Image not found in product",
      });
    }
    // cloudinary se image delete
    await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);
    // product se image delete
    product.images.splice(isExist, 1);
    await product.save();
    res.status(200).send({
      success: true,
      message: "Product image deleted successfully",
      product,
    });
  } catch (error) {
    if (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in delete product Api",
        error,
      });
    }
  }
};

// delete product controller

export const deleteProductController = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }
    // cloudinary se sab image delete kar denge
    for (let index = 0; index < product.images.length; index++) {
      await cloudinary.v2.uploader.destroy(product.images[index].public_id);
    }

    await productModel.findByIdAndDelete(req.params.id);
    // await product.deleteOne(); dono me se koi bhi chal jaega

    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete product Api",
      error,
    });
  }
};

// create product review controller
// create product review controller
export const createProductReviewController = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating and comment
    if (!rating || !comment) {
      return res.status(400).send({
        success: false,
        message: "Rating and comment are required",
      });
    }

    // Find product by id
    const product = await productModel.findById(req.params.id);

    // Check if product exists
    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      return res.status(400).send({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create review object
    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    // Add review to product
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;

    // Calculate average rating
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).send({
      success: true,
      message: "Product review created successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create product review Api",
      error,
    });
  }
};

// get top products controller
export const getTopProductsController = async (req, res) => {
  try {
    const products = await productModel.find({}).sort({ rating: -1 }).limit(3);
    res.status(200).send({
      success: true,
      message: "Top  products fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(404).send({
        success: false,
        message: "Invalid top product ID",
      });
      res.status(500).send({
        success: false,
        message: "Error in get top products Api",
        error,
      });
    }
  }
};
