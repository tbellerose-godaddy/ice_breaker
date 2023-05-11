import { SerpAPI, Tool } from 'langchain/tools';

class CustomSerpAPI extends SerpAPI {
  async _call(input: string): Promise<string> {
    const { timeout, ...params } = this.params;
    const resp = await fetch(
      this.buildUrl(
        'search',
        {
          ...params,
          api_key: this.key,
          q: input,
        },
        this.baseUrl
      ),
      {
        signal: timeout ? AbortSignal.timeout(timeout) : undefined,
      }
    );

    const res = await resp.json();

    if (res.error) {
      throw new Error(`Got error from serpAPI: ${res.error}`);
    }

    if (res.answer_box?.answer) {
      return res.answer_box.answer;
    }

    if (res.answer_box?.snippet) {
      return res.answer_box.link;
    }

    if (res.answer_box?.snippet_highlighted_words) {
      return res.answer_box.snippet_highlighted_words[0];
    }

    if (res.sports_results?.game_spotlight) {
      return res.sports_results.game_spotlight;
    }

    if (res.knowledge_graph?.description) {
      return res.knowledge_graph.description;
    }

    if (res.organic_results?.[0]?.snippet) {
      return res.organic_results[0].link;
    }

    return 'No good search result found';
  }
}

export class GetProfileURL extends Tool {
  name: string;
  description: string;
  protected serpApi: SerpAPI;
  constructor(apiKey: string, name: string, description: string) {
    super();
    this.name = name;
    this.description = description;
    this.serpApi = new CustomSerpAPI(apiKey);
  }

  async _call(arg: string): Promise<string> {
    return await this.serpApi.call(arg);
  }
}
