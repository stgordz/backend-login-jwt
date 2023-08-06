import { Router } from "express";
import { cartModel } from "../dao/mongo/models/cart.model.js";
import { productModel } from "../dao/mongo/models/product.model.js";

const carts = Router();

// Endpoint para obtener todos los carritos:
carts.get("/", async (req, res) => {
	try {
		let result = await cartModel.find();
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para obtener un carrito según ID:
carts.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		let result = await cartModel.findById(id).populate('products._id');

		if (!result) {
			return res.status(200).send(`There's no cart with ID ${id}`);
		};

		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para agregar un carrito:
carts.post("/", async (req, res) => {
	try {
		const result = await cartModel.create({
			products: [],
		});

		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para agregar un producto a un carrito segun IDs:
carts.get("/:cid/product/:pid", async (req, res) => {
	try {
		const { cid, pid } = req.params;
		const newProduct = await productModel.findById(pid);
		const cart = await cartModel.findById(cid);

		// Validar si el producto existe en el carrito:
		const productInCart = cart.products.find(product => product._id.toString() === newProduct.id);

		// Si no existe, crearlo:
		if (!productInCart) {
			const create = {
				$push: { products: { _id: newProduct.id, quantity: 1 } },
			};
			await cartModel.findByIdAndUpdate({ _id: cid }, create);

			const result = await cartModel.findById(cid);
			return res.status(200).json({ status: "success", payload: result });
		};

		// Si existe, aumentar la cantidad en una unidad:
		await cartModel.findByIdAndUpdate(
			{ _id: cid },
			{ $inc: { "products.$[elem].quantity": 1 } },
			{ arrayFilters: [{ "elem._id": newProduct.id }] }
		);

		const result = await cartModel.findById(cid);
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para actualizar un carrito según ID con un arreglo de productos:
carts.put("/:cid", async (req, res) => {
	try {
		const { cid } = req.params;
		let newCart = req.body;
		const cart = await cartModel.findById(cid);

		// Iterar por cada producto
		newCart.forEach( async product => {
			// Validar si la cantidad es correcta, sino corregirla a 1:
			if (product.quantity < 1) {
				console.log(`Invalid value ${product.quantity} for quantity, new value was setted on 1`);
				product.quantity = 1
			};

			// Validar si el producto existe y el stock es suficiente:
			const existProduct = await productModel.findById(product._id);
			if(existProduct && existProduct.stock > product.quantity) {
				// Validar si el producto existe en el carrito:
				const productInCart = cart.products.find(productInCart => productInCart.id === existProduct.id);

				// Si no existe, crearlo:
				if (!productInCart) {
					const create = {
						$push: { products: { _id: existProduct.id, quantity: product.quantity } },
					};
					await cartModel.findByIdAndUpdate({ _id: cid }, create);
				};

				// Si existe, actualizar la cantidad:
				await cartModel.findByIdAndUpdate(
					{ _id: cid },
					{ $set: { "products.$[elem].quantity": product.quantity } },
					{ arrayFilters: [{ "elem._id": existProduct.id }] }
				);
			};
		});

		const result = await cartModel.findById(cid);
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para actualizar la cantidad de un producto dentro de un carrito según IDs:
carts.put("/:cid/product/:pid", async (req, res) => {
	try {
		const { cid, pid } = req.params;
		let newQuantity = req.body.quantity;
		const product = await productModel.findById(pid);

		// Validar stock disponible y setear nueva cantidad en max:
		if(newQuantity > product.stock) {
			console.log(`Insufficient stock ${newQuantity} for product ${product._id}, max ${product.stock}`);
			newQuantity = product.stock;
		}
		// Validar si el producto existe en el carrito y actualizar la cantidad:
		await cartModel.findByIdAndUpdate(
			{ _id: cid },
			{ $set: { "products.$[elem].quantity": newQuantity } },
			{ arrayFilters: [{ "elem._id": pid }] }
		);

		const result = await cartModel.findById(cid);
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para borrar todos los productos de un carrito según ID:
carts.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await cartModel.findByIdAndUpdate(id, {products: []});

		const result = await cartModel.find();
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para borrar un productos de un carrito según IDs:
carts.delete("/:cid/products/:pid", async (req, res) => {
	try {
		const { cid, pid } = req.params;
		await cartModel.findByIdAndUpdate(cid, {
			$pull: { products: { _id: pid } }
		})

		const result = await cartModel.find();
		return res.status(200).json({ status: "success", payload: result });
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

export default carts;
