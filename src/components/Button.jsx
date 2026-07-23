import { useRef } from "react";

export default function Button({
  children,
  className = "",
  variant = "",
  onClick,
  ...rest
}) {
  const ref = useRef(null);

  function handlePointerMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  function handleClick(e) {
    const el = ref.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      el.appendChild(ripple);
      setTimeout(() => ripple.remove(), 620);
    }
    onClick?.(e);
  }

  return (
    <button
      ref={ref}
      className={`btn ${variant} ${className}`}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </button>
  );
}
