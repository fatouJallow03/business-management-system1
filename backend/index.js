const express = require("express");

const app = express();
app.use(express.json())

app.get("/products", (request, response) => {
    response.send("Here are the products");
});
app.post("/products", (request, response) => {
    console.log(request.body)
    response.status(201).send("product created")
})

app.listen(3000);