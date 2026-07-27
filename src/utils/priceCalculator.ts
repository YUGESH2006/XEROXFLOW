import { BindingType, PriceBreakdown, SheetType } from '../types';

export function calculatePrice(params: {
  fromPage: number;
  toPage: number;
  copies: number;
  colour: boolean;
  sheetType: SheetType;
  customWidth?: number;
  customHeight?: number;
  binding: BindingType;
  usePoints: boolean;
  availablePoints: number;
}): PriceBreakdown {
  const {
    fromPage,
    toPage,
    copies,
    colour,
    sheetType,
    customWidth = 21,
    customHeight = 29.7,
    binding,
    usePoints,
    availablePoints,
  } = params;

  // Valid page count calculation
  const validFrom = Math.max(1, fromPage);
  const validTo = Math.max(validFrom, toPage);
  const totalPagesToPrint = Math.max(1, validTo - validFrom + 1);
  const validCopies = Math.min(100, Math.max(1, copies));

  // Base rate per page
  const ratePerPage = colour ? 5.0 : 2.5;

  // Sheet multiplier
  let sheetMultiplier = 1.0;
  switch (sheetType) {
    case 'A4':
      sheetMultiplier = 1.0;
      break;
    case 'A3':
      sheetMultiplier = 1.8;
      break;
    case 'Poster':
      sheetMultiplier = 2.5;
      break;
    case 'Magazine':
      sheetMultiplier = 2.0;
      break;
    case 'Others':
      // Calculate ratio compared to standard A4 (21 x 29.7 cm = 623.7 cm²)
      const area = (customWidth || 21) * (customHeight || 29.7);
      const ratio = area / 623.7;
      sheetMultiplier = Math.max(1.0, Math.round(ratio * 100) / 100);
      break;
  }

  // Printing cost per copy
  const printingCostPerCopy = totalPagesToPrint * ratePerPage * sheetMultiplier;
  const totalPrintingCost = printingCostPerCopy * validCopies;

  // Binding fee per copy
  let bindingFeePerCopy = 0;
  switch (binding) {
    case 'Spiral':
      bindingFeePerCopy = 15;
      break;
    case 'Normal':
      bindingFeePerCopy = 10;
      break;
    case 'Chart':
      bindingFeePerCopy = 8;
      break;
    case 'None':
    default:
      bindingFeePerCopy = 0;
      break;
  }

  const totalBindingCost = bindingFeePerCopy * validCopies;
  const subtotal = Math.round((totalPrintingCost + totalBindingCost) * 100) / 100;

  // Points calculation: 10 points = ₹1
  let pointsUsed = 0;
  let pointsDiscount = 0;

  if (usePoints && availablePoints > 0) {
    const maxDiscountPossible = subtotal; // Cannot discount more than subtotal
    const maxPointsUsableForSubtotal = Math.floor(maxDiscountPossible * 10);
    pointsUsed = Math.min(availablePoints, maxPointsUsableForSubtotal);
    pointsDiscount = Math.round((pointsUsed / 10) * 100) / 100;
  }

  const total = Math.max(0, Math.round((subtotal - pointsDiscount) * 100) / 100);
  
  // Earn 10% of subtotal as points (rounded down)
  const potentialPointsEarned = Math.floor(subtotal * 0.1);

  return {
    totalPagesToPrint,
    ratePerPage,
    sheetMultiplier,
    printingCostPerCopy,
    totalPrintingCost,
    bindingFeePerCopy,
    totalBindingCost,
    subtotal,
    pointsUsed,
    pointsDiscount,
    total,
    potentialPointsEarned,
  };
}
