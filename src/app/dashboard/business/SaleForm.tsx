"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addSale } from "@/lib/actions/business";
import type { ActionState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { Input, Label, FormRow, FieldError, Select, Textarea } from "@/components/ui";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";

const initialState: ActionState = {};

export function SaleForm({ productNames }: { productNames: string[] }) {
  const [state, formAction] = useFormState(addSale, initialState);
  const today = new Date().toISOString().slice(0, 10);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} ref={formRef}>
      <FormRow>
        <Label htmlFor="product_name">Producto vendido</Label>
        <Input
          id="product_name"
          name="product_name"
          list="product-names"
          required
          placeholder="Ej. Tenis Nike Air"
        />
        <datalist id="product-names">
          {productNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </FormRow>
      <div className="grid grid-cols-2 gap-x-4">
        <FormRow>
          <Label htmlFor="quantity">Cantidad</Label>
          <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="sale_date">Fecha de venta</Label>
          <Input id="sale_date" name="sale_date" type="date" defaultValue={today} max={today} required />
        </FormRow>
        <FormRow>
          <Label htmlFor="unit_cost">Costo por unidad ($)</Label>
          <Input id="unit_cost" name="unit_cost" type="number" min={0} step="0.01" required />
        </FormRow>
        <FormRow>
          <Label htmlFor="unit_price">Precio de venta por unidad ($)</Label>
          <Input id="unit_price" name="unit_price" type="number" min={0} step="0.01" required />
        </FormRow>
      </div>
      <FormRow>
        <Label htmlFor="payment_method">Método de pago</Label>
        <Select id="payment_method" name="payment_method" defaultValue="efectivo">
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormRow>
      <FormRow>
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </FormRow>
      <FieldError>{state.error}</FieldError>
      {state.success && (
        <p className="text-xs text-status-good mb-2">Venta registrada.</p>
      )}
      <SubmitButton size="sm">Registrar venta</SubmitButton>
    </form>
  );
}
