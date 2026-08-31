"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addProduct } from "@/lib/actions/business";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Label, FormRow, FieldError, Textarea } from "@/components/ui";

const initialState: ActionState = {};

export function ProductForm() {
  const [state, formAction] = useFormState(addProduct, initialState);
  const today = new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <FormRow>
        <Label htmlFor="name">Nombre del producto</Label>
        <Input id="name" name="name" required placeholder="Ej. Tenis Nike Air" />
      </FormRow>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow>
          <Label htmlFor="category">Categoría (opcional)</Label>
          <Input id="category" name="category" placeholder="Ropa, tenis, tecnología..." />
        </FormRow>
        <FormRow>
          <Label htmlFor="purchase_date">Fecha de compra</Label>
          <Input id="purchase_date" name="purchase_date" type="date" defaultValue={today} max={today} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="cost_per_unit">Costo por unidad ($)</Label>
          <Input id="cost_per_unit" name="cost_per_unit" type="number" min={0} step="0.01" required />
        </FormRow>
        <FormRow>
          <Label htmlFor="quantity_purchased">Cantidad comprada</Label>
          <Input
            id="quantity_purchased"
            name="quantity_purchased"
            type="number"
            min={0}
            defaultValue={1}
            required
          />
        </FormRow>
      </div>
      <FormRow>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </FormRow>
      <FieldError>{state.error}</FieldError>
      {state.success && (
        <p className="text-xs text-status-good mb-2">Producto agregado a tu inventario.</p>
      )}
      <SubmitButton size="sm">Agregar producto</SubmitButton>
    </form>
  );
}
