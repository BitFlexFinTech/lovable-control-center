import { Shield } from "lucide-react";

interface ZACCLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function ZACCLogo({ size = "md", showText = true }: ZACCLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl"
  };

  return (
    <div className="flex items-center gap-2">
      <div className="hero-gradient rounded-xl p-2 shadow-lg">
        <Shield className={`${sizeClasses[size]} text-primary-foreground`} />
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold text-foreground tracking-tight`}>
          ZACC
        </span>
      )}
    </div>
  );
}
