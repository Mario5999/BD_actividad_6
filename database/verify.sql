
\echo '============================================'
\echo 'VERIFICACIÓN DE BASE DE DATOS'
\echo '============================================'

-- ============================================
-- 1. Ranking de Productos Más Vendidos 
-- ============================================

\echo ''
\echo '--- Ranking de Productos Más Vendidos ---'

SELECT * FROM vw_ranking_productos WHERE ranking_ventas <= 10;
SELECT producto_nombre, porcentaje_ingresos FROM vw_ranking_productos WHERE porcentaje_ingresos > 5;

-- ============================================
-- 2. Resumen por cliente
-- ============================================

\echo ''
\echo '--- Resumen por cliente ---'

SELECT * FROM clientes_resumen LIMIT 20;



-- ============================================
-- 3. Productos populares
-- ============================================

\echo ''
\echo '--- Productos populares ---'

SELECT * FROM productos_populares ORDER BY total_vendido DESC LIMIT 10;



-- ============================================
-- 4. Ventas diarias
-- ============================================

\echo ''
\echo '--- Ventas diarias ---'

SELECT * FROM ventas_diarias ORDER BY dia DESC LIMIT 30;

-- ============================================
-- 5. Valor por categoría
-- ============================================

SELECT * FROM categoria_valor ORDER BY total_categoria DESC LIMIT 20;

\echo ''
\echo '============================================'
\echo 'FIN DE VERIFICACIÓN'
\echo '============================================'

-- ============================================
-- Para ejecutar: \i db/verify.sql
-- ============================================
