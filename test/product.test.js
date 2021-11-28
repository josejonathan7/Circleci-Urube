// A quantidade vendida pode ser de uma ou mais unidades

import { test, expect, beforeEach, describe } from "@jest/globals";
import request from "supertest";
import { app } from "../src/app";
import { Product } from "../src/model/product";
import { Validator } from "../src/utils/validator";

describe("#Teste de produtos", () => {
	let products;
	beforeEach(() => {
		products = [new Product(
			12,
			"Macbook pro retina 2021",
			4000,
			8000,
			["Tecnologia", "Apple", "Desktop"],
		),
		new Product(
			99,
			"Positivo pro retina 2021",
			1000,
			2000,
			["Tecnologia", "Positivo", "Desktop"],
		)];
	});

	describe("#Teste de criação de produto", () => {
		test("-> deve ser possivel adicionar um novo produto", async () => {
			const response = await request(app).post("/products").send(products[0]);

			expect(response.body).toMatchObject({
				...products[0],
				lovers: 0,
			});
		});

		test("-> O status code de um produto criado deve ser 201", async () => {
			const response = await request(app).post("/products").send(products[0]);

			expect(response.status).toBe(201);
		});
	});

	describe("#Tesde de atualização de produto", () => {
		test("-> Deve ser possivel autalizar dados de um produto", async () => {
			const response = await request(app).post("/products").send(products[0]);

			const updateProduct = {
				...response.body,
				description: "Dell Vostro",
			};

			const responseUpdated = await request(app).put(`/products/${response.body.id}`).send(updateProduct);

			expect(responseUpdated.body).toMatchObject(updateProduct);
		});

		test("-> Não deve ser possivel atualizar um produto inexistente", async () => {
			const response = await request(app).post("/products").send(products[1]);

			const updateProduct = {
				...response.body,
				description: "Dell Vostro",
			};

			const responseUpdated = await request(app).put("/products/151321512").send(updateProduct);

			expect(responseUpdated.status).toBe(400);
		});
	});

	describe("#Remoção de conteúdo", () => {
		test("-> Não deve ser possivel remover um produto inexistente", async () => {
			await request(app).delete("/products/654d6asd45").expect(400);
		});

		test("-> Deve retornar o código 204 quando um produto for removido", async () => {
			const response = await request(app).post("/products").send(products[1]);

			await request(app).delete(`/products/${response.body.code}`).expect(204);
		});

		test("-> Deve ser possivel remover os produtos pelo código", async () => {
			const response = await request(app).post("/products").send(products[0]);
			await request(app).post("/products").send(products[0]);
			await request(app).post("/products").send(products[0]);
			await request(app).post("/products").send(products[1]);
			await request(app).delete(`/products/${response.body.code}`);

			const responseGet = await request(app).get("/products");

			expect(responseGet.body).toHaveLength(1);
		});
	});

	describe("#Listagem de conteúdo", () => {
		beforeEach(() => {
			async function clearData() {
				await request(app).delete(`/products/${products[1].code}`);
			}

			clearData();
		});

		test("-> Deve ser possível listar todos os produtos", async () => {
			await request(app).post("/products").send(products[0]);
			await request(app).post("/products").send(products[0]);
			await request(app).post("/products").send(products[1]);
			const responseGet = await request(app).get("/products");
			expect(responseGet.body).toHaveLength(3);
		});
	});

	describe("#Buscar conteúdo", () => {
		beforeEach(() => {
			async function clearData() {
				await request(app).delete(`/products/${products[0].code}`);
			}

			clearData();
		});

		test("-> Deve ser possivel buscar produtos por código no array", async () => {
			await request(app).post("/products").send(products[1]);
			await request(app).post("/products").send(products[0]);
			const response = await request(app).post("/products").send(products[0]);

			const searchProduct = [{
				...response.body,
			}];

			const search = await request(app).get(`/products/${response.body.code}`);

			expect(search.body).toEqual(expect.arrayContaining(searchProduct));
		});

		test("-> Deve retornar um status code 204 se não encontrar o produto", async () => {
			await request(app).post("/products").send(products[1]);

			await request(app).get(`/products/${products[0].code}`).expect(204);
		});
	});

	describe("#Lovers", () => {
		test("-> Deve ser possivel dar love em um produto", async () => {
			const response = await request(app).post("/products").send(products[0]);

			const responseLove = await request(app).post(`/products/${response.body.code}/love`).send(response.body);

			expect(responseLove.body).toMatchObject({ lovers: 1 });
		});

		test("-> Não deve ser possível atualizar o número de lovers de um produto manualmente", async () => {
			const response = await request(app).post("/products").send(products[0]);

			const updateForcedProduct = {
				...response.body,
				lovers: 10,
			};

			const responseLove = await request(app).put(`/products/${response.body.id}`).send(updateForcedProduct);

			expect(responseLove.body).not.toBe(updateForcedProduct);
		});

		test("-> Deve possuir o número de lovers igual a 0 um produto recém criado o qual o seu código seja inexistente", async () => {
			const response = await request(app).post("/products").send(products[1]);

			const objectExpect = {
				...response.body,
				lovers: 0,
			};

			expect(response.body).toEqual(objectExpect);
		});

		test("-> Um produto deverá herdar o número de lovers caso seu código já exista", async () => {
			const testLove = await request(app).post("/products").send(products[1]);
			await request(app).post(`/products/${testLove.body.code}/love`).send(testLove.body);

			const response = await request(app).post("/products").send(products[1]);

			const objectExpect = {
				...response.body,
				lovers: 1,
			};

			expect(response.body).toEqual(objectExpect);
		});

		test("->  Produtos de mesmo código devem compartilhar a mesma quantidade de lovers", async () => {
			const testLove = await request(app).post("/products").send(products[1]);
			const response = await request(app).post("/products").send(products[1]);

			const expectObject = testLove.body.lovers;

			expect(response.body.lovers).toEqual(expectObject);
		});
	});
});

