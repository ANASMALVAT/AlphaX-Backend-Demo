const axios = require("axios");

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_ACCESS_KEY);

exports.stripePayment = async(req,res) =>  {
    try{
        const priceId = req.body.price_id;
        const session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:"subscription",
        line_items: [
            {
                price:priceId,
                quantity:1,
            }
            
        ],
        metadata:{
            user_id: req.user_id
        },
            success_url : process.env.PAYMENT_SUCCESS_URL,
            cancel_url: process.env.PAYMENT_CANCEL_URL,
        })
        res.send({url: session.url});
    }
    catch(err){
        res.status(400).json({ error: 'An error occurred' });;
    }
}