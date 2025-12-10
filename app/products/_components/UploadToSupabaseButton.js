'use client';

import { useFormStatus } from "react-dom";
import Button from "../../_components/ui/Button";

export default function UploadToSupabaseButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="secondary"
      className="px-3 py-2 text-xs"
      disabled={pending}
    >
      {pending ? "Subiendo..." : "Subir a Supabase"}
    </Button>
  );
}
