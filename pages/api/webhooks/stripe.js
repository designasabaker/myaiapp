import Cors from 'micro-cors'
import stripeInit from 'stripe'
import verifyStripe from '@webdeveducation/next-verify-stripe'
import clientPromise from "../../../lib/mongodb";
import {getSession} from "@auth0/nextjs-auth0";

const cors = Cors({
    allowMethods: ['POST', 'HEAD'],
})

export const config = {
    api: {
        bodyParser: false,
    }
}

const stripe = stripeInit(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handler = async (req, res) => {
    console.log("run stripe.js");
    if(req.method === "POST"){
        let event;
        try{
         event = await verifyStripe({
            req,
            stripe,
            endpointSecret,
        })}catch(e){
            console.log(e);
            // return res.status(400).send(`Webhook Error: ${e.message}`);
        }

        console.log("Received Stripe event:", event.type);
        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log('payment_intent.succeeded');
                alert('payment_intent.succeeded');
                // const {user} = await getSession(req, res);
                const client = await clientPromise;
                const db = await client.db("BlogStandard");

                const paymentIntent = event.data.object;
                const auth0Id = paymentIntent.metadata.sub;

                const updateResult = await db.collection("users").updateOne(
                    {
                        auth0Id,
                    },
                    {
                        $inc: { availableTokens: 10 },
                        $setOnInsert: { auth0Id },
                    },
                    {
                        upsert: true
                    })
                console.log('update result',updateResult);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
                return res.status(400).send(`Webhook Error: ${e.message}`);
        }
        res.status(200).json({received: true});
    }
}

export default cors(handler);