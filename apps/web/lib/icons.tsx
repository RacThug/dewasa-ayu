// Custom line-drawn icons (1.x px stroke, currentColor) — no emoji, per DESIGN.md.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function LeafMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <path
        d="M3 15c4-9 20-12 24-12-1 11-9 22-21 24-2 .3-3.4-1-3-3 .1-3 0-6 0-9z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7 22C12 16 18 11 25 7"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="19" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" />
    </svg>
  );
}

export function ContrastIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 3.5v17a8.5 8.5 0 0 0 0-17z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EditIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function CrossIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 20.5l1.3-4.7A8.2 8.2 0 1 1 8.2 19l-4.7 1.5z" />
      <path d="M8.5 8.5c1 3 3 5 6 6l1.5-1.6 2 .9-.4 2.2c-3.6.6-8.2-3.8-8.6-7.4l2.1-.5.9 1.9z" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7L11 6" />
      <path d="M14 11a5 5 0 0 0-7.5-.5L4 13a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}

export function SealIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="1" />
      <path d="M13 5v16M5 13h16" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <circle cx="13" cy="13" r="3.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function VerdictGlyph({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" aria-hidden="true">
      <circle cx="11.5" cy="15" r="7.5" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="18.5" cy="15" r="7.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function DividerOrnament() {
  return (
    <div className="divider" aria-hidden="true">
      <svg viewBox="0 0 280 12" preserveAspectRatio="xMidYMid meet">
        <line x1="0" y1="6" x2="118" y2="6" stroke="currentColor" strokeWidth="1" />
        <path
          d="M132 6 L140 2 L148 6 L140 10 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="140" cy="6" r="1.1" fill="currentColor" />
        <line x1="162" y1="6" x2="280" y2="6" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  );
}
