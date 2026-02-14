import { sql, relations } from 'drizzle-orm';
import { sqliteTable, text, integer, index, } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

// --- Enums ---
export const workStreamEnum = ['planning', 'delivery', 'ops'] as const;
export type WorkStream = (typeof workStreamEnum)[number];

export const energyLevelEnum = ['light', 'medium', 'heavy'] as const;
export type EnergyLevel = (typeof energyLevelEnum)[number];

export const commitmentStatusEnum = ['unconfirmed', 'open', 'done', 'dismissed'] as const;
export type CommitmentStatus = (typeof commitmentStatusEnum)[number];

export const conversationSourceEnum = ['slack', 'email', 'manual', 'other'] as const;
export type ConversationSource = (typeof conversationSourceEnum)[number];

// --- Tables ---

export const people = sqliteTable('people', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    relationship: text('relationship'), // 'cofounder', 'teammate', etc.
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const conversations = sqliteTable('conversations', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    source: text('source', { enum: conversationSourceEnum }).notNull(),
    externalReference: text('external_reference'), // Optimize: Add index if lookups by ext ref are frequent
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    index('conversations_source_idx').on(table.source),
]);

export const commitments = sqliteTable('commitments', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    personId: text('person_id').references(() => people.id),
    conversationId: text('conversation_id').references(() => conversations.id),
    workStream: text('work_stream', { enum: workStreamEnum }).notNull(),
    energyLevel: text('energy_level', { enum: energyLevelEnum }).notNull(),
    status: text('status', { enum: commitmentStatusEnum }).notNull().default('open'),
    title: text('title').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    index('commitments_person_idx').on(table.personId),
    index('commitments_status_idx').on(table.status),
    index('commitments_work_stream_idx').on(table.workStream),
]);

export const energySnapshots = sqliteTable('energy_snapshots', {
    id: text('id').primaryKey().$defaultFn(() => nanoid()),
    level: text('level', { enum: energyLevelEnum }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
    index('energy_snapshots_created_at_idx').on(table.createdAt), // To easily get the latest
]);

// --- Relationships ---

export const peopleRelations = relations(people, ({ many }) => ({
    commitments: many(commitments),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
    commitments: many(commitments),
}));

export const commitmentsRelations = relations(commitments, ({ one }) => ({
    person: one(people, {
        fields: [commitments.personId],
        references: [people.id],
    }),
    conversation: one(conversations, {
        fields: [commitments.conversationId],
        references: [conversations.id],
    }),
}));
