export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string; // Roll No / Staff ID / Admin ID
  role: UserRole;
  phone: string;
  department: string;
  year?: string; // For students e.g. "1st Year", "2nd Year", "3rd Year", "4th Year"
  dob?: string;
  points: number;
  walletBalance: number;
  created: string;
}

export type SheetType = 'A4' | 'A3' | 'Poster' | 'Magazine' | 'Others';
export type BindingType = 'None' | 'Spiral' | 'Normal' | 'Chart';
export type SpiralColor = 'Black' | 'White' | 'Blue' | 'Red';
export type OrderStatus = 'Pending' | 'Printing' | 'Completed' | 'Issued';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  previewUrl?: string;
  pageCount?: number;
  width?: number;
  height?: number;
  suggestedSheetType?: SheetType;
}

export interface IssueReport {
  id: string;
  orderId: string;
  reason: string;
  description: string;
  reportedAt: string;
  adminName: string;
}

export interface Order {
  id: string;
  orderId: string; // e.g. XRX-20260727-001
  userId: string;
  userName: string;
  userRole: UserRole;
  userDepartment: string;
  userPhone: string;
  description: string;
  fromPage: number;
  toPage: number;
  copies: number;
  colour: boolean; // true = Colour (₹5/page), false = B&W (₹2.5/page)
  sheetType: SheetType;
  customWidth?: number; // in cm
  customHeight?: number; // in cm
  binding: BindingType; // None, Spiral, Normal, Chart
  spiralColor?: SpiralColor;
  status: OrderStatus;
  subtotal: number;
  pointsEarned: number;
  pointsUsed: number;
  total: number;
  files: UploadedFile[];
  reorderFromId?: string;
  paymentMethod: 'wallet' | 'upi';
  issueReport?: IssueReport;
  created: string;
  updated: string;
}

export interface OrderDraft {
  description: string;
  fromPage: number;
  toPage: number;
  copies: number;
  colour: boolean;
  sheetType: SheetType;
  customWidth?: number;
  customHeight?: number;
  binding: BindingType;
  spiralColor?: SpiralColor;
  savedAt: string;
}

export interface PriceBreakdown {
  totalPagesToPrint: number; // (toPage - fromPage + 1)
  ratePerPage: number; // ₹2.5 for B&W, ₹5.0 for Colour
  sheetMultiplier: number; // 1 for A4, 1.8 for A3, 2.5 for Poster, etc.
  printingCostPerCopy: number;
  totalPrintingCost: number; // printingCostPerCopy * copies
  bindingFeePerCopy: number; // ₹0 for None, ₹15 Spiral, ₹10 Normal, ₹8 Chart
  totalBindingCost: number; // bindingFeePerCopy * copies
  subtotal: number; // totalPrintingCost + totalBindingCost
  pointsUsed: number;
  pointsDiscount: number; // 10 points = ₹1
  total: number; // subtotal - pointsDiscount
  potentialPointsEarned: number; // Math.floor(subtotal * 0.10)
}

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  orderId: string;
  type: 'earned' | 'redeemed';
  points: number;
  amountEquivalent: number;
  description: string;
  timestamp: string;
}
