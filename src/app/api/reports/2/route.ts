import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseReport2Params } from '@/lib/validators/reportFilters';

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getSearchParamsObject = (request: NextRequest) => {
  const url = new URL(request.url);
  const params: { [key: string]: string | string[] } = {};
  url.searchParams.forEach((value, key) => {
    const existing = params[key];
    if (existing === undefined) {
      params[key] = value;
      return;
    }
    params[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  });
  return params;
};

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const params = getSearchParamsObject(request);
    const { page, pageSize, minGastado, minPedidos } = parseReport2Params(params);
    const offset = (page - 1) * pageSize;

    let query = 'SELECT id_cliente, nombre, num_pedidos, total_gastado FROM clientes_resumen WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (minGastado !== undefined) {
      query += ` AND total_gastado >= $${paramIndex}`;
      queryParams.push(minGastado);
      paramIndex++;
    }

    if (minPedidos !== undefined) {
      query += ` AND num_pedidos >= $${paramIndex}`;
      queryParams.push(minPedidos);
      paramIndex++;
    }

    query += ' ORDER BY total_gastado DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const result = await pool.query(query, queryParams);
    const rows = result.rows;

    let countQuery = 'SELECT COUNT(*) FROM clientes_resumen WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (minGastado !== undefined) {
      countQuery += ` AND total_gastado >= $${countParamIndex}`;
      countParams.push(minGastado);
      countParamIndex++;
    }

    if (minPedidos !== undefined) {
      countQuery += ` AND num_pedidos >= $${countParamIndex}`;
      countParams.push(minPedidos);
    }

    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / pageSize);

    const totalGastado = rows.reduce(
      (acc: number, row: { total_gastado: number | string | null }) => acc + toNumber(row.total_gastado),
      0
    );

    return NextResponse.json({
      rows,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalRecords,
      },
      kpis: {
        totalGastado,
        promedioPorCliente: rows.length > 0 ? totalGastado / rows.length : 0,
        topCliente: rows.length > 0 ? rows[0] : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reporte 2.' }, { status: 500 });
  }
}
