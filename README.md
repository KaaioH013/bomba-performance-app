# Sistema de Performance de Bombas 🚰

Aplicação web completa para gerenciamento de testes de performance de bombas, substituindo a planilha Excel por uma solução moderna, intuitiva e acessível.

## 🎯 Funcionalidades

- ✅ **Cadastro de Testes**: Formulário completo com todos os dados da planilha original
- ✅ **Cálculos Automáticos**: Potência consumida calculada automaticamente
- ✅ **Gráficos Interativos**: Curvas de performance (Vazão x Pressão, Vazão x Corrente, Vazão x Potência)
- ✅ **Histórico Completo**: Busca e filtros por cliente, modelo, data
- ✅ **Relatório para Impressão**: Layout profissional pronto para PDF
- ✅ **Banco de Dados**: PostgreSQL para armazenamento seguro

## 🛠️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- PostgreSQL
- REST API

### Frontend
- React + Vite
- Tailwind CSS
- Recharts (gráficos)
- React Router (navegação)

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/

2. **PostgreSQL** (versão 14 ou superior)
   - Download: https://www.postgresql.org/download/
   - Durante a instalação, anote a senha do usuário `postgres`

## 🚀 Instalação e Configuração

### 1. Configurar o Banco de Dados

Abra o pgAdmin ou o terminal do PostgreSQL e execute:

```sql
CREATE DATABASE bomba_performance;
```

Depois, execute o arquivo `backend/database.sql` para criar as tabelas:

```powershell
# No terminal do PostgreSQL (psql)
psql -U postgres -d bomba_performance -f backend/database.sql
```

Ou copie e cole o conteúdo do arquivo `backend/database.sql` no pgAdmin.

### 2. Configurar o Backend

```powershell
# Navegar até a pasta do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
# Edite o arquivo .env e ajuste a senha do PostgreSQL se necessário
# DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/bomba_performance

# Iniciar o servidor
npm run dev
```

O backend estará rodando em: http://localhost:3000

### 3. Configurar o Frontend

Abra um **novo terminal** (mantenha o backend rodando):

```powershell
# Navegar até a pasta do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

O frontend estará rodando em: http://localhost:5173

### 4. Acessar a Aplicação

Abra seu navegador e acesse: **http://localhost:5173**

## 📖 Como Usar

### Criar um Novo Teste

1. Clique em **"Novo Teste"** no menu superior
2. O sistema sugere automaticamente o próximo número RPB
3. Preencha os dados:
   - **Informações Gerais**: Data, Cliente, OP/OF, etc.
   - **Dados da Bomba**: Modelo, Rotor, Estator
   - **Pontos de Teste**: Até 5 pontos com vazão, pressão, corrente
   - **Instrumentos Utilizados**: Tacômetro, Wattímetro, etc.
   - **Resultado**: Aprovado/Reprovado + Observações
4. Clique em **"Criar Teste"**

### Visualizar e Imprimir Relatório

1. Na página inicial, clique em **"Ver"** no teste desejado
2. Visualize todos os dados e gráficos
3. Clique em **"🖨️ Imprimir"** para gerar PDF ou imprimir

### Buscar Testes

- Use os filtros na página inicial
- Busque por Cliente ou Modelo
- Aplique os filtros

### Editar um Teste

1. Na página inicial, clique em **"Editar"**
2. Modifique os dados necessários
3. Clique em **"Atualizar Teste"**

## 🎨 Recursos Visuais

- **Dashboard**: Lista todos os testes com status visual
- **Formulários**: Interface intuitiva com validação
- **Gráficos**: Curvas de performance interativas
- **Relatórios**: Layout profissional para impressão

## 🔧 Estrutura do Projeto

```
bomba-performance-app/
├── backend/
│   ├── server.js           # Servidor principal
│   ├── db.js              # Conexão com banco de dados
│   ├── database.sql       # Schema do banco
│   ├── package.json       # Dependências do backend
│   └── .env              # Variáveis de ambiente
├── frontend/
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── services/    # API client
│   │   ├── App.jsx      # Componente principal
│   │   └── main.jsx     # Entry point
│   ├── package.json     # Dependências do frontend
│   └── vite.config.js   # Configuração do Vite
└── README.md           # Este arquivo
```

## 🐛 Solução de Problemas

### Backend não conecta ao banco de dados

- Verifique se o PostgreSQL está rodando
- Confirme a senha no arquivo `.env`
- Teste a conexão: `psql -U postgres -d bomba_performance`

### Frontend não carrega dados

- Verifique se o backend está rodando em http://localhost:3000
- Abra o Console do navegador (F12) para ver erros
- Teste a API diretamente: http://localhost:3000/api/health

### Porta já em uso

Se a porta 3000 ou 5173 já estiver em uso:

```powershell
# Altere a porta no backend (.env)
PORT=3001

# Altere a porta no frontend (vite.config.js)
server: { port: 5174 }
```

## 📝 Scripts Disponíveis

### Backend
```powershell
npm start      # Inicia o servidor
npm run dev    # Inicia com watch mode (reinicia ao salvar)
```

### Frontend
```powershell
npm run dev    # Inicia servidor de desenvolvimento
npm run build  # Cria build de produção
npm run preview # Visualiza build de produção
```

## 🎯 Próximas Melhorias

- [ ] Exportação direta para PDF (backend)
- [ ] Upload de imagens/anexos
- [ ] Dashboard com estatísticas
- [ ] Comparação entre testes
- [ ] Autenticação de usuários
- [ ] Relatórios personalizados

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique a seção de "Solução de Problemas"
2. Revise os logs do backend no terminal
3. Verifique o Console do navegador (F12)

## 📄 Licença

Este projeto foi desenvolvido para uso interno.

---

**Desenvolvido para Eng** - Sistema de Performance de Bombas
