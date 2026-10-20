'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { CustomerAccount } from '@/types/customer';
import { useCustomerDetailsStore } from '@/store/useCustomerDetailsStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { authApi } from '@/callapi/auth';
import { getSecurityStatus } from '@/callapi/security';
import { useExchangeDeskStore } from '@/store/useExchangeDeskStore';
import { AlertTriangle } from 'lucide-react';
import verifyAndAuthorizeAction, { verifyPinAction } from '@/components/max_second/verifyAndAuthorizeAction';

interface CustomerCardProps {
  customer: CustomerAccount;
  className?: string;
}

export default function CustomerCard({
  customer,
  className = '',
}: CustomerCardProps) {
  const locale = useLocale();
  const deleteUser = useSettingsStore((state) => state.deleteUser);
  const canManage = !customer.isSystemDefault;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [verification, setVerification] = useState<{ userId: string; hasPin: boolean; hasCredentials: boolean } | null>(null);
  const [verificationPin, setVerificationPin] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const requestDeleteVerification = async () => {
    setDeleteError(null);
    try {
      const userData = await authApi.getSession();
      if (!userData.success || !userData.user?.id) {
        throw new Error('Please sign in again to verify this action.');
      }
      const statusData = await getSecurityStatus();
      if (!statusData.success) {
        throw new Error(statusData.error || 'Could not load verification methods.');
      }
      const hasPin = Boolean(statusData.status?.hasPin);
      const hasCredentials = Boolean(statusData.status?.hasCredentials);
      if (!hasPin && !hasCredentials) {
        throw new Error('Set a PIN or register an authenticator in Settings > Biometrics before deleting customers.');
      }
      setVerificationPin('');
      setVerification({ userId: userData.user.id, hasPin, hasCredentials });
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to start verification.');
    }
  };

  const finishDelete = async () => {
    setVerifying(true);
    setDeleteError(null);
    try {
      await deleteUser(customer.id);
      setVerification(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Unable to delete customer.');
    } finally {
      setVerifying(false);
    }
  };

  const verifyWithBiometric = async () => {
    if (!verification || verifying) return;
    setVerifying(true);
    try {
      if (await verifyAndAuthorizeAction(verification.userId)) await finishDelete();
      else setDeleteError('Authenticator verification failed or was cancelled. Try again or use your PIN.');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Authenticator verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const verifyWithPin = async () => {
    if (!verification || verificationPin.length < 4 || verifying) return;
    setVerifying(true);
    setDeleteError(null);
    try {
      if (await verifyPinAction(verification.userId, verificationPin)) await finishDelete();
      else setDeleteError('Incorrect PIN. Please try again.');
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'PIN verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCardClick = () => {
    useCustomerDetailsStore.getState().setSelectedCustomerId(customer.id);
    useSettingsStore.getState().setDefaultUser(customer.id);
    useExchangeDeskStore.getState().setCustomerId(customer.id);
    if (customer.businessId) {
      void useSettingsStore.getState().setActiveBusiness(customer.businessId).catch((error: unknown) => console.error(error));
    }
  };

  return (
    <div className={`group relative flex items-center justify-between p-4 sm:p-5 rounded bg-surface border border-surface-border shadow-sm hover:border-brand/40 hover:bg-surface-hover/50 transition-all duration-200 ${className}`}>
      {/* Clickable Link area for Customer Details */}
      <Link
        href={`/${locale}/details?id=${customer.id}`}
        onClick={handleCardClick}
        className="flex min-w-0 flex-1 items-center justify-between cursor-pointer pr-12"
      >
        {/* Left Column: Customer Details */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-content-primary group-hover:text-brand transition-colors">
              {customer.name}
            </h3>
            {customer.badge && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-brand/15 text-brand border border-brand/30">
                {customer.badge}
              </span>
            )}
          </div>

          {customer.phone && (
            <span className="text-[11px] font-mono text-content-muted">
              {customer.phone}
            </span>
          )}
        </div>

        {/* Right Column: Currency Balances */}
        <div className="flex flex-col items-end gap-0.5 text-right font-mono flex-shrink-0">
          {customer.balances.map((bal, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
              <span className="text-[10px] text-content-muted font-normal uppercase">
                {bal.currency}
              </span>
              <span className={bal.isCredit ? 'text-credit' : 'text-debit'}>
                {bal.amount}
              </span>
            </div>
          ))}
        </div>
      </Link>

      {/* Delete Button positioned absolutely outside the Link wrapper */}
      {canManage && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
          <button
            type="button"
            className="rounded text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation(); // Stop event from bubbling up to the Link
              e.preventDefault();  // Prevent default link action
              setDeleteError(null);
              setShowDeleteConfirm(true);
            }}
            aria-label="Delete customer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}
     
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onClick={(e) => e.stopPropagation()}>
          <div role="dialog" aria-modal="true" aria-labelledby={`delete-customer-${customer.id}`} className="w-full max-w-sm space-y-4 rounded border border-surface-border bg-surface p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded border border-red-500/30 bg-red-500/15 p-2.5 text-red-400"><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h4 id={`delete-customer-${customer.id}`} className="text-sm font-bold text-content-primary">Delete customer?</h4>
                <p className="text-xs text-content-muted">Move {customer.name} to the recycle bin? It will be permanently deleted after 15 days unless restored.</p>
              </div>
            </div>
            {deleteError && <p role="alert" className="text-xs text-red-500">{deleteError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className="rounded border border-surface-border px-4 py-2 text-xs font-semibold text-content-primary">Cancel</button>
              <button type="button" onClick={() => void requestDeleteVerification()} className="rounded bg-red-500 px-4 py-2 text-xs font-semibold text-white">Continue</button>
            </div>
          </div>
        </div>
      )}
      {verification && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={(e) => e.stopPropagation()}>
          <div role="dialog" aria-modal="true" aria-labelledby={`verify-customer-${customer.id}`} className="w-full max-w-sm space-y-4 rounded border border-surface-border bg-surface p-5 shadow-2xl">
            <div>
              <h4 id={`verify-customer-${customer.id}`} className="text-sm font-bold text-content-primary">Verify it’s you</h4>
              <p className="mt-1 text-xs text-content-muted">Confirm with your registered authenticator or PIN before deleting this customer.</p>
            </div>
            {verification.hasCredentials && <button type="button" onClick={() => void verifyWithBiometric()} disabled={verifying} className="w-full rounded bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{verifying ? 'Verifying…' : 'Verify with fingerprint / device key'}</button>}
            {verification.hasPin && (
              <form onSubmit={(event) => { event.preventDefault(); void verifyWithPin(); }} className="space-y-2">
                <label htmlFor={`customer-verification-pin-${customer.id}`} className="block text-xs font-semibold text-content-muted">Or enter your security PIN</label>
                <input id={`customer-verification-pin-${customer.id}`} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="current-password" value={verificationPin} onChange={(event) => setVerificationPin(event.target.value.replace(/\D/g, ''))} className="w-full rounded border border-surface-border bg-surface-subtle px-3 py-2 text-center tracking-widest text-content-primary" placeholder="Enter PIN" />
                <button type="submit" disabled={verifying || verificationPin.length < 4} className="w-full rounded bg-surface-subtle px-4 py-2.5 text-sm font-semibold text-content-primary disabled:opacity-50">{verifying ? 'Verifying…' : 'Verify PIN'}</button>
              </form>
            )}
            {deleteError && <p role="alert" className="text-xs text-red-500">{deleteError}</p>}
            <button type="button" onClick={() => { setVerification(null); setVerificationPin(''); }} disabled={verifying} className="w-full rounded px-4 py-2 text-xs font-semibold text-content-muted hover:bg-surface-subtle disabled:opacity-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
