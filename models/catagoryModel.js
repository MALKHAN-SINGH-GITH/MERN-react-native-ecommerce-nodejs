import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, "category name is required"],
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model("Category", CategorySchema);
export default categoryModel;
