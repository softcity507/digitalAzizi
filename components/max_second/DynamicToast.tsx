'use client';

import { ToastContainer, toast } from 'react-toastify';

export type DynamicToastOptions = {
  message: string;
  backgroundColor?: string;
  textColor?: string;
  duration?: number;
};

/** Show a toast with caller supplied text and colors. */
export function showDynamicToast({
  message,
  backgroundColor = 'var(--surface)',
  textColor = 'var(--text-primary)',
  duration = 3500,
}: DynamicToastOptions) {
  return toast(message, {
    autoClose: duration,
    className: 'dynamic-toast',
    style: { backgroundColor, color: textColor },
  });
}

export default function DynamicToast() {
  return (
    <ToastContainer
      position="top-right"
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      theme="colored"
      toastClassName="dynamic-toast"
      progressClassName="dynamic-toast__progress"
    />
  );
}
