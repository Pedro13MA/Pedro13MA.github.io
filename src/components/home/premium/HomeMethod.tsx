import { MethodFlowArt } from "@/components/home/premium/illustrations";

const STEPS = [
  "Preço atual",
  "Histórico",
  "Promoções",
  "Cupões",
  "Lymiar Index",
  "Vale a pena?",
] as const;

export function HomeMethod() {
  return (
    <section id="metodo" className="scroll-mt-20 bg-slate-50">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <p className="text-sm font-semibold text-[var(--hm-brand)]">Método</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Como tomamos uma decisão
        </h2>
        <p className="mt-4 max-w-xl text-base text-slate-500">
          Do preço observado até à pergunta final — com evidência, não com pressa.
        </p>

        <div className="mt-10 hidden overflow-x-auto md:block">
          <MethodFlowArt className="mx-auto h-auto min-w-[640px] w-full max-w-4xl" />
        </div>

        <ol className="mt-10 grid gap-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className="border-t border-slate-200 py-6 md:border-t-0 md:px-2"
            >
              <span className="font-display text-sm font-semibold text-[var(--hm-brand)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-[15px] font-medium text-slate-800">{label}</p>
              {i < STEPS.length - 1 ? (
                <span className="mt-3 block text-slate-300 md:hidden" aria-hidden>
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function HomeWhyName() {
  return (
    <section id="nome" className="scroll-mt-20 border-b border-slate-200 bg-white">
      <div className="home-fade mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-[var(--hm-brand)]">Identidade</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Porque se chama Lymiar?
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            O nome Lymiar nasce da palavra{" "}
            <span className="font-semibold text-slate-900">&ldquo;limiar&rdquo;</span>
            — o momento onde uma compra deixa de ser apenas barata e passa
            realmente a valer a pena.
          </p>
          <p className="mt-5 text-base leading-relaxed text-slate-500">
            Não procuramos o menor preço. Procuramos o momento certo.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-3xl bg-slate-50 py-16 ring-1 ring-slate-100">
          <p
            className="select-none font-display text-[7rem] font-bold leading-none tracking-tight text-slate-900/10 sm:text-[9rem]"
            aria-hidden
          >
            LY
          </p>
        </div>
      </div>
    </section>
  );
}
