-- =============================================================
--  PURE ESSENCE — Esquema completo de base de datos
--  PostgreSQL (AWS RDS)
--  Generado: 2026-05-22
-- =============================================================

-- -------------------------------------------------------------
-- 0. Extensiones
-- -------------------------------------------------------------
-- (ninguna requerida actualmente)

-- -------------------------------------------------------------
-- 1. USUARIO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS USUARIO (
  id_usuario   SERIAL       PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  contrasenya  TEXT         NOT NULL,          -- bcrypt hash
  dni          VARCHAR(20)  NOT NULL UNIQUE,
  direccion    TEXT         DEFAULT '',
  rol          VARCHAR(20)  NOT NULL DEFAULT 'User',  -- 'Admin' | 'User'
  es_empleado  BOOLEAN      DEFAULT FALSE
);

-- -------------------------------------------------------------
-- 2. INGREDIENTE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingrediente (
  id_ingrediente   SERIAL       PRIMARY KEY,
  nombre           VARCHAR(100) NOT NULL,
  familia_olfativa VARCHAR(50),
  precio           DECIMAL(10,2) DEFAULT 0,
  stock            INTEGER       DEFAULT 0
);

-- -------------------------------------------------------------
-- 3. FRASCO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS frasco (
  id_frasco   SERIAL       PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  forma       VARCHAR(50),
  descripcion TEXT,
  precio      DECIMAL(10,2) DEFAULT 0,
  stock       INTEGER       DEFAULT 0,
  image_url   TEXT
);

-- -------------------------------------------------------------
-- 4. PERFUME_PRECREADO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS perfume_precreado (
  id_perfume_precreado SERIAL       PRIMARY KEY,
  nombre               VARCHAR(100) NOT NULL,
  descripcion          TEXT,
  precio               DECIMAL(10,2) DEFAULT 0,
  stock                INTEGER       DEFAULT 0,
  image_url            TEXT,
  notas                VARCHAR(100)
);

-- -------------------------------------------------------------
-- 5. PERFUME_PERSONALIZADO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PERFUME_PERSONALIZADO (
  id_perfume_personalizado SERIAL PRIMARY KEY,
  nombre                   VARCHAR(100),
  descripcion              TEXT,
  precio                   DECIMAL(10,2) DEFAULT 0
);

-- -------------------------------------------------------------
-- 6. INGREDIENTE_PERFUME_PERSONALIZADO  (relación N-M)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS INGREDIENTE_PERFUME_PERSONALIZADO (
  id_ingrediente           INTEGER NOT NULL REFERENCES ingrediente(id_ingrediente)          ON DELETE CASCADE,
  id_perfume_personalizado INTEGER NOT NULL REFERENCES PERFUME_PERSONALIZADO(id_perfume_personalizado) ON DELETE CASCADE,
  cantidad                 INTEGER DEFAULT 1,
  PRIMARY KEY (id_ingrediente, id_perfume_personalizado)
);

-- -------------------------------------------------------------
-- 7. PEDIDO  (esquema original del proyecto académico)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PEDIDO (
  id_pedido  SERIAL  PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
  fecha      TIMESTAMP DEFAULT NOW(),
  estado     VARCHAR(30) DEFAULT 'pendiente'
);

-- -------------------------------------------------------------
-- 8. PEDIDO_PERFUME_PRECREADO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PEDIDO_PERFUME_PRECREADO (
  id_pedido            INTEGER NOT NULL REFERENCES PEDIDO(id_pedido)                       ON DELETE CASCADE,
  id_perfume_precreado INTEGER NOT NULL REFERENCES perfume_precreado(id_perfume_precreado) ON DELETE CASCADE,
  cantidad             INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (id_pedido, id_perfume_precreado)
);

-- -------------------------------------------------------------
-- 9. PEDIDO_PERFUME_PERSONALIZADO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS PEDIDO_PERFUME_PERSONALIZADO (
  id_pedido                INTEGER NOT NULL REFERENCES PEDIDO(id_pedido)                                 ON DELETE CASCADE,
  id_perfume_personalizado INTEGER NOT NULL REFERENCES PERFUME_PERSONALIZADO(id_perfume_personalizado)   ON DELETE CASCADE,
  cantidad                 INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (id_pedido, id_perfume_personalizado)
);

