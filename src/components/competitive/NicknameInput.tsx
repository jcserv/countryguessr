import { User } from "lucide-react";

import { Input } from "@/components/ui/input";

interface NicknameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function NicknameInput({
  value,
  onChange,
  disabled = false,
  error,
}: NicknameInputProps) {
  const isValid = value.trim().length >= 2;
  const showError = value.length > 0 && !isValid;

  return (
    <div className="space-y-2">
      <label
        htmlFor="nickname"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Nickname
      </label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          id="nickname"
          type="text"
          placeholder="Enter your nickname"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pl-9"
          maxLength={20}
        />
      </div>
      {(showError || error) && (
        <p className="text-xs text-red-500">
          {error || "Nickname must be at least 2 characters"}
        </p>
      )}
    </div>
  );
}
