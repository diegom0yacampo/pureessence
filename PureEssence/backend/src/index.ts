import dotenv from "dotenv";
dotenv.config();

import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pool } from "./db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "clave_secreta_sesion7";

// Tipo extendido para incluir el usuario en la request
interface AuthRequest extends Request {
  customer?: JwtPayload & { id: number; username: string; role: string } | undefined;
}

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Middleware JWT (lee la cookie HttpOnly)
function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, payload: any) => {
    if (err || !payload || typeof payload === "string") {
      res.status(401).json({ error: "Token inválido o expirado" });
      return;
    }
    // Asignamos el payload al objeto request para usarlo en las rutas
    req.customer = payload as AuthRequest["customer"];
    next();
  });
}

// Middleware de comprobación de rol (insensible a mayúsculas)
function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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




app.get("/", (req: Request, res: Response) => {
  res.send("Backend de la tienda funcionando");
});

app.get("/api/hello", (req: Request, res: Response) => {
  res.json({ message: "Hola desde el backend" });
});

// Ruta de prueba de conexión a la BD
app.get("/api/test", async (req: Request, res: Response) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ connected: true, time: result.rows[0].now });
});

// Obtener productos activos
app.get("/api/products", async (req: Request, res: Response) => {
  // Disparar en segundo plano sin bloquear el request
  seedStockIfMissing().catch(() => {});

  pool.query(
    "SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock, image_url, notas as notes FROM perfume_precreado ORDER BY id"
  )
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error("Products query failed:", err);
      res.status(500).json({ error: "Error al obtener productos" });
    });
});

app.get("/api/products/inactive", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
  pool.query(
    "SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock, image_url, notas as notes FROM perfume_precreado ORDER BY id"
  )
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error("Inactive products query failed:", err);
      res.status(500).json({ error: "Error al obtener productos inactivos" });
    });
});

// Obtener ingredientes (público)
app.get("/api/ingredients", async (req: Request, res: Response) => {
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
app.get("/api/admin/ingredients", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
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
app.get("/api/bottles", async (req: Request, res: Response) => {
  pool.query("SELECT id_frasco as id, nombre as name, descripcion as description, precio as price, stock, image_url FROM frasco ORDER BY id")
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error("Bottles query failed:", err);
      res.status(500).json({ error: "Error al obtener frascos" });
    });
});

// Obtener frascos (admin - con stock)
app.get("/api/admin/bottles", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
  pool.query("SELECT id_frasco as id, nombre as name, descripcion as description, precio as price, stock, image_url FROM frasco ORDER BY id")
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error("Admin bottles query failed:", err);
      res.status(500).json({ error: "Error al obtener frascos" });
    });
});

