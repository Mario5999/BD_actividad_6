import { headers } from 'next/headers';

type CategoriaValorRow = {
  id_categoria: number;
  categoria: string;
  total_categoria: number | string | null;
  porcentaje_total: number | string | null;
};

type Reporte5Response = {
  rows: CategoriaValorRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
  kpis: {
    totalCategorias: number;
    categoriaTop: CategoriaValorRow | null;
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

const formatCurrency = (num: number | string | null | undefined) => {
  const value = toNumber(num);
  return value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

export default async function Reporte5({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const baseUrl = await getBaseUrl();
  const queryString = buildSearchParams(params);
  const apiUrl = queryString
    ? `${baseUrl}/api/reports/5?${queryString}`
    : `${baseUrl}/api/reports/5`;

  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar el reporte 5.');
  }

  const data = (await response.json()) as Reporte5Response;
  const { rows, pagination, kpis } = data;
  const minTotalCategoriaValue = getParamValue(params, 'minTotalCategoria');

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Valor Total por Categoría</h1>
        <p className="page-description">Distribución del valor total de ventas por categoría de productos para análisis de rentabilidad.</p>
      </div>

      <form className="filter-form" method="get">
        <div className="filter-field">
          <label htmlFor="minTotalCategoria">Mínimo Valor Total</label>
          <input
            type="number"
            id="minTotalCategoria"
            name="minTotalCategoria"
            className="filter-input"
            defaultValue={minTotalCategoriaValue ?? ''}
            min="0"
            step="0.01"
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
          <p className="kpi-label">Valor Total Categorías</p>
          <p className="kpi-value">${formatCurrency(kpis.totalCategorias)}</p>
        </div>
        {kpis.categoriaTop && (
          <div className="kpi-item">
            <p className="kpi-label">Categoría Top: {kpis.categoriaTop.categoria}</p>
            <p className="kpi-value">${formatCurrency(kpis.categoriaTop.total_categoria)}</p>
          </div>
        )}
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th className="table-center">ID Categoría</th>
            <th>Categoría</th>
            <th className="table-right">Valor Total</th>
            <th className="table-right">% del Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id_categoria}>
              <td className="table-center">{row.id_categoria}</td>
              <td>{row.categoria}</td>
              <td className="table-right">${formatCurrency(row.total_categoria)}</td>
              <td className="table-right">{toNumber(row.porcentaje_total).toFixed(2)}%</td>
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