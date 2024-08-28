const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const crypto = require("crypto");
const {verifyPremium} = require("../middlewares/verifyPremiumUser")

const generateId = () => {
  const genRanHex = crypto.randomBytes(20).toString("hex");
  return genRanHex;
}

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function userReviewModel(req,res) {

  try {
  const user_id = req.user_id;

  const verifyMembership = await verifyPremium(user_id);

  if(!verifyMembership.verification || verifyMembership.verification && verifyMembership.subscriptionStatus === 'NOT PREMIUM MEMBER'){
    return res.status(401).send({succcess:false, message:"unauthorized!"});
  }

  const review_id = generateId();
  const email = req.body.user_email;
  const linkedin = req.body.user_linkedin;
  const position = req.body.user_position;
  const company = req.body.user_company;
  const review = req.body.user_review

    const params = {
      TableName: "user-reviews",
      Item: marshall({
        review_id: review_id,
        email:email,
        linkedin:linkedin,
        company:company,
        review:review,
        position:position,
      }),
    };

    const command = new PutItemCommand(params);
    await client.send(command);
    return res.status(200).json({succcess:true , message:"Review Submitted Successful"});
    } catch (err) {   
      return res.status(500).json({succcess:false , message:"Error Submitting Review"})
    }
}

module.exports = {
    userReviewModel
};
