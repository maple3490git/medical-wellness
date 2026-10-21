import { Search } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Rechercher...",
  className = "",
}: SearchInputProps) {
  return (
    <div className={`relative flex-1 lg:max-w-xs ${className}`.trim()}>
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-muted))]"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9 !py-2.5"
      />
    </div>
  );
}
