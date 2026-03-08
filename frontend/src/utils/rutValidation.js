export const validarRut = (rutCompleto) => {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
    return false;
  
  let tmp = rutCompleto.split('-');
  let digv = tmp[1]; 
  let rut = tmp[0];
  
  if (digv == 'K') digv = 'k';
  
  return (dv(rut) == digv);
};

export const dv = (T) => {
  let M = 0, S = 1;
  for (; T; T = Math.floor(T / 10))
    S = (S + T % 10 * (9 - M++ % 6)) % 11;
  return S ? S - 1 : 'k';
};

export const formatRut = (value) => {
  if (!value) return '';
  // Remover todos los caracteres no alfanuméricos
  let clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length <= 1) return clean;
  // Siempre fijar el último carácter como Dígito Verificador (DV)
  let result = clean.slice(0, -1) + '-' + clean.slice(-1);
  return result;
};
