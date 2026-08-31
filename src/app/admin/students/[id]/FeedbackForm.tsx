"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { sendFeedback } from "@/lib/actions/feedback";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Textarea, FieldError } from "@/components/ui";

const initialState: ActionState = {};

export function FeedbackForm({ studentId }: { studentId: string }) {
  const [state, formAction] = useFormState(sendFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef} className="space-y-2">
      <input type="hidden" name="student_id" value={studentId} />
      <Textarea
        name="message"
        rows={3}
        placeholder="Escribe un comentario privado para este estudiante..."
        required
      />
      <FieldError>{state.error}</FieldError>
      {state.success && <p className="text-xs text-status-good">Feedback enviado.</p>}
      <SubmitButton size="sm">Enviar feedback</SubmitButton>
    </form>
  );
}
