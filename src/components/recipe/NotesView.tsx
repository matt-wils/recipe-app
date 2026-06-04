interface NotesViewProps {
  notes: string;
}

export function NotesView({ notes }: NotesViewProps) {
  if (notes.trim() === '') {
    return <p className="text-sm text-gray-400">No notes added.</p>;
  }
  return <p className="whitespace-pre-wrap leading-relaxed">{notes}</p>;
}
