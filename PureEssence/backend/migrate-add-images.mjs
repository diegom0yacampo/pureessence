import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

const BASE = "https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master";

const BOTTLES = [
  { forma: "cilindro_continuo", name: "Cylinder",         desc: "Smooth tube where the cap has the same diameter as the body, creating an uninterrupted column.",    price: 30, image: `${BASE}/FOTOS-PERFUME2/cilindro.png` },
  { forma: "cubo_puro",         name: "Rectangular Prism",desc: "Heavy transparent crystal block with perfectly straight edges.",                                     price: 40, image: `${BASE}/FOTOS-PERFUME2/cubo2.png` },
  { forma: "prisma_rectangular",name: "Cube",             desc: "Slim and rectangular like a smartphone, with sober lines.",                                          price: 35, image: `${BASE}/FOTOS-PERFUME2/cubo.png` },
  { forma: "canto_rodado",      name: "Square Block",     desc: "Flat and asymmetric oval, inspired by a water-eroded stone.",                                        price: 32, image: `${BASE}/FOTOS-PERFUME2/cuadrado.png` },
  { forma: "esfera_truncada",   name: "Egg",              desc: "Perfect crystal ball with a flat base and integrated spray.",                                         price: 38, image: `${BASE}/FOTOS-PERFUME2/huevo.png` },
  { forma: "disco_vertical",    name: "Wall",             desc: "Very short and wide cylinder that rests on its flat edge.",                                           price: 28, image: `${BASE}/FOTOS-PERFUME2/pared.png` },
  { forma: "tubo_ensayo",       name: "Test Tube",        desc: "Elongated tubular shape with a rounded bottom on a subtle base.",                                    price: 33, image: `${BASE}/FOTOS-PERFUME2/probeta.png` },
  { forma: "columna_cuadrada",  name: "Column",           desc: "Tall and slender four-sided monolith with architectural elegance.",                                  price: 45, image: `${BASE}/FOTOS-PERFUME2/columna.png` },
  { forma: "capsula",           name: "Capsule",          desc: "Cylinder with both ends perfectly rounded.",                                                         price: 30, image: `${BASE}/FOTOS-PERFUME2/pildora.png` },
  { forma: "squircle",          name: "Lightbulb",        desc: "Perfect transition between a square and a circle.",                                                  price: 36, image: `${BASE}/FOTOS-PERFUME2/bombilla.png` },
  { forma: "gota_aplanada",     name: "Tear",             desc: "Teardrop shape completely flat on front and back.",                                                  price: 42, image: `${BASE}/FOTOS-PERFUME2/gota.png` },
  { forma: "cono_invertido",    name: "Inverted Cone",    desc: "Narrow base that opens upwards, cut flat at the top.",                                               price: 34, image: `${BASE}/FOTOS-PERFUME2/cono.png` },
  { forma: "bloque_escalonado", name: "Stepped Block",    desc: "Golden rectangle with a clean section on an upper corner.",                                          price: 38, image: `${BASE}/FOTOS-PERFUME2/escalera.png` },
  { forma: "cilindro_achatado", name: "Disk",             desc: "Wide, low crystal disk of robust proportions.",                                                      price: 29, image: `${BASE}/FOTOS-PERFUME2/palto.png` },
  { forma: "triangulo_plano",   name: "Sphere",           desc: "Very thin triangular prism with mathematical aesthetics.",                                           price: 35, image: `${BASE}/FOTOS-PERFUME2/pelota.png` },
  { forma: "media_esfera",      name: "Half Sphere",      desc: "Perfect dome on a flat circular base.",                                                              price: 37, image: `${BASE}/FOTOS-PERFUME2/bolamagica.png` },
  { forma: "cilindro_biselado", name: "Beveled Cylinder", desc: "Circular tube cut diagonally creating a clean ellipse.",                                             price: 40, image: `${BASE}/FOTOS-PERFUME2/cilindro2.png` },
  { forma: "toroide",           name: "Ring",             desc: "Perfect crystal circle with a hole in the center.",                                                  price: 55, image: `${BASE}/FOTOS-PERFUME2/donut.png` },
  { forma: "piramide_truncada", name: "Pyramid",          desc: "Pyramid cut horizontally with a flat upper surface.",                                                price: 43, image: `${BASE}/FOTOS-PERFUME2/piramide.png` },
  { forma: "bloque_monolitico", name: "Block",            desc: "Opaque and matte rectangular prism without neck, pure form.",                                        price: 25, image: `${BASE}/FOTOS-PERFUME2/bloque.png` },
];

