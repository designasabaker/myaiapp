// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {Configuration, OpenAIApi} from "openai";

export default async function handler(req, res) {
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(config);

    // very slow
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 3600,
        prompt: "Generate a post about owning dogs",
    });

    console.log('Response', response);

    res.status(200).json({ post: response.data.choices })
}
