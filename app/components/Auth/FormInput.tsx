interface FormInputProps {
  id: string;
  type: "text" | "email";
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  label?: string;
  endIcon?: React.ReactNode;
}

export function FormInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  required = false,
  minLength,
  label,
  endIcon
}: FormInputProps) {
  return (
    <div className="space-y-4 md:space-y-5">
      {label && <label htmlFor={id} className="text-slate-300 text-sm md:text-base block">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent border border-[#751AC6] text-white placeholder:text-[#7D7C7C] pr-12 h-16 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
        />
        {endIcon && (
         <>
            {endIcon}
          </>
        )}
      </div>
    </div>
  );
}
