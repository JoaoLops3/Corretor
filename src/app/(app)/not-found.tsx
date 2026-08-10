import { ErrorState } from "@/components/ui/error-state";

export default function AppNotFound() {
  return (
    <ErrorState
      compact
      code="404"
      title="Não encontrado"
      description="Esse endereço não existe dentro do Prancheta."
      secondaryHref="/"
      secondaryLabel="Voltar ao início"
    />
  );
}
