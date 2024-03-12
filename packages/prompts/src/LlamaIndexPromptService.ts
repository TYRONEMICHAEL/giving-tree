import { storageContextFromDefaults, Document, VectorStoreIndex, MetadataMode } from "llamaindex";
import crypto from 'crypto';
import { Prompt, PromptPack, PromptService, promptSchema } from "./types";
import grayMatter from "gray-matter";

class LlamaIndexPromptService implements PromptService {

  constructor(private readonly storageLocation: string) {}

  async addPrompt(markdown: string): Promise<Prompt> {
    // Parse the markdown to extract front matter and content
    const { data, content } = grayMatter(markdown);

    // Generate a unique hash ID from the entire markdown content
    const id = generateHashId(markdown);

    // Construct the metadata object, including the generated ID
    const metadata = { id, ...data };

    // Validate the prompt schema early to ensure we're working with valid data
    validatePromptSchema({ ...metadata, content });

    // Prepare the document for indexing in the vector store
    const document = new Document({ text: content, metadata });

    // Retrieve the storage context for the vector store
    const storageContext = await storageContextFromDefaults({
      persistDir: this.storageLocation
    });

    // Index the document in the vector store
    await VectorStoreIndex.fromDocuments([document], {
      storageContext
    });

    // Construct and return the prompt object, ensuring it matches the Prompt type
    const prompt = {
      ...metadata,
      content
    };

    return prompt as Prompt;
  }

  async updatePrompt(markdown: string): Promise<Prompt> {
    const { data, content } = grayMatter(markdown);
    const id = data.id;
    
    if (!id) {
      throw new Error('Prompt ID not found in metadata');
    }

    const metadata = { id, ...data };

    validatePromptSchema({ ...metadata, content });

    const storageContext = await storageContextFromDefaults({
      persistDir: this.storageLocation
    });

    await storageContext.docStore.getDocument(id, true);
    const updatedDoc = new Document({ text: content, metadata });
    await storageContext.docStore.addDocuments([updatedDoc], true);

    const prompt = {
      ...metadata,
      content
    };

    return prompt as Prompt;
  }


  async deletePrompt(id: string): Promise<void> {
    // Retrieve the storage context for the vector store
    const storageContext = await storageContextFromDefaults({
      persistDir: this.storageLocation
    });

    await storageContext.docStore.deleteDocument(id, true);
  }

  async listPrompts(): Promise<Prompt[]> {
    // Retrieve the storage context for the vector store
    const storageContext = await storageContextFromDefaults({
      persistDir: this.storageLocation
    });

    const docs = await storageContext.docStore.docs();
    const prompts = Object.keys(docs).map((doc) => {
      const metadata = docs[doc].metadata;
      const content = docs[doc].getContent(MetadataMode.NONE);
      return { ...metadata, content };
    });

    return prompts as Prompt[];
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    const storageContext = await storageContextFromDefaults({
      persistDir: './storage'
    });
    const index = await VectorStoreIndex.init({
      storageContext
    });

    const loadedQueryEngine = index.asQueryEngine();
    const loadedResponse = await loadedQueryEngine.query({
      query
    });

    const { metadata } = loadedResponse;
    const response = loadedResponse.sourceNodes.map((node) =>  {
      return {
        ...metadata,
        content: node.getContent(MetadataMode.NONE)
      } as Prompt;
    });

    return response;
  }
}

function generateHashId(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function validatePromptSchema(data: any): void {
  const { error } = promptSchema.validate(data);

  if (error) {
    throw new Error(`Prompt validation error: ${error.message}`);
  }
}

export default LlamaIndexPromptService;
