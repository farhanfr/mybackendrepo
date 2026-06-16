const prisma = require("../lib/prisma");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;

        if (
            typeof name !== "string" ||
            name.trim() === "" ||
            typeof email !== "string" ||
            email.trim() === "" ||
            typeof password !== "string" ||
            password.length < 6
        ) {
            return res.status(400).json({
                message: "Data tidak valid"
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email sudah terdaftar"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });

        return res.status(201).json({
            message: "Register berhasil",
            data: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Email atau password salah"
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.json({
            message: "Login berhasil",
            token
        });

    } catch (err) {
        next(err);
    }
}

async function profile(req, res) {
    return res.json({
        message: "Profile berhasil diakses",
        user: req.user
    });
}

module.exports = {
    register,
    login,
    profile
};