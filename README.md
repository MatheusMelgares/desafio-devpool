# 👥 Sistema de Gestão de Usuários (CRUD Full-Stack)

Aplicação Full-Stack desenvolvida para o **Desafio Técnico DevPool**, contemplando uma API RESTful para gerenciamento de usuários com persistência em banco de dados relacional e uma interface web responsiva para consumo dos endpoints.

---

## 🛠️ Tecnologias Escolhidas

* **Frontend:** HTML5, CSS3 (com [Pico.css](https://picocss.com) local para estilização responsiva) e JavaScript Puro (Vanilla JS utilizando Fetch API).
* **Backend:** Node.js com framework Express.
* **Banco de Dados:** SQLite (`sqlite3`) com isolamento da camada de acesso a dados (*Repository Pattern*).
* **Segurança:** Criptografia de senhas com `bcryptjs` (hash irreversível) e habilitação de `cors`.

---

## 📁 Estrutura do Projeto

```text
desafio-devpool-crud/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── db.js              # Conexão com SQLite e criação automática da tabela
│   │   ├── repositories/
│   │   │   └── userRepository.js  # Camada de persistência (queries SQL isoladas)
│   │   ├── controllers/
│   │   │   └── userController.js  # Regras de negócio, validações e status HTTP
│   │   ├── routes/
│   │   │   └── userRoutes.js      # Definição das rotas REST (/users)
│   │   └── server.js              # Configuração do servidor Express e middlewares
│   └── package.json
├── frontend/
│   ├── index.html                 # Interface principal e formulário de cadastro/edição
│   ├── style.css                  # Estilos complementares e alertas visuais
│   ├── pico.min.css               # Framework CSS local
│   └── app.js                     # Integração com a API REST e manipulação do DOM
└── README.md
```

---

## 🚀 Como Instalar e Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org) (versão 18 ou superior) instalado na máquina.
* Extensão **Live Server** no VS Code (ou qualquer servidor HTTP estático) para executar o frontend.

### 1. Executando o Backend (API REST)

1. Abra o terminal e acesse a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências do projeto:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   node src/server.js
   ```
   > O servidor estará rodando em `http://localhost:3000` e criará automaticamente o arquivo `database.sqlite` na pasta `backend/`.

### 2. Executando o Frontend (Interface Web)

1. Com o servidor backend já em execução, abra o arquivo `frontend/index.html` no VS Code.
2. Clique com o botão direito sobre o arquivo e selecione **"Open with Live Server"** (ou clique em **Go Live** no canto inferior direito do editor).
3. A aplicação abrirá no navegador (geralmente em `http://127.0.0`).

---

## 🔌 Documentação e Exemplos de Chamadas da API (cURL)

A API responde no endereço base `http://localhost:3000`.

### 1. Cadastrar Novo Usuário (`POST /users`)
Cria um usuário validando nome (mín. 3 caracteres), e-mail único e válido, login único (mín. 3 caracteres) e senha (mín. 8 caracteres). Retorna **HTTP 201 Created**.

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@dominio.com",
    "login": "mariasilva",
    "password": "password123",
    "active": true
  }'
```

**Exemplo de Resposta (`201 Created`):**
```json
{
  "id": 1,
  "name": "Maria Silva",
  "email": "maria@dominio.com",
  "login": "mariasilva",
  "active": true
}
```

---

### 2. Listar Todos os Usuários (`GET /users`)
Retorna a lista de todos os usuários cadastrados (sem expor senhas ou hashes). Retorna **HTTP 200 OK**.

```bash
curl -X GET http://localhost:3000/users
```

---

### 3. Buscar Usuário por ID (`GET /users/{id}`)
Retorna os detalhes de um usuário específico (**HTTP 200 OK**) ou **HTTP 404 Not Found** caso o ID não exista.

```bash
curl -X GET http://localhost:3000/users/1
```

---

### 4. Atualizar Usuário (`PUT /users/{id}`)
Atualiza os dados de um usuário existente. O envio do campo `password` é opcional na edição (caso omitido, a senha atual é mantida). Retorna **HTTP 200 OK**.

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Silva Souza",
    "email": "maria@dominio.com",
    "login": "mariasilva",
    "active": false
  }'
```

---

### 5. Excluir Usuário (`DELETE /users/{id}`)
Remove o registro do usuário do banco de dados. Retorna **HTTP 204 No Content** em caso de sucesso ou **HTTP 404 Not Found** se o usuário não for encontrado.

```bash
curl -X DELETE http://localhost:3000/users/1
```

---

## 🔒 Decisões Técnicas e Regras de Negócio Aplicadas

* **Isolamento de Camadas:** O frontend nunca acessa diretamente o arquivo `.sqlite`; toda comunicação ocorre exclusivamente via requisições HTTP RESTful.
* **Proteção de Credenciais:** As senhas são armazenadas utilizando hash `BCrypt` (salt 10) e a coluna `password` é explicitamente omitida em todas as consultas `SELECT` do repositório.
* **Exclusão Física:** Optou-se pela remoção definitiva do registro (`DELETE`) para manter a integridade da base e atender diretrizes de privacidade, mantendo o campo booleano `active` para controle de status operacional sem perda do cadastro.