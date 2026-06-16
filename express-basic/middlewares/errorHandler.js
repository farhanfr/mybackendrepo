function errorHandler(err, req, res, next) {
    console.error(err);

    return res.status(500).json({
        message: "Terjadi kesalahan pada server"
    });
}

module.exports = errorHandler;