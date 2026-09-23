/** Empty table/body fallback (spec E1): icon + "Không có dữ liệu". */
export function EmptyState({ message = 'Không có dữ liệu', icon = 'inbox' }: { message?: string; icon?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-container-padding py-16 text-center">
      <span className="material-symbols-outlined text-[40px] text-on-surface-variant">{icon}</span>
      <p className="font-title-sm text-title-sm text-on-surface-variant">{message}</p>
    </div>
  )
}
