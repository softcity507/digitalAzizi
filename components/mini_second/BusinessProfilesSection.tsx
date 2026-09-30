'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Pencil, Trash2, Check, X, ArrowRightLeft, AlertTriangle, Plus } from 'lucide-react';
import { LANGUAGES } from '@/i18n/languages';
import { CurrencyCode } from '@/types/customer';

const AVAILABLE_CURRENCIES: CurrencyCode[] = [
  'AFN',
  'USD',
  'PKR',
  'IRR',
  'INR',
  'AED',
  'EUR',
  'GBP',
  'CNY',
  'TRY',
];

export default function BusinessProfilesSection() {
  const t = useTranslations('Settings');
  const { businesses, setActiveBusiness, addBusiness, updateBusiness, deleteBusiness } = useSettingsStore();

  // State for adding a new business
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCurrencies, setNewCurrencies] = useState<CurrencyCode[]>(['AFN', 'USD', 'PKR']);

  // Local state for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');

  // Local state for delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const toggleNewCurrency = (curr: CurrencyCode) => {
    setNewCurrencies((prev) => {
      if (prev.includes(curr)) {
        return prev.length > 1 ? prev.filter((c) => c !== curr) : prev;
      }
      return prev.length < 3 ? [...prev, curr] : [...prev.slice(1), curr];
    });
  };

  const handleCreateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addBusiness(newName.trim(), newSubtitle.trim(), newCurrencies);
    setNewName('');
    setNewSubtitle('');
    setNewCurrencies(['AFN', 'USD', 'PKR']);
    setIsAdding(false);
  };

  const handleStartEdit = (b: { id: string; name: string; subtitle: string }) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditSubtitle(b.subtitle);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateBusiness(id, editName, editSubtitle);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteBusiness(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Section Header with "New Add Business" Button on Top */}
      <div className="flex items-center justify-between px-1 flex-wrap gap-2">
        <div>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-content-primary">
            {t('businessProfiles')}
          </h3>
          <span className="text-[11px] font-mono font-medium text-content-muted">
            {t('activeBooksCount', { count: businesses.length })}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-500 text-slate-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isAdding ? t('cancel') : 'Add Business'}</span>
        </button>
      </div>

      {/* Add New Business Inline Card */}
      {isAdding && (
        <form
          onSubmit={handleCreateBusiness}
          className="w-full bg-surface border-2 border-sky-400/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-1 border-b border-surface-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Create New Business
            </h4>
            <span className="text-[10px] text-content-muted">
              Select any 3 currencies
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Business Name */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Business Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Herat Exchange & Settlement"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-surface-subtle border border-surface-border rounded-xl text-content-primary focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            {/* 2. Business Description */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                Description / Subtitle
              </label>
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder="e.g. Primary Trading Vault, Herat Gate"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-surface-border rounded-xl text-content-primary focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            {/* 3. Currency Selection (Any 3) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-content-muted">
                <span>Select 3 Currencies ({newCurrencies.length}/3)</span>
                <span className="text-[10px] text-slate-400">Click to toggle</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {AVAILABLE_CURRENCIES.map((curr) => {
                  const isSelected = newCurrencies.includes(curr);
                  return (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => toggleNewCurrency(curr)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-400 text-slate-950 border-sky-400 font-extrabold shadow-sm scale-[1.02]'
                          : 'bg-surface-subtle text-content-muted border-surface-border hover:text-content-primary'
                      }`}
                    >
                      {curr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-muted transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!newName.trim() || newCurrencies.length !== 3}
              className="px-4 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-sm transition-all cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </form>
      )}

      {/* Business List */}
      <div className="space-y-3">
        {businesses.map((b) => {
          const isEditing = editingId === b.id;

          return (
            <div
              key={b.id}
              className={`w-full bg-surface border rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm transition-all ${
                b.isActive ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-surface-border'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  {isEditing ? (
                    // Inline Edit Inputs
                    <div className="space-y-2 pr-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Business Name"
                        className="w-full px-2.5 py-1.5 text-sm font-bold bg-surface-subtle border border-surface-border rounded-lg text-content-primary focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        placeholder="Subtitle"
                        className="w-full px-2.5 py-1 text-xs bg-surface-subtle border border-surface-border rounded-lg text-content-muted focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    // Normal Display View
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-content-primary">{b.name}</h4>
                        {b.isActive ? (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Default Active</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-content-muted border border-surface-border">
                            {t('inactive')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-content-muted mt-0.5">{b.subtitle}</p>
                      {b.descriptionLocale && (
                        <p className="text-[11px] text-content-muted mt-1">
                          Description language: {LANGUAGES.find((language) => language.code === b.descriptionLocale)?.nativeName ?? b.descriptionLocale}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Icon Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(b.id)}
                        title="Save"
                        className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        title="Cancel"
                        className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-muted transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {!b.isActive ? (
                        <button
                          type="button"
                          onClick={() => setActiveBusiness(b.id)}
                          title="Set as Default Business"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-subtle hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/30 border border-surface-border text-content-secondary text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Set Default</span>
                        </button>
                      ) : null}

                      {/* Edit (Pencil) Icon Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        title="Edit Business"
                        className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete (Trash) Icon Button - Opens Confirmation Modal */}
                      <button
                        type="button"
                        onClick={() => setDeleteId(b.id)}
                        title="Delete Business"
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-bold tracking-wider uppercase text-content-muted">
                  {t('currenciesSupported')}
                </span>
                <div className="flex items-center gap-1.5">
                  {b.supportedCurrencies.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-surface-subtle border border-surface-border text-[10px] font-mono font-bold text-content-secondary"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-surface border border-surface-border rounded-2xl p-5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary">Delete Business Profile</h4>
                <p className="text-xs text-content-muted">Are you sure you want to delete this business profile? This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}