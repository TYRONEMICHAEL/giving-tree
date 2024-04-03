import { z } from "zod";

export enum JournalEntryType {
  Text = "text",
}

export interface JournalEntryMetadata {
  version: string; // For tracking entry format versions
  name: string; // A short, descriptive title for the journal entry
  tags: string[]; // Categories or keywords for the entry, e.g., mood, location, activity
  analysis: string; // The LLM's analysis or reflection on the journal entry, providing insights or prompts for further reflection
  timestamp: string; // The date and time the entry was made
  location?: string; // Optional location data to provide context
  mood?: string; // Optional mood indicator, e.g., happy, stressed, reflective
  sentimentScore?: number; // An AI-generated score indicating the sentiment of the entry, useful for analysis
  customFields?: { [key: string]: any }; // A flexible container for any additional user-defined data
}

export interface JournalEntry {
  content: string;
  metadata: JournalEntryMetadata;
}

export interface JournalAgentConfig {
  openAiApiKey: string;
  openAiModel: string;
}

export const REGISTERED_SCHEMA_JOURNAL_ENTRY = "JournalEntry";
export const REGISTERED_SCHEMA_JOURNAL_METADATA = "JournalMetadata";

export const JournalEntrySchema = z
  .object({
    content: z
      .string()
      .openapi({ description: "The content of the journal entry." }),
    metadata: z.object({
      version: z
        .string()
        .openapi({ description: "The format version of the journal entry." }),
      name: z.string().openapi({
        description: "A short, descriptive title for the journal entry.",
      }),
      tags: z.array(z.string()).openapi({
        description:
          "Categories or keywords associated with the journal entry.",
      }),
      llmAnalysis: z.string().openapi({
        description: "The LLM's analysis or reflection on the journal entry.",
      }),
      timestamp: z.string().optional().openapi({
        description: "The date and time when the journal entry was made.",
      }),
      location: z.string().optional().openapi({
        description: "The location where the journal entry was made.",
      }),
      mood: z.string().optional().openapi({
        description: "The user's mood at the time of making the journal entry.",
      }),
      weather: z.string().optional().openapi({
        description:
          "The weather condition at the time of the journal entry, if relevant.",
      }),
      entryType: z.string().optional().openapi({
        description: "The type of the journal entry, e.g., text, voice, image.",
      }),
      privacyLevel: z.string().optional().openapi({
        description:
          "The privacy level of the journal entry, e.g., private, public, friends only.",
      }),
      sentimentScore: z.number().optional().openapi({
        description: "An AI-generated sentiment score of the journal entry.",
      }),
      customFields: z.record(z.any()).optional().openapi({
        description:
          "A flexible container for additional user-defined data associated with the journal entry.",
      }),
    }),
  })
  .openapi(REGISTERED_SCHEMA_JOURNAL_ENTRY);

export const JournalMetadataSchema = z
  .object({
    metadata: z.object({
      version: z
        .string()
        .openapi({ description: "The format version of the journal entry." }),
      name: z.string().openapi({
        description: "A short, descriptive title for the journal entry.",
      }),
      tags: z.array(z.string()).openapi({
        description:
          "Categories or keywords associated with the journal entry.",
      }),
      llmAnalysis: z.string().openapi({
        description: "The LLM's analysis or reflection on the journal entry.",
      }),
      timestamp: z.string().optional().openapi({
        description: "The date and time when the journal entry was made.",
      }),
      location: z.string().optional().openapi({
        description: "The location where the journal entry was made.",
      }),
      mood: z.string().optional().openapi({
        description: "The user's mood at the time of making the journal entry.",
      }),
      weather: z.string().optional().openapi({
        description:
          "The weather condition at the time of the journal entry, if relevant.",
      }),
      entryType: z.string().optional().openapi({
        description: "The type of the journal entry, e.g., text, voice, image.",
      }),
      privacyLevel: z.string().optional().openapi({
        description:
          "The privacy level of the journal entry, e.g., private, public, friends only.",
      }),
      sentimentScore: z.number().optional().openapi({
        description: "An AI-generated sentiment score of the journal entry.",
      }),
      customFields: z.record(z.any()).optional().openapi({
        description:
          "A flexible container for additional user-defined data associated with the journal entry.",
      }),
    }),
  })
  .openapi(REGISTERED_SCHEMA_JOURNAL_METADATA);
