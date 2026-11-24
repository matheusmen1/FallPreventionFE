export function validarCPF(cpf: string): boolean {
  const digitos = (cpf || '').replace(/\D/g, '');
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(digitos.substring(0, 9), 10);
  if (d1 !== Number(digitos[9])) return false;
  const d2 = calcularDigito(digitos.substring(0, 10), 11);
  return d2 === Number(digitos[10]);
}

function doisDigitos(n: number) {
  return String(n).padStart(2, '0');
}

export function hojeISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`;
}

export function agoraDatetimeLocal(): string {
  const d = new Date();
  return `${hojeISO()}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`;
}

export function dataNascimentoValida(data: string): boolean {
  if (!data) return false;
  return data <= hojeISO();
}

export function dataHoraSessaoValida(dataHora: string): boolean {
  if (!dataHora) return false;
  const t = new Date(dataHora).getTime();
  return !isNaN(t) && t >= Date.now() - 60 * 1000;
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
}

/** Telefone com DDD: 10 dígitos (fixo) ou 11 dígitos (celular) */
export function telefoneValido(telefone: string): boolean {
  const digitos = (telefone || '').replace(/\D/g, '');
  return digitos.length === 10 || digitos.length === 11;
}
