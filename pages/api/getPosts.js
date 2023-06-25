import {getSession, withApiAuthRequired} from "@auth0/nextjs-auth0";
import clientPromise from "../../lib/mongodb";

export default withApiAuthRequired( async function handler(req, res) {
    try{
        const {user: {sub}} = await getSession(req, res);
        const client = await clientPromise;
        const db = await client.db("BlogStandard");
        const userProfile = await db.collection("users").findOne({
            auth0Id: sub,
        });

        const {lastPostDate, getNewerPost} = req.body; // lastPostDate

        const posts = await db
            .collection("posts")
            .find({
                userId: userProfile._id,
                createdAt: {[getNewerPost ? '$gt' : '$lt']: new Date(lastPostDate)},})
            .limit(getNewerPost ? 0 : 5)
            .sort({createdAt: -1})
            .toArray();

        res.status(200).json({posts});
    }catch (error){
        console.error(error);
        res.status(500).json({error: "Something went wrong"});
    }
});