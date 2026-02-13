import { headers } from 'next/headers';

type ClienteResumenRow = {
  id_cliente: number;
  nombre: string;
  num_pedidos: number | string | null;
  total_gastado: number | string | null;
};

type Reporte2Response = {
  rows: ClienteResumenRow[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
  };
  kpis: {
    totalGastado: number;
    promedioPorCliente: number;
    topCliente: ClienteResumenRow | null;
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

export default async function Reporte2({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const baseUrl = await getBaseUrl();
  const queryString = buildSearchParams(params);
  const apiUrl = queryString
    ? `${baseUrl}/api/reports/2?${queryString}`
    : `${baseUrl}/api/reports/2`;

  const response = await fetch(apiUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar el reporte 2.');
  }

  const data = (await response.json()) as Reporte2Response;
  const { rows, pagination, kpis } = data;
  const minGastadoValue = getParamValue(params, 'minGastado');
  const minPedidosValue = getParamValue(params, 'minPedidos');

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Resumen de Clientes</h1>
        <p className="page-description">Análisis detallado de clientes identificando aquellos con mayor valor y frecuencia de compra.</p>
      </div>

      {/* Filtros */}
      <form method="get" className="kpi-container filter-form">
        <div className="kpi-item filter-field">
          <label htmlFor="minGastado" className="kpi-label">Gasto Mínimo ($)</label>
          <input
            type="number"
            id="minGastado"
            name="minGastado"
            defaultValue={minGastadoValue ?? ''}
            min="0"
            step="100"
            className="filter-input"
          />
        </div>
        <div className="kpi-item filter-field">
          <label htmlFor="minPedidos" className="kpi-label">Pedidos Mínimos</label>
          <input
            type="number"
            id="minPedidos"
            name="minPedidos"
            defaultValue={minPedidosValue ?? ''}
            min="0"
            step="1"
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
          <p className="kpi-label">Total Gastado (página actual)</p>
          <p className="kpi-value">${formatCurrency(kpis.totalGastado)}</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-label">Promedio por Cliente</p>
          <p className="kpi-value">${formatCurrency(kpis.promedioPorCliente)}</p>
        </div>
        {kpis.topCliente && (
          <div className="kpi-item">
            <p className="kpi-label">Cliente Top: {kpis.topCliente.nombre}</p>
            <p className="kpi-value">${formatCurrency(kpis.topCliente.total_gastado)}</p>
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
            <th className="table-center">ID Cliente</th>
            <th>Nombre</th>
            <th className="table-center">Número de Pedidos</th>
            <th className="table-right">Total Gastado</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id_cliente}>
              <td className="table-center">{row.id_cliente}</td>
              <td>{row.nombre}</td>
              <td className="table-center">{formatInteger(row.num_pedidos)}</td>
              <td className="table-right">${formatCurrency(row.total_gastado)}</td>
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