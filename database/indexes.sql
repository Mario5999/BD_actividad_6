-- Índice para búsquedas frecuentes por producto en el detalle de órdenes
DROP INDEX IF EXISTS idx_orden_detalles_producto_id;
CREATE INDEX idx_orden_detalles_producto_id ON orden_detalles(producto_id);

-- Índice para consultas que buscan todas las líneas de una orden
-- (Nota: la UNIQUE(orden_id, producto_id) crea un índice que puede cubrir este caso,
--  pero un índice separado en orden_id puede mejorar algunos planes de consulta)
DROP INDEX IF EXISTS idx_orden_detalles_orden_id;
CREATE INDEX idx_orden_detalles_orden_id ON orden_detalles(orden_id);

-- Índice para consultas por fecha en órdenes (p.ej. pedidos recientes / ventas diarias)
DROP INDEX IF EXISTS idx_ordenes_created_at;
CREATE INDEX idx_ordenes_created_at ON ordenes(created_at);

-- Índice compuesto para status y fecha en órdenes (útil para filtros por status + ordenación por fecha)
DROP INDEX IF EXISTS idx_ordenes_status_createdat;
CREATE INDEX idx_ordenes_status_createdat ON ordenes(status, created_at);

-- Índice para consultas por categoría en productos (si no existe ya)
DROP INDEX IF EXISTS idx_productos_categoria_id;
CREATE INDEX idx_productos_categoria_id ON productos(categoria_id);

-- Índice para consultas que filtran por stock (p.ej. reports de stock bajo)
DROP INDEX IF EXISTS idx_productos_stock;
CREATE INDEX idx_productos_stock ON productos(stock);

-- Índice para búsquedas por código o nombre (si se realizan búsquedas textuales frecuentes)
DROP INDEX IF EXISTS idx_productos_nombre;
CREATE INDEX idx_productos_nombre ON productos(nombre);


