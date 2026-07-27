import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Info,
  Layers,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { BindingType, Order, OrderDraft, SheetType, SpiralColor, UploadedFile, User } from '../../types';
import { clearOrderDraft, loadOrderDraft, saveOrderDraft } from '../../utils/draftStorage';
import { analyzeUploadedFile, formatFileSize } from '../../utils/fileAnalyzer';
import { calculatePrice } from '../../utils/priceCalculator';

interface OrderFormProps {
  currentUser: User;
  reorderSourceOrder: Order | null;
  onClearReorderSource: () => void;
  onProceedToCheckout: (orderData: any) => void;
}

export function OrderForm({
  currentUser,
  reorderSourceOrder,
  onClearReorderSource,
  onProceedToCheckout,
}: OrderFormProps) {
  // Form State
  const [description, setDescription] = useState('');
  const [fromPage, setFromPage] = useState<number>(1);
  const [toPage, setToPage] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [colour, setColour] = useState<boolean>(false);
  const [sheetType, setSheetType] = useState<SheetType>('A4');
  const [customWidth, setCustomWidth] = useState<number>(21);
  const [customHeight, setCustomHeight] = useState<number>(29.7);
  const [binding, setBinding] = useState<BindingType>('None');
  const [spiralColor, setSpiralColor] = useState<SpiralColor>('Black');

  // File Upload State
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft Recovery State
  const [savedDraft, setSavedDraft] = useState<OrderDraft | null>(null);

  // Predictive Chip state
  const [predictedPages, setPredictedPages] = useState<number>(1);

  // Handle Draft Initialization & Recovery check
  useEffect(() => {
    const draft = loadOrderDraft();
    if (draft && !reorderSourceOrder) {
      setSavedDraft(draft);
    }
  }, []);

  // Handle Smart Re-order Pre-fill
  useEffect(() => {
    if (reorderSourceOrder) {
      setDescription(`Re-order based on ${reorderSourceOrder.orderId}: ${reorderSourceOrder.description}`);
      setFromPage(reorderSourceOrder.fromPage);
      setToPage(reorderSourceOrder.toPage);
      setCopies(reorderSourceOrder.copies);
      setColour(reorderSourceOrder.colour);
      setSheetType(reorderSourceOrder.sheetType);
      if (reorderSourceOrder.customWidth) setCustomWidth(reorderSourceOrder.customWidth);
      if (reorderSourceOrder.customHeight) setCustomHeight(reorderSourceOrder.customHeight);
      setBinding(reorderSourceOrder.binding);
      if (reorderSourceOrder.spiralColor) setSpiralColor(reorderSourceOrder.spiralColor);
    }
  }, [reorderSourceOrder]);

  // Auto-Save Draft on Field Modification
  useEffect(() => {
    if (description || fromPage !== 1 || toPage !== 1 || copies !== 1 || colour || sheetType !== 'A4' || binding !== 'None') {
      saveOrderDraft({
        description,
        fromPage,
        toPage,
        copies,
        colour,
        sheetType,
        customWidth,
        customHeight,
        binding,
        spiralColor,
      });
    }
  }, [description, fromPage, toPage, copies, colour, sheetType, customWidth, customHeight, binding, spiralColor]);

  // Restore Saved Draft
  const handleRestoreDraft = () => {
    if (!savedDraft) return;
    setDescription(savedDraft.description);
    setFromPage(savedDraft.fromPage);
    setToPage(savedDraft.toPage);
    setCopies(savedDraft.copies);
    setColour(savedDraft.colour);
    setSheetType(savedDraft.sheetType);
    if (savedDraft.customWidth) setCustomWidth(savedDraft.customWidth);
    if (savedDraft.customHeight) setCustomHeight(savedDraft.customHeight);
    setBinding(savedDraft.binding);
    if (savedDraft.spiralColor) setSpiralColor(savedDraft.spiralColor);
    setSavedDraft(null);
  };

  // Clear Saved Draft
  const handleClearDraft = () => {
    clearOrderDraft();
    setSavedDraft(null);
  };

  // File Upload Processing
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const newFiles: UploadedFile[] = [];
    let totalDetectedPages = 0;

    for (let i = 0; i < files.length; i++) {
      const analyzed = await analyzeUploadedFile(files[i]);
      newFiles.push(analyzed);
      totalDetectedPages += analyzed.pageCount || 1;

      // Auto set sheet type if first image file detected large dimensions
      if (i === 0 && analyzed.suggestedSheetType) {
        setSheetType(analyzed.suggestedSheetType);
      }
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    setPredictedPages(totalDetectedPages);
    setFromPage(1);
    setToPage(Math.max(1, totalDetectedPages));
    setIsUploading(false);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const filtered = prev.filter((f) => f.id !== fileId);
      const remainingPages = filtered.reduce((acc, curr) => acc + (curr.pageCount || 1), 0);
      setPredictedPages(Math.max(1, remainingPages));
      setToPage(Math.max(1, remainingPages));
      return filtered;
    });
  };

  // Calculate live breakdown
  const breakdown = calculatePrice({
    fromPage,
    toPage,
    copies,
    colour,
    sheetType,
    customWidth,
    customHeight,
    binding,
    usePoints: false,
    availablePoints: currentUser.points,
  });

  // Handle Form Submission -> Proceed to Checkout Modal
  const handleSubmitForm = (e: FormEvent) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one document file for printing.');
      return;
    }

    onProceedToCheckout({
      description,
      fromPage,
      toPage,
      copies,
      colour,
      sheetType,
      customWidth: sheetType === 'Others' ? customWidth : undefined,
      customHeight: sheetType === 'Others' ? customHeight : undefined,
      binding,
      spiralColor: binding === 'Spiral' ? spiralColor : undefined,
      files: uploadedFiles,
      reorderFromId: reorderSourceOrder?.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>New Campus Print Order</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure printing options, sheet dimensions, binding, and preview real-time estimates.
          </p>
        </div>

        {reorderSourceOrder && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF8C42]/10 border border-[#FF8C42]/30 text-xs font-semibold text-[#FF8C42]">
            <RotateCcw className="w-4 h-4" />
            <span>Re-ordering #{reorderSourceOrder.orderId}</span>
            <button
              onClick={onClearReorderSource}
              className="ml-2 text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Saved Draft Recovery Banner */}
      {savedDraft && !reorderSourceOrder && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 dark:text-amber-200 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>Saved draft found from {new Date(savedDraft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg hover:bg-amber-400 transition-colors"
            >
              Restore Draft
            </button>
            <button
              onClick={handleClearDraft}
              className="px-2 py-1 text-slate-500 dark:text-slate-400 hover:text-red-500"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Main Order Configuration Form */}
      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* SECTION 1: Document Upload */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#FF8C42]" />
              <span>1. Upload Documents / Images</span>
            </label>
            <span className="text-xs text-slate-400">PDF, PNG, JPG, DOC, TXT</span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#FF8C42] dark:hover:border-[#FF8C42] bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center cursor-pointer transition-colors group"
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 text-[#FF8C42] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Click to upload or drag & drop files here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports multiple document uploads with automatic page detection
            </p>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Uploaded Files ({uploadedFiles.length}):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {file.type.startsWith('image/') && file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-10 h-10 rounded object-cover border border-slate-300 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[#1E3A5F] text-[#FF8C42] flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="overflow-hidden text-left">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {formatFileSize(file.size)} • {file.pageCount || 1} page(s)
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Job Description */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF8C42]" />
              <span>2. Description / Printing Notes</span>
            </label>
            <span className="text-xs text-slate-400">{description.length}/200 chars</span>
          </div>
          <textarea
            maxLength={200}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Print double sided, unit 1 to 4 notes for DBMS lab examination."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF8C42] focus:border-transparent"
          />
        </div>

        {/* SECTION 3: Page Range & Copies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white block">
              3. Page Selection Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">From Page</label>
                <input
                  type="number"
                  min={1}
                  value={fromPage}
                  onChange={(e) => setFromPage(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">To Page</label>
                <input
                  type="number"
                  min={fromPage}
                  value={toPage}
                  onChange={(e) => setToPage(Math.max(fromPage, parseInt(e.target.value) || fromPage))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Total Pages per copy: <span className="font-bold text-slate-900 dark:text-white">{breakdown.totalPagesToPrint}</span>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white block">
              4. Number of Copies (1-100)
            </label>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setCopies((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                min={1}
                max={100}
                value={copies}
                onChange={(e) => setCopies(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-20 text-center px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setCopies((prev) => Math.min(100, prev + 1))}
                className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Print Options (Colour, Sheet Type, Binding) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF8C42]" />
            <span>5. Print & Sheet Settings</span>
          </h3>

          {/* Colour Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Colour Mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {colour ? '🎨 Colour Print (₹5.0 / page)' : '⚫ Black & White Print (₹2.5 / page)'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={colour}
                onChange={(e) => setColour(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF8C42]"></div>
            </label>
          </div>

          {/* Sheet Type */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sheet Type / Paper Size
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['A4', 'A3', 'Poster', 'Magazine', 'Others'] as SheetType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSheetType(type)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    sheetType === type
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Custom Width & Height if "Others" selected */}
            {sheetType === 'Others' && (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="100"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 21)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="5"
                    max="100"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 29.7)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Binding Options */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Binding Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'None', label: 'None (₹0)' },
                { type: 'Spiral', label: 'Spiral (₹15)' },
                { type: 'Normal', label: 'Normal (₹10)' },
                { type: 'Chart', label: 'Chart (₹8)' },
              ].map((b) => (
                <button
                  type="button"
                  key={b.type}
                  onClick={() => setBinding(b.type as BindingType)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                    binding === b.type
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            {/* Spiral Color selector if Spiral binding is chosen */}
            {binding === 'Spiral' && (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Spiral Ring Colour
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Black', 'White', 'Blue', 'Red'] as SpiralColor[]).map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setSpiralColor(c)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        spiralColor === c
                          ? 'bg-[#FF8C42] text-slate-950 font-bold border-[#FF8C42]'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 5: Real-time Price Breakdown & Proceed Button */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[#FF8C42] uppercase tracking-wider">
            Price Breakdown Summary
          </h3>

          <div className="space-y-2 text-xs text-slate-300 border-b border-slate-800 pb-3">
            <div className="flex justify-between">
              <span>
                Printing ({breakdown.totalPagesToPrint} pgs × {copies} copy × ₹{breakdown.ratePerPage}/pg × {breakdown.sheetMultiplier} multiplier):
              </span>
              <span className="font-mono font-semibold text-white">₹{breakdown.totalPrintingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Binding ({binding} × {copies} copy @ ₹{breakdown.bindingFeePerCopy}/copy):
              </span>
              <span className="font-mono font-semibold text-white">₹{breakdown.totalBindingCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-2xl font-extrabold text-white">Total: ₹{breakdown.subtotal.toFixed(2)}</p>
              <p className="text-xs text-amber-400 font-medium mt-0.5">
                🎉 You will earn <span className="font-bold">+{breakdown.potentialPointsEarned} Loyalty Points</span> on this order!
              </p>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3.5 bg-[#FF8C42] hover:bg-[#e07b35] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Proceed to Checkout</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
