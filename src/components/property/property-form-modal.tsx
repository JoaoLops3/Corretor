"use client";

import { useEffect, useState, useTransition } from "react";
import { PropertyStatus, PropertyType } from "@prisma/client";
import { Modal, ModalTitle, ModalSub, ModalActions, Field, inputClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { createProperty, updateProperty } from "@/lib/actions/properties";
import { uploadPropertyPhoto } from "@/lib/actions/photos";
import type { PropertyView } from "@/lib/property-view";

export function PropertyFormModal({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  initial?: PropertyView | null;
}) {
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const editing = !!initial;

  const [title, setTitle] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("São Paulo");
  const [price, setPrice] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState<PropertyStatus>("DISPONIVEL");
  const [type, setType] = useState<PropertyType>("APARTAMENTO");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setTitle(initial.title);
      setStreet(initial.addressStreet);
      setNumber(initial.addressNumber ?? "");
      setDistrict(initial.addressDistrict);
      setCity(initial.addressCity);
      setPrice(String(initial.priceNumber));
      setArea(initial.area?.replace(" m²", "") ?? "");
      setStatus(initial.status);
      setType(initial.type);
    } else {
      setTitle("");
      setStreet("");
      setNumber("");
      setDistrict("");
      setCity("São Paulo");
      setPrice("");
      setArea("");
      setStatus("DISPONIVEL");
      setType("APARTAMENTO");
      setPhotoFile(null);
    }
  }, [open, initial]);

  function handleSubmit() {
    const priceNum = Number(String(price).replace(/\D/g, "")) || 0;
    startTransition(async () => {
      try {
        const payload = {
          title: title || "Novo imóvel sem título",
          addressStreet: street || "Endereço não informado",
          addressNumber: number || undefined,
          addressDistrict: district || "Centro",
          addressCity: city || "São Paulo",
          addressState: "SP",
          price: priceNum,
          area: area ? Number(area) : undefined,
          status,
          type,
        };
        const saved = editing && initial
          ? await updateProperty(initial.id, payload)
          : await createProperty(payload);

        if (photoFile) {
          const fd = new FormData();
          fd.set("file", photoFile);
          fd.set("propertyId", saved.id);
          await uploadPropertyPhoto(fd);
        }

        showToast(editing ? "Imóvel atualizado" : "Imóvel cadastrado com sucesso");
        onSaved?.();
        onClose();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao salvar imóvel");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} showHandle>
      <ModalTitle>{editing ? "Editar imóvel" : "Novo imóvel"}</ModalTitle>
      <ModalSub>Preencha os dados básicos — dá pra completar depois</ModalSub>

      <Field label="Título">
        <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Apto 2 quartos Vila Nova" />
      </Field>
      <div className="mb-3 flex gap-2.5">
        <div className="flex-1">
          <Field label="Status">
            <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)}>
              <option value="DISPONIVEL">Disponível</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
            </select>
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Tipo">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as PropertyType)}>
              <option value="APARTAMENTO">Apartamento</option>
              <option value="CASA">Casa</option>
              <option value="SOBRADO">Sobrado</option>
              <option value="SALA_COMERCIAL">Sala comercial</option>
            </select>
          </Field>
        </div>
      </div>
      <Field label="Rua">
        <input className={inputClass} value={street} onChange={(e) => setStreet(e.target.value)} placeholder="Rua / Avenida" />
      </Field>
      <div className="mb-3 flex gap-2.5">
        <div className="w-24">
          <Field label="Nº">
            <input className={inputClass} value={number} onChange={(e) => setNumber(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Bairro">
            <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Cidade">
            <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
          </Field>
        </div>
      </div>
      <div className="mb-3 flex gap-2.5">
        <div className="flex-1">
          <Field label="Preço">
            <input className={inputClass} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="685000" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Área (m²)">
            <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} placeholder="98" />
          </Field>
        </div>
      </div>
      <Field label="Fotos">
        <label className="block w-full cursor-pointer rounded-[10px] border-[1.5px] border-dashed border-line p-5 text-center text-[12.5px] text-text-mut hover:border-cyan">
          📷 {photoFile ? photoFile.name : "Toque para adicionar fotos"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </Field>

      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={pending}>
          {pending ? "Salvando…" : editing ? "Salvar" : "Cadastrar imóvel"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
