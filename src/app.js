import express from 'express';
import cors from 'cors';
import { uuid } from 'uuidv4';

const app = express();

app.use(express.json());
app.use(cors());

let products = [];

app.get('/products', (request, response) => {
    return response.json(products);
});

app.post('/products', (request, response) => {
    const { code, description, buyPrice, sellPrice, tags } = request.body;
    const verifyProduct = products.find(value => value.code == code);
    const checkIfThereLove = verifyProduct ? verifyProduct.lovers : 0;

    const product = {
        id: uuid(),
        code, 
        description, 
        buyPrice, 
        sellPrice, 
        tags,
        lovers: checkIfThereLove
    }

    products.push(product);

    response.status(201).json(product);
});

app.put('/products/:id', (request, response) => {
    const { id } = request.params;
    const { code, description, buyPrice, sellPrice, tags } = request.body;

    const verifyProductExists = products.find(product => product.id === id);

    if(verifyProductExists){
        verifyProductExists.code = code;
        verifyProductExists.description= description;
        verifyProductExists.buyPrice = buyPrice;
        verifyProductExists.sellPrice = sellPrice;
        verifyProductExists.tags = tags;

        response.json(verifyProductExists);
    }else {
        response.status(400).send();
    }

});

app.delete('/products/:code', (request, response) => {
    const { code } = request.params;
    const productsForDeleteIndex = products.findIndex( item => item.code == code);

    if(productsForDeleteIndex === -1){
        return response.status(400).send();
    }else {
        products = products.filter(item => item.code != code);

        return response.status(204).send();
    }
});

app.post('/products/:code/love', (request, response) => {
    const { code } = request.params;

    const product = products.find(item => item.code == code);

    if(!product){
        return response.status(400).send();
    } else {
        products.filter(item => item.code == code).map(value => value.lovers += 1 );

        return response.json({lovers: product.lovers })
    }
});

app.get('/products/:code', (request, response) => {
    const { code } = request.params;

    const product = products.find(item => item.code == code);

    if(!product) {
        return response.status(204).send();
    } else {
        const productData = products.filter( item => item.code == code);

        return response.json(productData);
    }
});

export {app};