import * as dotenv from 'dotenv';
import { PromptAgent } from '@giving-tree/agent';
import { type DocumentId, type DocumentData, Store } from '@giving-tree/core';

dotenv.config();

class MockStore implements Store {
  async create (documentData: DocumentData): Promise<DocumentId> {
    console.log('Creating document with data:', documentData);
    // Return a dummy DocumentId
    return 'dummyId';
  }

  async query (query: string): Promise<DocumentData[]> {
    console.log('Querying documents with query:', query);
    // Return an empty array or a mock DocumentData array as needed
    return [];
  }

  async get (id: DocumentId): Promise<DocumentData> {
    console.log('Getting document with ID:', id);
    // Return a mock DocumentData object
    return { id, mockData: 'This is mock data' };
  }

  async update (id: DocumentId, documentData: DocumentData): Promise<DocumentId> {
    console.log('Updating document with ID:', id, 'with data:', documentData);
    // Return the same ID to indicate success
    return id;
  }

  async delete (id: DocumentId): Promise<DocumentId> {
    console.log('Deleting document with ID:', id);
    // Return the same ID to indicate success
    return id;
  }
}

void (async () => {
  const agent = new PromptAgent(new MockStore());
  const result = await agent.processQuery(`Please add the following prompt: --- version: "1.0" name: "Futuristic AI Interface Analysis" tags: ["AI", "interface", "technology", "innovation"] description: "An in-depth analysis of the latest advancements in AI user interfaces, with a focus on holographic and interactive data visualization technologies." --- # Prompt You are my best friend. Act like it.`);
  console.log(result);
})();
