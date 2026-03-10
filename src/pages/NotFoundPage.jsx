import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
        <p className="font-display text-2xl font-semibold text-slate-900 dark:text-slate-100">Page not found</p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          The requested page does not exist or has been moved.
        </p>
        <Link to="/" className="mt-4 inline-flex">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
