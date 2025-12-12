"use client";

import { useCallback } from "react";
import TicketPrintClient from "./TicketPrintClient";
import { useKioskOrderStore } from "../../_lib/useKioskOrderStore";

export default function TicketPrintContainer(props) {
  const resetFlow = useKioskOrderStore((state) => state.resetFlow);

  const handleFinishOrder = useCallback(() => {
    resetFlow();
  }, [resetFlow]);

  return <TicketPrintClient {...props} onFinishOrder={handleFinishOrder} />;
}
