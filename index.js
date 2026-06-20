import { createClient } from "@supabase/supabase-js";
import OpenAI from 'openai';
import { users } from "./data.js";

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
  baseURL: process.env['OPENAI_BASE_URL'],
  dangerouslyAllowBrowser: true,
});

const supabase = createClient(process.env['SUPABASE_URL'], process.env['SUPABASE_SERVICE_KEY']);

async function createEmbedding(input) {
  const embeddingResponse = await client.embeddings.create({
    model: process.env['OPENAI_EMBEDDINGS_MODEL'],
    input
  });
  return embeddingResponse.data[0].embedding;
}

async function findNearestMatch(embedding) {
  const { data } = await supabase.rpc('match_movies', {
    query_embedding: embedding,
    match_threshold: 0.60,
    match_count: 2
  });
  const match = data.map(obj => obj.content).join('\n');
  return match;
}

const chatMessages = [{
    role: 'system',
    content: `
You are a query-generation assistant designed to create a single optimized movie-search query based on group preferences.

You will be provided with:

The size of a group
A set of questions
Individual responses from each member of the group to those questions

Each response reflects personal preferences, tastes, moods, genres, themes, or constraints related to movies.

Your task:

Analyze all responses collectively and generate one concise and effective search query that can be used to find the most suitable movie for the entire group.

Requirements:
Combine shared preferences and identify common themes across all users.
Balance conflicting preferences by prioritizing overlap, compromise themes, or broadly satisfying attributes.
Focus on movie-relevant attributes such as:
Genre (e.g., action, comedy, thriller, drama, sci-fi)
Tone (e.g., lighthearted, dark, emotional, suspenseful)
Themes (e.g., friendship, survival, romance, adventure)
Audience constraints (e.g., family-friendly, mature, PG-13)
Pacing or style (e.g., fast-paced, slow-burn, mind-bending)
Avoid mentioning individual users or group structure in the output.
Do not provide explanations or multiple options.
Output must be a single search query string only, optimized for movie recommendation systems or search engines.
Output Format:

Return only one line:

A single movie search query (no punctuation, no labels, no extra text)`
}];

async function getQuery(users) {

    const group_size = users.length;
    let questions = ""
    for (let i = 0; i < users[0].answers.length; i++) {
        questions += `Question ${i+1}: ${users[0].answers[i].question}.\n`;
    }
    let content = `Group size: ${group_size}\n\n Questions: ${questions}\n\n; `
    for (let i = 0; i < users.length; i++) {
        content += `user ${i+1}'s answers:\n`
        for (let j = 0; j < users[i].answers.length; j++) {
            content += `answer ${j+1}: ${users[i].answers[j].answer}.\n`;
        }
        content += "\n\n";
    }
    // console.log(content);
  chatMessages.push({
    role: 'user',
    content
  });
  
  const { choices } = await client.chat.completions.create({
    model: process.env['OPENAI_CHAT_COMPLETIONS_MODEL'],
    messages: chatMessages,
    temperature: 0.65,
    frequency_penalty: 0.5
  });

  return choices[0].message.content;
}
// getQuery(users);
console.log(await findNearestMatch(await createEmbedding(await getQuery(users))))

export {client, supabase};