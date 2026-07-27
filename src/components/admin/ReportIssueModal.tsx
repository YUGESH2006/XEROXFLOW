import { FormEvent, useState } from 'react';
import { AlertCircle, Send, X } from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, User } from '../../types';

interface ReportIssueModalProps {
  order: Order;
  adminUser: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportIssueModal({
  order,
  adminUser,
  onClose,
  onSuccess,
}: ReportIssueModalProps) {
  const [reason, setReason] = useState('File Unreadable / Corrupted');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description for the reported issue.');
      return;
    }

    setIsSubmitting(true);
    try {
      await pbService.reportOrderIssue(order.id, {
        orderId: order.orderId,
        reason,
        description: description.trim(),
        adminName: adminUser.name,
      });

      alert(`Issue reported for Order #${order.orderId}. The student will be notified on their tracking screen.`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Issue report error:', err);
      alert('Failed to report issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Report Problem Order</h2>
            <p className="text-xs text-slate-400">Order Ref: {order.orderId} ({order.userName})</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Issue Category
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="File Unreadable / Corrupted">File Unreadable / Corrupted</option>
              <option value="Incorrect Margins or Formatting">Incorrect Margins or Formatting</option>
              <option value="Out of Selected Paper Stock (A3/Poster)">Out of Selected Paper Stock</option>
              <option value="Missing Required Font or Images">Missing Required Font or Images</option>
              <option value="Payment Verification Pending">Payment Verification Pending</option>
              <option value="Other Technical Glitch">Other Technical Glitch</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1 font-semibold text-slate-700 dark:text-slate-300">
              <span>Issue Description (Max 150 words)</span>
              <span>{description.split(/\s+/).filter(Boolean).length}/150 words</span>
            </div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                const words = e.target.value.split(/\s+/);
                if (words.length <= 150) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="Describe what needs correction by the student (e.g. Please re-upload PDF with embedded fonts or standard margins)..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" /> Submit Issue Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
