'use client';

import SettingsHeader from '@/components/mini_second/SettingsHeader';
import AdminProfileCard from '@/components/mini_second/AdminProfileCard';
import BusinessProfilesSection from '@/components/mini_second/BusinessProfilesSection';
import RegisteredUsersSection from '@/components/mini_second/RegisteredUsersSection';
import PreferencesSection from '@/components/mini_second/PreferencesSection';
import CloudBackupSection from '@/components/mini_second/CloudBackupSection';
import SignOutSection from '@/components/mini_second/SignOutSection';
import AddCustomerModal from '@/components/mini_second/AddCustomerModal';
import AuditLogModal from '@/components/mini_second/AuditLogModal';

export default function SettingsHubContainer() {
  return (
    <div className="w-full max-w-7xl  mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-28 sm:pb-20 transition-colors duration-200">
      {/* 1. Header Section */}
      <SettingsHeader />

      {/* 2. Responsive Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Left Column: Admin Profile & Business Books (Sticky on Desktop/Laptop) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-20">
          <AdminProfileCard />
          <BusinessProfilesSection />
        </div>

        {/* Right Column: Registered Users, Preferences, Cloud Backup & Sign Out */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          <RegisteredUsersSection />
          <PreferencesSection />
          <CloudBackupSection />
          <SignOutSection />
        </div>
      </div>

      {/* 3. Interactive Modals */}
      <AddCustomerModal />
      <AuditLogModal />
    </div>
  );
}
