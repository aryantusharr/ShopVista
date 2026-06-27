import { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await API.get('/admin/dashboard');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="loading">Loading Dashboard statistics...</div>;
  if (!stats) return <div className="loading">Could not load dashboard data</div>;

  return (
    <div>
      <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '28px' }}>Dashboard Overview</h1>

      {/* KPIs Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-title">Total Orders</div>
          <div className="kpi-value">{stats.totalOrders}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Total Sales</div>
          <div className="kpi-value">₹{stats.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Pending Orders</div>
          <div className="kpi-value">{stats.pendingOrders}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-title">Low Stock Alert</div>
          <div className="kpi-value" style={{ color: stats.lowStockCount > 0 ? '#ef4444' : 'inherit' }}>
            {stats.lowStockCount}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Sales Chart Simulation */}
        <div className="card">
          <h2 className="card-title">Recent Sales Performance</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '16px', paddingTop: '20px', borderBottom: '1px solid #cbd5e1' }}>
            {stats.chartData.map((day) => (
              <div
                key={day.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    backgroundColor: '#6366f1',
                    borderRadius: '4px 4px 0 0',
                    height: `${day.revenue > 0 ? Math.min(150, (day.revenue / (stats.totalRevenue || 1)) * 300) : 5}px`,
                    transition: 'height 0.3s ease',
                  }}
                  title={`₹${day.revenue}`}
                />
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>
                  {day.date.slice(8, 10)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-muted" style={{ fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>
            (Daily Revenue for the Last 7 Days)
          </p>
        </div>

        {/* Low Stock alerts */}
        <div className="card">
          <h2 className="card-title">Low Stock Alerts</h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-muted" style={{ fontSize: '14px' }}>All products are sufficiently stocked.</p>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.lowStockProducts.map((p) => (
                <li
                  key={p._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '600' }}>{p.name}</p>
                    <p className="text-muted" style={{ fontSize: '11px' }}>SKU: {p.sku}</p>
                  </div>
                  <span style={{ color: '#ef4444', fontWeight: '750' }}>{p.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
