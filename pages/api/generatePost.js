// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {Configuration, OpenAIApi} from "openai";

export default async function handler(req, res) {
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(config);

    const {topic, keywords} = req.body;

    // const topic = "Top 10 tips for dog owners";
    // const keywords = "dog, tips, training, food, health, exercise, grooming, vet, socialization, love";

    // very slow
    // const response = await openai.createCompletion({
    //     model: "text-davinci-003",
    //     temperature: 0,
    //     max_tokens: 3600,
    //     prompt: `Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. The response must also include appropriate HTML title and meta description contents. The return format must be stringified JSON in the following format:{
    //         "postContent": post content here,
    //         "title": title here,
    //         "metaDescription": meta description here
    //     }.`
    // });

    const postContentResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [{
            role: "system",
            content: "You are a blog post generator.",
        },
        {
            role:"user",
            content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
        }]
    })

    const postContent = postContentResponse.data.choices[0]?.message?.content || "";

    const titleResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [{
            role: "system",
            content: "You are a blog post generator.",
        },
        {
            role:"user",
            content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
        },{
            role: "assistant",
            content: postContent,
        },{
            role: "user",
            content: "Generate an appropriate title tag text for the above blog post."
        }]
    })

    const metaDescriptionResponse = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        temperature: 0,
        messages: [{
            role: "system",
            content: "You are a blog post generator.",
        },
            {
                role:"user",
                content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
            },{
                role: "assistant",
                content: postContent,
            },{
                role: "user",
                content: "Generate SEO-friendly meta description text for the above blog post."
            }]
    })

    const title = titleResponse.data.choices[0]?.message?.content || "";
    const metaDescription = metaDescriptionResponse.data.choices[0]?.message?.content || "";

    console.log('PostContent:', postContent);
    console.log('Title:', title);
    console.log('MetaDescription:', metaDescription);
    //console.log('Response', response?.choices);

    res.status(200).json({
        post: {
            postContent,
            title,
            metaDescription
        }
    })
}
