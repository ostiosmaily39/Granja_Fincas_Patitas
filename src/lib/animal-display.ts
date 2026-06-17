/** Apodo guardado en notas como primera línea "Apodo: …" (compatible con GRANJA_DB sin columna name). */
export function apodoFromNotes(notes: string | null | undefined): string | null {
  if (!notes) return null;
  const lines = notes.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*Apodo:\s*(.+?)\s*$/i);
    if (m) return m[1].trim() || null;
  }
  return null;
}

export function animalDisplayName(a: {
  name?: string | null;
  notes?: string | null;
  code: string;
}): string {
  return a.name?.trim() || apodoFromNotes(a.notes) || a.code;
}
