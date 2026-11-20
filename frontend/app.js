const API_URL = 'http://localhost:3000/users';

const form = document.getElementById('user-form');
const userIdInput = document.getElementById('user-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const loginInput = document.getElementById('login');
const passwordInput = document.getElementById('password');
const activeInput = document.getElementById('active');
const formTitle = document.getElementById('form-title');
const passwordHint = document.getElementById('password-hint');
const btnCancel = document.getElementById('btn-cancel');
const tableBody = document.getElementById('users-table-body');
const feedbackEl = document.getElementById('feedback');
const loadingEl = document.getElementById('loading');

function setLoading(isLoading) {
  loadingEl.classList.toggle('hidden', !isLoading);
}

function showFeedback(message, type = 'success') {
  feedbackEl.textContent = message;
  feedbackEl.className = `feedback ${type}`;
  setTimeout(() => feedbackEl.classList.add('hidden'), 4000);
}

async function fetchUsers() {
  setLoading(true);
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Falha ao buscar usuários.');
    const users = await response.json();
    renderTable(users);
  } catch (err) {
    showFeedback(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function renderTable(users) {
  tableBody.innerHTML = '';
  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">Nenhum usuário cadastrado.</td></tr>';
    return;
  }

  users.forEach(user => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.login}</td>
      <td>${user.active ? 'Ativo' : 'Inativo'}</td>
      <td>
        <button class="warning" onclick="editUser(${user.id})">Editar</button>
        <button class="danger" onclick="deleteUser(${user.id}, '${user.name}')">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = userIdInput.value;
  const isEditing = Boolean(id);

  const payload = {
    name: nameInput.value,
    email: emailInput.value,
    login: loginInput.value,
    active: activeInput.checked
  };

  if (passwordInput.value) {
    payload.password = passwordInput.value;
  }

  setLoading(true);
  try {
    const url = isEditing ? `${API_URL}/${id}` : API_URL;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao salvar usuário.');
    }

    showFeedback(isEditing ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!');
    resetForm();
    fetchUsers();
  } catch (err) {
    showFeedback(err.message, 'error');
  } finally {
    setLoading(false);
  }
});

async function editUser(id) {
  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) throw new Error('Erro ao carregar dados do usuário.');
    const user = await response.json();

    userIdInput.value = user.id;
    nameInput.value = user.name;
    emailInput.value = user.email;
    loginInput.value = user.login;
    activeInput.checked = user.active;
    passwordInput.value = '';
    passwordInput.required = false;

    formTitle.textContent = `Editando Usuário #${user.id}`;
    passwordHint.textContent = '(deixe em branco para manter a atual)';
    btnCancel.classList.remove('hidden');
  } catch (err) {
    showFeedback(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

async function deleteUser(id, name) {
  // Confirmação exigida pelo Requisito 11
  const confirmed = confirm(`Tem certeza que deseja excluir o usuário "${name}"?`);
  if (!confirmed) return;

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao excluir usuário.');
    }
    showFeedback('Usuário excluído com sucesso!');
    fetchUsers();
  } catch (err) {
    showFeedback(err.message, 'error');
  } finally {
    setLoading(false);
  }
}

function resetForm() {
  form.reset();
  userIdInput.value = '';
  passwordInput.required = true;
  formTitle.textContent = 'Novo Usuário';
  passwordHint.textContent = '(mínimo 8 caracteres) *';
  btnCancel.classList.add('hidden');
}

btnCancel.addEventListener('click', resetForm);

// Inicializa a listagem ao abrir a página
fetchUsers();