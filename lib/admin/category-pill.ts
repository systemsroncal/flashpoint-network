const PASTELS = [
  { bg: "#e8f4fc", text: "#1e5a7a" },
  { bg: "#f3e8ff", text: "#5b3d8a" },
  { bg: "#e8f8ef", text: "#1f6b42" },
  { bg: "#fff4e5", text: "#8a5a1f" },
  { bg: "#fce8ec", text: "#8a2e3d" },
  { bg: "#eef0ff", text: "#3d4a8a" },
  { bg: "#e8f7f5", text: "#1f6b63" },
];

export function categoryPillStyle(slugOrName: string | null | undefined) {
  const key = (slugOrName || "news").toLowerCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % PASTELS.length;
  }
  const palette = PASTELS[hash];
  return {
    backgroundColor: palette.bg,
    color: palette.text,
  };
}
