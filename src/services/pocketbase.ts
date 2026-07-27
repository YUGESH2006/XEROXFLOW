import { IssueReport, Order, OrderStatus, User, UserRole } from '../types';

const POCKETBASE_DEFAULT_URL = 'http://127.0.0.1:8090';
const USERS_STORAGE_KEY = 'xeroxflow_pb_users';
const ORDERS_STORAGE_KEY = 'xeroxflow_pb_orders';
const PB_URL_KEY = 'xeroxflow_pb_url';

// Default Demo Users
const INITIAL_DEMO_USERS: User[] = [
  {
    id: 'user_student_1',
    name: 'Ananya Sharma',
    username: '21CS042',
    role: 'student',
    phone: '+91 98765 43210',
    department: 'Computer Science',
    year: '3rd Year',
    dob: '2003-05-14',
    points: 120,
    walletBalance: 450,
    created: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'user_staff_1',
    name: 'Prof. Rajesh Kumar',
    username: 'STF-809',
    role: 'staff',
    phone: '+91 98123 45678',
    department: 'Electrical Engineering',
    points: 350,
    walletBalance: 1200,
    created: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'user_admin_1',
    name: 'Campus Xerox Admin',
    username: 'ADMIN01',
    role: 'admin',
    phone: '+91 99999 00000',
    department: 'Xerox & Print Services',
    points: 0,
    walletBalance: 0,
    created: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

// Initial Demo Orders
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord_101',
    orderId: 'XRX-20260727-001',
    userId: 'user_student_1',
    userName: 'Ananya Sharma',
    userRole: 'student',
    userDepartment: 'Computer Science',
    userPhone: '+91 98765 43210',
    description: 'Operating Systems Notes - Units 1 to 4',
    fromPage: 1,
    toPage: 24,
    copies: 2,
    colour: false,
    sheetType: 'A4',
    binding: 'Spiral',
    spiralColor: 'Blue',
    status: 'Printing',
    subtotal: 150.0,
    pointsEarned: 15,
    pointsUsed: 0,
    total: 150.0,
    paymentMethod: 'wallet',
    files: [
      {
        id: 'f_101',
        name: 'OS_Unit_1_4_Notes.pdf',
        size: 2450000,
        type: 'application/pdf',
        pageCount: 24,
        suggestedSheetType: 'A4',
      },
    ],
    created: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ord_102',
    orderId: 'XRX-20260727-002',
    userId: 'user_student_1',
    userName: 'Ananya Sharma',
    userRole: 'student',
    userDepartment: 'Computer Science',
    userPhone: '+91 98765 43210',
    description: 'Design Project Poster Presentation',
    fromPage: 1,
    toPage: 1,
    copies: 3,
    colour: true,
    sheetType: 'Poster',
    binding: 'None',
    status: 'Pending',
    subtotal: 37.5,
    pointsEarned: 3,
    pointsUsed: 10,
    total: 36.5,
    paymentMethod: 'upi',
    files: [
      {
        id: 'f_102',
        name: 'AI_Project_Poster.png',
        size: 4200000,
        type: 'image/png',
        pageCount: 1,
        width: 2400,
        height: 1800,
        suggestedSheetType: 'Poster',
      },
    ],
    created: new Date(Date.now() - 1800000).toISOString(),
    updated: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'ord_100',
    orderId: 'XRX-20260726-089',
    userId: 'user_student_1',
    userName: 'Ananya Sharma',
    userRole: 'student',
    userDepartment: 'Computer Science',
    userPhone: '+91 98765 43210',
    description: 'DBMS Lab Manual 2026',
    fromPage: 1,
    toPage: 40,
    copies: 1,
    colour: false,
    sheetType: 'A4',
    binding: 'Normal',
    status: 'Completed',
    subtotal: 110.0,
    pointsEarned: 11,
    pointsUsed: 0,
    total: 110.0,
    paymentMethod: 'wallet',
    files: [
      {
        id: 'f_100',
        name: 'DBMS_Lab_Manual.pdf',
        size: 1800000,
        type: 'application/pdf',
        pageCount: 40,
        suggestedSheetType: 'A4',
      },
    ],
    created: new Date(Date.now() - 86400000).toISOString(),
    updated: new Date(Date.now() - 43200000).toISOString(),
  },
];

class PocketBaseService {
  private url: string;
  private listeners: Array<() => void> = [];

  constructor() {
    this.url = localStorage.getItem(PB_URL_KEY) || POCKETBASE_DEFAULT_URL;
    this.initStore();
  }

