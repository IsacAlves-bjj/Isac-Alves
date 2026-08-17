// Foto de perfil da fisioterapeuta, com espaço reservado (iniciais +
// contorno tracejado) enquanto nenhuma foto foi cadastrada em Configurações.
export function Avatar({ name, avatarUrl, size = 36 }: { name?: string | null; avatarUrl?: string | null; size?: number }) {
  const initials = (name ?? "?")
    .trim()
    .split(/\s+/)
    .filter((w) => !["dra.", "dr.", "dra", "dr"].includes(w.toLowerCase()))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name ?? "Foto de perfil"}
        className="avatar-photo"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className="avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.4 }} title="Foto ainda não cadastrada">
      {initials || "📷"}
    </span>
  );
}
