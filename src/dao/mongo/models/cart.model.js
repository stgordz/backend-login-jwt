import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  products: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
      },
      quantity: Number, 
    }
  ]
});

export const cartModel = mongoose.model("Carts", cartSchema);