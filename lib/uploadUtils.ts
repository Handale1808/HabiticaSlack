export function fileToBase64(
  file: File,
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type;
      const base64 = result.split(",")[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function stripMarkdownFences(content: string): string {
  return content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
}