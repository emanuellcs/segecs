const { query } = require('../../shared/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    // 1. Verifica se usuário existe pelo email
    const result = await query('SELECT * FROM sys_usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 400;
      throw error;
    }

    const usuario = result.rows[0];

    // 2. Verifica a senha
    const validPassword = await bcrypt.compare(senha, usuario.senha_hash);
    if (!validPassword) {
      const error = new Error('Senha incorreta');
      error.statusCode = 400;
      throw error;
    }

    // Verifica se a chave secreta existe
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('ERRO CRÍTICO: JWT_SECRET não definido no .env');
      const error = new Error('Erro de configuração no servidor');
      error.statusCode = 500;
      throw error;
    }

    // 3. Gera o Token
    const token = jwt.sign({ id: usuario.id_usuario }, secret, {
      expiresIn: '1h',
    });

    // 4. Retorna Token + Dados do Usuário
    // É AQUI QUE O FRONT-END PEGA O ID_NIVEL
    res.json({
      token,
      user: {
        id: usuario.id_usuario,
        nome: usuario.nome_completo,
        email: usuario.email,
        id_nivel: usuario.id_nivel,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
