import express from "express";
import cors from "cors";
import { Product } from "./model/product";

const app = express();

app.use(express.json());
app.use(cors());

let products = [];

app.get("/products", (request, response) => response.json(products));

app.post("/products", (request, response) => {
	const {
		code, description, buyPrice, sellPrice, tags, id
	} = request.body;

	const verifyProduct = products.find((value) => value.code == code);
	const checkIfThereLove = verifyProduct ? verifyProduct.lovers : 0;

	const product = new Product(code,
		description,
		buyPrice,
		sellPrice,
		tags,
		checkIfThereLove,
		id
	);

	products.push(product);

	response.status(201).json(product);
});

app.put("/products/:id", (request, response) => {
	const { id } = request.params;
	const {
		code, description, buyPrice, sellPrice, tags,
	} = request.body;

	const verifyProductExists = products.find((product) => product.id === id);

	if (verifyProductExists) {
		verifyProductExists.code = code;
		verifyProductExists.description = description;
		verifyProductExists.buyPrice = buyPrice;
		verifyProductExists.sellPrice = sellPrice;
		verifyProductExists.tags = tags;

		response.json(verifyProductExists);
	} else {
		response.status(400).send();
	}
});

app.delete("/products/:code", (request, response) => {
	const { code } = request.params;

	const productsForDeleteIndex = products.findIndex((item) => item.code === Number(code));

	if (productsForDeleteIndex === -1) {
		return response.status(400).send();
	}
	products = products.filter((item) => item.code !== Number(code));

	return response.status(204).send();
});

app.post("/products/:code/love", (request, response) => {
	const { code } = request.params;

	const product = products.find((item) => item.code === Number(code));

	if (!product) {
		return response.status(400).send();
	}
	products.filter((item) => item.code === Number(code)).map((value) => {
		// eslint-disable-next-line no-param-reassign
		value.lovers += 1;
		return value.lovers;
	});

	return response.json({ lovers: product.lovers });
});

app.get("/products/:code", (request, response) => {
	const { code } = request.params;

	const product = products.find((item) => item.code === Number(code));

	if (!product) {
		return response.status(204).send();
	}
	const productData = products.filter((item) => item.code === Number(code));

	return response.json(productData);
});

export { app };
