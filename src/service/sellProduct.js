/**
 * A quantidade vendida pode ser de uma ou mais unidades
 * -> se o estoque ficar negativo uma exception deve ser lançado
 * -> o valor de venda não pode ser maior que o valor de compra
 * @param {*} product 
 * @param {*} amount 
 */

//import { Product } from '../model/product';

export function sellProduct(product, amount) {
    product.stock -= 1;
    return product;
}