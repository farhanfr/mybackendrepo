const products = require("../data/products");
const prisma = require("../lib/prisma");

let nextId = 4;


async function getProducts(req, res, next) {
     try {
        const products = await prisma.product.findMany();

        return res.json(products);
    } catch (err) {
        next(err);
    }
}

function getProductById(req, res) {
    const id = Number(req.params.id);

    const product = products.find(
        product => product.id === id
    );

    if (!product) {
        return res.status(404).json({
            message: "Produk tidak ditemukan"
        });
    }

    res.json(product);
}

async function createProduct(req, res) {
    try {
        const { name, price } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof price !== "number"
        ) {
            return res.status(400).json({
                message: "Data tidak valid"
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                price
            }
        });

        return res.status(201).json({
            message: "Produk berhasil ditambahkan",
            data: product
        });

    } catch (err) {
        next(err);
    }
}

async function updateProduct(req, res, next) {
    try {
        const id = Number(req.params.id);

        const { name, price } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof price !== "number"
        ) {
            return res.status(400).json({
                message: "Data tidak valid"
            });
        }

        const product = await prisma.product.update({
            where: {
                id
            },
            data: {
                name,
                price
            }
        });

        return res.json({
            message: "Produk berhasil diperbarui",
            data: product
        });

    } catch (err) {
        next(err);
    }
}

async function deleteProduct(req, res, next) {
    try {
        const id = Number(req.params.id);

        const product = await prisma.product.delete({
            where: {
                id
            }
        });

        return res.json({
            message: "Produk berhasil dihapus",
            data: product
        });

    } catch (err) {
        next(err);
    }
}

function crash(req, res, next) {
    next(new Error("Test crash"));
}


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    crash
};