// Line icons in the style of SF Symbols. All use currentColor, so they follow the text color.
const paths = {
  drop: <path d="M12 3.5c3.2 4 6 7.4 6 10.6A6 6 0 0 1 6 14.1c0-3.2 2.8-6.6 6-10.6Z" />,
  "drop-fill": <path d="M12 3.5c3.2 4 6 7.4 6 10.6A6 6 0 0 1 6 14.1c0-3.2 2.8-6.6 6-10.6Z" fill="currentColor" />,
  tree: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c-3.9 0-6.5-2.1-6.5-5.1 0-2 1.3-3.4 2.9-3.9C9 4.2 10.4 3 12 3s3 1.2 3.6 3c1.6.5 2.9 1.9 2.9 3.9 0 3-2.6 5.1-6.5 5.1Z" />
      <path d="M12 17.5 9.5 15.5M12 16.2l2.5-1.9" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
      <circle cx="16.5" cy="9.5" r="2.6" />
      <path d="M16.2 14.6c2.3 0 3.9 1.5 4.4 3.9" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8.5" r="3.7" />
      <path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6" />
    </>
  ),
  "chevron-left": <path d="M14.5 5.5 8 12l6.5 6.5" />,
  "chevron-right": <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  flame: (
    <path d="M12 21c-3.6 0-6-2.4-6-5.6 0-2.6 1.6-4.3 3-5.8.3 1.5 1 2.5 2 3 0-3.3 1.2-6.2 4-8.6-.2 2.6.7 4.4 2.1 6 1 1.2 1.9 2.7 1.9 5.2 0 3.3-2.4 5.8-7 5.8Z" />
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.6v.1" />
    </>
  ),
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  trophy: (
    <>
      <path d="M8 4.5h8v5a4 4 0 0 1-8 0v-5Z" />
      <path d="M8 6.5H5.2c0 2.6 1.2 4 3.1 4.4M16 6.5h2.8c0 2.6-1.2 4-3.1 4.4M12 13.5v3.5M8.5 20h7M9.5 17h5v3h-5z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  envelope: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 1.5H5l1.5-1.5Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7" />
      <path d="M11 12h9.5M17 8.5l3.5 3.5-3.5 3.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13.5 14-14 .4 9-5 14-12.5 14H5Z" />
      <path d="M5 19c3-4 6-6.5 9.5-8.5" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="2" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v2" />
    </>
  ),
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M17 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10" />,
  sparkles: (
    <path d="M12 3.5 13.6 9 19 10.5l-5.4 1.6L12 17.5l-1.6-5.4L5 10.5 10.4 9 12 3.5ZM18.5 16l.7 2 1.8.6-1.8.7-.7 1.9-.6-1.9-1.9-.7 1.9-.6.6-2Z" />
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "eye-off": (
    <>
      <path d="M4 4l16 16M9.9 6A9.5 9.5 0 0 1 12 5.5C18 5.5 21.5 12 21.5 12a17 17 0 0 1-2.9 3.7M6.4 7.6A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </>
  ),
};

export default function Icon({ name, size = 24, strokeWidth = 1.8, className, title }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {paths[name]}
    </svg>
  );
}
