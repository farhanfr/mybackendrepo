const express = require("express");

const errorHandler = require("./middlewares/errorHandler");

const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello Backend!");
});

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);

    next();
});

app.use("/products", productRoutes);
app.use("/users", userRoutes);

app.use(errorHandler);

module.exports = app;