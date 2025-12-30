-- Seed data for development (opcional)
-- AVISO: Não execute em produção sem revisar os dados!

-- Limpar dados existentes (cuidado em produção!)
-- TRUNCATE TABLE reports CASCADE;
-- TRUNCATE TABLE internships CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- Inserir dados de exemplo
-- Note: As senhas devem ser hasheadas com bcrypt antes de inserir
-- Exemplo de senha "password123" hasheada: $2a$10$rOzJqK9qJK9qJK9qJK9qJu...

-- Cursos de exemplo
INSERT INTO cad_cursos (nome_curso, eixo_curso, observacoes) VALUES
('Técnico em Informática', 'Tecnologia da Informação', 'Curso focado em desenvolvimento de software e manutenção de sistemas'),
('Técnico em Administração', 'Administração e Negócios', 'Curso para formação de profissionais em gestão empresarial'),
('Técnico em Enfermagem', 'Saúde', 'Curso técnico na área da saúde com ênfase em cuidados básicos'),
('Técnico em Mecânica', 'Engenharia', 'Curso para formação de técnicos em manutenção industrial');

-- Usuários de exemplo (você precisará gerar os hashes de senha)
-- INSERT INTO users (email, password, name, role) VALUES
-- ('admin@segecs.edu', '$2a$10$...', 'Administrador', 'admin'),
-- ('coordenador@segecs.edu', '$2a$10$...', 'Coordenador', 'coordinator'),
-- ('supervisor@example.com', '$2a$10$...', 'Supervisor', 'supervisor'),
-- ('aluno@example.com', '$2a$10$...', 'Aluno Teste', 'student');

