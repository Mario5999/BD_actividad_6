import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseReport3Params } from '@/lib/validators/reportFilters';

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
    const { page, pageSize, minTotalVendido } = parseReport3Params(params);
    const offset = (page - 1) * pageSize;

    let query = 'SELECT id, nombre, total_vendido FROM productos_populares WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (minTotalVendido !== undefined) {
      query += ` AND total_vendido >= $${paramIndex}`;
      queryParams.push(minTotalVendido);
      paramIndex++;
    }

    query += ' ORDER BY total_vendido DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const result = await pool.query(query, queryParams);
    const rows = result.rows;

    let countQuery = 'SELECT COUNT(*) as total FROM productos_populares WHERE 1=1';
    const countParams: any[] = [];
    if (minTotalVendido !== undefined) {
      countQuery += ` AND total_vendido >= $${countParams.length + 1}`;
      countParams.push(minTotalVendido);
    }
    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRecords / pageSize);

    const totalUnidades = rows.reduce(
      (acc: number, row: { total_vendido: number | string | null }) => acc + toNumber(row.total_vendido),
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
        totalUnidades,
        productoPopular: rows.length > 0 ? rows[0] : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reporte 3.' }, { status: 500 });
  }
}
