import { LegacyOrderProvider } from "./_lib/useLegacyOrderStore";

export default function LegacyLayout({ children, modal }) {
  return (
    <LegacyOrderProvider>
      {children}
      {modal}
    </LegacyOrderProvider>
  );
}
