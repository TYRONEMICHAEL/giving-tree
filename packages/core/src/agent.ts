import { type Store } from './store';
import { ToolProvider, ToolProvidersManager, type ToolSchema } from './toolProvider';

// ─────────────────────────────────────────────────────────────
// TYPES AND INTERFACES
// ─────────────────────────────────────────────────────────────

export type AgentId = string;

export interface AgentMetadata {
  id: string
  name: string
  description: string
  version: string
}

export interface AgentError extends Error {
  id: AgentId
  Tool: ToolSchema
}

// ─────────────────────────────────────────────────────────────
// CLASSES
// ─────────────────────────────────────────────────────────────

export abstract class BaseAgent {
  metadata: AgentMetadata;

  protected toolProvidersManager: ToolProvidersManager = new ToolProvidersManager();

  constructor(metadata: AgentMetadata) {
    this.metadata = metadata;
  }

  addToolProviders(providers: ToolProvider<any>[]): void {
    providers.forEach(this.toolProvidersManager.register.bind(this.toolProvidersManager));
  }

  getToolProvider<P extends ToolProvider<any>>(providerClass: new (...args: any[]) => P): P | undefined {
    return this.toolProvidersManager.get(providerClass);
  }

  getAllToolProviders(): ToolProvider<any>[] {
    return this.toolProvidersManager.all();
  }

  /**
   * Processes a given query and returns a response.
   *
   * @param query A string representing the primary task for the agent.
   * @returns A promise that resolves to a string response from the agent.
   */
  abstract processQuery(query: string): Promise<string>;
}