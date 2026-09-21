"use client";

export function DownloadButton({
  filename,
  content,
  label = "Export Markdown",
}: {
  filename: string;
  content: string;
  label?: string;
}) {
  const download = () => {
    try {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };
  return (
    <button className="btn" onClick={download}>
      ↓ {label}
    </button>
  );
}
