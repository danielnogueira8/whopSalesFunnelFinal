import { pgEnum, pgTable, text, timestamp, uuid, jsonb } from 'drizzle-orm/pg-core'

export const tasks = pgTable('tasks', {
	id: uuid('id').defaultRandom().primaryKey(),
	title: text('title').notNull(),
	description: text('description'),
	completed: text('completed').notNull().default('false'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sequenceCategoryEnum = pgEnum('sequence_category', [
	'welcome',
	'cart_abandonment',
	'product_purchase',
	'upsell',
	'win_back',
])

export const sequenceStatusEnum = pgEnum('sequence_status', [
	'draft',
	'active',
	'paused',
])

export const nodeTypeEnum = pgEnum('node_type', [
	'send_dm',
	'wait',
	'condition',
	'offer_discount',
])

export const runStatusEnum = pgEnum('run_status', [
	'pending',
	'running',
	'completed',
	'paused',
])

export const triggerTypeEnum = pgEnum('trigger_type', [
  'welcome_join',
  'cart_abandon_1h',
  'product_purchase',
  'upsell_purchase',
  'win_back_cancel',
])

export const sequences = pgTable('sequences', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	category: sequenceCategoryEnum('category').notNull(),
	status: sequenceStatusEnum('status').notNull().default('draft'),
	companyId: text('company_id').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const sequenceNodes = pgTable('sequence_nodes', {
	id: uuid('id').defaultRandom().primaryKey(),
	sequenceId: uuid('sequence_id')
		.notNull()
		.references(() => sequences.id, { onDelete: 'cascade' }),
	type: nodeTypeEnum('type').notNull(),
	position: jsonb('position').$type<{ x: number; y: number }>().notNull(),
	data: jsonb('data').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sequenceEdges = pgTable('sequence_edges', {
	id: uuid('id').defaultRandom().primaryKey(),
	sequenceId: uuid('sequence_id')
		.notNull()
		.references(() => sequences.id, { onDelete: 'cascade' }),
	source: text('source').notNull(),
	target: text('target').notNull(),
	type: text('type'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const sequenceRuns = pgTable('sequence_runs', {
	id: uuid('id').defaultRandom().primaryKey(),
	sequenceId: uuid('sequence_id')
		.notNull()
		.references(() => sequences.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull(),
	currentNodeId: uuid('current_node_id').references(() => sequenceNodes.id),
	status: runStatusEnum('status').notNull().default('pending'),
	startedAt: timestamp('started_at').defaultNow().notNull(),
	completedAt: timestamp('completed_at'),
	metadata: jsonb('metadata').$type<Record<string, unknown>>(),
})

export const sequenceTriggers = pgTable('sequence_triggers', {
  id: uuid('id').defaultRandom().primaryKey(),
  sequenceId: uuid('sequence_id')
    .notNull()
    .references(() => sequences.id, { onDelete: 'cascade' }),
  type: triggerTypeEnum('type').notNull(),
  productId: text('product_id'),
  delayMinutes: text('delay_minutes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  providerId: text('provider_id'),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  key: text('key'),
  runAt: timestamp('run_at').notNull(),
  status: text('status').notNull().default('pending'),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
