-- SEGECS - Dados Iniciais (Seed)
-- Scripts resilientes com ON CONFLICT

-- 1. Níveis de Acesso
INSERT INTO sys_niveis_acesso (id_nivel, nivel, descricao) VALUES
(1, 'Administrador', 'Acesso total ao sistema'),
(2, 'Orientador de Estágio', 'Gestão de alunos e concedentes'),
(3, 'Leitura', 'Apenas visualização de relatórios')
ON CONFLICT (id_nivel) DO NOTHING;

-- 2. Cidades Iniciais
INSERT INTO cad_cidades (id_cidade, cidade, uf) VALUES
(1, 'MUCAMBO', 'CE'),
(2, 'GRAÇA', 'CE'),
(3, 'PACUJÁ', 'CE')
ON CONFLICT (id_cidade) DO NOTHING;

-- 3. Cursos de Exemplo
INSERT INTO cad_cursos (nome_curso, eixo_curso) VALUES
('Técnico em Informática', 'Informação e Comunicação'),
('Técnico em Desenvolvimento de Sistemas', 'Informação e Comunicação'),
('Técnico em Redes de Computadores', 'Informação e Comunicação')
ON CONFLICT DO NOTHING;

-- 4. Usuário Administrador Inicial (Senha: 123456)
-- Hash bcrypt para '123456'
INSERT INTO sys_usuarios (id_nivel, nome_completo, email, senha_hash, ativo) VALUES
(1, 'Administrador do Sistema', 'admin@segecs.com', '$2a$10$VotkUpv/LBIhNK8baqGHJ.Jhoa8rsxFmJ5WnyTFpz3IACB6cDtDSW', true)
ON CONFLICT (email) DO NOTHING;
