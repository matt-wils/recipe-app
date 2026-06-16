import { useParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { getComponent, SLOT_LABELS } from '../data/plates';

/** A build-a-plate component's cooking-reference card: a few ways to cook it. */
export function IngredientDetailPage() {
  const { id } = useParams();
  const component = id ? getComponent(id) : undefined;

  if (!component) {
    return (
      <>
        <PageHeader title="Not found" back />
        <EmptyState title="Ingredient not found" />
      </>
    );
  }

  return (
    <>
      <PageHeader title={component.name} back />
      <div className="flex flex-col gap-5 p-4">
        <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
          {SLOT_LABELS[component.slot]}
        </span>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Ways to cook</h2>
          <ul className="flex flex-col gap-3">
            {component.methods.map((m) => (
              <li key={m.name} className="border-b border-gray-100 pb-3 last:border-b-0">
                <p className="font-medium text-gray-900">{m.name}</p>
                <p className="text-sm text-gray-600">{m.how}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
