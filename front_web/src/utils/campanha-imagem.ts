const TOTAL_IMAGENS = 7;

export function imagemCampanha(id: string | number, cdImagem?: string): string {
  if (cdImagem && cdImagem !== "" && cdImagem !== "null" && cdImagem !== "undefined") {
    return `/assets/campanhas/${cdImagem}`;
  }
  const index = (Math.abs(Number(String(id).replace(/\D/g, "").slice(-6) || 1)) % TOTAL_IMAGENS) + 1;
  return `/assets/campanhas/${index}.png`;
}
