/**
 * Aplica a máscara de celular (XX) XXXXX-XXXX
 * ou (XX) XXXX-XXXX (pra fixos)
 */
export const formatarCelular = (valor: string): string => {
  if (!valor) return "";

  const digitos = valor.replace(/\D/g, "");
  const digitosLimitados = digitos.slice(0, 11);

  if (digitosLimitados.length <= 2) {
    // (XX
    return `(${digitosLimitados}`;
  }
  if (digitosLimitados.length <= 6) {
    // (XX) XXXX
    return `(${digitosLimitados.slice(0, 2)}) ${digitosLimitados.slice(2)}`;
  }
  if (digitosLimitados.length <= 10) {
    // (XX) XXXX-XXXX (Telefone fixo)
    return `(${digitosLimitados.slice(0, 2)}) ${digitosLimitados.slice(
      2,
      6
    )}-${digitosLimitados.slice(6)}`;
  }
  // (XX) XXXXX-XXXX (Celular com 9º dígito)
  return `(${digitosLimitados.slice(0, 2)}) ${digitosLimitados.slice(
    2,
    7
  )}-${digitosLimitados.slice(7)}`;
};
