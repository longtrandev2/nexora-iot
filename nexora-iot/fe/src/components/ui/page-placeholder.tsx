import { PageHeader } from './page-header'

/** Temporary page body for routes landing in phases 03–05. */
export function PagePlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center gap-stack-sm rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest px-container-padding py-20 text-center">
        <span className="material-symbols-outlined text-[40px] text-on-surface-variant">construction</span>
        <p className="font-title-sm text-title-sm text-on-surface">Chức năng sắp ra mắt</p>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Nội dung của trang này sẽ hoàn thiện ở giai đoạn phát triển tiếp theo.
        </p>
      </div>
    </>
  )
}
