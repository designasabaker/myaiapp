import {withPageAuthRequired} from "@auth0/nextjs-auth0";
import {AppLayout} from "../components";
import getAppProps from "../utils/getAppProps";

export default function TokenTopup() {
    const handleClick = async (e) =>{
        e.preventDefault();
        // addTokens w/ Stripe Checkout
        const res = await fetch(`/api/addTokens`,{
            method: "POST",
        });
        const json = await res.json();
        console.log('Result:',json);
        window.location.href = json.session.url; // redirect to Stripe Checkout
    };

    return (
        <div>
            <h1>OpenAI TokenTopup</h1>
            <button className={"btn"} onClick={handleClick}>Add tokens</button>
        </div>);
}

TokenTopup.getLayout = function getLayout(page, pageProps) {
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