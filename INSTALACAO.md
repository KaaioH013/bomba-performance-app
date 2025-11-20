# Guia Rápido de Instalação

## Windows - PowerShell

### 1. Instalar PostgreSQL
- Baixe de: https://www.postgresql.org/download/windows/
- Instale e anote a senha do usuário `postgres`

### 2. Criar o Banco de Dados
Abra o pgAdmin e execute:
```sql
CREATE DATABASE bomba_performance;
```

Depois execute o conteúdo de `backend/database.sql`

### 3. Configurar Backend
```powershell
cd backend
npm install
# Edite o arquivo .env com sua senha do PostgreSQL
npm run dev
```

### 4. Configurar Frontend (novo terminal)
```powershell
cd frontend
npm install
npm run dev
```

### 5. Acessar
Abra: http://localhost:5173

---

## Problemas Comuns

**Erro ao conectar ao banco:**
- Verifique se PostgreSQL está rodando
- Confirme a senha no arquivo `backend/.env`

**Porta em uso:**
- Altere PORT no `backend/.env`
- Altere port no `frontend/vite.config.js`

---

## Comandos Úteis

**Parar servidor:** Ctrl + C

**Ver logs do backend:** Já aparecem no terminal

**Limpar node_modules:**
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```
