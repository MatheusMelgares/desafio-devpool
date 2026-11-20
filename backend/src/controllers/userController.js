const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');

// Expressão regular para validar o formato básico de e-mail (usuario@dominio.com)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class UserController {
   // Lista todos os usuários e responde com status 200 OK
  async index(req, res) {
    try {
      const users = await userRepository.findAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao listar usuários.' });
    }
  }

  // Busca detalhes de um usuário por ID; retorna 404 se não existir ou 200 OK se encontrar
  async show(req, res) {
    try {
      const user = await userRepository.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao buscar usuário.' });
    }
  }

  // Valida as regras de negócio, criptografa a senha e cria um novo usuário (201 Created)
  async store(req, res) {
    try {
      const { name, email, login, password, active } = req.body;

      // Validações das Regras de Negócio
      if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: 'O nome é obrigatório e deve ter no mínimo 3 caracteres válidos.' });
      }
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'E-mail obrigatório e deve ter formato válido.' });
      }
      if (!login || login.trim().length < 3) {
        return res.status(400).json({ error: 'O login é obrigatório e deve ter no mínimo 3 caracteres.' });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({ error: 'A senha é obrigatória e deve ter no mínimo 8 caracteres.' });
      }

      // Verifica unicidade de e-mail e login
      const existing = await userRepository.findByEmailOrLogin(email.trim(), login.trim());
      if (existing) {
        return res.status(400).json({ error: 'E-mail ou login já cadastrado no sistema.' });
      }

      //Gera o hash seguro da senha com BCrypt antes de salvar no banco 
      const passwordHash = await bcrypt.hash(password, 10);
      const isActive = active !== undefined ? Boolean(active) : true;

      const newUser = await userRepository.create({
        name: name.trim(),
        email: email.trim(),
        login: login.trim(),
        passwordHash,
        active: isActive
      });

      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao cadastrar usuário.' });
    }
  }

  // Valida os dados, verifica unicidade e atualiza um usuário existente (200 OK)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, email, login, password, active } = req.body;

      const existingUser = await userRepository.findById(id);
      if (!existingUser) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: 'O nome é obrigatório e deve ter no mínimo 3 caracteres válidos.' });
      }
      if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ error: 'E-mail obrigatório e deve ter formato válido.' });
      }
      if (!login || login.trim().length < 3) {
        return res.status(400).json({ error: 'O login é obrigatório e deve ter no mínimo 3 caracteres.' });
      }

      // Na edição, Só irá gerar um novo hash se o usuário digitou uma nova senha no formulário
      let passwordHash = null;
      if (password !== undefined && password !== '') {
        if (password.length < 8) {
          return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
        }
        passwordHash = await bcrypt.hash(password, 10);
      }

      const duplicate = await userRepository.findByEmailOrLogin(email.trim(), login.trim(), id);
      if (duplicate) {
        return res.status(400).json({ error: 'E-mail ou login já está em uso por outro usuário.' });
      }

      const isActive = active !== undefined ? Boolean(active) : existingUser.active;

      await userRepository.update(id, {
        name: name.trim(),
        email: email.trim(),
        login: login.trim(),
        passwordHash,
        active: isActive
      });

      const updatedUser = await userRepository.findById(id);
      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao atualizar usuário.' });
    }
  }

  // Exclui o usuário pelo ID e responde com 204 No Content (ou 404 se não existir)
  async destroy(req, res) {
    try {
      const deleted = await userRepository.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro interno ao excluir usuário.' });
    }
  }
}

module.exports = new UserController();