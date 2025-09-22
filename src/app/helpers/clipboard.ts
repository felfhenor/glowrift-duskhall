export function copyToClipboard(text: string): Promise<void> {
  const blob = new Blob([text], { type: 'text/plain' });
  const data = [new ClipboardItem({ [blob.type]: blob })];
  return navigator.clipboard.write(data);
}