-- -------------------------------------------------------------
-- 10. ENVIO
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ENVIO (
  id_envio        SERIAL  PRIMARY KEY,
  id_pedido       INTEGER NOT NULL REFERENCES PEDIDO(id_pedido) ON DELETE CASCADE,
  direccion       TEXT,
  estado_envio    VARCHAR(30) DEFAULT 'preparando',
  fecha_estimada  DATE
);

-- -------------------------------------------------------------
-- 11. FICHAR_JORNADA  (control de presencia de empleados)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS FICHAR_JORNADA (
  id_fichar  SERIAL  PRIMARY KEY,
  id_usuario INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
  tipo       VARCHAR(10) NOT NULL CHECK (tipo IN ('Entrada', 'Salida')),
  fecha_hora TIMESTAMP NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 12. ORDERS  (pedidos del checkout web — nuevo esquema)
--   pedido_id enlaza con PEDIDO del esquema académico
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id             SERIAL  PRIMARY KEY,
  customer_id    INTEGER,                         -- referencia blanda a USUARIO
  pedido_id      INTEGER,                         -- FK blanda a PEDIDO (esquema académico)
  status         TEXT    DEFAULT 'pending',       -- pending | processing | shipped | delivered | cancelled
  address        TEXT,                            -- dirección concatenada
  nombre         TEXT,
  apellido       TEXT,
  ciudad         TEXT,
  codigo_postal  TEXT,
  pais           TEXT,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 13. ORDER_ITEMS  (líneas de pedido del checkout web)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL         PRIMARY KEY,
  order_id    INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER        NOT NULL,            -- referencia blanda a perfume_precreado
  quantity    INTEGER        NOT NULL,
  unit_price  DECIMAL(10,2)  NOT NULL
);


-- =============================================================
--  DATOS DE SIEMBRA
-- =============================================================

-- -------------------------------------------------------------
-- Admin por defecto  (contraseña: 123)
-- Sólo se inserta si no existe todavía.
-- -------------------------------------------------------------
INSERT INTO USUARIO (nombre, email, contrasenya, dni, direccion, rol, es_empleado)
SELECT 'Moya',
       'moya@pureessence.com',
       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- hash bcrypt de "123"
       '12345678A',
       'Calle Principal 123',
       'Admin',
       TRUE
WHERE NOT EXISTS (
  SELECT 1 FROM USUARIO WHERE email = 'moya@pureessence.com'
);

