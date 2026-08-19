import { clsx } from "clsx";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const inputBase =
  "w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-colors";

function FieldWrapper({
  label,
  htmlFor,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-gold ml-0.5">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-light">{hint}</span>}
      </div>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

export function TextField({
  label,
  name,
  error,
  required,
  hint,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  hint?: React.ReactNode;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} error={error} required={required} hint={hint}>
      <input
        id={name}
        name={name}
        className={clsx(inputBase, error && "border-red-400", className)}
        {...props}
      />
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  name,
  error,
  required,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} error={error} required={required}>
      <textarea
        id={name}
        name={name}
        className={clsx(inputBase, "min-h-24 resize-y", error && "border-red-400", className)}
        {...props}
      />
    </FieldWrapper>
  );
}

export function FileField({
  label,
  name,
  error,
  required,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} error={error} required={required}>
      <input
        id={name}
        name={name}
        type="file"
        className={clsx(
          inputBase,
          "file:mr-3 file:rounded-md file:border-0 file:bg-gold file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white",
          error && "border-red-400",
          className
        )}
        {...props}
      />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  name,
  error,
  required,
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  error?: string;
}) {
  return (
    <FieldWrapper label={label} htmlFor={name} error={error} required={required}>
      <select
        id={name}
        name={name}
        className={clsx(inputBase, error && "border-red-400", className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
