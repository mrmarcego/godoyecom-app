"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addInstagramMetric } from "@/lib/actions/instagram";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Label, FormRow, FieldError, Textarea } from "@/components/ui";

const initialState: ActionState = {};

export function MetricForm() {
  const [state, formAction] = useFormState(addInstagramMetric, initialState);
  const today = new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow>
          <Label htmlFor="metric_date">Fecha</Label>
          <Input
            id="metric_date"
            name="metric_date"
            type="date"
            defaultValue={today}
            max={today}
            required
          />
        </FormRow>
        <FormRow>
          <Label htmlFor="followers">Seguidores</Label>
          <Input id="followers" name="followers" type="number" min={0} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="following">Seguidos</Label>
          <Input id="following" name="following" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="posts_count">Publicaciones</Label>
          <Input id="posts_count" name="posts_count" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="reach">Alcance (30 días)</Label>
          <Input id="reach" name="reach" type="number" min={0} defaultValue={0} />
        </FormRow>
        <FormRow>
          <Label htmlFor="profile_visits">Visitas al perfil</Label>
          <Input id="profile_visits" name="profile_visits" type="number" min={0} defaultValue={0} />
        </FormRow>
      </div>
      <FormRow>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          placeholder="Algo que quieras recordar de este día"
        />
      </FormRow>
      <FieldError>{state.error}</FieldError>
      {state.success && (
        <p className="text-xs text-status-good mb-2">Métrica guardada.</p>
      )}
      <SubmitButton size="sm">Guardar métrica</SubmitButton>
    </form>
  );
}
