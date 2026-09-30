import { Suspense } from 'react';
import CustomerDetailsContainer from '@/components/max_second/CustomerDetailsContainer';

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-7xl mx-auto px-4 py-8 animate-pulse text-content-muted">Loading...</div>}>
      <CustomerDetailsContainer />
    </Suspense>
  );
}

