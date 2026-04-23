# 💇‍♀️ Cabeleleila Leila - Sistema de Agendamento

Sistema web desenvolvido para gerenciamento de agendamentos de um salão de beleza, permitindo que clientes realizem reservas online e que a administradora tenha controle completo sobre os atendimentos.

---

## 🚀 Demonstração

🔗 Acesse o projeto:

> https://cabeleleilaleila.vercel.app/

---

## 📌 Funcionalidades

### 👤 Cliente

* Agendar um ou mais serviços
* Escolher data e horário disponíveis
* Informar nome, telefone e e-mail
* Consultar agendamentos pelo e-mail
* Alterar data e horário do agendamento

---

### ⚠️ Regras de negócio

* Alterações só podem ser feitas com **mínimo de 2 dias de antecedência**
* Caso a data esteja a menos de 2 dias, a alteração deve ser feita via contato com o salão
* O sistema sugere agendamento na mesma semana para o mesmo cliente

---

### 👩‍💼 Área Administrativa

* Login com autenticação (Supabase Auth)
* Visualização de todos os agendamentos
* Edição completa de agendamentos (data, horário e status)
* Controle de status

---

### 📊 Dashboard (Gerencial)

* Total de agendamentos da semana
* Quantidade por status
* Ranking de serviços mais utilizados
* Visualização geral do desempenho semanal

---

## 🛠️ Tecnologias Utilizadas

* HTML5
* CSS3
* JavaScript
* Supabase

  * PostgreSQL
  * Auth (login)
* Git / GitHub

---

## 🧱 Estrutura do Projeto

```plaintext
📦 cabeleleila-leila
 ┣ 📂 assets
 ┃ ┗ 📂 img
 ┣ 📂 script
 ┃ ┣ 📜 main.js
 ┃ ┣ 📜 consultar-agendamento.js
 ┃ ┣ 📜 dashboard.js
 ┃ ┣ 📜 historico.js
 ┃ ┣ 📜 login.js
 ┃ ┗ 📜 supabase.js
 ┣ 📂 style
 ┃ ┣ 📂 pages
 ┃ ┃ ┣ 📜 agendamento.css
 ┃ ┃ ┣ 📜 consultar-agendamento.css
 ┃ ┃ ┣ 📜 dashboard.css
 ┃ ┃ ┣ 📜 historico.css
 ┃ ┃ ┣ 📜 home.css
 ┃ ┃ ┗ 📜 login.css
 ┃ ┣ 📜 components.css
 ┃ ┗ 📜 global.css
 ┣ 📜 index.html
 ┣ 📜 agendamento.html
 ┣ 📜 consultar-agendamento.html
 ┣ 📜 dashboard.html
 ┣ 📜 historico.html
 ┗ 📜 login.html
```

---

## ⚙️ Como rodar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/claiverty/CabeleleilaLeila.git
```

### 2. Abrir o projeto

Abra o arquivo `index.html` diretamente no navegador
ou utilize a extensão **Live Server** no VS Code

---

### 3. Configurar o Supabase

No arquivo:

```js
script/supabase.js
```

Configure:

```js
const SUPABASE_URL = 'https://sbdynlzmbhdmtjgkvqea.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNiZHlubHptYmhkbXRqZ2t2cWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4NjU0OTcsImV4cCI6MjA5MjQ0MTQ5N30.zxyTcv0WO8FGlGGRayWCuORiFurEVRu4wCRMJFstJhk';
```

---

## 🗄️ Banco de Dados

Tabelas principais:

* `clientes`
* `agendamentos`
* `servicos`
* `agendamento_servicos`

### Relacionamentos

* Um cliente pode ter vários agendamentos
* Um agendamento pode conter vários serviços

---

## 🔐 Autenticação

* Sistema de login implementado com Supabase Auth
* Rotas administrativas protegidas:

  * Dashboard
  * Histórico
* Logout disponível

---

## 🎯 Diferenciais Implementados

* Sugestão automática de agendamento na mesma semana
* Dashboard com métricas semanais
* Ranking de serviços
* Sistema de status completo (agendamento + serviços)
* Separação entre área cliente e administrativa
* Interface organizada e responsiva

---

## 📷 Prints do sistema

EM ANDAMENTO

* Tela de agendamento
* Consulta de agendamento
* Dashboard
* Histórico

---

## 📹 Vídeo de demonstração

EM ANDAMENTO

* criação de agendamento
* consulta
* login
* dashboard funcionando

---

## 📌 Considerações

Este projeto foi desenvolvido como teste técnico.
---

## 👨‍💻 Autor

Desenvolvido por **Claiverty Rodrigues**

🔗 GitHub: https://github.com/claiverty 🔗 LinkedIn: https://www.linkedin.com/in/claiverty

---

