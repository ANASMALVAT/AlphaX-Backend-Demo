
const {userPremiumModel} = require("../models/premium-user")

const stripe = require('stripe')(process.env.STRIPE_ACCESS_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports.stripeWebhook = async (req,res) => {

      try {
        let eventType;
        let event;
        let signature = req.headers["stripe-signature"];

        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      
        data = event.data;
        eventType = event.type;

        switch (eventType) {

          case 'checkout.session.completed':
            const userPremiumData = {
                 user_id: event.data.object.metadata.user_id,
                 customer_email : event.data.object.customer_details.email,
                 customer_name : event.data.object.customer_details.name,
                 stripeID : event.data.object.id,
                 createdAt : event.data.object.created,
                 customerID : event.data.object.customer,
                 expires_at : event.data.object.expires_at,
                 subscriptionID:event.data.object.subscription
            }
            await userPremiumModel(userPremiumData);
            break;
          case 'invoice.paid':
            break;
          case 'invoice.payment_failed':
            break;
          default:
        }
        res.sendStatus(200);
    }
    catch (err) {
      return res.sendStatus(200);
    }
}