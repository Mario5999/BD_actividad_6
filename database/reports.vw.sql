-- VIEW 1: Ranking de Productos Más Vendidos 
/*
QUÉ DEVUELVE: Productos ordenados por ventas con ranking y métricas acumulativas
GRAIN: Una fila por producto
MÉTRICAS:
  - unidades_vendidas: Total de unidades vendidas
  - ingresos_totales: Ingresos generados
  - num_ordenes: Cantidad de órdenes que incluyen el producto
  - ranking_ventas: Posición del producto por ingresos
  - porcentaje_ingresos: Porcentaje que representa del total
  - ingresos_acumulados: Suma acumulativa de ingresos
GROUP BY/HAVING: Agrupa por producto y filtra productos con al menos 1 venta
WINDOW FUNCTION: Usa ROW_NUMBER y SUM OVER para ranking y acumulados
VERIFY:
  SELECT * FROM vw_ranking_productos WHERE ranking_ventas <= 10;
  SELECT producto_nombre, porcentaje_ingresos FROM vw_ranking_productos WHERE porcentaje_ingresos > 5;
*/
CREATE OR REPLACE VIEW vw_ranking_productos AS
WITH producto_ventas AS (
    SELECT 
        p.id AS producto_id,
        p.codigo AS producto_codigo,
        p.nombre AS producto_nombre,
        c.nombre AS categoria_nombre,
        SUM(od.cantidad) AS unidades_vendidas,
        SUM(od.subtotal) AS ingresos_totales,
        COUNT(DISTINCT od.orden_id) AS num_ordenes,
        AVG(od.precio_unitario) AS precio_promedio
    FROM productos p
    INNER JOIN orden_detalles od ON p.id = od.producto_id
    INNER JOIN categorias c ON p.categoria_id = c.id
    GROUP BY p.id, p.codigo, p.nombre, c.nombre
    HAVING SUM(od.cantidad) > 0
)
SELECT 
    producto_id,
    producto_codigo,
    producto_nombre,
    categoria_nombre,
    unidades_vendidas,
    ROUND(ingresos_totales, 2) AS ingresos_totales,
    num_ordenes,
    ROUND(precio_promedio, 2) AS precio_promedio,
    ROW_NUMBER() OVER (ORDER BY ingresos_totales DESC) AS ranking_ventas,
    ROUND(
        (ingresos_totales * 100.0 / SUM(ingresos_totales) OVER ()),
        2
    ) AS porcentaje_ingresos,
    ROUND(
        SUM(ingresos_totales) OVER (ORDER BY ingresos_totales DESC),
        2
    ) AS ingresos_acumulados
FROM producto_ventas
ORDER BY ranking_ventas;


-- VIEW 2: Resumen por cliente
/*
QUÉ DEVUELVE: Para cada cliente, métricas de pedidos y gasto total
GRAIN: Una fila por cliente
MÉTRICAS:
    - num_pedidos: número de pedidos del cliente
    - total_gastado: suma de los totales de sus pedidos
    - ticket_promedio: promedio de gasto por pedido
POR QUÉ GROUP BY/HAVING: Se agregan pedidos por cliente (una fila por cliente)
VERIFY:
    SELECT * FROM clientes_resumen LIMIT 20;
    SELECT nombre, ticket_promedio FROM clientes_resumen ORDER BY ticket_promedio DESC LIMIT 10;
*/
CREATE OR REPLACE VIEW clientes_resumen AS
SELECT u.id AS id_cliente,
       u.nombre,
       COUNT(o.id) AS num_pedidos, 
       ROUND(COALESCE(SUM(o.total),0), 2) AS total_gastado,
       ROUND(
         COALESCE(SUM(o.total),0) / NULLIF(COUNT(o.id),0),
         2
       ) AS ticket_promedio
FROM usuarios u
LEFT JOIN ordenes o ON u.id = o.usuario_id
GROUP BY u.id, u.nombre;


-- VIEW 3: Productos populares
/*
QUÉ DEVUELVE: Productos con mayor cantidad vendida
GRAIN: Una fila por producto
MÉTRICAS:
    - total_vendido: suma de cantidades vendidas
    - porcentaje_total: % del total vendido (participación)
POR QUÉ GROUP BY/HAVING: Se agregan ventas por producto y se filtran productos sin ventas
VERIFY:
    SELECT * FROM productos_populares ORDER BY total_vendido DESC LIMIT 10;
    SELECT nombre, porcentaje_total FROM productos_populares ORDER BY porcentaje_total DESC LIMIT 10;
*/
CREATE OR REPLACE VIEW productos_populares AS
SELECT p.id,
       p.nombre, 
       SUM(od.cantidad) AS total_vendido,
       ROUND(
         SUM(od.cantidad) * 100.0 / NULLIF(SUM(SUM(od.cantidad)) OVER (), 0),
         2
       ) AS porcentaje_total
FROM productos p
JOIN orden_detalles od ON p.id = od.producto_id
GROUP BY p.id, p.nombre
HAVING SUM(od.cantidad) > 0;


-- VIEW 4: Ventas diarias
/*
QUÉ DEVUELVE: Totales de pedidos y monto por día
GRAIN: Una fila por día
MÉTRICAS:
    - num_pedidos: cantidad de pedidos en el día
    - total_dia: suma de totales del día
    - ticket_promedio_dia: promedio por pedido del día
POR QUÉ GROUP BY/HAVING: Se agregan pedidos por fecha para una fila por día
VERIFY:
    SELECT * FROM ventas_diarias ORDER BY dia DESC LIMIT 30;
    SELECT dia, ticket_promedio_dia FROM ventas_diarias ORDER BY dia DESC LIMIT 7;
*/
CREATE OR REPLACE VIEW ventas_diarias AS
SELECT DATE(o.created_at) AS dia,
       COUNT(*) AS num_pedidos, 
       ROUND(COALESCE(SUM(o.total),0), 2) AS total_dia,
       ROUND(
         COALESCE(SUM(o.total),0) / NULLIF(COUNT(*),0),
         2
       ) AS ticket_promedio_dia
FROM ordenes o
GROUP BY DATE(o.created_at)
ORDER BY dia DESC;


-- VIEW 5: Valor por categoría
/*
QUÉ DEVUELVE: Valor total vendido por categoría (cantidad * precio unitario)
GRAIN: Una fila por categoría
MÉTRICAS:
    - total_categoria: suma de cantidad*precio_unitario por categoría
    - porcentaje_total: participación del total por categoría
JOINs: Categorías -> Productos -> Líneas de pedido
POR QUÉ GROUP BY/HAVING: Se agregan ventas por categoría (una fila por categoría)
VERIFY:
    SELECT * FROM categoria_valor ORDER BY total_categoria DESC LIMIT 20;
    SELECT categoria, porcentaje_total FROM categoria_valor ORDER BY porcentaje_total DESC LIMIT 10;
*/
CREATE OR REPLACE VIEW categoria_valor AS
SELECT cat.id AS id_categoria,
       cat.nombre AS categoria, 
       ROUND(COALESCE(SUM(od.cantidad * od.precio_unitario),0), 2) AS total_categoria,
       ROUND(
         COALESCE(SUM(od.cantidad * od.precio_unitario),0) * 100.0
         / NULLIF(SUM(SUM(od.cantidad * od.precio_unitario)) OVER (), 0),
         2
       ) AS porcentaje_total
FROM categorias cat
LEFT JOIN productos p ON p.categoria_id = cat.id
LEFT JOIN orden_detalles od ON od.producto_id = p.id
GROUP BY cat.id, cat.nombre;



