"use client";

import { useFormStatus } from "react-dom";
import { Button, Spinner, type ButtonProps } from "@/components/ui";

export function SubmitButton({ children, ...props }: ButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending && <Spinner className="mr-1.5" />}
      {children}
    </Button>
  );
}
