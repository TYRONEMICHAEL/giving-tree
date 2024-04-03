import 'reflect-metadata';
import { ToolProvider, Tool } from '@giving-tree/core';
import {
  type JournalEntry,
  type JournalEntryMetadata,
  JournalEntrySchema,
  REGISTERED_SCHEMA_JOURNAL_ENTRY
} from './types';
import { generator } from '..';

export class JournalToolProvider extends ToolProvider<JournalEntryMetadata> {
  @Tool({
    name: 'addEntry',
    description: 'Adds a new journal entry',
    parameters:
      generator.generateComponents().components.schemas[
        REGISTERED_SCHEMA_JOURNAL_ENTRY
      ]
  })
  async addEntry (entry: JournalEntry): Promise<number> {
    const { content: text, metadata } = entry;

    metadata.timestamp = (metadata.timestamp.length > 0)
      ? metadata.timestamp
      : new Date().toISOString();

    JournalEntrySchema.parse({ content: text, metadata });

    const result = await this.store.insert({ text, metadata });
    return result.id;
  }
}
