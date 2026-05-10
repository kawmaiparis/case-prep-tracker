import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "disabled:bg-gray-50 disabled:text-gray-500",
          className
        )}
        {...props}
      />
    </div>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900",
          "placeholder:text-gray-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          className
        )}
        {...props}
      />
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className, id, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "appearance-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
