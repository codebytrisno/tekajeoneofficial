"use client"

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onCancel}>
      <div
        className="bg-surface-container-lowest rounded-xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-[32px] text-error">delete</span>
        </div>
        <h3 className="font-headline text-[22px] leading-[1.4] font-semibold text-primary mb-2">{title}</h3>
        <p className="font-body text-[16px] leading-[1.6] text-on-surface-variant mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 border border-outline-variant rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:bg-surface-container transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2.5 bg-error text-on-error rounded-lg font-[600] text-[13px] leading-[1.2] tracking-[0.05em] hover:shadow-lg transition-all hover:brightness-110"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
