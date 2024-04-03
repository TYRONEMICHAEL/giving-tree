import "reflect-metadata";
import { Store } from "./store";

// ─────────────────────────────────────────────────────────────
// TYPES AND INTERFACES
// ─────────────────────────────────────────────────────────────

export interface ToolParameter {
  type: string;
  description: string;
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
      type: 'object';
      properties: Record<string, ToolParameter>;
      required: string[];
  };
}

// ─────────────────────────────────────────────────────────────
// FUNCTIONS AND CLASSES
// ─────────────────────────────────────────────────────────────

export function Tool(info: { name: string; description: string; parameters: any }) {
  return function (
    target: any,
    propertyKey: string
  ) {
    Reflect.defineMetadata("tool", info, target, propertyKey);
  };
}

export class ToolProvider<T> {
  readonly store: Store<T>;
  tools: [Function, ToolSchema][];

  constructor(store: Store<T>) {
      this.store = store;
      this.tools = this.generateToolSchema();
  }

  private generateToolSchema(): [Function, ToolSchema][] {
    const tools: [Function, ToolSchema][] = [];
    for (const methodName of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      if (Reflect.hasMetadata("tool", this, methodName)) {
        const toolMetadata = Reflect.getMetadata("tool", this, methodName);
        const method = (this as any)[methodName];
        if (typeof method === 'function') {
          tools.push([method.bind(this), toolMetadata]);
        }
      }
    }
    return tools;
  }
}

export class ToolProvidersManager {
  private toolProviders = new Map<string, ToolProvider<any>>();

  register(provider: ToolProvider<any>): void {
    const key = provider.constructor.name; // Use the class name as a key
    this.toolProviders.set(key, provider);
  }

  get<P extends ToolProvider<any>>(providerClass: new (...args: any[]) => P): P | undefined {
    const key = providerClass.name;
    return this.toolProviders.get(key) as P | undefined;
  }

  all(): ToolProvider<any>[] {
    return Array.from(this.toolProviders.values());
  }
}