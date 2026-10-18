'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SYSTEM_DEFAULT_BUSINESS_SUBTITLE } from '@/types/settings';
import { Pencil, Trash2, Check, X, ArrowRightLeft, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { CurrencyCode } from '@/types/customer';
import { FREE_TRIAL_LIMITS } from '@/lib/planLimits';
import verifyAndAuthorizeAction, { verifyPinAction } from '@/components/max_second/verifyAndAuthorizeAction';

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
  const { businesses, customers, fetchBusinesses, setActiveBusiness, addBusiness, updateBusiness, deleteBusiness } = useSettingsStore();
  const canCreateBusiness = businesses.length < FREE_TRIAL_LIMITS.businesses;

  // State for adding a new business
  const [isAdding, setIsAdding] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCurrencies, setNewCurrencies] = useState<CurrencyCode[]>(['AFN', 'USD', 'PKR']);
  // Local state for inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');

  // Local state for delete confirmation modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [verification, setVerification] = useState<{ action: 'edit' | 'save' | 'delete'; id: string } | null>(null);
  const [verificationUserId, setVerificationUserId] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [verificationPin, setVerificationPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    fetchBusinesses().catch((error: unknown) => {
      if (isCurrent) {
        setDatabaseError(error instanceof Error ? error.message : 'Unable to load business profiles.');
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [fetchBusinesses]);

  const toggleNewCurrency = (curr: CurrencyCode) => {
    setNewCurrencies((prev) => {
      if (prev.includes(curr)) {
        return prev.length > 1 ? prev.filter((c) => c !== curr) : prev;
      }
      return prev.length < 3 ? [...prev, curr] : [...prev.slice(1), curr];
    });
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || isCreating) return;
    const normalizedName = newName.trim().toLowerCase();
    if (businesses.some((business) => business.name.trim().toLowerCase() === normalizedName)) {
      setDatabaseError('A business with this name already exists in your account.');
      return;
    }
    setIsCreating(true);
    setDatabaseError(null);
    try {
      const res = await addBusiness(newName.trim(), newSubtitle.trim(), newCurrencies);

      console.log("res.data", res)
      setNewName('');
      setNewSubtitle('');
      setNewCurrencies(['AFN', 'USD', 'PKR']);
      setIsAdding(false);
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : 'Unable to create business profile.');
    } finally {
      setIsCreating(false);
    }
  };

  const requestVerification = async (action: 'edit' | 'save' | 'delete', id: string) => {
    setDatabaseError(null);
    try {
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (!userRes.ok || !userData.success || !userData.user?.id) {
        throw new Error('Please sign in again to verify this action.');
      }
      const statusRes = await fetch('/api/auth/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', userId: userData.user.id }),
      });
      const statusData = await statusRes.json();
      if (!statusRes.ok || !statusData.success) throw new Error(statusData.error || 'Could not load verification methods.');
      const pinConfigured = Boolean(statusData.status?.hasPin);
      const authenticatorConfigured = Boolean(statusData.status?.hasCredentials);
      if (!pinConfigured && !authenticatorConfigured) {
        throw new Error('Set a PIN or register an authenticator in Settings > Biometrics before editing or deleting businesses.');
      }
      setVerificationUserId(userData.user.id);
      setHasPin(pinConfigured);
      setHasCredentials(authenticatorConfigured);
      setVerificationPin('');
      setVerification({ action, id });
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : 'Unable to start verification.');
    }
  };

  const finishVerifiedAction = async () => {
    if (!verification) return;
    const pending = verification;
    setVerification(null);
    setVerificationPin('');
    try {
      if (pending.action === 'edit') {
        const business = businesses.find((item) => item.id === pending.id);
        if (!business) return;
        setEditingId(business.id);
        setEditName(business.name);
        setEditSubtitle(business.subtitle);
      } else if (pending.action === 'save') {
        if (!editName.trim()) return;
        await updateBusiness(pending.id, editName, editSubtitle);
        setEditingId(null);
      } else {
        await deleteBusiness(pending.id);
        setDeleteId(null);
      }
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : `Unable to ${pending.action} business profile.`);
    }
  };

  const verifyWithBiometric = async () => {
    if (!verificationUserId || verifying) return;
    setVerifying(true);
    try {
      if (await verifyAndAuthorizeAction(verificationUserId)) await finishVerifiedAction();
      else setDatabaseError('Authenticator verification failed or was cancelled. Try again or use your PIN.');
    } finally {
      setVerifying(false);
    }
  };

  const verifyWithPin = async () => {
    if (!verificationUserId || verificationPin.length < 4 || verifying) return;
    setVerifying(true);
    try {
      if (await verifyPinAction(verificationUserId, verificationPin)) await finishVerifiedAction();
      else setDatabaseError('Incorrect PIN. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleStartEdit = (b: { id: string; name: string; subtitle: string }) => {
    void requestVerification('edit', b.id);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    void requestVerification('save', id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      void requestVerification('delete', deleteId);
    }
  };

  const handleSetActive = async (id: string) => {
    setDatabaseError(null);
    try {
      await setActiveBusiness(id);
    } catch (error) {
      setDatabaseError(error instanceof Error ? error.message : 'Unable to activate business profile.');
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
          <p className="text-[10px] text-content-muted">
            Free trial: {businesses.length}/{FREE_TRIAL_LIMITS.businesses} businesses
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          disabled={!isAdding && !canCreateBusiness}
          title={!canCreateBusiness ? `Free trial limit: ${FREE_TRIAL_LIMITS.businesses} businesses` : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-brand-foreground text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isAdding ? t('cancel') : t('addNewBusiness')}</span>
        </button>
      </div>

      {databaseError && (
        <p role="alert" className="rounded-lg border border-debit/30 bg-debit-subtle px-3 py-2 text-xs text-debit-text">
          {databaseError}
        </p>
      )}

      {/* Add New Business Inline Card */}
      {isAdding && (
        <form
          onSubmit={handleCreateBusiness}
          className="w-full bg-surface border-2 border-brand/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-1 border-b border-surface-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand">
              {t('createNewBusiness')}
            </h4>
            <span className="text-[10px] text-content-muted">
              {t('select3Currencies')}
            </span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Business Name */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('businessName')} *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('businessPlaceholder')}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm font-bold bg-surface-subtle border border-surface-border rounded-xl text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* 2. Business Description */}
            <div>
              <label className="block text-xs font-semibold text-content-muted mb-1">
                {t('businessDescription')}
              </label>
              <input
                type="text"
                value={newSubtitle}
                onChange={(e) => setNewSubtitle(e.target.value)}
                placeholder={t('businessDescPlaceholder')}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-surface-subtle border border-surface-border rounded-xl text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>

            {/* 3. Currency Selection (Any 3) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-content-muted">
                <span>{t('dealCurrencies')} ({newCurrencies.length}/3)</span>
                <span className="text-[10px] text-content-tertiary">{t('clickToToggle')}</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {AVAILABLE_CURRENCIES.map((curr) => {
                  const isSelected = newCurrencies.includes(curr);
                  return (
                    <button
                      type="button"
                      key={curr}
                      onClick={() => toggleNewCurrency(curr)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${isSelected
                          ? 'bg-brand text-brand-foreground border-brand font-extrabold shadow-sm scale-[1.02]'
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
              disabled={isCreating}
              className="px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-muted transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isCreating || !newName.trim() || newCurrencies.length !== 3}
              className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-brand-foreground shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('saving')}</span>
                </>
              ) : (
                t('save')
              )}
            </button>
          </div>
        </form>
      )}

      {/* Business List */}
      <div className="space-y-3">
        {businesses.map((b) => {
          const isEditing = editingId === b.id;
          const isSystemDefault = b.subtitle.trim() === SYSTEM_DEFAULT_BUSINESS_SUBTITLE;

          return (
            <div
              key={b.id}
              className={`w-full bg-surface border rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm transition-all ${b.isActive ? 'border-credit/40 ring-1 ring-credit/20' : 'border-surface-border'
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
                        placeholder={t('businessName')}
                        className="w-full px-2.5 py-1.5 text-sm font-bold bg-surface-subtle border border-surface-border rounded-lg text-content-primary focus:outline-none focus:ring-1 focus:ring-brand"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        placeholder={t('subtitle')}
                        className="w-full px-2.5 py-1 text-xs bg-surface-subtle border border-surface-border rounded-lg text-content-muted focus:outline-none focus:ring-1 focus:ring-brand"
                      />
                    </div>
                  ) : (
                    // Normal Display View
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-content-primary">{b.name}</h4>
                        {b.isActive ? (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-credit-subtle text-credit border border-credit/20 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>{t('defaultActive')}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-subtle text-content-muted border border-surface-border">
                            {t('inactive')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-content-muted mt-0.5">{b.subtitle}</p>
                    </div>
                  )}
                </div>

                {/* Icon Action Buttons */}
                <div className="flex items-center gap-1.5 ">
                  {isEditing ? (
                    <>
                      {/* Save Button */}
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(b.id)}
                        title={t('save')}
                        className="p-2 rounded-xl bg-credit-subtle hover:bg-credit/25 border border-credit/30 text-credit transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>

                      {/* Cancel Button */}
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        title={t('cancel')}
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
                          onClick={() => void handleSetActive(b.id)}
                          title={t('setDefault')}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface-subtle hover:bg-credit-subtle hover:text-credit hover:border-credit/30 border border-surface-border text-content-secondary text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{t('setDefault')}</span>
                        </button>
                      ) : null}

                      {/* Edit (Pencil) Icon Button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        title={t('editBusiness')}
                        className="p-2 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-content-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {!isSystemDefault && (
                        <button
                          type="button"
                          onClick={() => setDeleteId(b.id)}
                          title={t('deleteBusiness')}
                          className="p-2 rounded-xl bg-debit-subtle hover:bg-debit/20 border border-debit/20 text-debit-text transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-content-muted">
                    {t('currenciesSupported')}
                  </span>
                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20">
                    {t('customersCount', { count: customers.filter((c) => c.businessId === b.id && !c.isSystemDefault).length })}
                  </span>
                </div>
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
              <div className="p-2.5 rounded-xl bg-debit-subtle border border-debit/30 text-debit-text">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-content-primary">{t('deleteBusinessTitle')}</h4>
                <p className="text-xs text-content-muted">{t('deleteBusinessDesc')}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-surface-subtle hover:bg-surface-hover border border-surface-border text-xs font-semibold text-content-primary transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-debit-btn hover:bg-debit-hover text-xs font-semibold text-debit-foreground transition-colors cursor-pointer shadow-sm"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {verification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl border border-surface-border bg-surface p-5 shadow-2xl space-y-4">
            <div>
              <h4 className="text-sm font-bold text-content-primary">Verify it’s you</h4>
              <p className="mt-1 text-xs text-content-muted">
                Confirm with your registered authenticator or PIN before {verification.action === 'delete' ? 'deleting' : verification.action === 'save' ? 'saving changes to' : 'editing'} this business.
              </p>
            </div>

            {hasCredentials && (
              <button
                type="button"
                onClick={() => void verifyWithBiometric()}
                disabled={verifying}
                className="w-full rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground disabled:opacity-50"
              >
                {verifying ? 'Verifying…' : 'Verify with fingerprint / device key'}
              </button>
            )}

            {hasPin && (
              <form onSubmit={(event) => { event.preventDefault(); void verifyWithPin(); }} className="space-y-2">
                <label htmlFor="business-verification-pin" className="block text-xs font-semibold text-content-muted">Or enter your security PIN</label>
                <input
                  id="business-verification-pin"
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="current-password"
                  value={verificationPin}
                  onChange={(event) => setVerificationPin(event.target.value.replace(/\D/g, ''))}
                  className="w-full rounded-xl border border-surface-border bg-surface-subtle px-3 py-2 text-center tracking-widest text-content-primary"
                  placeholder="Enter PIN"
                />
                <button type="submit" disabled={verifying || verificationPin.length < 4} className="w-full rounded-xl bg-surface-subtle px-4 py-2.5 text-sm font-semibold text-content-primary disabled:opacity-50">
                  Verify PIN
                </button>
              </form>
            )}

            {databaseError && <p role="alert" className="text-xs text-debit-text">{databaseError}</p>}
            <button
              type="button"
              onClick={() => { setVerification(null); setVerificationPin(''); }}
              disabled={verifying}
              className="w-full rounded-xl px-4 py-2 text-xs font-semibold text-content-muted hover:bg-surface-subtle disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
