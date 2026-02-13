export default function Home() {
  const reports = [
    {
      id: 1,
      title: "Ranking de Productos",
      description: "Productos más vendidos y sus ingresos totales ordenados por ranking de ventas."
    },
    {
      id: 2,
      title: "Resumen de Clientes",
      description: "Análisis de clientes con número de pedidos y total gastado para identificar clientes clave."
    },
    {
      id: 3,
      title: "Productos Populares",
      description: "Productos más populares basado en cantidad total vendida en el período."
    },
    {
      id: 4,
      title: "Ventas Diarias",
      description: "Tendencia de ventas diarias de los últimos 30 días con número de pedidos y totales."
    },
    {
      id: 5,
      title: "Valor por Categoría",
      description: "Distribución del valor total de ventas por categoría de productos."
    }
  ];

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard de Reportes</h1>
        <p className="page-description">Accede a los reportes de ventas</p>
      </div>

      <div className="dashboard-grid">
        {reports.map((report) => (
          <a key={report.id} href={`/reports/${report.id}`} className="dashboard-card">
            <h2 className="dashboard-card-title">{report.title}</h2>
            <p className="dashboard-card-desc">{report.description}</p>
          </a>
        ))}
      </div>
    </main>
  );
}
