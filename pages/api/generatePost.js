// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {Configuration, OpenAIApi} from "openai";
import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired( async function handler(req, res) {
    const {user} = await getSession(req, res);
    const client = await clientPromise;
    const db = await client.db("BlogStandard");
    const userProfile = await db.collection("users").findOne({
        auth0Id: user.sub,
    });

    if(!userProfile?.availableTokens){
        // no tokens
        res.status(403);
        return;
    }

    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const openai = new OpenAIApi(config);

    const {topic, keywords} = req.body;

    if(!topic || !keywords){
        res.status(422); // unprocessable entity, data is invalid
        return;
    }

    if(topic.length > 100 || keywords.length > 100){
        res.status(422); // unprocessable entity, data is invalid
        return;
    }

    // const topic = "Top 10 tips for dog owners";
    // const keywords = "dog, tips, training, food, health, exercise, grooming, vet, socialization, love";

    // very slow
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        temperature: 0,
        max_tokens: 3600,
        prompt: `Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. The response must also include appropriate HTML title and meta description contents. The return format must be stringified JSON in the following format:{
            "postContent": post content here,
            "title": title here,
            "metaDescription": meta description here
        }.`
    });

    // new gpt-3.5-turbo
    // const postContentResponse = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     temperature: 0,
    //     messages: [{
    //         role: "system",
    //         content: "You are a blog post generator.",
    //     },
    //     {
    //         role:"user",
    //         content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
    //     }]
    // })
    //
    // const postContent = postContentResponse.data.choices[0]?.message?.content || "";
    //
    // const titleResponse = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     temperature: 0,
    //     messages: [{
    //         role: "system",
    //         content: "You are a blog post generator.",
    //     },
    //     {
    //         role:"user",
    //         content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
    //     },{
    //         role: "assistant",
    //         content: postContent,
    //     },{
    //         role: "user",
    //         content: "Generate an appropriate title tag text for the above blog post."
    //     }]
    // })
    //
    // const metaDescriptionResponse = await openai.createChatCompletion({
    //     model: "gpt-3.5-turbo",
    //     temperature: 0,
    //     messages: [{
    //         role: "system",
    //         content: "You are a blog post generator.",
    //     },
    //         {
    //             role:"user",
    //             content:`Generate a post about ${topic}, using the following keywords: ${keywords}. The content should be formatted in SEO-friendly HTML. limited to the following HTML tags:p, h1, h2, h3, h4, h5, li, ol, strong, ul, i.`
    //         },{
    //             role: "assistant",
    //             content: postContent,
    //         },{
    //             role: "user",
    //             content: "Generate SEO-friendly meta description text for the above blog post."
    //         }]
    // })
    //
    // const title = titleResponse.data.choices[0]?.message?.content || "";
    // const metaDescription = metaDescriptionResponse.data.choices[0]?.message?.content || "";
    //
    // console.log('PostContent:', postContent);
    // console.log('Title:', title);
    // console.log('MetaDescription:', metaDescription);
    //console.log('Response', response?.choices);

    await db.collection("users").updateOne(
        {auth0Id: user.sub},
        {$inc:{availableTokens: -1}},
        {upsert: true});

    const parsed = JSON.parse(response.data.choices[0].text.split('\n').join(''));

    const post = await db.collection("posts").insertOne({
        postContent: parsed?.postContent,
        title: parsed?.title,
        metaDescription: parsed?.metaDescription,
        topic,
        keywords,
        userId: userProfile._id,
        createdAt: new Date(),
    });

    console.log("(Back-end) Post:", post);
    // Post: {
    //   acknowledged: true,
    //   insertedId: new ObjectId("6494c5ae67e431bc1bb0a8f9")
    // }

    res.status(200).json({
        postId: post.insertedId,
    })
})
