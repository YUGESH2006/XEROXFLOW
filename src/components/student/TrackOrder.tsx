import { FormEvent, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, OrderStatus, User } from '../../types';
import { StatusBadge } from '../StatusBadge';

interface TrackOrderProps {
  currentUser: User;
  initialOrderId?: string;
}

export function TrackOrder({ currentUser, initialOrderId }: TrackOrderProps) {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchOrderId, setSearchOrderId] = useState(initialOrderId || '');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const orders = await pbService.getOrdersByUserId(currentUser.id);
    setUserOrders(orders);

    if (searchOrderId) {
      const match = orders.find(
        (o) => o.orderId.toLowerCase() === searchOrderId.toLowerCase() || o.id === searchOrderId
      );
      if (match) setSelectedOrder(match);
    } else if (orders.length > 0) {
      // Default to first pending or printing order, or most recent
      const active = orders.find((o) => o.status === 'Pending' || o.status === 'Printing') || orders[0];
      setSelectedOrder(active);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = pbService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    const match = userOrders.find(
      (o) => o.orderId.toLowerCase() === searchOrderId.trim().toLowerCase()
    );
    if (match) {
      setSelectedOrder(match);
    } else {
      alert(`Order #${searchOrderId} not found.`);
    }
  };

  const steps: { status: OrderStatus; label: string; desc: string; icon: any }[] = [
    {
      status: 'Pending',
      label: '1. Order Received',
      desc: 'Job logged in PocketBase print queue',
      icon: Clock,
    },
    {
      status: 'Printing',
      label: '2. Printing in Progress',
      desc: 'High-speed printer processing document',
      icon: Printer,
    },
    {
      status: 'Completed',
      label: '3. Ready at Counter',
      desc: 'Sorted, bound, and waiting for pickup',
      icon: CheckCircle2,
    },
    {
      status: 'Issued',
      label: '4. Issued / Picked Up',
      desc: 'Document collected by student',
      icon: PackageCheck,
    },
  ];

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Pending':
        return 0;
      case 'Printing':
        return 1;
      case 'Completed':
        return 2;
      case 'Issued':
        return 3;
    }
  };

  const activeStepIdx = selectedOrder ? getStepIndex(selectedOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#FF8C42]" />
            <span>Live Order Status Tracking</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status updates synced with campus Xerox shop PocketBase backend.
          </p>
        </div>

        {/* Order Selector Dropdown */}
        {userOrders.length > 0 && (
          <div className="shrink-0">
            <select
              value={selectedOrder?.id || ''}
              onChange={(e) => {
                const found = userOrders.find((o) => o.id === e.target.value);
                if (found) setSelectedOrder(found);
              }}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              {userOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderId} - {o.status} ({o.toPage - o.fromPage + 1} pgs)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Manual Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            placeholder="Enter Order Reference ID (e.g., XRX-20260727-001)"
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2.5 bg-[#1E3A5F] text-white font-semibold rounded-xl text-xs hover:bg-slate-800 transition-colors"
        >
          Track Job
        </button>
      </form>

      {/* Main Stepper Card */}
      {selectedOrder ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {/* Order Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-extrabold text-[#1E3A5F] dark:text-[#FF8C42]">
                  {selectedOrder.orderId}
                </span>
                <StatusBadge status={selectedOrder.status} size="sm" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {selectedOrder.description || 'Print Job'} • {selectedOrder.copies} copy(ies) • {selectedOrder.sheetType}
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">Est. Ready Time</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedOrder.status === 'Issued'
                  ? 'Job Completed'
                  : selectedOrder.status === 'Completed'
                  ? 'Ready for Immediate Pickup'
                  : 'Approx 10-15 Mins'}
              </p>
            </div>
          </div>

          {/* Issue Report Alert if Admin Flagged an Issue */}
          {selectedOrder.issueReport && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 dark:text-red-200 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" /> Issue Reported by Admin: {selectedOrder.issueReport.reason}
              </div>
              <p>{selectedOrder.issueReport.description}</p>
              <p className="text-[10px] text-red-500">Reported on {new Date(selectedOrder.issueReport.reportedAt).toLocaleTimeString()}</p>
            </div>
          )}

          {/* Stepper Visualizer */}
          <div className="relative py-4">
            {/* Horizontal Line behind icons */}
            <div className="hidden md:block absolute top-1/2 left-8 right-8 h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
            <div
              className="hidden md:block absolute top-1/2 left-8 h-1 bg-gradient-to-r from-[#1E3A5F] to-[#FF8C42] -translate-y-1/2 z-0 transition-all duration-500"
              style={{ width: `${(activeStepIdx / (steps.length - 1)) * 90}%` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = idx < activeStepIdx;
                const isCurrent = idx === activeStepIdx;

                return (
                  <div key={step.status} className="flex md:flex-col items-center md:text-center gap-4 md:gap-2">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all shadow-md shrink-0 ${
                        isCurrent
                          ? 'bg-[#FF8C42] text-slate-950 scale-110 ring-4 ring-[#FF8C42]/20'
                          : isCompleted
                          ? 'bg-[#1E3A5F] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isCurrent ? 'animate-bounce' : ''}`} />
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${isCurrent ? 'text-[#FF8C42]' : 'text-slate-900 dark:text-white'}`}>
                        {step.label}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pickup Shop Details */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#1E3A5F] text-[#FF8C42]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Campus Xerox & Print Station</p>
                <p className="text-slate-500 dark:text-slate-400">Ground Floor, Student Activity Center (SAC Block B)</p>
              </div>
            </div>
            <div className="text-left sm:text-right text-slate-500">
              <p>Operating Hours: 8:00 AM - 9:00 PM</p>
              <p className="font-medium text-emerald-600 dark:text-emerald-400">Counter Open Now</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Clock className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Order Selected</p>
          <p className="text-xs text-slate-400">Submit a print order to view real-time queue tracking.</p>
        </div>
      )}
    </div>
  );
}
