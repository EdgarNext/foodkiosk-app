import { KioskOrderProvider } from "./_lib/useKioskOrderStore";

export default function KioskLayout({ children }) {
  return <KioskOrderProvider>{children}</KioskOrderProvider>;
}
