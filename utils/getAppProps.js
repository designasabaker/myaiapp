import {getSession} from "@auth0/nextjs-auth0";
import clientPromise from "../lib/mongodb";

export const getAppProps = async (ctx) => {
    const userSession = await getSession(ctx.req, ctx.res);
    const client = await clientPromise;
    const db = client.db("BlogStandard");
    const user = await db.collection("users").findOne({
        auth0Id: userSession.user.sub
    });

    if(!user){
        return{
            availableTokens: 0,
            posts:[],
        }
    }

    // user
    const posts = await db.collection("posts")
        .find({userId: user._id}).limit(5)
        .sort({createdAt: -1})
        .toArray();

    return {
        availableTokens: user.availableTokens,
        posts: posts.map((post)=>{
            const {_id, userId, createdAt, ...rest} = post;
            return {
                _id: post._id.toString(),
                createdAt: createdAt.toString(),
                ...rest
            }
        }),
        currentPostId: ctx.params?.postId || null,
    }
}

export default getAppProps;