-- -------------------------------------------------------------
-- Perfumes precreados
-- -------------------------------------------------------------
INSERT INTO perfume_precreado (nombre, descripcion, precio, stock, image_url, notas)
SELECT * FROM (VALUES
  ('Sauvage Elexir',    'A deep dive into dark woods and fiery amber. Liquid mystery.',                       189, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/sauvageElixir.jpeg',   'Oud · Amber'),
  ('Deep Water',        'The purity of iris dancing with the freshness of yuzu at dawn.',                     165, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/deepWater.jpeg',        'Iris · Yuzu'),
  ('Lost Cherrie',      'Enveloping warmth of vanilla and the resinous depth of sacred incense.',             175, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/lostCherrie.jpeg',     'Vanilla · Incense'),
  ('Paradoxe',          'The transparency of bergamot in perfect harmony with silky sandalwood.',             155, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/paradoxe.jpeg',        'Bergamot · Sandalwood'),
  ('Creed Adventure',   'The mystery of saffron intertwined with the elegance of damp vetiver.',              195, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/creedAdventure.jpeg',  'Saffron · Vetiver'),
  ('Master of the Air', 'The softness of cashmeran embracing May rose petals.',                               170, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/masterOfTheAir.jpeg', 'Cashmeran · Rose'),
  ('Night City',        'Ancient cedar and crisp cardamom under the full moon.',                              180, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/cityNight.jpeg',       'Cedar · Cardamom'),
  ('Rose Gold',         'The opulence of tonka bean melted with the freshness of peony.',                    185, 20, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUMES/roseGold.jpeg',        'Tonka Bean · Peony')
) AS t(nombre, descripcion, precio, stock, image_url, notas)
WHERE NOT EXISTS (SELECT 1 FROM perfume_precreado LIMIT 1);

-- -------------------------------------------------------------
-- Ingredientes
-- -------------------------------------------------------------
INSERT INTO ingrediente (nombre, familia_olfativa, precio, stock)
SELECT * FROM (VALUES
  -- Cítricos
  ('Bergamot',       'Citrus',    22, 100), ('Lemon',          'Citrus',    15, 100),
  ('Bitter Orange',  'Citrus',    18, 100), ('Grapefruit',     'Citrus',    16, 100),
  ('Mandarin',       'Citrus',    17, 100), ('Yuzu',           'Citrus',    28,  80),
  ('Lime',           'Citrus',    15, 100),
  -- Florales
  ('Rose',           'Floral',    45,  80), ('Jasmine',        'Floral',    40,  80),
  ('Tuberose',       'Floral',    38,  70), ('Iris',           'Floral',    42,  70),
  ('Ylang Ylang',    'Floral',    30,  90), ('Orange Blossom', 'Floral',    32,  90),
  ('Magnolia',       'Floral',    28,  90), ('Peony',          'Floral',    35,  80),
  -- Maderosos
  ('Sandalwood',     'Woody',     55,  60), ('Cedar',          'Woody',     35,  80),
  ('Vetiver',        'Woody',     45,  70), ('Oud',            'Woody',     85,  40),
  ('Palo Santo',     'Woody',     50,  60), ('Guaiac Wood',    'Woody',     40,  70),
  ('Birch',          'Woody',     30,  80),
  -- Especiados
  ('Cinnamon',       'Spicy',     22, 100), ('Cardamom',       'Spicy',     25,  90),
  ('Black Pepper',   'Spicy',     20, 100), ('Ginger',         'Spicy',     18, 100),
  ('Nutmeg',         'Spicy',     22,  90), ('Saffron',        'Spicy',     95,  30),
  -- Orientales
  ('Vanilla',        'Oriental',  40,  80), ('Amber',          'Oriental',  55,  60),
  ('Incense',        'Oriental',  45,  70), ('Myrrh',          'Oriental',  60,  50),
  ('Benzoin',        'Oriental',  48,  60), ('Tonka Bean',     'Oriental',  52,  60),
  -- Frescos
  ('Mint',           'Fresh',     18, 100), ('Eucalyptus',     'Fresh',     16, 100),
  ('Lavender',       'Fresh',     22, 100), ('Rosemary',       'Fresh',     16, 100),
  ('Basil',          'Fresh',     15, 100),
  -- Gourmand
  ('Coffee',         'Gourmand',  25,  90), ('Cocoa',          'Gourmand',  28,  90),
  ('Caramel',        'Gourmand',  22,  90), ('Honey',          'Gourmand',  30,  80),
  -- Almizclados
  ('White Musk',     'Musky',     45,  70), ('Cashmeran',      'Musky',     60,  50),
  ('Ambroxan',       'Musky',     70,  40)
) AS t(nombre, familia_olfativa, precio, stock)
WHERE NOT EXISTS (SELECT 1 FROM ingrediente LIMIT 1);

-- -------------------------------------------------------------
-- Frascos
-- -------------------------------------------------------------
INSERT INTO frasco (forma, nombre, descripcion, precio, stock, image_url)
SELECT * FROM (VALUES
  ('cilindro_continuo',  'Cylinder',          'Smooth tube where the cap has the same diameter as the body, creating an uninterrupted column.',    30, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cilindro.png'),
  ('cubo_puro',          'Rectangular Prism', 'Heavy transparent crystal block with perfectly straight edges.',                                     40, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cubo2.png'),
  ('prisma_rectangular', 'Cube',              'Slim and rectangular like a smartphone, with sober lines.',                                          35, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cubo.png'),
  ('canto_rodado',       'Square Block',      'Flat and asymmetric oval, inspired by a water-eroded stone.',                                        32, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cuadrado.png'),
  ('esfera_truncada',    'Egg',               'Perfect crystal ball with a flat base and integrated spray.',                                         38, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/huevo.png'),
  ('disco_vertical',     'Wall',              'Very short and wide cylinder that rests on its flat edge.',                                           28, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/pared.png'),
  ('tubo_ensayo',        'Test Tube',         'Elongated tubular shape with a rounded bottom on a subtle base.',                                    33, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/probeta.png'),
  ('columna_cuadrada',   'Column',            'Tall and slender four-sided monolith with architectural elegance.',                                  45, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/columna.png'),
  ('capsula',            'Capsule',           'Cylinder with both ends perfectly rounded.',                                                         30, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/pildora.png'),
  ('squircle',           'Lightbulb',         'Perfect transition between a square and a circle.',                                                  36, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/bombilla.png'),
  ('gota_aplanada',      'Tear',              'Teardrop shape completely flat on front and back.',                                                  42, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/gota.png'),
  ('cono_invertido',     'Inverted Cone',     'Narrow base that opens upwards, cut flat at the top.',                                               34, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cono.png'),
  ('bloque_escalonado',  'Stepped Block',     'Golden rectangle with a clean section on an upper corner.',                                          38, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/escalera.png'),
  ('cilindro_achatado',  'Disk',              'Wide, low crystal disk of robust proportions.',                                                      29, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/palto.png'),
  ('triangulo_plano',    'Sphere',            'Very thin triangular prism with mathematical aesthetics.',                                           35, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/pelota.png'),
  ('media_esfera',       'Half Sphere',       'Perfect dome on a flat circular base.',                                                              37, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/bolamagica.png'),
  ('cilindro_biselado',  'Beveled Cylinder',  'Circular tube cut diagonally creating a clean ellipse.',                                             40, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/cilindro2.png'),
  ('toroide',            'Ring',              'Perfect crystal circle with a hole in the center.',                                                  55, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/donut.png'),
  ('piramide_truncada',  'Pyramid',           'Pyramid cut horizontally with a flat upper surface.',                                                43, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/piramide.png'),
  ('bloque_monolitico',  'Block',             'Opaque and matte rectangular prism without neck, pure form.',                                        25, 50, 'https://raw.githubusercontent.com/diegom0yacampo/pureessence-images/master/FOTOS-PERFUME2/bloque.png')
) AS t(forma, nombre, descripcion, precio, stock, image_url)
WHERE NOT EXISTS (SELECT 1 FROM frasco LIMIT 1);


-- =============================================================
--  MIGRACIONES DE COMPATIBILIDAD
--  (se ejecutan con IF NOT EXISTS / TRY-CATCH en el backend,
--   pero se incluyen aquí para bases de datos nuevas o reseteos)
-- =============================================================

ALTER TABLE frasco              ADD COLUMN IF NOT EXISTS image_url  TEXT;
ALTER TABLE perfume_precreado   ADD COLUMN IF NOT EXISTS image_url  TEXT;
ALTER TABLE perfume_precreado   ADD COLUMN IF NOT EXISTS notas      VARCHAR(100);
ALTER TABLE USUARIO             ADD COLUMN IF NOT EXISTS es_empleado BOOLEAN DEFAULT FALSE;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id   INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pedido_id     INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status        TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address       TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nombre        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS apellido      TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS ciudad        TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS codigo_postal TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS pais          TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at    TIMESTAMP DEFAULT NOW();

-- Eliminar la FK de order_items → perfume_precreado si existía (los productos personalizados
-- no tienen fila en perfume_precreado, así que product_id es una referencia blanda)
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Quitar todos los NOT NULL en orders excepto id
-- (necesario si la tabla fue creada por @base44/sdk con un schema diferente)
DO $$
DECLARE col RECORD;
BEGIN
  FOR col IN
    SELECT column_name FROM information_schema.columns
    WHERE  table_name  = 'orders'
      AND  table_schema = 'public'
      AND  is_nullable  = 'NO'
      AND  column_name != 'id'
  LOOP
    EXECUTE format('ALTER TABLE orders ALTER COLUMN %I DROP NOT NULL', col.column_name);
  END LOOP;
END $$;
