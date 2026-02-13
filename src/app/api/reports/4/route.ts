import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT dia, num_pedidos, total_dia, ticket_promedio_dia FROM ventas_diarias ORDER BY dia DESC LIMIT 30'
    );

    const rows = result.rows;
    const totalVentas = rows.reduce(
      (acc: number, row: { total_dia: number | string | null }) => acc + toNumber(row.total_dia),
      0
    );
    const totalPedidos = rows.reduce(
      (acc: number, row: { num_pedidos: number | string | null }) => acc + toNumber(row.num_pedidos),
      0
    );
    const promedioVentas = rows.length > 0 ? totalVentas / rows.length : 0;

    return NextResponse.json({
      rows,
      kpis: {
        totalVentas,
        totalPedidos,
        promedioVentas,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reporte 4.' }, { status: 500 });
  }
}
