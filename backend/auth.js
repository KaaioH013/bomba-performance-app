import dotenv from 'dotenv';
dotenv.config();

// Sistema de autenticação simples com senha única
const SENHA_ACESSO = process.env.SENHA_ACESSO || 'bomba2025';

console.log(`🔑 Senha de acesso carregada: "${SENHA_ACESSO}"`);
console.log(`🔑 Tamanho da senha: ${SENHA_ACESSO.length} caracteres`);

export function verificarAutenticacao(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || token !== SENHA_ACESSO) {
    return res.status(401).json({ error: 'Acesso negado. Faça login.' });
  }
  
  next();
}

export function login(senha) {
  console.log(`🔍 Comparando: "${senha}" (${senha.length}) === "${SENHA_ACESSO}" (${SENHA_ACESSO.length})`);
  console.log(`🔍 São iguais? ${senha === SENHA_ACESSO}`);
  console.log(`🔍 Bytes senha recebida:`, Buffer.from(senha).toString('hex'));
  console.log(`🔍 Bytes senha esperada:`, Buffer.from(SENHA_ACESSO).toString('hex'));
  return senha === SENHA_ACESSO;
}

export { SENHA_ACESSO };
