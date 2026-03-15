import express from "express";

import { isAdmin, isAuth } from "../middlarware/authMiddleware.js";
import {
  acceptPaymentController,
  changeOrderStatusController,
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  getSingleOrderController,
} from "../controllers/ordersController.js";

const router = express();
// creat order
router.post("/create", isAuth, createOrderController);
// GET all orders
router.get("/my-orders", isAuth, getMyOrdersController);
// get singale order
router.get("/get-order/:id", isAuth, getSingleOrderController);

// accept payment
router.post("/accept-payment", isAuth, acceptPaymentController);

// ========================= admin routes =========================
// get all orders
router.get("/admin/all-orders", isAuth, isAdmin, getAllOrdersController);
// change order status
router.put(
  "/admin/change-order-status/:id",
  isAuth,
  isAdmin,
  changeOrderStatusController,
);

export default router;
