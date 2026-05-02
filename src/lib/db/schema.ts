import { pgTable, text, serial, varchar, timestamp, integer, boolean, jsonb, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations, eq, gte } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const messageStatusEnum = pgEnum('message_status', ['received', 'processing', 'responded']);
export const severityLevelEnum = pgEnum('severity_level', ['low', 'medium', 'high', 'critical']);
export const pillarEnum = pgEnum('pillar', ['organization', 'inspiration', 'entertainment', 'wellbeing']);
export const routineTypeEnum = pgEnum('routine_type', ['daily', 'weekly', 'monthly', 'yearly']);

// Tables
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseId: varchar('supabase_id', { length: 36 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  whatsappNumber: varchar('whatsapp_number', { length: 20 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  preferredAssistant: varchar('preferred_assistant', { length: 50 }).notNull().default('Mateus'),
  timezone: varchar('timezone', { length: 50 }).notNull().default('America/Sao_Paulo'),
  language: varchar('language', { length: 10 }).notNull().default('pt-BR'),
  consentGiven: boolean('consent_given').notNull().default(false),
  consentDate: timestamp('consent_date').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  whatsappMessageId: varchar('whatsapp_message_id', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  status: messageStatusEnum('status').notNull().default('received'),

  // Crisis detection fields
  severity: integer('severity').notNull().default(0), // 0-10 scale
  isCrisis: boolean('is_crisis').notNull().default(false),
  crisisConfidence: integer('crisis_confidence').default(null), // 0-100
  detectedPatterns: jsonb('detected_patterns'), // array of matched patterns
  crisisKeywords: text('crisis_keywords', { mode: 'json' }), // array of detected keywords
  crisisDetectedAt: timestamp('crisis_detected_at'), // when crisis was detected
  crisisResponseSent: boolean('crisis_response_sent').notNull().default(false),
  crisisResponseType: varchar('crisis_response_type', { length: 50 }), // 'audio', 'text', 'media'

  // Response tracking
  respondedWith: varchar('responded_with', { length: 255 }),
  respondedAt: timestamp('responded_at'),

  // Audit fields
  processedBy: varchar('processed_by', { length: 50 }), // 'pattern_match' or 'claude_routine'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
},
(table) => ({
  // Indices para performance
  userIdIdx: index('idx_messages_user_id').on(table.userId),
  createdAtIdx: index('idx_messages_created_at').on(table.createdAt.desc()),
  crisisIdx: index('idx_messages_is_crisis').on(table.isCrisis).where(eq(table.isCrisis, true)),
  severityIdx: index('idx_messages_severity').on(table.severity).where(gte(table.severity, 8)),
  crisisDetectedIdx: index('idx_messages_crisis_detected').on(table.crisisDetectedAt),
}));

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  pillar: pillarEnum('pillar').notNull(),
  order: integer('order').notNull(),
  icon: varchar('icon', { length: 50}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const userCategories = pgTable('user_categories', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  categoryId: serial('category_id').references(() => categories.id).notNull(),
  selectedAt: timestamp('selected_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const audios = pgTable('audios', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  categoryId: serial('category_id').references(() => categories.id).notNull(),
  audioUrl: varchar('audio_url', { length: 500 }).notNull(),
  duration: integer('duration').notNull(), // seconds
  instructor: varchar('instructor', { length: 100 }).notNull(),
  language: varchar('language', { length: 10 }).notNull().default('pt-BR'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const routines = pgTable('routines', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  type: routineTypeEnum('type').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  schedule: varchar('schedule', { length: 50 }).notNull(), // cron format
  content: text('content').notNull(),
  enabled: boolean('enabled').notNull().default(true),
  lastExecuted: timestamp('last_executed'),
  nextExecution: timestamp('next_execution'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const crisisAuditLog = pgTable('crisis_audit_log', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id).notNull(),
  messageId: serial('message_id').references(() => messages.id).notNull(),
  detectedAt: timestamp('detected_at').notNull().defaultNow(),
  severity: severityLevelEnum('severity').notNull(),
  patterns: jsonb('patterns').notNull(),
  responseGiven: varchar('response_given', { length: 255 }).notNull(),
  followUpNeeded: boolean('follow_up_needed').notNull().default(false),
  notes: text('notes'),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  categories: many(userCategories),
  routines: many(routines),
  auditLog: many(crisisAuditLog),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
  auditLog: many(crisisAuditLog),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  users: many(userCategories),
  audios: many(audios),
}));

export const userCategoriesRelations = relations(userCategories, ({ one }) => ({
  user: one(users, {
    fields: [userCategories.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [userCategories.categoryId],
    references: [categories.id],
  }),
}));

export const audiosRelations = relations(audios, ({ one }) => ({
  category: one(categories, {
    fields: [audios.categoryId],
    references: [categories.id],
  }),
}));

export const routinesRelations = relations(routines, ({ one }) => ({
  user: one(users, {
    fields: [routines.userId],
    references: [users.id],
  }),
}));

export const crisisAuditLogRelations = relations(crisisAuditLog, ({ one }) => ({
  user: one(users, {
    fields: [crisisAuditLog.userId],
    references: [users.id],
  }),
  message: one(messages, {
    fields: [crisisAuditLog.messageId],
    references: [messages.id],
  }),
}));

// Type exports for convenience
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type UserCategory = typeof userCategories.$inferSelect;
export type NewUserCategory = typeof userCategories.$inferInsert;
export type Audio = typeof audios.$inferSelect;
export type NewAudio = typeof audios.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type CrisisAuditLog = typeof crisisAuditLog.$inferSelect;
export type NewCrisisAuditLog = typeof crisisAuditLog.$inferInsert;
