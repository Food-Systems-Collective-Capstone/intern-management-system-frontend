import type { ComponentPropsWithRef } from "react";

type Option = { value: string; label: string };

interface DropdownProps extends Omit<
  ComponentPropsWithRef<"select">,
  "children"
> {
  label: string;
  options: readonly Option[];
  placeholder?: string;
  error?: string;
}

export function Dropdown({
  label,
  options,
  placeholder,
  error,
  id,
  className = "",
  ...props
}: DropdownProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${selectId}-error`;

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={selectId} className="text-[13px] font-bold">
        {label}
      </label>
      <select
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-[42px] w-full rounded-[5px] border bg-white px-3 text-sm outline-none ${error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100" : "border-[#aaa] focus:border-black focus:ring-2 focus:ring-gray-200"} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map(({ value, label: optionLabel }) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
