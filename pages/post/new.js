import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../../components";

export default function NewPost(props) {
    console.log(props);
    const handleClick = async () =>{
        const res = await fetch(`/api/generatePost`,{
            method: "POST",
        });
        const json = await res.json();
        console.log('Result:',json);
    }

    return (
        <div>
            <h1>Post Playground</h1>
            <button className={"btn"} onClick={handleClick}>
                Generate Post
            </button>
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

export const getServerSideProps = withPageAuthRequired(()=>{
    return {
        props: {

        }
    }
})