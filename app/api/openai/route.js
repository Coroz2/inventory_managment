import OpenAI from "openai";
import { streamText } from 'ai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req) {
    try {
        // Log the request method and headers
        console.log('Request Method:', req.method);
        console.log('Request Headers:', req.headers);

        // Parse the request body
        const { messages } = await req.json();
        console.log('Received messages:', messages);

        // Create a completion request to OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",  // Changed model name
            messages: [
                { role: "user", content: "You are a good friend" },
                ...messages,
            ],
            stream: true,
            temperature: 1,
        });

        // Log the response from OpenAI
        console.log('OpenAI Response:', response);

        // Return the response as a stream
        return streamText.toDataStreamResponse(response);
    } catch (error) {
        // Log any errors that occur
        console.error('Error in API route:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
