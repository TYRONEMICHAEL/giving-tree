import "reflect-metadata";
import {
  BaseAgent,
  ToolProvider,
} from "@giving-tree/core";
import { FunctionTool, OpenAI, OpenAIAgent as LlamaIndexAgent } from "llamaindex";

type LLMConfig = {
  openAiApiKey: string;
  openAiModel: string;
};

export class OpenAiAgent extends BaseAgent {
  private llmAgent: LlamaIndexAgent;

  constructor(private providers: ToolProvider<any>[], readonly config: LLMConfig) {
    super({
      id: "openai-agent",
      name: "OpenAI Agent",
      description: "An agent that uses OpenAI's API for natural language processing.",
      version: "1.0",
    });

    this.addToolProviders(providers);
    this.initializeLLMAgent(this.config);
  }

  private initializeLLMAgent(llmConfig: LLMConfig) {
    const functionTools = this.getAllToolProviders().flatMap(provider => 
      provider.tools.map(([method, toolSchema]) => 
        new FunctionTool(method as (...args: any[]) => any, toolSchema) // Directly construct FunctionTool from the tuple
      )
    );
  
    this.llmAgent = new LlamaIndexAgent({
      llm: new OpenAI({ model: llmConfig.openAiModel, apiKey: llmConfig.openAiApiKey }),
      tools: functionTools,
      verbose: true,
    });
  }

  async processQuery(query: string): Promise<string> {
    return await this.llmAgent.chat({ message: query }).then(response => response.response);
  }
}

