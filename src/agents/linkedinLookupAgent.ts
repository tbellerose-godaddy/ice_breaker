import { PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { GetProfileURL } from '../tools/tools';
import { Tool } from 'langchain/tools';

export async function lookup(name: string): Promise<string> {
  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-3.5-turbo',
  });

  const template = `Given the full name {name_of_person} I want you to get me a link to their LinkedIn profile page.
    You cannot click on links.
    Your answer should contain only a URL.`;

  const tools: Tool[] = [
    new GetProfileURL(
      process.env.SERP_API_KEY as string,
      'Crawl Google for LinkedIn profile page',
      'useful for when you need to get the LinkedIn Page URL'
    ),
  ];

  const agent = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: 'zero-shot-react-description',
    verbose: true,
  });

  const promptTemplate = new PromptTemplate({
    template,
    inputVariables: ['name_of_person'],
  });

  const linkedInProfileURL = await agent.call({
    input: await promptTemplate.format({ name_of_person: name }),
  });

  return linkedInProfileURL.output;
}
