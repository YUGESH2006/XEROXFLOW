import { OrderDraft } from '../types';

const DRAFT_KEY = 'xeroxflow_order_draft';

export function saveOrderDraft(draft: Omit<OrderDraft, 'savedAt'>): void {
  try {
    const fullDraft: OrderDraft = {
      ...draft,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(fullDraft));
  } catch (err) {
    console.error('Failed to save draft:', err);
  }
}

export function loadOrderDraft(): OrderDraft | null {
  try {
    const data = localStorage.getItem(DRAFT_KEY);
    if (!data) return null;
    return JSON.parse(data) as OrderDraft;
  } catch (err) {
    console.error('Failed to load draft:', err);
    return null;
  }
}

export function clearOrderDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch (err) {
    console.error('Failed to clear draft:', err);
  }
}