// Actualizar stock de perfume precreado
app.patch("/api/products/:id/stock", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
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
app.patch("/api/ingredients/:id/stock", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
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
app.patch("/api/bottles/:id/stock", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
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

app.get("/api/products/:id", async (req: Request<{ id: string }>, res: Response) => {
  const id = parseInt(req.params.id);
  const result = await pool.query(
    "SELECT id_perfume_precreado as id, nombre as name, descripcion as description, precio as price, stock, image_url, notas as notes FROM perfume_precreado WHERE id_perfume_precreado = $1",
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(result.rows[0]);
});

// Crear producto (solo admin)
app.post("/api/products", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const { name, description, price, category, stock, image_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (price === undefined || price <= 0) {
    return res.status(400).json({ error: "El precio debe ser mayor que 0" });
  }

  const result = await pool.query(
    "INSERT INTO products (name, description, price, category, stock, image_url)"
    + " VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [
      name,
      description ?? "",
      price,
      category ?? "General",
      stock ?? 0,
      image_url ?? `https://placehold.co/200x200?text=${encodeURIComponent(name)}`
    ]
  );
  res.status(201).json({ message: "Producto añadido", product: result.rows[0] });
});

// Actualizar producto (admin y employee)
app.put("/api/products/:id", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, description, price, category, stock, image_url } = req.body;

  const result = await pool.query(
    "UPDATE products"
    + " SET name=$1, description=$2, price=$3, category=$4, stock=$5, image_url=$6"
    + " WHERE id=$7 RETURNING *",
    [name, description ?? "", price, category ?? "General", stock ?? 0, image_url ?? "", parseInt(id)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json({ message: "Producto actualizado", product: result.rows[0] });
});

// Eliminar producto (soft delete si tiene pedidos)
app.delete("/api/products/:id", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const id = parseInt((req.params as { id: string }).id);

  const inOrders = await pool.query(
    "SELECT 1 FROM order_items WHERE product_id = $1 LIMIT 1",
    [id]
  );

  if (inOrders.rows.length > 0) {
    const result = await pool.query(
      "UPDATE products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
    return res.json({ message: "Producto eliminado (soft)", product: result.rows[0] });
  }

  const result = await pool.query(
    "DELETE FROM products WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
  res.json({ message: "Producto eliminado", product: result.rows[0] });
});

// Activar/desactivar producto
app.patch("/api/products/:id/toggle", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    "UPDATE products SET active = NOT active WHERE id = $1 AND deleted_at IS NULL RETURNING *",
    [parseInt((req.params as { id: string }).id)]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
  const p = result.rows[0];
  res.json({
    message: p.active ? "Producto activado" : "Producto desactivado",
    product: p
  });
});

// Actualizar stock de producto (admin y employee)
app.patch("/api/products/:id/stock", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
  const { id } = req.params as { id: string };
  const { stock } = req.body as { stock: number };

  if (stock === undefined || stock < 0) {
    return res.status(400).json({ error: "El stock debe ser un número positivo" });
  }

  const result = await pool.query(
    "UPDATE perfume_precreado SET stock = $1 WHERE id_perfume_precreado = $2 RETURNING id_perfume_precreado as id, nombre as name, stock",
    [stock, parseInt(id)]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json({ message: "Stock actualizado", product: result.rows[0] });
});

// Obtener todos los pedidos (admin y employee)
app.get("/api/orders", verifyToken, requireRole("admin", "employee"), async (req: AuthRequest, res: Response) => {
  const result = await pool.query(
    `SELECT o.id, o.customer_id, o.status, o.address, o.created_at,
                o.nombre, o.apellido, o.ciudad, o.pais, o.codigo_postal,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total,
                COUNT(oi.id) AS item_count
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         GROUP BY o.id
         ORDER BY o.created_at DESC`
  );
  res.json(result.rows);
});

app.get("/api/orders/customer/:customerId", verifyToken, (req: AuthRequest, res: Response) => {
  const customerId = parseInt((req.params as { customerId: string }).customerId);

  if (
    req.customer!.role === "customer" &&
    req.customer!.id !== customerId
  ) {
    res.status(403).json({ error: "No tienes permiso para ver estos pedidos" });
    return;
  }

  pool.query(
    `SELECT o.id, o.status, o.address, o.created_at,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
    [customerId]
  )
    .then(result => res.json(result.rows))
    .catch(() => res.status(500).json({ error: "Error al obtener pedidos del cliente" }));
});

// Obtener pedidos del usuario logueado
app.get("/api/orders/my", verifyToken, (req: AuthRequest, res: Response) => {
  pool.query(
    `SELECT o.id, o.status, o.address, o.created_at,
                COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.customer_id = $1
         GROUP BY o.id
         ORDER BY o.created_at DESC`,
    [req.customer!.id]
  )
    .then(result => res.json(result.rows))
    .catch(() => res.status(500).json({ error: "Error al obtener pedidos" }));
});

// Obtener detalle de un pedido
app.get("/api/orders/:id", verifyToken, async (req: AuthRequest, res: Response) => {
  const orderId = parseInt((req.params as { id: string }).id);
  const orderResult = await pool.query(
    `SELECT o.*, COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
         FROM orders o
         LEFT JOIN order_items oi ON oi.order_id = o.id
         WHERE o.id = $1
         GROUP BY o.id`,
    [orderId]
  );
  if (orderResult.rows.length === 0)
    return res.status(404).json({ error: "Pedido no encontrado" });

  const itemsResult = await pool.query(
    `SELECT oi.quantity, oi.unit_price,
                (oi.quantity * oi.unit_price) AS subtotal,
                pp.nombre as name, pp.image_url
         FROM order_items oi
         LEFT JOIN perfume_precreado pp ON pp.id_perfume_precreado = oi.product_id
         WHERE oi.order_id = $1`,
    [orderId]
  );
  res.json({ ...orderResult.rows[0], items: itemsResult.rows });
});

//cambiar estado de un pedido (admin y employee)
app.patch("/api/orders/:id/status", verifyToken, requireRole("admin", "employee"), (req: AuthRequest, res: Response) => {
  const { status } = req.body as { status: string };
  const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Estado no válido" });
    return;
  }

  pool.query(
    "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
    [status, parseInt((req.params as { id: string }).id)]
  )
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
app.post("/api/orders", verifyToken, async (req: AuthRequest, res: Response) => {
  const { items, nombre, apellido, calle, ciudad, codigo_postal, pais } = req.body as {
    items: { productId: number; quantity: number; unitPrice: number; isCustom?: boolean }[];
    nombre: string; apellido: string; calle: string;
    ciudad: string; codigo_postal: string; pais: string;
  };

  if (!items || items.length === 0)
    return res.status(400).json({ error: "El carrito está vacío" });
  if (!nombre || !apellido || !calle || !ciudad || !codigo_postal || !pais)
    return res.status(400).json({ error: "Todos los campos de envío son obligatorios" });

  const address = `${calle}, ${ciudad}, ${codigo_postal}, ${pais}`;

  // Validar stock solo para productos no personalizados
  for (const item of items) {
    if (item.isCustom) continue;
    const check = await pool.query(
      "SELECT stock, nombre as name FROM perfume_precreado WHERE id_perfume_precreado = $1",
      [item.productId]
    );
    if (check.rows.length === 0)
      return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
    if (check.rows[0].stock < item.quantity)
      return res.status(409).json({
        error: `Stock insuficiente para "${check.rows[0].name}" (disponible: ${check.rows[0].stock})`
      });
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const customerId = req.customer!.id;

  pool.connect().then(async (client) => {
    const executeTransaction = async () => {
      await client.query("BEGIN");

      const orderResult = await client.query(
        `INSERT INTO orders (customer_id, status, address, nombre, apellido, ciudad, codigo_postal, pais)
         VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7) RETURNING *`,
        [customerId, address, nombre, apellido, ciudad, codigo_postal, pais]
      );
      const orderId = orderResult.rows[0].id;

      for (const item of items) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
          [orderId, item.productId, item.quantity, item.unitPrice]
        );
        if (!item.isCustom) {
          await client.query(
            "UPDATE perfume_precreado SET stock = stock - $1 WHERE id_perfume_precreado = $2",
            [item.quantity, item.productId]
          );
        }
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
app.get("/api/clock/status", verifyToken, (req: AuthRequest, res: Response) => {
  pool.query(
    `SELECT tipo FROM FICHAR_JORNADA
         WHERE id_usuario = $1
         ORDER BY fecha_hora DESC LIMIT 1`,
    [req.customer!.id]
  )
    .then(result => {
      const isClockedIn = result.rows.length > 0 && result.rows[0].tipo === "Entrada";
      res.json({ isClockedIn });
    })
    .catch(() => res.status(500).json({ error: "Error al consultar fichaje" }));
});

// Fichajes: registrar entrada/salida
app.post("/api/clock", verifyToken, (req: AuthRequest, res: Response) => {
  const { type } = req.body as { type: 'Entrada' | 'Salida' };
  pool.query(
    "INSERT INTO FICHAR_JORNADA (id_usuario, tipo) VALUES ($1, $2) RETURNING *",
    [req.customer!.id, type]
  )
    .then(result => res.json({ event: result.rows[0] }))
    .catch(() => res.status(500).json({ error: "Error al registrar fichaje" }));
});

// Fichajes: obtener histórico personal
app.get("/api/clock/history", verifyToken, (req: AuthRequest, res: Response) => {
  pool.query(
    "SELECT * FROM FICHAR_JORNADA WHERE id_usuario = $1 ORDER BY fecha_hora DESC LIMIT 200",
    [req.customer!.id]
  )
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
        await pool.query(
          "INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol, es_empleado) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          ["admin", adminEmail, hash, "12345678A", "Calle Principal 123", "Admin", true]
        );
        console.log("Admin seeded successfully with es_empleado.");
      } catch (err) {
        await pool.query(
          "INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol) VALUES ($1, $2, $3, $4, $5, $6)",
          ["admin", adminEmail, hash, "12345678A", "Calle Principal 123", "Admin"]
        );
        console.log("Admin seeded successfully without es_empleado.");
      }
    }
  } catch (err) {
    console.warn("Failed to seed admin in AWS DB:", err);
  }
};

const migrateColumnsIfMissing = async () => {
  try {
    await pool.query("ALTER TABLE frasco ADD COLUMN IF NOT EXISTS image_url TEXT");
    await pool.query("ALTER TABLE perfume_precreado ADD COLUMN IF NOT EXISTS image_url TEXT");
    await pool.query("ALTER TABLE perfume_precreado ADD COLUMN IF NOT EXISTS notas VARCHAR(100)");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS FICHAR_JORNADA (
        id_fichar SERIAL PRIMARY KEY,
        id_usuario INTEGER NOT NULL REFERENCES USUARIO(ID_USUARIO) ON DELETE CASCADE,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('Entrada', 'Salida')),
        fecha_hora TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        address TEXT,
        nombre TEXT,
        apellido TEXT,
        ciudad TEXT,
        codigo_postal TEXT,
        pais TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL
      )
    `);
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS nombre TEXT");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS apellido TEXT");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS ciudad TEXT");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS codigo_postal TEXT");
    await pool.query("ALTER TABLE orders ADD COLUMN IF NOT EXISTS pais TEXT");
    await pool.query("ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey");
  } catch (err) {
    console.warn("Column migration warning:", err);
  }
};