const PRODUCTS = [
  { name: "Sauvage Elexir",     desc: "A deep dive into dark woods and fiery amber. Liquid mystery.",                          notes: "Oud · Amber",             price: 189, image: `${BASE}/FOTOS-PERFUMES/sauvageElixir.jpeg` },
  { name: "Deep Water",         desc: "The purity of iris dancing with the freshness of yuzu at dawn.",                        notes: "Iris · Yuzu",              price: 165, image: `${BASE}/FOTOS-PERFUMES/deepWater.jpeg` },
  { name: "Lost Cherrie",       desc: "Enveloping warmth of vanilla and the resinous depth of sacred incense.",                notes: "Vanilla · Incense",        price: 175, image: `${BASE}/FOTOS-PERFUMES/lostCherrie.jpeg` },
  { name: "Paradoxe",           desc: "The transparency of bergamot in perfect harmony with silky sandalwood.",                notes: "Bergamot · Sandalwood",    price: 155, image: `${BASE}/FOTOS-PERFUMES/paradoxe.jpeg` },
  { name: "Creed Adventure",    desc: "The mystery of saffron intertwined with the elegance of damp vetiver.",                 notes: "Saffron · Vetiver",        price: 195, image: `${BASE}/FOTOS-PERFUMES/creedAdventure.jpeg` },
  { name: "Master of the Air",  desc: "The softness of cashmeran embracing May rose petals.",                                  notes: "Cashmeran · Rose",         price: 170, image: `${BASE}/FOTOS-PERFUMES/masterOfTheAir.jpeg` },
  { name: "Night City",         desc: "Ancient cedar and crisp cardamom under the full moon.",                                 notes: "Cedar · Cardamom",         price: 180, image: `${BASE}/FOTOS-PERFUMES/cityNight.jpeg` },
  { name: "Rose Gold",          desc: "The opulence of tonka bean melted with the freshness of peony.",                       notes: "Tonka Bean · Peony",       price: 185, image: `${BASE}/FOTOS-PERFUMES/roseGold.jpeg` },
];

