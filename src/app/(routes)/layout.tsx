import { AppWrapper } from '@/components/app-wrapper';

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppWrapper>{children}</AppWrapper>;
}