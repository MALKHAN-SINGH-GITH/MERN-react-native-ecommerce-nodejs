// creat order controller

import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import { stripe } from "../server.js";

export const createOrderController = async (req, res) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      tax,
      shippingCharges,
      totalAmount,
    } = req.body;
    if (
      !shippingInfo ||
      !orderItems ||
      !itemsPrice ||
      !tax ||
      !shippingCharges ||
      !totalAmount
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }
    await orderModel.create({
      user: req.user._id,
      shippingInfo,
      orderItems,
      paymentMethod,
      paymentInfo,
      itemsPrice,
      tax,
      shippingCharges,
      totalAmount,
    });
    // stock update
    for (let i = 0; i < orderItems.length; i++) {
      // find product
      const product = await productModel.findById(orderItems[i].product);
      product.stock -= orderItems[i].quantity;
      await product.save();
    }
    return res.status(201).send({
      success: true,
      message: "Order placed successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while creating order api",
      error,
    });
  }
};

// get all my orders
export const getMyOrdersController = async (req, res) => {
  try {
    // find orders of logged in user
    const orders = await orderModel
      .find({ user: req.user._id })
      .populate("user", "name email");
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No orders found ",
      });
    }
    return res.status(200).send({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while getting orders",
      error,
    });
  }
};

// get singale order
export const getSingleOrderController = async (req, res) => {
  try {
    // find order
    const order = await orderModel
      .findById(req.params.id)
      .populate("user", "name email");
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No order found ",
      });
    }
    res.status(200).send({
      success: true,
      message: "Order found successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while getting orders api",
      error,
    });
  }
};

// accept payment controller
export const acceptPaymentController = async (req, res) => {
  try {
    // get amount
    const { totalAmount } = req.body;
    // validation
    if (!totalAmount) {
      return res.status(400).send({
        success: false,
        message: "Total amount is required",
      });
    }
    const { client_secret } = await stripe.paymentIntents.create({
      amount: Number(totalAmount),
      currency: "usd",
    });

    res.status(200).send({
      success: true,
      message: "Payment accepted successfully",
      client_secret,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error while accepting payment",
      error,
    });
  }
};

// ========================= admin controllers =========================
// get all orders
export const getAllOrdersController = async (req, res) => {
  try {
    // find all orders
    const orders = await orderModel.find({}).populate("user", "name email");
    if (!orders) {
      return res.status(404).send({
        success: false,
        message: "No orders found ",
      });
    }
    return res.status(200).send({
      success: true,
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in getting all orders admin api",
      error,
    });
  }
};
// change order status
export const changeOrderStatusController = async (req, res) => {
  try {
    // find order
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).send({
        success: false,
        message: "No order found ",
      });
    }
    if (order.orderStatus === "Processing") {
      order.orderStatus = "Shipped";
    } else if (order.orderStatus === "Shipped") {
      order.orderStatus = "Delivered";
      order.deliveredAt = new Date();
    }

    await order.save();
    res.status(200).send({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    //casting error
    if (error.name === "CastError") {
      return res.status(400).send({
        success: false,
        message: "Invalid order id",
      });
    }
    return res.status(500).send({
      success: false,
      message: "Error in changing order status admin api",
      error,
    });
  }
};
