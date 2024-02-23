import { BaseExtractor, type OpenAI, type BaseNode, type Metadata, TextNode } from 'llamaindex';
import { defaultEmotionalTriggersMetadataPrompt } from './prompts';

class EmotionalTriggersMetadataExtractor extends BaseExtractor {
  constructor (private readonly openaiLLM: OpenAI) {
    super();
  }

  async generateDate (node: BaseNode<Metadata>): Promise<Record<string, string[]>> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const contextStr = node.getContent(this.metadataMode);
    const prompt = defaultEmotionalTriggersMetadataPrompt({ contextStr });
    const triggers = (await this.openaiLLM.complete({ prompt })).text;
    console.log(triggers);
    return JSON.parse(triggers);
  }

  async extract (nodes: Array<BaseNode<Metadata>>): Promise<Array<Record<string, any>>> {
    return await Promise.all(nodes.map(async (node) => await this.generateDate(node)));
  }
}

export default EmotionalTriggersMetadataExtractor;
