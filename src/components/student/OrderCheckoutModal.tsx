import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  CreditCard,
  QrCode,
  ShieldCheck,
  Wallet,
  X,
} from 'lucide-react';
import { pbService } from '../../services/pocketbase';
import { Order, User } from '../../types';
import { clearOrderDraft } from '../../utils/draftStorage';
import { calculatePrice } from '../../utils/priceCalculator';

interface OrderCheckoutModalProps {
  currentUser: User;
  orderData: any;
  onClose: () => void;
  onSuccess: (newOrder: Order) => void;
}

export function OrderCheckoutModal({
  currentUser,
  orderData,
  onClose,
  onSuccess,
}: OrderCheckoutModalProps) {
  const [usePoints, setUsePoints] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'upi'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const breakdown = calculatePrice({
    fromPage: orderData.fromPage,
    toPage: orderData.toPage,
    copies: orderData.copies,
    colour: orderData.colour,
    sheetType: orderData.sheetType,
    customWidth: orderData.customWidth,
    customHeight: orderData.customHeight,
    binding: orderData.binding,
    usePoints: usePoints,
    availablePoints: currentUser.points,
  });

  const handleConfirmAndPay = async () => {
    if (paymentMethod === 'wallet' && currentUser.walletBalance < breakdown.total) {
      alert(`Insufficient Campus Wallet balance (Current: ₹${currentUser.walletBalance.toFixed(2)}). Please select UPI Payment.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const createdOrder = await pbService.createOrder({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        userDepartment: currentUser.department,
        userPhone: currentUser.phone,
        description: orderData.description || 'Document Print Order',
        fromPage: orderData.fromPage,
        toPage: orderData.toPage,
        copies: orderData.copies,
        colour: orderData.colour,
        sheetType: orderData.sheetType,
        customWidth: orderData.customWidth,
        customHeight: orderData.customHeight,
        binding: orderData.binding,
        spiralColor: orderData.spiralColor,
        status: 'Pending',
        subtotal: breakdown.subtotal,
        pointsEarned: breakdown.potentialPointsEarned,
        pointsUsed: breakdown.pointsUsed,
        total: breakdown.total,
        files: orderData.files,
        reorderFromId: orderData.reorderFromId,
        paymentMethod: paymentMethod,
      });

      // Clear draft storage upon placement
      clearOrderDraft();

      // Trigger Confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      setCompletedOrder(createdOrder);
    } catch (err: any) {
      console.error('Order creation error:', err);
      const errorMsg = err?.message || 'Failed to place order. Please try again.';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedOrder ? (
          <>
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#1E3A5F] text-[#FF8C42]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Order Checkout & Payment</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Review print specifications & select payment method</p>
                </div>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex justify-between font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                <span>Print Job Summary</span>
                <span>{orderData.files.length} File(s)</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Pages & Copies:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {breakdown.totalPagesToPrint} pgs × {orderData.copies} copies
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Colour & Paper:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {orderData.colour ? 'Colour' : 'B&W'} • {orderData.sheetType}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Binding Style:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {orderData.binding} {orderData.spiralColor ? `(${orderData.spiralColor})` : ''}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white">
                <span>Subtotal:</span>
                <span>₹{breakdown.subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Loyalty Points Redeem Toggle */}
            {currentUser.points > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-200">Redeem Loyalty Points</p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        Available: {currentUser.points} Pts (10 Pts = ₹1 Discount)
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="w-5 h-5 accent-[#FF8C42] rounded cursor-pointer"
                  />
                </div>

                {usePoints && (
                  <div className="pt-2 border-t border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex justify-between">
                    <span>Loyalty Points Discount ({breakdown.pointsUsed} Pts):</span>
                    <span>-₹{breakdown.pointsDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Payment Option
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    paymentMethod === 'wallet'
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Wallet className="w-5 h-5 text-[#FF8C42]" />
                  <div>
                    <p className="text-xs font-bold">Campus Wallet</p>
                    <p className="text-[10px] opacity-80">Bal: ₹{currentUser.walletBalance.toFixed(2)}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                    paymentMethod === 'upi'
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#FF8C42]" />
                  <div>
                    <p className="text-xs font-bold">Instant UPI QR</p>
                    <p className="text-[10px] opacity-80">GPay/PhonePe/Paytm</p>
                  </div>
                </button>
              </div>

              {/* UPI QR Display if selected */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-2 animate-fadeIn">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                    UPI ID: <span className="font-bold text-[#FF8C42]">xeroxflow@campusbank</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Scan QR or confirm intent payment</p>
                </div>
              )}
            </div>

            {/* Total & Action Buttons */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Payable Amount</p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">₹{breakdown.total.toFixed(2)}</p>
              </div>

              <button
                onClick={handleConfirmAndPay}
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#FF8C42] hover:bg-[#e07b35] text-slate-950 font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" /> Pay & Submit Order
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success Dialog */
          <div className="text-center py-6 space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500">Your document has been added to the print queue.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-bold text-[#FF8C42]">{completedOrder.orderId}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{completedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Loyalty Points Earned:</span>
                <span className="font-bold text-amber-500">+{completedOrder.pointsEarned} Pts</span>
              </div>
            </div>

            <button
              onClick={() => onSuccess(completedOrder)}
              className="w-full py-3 bg-[#1E3A5F] hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Order Status</span>
              <ArrowRight className="w-4 h-4 text-[#FF8C42]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
