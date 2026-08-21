import { CircleCheck, CircleX } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FeedbackMessageProps = {
  message: string;
  title?: string;
  variant: "success" | "error";
};

const feedbackConfig = {
  success: {
    icon: CircleCheck,
    title: "Sucesso",
  },
  error: {
    icon: CircleX,
    title: "Nao foi possivel concluir",
  },
} as const;

function FeedbackMessage({
  message,
  title,
  variant,
}: FeedbackMessageProps) {
  const { icon: Icon, title: defaultTitle } = feedbackConfig[variant];

  return (
    <Alert aria-live="polite" variant={variant}>
      <Icon aria-hidden="true" />
      <AlertTitle>{title ?? defaultTitle}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export { FeedbackMessage };
