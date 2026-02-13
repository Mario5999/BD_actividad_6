import { headers } from 'next/headers';

type VentasDiariasRow = {
  dia: string;
  num_pedidos: number | string | null;
  total_dia: number | string | null;
  ticket_promedio_dia: number | string | null;
};

type Reporte4Response = {
  rows: VentasDiariasRow[];
  kpis: {
    totalVentas: number;
    totalPedidos: number;
    promedioVentas: number;
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
  const n = toNumber(num);
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatInteger = (value: number | string | null | undefined) => {
  return Math.round(toNumber(value)).toLocaleString();
};

const getBaseUrl = async () => {
  const host = (await headers()).get('host');
  const protocol = host && host.includes('localhost') ? 'http' : 'https';
  return host ? `${protocol}://${host}` : 'http://localhost:3000';
};

export const dynamic = 'force-dynamic';

export default async function Reporte4() {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/reports/4`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Error al cargar el reporte 4.');
  }

  const data = (await response.json()) as Reporte4Response;
  const { rows, kpis } = data;

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Ventas Diarias Últimos 30 Días</h1>
        <p className="page-description">Tendencia de ventas diarias mostrando volumen de pedidos y totales generados en cada día.</p>
      </div>

      <div className="kpi-container">
        <div className="kpi-item">
          <p className="kpi-label">Total Ventas (30 días)</p>
          <p className="kpi-value">${formatCurrency(kpis.totalVentas)}</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-label">Promedio Diario</p>
          <p className="kpi-value">${formatCurrency(kpis.promedioVentas)}</p>
        </div>
        <div className="kpi-item">
          <p className="kpi-label">Total Pedidos</p>
          <p className="kpi-value">{formatInteger(kpis.totalPedidos)}</p>
        </div>
      </div>

      <table className="report-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th className="table-center">Número de Pedidos</th>
            <th className="table-right">Total del Día</th>
            <th className="table-right">Ticket Promedio</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>{new Date(row.dia).toLocaleDateString()}</td>
              <td className="table-center">{formatInteger(row.num_pedidos)}</td>
              <td className="table-right">${formatCurrency(row.total_dia)}</td>
              <td className="table-right">${formatCurrency(row.ticket_promedio_dia)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}