const INGREDIENTS = [
  // Citrus
  { name: "Bergamot",       family: "Citrus",    price: 22, stock: 100 },
  { name: "Lemon",          family: "Citrus",    price: 15, stock: 100 },
  { name: "Bitter Orange",  family: "Citrus",    price: 18, stock: 100 },
  { name: "Grapefruit",     family: "Citrus",    price: 16, stock: 100 },
  { name: "Mandarin",       family: "Citrus",    price: 17, stock: 100 },
  { name: "Yuzu",           family: "Citrus",    price: 28, stock: 80  },
  { name: "Lime",           family: "Citrus",    price: 15, stock: 100 },
  // Floral
  { name: "Rose",           family: "Floral",    price: 45, stock: 80  },
  { name: "Jasmine",        family: "Floral",    price: 40, stock: 80  },
  { name: "Tuberose",       family: "Floral",    price: 38, stock: 70  },
  { name: "Iris",           family: "Floral",    price: 42, stock: 70  },
  { name: "Ylang Ylang",    family: "Floral",    price: 30, stock: 90  },
  { name: "Orange Blossom", family: "Floral",    price: 32, stock: 90  },
  { name: "Magnolia",       family: "Floral",    price: 28, stock: 90  },
  { name: "Peony",          family: "Floral",    price: 35, stock: 80  },
  // Woody
  { name: "Sandalwood",     family: "Woody",     price: 55, stock: 60  },
  { name: "Cedar",          family: "Woody",     price: 35, stock: 80  },
  { name: "Vetiver",        family: "Woody",     price: 45, stock: 70  },
  { name: "Oud",            family: "Woody",     price: 85, stock: 40  },
  { name: "Palo Santo",     family: "Woody",     price: 50, stock: 60  },
  { name: "Guaiac Wood",    family: "Woody",     price: 40, stock: 70  },
  { name: "Birch",          family: "Woody",     price: 30, stock: 80  },
  // Spicy
  { name: "Cinnamon",       family: "Spicy",     price: 22, stock: 100 },
  { name: "Cardamom",       family: "Spicy",     price: 25, stock: 90  },
  { name: "Black Pepper",   family: "Spicy",     price: 20, stock: 100 },
  { name: "Ginger",         family: "Spicy",     price: 18, stock: 100 },
  { name: "Nutmeg",         family: "Spicy",     price: 22, stock: 90  },
  { name: "Saffron",        family: "Spicy",     price: 95, stock: 30  },
  // Oriental
  { name: "Vanilla",        family: "Oriental",  price: 40, stock: 80  },
  { name: "Amber",          family: "Oriental",  price: 55, stock: 60  },
  { name: "Incense",        family: "Oriental",  price: 45, stock: 70  },
  { name: "Myrrh",          family: "Oriental",  price: 60, stock: 50  },
  { name: "Benzoin",        family: "Oriental",  price: 48, stock: 60  },
  { name: "Tonka Bean",     family: "Oriental",  price: 52, stock: 60  },
  // Fresh
  { name: "Mint",           family: "Fresh",     price: 18, stock: 100 },
  { name: "Eucalyptus",     family: "Fresh",     price: 16, stock: 100 },
  { name: "Lavender",       family: "Fresh",     price: 22, stock: 100 },
  { name: "Rosemary",       family: "Fresh",     price: 16, stock: 100 },
  { name: "Basil",          family: "Fresh",     price: 15, stock: 100 },
  // Gourmand
  { name: "Coffee",         family: "Gourmand",  price: 25, stock: 90  },
  { name: "Cocoa",          family: "Gourmand",  price: 28, stock: 90  },
  { name: "Caramel",        family: "Gourmand",  price: 22, stock: 90  },
  { name: "Honey",          family: "Gourmand",  price: 30, stock: 80  },
  // Musky
  { name: "White Musk",     family: "Musky",     price: 45, stock: 70  },
  { name: "Cashmeran",      family: "Musky",     price: 60, stock: 50  },
  { name: "Ambroxan",       family: "Musky",     price: 70, stock: 40  },
];

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting migration...");
    await client.query("BEGIN");

    // 1. Add new columns if they don't exist
    await client.query("ALTER TABLE frasco ADD COLUMN IF NOT EXISTS image_url TEXT");
    await client.query("ALTER TABLE perfume_precreado ADD COLUMN IF NOT EXISTS image_url TEXT");
    await client.query("ALTER TABLE perfume_precreado ADD COLUMN IF NOT EXISTS notas VARCHAR(100)");
    console.log("✓ Columns added");

    // 2. Clear old mock data (safe delete by known IDs)
    await client.query("DELETE FROM frasco WHERE id_frasco IN (201, 202, 203)");
    await client.query("DELETE FROM perfume_precreado WHERE id_perfume_precreado IN (1, 2, 3, 4)");
    await client.query("DELETE FROM ingrediente WHERE id_ingrediente IN (101, 102, 103, 104)");
    console.log("✓ Old mock data removed");

    // 3. Insert all bottles (20) with explicit IDs
    for (let idx = 0; idx < BOTTLES.length; idx++) {
      const b = BOTTLES[idx];
      const id = idx + 1;
      await client.query(
        `INSERT INTO frasco (id_frasco, nombre, forma, descripcion, precio, stock, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_frasco) DO UPDATE SET nombre=$2, forma=$3, descripcion=$4, precio=$5, image_url=$7`,
        [id, b.name, b.forma, b.desc, b.price, 50, b.image]
      );
    }
    await client.query(`SELECT setval(pg_get_serial_sequence('frasco','id_frasco'), ${BOTTLES.length})`);
    console.log(`✓ ${BOTTLES.length} bottles inserted`);

    // 4. Insert all products (8) with explicit IDs
    for (let idx = 0; idx < PRODUCTS.length; idx++) {
      const p = PRODUCTS[idx];
      const id = idx + 1;
      await client.query(
        `INSERT INTO perfume_precreado (id_perfume_precreado, nombre, descripcion, precio, stock, image_url, notas)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_perfume_precreado) DO UPDATE SET nombre=$2, descripcion=$3, precio=$4, image_url=$6, notas=$7`,
        [id, p.name, p.desc, p.price, 20, p.image, p.notes]
      );
    }
    await client.query(`SELECT setval(pg_get_serial_sequence('perfume_precreado','id_perfume_precreado'), ${PRODUCTS.length})`);
    console.log(`✓ ${PRODUCTS.length} products inserted`);

    // 5. Insert all ingredients (42) with explicit IDs
    for (let idx = 0; idx < INGREDIENTS.length; idx++) {
      const i = INGREDIENTS[idx];
      const id = idx + 1;
      await client.query(
        `INSERT INTO ingrediente (id_ingrediente, nombre, familia_olfativa, precio, stock)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id_ingrediente) DO UPDATE SET nombre=$2, familia_olfativa=$3, precio=$4`,
        [id, i.name, i.family, i.price, i.stock]
      );
    }
    await client.query(`SELECT setval(pg_get_serial_sequence('ingrediente','id_ingrediente'), ${INGREDIENTS.length})`);
    console.log(`✓ ${INGREDIENTS.length} ingredients inserted`);

    await client.query("COMMIT");
    console.log("\n✅ Migration completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
