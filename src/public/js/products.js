// Actualizar lista:
function updateProducts(products) {
	const ul = document.querySelector("ul");
	ul.innerHTML = "";

	products.forEach(product => {
		const li = document.createElement("li");
		li.textContent = product.title;
		li.className = "real-time-item";
		ul.appendChild(li);
	});
};

// Recibir productos:
socket.on("products", (products) => {
	updateProducts(products);
});