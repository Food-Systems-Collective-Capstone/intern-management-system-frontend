import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({
  label,
  error,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={inputId} className="text-[13px] font-bold">
        {label}
      </label>

      <input
        id={inputId}
        className={`
          h-[42px] w-full rounded-[5px] border bg-white px-3
          text-sm outline-none
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-[#aaa] focus:border-black focus:ring-2 focus:ring-gray-200"
          }
          ${className}
        `}
        {...props}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
