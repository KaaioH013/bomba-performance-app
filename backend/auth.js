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

export function login(req, res) {
  try {
    const { senha } = req.body;
    
    if (!senha) {
      return res.status(400).json({ error: 'Senha não fornecida' });
    }
    
    console.log(`🔐 Tentativa de login - Senha recebida: "${senha}"`);
    console.log(`🔐 Senha esperada: "${SENHA_ACESSO}"`);
    console.log(`🔍 Comparando: "${senha}" (${senha.length}) === "${SENHA_ACESSO}" (${SENHA_ACESSO.length})`);
    console.log(`🔍 São iguais? ${senha === SENHA_ACESSO}`);
    console.log(`🔍 Bytes senha recebida:`, Buffer.from(senha).toString('hex'));
    console.log(`🔍 Bytes senha esperada:`, Buffer.from(SENHA_ACESSO).toString('hex'));
    
    if (senha === SENHA_ACESSO) {
      console.log('✅ Login bem-sucedido');
      return res.json({ 
        token: SENHA_ACESSO,
        message: 'Login realizado com sucesso' 
      });
    } else {
      console.log('❌ Senha incorreta');
      return res.status(401).json({ error: 'Senha incorreta' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
}

export { SENHA_ACESSO };
