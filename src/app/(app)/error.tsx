"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-segment-error]", error);
  }, [error]);

  return (
    <ErrorState
      compact
      code="500"
      title="Falha nesta tela"
      description="Aconteceu um erro ao carregar este conteúdo. Você pode tentar de novo ou voltar ao início."
      onPrimary={reset}
      digest={error.digest}
    />
  );
}
