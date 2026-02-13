#!/bin/bash
set -e

echo "Ejecutando scripts SQL de inicialización..."

# El script se ejecuta como usuario postgres automáticamente
# Usar socket Unix (no TCP/IP) durante la inicialización

# 1. Schema
echo "1. Creando schema..."
psql -U postgres -d actividad_db -f /scripts/schema.sql

# 2. Migrate
echo "2. Ejecutando migraciones..."
psql -U postgres -d actividad_db -f /scripts/migrate.sql

# 3. Seed (datos iniciales)
echo "3. Cargando datos..."
psql -U postgres -d actividad_db -f /scripts/seed.sql

# 4. Índices
echo "4. Creando índices..."
psql -U postgres -d actividad_db -f /scripts/indexes.sql

# 5. Vistas (reports) - ANTES de roles
echo "5. Creando vistas..."
psql -U postgres -d actividad_db -f /scripts/reports.vw.sql

# 6. Roles (crear app_user y dar permisos)
echo "6. Creando roles..."
psql -U postgres -d actividad_db -f /scripts/roles.sql

# 7. Verificación
echo "7. Verificando BD..."
psql -U postgres -d actividad_db -f /scripts/verify.sql

echo "✅ Inicialización completada exitosamente"
