import { useEffect, useState } from 'react';
import {
  Download,
  FileCheck2,
  Filter,
  History,
  Info,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, OrderStatus, User } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface OrderHistoryProps {
  currentUser: User;
  onInitiateReorder: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  initialSelectedOrder?: Order | null;
}

export function OrderHistory({
  currentUser,
  onInitiateReorder,
  onTrackOrder,
  initialSelectedOrder,
}: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(
    initialSelectedOrder || null
  );

  const loadOrders = async () => {
    setLoading(true);
    const userOrders = await pbService.getOrdersByUserId(currentUser.id);
    setOrders(userOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const unsubscribe = pbService.subscribe(() => {
      loadOrders();
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.files.some((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-[#FF8C42]" />
            <span>Order History & Invoices</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, view invoice breakdowns, track live status, and repeat past orders in 1-click.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total Submissions</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{orders.length} Order(s)</p>
        </div>
      </div>

      {/* Search & Filter Subbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID (XRX-...), document name or description..."
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF8C42]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['All', 'Pending', 'Printing', 'Completed', 'Issued'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                statusFilter === st
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading order history...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No matching orders found.
          </p>
          <p className="text-xs text-slate-400">
            {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filters.' : 'Submit a new print job to see it listed here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#1E3A5F] dark:text-[#FF8C42] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    {order.orderId}
                  </span>
                  <StatusBadge status={order.status} size="sm" />
                  <span className="text-xs text-slate-400">
                    {new Date(order.created).toLocaleDateString()} at{' '}
                    {new Date(order.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    ₹{order.total.toFixed(2)}
                  </span>
                  {order.pointsEarned > 0 && (
                    <span className="ml-2 text-xs font-bold text-amber-500">
                      (+{order.pointsEarned} Pts)
                    </span>
                  )}
                </div>
              </div>

              {/* Order Info & File List */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {order.description || 'Print Document'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      📄 {order.toPage - order.fromPage + 1} pgs (From {order.fromPage} to {order.toPage})
                    </span>
                    <span>• {order.copies} copy(ies)</span>
                    <span>• {order.colour ? '🎨 Colour' : '⚫ B&W'}</span>
                    <span>• {order.sheetType}</span>
                    <span>• {order.binding} Binding</span>
                  </div>
                  {order.files.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[11px] font-medium text-slate-400">Files:</span>
                      {order.files.map((f) => (
                        <span
                          key={f.id}
                          className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono truncate max-w-[150px]"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => setSelectedOrderDetails(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    View Receipt
                  </button>
                  <button
                    onClick={() => onTrackOrder(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/30 text-xs font-semibold hover:bg-sky-500/20 transition-colors"
                  >
                    Live Status
                  </button>
                  <button
                    onClick={() => onInitiateReorder(order)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FF8C42]/10 text-[#FF8C42] border border-[#FF8C42]/30 text-xs font-semibold hover:bg-[#FF8C42]/20 transition-colors flex items-center gap-1.5"
                    title="Smart 1-Tap Re-order with pre-filled settings"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Re-Order
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Full Invoice Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderDetails(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-mono font-bold text-[#FF8C42]">{selectedOrderDetails.orderId}</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Print Order Receipt</h2>
              <p className="text-xs text-slate-400">
                Submitted on {new Date(selectedOrderDetails.created).toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={selectedOrderDetails.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Department / User:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedOrderDetails.userName} ({selectedOrderDetails.userDepartment})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Page Selection:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Pages {selectedOrderDetails.fromPage} to {selectedOrderDetails.toPage} (
                  {selectedOrderDetails.toPage - selectedOrderDetails.fromPage + 1} pgs)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Copies & Mode:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedOrderDetails.copies} copy(ies) • {selectedOrderDetails.colour ? 'Colour' : 'Black & White'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sheet & Binding:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {selectedOrderDetails.sheetType} • {selectedOrderDetails.binding} Binding
                </span>
              </div>
            </div>

            {/* Uploaded Documents Download */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Attached Document Files:</p>
              <div className="space-y-1.5">
                {selectedOrderDetails.files.map((f) => (
                  <div
                    key={f.id}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono truncate max-w-[240px] text-slate-900 dark:text-slate-200">
                      {f.name}
                    </span>
                    {f.dataUrl || f.previewUrl ? (
                      <a
                        href={f.dataUrl || f.previewUrl}
                        download={f.name}
                        className="px-2.5 py-1 bg-[#1E3A5F] text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0 text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    ) : (
                      <span className="text-slate-400 text-[10px]">On PocketBase Storage</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financials & Loyalty */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal:</span>
                <span>₹{selectedOrderDetails.subtotal.toFixed(2)}</span>
              </div>
              {selectedOrderDetails.pointsUsed > 0 && (
                <div className="flex justify-between text-amber-500 font-medium">
                  <span>Points Used ({selectedOrderDetails.pointsUsed} Pts):</span>
                  <span>-₹{(selectedOrderDetails.pointsUsed / 10).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 dark:text-white pt-1">
                <span>Total Paid:</span>
                <span>₹{selectedOrderDetails.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  const ord = selectedOrderDetails;
                  setSelectedOrderDetails(null);
                  onInitiateReorder(ord);
                }}
                className="flex-1 py-2.5 bg-[#FF8C42] text-slate-950 font-bold rounded-xl text-xs hover:bg-[#e07b35] transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Re-Order This Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
