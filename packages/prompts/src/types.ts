import Joi from "joi";

export interface Prompt {
  id: string;
  packId: string;
  version: string;
  name: string;
  tags: string[];
  content: string;
}

export const promptSchema = Joi.object({
  name: Joi.string().required(),
  packId: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).required(),
  version: Joi.string().required(),
  content: Joi.string().required(),
});

export interface PromptPack {
  id: string;
  version: string;
  name: string;
  description: string;
  prompts: string[];
}

export const promptPackSchema = Joi.object({
  id: Joi.string().required(),
  version: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  prompts: Joi.array().items(Joi.string()).required(),
});

export interface PromptService {
  addPrompt(markdown: string): Promise<Prompt>;
  updatePrompt(markdown: string): Promise<Prompt>;
  deletePrompt(markdown: string): Promise<void>;
  searchPrompts(query: string): Promise<Prompt[]>;
}

export interface PromptPackService {
  installPack(id: string): Promise<void>;
  updatePack(id: string): Promise<void>;
  deletePack(id: string): Promise<void>;
  searchPacks(query: string): Promise<string>;
}