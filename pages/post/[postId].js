import React, {useContext, useState} from "react";
import {getSession, withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../../components";
import {ObjectId} from "mongodb";
import clientPromise from "../../lib/mongodb";
import { FontAwesomeIcon}   from "@fortawesome/react-fontawesome";
import {faHashtag} from "@fortawesome/free-solid-svg-icons";
import getAppProps from "../../utils/getAppProps";
import { motion } from "framer-motion"
import animatedDiv from "../../components/StyledComponents/animatedDiv";
import {useRouter} from "next/router";
import postsContext from "../../context/postsContext";

export default function Post(props) {
    const router = useRouter();
    console.log('(Client Side [postId].js) Props:', props);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const {deletePost} = useContext(postsContext);

    const handleDeleteConfirm = async () => {
        try{
            const res = await fetch("/api/deletePost", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({postId: props.id}),
            });
            const data = await res.json();
            if(data.success){
                deletePost(props.id);
                router.replace("/post/new");
            }
        }catch(e){
            console.error(e);
        }
    }

    return (
        <animatedDiv
            // initial={{ opacity: 0 }}
            // animate={{ opacity: 1, delay: 1 }}
            // transition={{
            //     ease: 'easeInOut',
            //     duration: 0.7,
            //     delay: 0.15,
            // }}
            className={"overflow-auto h-full"}>
            <div className={"max-w-screen-sm mx-auto px-2"}>
                <div className={"text-sm font-bold mt-6 py-2 bg-stone-200 rounded-sm"}>
                    SEO Title and Meta Description
                </div>
                <div className={"p-4 my-2 border border-stone-200 rounded-md"}>
                    <animatedDiv className={"text-blue-600 text-2xl font-bold"}>
                        {props.title}
                    </animatedDiv>
                    <div className={"mt-2"}>
                        {props.metaDescription}
                    </div>
                </div>
                <div className={"text-sm font-bold mt-6 py-2 bg-stone-200 rounded-sm"}>
                    Keywords
                </div>
                <div className={"flex flex-wrap pt-2 gap-1"}>
                    {props.keywords.split(',').map((keyword, index)=>{
                        return (<div key={index} className={"bg-slate-800 rounded-full px-3 py-2 text-white"}>
                            <FontAwesomeIcon icon={faHashtag} />{keyword}
                        </div>)})}
                </div>
                <div className={"text-sm font-bold mt-6 py-2 bg-stone-200 rounded-sm"}>
                    Blog Post
                </div>
                <div dangerouslySetInnerHTML={{__html: props.postContent}} />
                <div className={"my-4"}>
                    {!showDeleteConfirmation &&
                    <button
                        className={"btn bg-red-600 hover:bg-red-700"}
                        onClick={()=> setShowDeleteConfirmation(true)}>
                        Delete Post
                    </button>}
                    {showDeleteConfirmation &&
                    <div>
                        <p className={"p-2 bg-red-300 text-center"}>Are you sure to delete this post?</p>
                        <div className={"grid grid-cols-2 gap-2"}>
                            <button
                                onClick={()=> setShowDeleteConfirmation(false)}
                                className={"btn bg-stone-600 hover:bg-stone-700"}>Cancel</button>
                            <button
                                onClick={handleDeleteConfirm}
                                className={"btn bg-red-600 hover:bg-red-700"}>Delete</button>
                        </div>
                    </div>}
                </div>
            </div>
        </animatedDiv>);
}

Post.getLayout = function getLayout(page, pageProps) {
    return(
        <AppLayout {...pageProps}>
            {page}
        </AppLayout>
    )
}

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (ctx) => {
        const props = await getAppProps(ctx);
        const userSession = await getSession(ctx.req, ctx.res);
        const client = await clientPromise;
        const db = await client.db("BlogStandard");
        const user = await db.collection("users").findOne({auth0Id: userSession.user.sub});
        const post = await db.collection("posts").findOne({
            _id: new ObjectId(ctx.params.postId),
            userId: user._id
        });

        if (!post) {
            return {
                redirect: {
                    destination: '/post/new',
                    permanent: false
                }
            }
        }

        return {
            props: {
                id: ctx.params.postId,
                postContent: post.postContent,
                keywords: post.keywords,
                topic: post.topic,
                title: post.title,
                metaDescription: post.metaDescription,
                postCreated: post.createdAt.toString(),
                ...props,
            }
        }
    }
})