import { pgTable, serial, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents',{
    id : serial('id').primaryKey(),
    title:     text('title').notNull(),
    content:   text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const codeFiles = pgTable('code_files', {
    id:        serial('id').primaryKey(),
    owner:     text('owner').notNull(),
    repo:      text('repo').notNull(),
    commitSha: text('commit_sha').notNull(),
    filePath:  text('file_path').notNull(),
    content:   text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const codeChunks = pgTable('code_chunks', {
    id:         serial('id').primaryKey(),
    fileId:     integer('file_id').references(() => codeFiles.id, { onDelete: 'cascade' }).notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    content:    text('content').notNull(),
    startLine:  integer('start_line'),
    endLine:    integer('end_line'),
    chunkType:  text('chunk_type'),   // 'function' | 'class' | 'import_block' | 'misc'
    // embedding:  vector('embedding', { dimensions: 1536 }), -- add after installing drizzle-orm/pg-vector
    createdAt:  timestamp('created_at').defaultNow(),
});
