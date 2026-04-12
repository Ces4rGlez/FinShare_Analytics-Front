import './StatCard.css';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  loading = false,
}) {
  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 36, width: '80%', marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: '50%' }} />
      </div>
    );
  }

  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className={`stat-card-icon-wrap stat-icon-${color}`}>
            <Icon className="stat-card-icon" />
          </div>
        )}
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-footer">
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
        {trend !== undefined && (
          <span className={`stat-card-trend ${trend >= 0 ? 'trend-up' : 'trend-down'}`}>
            {trend >= 0 ? '↑' : '↓'} {trendValue || `${Math.abs(trend)}%`}
          </span>
        )}
      </div>
    </div>
  );
}
