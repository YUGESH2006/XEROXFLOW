import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Clock,
  Coins,
  FileCheck2,
  History,
  PlusCircle,
  Printer,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, User } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface StudentDashboardProps {
  currentUser: User;
  setActiveTab: (tab: string) => void;
  onInitiateReorder: (order: Order) => void;
  onOpenOrderModal: (order: Order) => void;
}

export function StudentDashboard({
  currentUser,
  setActiveTab,
  onInitiateReorder,
  onOpenOrderModal,
}: StudentDashboardProps) {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const userOrders = await pbService.getOrdersByUserId(currentUser.id);
    setRecentOrders(userOrders.slice(0, 3));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = pbService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  const activeOrder = recentOrders.find((o) => o.status === 'Pending' || o.status === 'Printing');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1E3A5F] via-[#2A5282] to-[#1E3A5F] text-white p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Printer size={240} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#FF8C42]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Printing Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {currentUser.name}! 👋
            </h1>
            <p className="text-sm text-slate-200 max-w-xl">
              Upload your assignments, notes, and posters for rapid campus printing with automatic price estimates and loyalty rewards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Loyalty Balance</p>
                <p className="text-lg font-bold text-amber-300">{currentUser.points} Points</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('new-order')}
              className="px-5 py-3 rounded-xl bg-[#FF8C42] hover:bg-[#e07b35] text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Print Order</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Active Order Alert Banner */}
      {activeOrder && (
        <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-600 dark:text-sky-300">
              <Zap className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">Active Order in Progress:</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-sky-500/20">{activeOrder.orderId}</span>
              </div>
              <p className="text-xs text-sky-700 dark:text-sky-300 mt-0.5">
                {activeOrder.description} • {activeOrder.files.length} document(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={activeOrder.status} size="sm" />
            <button
              onClick={() => setActiveTab('track')}
              className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors flex items-center gap-1 shadow-2xs"
            >
              Live Track <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('new-order')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#FF8C42] transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-[#FF8C42] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-[#FF8C42] transition-colors">
            Create Print Order
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload PDFs/images, set pages, binding & print settings.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#1E3A5F] transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
            Order History & Receipts
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View past submissions, download receipts, and one-tap reorder.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('track')}
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
            Live Order Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track queue position and xerox counter pickup readiness.
          </p>
        </button>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#1E3A5F] dark:text-[#FF8C42]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Print Submissions</h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-[#FF8C42] hover:underline flex items-center gap-1"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">Loading recent orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Printer className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">No print orders submitted yet.</p>
            <button
              onClick={() => setActiveTab('new-order')}
              className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
            >
              Submit First Order
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#1E3A5F] dark:text-[#FF8C42] bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {order.orderId}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {order.description || 'Document Print Job'}
                  </h4>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>📄 {order.toPage - order.fromPage + 1} pgs</span>
                    <span>• {order.copies} copy(ies)</span>
                    <span>• {order.colour ? '🎨 Colour' : '⚫ B&W'}</span>
                    <span>• {order.sheetType}</span>
                    <span>• {order.binding} Binding</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  <div className="text-left sm:text-right">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">+{order.pointsEarned} Pts Earned</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenOrderModal(order)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Receipt
                    </button>
                    <button
                      onClick={() => onInitiateReorder(order)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF8C42]/10 text-[#FF8C42] border border-[#FF8C42]/30 hover:bg-[#FF8C42]/20 transition-colors flex items-center gap-1"
                      title="Smart Re-order with pre-filled settings"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
