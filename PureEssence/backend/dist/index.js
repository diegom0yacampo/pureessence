import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET ?? "clave_secreta_sesion7";
const app = express();
const PORT = 3000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
// Middleware JWT (lee la cookie HttpOnly)
function verifyToken(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ error: "Token requerido" });
        return;
    }
    jwt.verify(token, JWT_SECRET, (err, payload) => {
        if (err || !payload || typeof payload === "string") {
            res.status(401).json({ error: "Token inválido o expirado" });
            return;
        }
        // Asignamos el payload al objeto request para usarlo en las rutas
        req.customer = payload;
        next();
    });
}
// Middleware de comprobación de rol (insensible a mayúsculas)
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.customer) {
            res.status(401).json({ error: "No autenticado" });
            return;
        }
        const userRole = req.customer.role.toLowerCase();
        const isEmployee = req.customer.es_empleado === true;
        const allowedRoles = roles.map(r => r.toLowerCase());
        // Si se requiere 'employee' y el usuario tiene el flag es_empleado, permitimos
        if (allowedRoles.includes('employee') && isEmployee) {
            return next();
        }
        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: "No tienes permiso para esto" });
            return;
        }
        next();
    };
}
app.get("/", (req, res) => {
    res.send("Backend de la tienda funcionando");
});
app.get("/api/hello", (req, res) => {
    res.json({ message: "Hola desde el backend" });
});
// Ruta de prueba de conexión a la BD
app.get("/api/test", async (req, res) => {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, time: result.rows[0].now });
});
// Obtener productos activos
app.get("/api/products", async (req, res) => {
    // Disparar en segundo plano sin bloquear el request
    seedStockIfMissing().catch(() => { });
    pool.query("SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock FROM perfume_precreado ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Products query failed:", err);
        res.status(500).json({ error: "Error al obtener productos" });
    });
});
app.get("/api/products/inactive", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    pool.query("SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock FROM perfume_precreado ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Inactive products query failed:", err);
        res.status(500).json({ error: "Error al obtener productos inactivos" });
    });
});
// Obtener ingredientes (público)
app.get("/api/ingredients", async (req, res) => {
    pool.query("SELECT id_ingrediente as id, nombre as name, familia_olfativa as family, precio as price, stock FROM ingrediente ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Ingredients query failed:", err);
        res.status(500).json({ error: "Error al obtener ingredientes" });
    });
});
// Obtener ingredientes (admin - con stock)
app.get("/api/admin/ingredients", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    pool.query("SELECT id_ingrediente as id, nombre as name, familia_olfativa as family, precio as price, stock FROM ingrediente ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Admin ingredients query failed:", err);
        res.status(500).json({ error: "Error al obtener ingredientes" });
    });
});
// Obtener frascos (público)
app.get("/api/bottles", async (req, res) => {
    pool.query("SELECT id_frasco as id, nombre as name, descripcion as description, precio as price, stock FROM frasco ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Bottles query failed:", err);
        res.status(500).json({ error: "Error al obtener frascos" });
    });
});
// Obtener frascos (admin - con stock)
app.get("/api/admin/bottles", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    pool.query("SELECT id_frasco as id, nombre as name, descripcion as description, precio as price, stock FROM frasco ORDER BY id")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        console.error("Admin bottles query failed:", err);
        res.status(500).json({ error: "Error al obtener frascos" });
    });
});
// Actualizar stock de perfume precreado
app.patch("/api/products/:id/stock", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    pool.query("UPDATE perfume_precreado SET stock = $1 WHERE id_perfume_precreado = $2 RETURNING id_perfume_precreado as id, nombre as name, stock", [stock, id])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Producto no encontrado" });
            return;
        }
        res.json({ message: "Stock actualizado", product: result.rows[0] });
    })
        .catch(err => {
        console.error("Update product stock query failed:", err);
        res.status(500).json({ error: "Error al actualizar stock de producto" });
    });
});
// Actualizar stock de ingrediente
app.patch("/api/ingredients/:id/stock", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    pool.query("UPDATE ingrediente SET stock = $1 WHERE id_ingrediente = $2 RETURNING id_ingrediente as id, nombre as name, stock", [stock, id])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Ingrediente no encontrado" });
            return;
        }
        res.json({ message: "Stock de ingrediente actualizado", ingredient: result.rows[0] });
    })
        .catch(err => {
        console.error("Update ingredient stock query failed:", err);
        res.status(500).json({ error: "Error al actualizar stock de ingrediente" });
    });
});
// Actualizar stock de frasco
app.patch("/api/bottles/:id/stock", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    pool.query("UPDATE frasco SET stock = $1 WHERE id_frasco = $2 RETURNING id_frasco as id, nombre as name, stock", [stock, id])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Frasco no encontrado" });
            return;
        }
        res.json({ message: "Stock de frasco actualizado", bottle: result.rows[0] });
    })
        .catch(err => {
        console.error("Update bottle stock query failed:", err);
        res.status(500).json({ error: "Error al actualizar stock de frasco" });
    });
});
app.get("/api/products/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const result = await pool.query("SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock FROM perfume_precreado WHERE id_perfume_precreado = $1", [id]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(result.rows[0]);
});
// Crear producto (solo admin)
app.post("/api/products", verifyToken, requireRole("admin"), async (req, res) => {
    const { name, description, price, category, stock, image_url } = req.body;
    if (!name) {
        return res.status(400).json({ error: "El nombre es obligatorio" });
    }
    if (price === undefined || price <= 0) {
        return res.status(400).json({ error: "El precio debe ser mayor que 0" });
    }
    const result = await pool.query("INSERT INTO products (name, description, price, category, stock, image_url)"
        + " VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [
        name,
        description ?? "",
        price,
        category ?? "General",
        stock ?? 0,
        image_url ?? `https://placehold.co/200x200?text=${encodeURIComponent(name)}`
    ]);
    res.status(201).json({ message: "Producto añadido", product: result.rows[0] });
});
// Actualizar producto (admin y employee)
app.put("/api/products/:id", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, stock, image_url } = req.body;
    const result = await pool.query("UPDATE products"
        + " SET name=$1, description=$2, price=$3, category=$4, stock=$5, image_url=$6"
        + " WHERE id=$7 RETURNING *", [name, description ?? "", price, category ?? "General", stock ?? 0, image_url ?? "", parseInt(id)]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto actualizado", product: result.rows[0] });
});
// Eliminar producto (soft delete si tiene pedidos)
app.delete("/api/products/:id", verifyToken, requireRole("admin"), async (req, res) => {
    const id = parseInt(req.params.id);
    const inOrders = await pool.query("SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1", [id]);
    if (inOrders.rows.length > 0) {
        const result = await pool.query("UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *", [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Producto no encontrado" });
        return res.json({ message: "Producto eliminado (soft)", product: result.rows[0] });
    }
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0)
        return res.status(404).json({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado", product: result.rows[0] });
});
// Activar/desactivar producto
app.patch("/api/products/:id/toggle", verifyToken, requireRole("admin"), async (req, res) => {
    const result = await pool.query("UPDATE products SET active = NOT active WHERE id = $1 AND deleted_at IS NULL RETURNING *", [parseInt(req.params.id)]);
    if (result.rows.length === 0)
        return res.status(404).json({ error: "Producto no encontrado" });
    const p = result.rows[0];
    res.json({
        message: p.active ? "Producto activado" : "Producto desactivado",
        product: p
    });
});
// Actualizar stock de producto (admin y employee)
app.patch("/api/products/:id/stock", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    if (stock === undefined || stock < 0) {
        return res.status(400).json({ error: "El stock debe ser un número positivo" });
    }
    const result = await pool.query("UPDATE perfume_precreado SET stock = $1 WHERE id_perfume_precreado = $2 RETURNING id_perfume_precreado as id, nombre as name, stock", [stock, parseInt(id)]);
    if (result.rows.length === 0) {
        return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Stock actualizado", product: result.rows[0] });
});
// Obtener todos los pedidos (admin y employee)
app.get("/api/orders", verifyToken, requireRole("admin", "employee"), async (req, res) => {
    const result = await pool.query(`SELECT o.id, o.customer_id, o.status, o.address, o.created_at,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id
         ORDER BY o.created_at DESC`);
    res.json(result.rows);
});
app.get("/api/orders/customer/:customerId", verifyToken, (req, res) => {
    const customerId = parseInt(req.params.customerId);
    if (req.customer.role === "customer" &&
        req.customer.id !== customerId) {
        res.status(403).json({ error: "No tienes permiso para ver estos pedidos" });
        return;
    }
    pool.query(`SELECT o.id, o.status, o.address, o.created_at,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`, [customerId])
        .then(result => res.json(result.rows))
        .catch(() => res.status(500).json({ error: "Error al obtener pedidos del cliente" }));
});
// Obtener pedidos del usuario logueado
app.get("/api/orders/my", verifyToken, (req, res) => {
    pool.query(`SELECT o.id, o.status, o.address, o.created_at,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`, [req.customer.id])
        .then(result => res.json(result.rows))
        .catch(() => res.status(500).json({ error: "Error al obtener pedidos" }));
});
// Obtener detalle de un pedido
app.get("/api/orders/:id", verifyToken, async (req, res) => {
    const orderId = parseInt(req.params.id);
    const orderResult = await pool.query(`SELECT o.*, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.id = $1
         GROUP BY o.id`, [orderId]);
    if (orderResult.rows.length === 0)
        return res.status(404).json({ error: "Pedido no encontrado" });
    const itemsResult = await pool.query(`SELECT oi.quantity, oi.unit_price,
                (oi.quantity * oi.unit_price) AS subtotal,
                p.name, p.image_url
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`, [orderId]);
    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
});
//cambiar estado de un pedido (admin y employee)
app.patch("/api/orders/:id/status", verifyToken, requireRole("admin", "employee"), (req, res) => {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: "Estado no válido" });
        return;
    }
    pool.query("UPDATE orders SET status = $1 WHERE id = $2 RETURNING *", [status, parseInt(req.params.id)])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Pedido no encontrado" });
            return;
        }
        res.json(result.rows[0]);
    })
        .catch(() => res.status(500).json({ error: "Error al actualizar el pedido" }));
});
// Crear pedido con validación de stock
app.post("/api/orders", verifyToken, async (req, res) => {
    const { items, address } = req.body;
    if (!items || items.length === 0)
        return res.status(400).json({ error: "El carrito está vacío" });
    if (!address)
        return res.status(400).json({ error: "La dirección es obligatoria" });
    // Validar stock antes de empezar la transacción
    for (const item of items) {
        const check = await pool.query("SELECT stock, name FROM products WHERE id = $1 AND deleted_at IS NULL AND active = TRUE", [item.productId]);
        if (check.rows.length === 0)
            return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
        if (check.rows[0].stock < item.quantity)
            return res.status(409).json({
                error: `Stock insuficiente para "${check.rows[0].name}" (disponible: ${check.rows[0].stock})`
            });
    }
    const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const customerId = req.customer.id;
    pool.connect().then(async (client) => {
        const executeTransaction = async () => {
            await client.query("BEGIN");
            const orderResult = await client.query("INSERT INTO orders (customer_id, status, address) VALUES ($1, 'pending', $2) RETURNING *", [customerId, address]);
            const orderId = orderResult.rows[0].id;
            for (const item of items) {
                await client.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)", [orderId, item.productId, item.quantity, item.unitPrice]);
                await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.productId]);
            }
            await client.query("COMMIT");
            res.status(201).json({
                message: "Pedido creado",
                order: { ...orderResult.rows[0], total: Math.round(total * 100) / 100 }
            });
            client.release();
        };
        executeTransaction().catch((err) => {
            console.error("Transaction error:", err);
            client.query("ROLLBACK").then(() => {
                res.status(500).json({ error: "Error al crear el pedido" });
                client.release();
            });
        });
    }).catch(() => {
        res.status(500).json({ error: "Error de conexión a la base de datos" });
    });
});
// Fichajes: consultar estado actual
app.get("/api/clock/status", verifyToken, (req, res) => {
    pool.query(`SELECT tipo FROM FICHAR_JORNADA
         WHERE id_usuario = $1
         ORDER BY fecha_hora DESC LIMIT 1`, [req.customer.id])
        .then(result => {
        const isClockedIn = result.rows.length > 0 && result.rows[0].tipo === "Entrada";
        res.json({ isClockedIn });
    })
        .catch(() => res.status(500).json({ error: "Error al consultar fichaje" }));
});
// Fichajes: registrar entrada/salida
app.post("/api/clock", verifyToken, (req, res) => {
    const { type } = req.body;
    pool.query("INSERT INTO FICHAR_JORNADA (id_usuario, tipo) VALUES ($1, $2) RETURNING *", [req.customer.id, type])
        .then(result => res.json({ event: result.rows[0] }))
        .catch(() => res.status(500).json({ error: "Error al registrar fichaje" }));
});
// Fichajes: obtener histórico personal
app.get("/api/clock/history", verifyToken, (req, res) => {
    pool.query("SELECT * FROM FICHAR_JORNADA WHERE id_usuario = $1 ORDER BY fecha_hora DESC LIMIT 10", [req.customer.id])
        .then(result => res.json(result.rows))
        .catch(() => res.status(500).json({ error: "Error al obtener histórico" }));
});
const seedAdminIfMissing = async () => {
    try {
        const adminEmail = "admin@pureessence.com";
        const check = await pool.query("SELECT id_usuario FROM USUARIO WHERE email = $1 LIMIT 1", [adminEmail]);
        if (check.rows.length === 0) {
            console.log("Seeding default admin user into AWS database...");
            const hash = bcrypt.hashSync("admin123", 10);
            try {
                await pool.query("INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol, es_empleado) VALUES ($1, $2, $3, $4, $5, $6, $7)", ["admin", adminEmail, hash, "12345678A", "Calle Principal 123", "Admin", true]);
                console.log("Admin seeded successfully with es_empleado.");
            }
            catch (err) {
                await pool.query("INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6)", ["admin", adminEmail, hash, "12345678A", "Calle Principal 123", "Admin"]);
                console.log("Admin seeded successfully without es_empleado.");
            }
        }
    }
    catch (err) {
        console.warn("Failed to seed admin in AWS DB:", err);
    }
};
const seedStockIfMissing = async () => {
    try {
        const perfCheck = await pool.query("SELECT id_perfume_precreado FROM perfume_precreado LIMIT 1");
        if (perfCheck.rows.length === 0) {
            console.log("Seeding default perfumes into AWS database...");
            for (const p of mockProducts) {
                await pool.query("INSERT INTO perfume_precreado (id_perfume_precreado, nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5)", [p.id, p.name, p.description, p.price, p.stock]);
            }
        }
        const ingCheck = await pool.query("SELECT id_ingrediente FROM ingrediente LIMIT 1");
        if (ingCheck.rows.length === 0) {
            console.log("Seeding default ingredients into AWS database...");
            for (const i of mockIngredients) {
                await pool.query("INSERT INTO ingrediente (id_ingrediente, nombre, familia_olfativa, precio, stock) VALUES ($1, $2, $3, $4, $5)", [i.id, i.name, i.family, i.price, i.stock]);
            }
        }
        const botCheck = await pool.query("SELECT id_frasco FROM frasco LIMIT 1");
        if (botCheck.rows.length === 0) {
            console.log("Seeding default bottles into AWS database...");
            for (const b of mockBottles) {
                await pool.query("INSERT INTO frasco (id_frasco, nombre, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5)", [b.id, b.name, b.description, b.price, b.stock]);
            }
        }
    }
    catch (err) {
        console.warn("Failed to seed stock in AWS DB:", err);
    }
};
// Administración: obtener todos los usuarios
app.get("/api/admin/users", verifyToken, requireRole("admin", "employee"), (req, res) => {
    // Disparar en segundo plano sin bloquear el request
    seedAdminIfMissing().catch(() => { });
    pool.query("SELECT id_usuario as id, nombre as username, email, rol as role, es_empleado FROM USUARIO ORDER BY id_usuario")
        .then(result => {
        res.json(result.rows);
    })
        .catch(err => {
        if (err.message && (err.message.includes("es_empleado") || err.message.includes("column"))) {
            console.warn("Column 'es_empleado' not found in USUARIO table. Querying role instead...");
            return pool.query("SELECT id_usuario as id, nombre as username, email, rol as role, (CASE WHEN rol = 'Admin' THEN true ELSE false END) as es_empleado FROM USUARIO ORDER BY id_usuario")
                .then(result => {
                res.json(result.rows);
            })
                .catch(innerErr => {
                console.error("Alternative users query failed:", innerErr);
                res.status(500).json({ error: "Error al obtener usuarios" });
            });
        }
        console.error("AWS DB users query failed entirely:", err);
        res.status(500).json({ error: "Error al obtener usuarios" });
    });
});
// Administración: borrar usuario (con limpieza profunda de dependencias)
app.delete("/api/admin/users/:id", verifyToken, requireRole("admin"), async (req, res) => {
    const { id } = req.params;
    pool.connect().then(async (client) => {
        try {
            await client.query("BEGIN");
            const ordersRes = await client.query("SELECT id_pedido FROM PEDIDO WHERE id_usuario = $1", [id]);
            const orderIds = ordersRes.rows.map(o => o.id_pedido);
            if (orderIds.length > 0) {
                const pPerfRes = await client.query("SELECT id_perfume_personalizado FROM PEDIDO_PERFUME_PERSONALIZADO WHERE id_pedido = ANY($1)", [orderIds]);
                const pPerfIds = pPerfRes.rows.map(p => p.id_perfume_personalizado);
                if (pPerfIds.length > 0) {
                    await client.query("DELETE FROM INGREDIENTE_PERFUME_PERSONALIZADO WHERE id_perfume_personalizado = ANY($1)", [pPerfIds]);
                    await client.query("DELETE FROM PEDIDO_PERFUME_PERSONALIZADO WHERE id_pedido = ANY($1)", [orderIds]);
                    await client.query("DELETE FROM PERFUME_PERSONALIZADO WHERE id_perfume_personalizado = ANY($1)", [pPerfIds]);
                }
                await client.query("DELETE FROM PEDIDO_PERFUME_PRECREADO WHERE id_pedido = ANY($1)", [orderIds]);
                await client.query("DELETE FROM ENVIO WHERE id_pedido = ANY($1)", [orderIds]);
                await client.query("DELETE FROM PEDIDO WHERE id_usuario = $1", [id]);
            }
            const result = await client.query("DELETE FROM USUARIO WHERE id_usuario = $1 RETURNING *", [id]);
            if (result.rows.length === 0) {
                await client.query("ROLLBACK");
                client.release();
                return res.status(404).json({ error: "Usuario no encontrado" });
            }
            await client.query("COMMIT");
            client.release();
            res.json({ message: "Usuario y todos sus datos asociados han sido eliminados." });
        }
        catch (err) {
            await client.query("ROLLBACK");
            client.release();
            throw err;
        }
    }).catch(err => {
        console.error("Delete user DB failed:", err);
        res.status(500).json({ error: "Error al eliminar usuario" });
    });
});
// Administración: cambiar rol
app.patch("/api/admin/users/:id/role", verifyToken, requireRole("admin"), (req, res) => {
    const { role } = req.body;
    const userId = parseInt(req.params.id);
    pool.query("UPDATE USUARIO SET rol = $1 WHERE id_usuario = $2 RETURNING id_usuario as id, rol as role", [role, userId])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json(result.rows[0]);
    })
        .catch(err => {
        console.error("Update user role DB failed:", err);
        res.status(500).json({ error: "Error al actualizar rol de usuario" });
    });
});
// Administración: suspender/activar usuario
app.patch("/api/admin/users/:id/status", verifyToken, requireRole("admin"), (req, res) => {
    const { active } = req.body;
    const userId = parseInt(req.params.id);
    pool.query("UPDATE USUARIO SET es_empleado = $1 WHERE id_usuario = $2 RETURNING id_usuario as id, es_empleado", [active, userId])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }
        res.json(result.rows[0]);
    })
        .catch(err => {
        console.error("Update user status DB failed:", err);
        res.status(500).json({ error: "Error al actualizar estado del usuario" });
    });
});
// Mocks para la siembra en la base de datos AWS en caso de que esté vacía
const mockProducts = [
    { id: 1, name: "Mystique Gold", description: "Una fragancia misteriosa con notas de sándalo y oro líquido.", price: 120, stock: 15 },
    { id: 2, name: "Velvet Amber", description: "Cálido ámbar combinado con la suavidad del terciopelo y vainilla de Madagascar.", price: 95, stock: 8 },
    { id: 3, name: "Oceanic Breeze", description: "Frescura marina pura con toques cítricos y brisa de sal de mar.", price: 85, stock: 25 },
    { id: 4, name: "Royal Oud", description: "Madera de oud imperial mezclada con especias exóticas orientales.", price: 150, stock: 4 }
];
const mockIngredients = [
    { id: 101, name: "Esencia de Sándalo", family: "Amaderada", price: 45, stock: 12 },
    { id: 102, name: "Ámbar Gris", family: "Ámbar", price: 90, stock: 5 },
    { id: 103, name: "Sal Marina de Bretaña", family: "Marina", price: 20, stock: 30 },
    { id: 104, name: "Vainilla Bourbon", family: "Dulce", price: 35, stock: 18 }
];
const mockBottles = [
    { id: 201, name: "Frasco Murano Imperial", description: "Frasco de vidrio soplado artesanal con detalles en oro de 24k.", price: 60, stock: 10 },
    { id: 202, name: "Frasco Clásico Minimalista", description: "Diseño moderno y limpio con tapón de madera natural tratada.", price: 25, stock: 50 },
    { id: 203, name: "Frasco Esmeralda Geométrico", description: "Vidrio facetado de color esmeralda profundo y cierre hermético.", price: 40, stock: 15 }
];
// Registro de nuevos usuarios
app.post("/api/auth/register", (req, res) => {
    const { username, email, password, dni, address } = req.body;
    if (!username || !email || !password || !dni) {
        return res.status(400).json({ error: "nombre, email, password y dni son obligatorios" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim();
    pool.query("SELECT id_usuario FROM USUARIO WHERE LOWER(nombre) = LOWER($1) OR LOWER(email) = LOWER($2) OR dni = $3 LIMIT 1", [normalizedUsername, normalizedEmail, dni.trim()])
        .then(check => {
        if (check.rows.length > 0) {
            res.status(409).json({ error: "El usuario, email o DNI ya existe" });
            return Promise.reject("Usuario existente");
        }
        return bcrypt.hash(password, 10);
    })
        .then(hash => pool.query("INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol) VALUES ($1, $2, $3, $4, $5, 'User')", [normalizedUsername, normalizedEmail, hash, dni.trim(), address?.trim() || ""]))
        .then(() => res.status(201).json({ message: "Usuario creado" }))
        .catch(error => {
        if (error === "Usuario existente")
            return;
        console.error("Register DB failed:", error);
        res.status(500).json({ error: "Error al registrar usuario en la base de datos de AWS" });
    });
});
// Login: devuelve cookie HttpOnly
app.post("/api/auth/login", (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ error: "Email/Nombre y password son obligatorios" });
    }
    const cleanIdentifier = identifier.trim();
    const handleSuccessfulLogin = (user) => {
        const token = jwt.sign({ id: user.id_usuario, username: user.nombre, role: user.rol, es_empleado: user.es_empleado }, JWT_SECRET, { expiresIn: "2h" });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 2 * 60 * 60 * 1000,
        });
        res.json({
            customer: { id: user.id_usuario, username: user.nombre, email: user.email, role: user.rol, es_empleado: user.es_empleado }
        });
    };
    // Query database as standard path
    pool.query("SELECT * FROM USUARIO WHERE LOWER(nombre) = LOWER($1) OR LOWER(email) = LOWER($1)", [cleanIdentifier])
        .then(result => {
        console.log(`Login attempt for: ${cleanIdentifier}. Found users: ${result.rows.length}`);
        if (result.rows.length === 0) {
            res.status(401).json({ error: "Credenciales incorrectas" });
            return Promise.reject("Credenciales incorrectas");
        }
        const user = result.rows[0];
        return bcrypt.compare(password, user.contrasenya).then(match => {
            console.log(`Bcrypt match for ${cleanIdentifier}: ${match}`);
            if (!match) {
                res.status(401).json({ error: "Credenciales incorrectas" });
                return Promise.reject("Credenciales incorrectas");
            }
            handleSuccessfulLogin(user);
        });
    })
        .catch(error => {
        if (error !== "Credenciales incorrectas") {
            console.error("Login error:", error);
            res.status(500).json({ error: "Error en la autenticación (base de datos fuera de línea)" });
        }
    });
});
// verifica la cookie y devuelve el usuario
app.get("/api/auth/me", verifyToken, (req, res) => {
    pool.query("SELECT id_usuario as id, nombre as username, email, rol as role, es_empleado FROM USUARIO WHERE id_usuario = $1", [req.customer.id])
        .then(result => {
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Usuario no encontrado" });
        }
        else {
            res.json({ customer: result.rows[0] });
        }
    })
        .catch((err) => {
        console.error("Get user me failed:", err);
        res.status(500).json({ error: "Error al obtener la sesión de usuario" });
    });
});
// borra la cookie
app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    res.json({ message: "Sesión cerrada" });
});
// Generación de imagen con Google Gemini
app.post("/api/generate-image", async (req, res) => {
    const { prompt, bottleImage } = req.body;
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
        return res.status(400).json({ error: "El campo 'prompt' es obligatorio." });
    }
    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey)
        return res.status(500).json({ error: "GOOGLE_AI_KEY no configurada." });
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);
        const requestParts = [];
        if (bottleImage?.data) {
            requestParts.push({ inlineData: { mimeType: bottleImage.mimeType ?? "image/jpeg", data: bottleImage.data } });
        }
        requestParts.push({ text: prompt.trim() });
        const googleRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: requestParts }],
                generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
            }),
            signal: controller.signal,
        });
        clearTimeout(timeout);
        const rawText = await googleRes.text();
        let data;
        try {
            data = JSON.parse(rawText);
        }
        catch {
            return res.status(502).json({ error: "Google respondió sin JSON: " + rawText.slice(0, 150) });
        }
        if (!googleRes.ok) {
            console.error("Google error:", JSON.stringify(data));
            return res.status(502).json({ error: data?.error?.message ?? `Error Google ${googleRes.status}` });
        }
        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        const imagePart = parts.find((p) => p.inlineData?.data);
        if (!imagePart)
            return res.status(502).json({ error: "Google no devolvió imagen. Partes: " + JSON.stringify(parts).slice(0, 150) });
        res.json({ image: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType ?? "image/jpeg" });
    }
    catch (err) {
        console.error("Error generando imagen:", err);
        res.status(500).json({ error: err?.message ?? "Error interno." });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
// Manejador de errores global
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: "Error interno del servidor" });
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
