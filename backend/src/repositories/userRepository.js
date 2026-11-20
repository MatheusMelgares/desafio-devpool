const db = require('../database/db');

class UserRepository {
   // Busca e retorna todos os usuários cadastrados (omitindo a senha por segurança)
  findAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, login, active FROM users', [], (err, rows) => {
        if (err) reject(err);
         // Converte o valor numérico do SQLite (1 ou 0) para booleano (true ou false)
        const users = rows.map(u => ({ ...u, active: Boolean(u.active) }));
        resolve(users);
      });
    });
  }

   // Busca um único usuário pelo ID e retorna "null" se não encontrar
  findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, login, active FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        if (!row) return resolve(null);
        resolve({ ...row, active: Boolean(row.active) });
      });
    });
  }

  // Verifica se já existe outro usuário usando o mesmo e-mail ou login (evita duplicidade)
  findByEmailOrLogin(email, login, ignoreId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id FROM users WHERE (email = ? OR login = ?)';
      const params = [email, login];

      // Na edição, ignora o próprio ID do usuário que está sendo alterado
      if (ignoreId) {
        query += ' AND id != ?';
        params.push(ignoreId);
      }

      db.get(query, params, (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });
  }

  // Insere um novo usuário no banco e retorna o objeto criado com o ID gerado
  create({ name, email, login, passwordHash, active }) {
    return new Promise((resolve, reject) => {
      const activeInt = active ? 1 : 0;
      const query = 'INSERT INTO users (name, email, login, password, active) VALUES (?, ?, ?, ?, ?)';
      
      db.run(query, [name, email, login, passwordHash, activeInt], function (err) {
        if (err) reject(err);
        resolve({
          id: this.lastID,
          name,
          email,
          login,
          active: Boolean(activeInt)
        });
      });
    });
  }

  // Atualiza os dados de um usuário existente (alterando a senha apenas se uma nova for enviada)
  update(id, { name, email, login, passwordHash, active }) {
    return new Promise((resolve, reject) => {
      const activeInt = active ? 1 : 0;
      let query = 'UPDATE users SET name = ?, email = ?, login = ?, active = ?';
      const params = [name, email, login, activeInt];

      if (passwordHash) {
        query += ', password = ?';
        params.push(passwordHash);
      }

      query += ' WHERE id = ?';
      params.push(id);

      db.run(query, params, function (err) {
        if (err) reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  // Remove fisicamente o registro do usuário do banco pelo ID
  delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
        if (err) reject(err);
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = new UserRepository();