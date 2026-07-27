import { useEffect, useState } from 'react';
import {
  Coins,
  DollarSign,
  Download,
  FileCheck2,
  History,
  Printer,
  Search,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, User } from '../../types';
import { StatusBadge } from '../StatusBadge';

export function OrderHistoryAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const all = await pbService.getOrders();
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = pbService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, []);

  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const totalPagesPrinted = orders.reduce(
    (acc, curr) => acc + (curr.toPage - curr.fromPage + 1) * curr.copies,
    0
  );
  const totalPointsIssued = orders.reduce((acc, curr) => acc + curr.pointsEarned, 0);

  const filtered = orders.filter(
    (o) =>
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userDepartment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = 'OrderId,StudentName,Department,Date,Pages,Copies,TotalCost,Status\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.orderId}","${o.userName}","${o.userDepartment}","${o.created}",${
            o.toPage - o.fromPage + 1
          },${o.copies},${o.total},"${o.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `XeroxFlow_Orders_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Revenue Metrics Summary Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Print Revenue</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              ₹{totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <Printer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Pages Processed</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white">
              {totalPagesPrinted} Pages
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Loyalty Points Distributed</p>
            <p className="text-xl font-extrabold text-amber-500">{totalPointsIssued} Pts</p>
          </div>
        </div>
      </div>

      {/* Filter & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or Student..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Download className="w-4 h-4 text-[#FF8C42]" /> Export CSV Report
        </button>
      </div>

      {/* Order Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">User & Dept</th>
                  <th className="p-3">Print Details</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono font-bold text-[#1E3A5F] dark:text-[#FF8C42]">
                      {o.orderId}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{o.userName}</p>
                      <p className="text-[10px] text-slate-400">{o.userDepartment}</p>
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {o.toPage - o.fromPage + 1} pgs • {o.copies} copies • {o.sheetType} • {o.binding}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={o.status} size="sm" />
                    </td>
                    <td className="p-3 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{o.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
