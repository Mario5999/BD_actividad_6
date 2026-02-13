CREATE ROLE app_user LOGIN PASSWORD 'app_password';


-- Permitir conexión a la base de datos
GRANT CONNECT ON DATABASE actividad_db TO app_user;


-- Permitir acceso al schema
GRANT USAGE ON SCHEMA public TO app_user;


-- Permisos wiews
GRANT SELECT ON vw_ranking_productos TO app_user;
GRANT SELECT ON clientes_resumen TO app_user;
GRANT SELECT ON productos_populares TO app_user;
GRANT SELECT ON ventas_diarias TO app_user;
GRANT SELECT ON categoria_valor TO app_user;

-- Negar permisos en tablas 
REVOKE SELECT ON categorias FROM app_user;
REVOKE SELECT ON usuarios FROM app_user;
REVOKE SELECT ON productos FROM app_user;
REVOKE SELECT ON ordenes FROM app_user;
REVOKE SELECT ON orden_detalles FROM app_user;
