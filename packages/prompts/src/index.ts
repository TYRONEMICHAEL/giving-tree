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

const reader = (filePath: string): string => fs.readFileSync(filePath, 'utf8');

const loadPrompts = (): Prompts => {
  const promptsPath = path.join(__dirname, 'Prompts');
  const promptDirs = fs.readdirSync(promptsPath).filter(entry => {
    return fs.statSync(path.join(promptsPath, entry)).isDirectory();
  });

  return promptDirs.reduce<Prompts>((acc, dir) => {
    const systemTemplatePath = path.join(promptsPath, dir, 'system.md');

    if (fs.existsSync(systemTemplatePath)) {
      const systemTemplateContent = reader(systemTemplatePath);
      const systemTemplate = Handlebars.compile(systemTemplateContent);

      const promptFunction: PromptFunction = (instructions) => {
        const { content: systemContent } = matter(systemTemplate({})); // In the future we may want to pass in variables
        const systemPrompt = [{ role: 'system', content: systemContent }];
        const userPrompt = [{ role: 'user', content: instructions }];
        return [...systemPrompt, ...userPrompt];
      };

      const metadataFunction: MetadataFunction = () => {
        const { data } = matter(systemTemplateContent);
        return { ...data, id: dir };
      };

      acc[dir] = { prompt: promptFunction, metadata: metadataFunction };
    }

    return acc;
  }, {});
};

export const initialize = (): TemplateManager => {
  const prompts = loadPrompts();

  const compile = async (name: string, instructions: string): Promise<Message[]> =>
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
