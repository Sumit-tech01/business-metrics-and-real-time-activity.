import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

export const ExpenseCategoryPieChart = ({ data }) => {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip />
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={96} label>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
