const productService = require("../services/productService");

async function getProducts( request, response) {
    try {
        const products = await productService.getAllProducts();
        response.json(products);
    } catch (error) {
        response.status(500).json({
            error: "Failed to get products"
        });
    }
}


async function getProduct(request, response){
    try {
        const id = request.params.id;
        const product = await productService.getProductById(id);
        if (!product) {
            return response.status(404).json({error: "Product not found"})
        }
        return response.status(200).json(product);

    } catch (error) {
        response.status(500).json({ error: "Failed to get product"})
        
    }
}

async function  createProduct( request, response){
    try {
        const newProduct = await productService.createProduct(request.body);
        return response.status(201).json(newProduct)
        
    } catch (error) {
        response.status(500).json({error: "Failed to create product"})   
    };

}

async function updateProduct( request, response) {
    try{
        const id = request.params.id;
        const updatedProduct = await productService.updateProduct(id, request.body);
        if (!updatedProduct){
            return response.status(404).json({error: "Product not found"})
        }
        return response.status(200).json(updatedProduct)
        

    } catch (error){
        response.status(500).json({error: "Failed to update product"})
    }
}

async function deleteProduct( request, response ){
    try{
        const id = request.params.id;
        const deletedProduct = await productService.deleteProduct(id);
       
        if (!deletedProduct){
            return response.status(404).json({error: "produt not found"})
        }
        return response.status(200).json(deletedProduct)
        
    }catch (error){
        response.status(500).json({error: "Failed to delete product"})
    }
}
module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct
};