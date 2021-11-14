//A quantidade vendida pode ser de uma ou mais unidades

import { test, expect } from '@jest/globals';
import { Product } from '../src/model/product';
import { sellProduct } from '../src/service/sellProduct';

describe('#Teste do produto', () => {
    test('-> deve validar baixa de estoque da venda de uma unidade', () => {
        const product = new Product('Celular', 500.00, 900.00, 10);

        sellProduct(product, 1);

        expect(product.stock).toBe(9);
    });

    test('-> Deve validar a venda de mais de uma unidade', () => {
        const product = new Product('Celular', 500.00, 900.00, 10);

        sellProduct(product, 3);

        expect(product.stock).toBe(7);
    });
} )

