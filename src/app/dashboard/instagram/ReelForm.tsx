"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addReel } from "@/lib/actions/instagram";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Label, FormRow, FieldError } from "@/components/ui";

const initialState: ActionState = {};

export function ReelForm() {
  const [state, formAction] = useFormState(addReel, initialState);
  const today = new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <FormRow>
        <Label htmlFor="title">Título / descripción del reel</Label>
        <Input id="title" name="title" required placeholder="Ej. Unboxing de tenis nuevos" />
      </FormRow>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow>
          <Label htmlFor="posted_at">Fecha publicado</Label>
          <Input id="posted_at" name="posted_at" type="date" defaultValue={today} max={today} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="url">Enlace (opcional)</Label>
          <Input id="url" name="url" placeholder="instagram.com/reel/..." />
        </FormRow>
        <FormRow>
          <Label htmlFor="views">Vistas</Label>
          <Input id="views" name="views" type="number" min={0} defaultValue={0} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="likes">Me gusta</Label>
          <Input id="likes" name="likes" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="comments">Comentarios</Label>
          <Input id="comments" name="comments" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="shares">Compartidos</Label>
          <Input id="shares" name="shares" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="saves">Guardados</Label>
          <Input id="saves" name="saves" type="number" min={0} defaultValue={0} />
        </FormRow>
      </div>
      <FieldError>{state.error}</FieldError>
      {state.success && <p className="text-xs text-status-good mb-2">Reel agregado.</p>}
      <SubmitButton size="sm">Agregar reel</SubmitButton>
    </form>
  );
}
