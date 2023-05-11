import dotenv from 'dotenv';
import { LLMChain, PromptTemplate } from 'langchain';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { lookup } from './agents/linkedinLookupAgent';
import { scrapeLinkedInProfile } from './third_parties/linkedin';

async function main() {
  dotenv.config();

  if (process.argv.length === 2) {
    console.log('Please provide a name to lookup');
    process.exit(1);
  }

  const name = process.argv[2];

  const summaryTemplate = `\
  given the LinkedIn information {information} about a person I want you to create:
    1. a short summary
    2. two interesting facts about them\
  `;

  const template = new PromptTemplate({
    template: summaryTemplate,
    inputVariables: ['information'],
  });

  const llm = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
    modelName: 'gpt-3.5-turbo',
  });

  const chain = new LLMChain({ llm, prompt: template });

  const linkedInProfileURL = await lookup(name);

  console.log(linkedInProfileURL);

  const linkedInData = await scrapeLinkedInProfile(linkedInProfileURL);

  console.log(await chain.call({ information: linkedInData }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
