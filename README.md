This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
docker compose up --build 
# or
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Índices usados y justificación

Los índices en [database/indexes.sql](../database/indexes.sql) aceleran los JOINs, filtros por fecha y agrupaciones que usan las VIEWS.

**Justificación por índice (resumen):**
- `idx_orden_detalles_producto_id`: acelera el JOIN de `orden_detalles` con `productos` en `vw_ranking_productos` y `productos_populares`.
- `idx_orden_detalles_orden_id`: acelera el JOIN de `orden_detalles` con `ordenes`.
- `idx_ordenes_created_at`: acelera agregaciones por fecha en `ventas_diarias`.
- `idx_productos_categoria_id`: acelera el JOIN de `productos` con `categorias` en `categoria_valor`.

### Verificación con EXPLAIN

Ejemplos (ejecutar en PostgreSQL):

```sql
EXPLAIN SELECT * FROM vw_ranking_productos WHERE producto_id = 10;
EXPLAIN SELECT * FROM productos_populares WHERE total_vendido > 50;
EXPLAIN SELECT * FROM ventas_diarias WHERE dia >= CURRENT_DATE - INTERVAL '30 days';
EXPLAIN SELECT * FROM categoria_valor ORDER BY total_categoria DESC LIMIT 20;
```

En estos planes se observa el uso de índices en `orden_detalles(producto_id)`, `ordenes(created_at)` y `productos(categoria_id)`.
