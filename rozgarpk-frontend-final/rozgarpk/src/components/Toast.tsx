interface Props {
  toasts: { id: number; message: string }[];
}

export default function Toast({ toasts }: Props) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}
