const express = require("express");

const router = express.Router();

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    crash
} = require("../controllers/productController");


router.use((req, res, next) => {
    console.log("Masuk ke Products Router");

    next();
});

router.get("/crash", crash);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.post("/", createProduct);

router.put("/:id", updateProduct);

router.delete("/:id", deleteProduct);



module.exports = router;