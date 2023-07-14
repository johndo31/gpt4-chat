// Home.js
import React, { useState } from "react";
import Layout from "../components/Layout";
import { TextField, Button, CircularProgress, Box } from "@mui/material";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "Assistant", content: "I'm farmchat, how can I help you?" },
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const preselectedQuestions = [
    "Name the top 5 farm management applications, how do they compare?",
    "Is it better for me to plant corn or build photovoltaic on my acre?",
  ];

  const handleNewMessageChange = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async (message) => {
    setLoading(true);
    setMessages([...messages, { sender: "User", content: message }]);

    try {
      // Get the last three messages including the current message
      let lastThreeMessages = messages.slice(Math.max(messages.length - 2, 0));
      lastThreeMessages.push({ sender: "User", content: message });

      // Convert the messages to the format required by the OpenAI API
      let openaiMessages = lastThreeMessages.map((msg) => {
        return { role: msg.sender.toLowerCase(), content: msg.content };
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: openaiMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Assistant", content: data.text },
      ]);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "Assistant", content: "Error occurred. Please try again." },
      ]);
    }

    setLoading(false);
    setNewMessage("");
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage(newMessage);
    }
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.sender === "User"
                  ? styles.userMessage
                  : styles.botMessage
              }`}
            >
              <strong>{message.sender}</strong>

              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
          ))}

          {loading && <CircularProgress className={styles.circularProgress} />}
        </div>
        <Box sx={{ width: "100%", maxWidth: 600, mt: 2 }}>
          {preselectedQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outlined"
              fullWidth
              sx={{ mb: 1 }}
              onClick={() => handleSendMessage(question)}
            >
              {index + 1}. {question}
            </Button>
          ))}
        </Box>
        <div className={styles.inputContainer}>
          <TextField
            variant="outlined"
            placeholder="Type your message..."
            value={newMessage}
            onChange={handleNewMessageChange}
            onKeyPress={handleKeyPress}
            fullWidth
            style={{ marginRight: "1rem" }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleSendMessage(newMessage)}
          >
            Send
          </Button>
        </div>
      </div>
    </Layout>
  );
}
