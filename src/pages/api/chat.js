import { Configuration, OpenAIApi } from "openai";
export default async function handler(req, res) {
  const messages = req.body.messages;

  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });

    const openai = new OpenAIApi(configuration);

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,

      max_tokens: 1000,
    });

    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      let formattedContent = response.data.choices[0].message.content.replace(
        /\n/g,
        "<br/>"
      );
      res.status(200).json({ text: formattedContent });
    } else {
      console.log("Invalid response from OpenAI API");

      res.status(500).json({ error: "Invalid response from OpenAI API" });
    }
  } catch (error) {
    if (error.response) {
      console.error("Error message:", error.response.data.error);
    } else {
      console.error("Error message:", error.message);
    }
    res.status(500).json({ error: error.toString() });
  }
}
