import { FormEvent, useState } from 'react';
import {
  Database,
  History,
  Layers,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, User } from '../../types';
import { OrderHistoryAdmin } from './OrderHistoryAdmin';
import { OrderQueueAdmin } from './OrderQueueAdmin';
import { ReportIssueModal } from './ReportIssueModal';

interface AdminPanelProps {
  adminUser: User;
}

export function AdminPanel({ adminUser }: AdminPanelProps) {
  const [activeSubtab, setActiveSubtab] = useState<'queue' | 'history' | 'settings'>('queue');
  const [selectedIssueOrder, setSelectedIssueOrder] = useState<Order | null>(null);
  const [pbUrl, setPbUrl] = useState(pbService.getPocketBaseUrl());

  const handleSavePbUrl = (e: FormEvent) => {
    e.preventDefault();
    pbService.setPocketBaseUrl(pbUrl);
    alert('PocketBase backend endpoint URL updated.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2A5282] to-[#1E3A5F] text-white p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#FF8C42]/20 text-[#FF8C42] flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Admin Xerox Queue & Management</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Logged in as {adminUser.name} ({adminUser.username})
            </p>
          </div>
        </div>

        {/* Subtab Navigation */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/80 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSubtab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubtab === 'queue'
                ? 'bg-[#FF8C42] text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Printer className="w-4 h-4" /> Live Queue
          </button>
          <button
            onClick={() => setActiveSubtab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubtab === 'history'
                ? 'bg-[#FF8C42] text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" /> History & Revenue
          </button>
          <button
            onClick={() => setActiveSubtab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubtab === 'settings'
                ? 'bg-[#FF8C42] text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> PocketBase Config
          </button>
        </div>
      </div>

      {/* Subtab Content */}
      {activeSubtab === 'queue' && (
        <OrderQueueAdmin
          adminUser={adminUser}
          onOpenReportIssue={(order) => setSelectedIssueOrder(order)}
        />
      )}

      {activeSubtab === 'history' && <OrderHistoryAdmin />}

      {activeSubtab === 'settings' && (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#FF8C42]" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">PocketBase Backend Configuration</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Self-hosted PocketBase backend server URL. Default is set to <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">http://127.0.0.1:8090</code>.
          </p>

          <form onSubmit={handleSavePbUrl} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                PocketBase Server Endpoint
              </label>
              <input
                type="text"
                value={pbUrl}
                onChange={(e) => setPbUrl(e.target.value)}
                placeholder="http://127.0.0.1:8090"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1E3A5F] text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              Save Configuration
            </button>
          </form>
        </div>
      )}

      {/* Report Issue Modal */}
      {selectedIssueOrder && (
        <ReportIssueModal
          order={selectedIssueOrder}
          adminUser={adminUser}
          onClose={() => setSelectedIssueOrder(null)}
          onSuccess={() => setSelectedIssueOrder(null)}
        />
      )}
    </div>
  );
}
