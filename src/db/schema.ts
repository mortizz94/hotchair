import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const departments = sqliteTable('departments', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    color: text('color').notNull(), // Hex code or Tailwind class
    icon: text('icon'), // Lucide icon name
});

export const users = sqliteTable('users', {
    id: text('id').primaryKey(), // UUID
    code: text('code').notNull().unique(), // Employee Code
    pin: text('pin').notNull(), // 4-digit PIN
    name: text('name').notNull(),
    avatar: text('avatar'), // Avatar URL or placeholder
    role: text('role').$type<'admin' | 'user'>().default('user'),
    departmentId: integer('department_id').references(() => departments.id),
    altaiUser: text('altai_user'),
    altaiPassword: text('altai_password'),
});

export const attendance = sqliteTable('attendance', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => users.id),
    date: text('date').notNull(), // YYYY-MM-DD
    isPresent: integer('is_present', { mode: 'boolean' }).notNull(),
    seatId: integer('seat_id'), // 1-20
    timestamp: integer('timestamp').notNull(), // Created at
});

export const votes = sqliteTable('votes', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    targetUserId: text('target_user_id').notNull().references(() => users.id),
    voterUserId: text('voter_user_id').notNull().references(() => users.id),
    date: text('date').notNull(), // YYYY-MM-DD
    isTrue: integer('is_true', { mode: 'boolean' }).notNull(), // true = confirms presence/absence, false = denies
    timestamp: integer('timestamp').notNull(),
});

export const allowedIps = sqliteTable('allowed_ips', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ip: text('ip').notNull().unique(),
    label: text('label'), // Description e.g. "Madrid Office"
    createdAt: integer('created_at').notNull(),
});

export const timeEntries = sqliteTable('time_entries', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => users.id),
    date: text('date').notNull(), // YYYY-MM-DD
    startTime: integer('start_time').notNull(), // Timestamp
    endTime: integer('end_time'), // Timestamp, null if currently active
    description: text('description'),
    projectId: text('project_id'),
});

export const timeOffRequests = sqliteTable('time_off_requests', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: text('user_id').notNull().references(() => users.id),
    startDate: text('start_date').notNull(), // YYYY-MM-DD
    endDate: text('end_date').notNull(), // YYYY-MM-DD
    type: text('type').notNull(), // vacation, sick, personal
    reason: text('reason'),
    status: text('status').default('pending'), // pending, approved, rejected
    createdAt: integer('created_at').notNull().default(sql`(strftime('%s', 'now'))`)
});

export const seats = sqliteTable('seats', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    x: integer('x').notNull(),
    y: integer('y').notNull(),
    type: text('type').default('desk'), // desk, meeting_room, common
    status: text('status').default('available'), // available, occupied
    assignedUserId: text('assigned_user_id'), // if permanently assigned
});
