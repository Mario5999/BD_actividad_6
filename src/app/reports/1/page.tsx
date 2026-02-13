import { headers } from 'next/headers';

type RankingProductoRow = {
  producto_id: number;
  producto_codigo: string;
  producto_nombre: string;
  categoria_nombre: string;
  unidades_vendidas: number | string | null;
  ingresos_totales: number | string | null;
  num_ordenes: number | string | null;
  ranking_ventas: number | string | null;
  porcentaje_ingresos: number | string | null;
};

type Reporte1Response = {
  rows: RankingProductoRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
  kpis: {
    totalIngresos: number;
    topProducto: RankingProductoRow | null;
  };
};

const toNumber = (value: number | string | null | undefined) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatInteger = (value: number | string | null | undefined) => {
  return Math.round(toNumber(value)).toLocaleString();
};

const formatCurrency = (value: number | string | null | undefined) => {
  return toNumber(value).toLocaleString();
};

const getBaseUrl = async () => {
  const host = (await headers()).get('host');
  const protocol = host && host.includes('localhost') ? 'http' : 'https';
  return host ? `${protocol}://${host}` : 'http://localhost:3000';
};

const getParamValue = (
  params: { [key: string]: string | string[] | undefined },
  key: string
) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

const buildSearchParams = (
  params: { [key: string]: string | string[] | undefined },
  overrides: Record<string, string | number | undefined> = {}
) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => searchParams.append(key, item));
  });

  Object.entries(overrides).forEach(([key, value]) => {
    if (value === undefined || value === '') {
      searchParams.delete(key);
      return;
    }
    searchParams.set(key, String(value));
  });

  return searchParams.toString();
};

export const dynamic = 'force-dynamic';

export default async function Reporte1({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const baseUrl = await getBaseUrl();
  const queryString = buildSearchParams(params);
  const apiUrl = queryString
    ? `${baseUrl}/api/reports/1?${queryString}`
    : `${baseUrl}/api/reports/1`;

  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar el reporte 1.');
  }

  const data = (await response.json()) as Reporte1Response;
  const { rows, pagination, kpis } = data;
  const minIngresosValue = getParamValue(params, 'minIngresos');

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Ranking de Productos Más Vendidos</h1>
        <p className="page-description">Productos ordenados por volumen de ventas e ingresos totales generados.</p>
      </div>

      {/* Filtros */}
      <form method="get" className="kpi-container filter-form">
        <div className="kpi-item filter-field">
          <label htmlFor="minIngresos" className="kpi-label">Ingresos Mínimos ($)</label>
          <input
            type="number"
            id="minIngresos"
            name="minIngresos"
            defaultValue={minIngresosValue ?? ''}
            min="0"
            step="100"
            className="filter-input"
          />
        </div>
        <div className="kpi-item filter-field">
          <label htmlFor="pageSize" className="kpi-label">Resultados por página</label>
          <select
            id="pageSize"
            name="pageSize"
            defaultValue={pagination.pageSize}
            className="filter-select"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="kpi-item filter-actions">
          <button
            type="submit"
            className="filter-button"
          >
            Filtrar
          </button>
        </div>
      </form>

      {/* KPIs */}
      <div className="kpi-container">
        <div className="kpi-item">
          <p className="kpi-label">Total de Ingresos (página actual)</p>
          <p className="kpi-value">${formatCurrency(kpis.totalIngresos)}</p>
        </div>
        {kpis.topProducto && (
          <div className="kpi-item">
            <p className="kpi-label">Producto Top: {kpis.topProducto.producto_nombre}</p>
            <p className="kpi-value">${formatCurrency(kpis.topProducto.ingresos_totales)}</p>
          </div>
        )}
        <div className="kpi-item">
          <p className="kpi-label">Total de registros</p>
          <p className="kpi-value">{pagination.totalRecords.toLocaleString()}</p>
        </div>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Código</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th className="table-center">Unidades</th>
            <th className="table-right">Ingresos</th>
            <th className="table-center">Órdenes</th>
            <th className="table-right">% Ing.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.producto_id}>
              <td>{formatInteger(row.ranking_ventas)}</td>
              <td>{row.producto_codigo}</td>
              <td>{row.producto_nombre}</td>
              <td>{row.categoria_nombre}</td>
              <td className="table-center">{formatInteger(row.unidades_vendidas)}</td>
              <td className="table-right">${formatCurrency(row.ingresos_totales)}</td>
              <td className="table-center">{formatInteger(row.num_ordenes)}</td>
              <td className="table-right">{toNumber(row.porcentaje_ingresos).toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        {pagination.page > 1 && (
          <a
            href={`?${buildSearchParams(params, {
              page: pagination.page - 1,
              pageSize: pagination.pageSize,
            })}`}
            className="pagination-link"
          >
            ← Anterior
          </a>
        )}
        <span className="pagination-info">
          Página {pagination.page} de {pagination.totalPages}
        </span>
        {pagination.page < pagination.totalPages && (
          <a
            href={`?${buildSearchParams(params, {
              page: pagination.page + 1,
              pageSize: pagination.pageSize,
            })}`}
            className="pagination-link"
          >
            Siguiente →
          </a>
        )}
      </div>
    </main>
  );
}
