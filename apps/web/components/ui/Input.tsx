"use client";

import type { InputHTMLAttributes } from "react";

export function Input({
  style,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      style={{
        width: "100%",
        boxSizing: "border-box",
        background: "var(--surface-card)",
        border: "var(--stroke-default) solid var(--border-default)",
        borderRadius: "var(--radius-none)",
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-body-md)",
        padding: "12px 14px",
        outline: "none",
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--focus-ring)";
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "var(--border-default)";
      }}
      {...rest}
    />
  );
}
