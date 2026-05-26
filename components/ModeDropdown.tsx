"use client";

import { Mode } from "@/types";

interface ModeDropdownProps {
  value: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeDropdown({ value, onChange }: ModeDropdownProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="mode-select"
        className="text-xs font-medium text-gray-500 text-right"
      >
        Mode Belajar
      </label>
      <select
        id="mode-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Mode)}
        className="select-mode"
      >
        <option value="practice">🎯 Practice</option>
        <option value="pr">📝 PR</option>
      </select>
    </div>
  );
}