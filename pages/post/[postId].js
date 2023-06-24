import {getSession, withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../../components";
import {ObjectId} from "mongodb";
import clientPromise from "../../lib/mongodb";
import { FontAwesomeIcon}   from "@fortawesome/react-fontawesome";
import {faHashtag} from "@fortawesome/free-solid-svg-icons";
import getAppProps from "../../utils/getAppProps";
import { motion } from "framer-motion"
import animatedDiv from "../../components/StyledComponents/animatedDiv";

export default function Post(props) {
    console.log('(Client Side [postId].js) Props:', props);

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
                postContent: post.postContent,
                keywords: post.keywords,
                topic: post.topic,
                title: post.title,
                metaDescription: post.metaDescription,
                ...props,
            }
        }
    }
})