  private initStore() {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
    }
    if (!localStorage.getItem(ORDERS_STORAGE_KEY)) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
    }
  }

  public getPocketBaseUrl(): string {
    return this.url;
  }

  public setPocketBaseUrl(newUrl: string): void {
    this.url = newUrl;
    localStorage.setItem(PB_URL_KEY, newUrl);
    this.notifyListeners();
  }

  // Event Subscription for Real-time Updates across components & tabs
  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
    // Also trigger custom window event for real-time reactivity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('xeroxflow_update'));
    }
  }

  // --- USERS API ---
  public async getUsers(): Promise<User[]> {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_DEMO_USERS;
  }

  public async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  public async getUserByUsername(username: string, role?: UserRole): Promise<User | null> {
    const users = await this.getUsers();
    const cleanUsername = username.trim().toLowerCase();
    return (
      users.find(
        (u) =>
          u.username.toLowerCase() === cleanUsername &&
          (!role || u.role === role)
      ) || null
    );
  }

  public async createUser(user: Omit<User, 'id' | 'created'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      created: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    this.notifyListeners();
    return newUser;
  }

  public async updateUserPointsAndWallet(
    userId: string,
    pointsDelta: number,
    walletDelta: number = 0
  ): Promise<User | null> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    users[index].points = Math.max(0, users[index].points + pointsDelta);
    users[index].walletBalance = Math.max(0, users[index].walletBalance + walletDelta);

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    this.notifyListeners();
    return users[index];
  }

  // --- ORDERS API ---
  public async getOrders(): Promise<Order[]> {
    try {
      const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const orders: Order[] = raw ? JSON.parse(raw) : INITIAL_DEMO_ORDERS;
      return orders.sort(
        (a, b) => new Date(b.created || Date.now()).getTime() - new Date(a.created || Date.now()).getTime()
      );
    } catch {
      return INITIAL_DEMO_ORDERS;
    }
  }

  public async getOrdersByUserId(userId: string): Promise<Order[]> {
    const orders = await this.getOrders();
    return orders.filter((o) => o.userId === userId);
  }

  public async getOrderById(idOrOrderId: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return (
      orders.find((o) => o.id === idOrOrderId || o.orderId === idOrOrderId) || null
    );
  }

  public async createOrder(orderData: Omit<Order, 'id' | 'orderId' | 'created' | 'updated'>): Promise<Order> {
    const orders = await this.getOrders();
    
    // Format Order ID: XRX-YYYYMMDD-###
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const todayOrdersCount = orders.filter((o) => o.orderId && o.orderId.includes(dateStr)).length + 1;
    const seqStr = String(todayOrdersCount).padStart(3, '0');
    const orderId = `XRX-${dateStr}-${seqStr}`;

    const newOrder: Order = {
      ...orderData,
      id: 'ord_' + Math.random().toString(36).substring(2, 9),
      orderId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };

    orders.unshift(newOrder);

    // Save orders safely without crashing if base64 data exceeds localStorage quota
    const saveOrdersSafely = (ordersList: Order[]) => {
      try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersList));
      } catch (err) {
        console.warn('LocalStorage quota exceeded. Truncating file preview payloads to save order safely.', err);
        const strippedOrders = ordersList.map((ord) => ({
          ...ord,
          files: ord.files?.map((f) => ({
            ...f,
            dataUrl: f.dataUrl && f.dataUrl.length > 500 ? f.dataUrl.substring(0, 100) + '...' : f.dataUrl,
            previewUrl: f.previewUrl && f.previewUrl.length > 500 ? f.previewUrl.substring(0, 100) + '...' : f.previewUrl,
          })),
        }));
        try {
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(strippedOrders));
        } catch {
          // Keep top 20 orders if storage is extremely full
          localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(strippedOrders.slice(0, 20)));
        }
      }
    };

    saveOrdersSafely(orders);

    // Atomically deduct used points & add earned points for user
    try {
      if (orderData.pointsUsed > 0 || orderData.pointsEarned > 0) {
        const pointsNet = orderData.pointsEarned - orderData.pointsUsed;
        const walletNet = orderData.paymentMethod === 'wallet' ? -orderData.total : 0;
        await this.updateUserPointsAndWallet(orderData.userId, pointsNet, walletNet);
      } else if (orderData.paymentMethod === 'wallet') {
        await this.updateUserPointsAndWallet(orderData.userId, 0, -orderData.total);
      }
    } catch (userErr) {
      console.warn('Failed to update user wallet/points:', userErr);
    }

    this.notifyListeners();
    return newOrder;
  }

  public async updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderId === orderId);
    if (index === -1) return null;

    orders[index].status = status;
    orders[index].updated = new Date().toISOString();

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    this.notifyListeners();
    return orders[index];
  }

  public async updateBulkOrderStatus(orderIds: string[], status: OrderStatus): Promise<number> {
    const orders = await this.getOrders();
    let updatedCount = 0;

    orders.forEach((o) => {
      if (orderIds.includes(o.id) || orderIds.includes(o.orderId)) {
        o.status = status;
        o.updated = new Date().toISOString();
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
      this.notifyListeners();
    }
    return updatedCount;
  }

  public async reportOrderIssue(orderId: string, issue: Omit<IssueReport, 'id' | 'reportedAt'>): Promise<Order | null> {
    const orders = await this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId || o.orderId === orderId);
    if (index === -1) return null;

    const fullIssue: IssueReport = {
      ...issue,
      id: 'iss_' + Math.random().toString(36).substring(2, 9),
      reportedAt: new Date().toISOString(),
    };

    orders[index].issueReport = fullIssue;
    orders[index].updated = new Date().toISOString();

    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    this.notifyListeners();
    return orders[index];
  }
}

export const pbService = new PocketBaseService();
