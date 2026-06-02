interface StepListProps {
  steps: string[];
}

export function StepList({ steps }: StepListProps) {
  if (steps.length === 0) {
    return <p className="text-sm text-gray-400">No steps added.</p>;
  }
  return (
    <ol className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
            {i + 1}
          </span>
          <p className="pt-0.5 leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}
