export interface Message {
  role: string
  content: string
}

export interface Metadata {
  id: string
  name: string
  description: string
  tags: string[]
  schema: any
}

export interface TemplateManager {
  compile: (name: string, instructions: string) => Promise<Message[]>
  metadata: (name: string) => Metadata[]
  list: (tags: string[]) => Metadata[]
}

export type PromptFunction = (instructions: string) => Message[];

// Define a more specific type based on your schema structure
export type MetadataFunction = () => any;

export interface PromptObject {
  prompt: PromptFunction
  metadata: MetadataFunction
}

export type Prompts = Record<string, PromptObject>;
