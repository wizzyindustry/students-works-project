import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, color = 'var(--primary)', bgLight = 'var(--primary-light)' }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ backgroundColor: bgLight, color: color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
