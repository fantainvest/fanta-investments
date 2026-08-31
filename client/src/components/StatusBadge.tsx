const statusStyles: Record<string, string> = {
  active: 'bg-green-900/50 text-green-400 border-green-800',
  completed: 'bg-blue-900/50 text-blue-400 border-blue-800',
  confirmed: 'bg-green-900/50 text-green-400 border-green-800',
  approved: 'bg-green-900/50 text-green-400 border-green-800',
  pending: 'bg-yellow-900/50 text-yellow-400 border-yellow-800',
  failed: 'bg-red-900/50 text-red-400 border-red-800',
  rejected: 'bg-red-900/50 text-red-400 border-red-800',
  cancelled: 'bg-gray-800/50 text-gray-400 border-gray-700',
  suspended: 'bg-red-900/50 text-red-400 border-red-800',
  processing: 'bg-fanta-900/50 text-fanta-400 border-fanta-800',
};

export default function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] || 'bg-gray-800 text-gray-400 border-gray-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
