import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { VolumeDataPoint, Mesocycle } from '../../types';

interface VolumeChartProps {
  data: VolumeDataPoint[];
  mesocycles: Mesocycle[];
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: VolumeDataPoint;
}

function CustomDot({ cx = 0, cy = 0, payload }: CustomDotProps) {
  if (!payload?.isDeload) return null;
  return <circle cx={cx} cy={cy} r={4} fill="#3B82F6" stroke="#1d4ed8" strokeWidth={1.5} />;
}

export function VolumeChart({ data, mesocycles }: VolumeChartProps) {
  // Meso boundary weeks (start of each meso after the first)
  const boundaries = mesocycles.slice(1).map((_, i) => (i + 1) * 5 + 1);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-300 mb-3">Volume Progression</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F1F35" />
          <XAxis
            dataKey="week"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#2A2A45' }}
            label={{ value: 'Week', position: 'insideBottom', offset: -2, fill: '#6b7280', fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#17172A',
              border: '1px solid #2A2A45',
              borderRadius: 8,
              color: '#e5e7eb',
              fontSize: 12,
            }}
            formatter={(val, _name, props) => [
              `${val} sets${(props?.payload as VolumeDataPoint | undefined)?.isDeload ? ' (deload)' : ''}`,
              'Volume',
            ]}
            labelFormatter={(label) => `Week ${label}`}
          />
          {/* Meso boundary reference lines */}
          {boundaries.map((week) => (
            <ReferenceLine
              key={week}
              x={week}
              stroke="#2A2A45"
              strokeDasharray="4 4"
              label={{ value: `M${Math.ceil(week / 5)}`, position: 'top', fill: '#6b7280', fontSize: 10 }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="totalSets"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#volumeGrad)"
            dot={<CustomDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          Deload week
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 border-t border-dashed border-surface-500" />
          Mesocycle boundary
        </div>
      </div>
    </div>
  );
}
