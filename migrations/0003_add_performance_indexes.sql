-- Migration: 0003_add_performance_indexes.sql
-- Objetivo: Adicionar índices críticos para performance em produção
-- Criado: 2026-05-03
-- Tempo estimado: 30 segundos

-- ============================================================================
-- ÍNDICES CRÍTICOS PARA QUERIES FREQUENTES
-- ============================================================================

-- Índice em messages para filtros por usuário (N+1 prevention)
CREATE INDEX IF NOT EXISTS idx_messages_user_id
ON messages(userId);

-- Índice em messages para ordenação por data (comum em dashboards)
CREATE INDEX IF NOT EXISTS idx_messages_created_at
ON messages(createdAt DESC);

-- Índice composto em user_categories para soft-delete pattern
-- Otimiza: SELECT * FROM user_categories WHERE userId = X AND deletedAt IS NULL
CREATE INDEX IF NOT EXISTS idx_user_categories_user_id_deleted
ON user_categories(userId, deletedAt);

-- Índice em crisis_audit_log para buscar por usuário
CREATE INDEX IF NOT EXISTS idx_crisis_audit_log_user_id
ON crisis_audit_log(userId);

-- Índice em crisis_audit_log para timeline (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_crisis_audit_log_created_at
ON crisis_audit_log(createdAt DESC);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Execute no Supabase SQL Editor para confirmar:
-- SELECT indexname FROM pg_indexes
-- WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