const seedStockIfMissing = async () => {
  try {
    const perfCheck = await pool.query("SELECT id_perfume_precreado FROM perfume_precreado LIMIT 1");
    if (perfCheck.rows.length === 0) {
      console.log("Seeding perfumes into AWS database...");
      for (const p of mockProducts) {
        await pool.query(
          "INSERT INTO perfume_precreado (nombre, descripcion, precio, stock, image_url, notas) VALUES ($1, $2, $3, $4, $5, $6)",
          [p.name, p.description, p.price, p.stock, p.image_url, p.notes]
        );
      }
    }

    const ingCheck = await pool.query("SELECT id_ingrediente FROM ingrediente LIMIT 1");
    if (ingCheck.rows.length === 0) {
      console.log("Seeding ingredients into AWS database...");
      for (const i of mockIngredients) {
        await pool.query(
          "INSERT INTO ingrediente (nombre, familia_olfativa, precio, stock) VALUES ($1, $2, $3, $4)",
          [i.name, i.family, i.price, i.stock]
        );
      }
    }

    const botCheck = await pool.query("SELECT id_frasco FROM frasco LIMIT 1");
    if (botCheck.rows.length === 0) {
      console.log("Seeding bottles into AWS database...");
      for (const b of mockBottles) {
        await pool.query(
          "INSERT INTO frasco (nombre, forma, descripcion, precio, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6)",
          [b.name, b.forma, b.description, b.price, b.stock, b.image_url]
        );
      }
    }
  } catch (err) {
    console.warn("Failed to seed stock in AWS DB:", err);
  }
};

