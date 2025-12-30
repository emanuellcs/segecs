-- Migração: Adicionar campos sociais à tabela cad_alunos
-- Execute este script se o banco já existir e precisar adicionar os novos campos

ALTER TABLE cad_alunos
ADD COLUMN IF NOT EXISTS facebook VARCHAR(255),
ADD COLUMN IF NOT EXISTS linkedin VARCHAR(255),
ADD COLUMN IF NOT EXISTS github VARCHAR(255);