
export class Validator {


	static validProduct(product){
		const { description, buyPrice, sellPrice } = product;

		if(description.length < 3){
			throw new Error("Descrição deve estar entre 3 e 50 caracteres");
		}

		if(description.length > 50){
			throw new Error("Descrição deve estar entre 3 e 50 caracteres");
		}

		if(sellPrice > buyPrice){
			throw new Error("Valor de venda não pode ser maior que o valor de compra");
		}

		if(buyPrice < 0) {
			throw new Error("O valor de compra tem que ser positivo");
		}

		if(sellPrice < 0) {
			throw new Error("O valor de venda tem que ser positivo");
		}

		return product;

	}
}
