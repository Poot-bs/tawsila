import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

// Since we have a root `[locale]` layout, this layout is just a wrapper
// that passes through the children to the locale-specific layout.
export default function RootLayout({ children }: Props) {
  return children;
}
