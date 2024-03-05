import { BaseExtractor, type OpenAI, type BaseNode, type Metadata, TextNode } from 'llamaindex';
import { defaultDateMetadataPrompt } from './prompts';

class DateMetadataExtractor extends BaseExtractor {
  constructor (private readonly openaiLLM: OpenAI) {
    super();
  }

  async generateDate (node: BaseNode<Metadata>): Promise<Record<string, string[]>> {
    if (this.isTextNodeOnly && !(node instanceof TextNode)) {
      return {};
    }

    const contextStr = node.getContent(this.metadataMode);
    const prompt = defaultDateMetadataPrompt({ contextStr });
    const dates = JSON.parse((await this.openaiLLM.complete({ prompt })).text);
    return { dates };
  }

  async extract (nodes: Array<BaseNode<Metadata>>): Promise<Array<Record<string, any>>> {
    return await Promise.all(nodes.map(async (node) => await this.generateDate(node)));
  }
}

export default DateMetadataExtractor;
