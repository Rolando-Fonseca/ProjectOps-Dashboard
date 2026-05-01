export interface Kpi {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface Metrics {
  kpis: Kpi[];
  tasksByStatus: { status: string; count: number }[];
  projectsByStatus: { status: string; count: number }[];
  weeklyVelocity: { week: string; completed: number }[];
}
