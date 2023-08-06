// Express
import { Router } from "express";
const views = Router();

// Mongoose
import { productModel } from "../dao/mongo/models/product.model.js";
import { cartModel } from "../dao/mongo/models/cart.model.js";

// JWT
import { authToken } from "../utils/jwt.utils.js";

// Cookie parser
import cookieParser from "cookie-parser";
views.use(cookieParser("<COOKIESECRET>"));

// Función para validar y crear un carrito para el usuario:
async function cartCookie(req, res) {
	let { cart } = req.signedCookies;
	if (!cart) {
		const createCart = await cartModel.create({products: []});
		const cartId = createCart.id
		res.cookie("cart", cartId, {signed: true,});
		cart = cartId;
	};
	return cart;
}

// Endpoint para renderizar el login:
views.get("/login", async (req, res) => {
	try {
		if(req.session.user){
			return res.status(200).render("home", {
				user: req.session.user,
				style: "styles.css",
				documentTitle: "Home",
			});
		};

		return res.status(200).render("login", {
			style: "styles.css",
			documentTitle: "Login",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar el registro:
views.get("/register", async (req, res) => {
	try {
		if(req.session.user){
			return res.status(200).render("home", {
				user: req.session.user,
				style: "styles.css",
				documentTitle: "Home",
			});
		};

		return res.status(200).render("register", {
			style: "styles.css",
			documentTitle: "Register",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar el home:
views.get("/", async (req, res) => {
	try {
		if(!req.session.user){
			return res.status(200).render("login", {
				style: "styles.css",
				documentTitle: "Login",
			});
		};

		return res.status(200).render("home", {
			user: req.session.user,
			style: "styles.css",
			documentTitle: "Home",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar los productos, con opción de query params:
views.get("/products", async (req, res) => {
	try {
		if(!req.session.user){
			return res.status(200).render("login", {
				style: "styles.css",
				documentTitle: "Login",
			});
		};

		const cart = await cartCookie(req, res);
		let { limit, page, query, sort } = req.query;

		// Validación de Page:
		if (page == undefined || page == "" || page < 1 || isNaN(page)) {
			page = 1;
		};

		// Validación de Limit:
		if (limit == undefined || limit == "" || limit <= 1 || isNaN(limit)) {
			limit = 10;
		};

		// Validación de Sort:
		if (sort == undefined || (sort !== 'asc' && sort !== 'desc') || !isNaN(sort)) {
			sort = "asc";
		};

		const filter = {category: query};
		const options = {
			page,
			limit,
			customLabels: {
				totalPages: 'totalPages',
				hasPrevPage: 'hasPrevPage',
				hasNextPage: 'hasNextPage',
				prevPage: 'prevPage',
				nextPage: 'nextPage',
				docs: 'data',
			},
			lean: true
		};

		const products = await productModel.paginate({}, options);
		const filteredProducts = await productModel.paginate(filter, options);

		// Ordenar data según sort:
		if (sort === "asc") {
			// Ascendente
			filteredProducts.data.sort((a, b) => a.price - b.price);
			products.data.sort((a, b) => a.price - b.price);
		} else {
			// Descendente
			filteredProducts.data.sort((a, b) => b.price - a.price);
			products.data.sort((a, b) => b.price - a.price);
		}

		// Validar si las búsquedas son válidas:
		if (products.data.length <= 0) {
			return res.status(200).send(`There's no products for this search`);
		};
		
		if (filteredProducts.data.length > 0) {
			return res.status(200).render("products", {
				status: "success",
				payload: filteredProducts.data,
				user: req.session.user,
				page,
				limit,
				query,
				sort,
				cart,
				totalPages: filteredProducts.totalPages,
				hasPrevPage: filteredProducts.hasPrevPage,
				hasNextPage: filteredProducts.hasNextPage,
				prevPage: filteredProducts.prevPage,
				nextPage: filteredProducts.nextPage,
				documentTitle: "Products",
				style: "styles.css",
			});
		}

		return res.status(200).render("products", {
			status: "success",
			payload: products.data,
			user: req.session.user,
			page,
			limit,
			query,
			sort,
			cart,
			totalPages: products.totalPages,
			hasPrevPage: products.hasPrevPage,
			hasNextPage: products.hasNextPage,
			prevPage: products.prevPage,
			nextPage: products.nextPage,
			documentTitle: "Products",
			style: "styles.css",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar un producto especifico según ID:
views.get("/products/:pid", async (req, res) => {
	try {
		if(!req.session.user){
			return res.status(200).render("login", {
				style: "styles.css",
				documentTitle: "Login",
			});
		};

		const cart = await cartCookie(req, res);
		const { pid } = req.params;
		const product = await productModel.findById(pid).lean();

		return res.status(200).render("product", {
			product,
			cart,
			style: "styles.css",
			documentTitle: "Product",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar productos con socket:
views.get("/realtimeproducts", (req, res) => {
	try {
		if(!req.session.user){
			return res.status(200).render("login", {
				style: "styles.css",
				documentTitle: "Login",
			});
		};
		
		return res.status(200).render("realTimeProducts", {
			style: "styles.css",
			documentTitle: "Socket",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar chat con socket:
views.get("/chat", (req, res) => {
	try {
		return res.status(200).render("chat", {
			style: "styles.css",
			documentTitle: "Chat",
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Endpoint para renderizar un carrito según ID:
views.get("/carts/:cid", async (req, res) => {
	try {
		if(!req.session.user){
			return res.status(200).render("login", {
				style: "styles.css",
				documentTitle: "Login",
			});
		};
		
		const { cid } = req.params;
		const cart = await cartModel.findById(cid).populate('products._id').lean();

		if(!cart) {
			return res.status(200).send(`Invalid cart ID ${cid}`);
		};

		return res.status(200).render("carts", {
			style: "styles.css",
			documentTitle: "Carts",
			payload: cart.products,
		});
	} catch (err) {
		return res.status(500).json({ error: err.message });
	};
});

// Test token
views.get("/private", authToken, (req, res) => {
	res.send({status: "Private", user: req.user})
});

export default views;