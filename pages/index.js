import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import Message from "./message";

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState();
  const[messages, setMessages] = useState([]);

  function createMessageObject(text, isOwn, author) {
    return {
      text,
      isOwn,
      author,
    };
  }

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userMessage: userInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log(data);
      setResult(data.result);
      setMessages([...messages, createMessageObject(userInput, true, "You"), createMessageObject(data.result, false, "Story")]);
      setUserInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onClear(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Clear Request failed with status ${response.status}`);
      }
      alert('Message log cleared');
        setMessages([]);
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>Story Chat</title>
      </Head>

      <main className={styles.main}>
        
        <h3>Come on an adventure</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="userMessage"
            placeholder="forge your path"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
      <button onClick={onClear}>Clear</button>
        <div className={styles.messages}>
          {messages.map((message, index) => (
            <Message key={index} text={message.text} isOwn={message.isOwn} author={message.author} />
          ))}
        </div>
      </main>
    </div>
  );
}