// Administración: obtener todos los usuarios
app.get("/api/admin/users", verifyToken, requireRole("admin", "employee"), (req: AuthRequest, res: Response) => {
  // Disparar en segundo plano sin bloquear el request
  seedAdminIfMissing().catch(() => {});

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
app.delete("/api/admin/users/:id", verifyToken, requireRole("admin"), async (req: AuthRequest, res: Response) => {
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
    } catch (err) {
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
app.patch("/api/admin/users/:id/role", verifyToken, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const { role } = req.body as { role: string };
  const userId = parseInt((req.params as { id: string }).id);
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
app.patch("/api/admin/users/:id/status", verifyToken, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const { active } = req.body as { active: boolean };
  const userId = parseInt((req.params as { id: string }).id);
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


const IMG = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master";

// Datos completos para la siembra en AWS
const mockProducts = [
  { name: "Sauvage Elexir",    description: "A deep dive into dark woods and fiery amber. Liquid mystery.",                       notes: "Oud · Amber",          price: 189, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/sauvageElixir.jpeg` },
  { name: "Deep Water",        description: "The purity of iris dancing with the freshness of yuzu at dawn.",                     notes: "Iris · Yuzu",           price: 165, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/deepWater.jpeg` },
  { name: "Lost Cherrie",      description: "Enveloping warmth of vanilla and the resinous depth of sacred incense.",             notes: "Vanilla · Incense",     price: 175, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/lostCherrie.jpeg` },
  { name: "Paradoxe",          description: "The transparency of bergamot in perfect harmony with silky sandalwood.",             notes: "Bergamot · Sandalwood", price: 155, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/paradoxe.jpeg` },
  { name: "Creed Adventure",   description: "The mystery of saffron intertwined with the elegance of damp vetiver.",              notes: "Saffron · Vetiver",     price: 195, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/creedAdventure.jpeg` },
  { name: "Master of the Air", description: "The softness of cashmeran embracing May rose petals.",                               notes: "Cashmeran · Rose",      price: 170, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/masterOfTheAir.jpeg` },
  { name: "Night City",        description: "Ancient cedar and crisp cardamom under the full moon.",                              notes: "Cedar · Cardamom",      price: 180, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/cityNight.jpeg` },
  { name: "Rose Gold",         description: "The opulence of tonka bean melted with the freshness of peony.",                    notes: "Tonka Bean · Peony",    price: 185, stock: 20, image_url: `${IMG}/FOTOS-PERFUMES/roseGold.jpeg` },
];

const mockIngredients = [
  { name: "Bergamot",       family: "Citrus",   price: 22, stock: 100 }, { name: "Lemon",         family: "Citrus",   price: 15, stock: 100 },
  { name: "Bitter Orange",  family: "Citrus",   price: 18, stock: 100 }, { name: "Grapefruit",    family: "Citrus",   price: 16, stock: 100 },
  { name: "Mandarin",       family: "Citrus",   price: 17, stock: 100 }, { name: "Yuzu",          family: "Citrus",   price: 28, stock: 80  },
  { name: "Lime",           family: "Citrus",   price: 15, stock: 100 },
  { name: "Rose",           family: "Floral",   price: 45, stock: 80  }, { name: "Jasmine",       family: "Floral",   price: 40, stock: 80  },
  { name: "Tuberose",       family: "Floral",   price: 38, stock: 70  }, { name: "Iris",          family: "Floral",   price: 42, stock: 70  },
  { name: "Ylang Ylang",    family: "Floral",   price: 30, stock: 90  }, { name: "Orange Blossom",family: "Floral",   price: 32, stock: 90  },
  { name: "Magnolia",       family: "Floral",   price: 28, stock: 90  }, { name: "Peony",         family: "Floral",   price: 35, stock: 80  },
  { name: "Sandalwood",     family: "Woody",    price: 55, stock: 60  }, { name: "Cedar",         family: "Woody",    price: 35, stock: 80  },
  { name: "Vetiver",        family: "Woody",    price: 45, stock: 70  }, { name: "Oud",           family: "Woody",    price: 85, stock: 40  },
  { name: "Palo Santo",     family: "Woody",    price: 50, stock: 60  }, { name: "Guaiac Wood",   family: "Woody",    price: 40, stock: 70  },
  { name: "Birch",          family: "Woody",    price: 30, stock: 80  },
  { name: "Cinnamon",       family: "Spicy",    price: 22, stock: 100 }, { name: "Cardamom",      family: "Spicy",    price: 25, stock: 90  },
  { name: "Black Pepper",   family: "Spicy",    price: 20, stock: 100 }, { name: "Ginger",        family: "Spicy",    price: 18, stock: 100 },
  { name: "Nutmeg",         family: "Spicy",    price: 22, stock: 90  }, { name: "Saffron",       family: "Spicy",    price: 95, stock: 30  },
  { name: "Vanilla",        family: "Oriental", price: 40, stock: 80  }, { name: "Amber",         family: "Oriental", price: 55, stock: 60  },
  { name: "Incense",        family: "Oriental", price: 45, stock: 70  }, { name: "Myrrh",         family: "Oriental", price: 60, stock: 50  },
  { name: "Benzoin",        family: "Oriental", price: 48, stock: 60  }, { name: "Tonka Bean",    family: "Oriental", price: 52, stock: 60  },
  { name: "Mint",           family: "Fresh",    price: 18, stock: 100 }, { name: "Eucalyptus",    family: "Fresh",    price: 16, stock: 100 },
  { name: "Lavender",       family: "Fresh",    price: 22, stock: 100 }, { name: "Rosemary",      family: "Fresh",    price: 16, stock: 100 },
  { name: "Basil",          family: "Fresh",    price: 15, stock: 100 },
  { name: "Coffee",         family: "Gourmand", price: 25, stock: 90  }, { name: "Cocoa",         family: "Gourmand", price: 28, stock: 90  },
  { name: "Caramel",        family: "Gourmand", price: 22, stock: 90  }, { name: "Honey",         family: "Gourmand", price: 30, stock: 80  },
  { name: "White Musk",     family: "Musky",    price: 45, stock: 70  }, { name: "Cashmeran",     family: "Musky",    price: 60, stock: 50  },
  { name: "Ambroxan",       family: "Musky",    price: 70, stock: 40  },
];

const mockBottles = [
  { forma: "cilindro_continuo",  name: "Cylinder",         description: "Smooth tube where the cap has the same diameter as the body, creating an uninterrupted column.",    price: 30, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cilindro.png` },
  { forma: "cubo_puro",          name: "Rectangular Prism",description: "Heavy transparent crystal block with perfectly straight edges.",                                     price: 40, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cubo2.png` },
  { forma: "prisma_rectangular", name: "Cube",             description: "Slim and rectangular like a smartphone, with sober lines.",                                          price: 35, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cubo.png` },
  { forma: "canto_rodado",       name: "Square Block",     description: "Flat and asymmetric oval, inspired by a water-eroded stone.",                                        price: 32, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cuadrado.png` },
  { forma: "esfera_truncada",    name: "Egg",              description: "Perfect crystal ball with a flat base and integrated spray.",                                         price: 38, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/huevo.png` },
  { forma: "disco_vertical",     name: "Wall",             description: "Very short and wide cylinder that rests on its flat edge.",                                           price: 28, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/pared.png` },
  { forma: "tubo_ensayo",        name: "Test Tube",        description: "Elongated tubular shape with a rounded bottom on a subtle base.",                                    price: 33, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/probeta.png` },
  { forma: "columna_cuadrada",   name: "Column",           description: "Tall and slender four-sided monolith with architectural elegance.",                                  price: 45, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/columna.png` },
  { forma: "capsula",            name: "Capsule",          description: "Cylinder with both ends perfectly rounded.",                                                         price: 30, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/pildora.png` },
  { forma: "squircle",           name: "Lightbulb",        description: "Perfect transition between a square and a circle.",                                                  price: 36, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/bombilla.png` },
  { forma: "gota_aplanada",      name: "Tear",             description: "Teardrop shape completely flat on front and back.",                                                  price: 42, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/gota.png` },
  { forma: "cono_invertido",     name: "Inverted Cone",    description: "Narrow base that opens upwards, cut flat at the top.",                                               price: 34, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cono.png` },
  { forma: "bloque_escalonado",  name: "Stepped Block",    description: "Golden rectangle with a clean section on an upper corner.",                                          price: 38, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/escalera.png` },
  { forma: "cilindro_achatado",  name: "Disk",             description: "Wide, low crystal disk of robust proportions.",                                                      price: 29, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/palto.png` },
  { forma: "triangulo_plano",    name: "Sphere",           description: "Very thin triangular prism with mathematical aesthetics.",                                           price: 35, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/pelota.png` },
  { forma: "media_esfera",       name: "Half Sphere",      description: "Perfect dome on a flat circular base.",                                                              price: 37, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/bolamagica.png` },
  { forma: "cilindro_biselado",  name: "Beveled Cylinder", description: "Circular tube cut diagonally creating a clean ellipse.",                                             price: 40, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/cilindro2.png` },
  { forma: "toroide",            name: "Ring",             description: "Perfect crystal circle with a hole in the center.",                                                  price: 55, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/donut.png` },
  { forma: "piramide_truncada",  name: "Pyramid",          description: "Pyramid cut horizontally with a flat upper surface.",                                                price: 43, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/piramide.png` },
  { forma: "bloque_monolitico",  name: "Block",            description: "Opaque and matte rectangular prism without neck, pure form.",                                        price: 25, stock: 50, image_url: `${IMG}/FOTOS-PERFUME2/bloque.png` },
];

// Registro de nuevos usuarios
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { username, email, password, dni, address } = req.body as { 
    username: string; 
    email: string; 
    password: string;
    dni: string;
    address: string;
  };

  if (!username || !email || !password || !dni) {
    return res.status(400).json({ error: "nombre, email, password y dni son obligatorios" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();

  pool.query(
    "SELECT id_usuario FROM USUARIO WHERE LOWER(nombre) = LOWER($1) OR LOWER(email) = LOWER($2) OR dni = $3 LIMIT 1",
    [normalizedUsername, normalizedEmail, dni.trim()]
  )
    .then(check => {
      if (check.rows.length > 0) {
        res.status(409).json({ error: "El usuario, email o DNI ya existe" });
        return Promise.reject("Usuario existente");
      }
      return bcrypt.hash(password, 10);
    })
    .then(hash => pool.query(
      "INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol) VALUES ($1, $2, $3, $4, $5, 'User')",
      [normalizedUsername, normalizedEmail, hash, dni.trim(), address?.trim() || ""]
    ))
    .then(() => res.status(201).json({ message: "Usuario creado" }))
    .catch(error => {
      if (error === "Usuario existente") return;
      
      console.error("Register DB failed:", error);
      res.status(500).json({ error: "Error al registrar usuario en la base de datos de AWS" });
    });
});

// Login: devuelve cookie HttpOnly
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { identifier, password } = req.body as { identifier: string; password: string };

  if (!identifier || !password) {
    return res.status(400).json({ error: "Email/Nombre y password son obligatorios" });
  }

  const cleanIdentifier = identifier.trim();

  const handleSuccessfulLogin = (user: any) => {
    const token = jwt.sign(
      { id: user.id_usuario, username: user.nombre, role: user.rol, es_empleado: user.es_empleado },
      JWT_SECRET,
      { expiresIn: "2h" }
    );
    const isProd = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd,
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
app.get("/api/auth/me", verifyToken, (req: AuthRequest, res: Response) => {
  pool.query(
    "SELECT id_usuario as id, nombre as username, email, rol as role, es_empleado FROM USUARIO WHERE id_usuario = $1",
    [req.customer!.id]
  )
    .then(result => {
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Usuario no encontrado" });
      } else {
        res.json({ customer: result.rows[0] });
      }
    })
    .catch((err) => {
      console.error("Get user me failed:", err);
      res.status(500).json({ error: "Error al obtener la sesión de usuario" });
    });
});

// borra la cookie
app.post("/api/auth/logout", (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;
  res.clearCookie("token", { httpOnly: true, sameSite: isProd ? "none" : "lax", secure: isProd });
  res.json({ message: "Sesión cerrada" });
});

// Generación de imagen con Google Gemini
app.post("/api/generate-image", async (req: Request, res: Response) => {
  const { prompt, bottleImage } = req.body as {
    prompt?: string;
    bottleImage?: { data: string; mimeType: string } | null;
  };

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "El campo 'prompt' es obligatorio." });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) return res.status(500).json({ error: "GOOGLE_AI_KEY no configurada." });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const requestParts: any[] = [];
    if (bottleImage?.data) {
      requestParts.push({ inlineData: { mimeType: bottleImage.mimeType ?? "image/jpeg", data: bottleImage.data } });
    }
    requestParts.push({ text: prompt.trim() });

    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: requestParts }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    const rawText = await googleRes.text();
    let data: any;
    try { data = JSON.parse(rawText); }
    catch { return res.status(502).json({ error: "Google respondió sin JSON: " + rawText.slice(0, 150) }); }

    if (!googleRes.ok) {
      console.error("Google error:", JSON.stringify(data));
      return res.status(502).json({ error: data?.error?.message ?? `Error Google ${googleRes.status}` });
    }

    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.data);
    if (!imagePart) return res.status(502).json({ error: "Google no devolvió imagen. Partes: " + JSON.stringify(parts).slice(0, 150) });

    res.json({ image: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType ?? "image/jpeg" });
  } catch (err: any) {
    console.error("Error generando imagen:", err);
    res.status(500).json({ error: err?.message ?? "Error interno." });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  migrateColumnsIfMissing().catch(() => {});
});

// Manejador de errores global
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
