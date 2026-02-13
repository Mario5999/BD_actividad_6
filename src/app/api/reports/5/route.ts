import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { parseReport5Params } from '@/lib/validators/reportFilters';

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
    const { page, pageSize, minTotalCategoria } = parseReport5Params(params);
    const offset = (page - 1) * pageSize;

    let query = 'SELECT id_categoria, categoria, total_categoria, porcentaje_total FROM categoria_valor WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (minTotalCategoria !== undefined) {
      query += ` AND total_categoria >= $${paramIndex}`;
      queryParams.push(minTotalCategoria);
      paramIndex++;
    }

    query += ' ORDER BY total_categoria DESC';
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(pageSize, offset);

    const result = await pool.query(query, queryParams);
    const rows = result.rows;

    let countQuery = 'SELECT COUNT(*) as total FROM categoria_valor WHERE 1=1';
    const countParams: any[] = [];
    if (minTotalCategoria !== undefined) {
      countQuery += ` AND total_categoria >= $${countParams.length + 1}`;
      countParams.push(minTotalCategoria);
    }
    const countResult = await pool.query(countQuery, countParams);
    const totalRecords = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRecords / pageSize);

    const totalCategorias = rows.reduce(
      (acc: number, row: { total_categoria: number | string | null }) => acc + toNumber(row.total_categoria),
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
        totalCategorias,
        categoriaTop: rows.length > 0 ? rows[0] : null,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener reporte 5.' }, { status: 500 });
  }
}
