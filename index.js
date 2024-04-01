// const { GoogleGenerativeAI } = require("@google/generative-ai");
import { GoogleGenerativeAI } from "@google/generative-ai";
import express from "express";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

let history_array = [
    {
        role: "user",
        parts: [{ text: process.env.INITIAL_CHAT_INSTRUCTIONS }],
    },
    {
        role: "model",
        parts: [{ text: "Okay" }],
    }
];

app.get("/", (req,res) => {
    res.render("index.ejs", { topic: process.env.TOPIC });
});

app.post("/", async (req, res) => {
    console.log(req.body.customerQuestion);
    try {
      // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
    const chat = model.startChat({
      history: history_array,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });
  
    // const msg = "hello, how much is the course?";
    const msg = req.body.customerQuestion;
  
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const answer = response.text();
    const questionObject = {
        role: "user",
        parts: [{ text: msg }],
    }
    const answerObject = {
        role: "model",
        parts: [{ text: answer }],
    }
    // history_array.push(questionObject);
    // history_array.push(answerObject);
    let frontend_chat_array = history_array.slice(2);
    // history_array.forEach(object => {
    //     console.log(object);
    // });
    frontend_chat_array.forEach(object => {
        console.log(object);
    });
    console.log(answer);
      res.render("index.ejs", { content: frontend_chat_array, topic: process.env.TOPIC });
    } catch (error) {
      res.render("index.ejs", { content: JSON.stringify(error.response.data) });
    }
  });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });