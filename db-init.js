import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { client } from "./index.js"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const supabase = createClient(process.env['SUPABASE_URL'], process.env['SUPABASE_SERVICE_KEY']);

async function splitDocument(filePath) {
  const text = readFileSync(filePath, "utf-8");
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 50,
  });
  return await splitter.createDocuments([text]);
}

async function createAndStoreEmbeddings() {
  const chunkData = await splitDocument("movies.txt");
  const data = await Promise.all(
    chunkData.map(async (chunk) => {
      const embeddingResponse = await client.embeddings.create({
        model: process.env['OPENAI_EMBEDDINGS_MODEL'],
        input: chunk.pageContent
      });
      return { 
        content: chunk.pageContent, 
        embedding: embeddingResponse.data[0].embedding 
      }
    })
  );
  const {error} = await supabase.from('movies').insert(data);
  console.log(data);
  if (error) console.log( "ERROR OCCURED WHILE INSERTING TO DB:\n" ,error);
}
createAndStoreEmbeddings();
