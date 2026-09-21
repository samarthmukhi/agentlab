"use client";

import { useEffect, useState } from "react";

/** Textarea that keeps local state and commits onBlur to avoid per-keystroke writes. */
export function EditableField({
  label,
  value,
  onCommit,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea
        className="input mt-1 resize-y"
        style={{ minHeight: rows * 22 }}
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && onCommit(local)}
      />
    </label>
  );
}

export function EditableInput({
  label,
  value,
  onCommit,
  placeholder,
}: {
  label: string;
  value: string;
  onCommit: (v: string) => void;
  placeholder?: string;
}) {
  const [local, setLocal] = useState(value);
  useEffect(() => setLocal(value), [value]);
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input
        className="input mt-1"
        placeholder={placeholder}
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => local !== value && onCommit(local)}
      />
    </label>
  );
}
