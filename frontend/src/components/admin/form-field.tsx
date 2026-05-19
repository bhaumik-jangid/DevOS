interface FormFieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function FormField({ label, hint, error, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs text-zinc-400 font-mono uppercase tracking-wider">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-zinc-600">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}

const inputClass = `w-full bg-[#1a1a1c] border border-zinc-800 rounded-lg px-3 py-2.5
                    text-white text-sm placeholder-zinc-600
                    focus:outline-none focus:border-amber-500/60 focus:ring-1
                    focus:ring-amber-500/20 transition-colors`

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className || ""}`} />
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={props.rows || 3}
      className={`${inputClass} resize-none ${props.className || ""}`}
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputClass} ${props.className || ""}`}
    />
  )
}

export function Toggle({
  label, checked, onChange
}: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200
                    ${checked ? "bg-amber-500" : "bg-zinc-700"}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white
                          transition-transform duration-200
                          ${checked ? "translate-x-4" : "translate-x-0"}`} />
      </div>
      <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  )
}
