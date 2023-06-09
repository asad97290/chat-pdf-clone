import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [messageData, setMessageData] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [welcome, setWelcome] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, isLoading] = useState(false);
  const [loadingWelcome, isLoadingWelcome] = useState(false);
  const { state } = useLocation();
  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (event) => {
    setPrompt(event.target.value);
  };
  useEffect(() => {
    async function fetchData() {
      try{
      console.log("welcome--->", state[1].content);
      setWelcome(state[1].content);
      isLoadingWelcome(true);
      const { data } = await axios.post(
        "https://chat-gpt-clone-seven-coral.vercel.app/api/chat",
        {
          messages: [
            ...state,
            {
              role: "user",
              content: "list down some questions regarding this text",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      isLoadingWelcome(false);
      console.log("Questions-->", data.response[0].message.content);
      setMessages([
        ...state,
        {
          role: "user",
          content: "list down some questions regarding this text",
        },
        data.response[0].message,
      ]);

      let questionsArr = data.response[0].message.content
        .split(/\d+\./)
        .filter(Boolean);

      setQuestions(questionsArr);
    }catch(e) {
      isLoading(false)
      setErrorMessage(e.message);
      console.error(e);
    }
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  const handleFormSubmit = async (event) => {
    isLoading(true);
    event.preventDefault();
    if (prompt.trim().length === 0) {
      alert("please fill the input before submitting");
      return;
    }

    let messagesArr = [...messages, { role: "user", content: prompt }];

    try {
      const { data } = await axios.post(
        "https://chat-gpt-clone-seven-coral.vercel.app/api/chat",
        { messages: messagesArr },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      isLoading(false);
      setMessages([
        ...messages,
        { role: "user", content: prompt },
        data.response[0].message,
      ]);
      setMessageData([
        ...messageData,
        { role: "user", content: prompt },
        data.response[0].message,
      ]);
    } catch (error) {
      isLoading(false)
      console.error(error);
    }
  };
  return (
    <>
      <div>{welcome}</div>
      <h1>you can ask for example</h1>
      {!loadingWelcome ? (
        questions.map((item,key) => <div key={key}>➤{item}</div>)
      ) : (
        <h3>Thinking...</h3>
      )}
      {errorMessage}
      <ul className="feed">
        {messageData.map((item, key) => (
          <li key={key}>
            <p className="role">{item.role}</p>
            <p>{item.content}</p>
          </li>
        ))}
      </ul>
      {!loading ? (
        <form onSubmit={handleFormSubmit}>
          <input
            placeholder="Send a message"
            onChange={handleChange}
            id="input"
          />
          <button type="submit">➤</button>
        </form>
      ) : (
        <h3>Thinking...</h3>
      )}
    </>
  );
}

export default Chat;
