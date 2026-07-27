import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  Download,
  FileCheck2,
  Filter,
  Layers,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Square,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, OrderStatus, User } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface OrderQueueAdminProps {
  adminUser: User;
  onOpenReportIssue: (order: Order) => void;
}

export function OrderQueueAdmin({ adminUser, onOpenReportIssue }: OrderQueueAdminProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    const all = await pbService.getOrders();
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
    const unsubscribe = pbService.subscribe(() => {
      loadOrders();
    });
    return () => unsubscribe();
  }, []);

  const handleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSingleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    await pbService.updateOrderStatus(orderId, newStatus);
  };

  const handleBulkStatusUpdate = async (newStatus: OrderStatus) => {
    if (selectedOrderIds.length === 0) return;
    const count = await pbService.updateBulkOrderStatus(selectedOrderIds, newStatus);
    alert(`Successfully updated ${count} order(s) to "${newStatus}".`);
    setSelectedOrderIds([]);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Student Name, or Department..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(['All', 'Pending', 'Printing', 'Completed', 'Issued'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                filterStatus === st
                  ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Status Update Action Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#1E3A5F] to-[#2A5282] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <CheckSquare className="w-4 h-4 text-[#FF8C42]" />
            <span>{selectedOrderIds.length} Order(s) Selected for Bulk Status Action:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatusUpdate('Printing')}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" /> Mark Printing
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Completed')}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Issued')}
              className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
            >
              <PackageCheck className="w-3.5 h-3.5" /> Mark Issued
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-2 py-1 text-slate-300 hover:text-white text-xs underline"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Main Order Queue Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center gap-1.5 text-xs font-semibold"
            >
              {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#FF8C42]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All ({filteredOrders.length})
            </button>
            <span className="text-xs text-slate-400">Real-time FIFO Queue</span>
          </div>

          <button
            onClick={loadOrders}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading order queue...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No orders in queue.</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOrders.map((order) => {
              const isSelected = selectedOrderIds.includes(order.id);

              return (
                <div
                  key={order.id}
                  className={`p-4 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isSelected ? 'bg-amber-500/5 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(order.id)}
                      className="mt-1 text-slate-400 hover:text-[#FF8C42]"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-[#FF8C42]" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#1E3A5F] dark:text-[#FF8C42] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {order.orderId}
                        </span>
                        <StatusBadge status={order.status} size="sm" />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {order.userName} ({order.userDepartment})
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        {order.description || 'Print Job'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span>
                          📄 {order.toPage - order.fromPage + 1} pgs (Pages {order.fromPage}-{order.toPage})
                        </span>
                        <span>• {order.copies} copy(ies)</span>
                        <span>• {order.colour ? '🎨 Colour' : '⚫ B&W'}</span>
                        <span>• {order.sheetType}</span>
                        <span>• {order.binding} Binding {order.spiralColor ? `(${order.spiralColor})` : ''}</span>
                        <span className="font-bold text-slate-900 dark:text-white">• Total: ₹{order.total.toFixed(2)}</span>
                      </div>

                      {/* File Download Buttons */}
                      {order.files.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[10px] text-slate-400">Files:</span>
                          {order.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.dataUrl || f.previewUrl || '#'}
                              download={f.name}
                              className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-700 dark:text-slate-300 hover:bg-[#1E3A5F] hover:text-white transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3 text-[#FF8C42]" /> {f.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Status Controls & Report Issue Button */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    {/* Status Select */}
                    <select
                      value={order.status}
                      onChange={(e) => handleSingleStatusUpdate(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Printing">Printing</option>
                      <option value="Completed">Ready (Completed)</option>
                      <option value="Issued">Issued</option>
                    </select>

                    <button
                      onClick={() => onOpenReportIssue(order)}
                      className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg border border-red-500/20 text-xs font-medium transition-colors flex items-center gap-1"
                      title="Report issue or file problem to student"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Report Issue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
