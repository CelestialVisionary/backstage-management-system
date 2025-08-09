// src/pages/index.tsx
import { useIntl } from 'umi';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { Outlet } from 'umi';

export default function IndexPage() {
  const intl = useIntl();

  return (
    <ResponsiveLayout>
      <Outlet />
    </ResponsiveLayout>
  );
}