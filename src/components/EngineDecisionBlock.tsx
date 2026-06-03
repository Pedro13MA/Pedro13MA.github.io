export function EngineDecisionBlock() {
  const lines = [
    "action=ENGINE_DECISION | score=91.2 | tier=S | publish=true",
    "reason=ok | cat=tech_gaming | trust=0.94 | revenue_est=0.42",
  ];

  return (
    <pre className="bg-zinc-950 border border-white/[0.06] rounded-lg p-4 font-mono text-sm text-zinc-400 overflow-x-auto leading-relaxed">
      {lines.map((line) => (
        <code key={line} className="block">
          {line}
        </code>
      ))}
    </pre>
  );
}
