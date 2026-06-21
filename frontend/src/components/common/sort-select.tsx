"use client";

import { Select } from "@components/ui/select";
import { SORT_OPTIONS } from "@lib/constants";
import { useTranslations } from "next-intl";

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  const t = useTranslations();

  return (
    <Select
      options={SORT_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(`sort.${opt.value}`),
      }))}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-40"
    />
  );
}
