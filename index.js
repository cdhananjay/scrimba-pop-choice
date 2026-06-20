import { createClient } from "@supabase/supabase-js";
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
  baseURL: process.env['OPENAI_BASE_URL'],
  dangerouslyAllowBrowser: true,
});

const supabase = createClient(process.env['SUPABASE_URL'], process.env['SUPABASE_API_KEY']);

export {client, supabase};