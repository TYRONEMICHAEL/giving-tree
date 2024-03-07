import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Handlebars from 'handlebars';
import {
  type PromptFunction,
  type Prompts,
  type MetadataFunction,
  type Metadata,
  type Message,
  type TemplateManager
} from './types';

const loadPrompts = (): Prompts => {
  const promptsPath = __dirname;
  const categoryDirs = fs.readdirSync(promptsPath).filter(entry => {
    return fs.statSync(path.join(promptsPath, entry)).isDirectory();
  });

  const prompts: Prompts = {};

  // Iterate through each category directory (Action, Behavior, Tone)
  categoryDirs.forEach(categoryDir => {
    const categoryPath = path.join(promptsPath, categoryDir);
    const promptDirs = fs.readdirSync(categoryPath).filter(entry => {
      return fs.statSync(path.join(categoryPath, entry)).isDirectory();
    });

    // Iterate through each prompt directory within the category
    promptDirs.forEach(dir => {
      const systemTemplatePath = path.join(categoryPath, dir, 'system.md');
      const id = `${categoryDir}/${dir}`;

      if (fs.existsSync(systemTemplatePath)) {
        const systemTemplateContent = fs.readFileSync(systemTemplatePath, 'utf8');
        const systemTemplate = Handlebars.compile(systemTemplateContent);

        const promptFunction: PromptFunction = (instructions?: string) => {
          const { content: systemContent } = matter(systemTemplate({})); // Future: pass variables
          const systemPrompt = [{ role: 'system', content: systemContent }];
          if (instructions == null) {
            return systemPrompt;
          }
          const userPrompt = [{ role: 'user', content: instructions }];
          return [...systemPrompt, ...userPrompt];
        };

        const metadataFunction: MetadataFunction = () => {
          const { data } = matter(systemTemplateContent);
          return { ...data, id };
        };

        // Store the prompt using a unique key combining category and directory
        prompts[id] = { prompt: promptFunction, metadata: metadataFunction };
      }
    });
  });

  return prompts;
};

export const initialize = (): TemplateManager => {
  const prompts = loadPrompts();

  const compile = async (name: string, instructions?: string): Promise<Message[]> =>
    prompts[name].prompt(instructions);

  const metadata = (name: string): Metadata[] => {
    return prompts[name].metadata();
  };

  const getPromptsMetadata = (): Metadata[] => {
    return Object.values(prompts).map(({ metadata }) => metadata());
  };

  const list = (tags: string[]): Metadata[] => {
    return getPromptsMetadata().filter((metadata) => {
      return tags.every(tag => metadata.tags?.includes(tag));
    });
  };

  return { compile, metadata, list };
};
