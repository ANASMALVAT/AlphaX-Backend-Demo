const express = require("express");
const app = express();
require('dotenv').config();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const cors = require('cors');

app.use(cors({ origin:process.env.CORS_ORIGIN ,withCredentials : true }));


const compileController = require('../controllers/codeCompileController');
const statusController = require('../controllers/codeStatusController');
const gptController = require('../controllers/alphaGptController');
const stripePayment = require("../controllers/user_payment/alphaPayment");
const  { fetchUserData } = require("../controllers/user_authentication/googleSSO");
const  { getGithubAccessToken,getGithubUserData } = require("../controllers/user_authentication/githubSSO");
const { getUserID } = require("../middlewares/getUserID");
const { stripeWebhook } = require("../middlewares/stripe-web-hook");
const { generateAccessToken } = require("../middlewares/generateToken");
const { verifyToken} = require("../middlewares/verifyToken");
const {userLoginModel, getUserData} = require("../models/user");
const {contactModel} = require("../models/user-contact");
const {userReviewModel} = require("../models/user-review")
const {questionListModel} = require("../models/question-list");
const {reviewListModel} = require("../models/reviews");
const {blogListModel} = require("../models/blog-list")
const {reviewHomeListModel} = require("../models/reviews-home");
const { fetchQuestionDetail } = require("../models/question-detail");
const { fetchQuestionSolution } = require("../models/question-solution");
const {fetchQuestionVisualize} = require("../models/question-visualize")
const {fetchDriverCode} = require("../models/driver-code");
const {checkPremiumQuestionDetail,getPremiumUserData,checkPremiumQuestionVisualize} = require("../models/user-premium");
const { putUserSubmission,getUserSubmission } = require("../models/user-submission");
const {setUserProblemComplete} =require("../models/user-completed-problems")
const {userGPTUsage} = require("../models/alpha-gpt-api-usage")

app.post("/purchase/stripe-webhook",express.raw({ type: 'application/json' }),stripeWebhook );

app.use(express.json());
app.use(bodyParser.raw({type: "*/*"}))
app.use(bodyParser.json());


app.get('/' ,async (req, res) => {res.status(200).send("X-backend")});

app.get('/status/:token' ,statusController.checkStatus);

app.get('/auth/google', async (req, res) => {
    try {
        const {access_token,id_token} = req.query;
        const googleUser = await fetchUserData(access_token, id_token);

        if (!googleUser || googleUser.error) {
            console.error("Error in fetching user data:", googleUser.error);
            return res.status(500).send("Error in fetching user data");
        }
        await userLoginModel(googleUser.id,googleUser.email,googleUser.given_name,googleUser.picture);

        const {clientJwt,csrfToken} = generateAccessToken(googleUser.id);

        res.cookie("jwt",clientJwt,{maxAge:7 * 24 * 60 * 60 * 1000});

        return res.send({csrfToken: csrfToken});

    } catch (error) {
        return res.status(500).send("Error during Google authentication");
    }
});

app.get('/auth/github', async (req, res) => {
  try {
      const {code} = req.query;

      const githubUserAccessToken = await getGithubAccessToken(code);

      const githubUser = await getGithubUserData(githubUserAccessToken.access_token);

      await userLoginModel(githubUser.id,githubUser.html_url,githubUser.name,githubUser.avatar_url);

      const {clientJwt,csrfToken} = generateAccessToken(githubUser.id);

      res.cookie("jwt",clientJwt,{maxAge:7 * 24 * 60 * 60 * 1000});


      return res.send({csrfToken: csrfToken});

  } catch (error) {
      return res.status(500).send("Error during Github authentication");
  }
});

app.get('/user/verify-token',verifyToken,async (req,res,next)=> 
{
    const alphaUserData = await getUserData(req,res,next);
    
    const userData = {
      user_name : alphaUserData.user_name,
      user_profile:alphaUserData.user_profile,
      user_completed_problems: alphaUserData.completed_problems || []
    }

    return res.status(200).send({csrfToken:res.csrfToken,userData : userData ,message: "Authorized succesfully"});
});

app.get('/user/verify-membership',getUserID,getPremiumUserData);

app.get('/failure',async(req,res) => { res.send('Some Error occured please login later!')} );

app.get('/user/logout',(req, res) => {
    res.status(200);
});

app.get('/login/credentials',(req,res) => {
  res.status(200).send({credentials: { google_id: process.env.GOOGLE_CLIENT_ID, github_id: process.env.GITHUB_CLIENT_ID }})
})

app.get('/problems', async (req, res) => {
  try {
    const problem_list = await questionListModel();
    res.json( problem_list );
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get("/reviews", async (req,res) => {
  try{
    const review_list = await reviewListModel();
    res.json(review_list);
  }catch(error) {
    res.status(500).json({ error: 'An error occurred' });
  }
})

app.get("/reviews/home", async (req,res) => {
  try{
    const review_list = await reviewHomeListModel();
    res.json(review_list);
  }catch(error) {
    res.status(500).json({ error: 'An error occurred' });
  }
})

app.get("/blogs", async (req,res) => {
  try{
    const blog_list = await blogListModel();
    res.json(blog_list);
  }catch(error) {
    res.status(500).json({ error: 'An error occurred' });
  }
})

app.get('/problems/authorize-user'  ,fetchQuestionDetail, fetchQuestionSolution, checkPremiumQuestionDetail);

app.get('/problems/submission'  ,getUserSubmission);

app.get('/problems/visualize', fetchQuestionVisualize, checkPremiumQuestionVisualize)

app.post('/problems/completion'  ,setUserProblemComplete);

app.post("/purchase-alpha" ,stripePayment.stripePayment);

app.post('/alpha-gpt', gptController.callGPT);

app.post('/compile' , fetchDriverCode ,compileController.compileCode);

app.post('/contact', contactModel);

app.post('/reviews/submit',userReviewModel)





module.exports = app;