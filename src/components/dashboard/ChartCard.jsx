import { Card } from '../ui/Card';

export const ChartCard = ({ title, subtitle, className, children, actions }) => {
  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={`bg-white p-4 shadow dark:bg-gray-800 ${className || ''}`}
      actions={actions}
    >
      <div className="h-[320px]">{children}</div>
    </Card>
  );
};
