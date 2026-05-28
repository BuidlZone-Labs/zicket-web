import Image from "next/image";

interface FormButtonProps {
  type: "submit" | "button";
  onClick?: () => void;
  variant: "primary" | "secondary";
  icon?: string | React.ReactElement;
  iconSize?: number;
  children: React.ReactNode;
  className?: string;
}

export function FormButton({
  type,
  onClick,
  variant = "primary",
  icon,
  iconSize = 24,
  children,
  className = "",
}: FormButtonProps) {
  const baseStyles = "transition-all duration-200 flex items-center gap-2";
  const variantStyles = {
    primary:
      "bg-[#751ac6] hover:bg-purple-700 hover:scale-[1.02] active:scale-[0.98] text-white font-medium p-4 rounded-xl justify-center",
    secondary: "py-2 rounded text-sm text-gray-300",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {icon && typeof icon === "string" ? (
        <Image src={icon} alt="" width={iconSize} height={iconSize} />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
