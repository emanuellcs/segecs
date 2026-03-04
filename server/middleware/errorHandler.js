/**
 * Middleware global de tratamento de erros para PostgreSQL/Express
 */
const errorHandler = (err, req, res, next) => {
  console.error('--- Erro Detectado ---');
  console.error(err.stack || err);

  let statusCode = 500;
  let message = 'Erro interno no servidor';
  let details = null;

  // Erros do PostgreSQL (códigos comuns)
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        statusCode = 400;
        message = 'Registro duplicado. Este dado já existe no sistema.';
        break;
      case '23503': // Foreign key violation
        statusCode = 400;
        message = 'Violação de integridade. Este registro está sendo usado em outra tabela.';
        break;
      case '23502': // Not null violation
        statusCode = 400;
        message = 'Campo obrigatório não preenchido.';
        break;
      case '42P01': // Undefined table
        statusCode = 500;
        message = 'Erro de configuração no banco de dados (Tabela não encontrada).';
        break;
    }
  }

  // Erros customizados ou de validação
  if (err.name === 'ValidationError' || err.statusCode === 400) {
    statusCode = 400;
    message = err.message || 'Dados inválidos fornecidos.';
  }

  if (err.statusCode === 401) {
    statusCode = 401;
    message = err.message || 'Não autorizado.';
  }

  if (err.statusCode === 403) {
    statusCode = 403;
    message = err.message || 'Acesso negado.';
  }

  if (err.statusCode === 404) {
    statusCode = 404;
    message = err.message || 'Recurso não encontrado.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: process.env.NODE_ENV === 'development' ? (err.message || err) : undefined
  });
};

module.exports = errorHandler;