describe("#Validação de Produtos", () => {
	// eslint-disable-next-line no-unused-vars
	let products;
	const errorMessage = new Error("Descrição deve estar entre 3 e 50 caracteres");
	const errorMessageBuyPrice = new Error("Valor de venda não pode ser maior que o valor de compra");

	beforeEach(() => {
		products = [new Product(
			12,
			"Macbook pro retina 2021",
			4000,
			8000,
			["Tecnologia", "Apple", "Desktop"],
		),
		new Product(
			99,
			"Positivo pro retina 2021",
			1000,
			2000,
			["Tecnologia", "Positivo", "Desktop"],
		)];
	});

	test("-> Não deve ser aceita a descrição com 2 caracteres", () => {

		expect(() =>
			Validator.validProduct(new Product(
				144,
				"Ma",
				9000,
				8000,
				["Tecnologia", "Apple", "Desktop"],
			))
		).toThrow(errorMessage);
	});

	test("-> Deve aceitar descrição com 3 caracteres", () => {

		const product = Validator.validProduct(new Product(
			144,
			"abc",
			9000,
			8000,
			["Tecnologia", "Apple", "Desktop"],
		));

		expect(product.description).toBe("abc");
	});

	test("-> Não deve ser aceita a descrição com 51 caracteres", () => {

		expect(() =>
			Validator.validProduct(new Product(
				144,
				"Masssssssssssssssssssssssssssssssssssssssssssssssss",
				9000,
				8000,
				["Tecnologia", "Apple", "Desktop"],
			))
		).toThrow(errorMessage);
	});

	test("-> Deve aceitar descrição com 50 caracteres", () => {

		const product = Validator.validProduct(new Product(
			144,
			"abcaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
			9000,
			8000,
			["Tecnologia", "Apple", "Desktop"],
		));

		expect(product.description).toBe("abcaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
	});

	test("-> Valor de venda não pode ser maior que o valor de compra", () => {

		expect(() => Validator.validProduct(new Product(
			144,
			"abc",
			4000,
			8000,
			["Tecnologia", "Apple", "Desktop"],
		))

		).toThrow(errorMessageBuyPrice);

	});

	test("-> O valor de compra precisa ser positivo", () => {

		const testObject =  Validator.validProduct(new Product(
			144,
			"abc",
			8500,
			8000,
			["Tecnologia", "Apple", "Desktop"]
		));

		expect(testObject).toBe(testObject);
	});

	test("-> O valor de venda precisa ser positivo", () => {

		const testObject =  Validator.validProduct(new Product(
			144,
			"abc",
			8500,
			8000,
			["Tecnologia", "Apple", "Desktop"]
		));

		expect(testObject).toBe(testObject);
	});
});
