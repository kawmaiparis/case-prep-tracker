import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-md border border-divider bg-surface text-primary placeholder:text-muted text-sm px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, className, id, ...props }, ref) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <input ref={ref} id={id} className={cn(inputBase, className)} {...props} />
      </div>
    );
  }
);

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, className, id, ...props }, ref) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(inputBase, "resize-none", className)}
          {...props}
        />
      </div>
    );
  }
);

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ label, className, id, children, ...props }, ref) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-medium text-muted">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(inputBase, "appearance-none cursor-pointer", className)}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }
);
