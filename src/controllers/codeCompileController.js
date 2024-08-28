const statusController = require('./codeStatusController');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

exports.compileCode = async (req, res, next) => {
  
  try {
    
      const { language_id, source_code, isRunning, custom_testcase,problemId } = req.body;
      const code_language = language_id.value;
      const all_driver_code = req.driver_code[code_language];
      const driver_run_code = all_driver_code['driver_run_code'];
      const driver_run_solution = all_driver_code['driver_run_solution'];
      const driver_code = all_driver_code['driver_code'];
      const user_code = source_code;
      let compileCode;

      if(isRunning === true){
          if(code_language === 'java'){
            compileCode = eval('`' + driver_run_code + '`');
          }else{
            const runCode = eval('`' + driver_run_code + '`');
            compileCode = user_code + driver_run_solution + runCode;
          }
      }
   
      else{
          if(code_language === 'java'){
            compileCode = eval('`' + driver_code + '`');
          }
          else{
            const indentDriverCode = eval('`' + driver_code + '`');
            compileCode = user_code + indentDriverCode;
          }
      }
      const requestData = {
        language_id: language_id.id,
        source_code: btoa(compileCode),
      };
      const requestConfig = 
        {
          method: 'POST',
          url: process.env.JUDGE0_URL,
          params: { base64_encoded: true, fields: '*' },
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-User': "a1133bc6-a0f6-46bf-a2d8-6157418c6fe2",
            Accept: 'application/json',
            
          },
          data: requestData
        };

        const requestConfigFreeTier = {
          method: "POST",
          url: "https://judge0-ce.p.rapidapi.com/submissions",
          params: { base64_encoded: "true", fields: "*" },
          headers: {
            "content-type": "application/json",
            "Content-Type": "application/json",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "X-RapidAPI-Key": "8c8d256b22msh598286017050bd0p1f830ejsn57bfa2f2f987",
          },
          data:requestData
        }

        const response = await axios.request(requestConfigFreeTier);
        await new Promise(resolve => setTimeout(resolve, 1000));
        let attemptCount = 0; let statusResponse;

        while (attemptCount < 3) {
          statusResponse = await statusController.checkStatus(response.data.token);
          if (statusResponse.status?.id === 1 || statusResponse.status?.id === 2) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            attemptCount++;
          } else {
            res.status(200).json({code_output: statusResponse});
            break;
          }
        }
        if (attemptCount === 3) {
          res.status(408).send("Request Timeout!");
        }
        
        if(!isRunning){
          next();
        }
  }
  catch (error) {
      res.status(500).json({ error: 'An error occurred while compiling the code,we are fixing the Issue!' });
  }
};
