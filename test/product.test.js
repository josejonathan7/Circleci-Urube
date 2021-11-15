//A quantidade vendida pode ser de uma ou mais unidades

import { test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';



describe('#Teste de produtos', () => {
    let products;
    beforeEach(() => {
        products = [{
            code: 12,
            description: "Macbook pro retina 2021",
            buyPrice: 4000,
            sellPrice: 8000,
            tags: ['Tecnologia', 'Apple', 'Desktop']
        },
        {
            code: 99,
            description: "Positivo pro retina 2021",
            buyPrice: 1000,
            sellPrice: 2000,
            tags: ['Tecnologia', 'Positivo', 'Desktop']
        }];
    });

    afterEach(async () => {
        await request(app).delete(`/products/${products[0].code}`);
    });


    describe('##Teste de criação de produto', () => {

        test('-> deve ser possivel adicionar um novo produto', async () => {
            const response = await request(app).post('/products').send(products[0]);

            expect(response.body).toMatchObject({
                ...products[0],
                lovers: 0
            });
        });

        test('-> O status code de um produto criado deve ser 201', async () => {
            const response = await request(app).post('/products').send(products[0]);

            expect(response.status).toBe(201);
        });
    });

    describe('##Tesde de atualização de produto', () => {

        test('-> Deve ser possivel autalizar dados de um produto', async () => {
            const response = await request(app).post('/products').send(products[0]);

            const updateProduct = {
                ...response.body,
                description: 'Dell Vostro'
            };

            const responseUpdated = await request(app).put(`/products/${response.body.id}`).send(updateProduct);

            expect(responseUpdated.body).toMatchObject(updateProduct);
        });

        test('-> Não deve ser possivel atualizar um produto inexistente', async () => {
            const response = await request(app).post('/products').send(products[1]);

            const updateProduct = {
                ...response.body,
                description: 'Dell Vostro'
            };

            const responseUpdated = await request(app).put(`/products/151321512`).send(updateProduct);

            expect(responseUpdated.status).toBe(400);
        });
    });

    describe('##Remoção de conteúdo', () => {
        test('-> Não deve ser possivel remover um produto inexistente', async () => {
            await request(app).delete('/products/654d6asd45').expect(400);
        });

        test('-> Deve retornar o código 204 quando um produto for removido', async () => {
            const response = await request(app).post('/products').send(products[1]);

            await request(app).delete(`/products/${response.body.code}`).expect(204);
        });

        test('-> Deve ser possivel remover os produtos pelo código', async () => {
            await request(app).delete(`/products/${products[0].code}`);
            console.log(products[0].code)
            const responseGet = await request(app).get('/products');

            expect(responseGet.body).toHaveLength(3);
        });
    });

    describe('##Listagem de conteúdo', () => {

        test('-> Deve ser possível listar todos os produtos', async () => {
            const responseGet = await request(app).get('/products');

            expect(responseGet.body).toHaveLength(5);
        })
    });

});