import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseReport1Params } from '@/lib/validators/reportFilters';

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
    const { page, pageSize, minIngresos } = parseReport1Params(params);
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM vw_ranking_productos WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (minIngresos !== undefined) {
      query += ` AND ingresos_totales >= $${paramIndex}`;
      queryParams.push(minIngresos);
      paramIndex++;
    }

    query += ' ORDER BY ranking_ventas';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const result = await pool.query(query, queryParams);
    const rows = result.rows;

    let countQuery = 'SELECT COUNT(*) FROM vw_ranking_productos WHERE 1=1';
    const countParams: any[] = [];
    if (minIngresos !== undefined) {
      countQuery += ' AND ingresos_totales >= $1';
      countParams.push(minIngresos);
    }
    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRecords / pageSize);

    const totalIngresos = rows.reduce(
      (acc: number, row: { ingresos_totales: number | string | null }) => acc + toNumber(row.ingresos_totales),
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
        totalIngresos,
        topProducto: rows.length > 0 ? rows[0] : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reporte 1.' }, { status: 500 });
  }
}
