import { headers } from 'next/headers';

type ProductoPopularRow = {
  id: number;
  nombre: string;
  total_vendido: number | string | null;
};

type Reporte3Response = {
  rows: ProductoPopularRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
  kpis: {
    totalUnidades: number;
    productoPopular: ProductoPopularRow | null;
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

const formatNumber = (num: number | string | null | undefined) => {
  return Math.round(toNumber(num)).toLocaleString();
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

export default async function Reporte3({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const baseUrl = await getBaseUrl();
  const queryString = buildSearchParams(params);
  const apiUrl = queryString
    ? `${baseUrl}/api/reports/3?${queryString}`
    : `${baseUrl}/api/reports/3`;

  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar el reporte 3.');
  }

  const data = (await response.json()) as Reporte3Response;
  const { rows, pagination, kpis } = data;
  const minTotalVendidoValue = getParamValue(params, 'minTotalVendido');

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Productos Más Populares</h1>
        <p className="page-description">Productos clasificados por cantidad total vendida en el período analizado.</p>
      </div>

      <form className="filter-form" method="get">
        <div className="filter-field">
          <label htmlFor="minTotalVendido">Mínimo Total Vendido</label>
          <input
            type="number"
            id="minTotalVendido"
            name="minTotalVendido"
            className="filter-input"
            defaultValue={minTotalVendidoValue ?? ''}
            min="0"
          />
        </div>
        <div className="filter-field">
          <label htmlFor="pageSize">Registros por Página</label>
          <select
            id="pageSize"
            name="pageSize"
            className="filter-select"
            defaultValue={pagination.pageSize}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <div className="filter-actions">
          <button type="submit" className="filter-button">Filtrar</button>
        </div>
      </form>

      <div className="kpi-container">
        <div className="kpi-item">
          <p className="kpi-label">Total Unidades Vendidas</p>
          <p className="kpi-value">{formatNumber(kpis.totalUnidades)}</p>
        </div>
        {kpis.productoPopular && (
          <div className="kpi-item">
            <p className="kpi-label">Producto Top: {kpis.productoPopular.nombre}</p>
            <p className="kpi-value">{formatNumber(kpis.productoPopular.total_vendido)}</p>
          </div>
        )}
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th className="table-center">ID Producto</th>
            <th>Nombre Producto</th>
            <th className="table-right">Total Vendido</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="table-center">{row.id}</td>
              <td>{row.nombre}</td>
              <td className="table-right">{formatNumber(row.total_vendido)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {pagination.page > 1 && (
          <a
            href={`?${buildSearchParams(params, {
              page: pagination.page - 1,
              pageSize: pagination.pageSize,
            })}`}
            className="pagination-link"
          >
            Anterior
          </a>
        )}
        <span className="pagination-info">Página {pagination.page} de {pagination.totalPages}</span>
        {pagination.page < pagination.totalPages && (
          <a
            href={`?${buildSearchParams(params, {
              page: pagination.page + 1,
              pageSize: pagination.pageSize,
            })}`}
            className="pagination-link"
          >
            Siguiente
          </a>
        )}
      </div>
    </main>
  );
}
        