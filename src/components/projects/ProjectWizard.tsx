"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProject, PROJECT_TEMPLATES } from "@/lib/projects";
import type { ProjectTemplateId } from "@/lib/projects/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ProjectWizard({ open, onClose }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [templateId, setTemplateId] = useState<ProjectTemplateId>("blank");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    try {
      const p = await createProject({
        name: name || PROJECT_TEMPLATES.find((t) => t.id === templateId)?.name || "Projeto",
        description,
        imageUrl: imageUrl.trim() || null,
        templateId,
      });
      onClose();
      router.push(`/projetos/p/?id=${encodeURIComponent(p.id)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal
      aria-label="Criar projeto"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-[8%] w-[min(32rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Novo Projeto
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Passo {step} de 2
          </p>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {step === 1 ? (
            <>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Nome</span>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-sky-500 focus:ring-2"
                  placeholder="Ex: PC Gaming 2026"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">Descrição</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-sky-500 focus:ring-2"
                  placeholder="Objectivo do projecto (opcional)"
                />
              </label>
              <label className="block text-sm">
                <span className="font-medium text-slate-700">
                  Imagem (URL opcional)
                </span>
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none ring-sky-500 focus:ring-2"
                  placeholder="https://…"
                />
              </label>
            </>
          ) : (
            <fieldset>
              <legend className="text-sm font-medium text-slate-700">
                Template
              </legend>
              <p className="mt-1 text-xs text-slate-500">
                Define apenas slots iniciais — sem marcas nem modelos.
              </p>
              <ul className="mt-3 space-y-2">
                {PROJECT_TEMPLATES.map((t) => (
                  <li key={t.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                        templateId === t.id
                          ? "border-sky-300 bg-sky-50/50"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                    >
                      <input
                        type="radio"
                        name="template"
                        checked={templateId === t.id}
                        onChange={() => setTemplateId(t.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {t.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {t.description} · {t.slots.length} slots
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </div>

        <div className="flex justify-between gap-2 border-t border-slate-200 px-5 py-4">
          {step === 1 ? (
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Voltar
            </Button>
          )}
          {step === 1 ? (
            <Button type="button" onClick={() => setStep(2)}>
              Seguinte
            </Button>
          ) : (
            <Button type="button" onClick={() => void submit()} disabled={busy}>
              Criar projeto
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
