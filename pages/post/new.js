import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../../components";
import {useState} from "react";
import {useRouter} from "next/router";
import getAppProps from "../../utils/getAppProps";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBrain} from "@fortawesome/free-solid-svg-icons";

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
        try{
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
                router.push(`/post/${json.postId}`); // redirect to the newly created post
            }
        }catch (e) {
            console.error(e);
            setIsLoading(false);
        }

    }

    return (
        <div className={"h-full overflow-hidden"}>
            {isLoading && (
            <div className={"text-green-500 flex flex-col h-full animate-pulse justify-center items-center"}>
                <FontAwesomeIcon icon={faBrain} className={"text-8xl"} />
                <h6>Generating...</h6>
            </div>)}
            {!isLoading && (
            <div className={"w-full h-full flex flex-col overflow-auto"}>
            <form onSubmit={handleSubmit} className={"m-auto w-full max-w-screen-sm bg-slate-100 p-4 rounded-md shadow-xl border-slate-200"}>
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
                        maxLength={100}
                        onChange={e=>setKeywords(e.target.value)}/>
                    <small>
                        <p>Separate keywords with a comma</p>
                    </small>
                </div>
                <button
                    type={"submit"}
                    className={"btn"}
                    onSubmit={handleSubmit}
                    disabled={isLoading || !topic.trim() || !keywords.trim()}
                    style={{
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? '0.5' : '1',
                    }}
                >
                    {/* front end validation */}
                    {isLoading && 'Loading...'}
                    {(!topic.trim() || !keywords.trim()) && 'Enter a topic and keywords'}
                    {(topic.trim() && keywords.trim()) && 'Generate Post'}
                </button>
            </form>
            </div>)}
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

        // If the user has no tokens, redirect them to the dashboard
        if(!props.availableTokens){
            return {
                redirect: {
                    destination: "/token-topup",
                    permanent: false
                }
            }
        }

        return {props}
    }
})