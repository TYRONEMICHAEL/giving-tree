/* eslint-disable @typescript-eslint/prefer-reduce-type-parameter */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
import {
  createStoreAwareAgent,
  type AgentMetadata,
  type CapabilitySchema,
  type Store,
  type StoreAwareAgent,
  type Metadata
} from '@giving-tree/core';

import { FunctionTool, OpenAI, OpenAIAgent } from 'llamaindex';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Joi from 'joi';

// ─────────────────────────────────────────────────────────────
// TYPES AND SCHEMAS
// ─────────────────────────────────────────────────────────────

export type PromptId = string;

export interface PromptMetadata {
  version: string
  name: string
  tags: string[]
  description: string
}

export const promptMetadataSchema = Joi.object({
  name: Joi.string().required(),
  tags: Joi.array().required(),
  version: Joi.string().required(),
  description: Joi.string().required()
});

interface Operation<F extends (...args: any[]) => Promise<any>> {
  fn: F
  metadata: CapabilitySchema
}

type Capability = 'addPrompt' | 'updatePrompt' | 'queryPrompt' | 'deletePrompt' | 'usePrompt';

interface Capabilities {
  addPrompt: Operation<({ markdown }: { markdown: string }) => Promise<string>>
  // usePrompt: Operation<({ prompt, content }: { prompt: string, content: string }) => Promise<string>>
  updatePrompt: Operation<(id: string, prompt: string) => Promise<string>>
  queryPrompt: Operation<({ query }: { query: string }) => Promise<string>>
  deletePrompt: Operation<(id: string) => Promise<string>>
}

export type PromptAgent = StoreAwareAgent & Capabilities;

export interface PromptAgentConfig {
  apiKey: string
  model: string
}

// ─────────────────────────────────────────────────────────────
// CUSTOM ERRORS
// ─────────────────────────────────────────────────────────────

class PromptValidationError extends Error {
  constructor (message: string) {
    super(message);
    this.name = 'PromptValidationError';
  }
}

// ─────────────────────────────────────────────────────────────
// A LIST OF CAPABILITIES
// ─────────────────────────────────────────────────────────────

export const capabilities = (store: Store, metadata: AgentMetadata): Capabilities => {
  // ─── UTILITY FUNCTIONS ────────────────────────────────────
  const capabilitiesMap = metadata.capabilities
    .reduce((acc, capability) => {
      return { ...acc, [capability.name]: capability };
    }, {} as Record<Capability, CapabilitySchema>);

  const generateHashId = (content: string): string => {
    return crypto.createHash('sha256').update(content).digest('hex');
  };

  const validatePromptSchema = (data: any): void => {
    const { error } = promptMetadataSchema.validate(data);
    if (error != null) {
      // Custom error handling for prompt validation
      throw new PromptValidationError(`Prompt validation error: ${error.message}`);
    }
  };

  // ─── ADD CAPABILITY ────────────────────────────────────

  const addPromptCapability = async (obj: { markdown: string, metadata: PromptMetadata }): Promise<string> => {
    const { markdown, metadata } = obj;
    const id = generateHashId(markdown);
    validatePromptSchema(metadata);
    await store.insert({ text: markdown, metadata: { ...metadata, id } });
    return id;
  };

  // ─── UPDATE Capability ────────────────────────────────────

  const updatePromptCapability = async (id: string, markdown: string): Promise<string> => {
    throw new Error('Not implemented');
  };

  // ─── QUERY Capability ────────────────────────────────────

  const queryPromptCapability = async ({ query, metadata }: { query: string, metadata: Metadata }): Promise<string> => {
    const result = await store.query(query, metadata);
    return result;
  };

  // ─── DELETE Capability ────────────────────────────────────

  const deletePromptCapability = async (id: string): Promise<string> => {
    await store.remove(id);
    return id;
  };

  // ─── SCHEMA ───────────────────────────────────────────────
  const { addPrompt, updatePrompt, queryPrompt, deletePrompt } = capabilitiesMap;

  return {
    addPrompt: { fn: addPromptCapability, metadata: addPrompt },
    updatePrompt: { fn: updatePromptCapability, metadata: updatePrompt },
    queryPrompt: { fn: queryPromptCapability, metadata: queryPrompt },
    deletePrompt: { fn: deletePromptCapability, metadata: deletePrompt }
  };
};

// Load metadata for the PromptAgent from a JSON file
export function createPromptAgent (store: Store, config: PromptAgentConfig): PromptAgent {
  // Load PromptAgent metadata from JSON file
  const metadataPath = path.join(__dirname, './', 'metadata.json');
  const promptAgentMetadata: AgentMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const toolSet = capabilities(store, promptAgentMetadata);
  const { apiKey, model } = config;

  const agent = new OpenAIAgent({
    tools: Object.values(toolSet)
      .map((c: Operation<(...args: any[]) => Promise<any>>) => {
        return new FunctionTool(c.fn, {
          name: c.metadata.name,
          description: c.metadata.description,
          parameters: c.metadata.parameters
        });
      }),
    verbose: true,
    llm: new OpenAI({ model, apiKey })
  });

  // Define the processQuery function specific to the PromptAgent
  const processQueryFn = async (query: string): Promise<string> => {
    return (await agent.chat({ message: query })).response;
  };

  // Use createStoreAwareAgent to create and return the PromptAgent
  return {
    ...createStoreAwareAgent(promptAgentMetadata, store, processQueryFn),
    ...toolSet
  };
}
