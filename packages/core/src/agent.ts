import { type Store } from './store';

// ─────────────────────────────────────────────────────────────
// TYPES AND INTERFACES
// ─────────────────────────────────────────────────────────────

export type AgentId = string;

export interface CapabilityParameter {
  type: string
  description: string
  pattern?: string
}

export interface CapabilitySchema {
  name: string
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, CapabilityParameter>
    required: string[]
  }
}

export interface AgentMetadata {
  id: string
  name: string
  description: string
  version: string
  capabilities: CapabilitySchema[]
}

export interface Agent {
  readonly metadata: AgentMetadata

  /**
   * Processes a given query and returns a response.
   *
   * @param query A string representing the primary task for the agent.
   * @returns A promise that resolves to a string response from the agent.
   */
  processQuery: (query: string) => Promise<string>
}

export interface StoreAwareAgent extends Agent {
  readonly store: Store
}

export interface AgentError extends Error {
  id: AgentId
  capability: CapabilitySchema
}

// ─────────────────────────────────────────────────────────────
// COMMON IMPLEMENTATION
// ─────────────────────────────────────────────────────────────

export const createAgent = (metadata: AgentMetadata, processQueryFn: (query: string) => Promise<string>): Agent => {
  return {
    metadata,
    processQuery: processQueryFn
  };
};

export const createStoreAwareAgent = (
  metadata: AgentMetadata,
  store: Store,
  processQueryFn: (query: string) => Promise<string>): StoreAwareAgent => {
  return {
    metadata,
    store,
    processQuery: processQueryFn
  };
};
