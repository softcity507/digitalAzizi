import { Suspense } from 'react';
import CustomerDetailsContainer from '@/components/max_second/CustomerDetailsContainer';
import MiniLoader from '@/components/mini_second/MiniLoader';

export default function DetailsPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-7xl mx-auto px-4 py-8 flex items-center justify-center"><MiniLoader size="sm" variant="brand" /></div>}>
      <CustomerDetailsContainer />
    </Suspense>
  );
}

