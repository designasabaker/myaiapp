import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../../components";
import {useState} from "react";
import {useRouter} from "next/router";
import getAppProps from "../../utils/getAppProps";

export default function NewPost(props) {
    const router = useRouter();
    // console.log(props);
    // const [postContent, setPostContent] = useState("");
    const [topic, setTopic] = useState("");
    const [keywords, setKeywords] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) =>{
        setIsLoading(true);
        e.preventDefault();
        const res = await fetch(`/api/generatePost`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                topic,
                keywords
            })
        });
        const json = await res.json();
        console.log('(Client Side)Result:',json);
        setIsLoading(false);
        // setPostContent(json.post.postContent);
        if(json?.postId){
            router.push(`/post/${json.postId}`);
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <lable>
                        <strong>Generate a blog post on the topic of</strong>
                    </lable>
                    <textarea
                        className={"resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-md"}
                        value={topic}
                        onChange={e=>setTopic(e.target.value)} />
                </div>
                <div>
                    <lable>
                        <strong>Targeting the following keywords:</strong>
                    </lable>
                    <textarea
                        className={"resize-none border border-slate-500 w-full block my-2 px-4 py-2 rounded-md"}
                        value={keywords}
                        onChange={e=>setKeywords(e.target.value)}/>
                </div>
                <button
                    type={"submit"}
                    className={"btn"}
                    onSubmit={handleSubmit}
                    disabled={isLoading}
                    style={{
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? '0.5' : '1'
                    }}
                >
                    {isLoading ? 'Loading...' : 'Generate Post'}
                </button>
            </form>
            {/*<div className={"max-w-screen-sm p-10"}*/}
            {/*    dangerouslySetInnerHTML={{__html: postContent}} />*/}
        </div>);
}

// This is the function that will be called to get the layout for the page
NewPost.getLayout = function getLayout(page, pageProps) {
    return(
        <AppLayout {...pageProps}>
            {page}
        </AppLayout>
    )
}

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (ctx) => {
        const props = await getAppProps(ctx);
        return {props}
    }
})