/**
 * Gerador de Dados Falsos (Faker Lite)
 * Funções puras para gerar dados de teste válidos.
 * Sem dependências externas.
 */

/**
 * Gera um CPF válido (com dígitos verificadores corretos).
 * @param {boolean} formatted - Se true, retorna com pontuação (xxx.xxx.xxx-xx)
 * @returns {string}
 */
export function generateCPF(formatted = false) {
    const rand = () => Math.floor(Math.random() * 9);
    const digits = Array.from({ length: 9 }, rand);

    // Dígito verificador 1
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
    let d1 = 11 - (sum % 11);
    d1 = d1 >= 10 ? 0 : d1;
    digits.push(d1);

    // Dígito verificador 2
    sum = 0;
    for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
    let d2 = 11 - (sum % 11);
    d2 = d2 >= 10 ? 0 : d2;
    digits.push(d2);

    const cpf = digits.join('');
    return formatted
        ? `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9)}`
        : cpf;
}

/**
 * Gera um CNPJ válido.
 * @param {boolean} formatted
 * @returns {string}
 */
export function generateCNPJ(formatted = false) {
    const rand = () => Math.floor(Math.random() * 9);
    const digits = Array.from({ length: 8 }, rand);
    digits.push(0, 0, 0, 1); // filial 0001

    // Dígito 1
    const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) sum += digits[i] * w1[i];
    let d1 = 11 - (sum % 11);
    d1 = d1 >= 10 ? 0 : d1;
    digits.push(d1);

    // Dígito 2
    const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) sum += digits[i] * w2[i];
    let d2 = 11 - (sum % 11);
    d2 = d2 >= 10 ? 0 : d2;
    digits.push(d2);

    const cnpj = digits.join('');
    return formatted
        ? `${cnpj.slice(0,2)}.${cnpj.slice(2,5)}.${cnpj.slice(5,8)}/${cnpj.slice(8,12)}-${cnpj.slice(12)}`
        : cnpj;
}

/**
 * Gera um e-mail de teste aleatório.
 * @returns {string}
 */
export function generateEmail() {
    const prefixes = ['teste', 'qa', 'auto', 'user', 'dev', 'bot'];
    const domains = ['teste.com', 'qa.net', 'example.com', 'mail.test'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const num = Math.floor(Math.random() * 9999);
    return `${prefix}${num}@${domain}`;
}

/**
 * Gera um nome completo aleatório.
 * @returns {string}
 */
export function generateName() {
    const first = ['João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Juliana', 'Lucas', 'Fernanda', 'Rafael', 'Beatriz'];
    const last = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Ferreira', 'Almeida', 'Ribeiro', 'Lima'];
    const f = first[Math.floor(Math.random() * first.length)];
    const l = last[Math.floor(Math.random() * last.length)];
    return `${f} ${l}`;
}

/**
 * Gera um telefone celular aleatório.
 * @param {boolean} formatted
 * @returns {string}
 */
export function generatePhone(formatted = true) {
    const ddd = ['11', '21', '31', '41', '51', '61', '71', '81', '91'][Math.floor(Math.random() * 9)];
    const num = `9${Math.floor(Math.random() * 90000000 + 10000000)}`;
    return formatted ? `(${ddd}) ${num.slice(0,5)}-${num.slice(5)}` : `${ddd}${num}`;
}

/**
 * Gera uma senha aleatória segura.
 * @param {number} length
 * @returns {string}
 */
export function generatePassword(length = 12) {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/**
 * Gera um CEP aleatório válido (formato).
 * @returns {string}
 */
export function generateCEP() {
    const num = Math.floor(Math.random() * 90000000 + 10000000).toString();
    return `${num.slice(0,5)}-${num.slice(5)}`;
}

/**
 * Catálogo de todos os geradores disponíveis.
 */
export const FAKE_DATA_CATALOG = [
    { id: 'cpf',      label: 'CPF',           icon: '🪪', generate: () => generateCPF(true) },
    { id: 'cpf_raw',  label: 'CPF (sem máscara)', icon: '🪪', generate: () => generateCPF(false) },
    { id: 'cnpj',     label: 'CNPJ',          icon: '🏢', generate: () => generateCNPJ(true) },
    { id: 'email',    label: 'E-mail',        icon: '📧', generate: generateEmail },
    { id: 'name',     label: 'Nome Completo', icon: '👤', generate: generateName },
    { id: 'phone',    label: 'Celular',       icon: '📱', generate: () => generatePhone(true) },
    { id: 'password', label: 'Senha',         icon: '🔒', generate: () => generatePassword(12) },
    { id: 'cep',      label: 'CEP',           icon: '📍', generate: generateCEP },
];
