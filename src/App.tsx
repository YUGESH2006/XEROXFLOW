import { useEffect, useState } from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { OrderCheckoutModal } from './components/student/OrderCheckoutModal';
import { OrderForm } from './components/student/OrderForm';
import { OrderHistory } from './components/student/OrderHistory';
import { StudentDashboard } from './components/student/StudentDashboard';
import { TrackOrder } from './components/student/TrackOrder';
import { pbService } from './services/pocketbase';
import { Order, User } from './types';

const CURRENT_USER_STORAGE_KEY = 'xeroxflow_current_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Smart Re-order & Checkout Modal States
  const [reorderSourceOrder, setReorderSourceOrder] = useState<Order | null>(null);
  const [checkoutOrderData, setCheckoutOrderData] = useState<any | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<Order | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync current user with PocketBase storage changes
  useEffect(() => {
    const unsubscribe = pbService.subscribe(() => {
      if (currentUser) {
        pbService.getUserById(currentUser.id).then((refreshed) => {
          if (refreshed) setCurrentUser(refreshed);
        });
      }
    });
    return () => unsubscribe();
  }, [currentUser?.id]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user));
    if (user.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  };

  const handleInitiateReorder = (order: Order) => {
    setReorderSourceOrder(order);
    setActiveTab('new-order');
  };

  const handleOpenOrderModalFromDashboard = (order: Order) => {
    setActiveTab('history');
  };

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Frame Outer Wrapper */}
      <div
        className={
          isMobileFrame
            ? 'max-w-md mx-auto my-6 border-[12px] border-slate-800 rounded-[40px] shadow-2xl overflow-hidden bg-slate-100 dark:bg-[#0F172A] relative min-h-[880px]'
            : 'w-full min-h-screen'
        }
      >
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          onOpenProfile={() => setProfileModalOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {!currentUser ? (
            <AuthScreen onLoginSuccess={handleLoginSuccess} />
          ) : (
            <>
              {currentUser.role === 'admin' ? (
                <AdminPanel adminUser={currentUser} />
              ) : (
                <>
                  {activeTab === 'dashboard' && (
                    <StudentDashboard
                      currentUser={currentUser}
                      setActiveTab={setActiveTab}
                      onInitiateReorder={handleInitiateReorder}
                      onOpenOrderModal={handleOpenOrderModalFromDashboard}
                    />
                  )}

                  {activeTab === 'new-order' && (
                    <OrderForm
                      currentUser={currentUser}
                      reorderSourceOrder={reorderSourceOrder}
                      onClearReorderSource={() => setReorderSourceOrder(null)}
                      onProceedToCheckout={(data) => setCheckoutOrderData(data)}
                    />
                  )}

                  {activeTab === 'history' && (
                    <OrderHistory
                      currentUser={currentUser}
                      onInitiateReorder={handleInitiateReorder}
                      onTrackOrder={(ord) => {
                        setSelectedTrackOrder(ord);
                        setActiveTab('track');
                      }}
                    />
                  )}

                  {activeTab === 'track' && (
                    <TrackOrder
                      currentUser={currentUser}
                      initialOrderId={selectedTrackOrder?.orderId}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {/* Checkout Modal */}
        {checkoutOrderData && currentUser && (
          <OrderCheckoutModal
            currentUser={currentUser}
            orderData={checkoutOrderData}
            onClose={() => setCheckoutOrderData(null)}
            onSuccess={(newOrder) => {
              setCheckoutOrderData(null);
              setReorderSourceOrder(null);
              setSelectedTrackOrder(newOrder);
              setActiveTab('track');
            }}
          />
        )}

        {/* Profile Modal */}
        {profileModalOpen && currentUser && (
          <ProfileModal
            currentUser={currentUser}
            onClose={() => setProfileModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
