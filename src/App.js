import logo from "./logo.svg";
import "./App.css";
import firebase from "firebase/compat/app";
import { firebaseConfig } from "./firebaseConfig.js"; // Ensure this path is correct
import React, { useEffect, useState } from "react";
import { getDatabase, ref, child, push, update, set } from "firebase/database";
import styled from "styled-components";
import secrets from "./secrets.json";

const Input = styled.input`
  padding: 10px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Dropdown = styled.select`
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
`;

function App() {
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [selectedKey, setSelectedKey] = useState("key1");
  const [encryptedData, setEncryptedData] = useState("");

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };
  const handleDropdownChange = (event) => {
    setSelectedKey(event.target.value);
  };
  const db = getDatabase();

  const handleSubmit = () => {
    console.log("Submitting", inputText);

    async function fetchData() {
      const postData = {
        apiKey: inputText,
      };
      const queryString = new URLSearchParams(postData).toString();
      try {
        const response = await fetch(`/encrypt?${queryString}`, {
          method: "GET",
        });
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData().then((encryptedData) => {
      console.log(encryptedData);
      const userRef = ref(db, `users/${username}`);

      const data = {
        [selectedKey]: encryptedData.encryptedData,
      };

      update(userRef, data);

      setInputText("");
    });
  };

  return (
    <div>
      <header className="App-header">
        <a>enter username</a>
        <Input
          type="text"
          style={{ marginTop: "20px" }}
          value={username}
          onChange={handleUsernameChange}
          placeholder="Enter your username"
        />
        <a style={{ marginTop: "20px" }}>enter api key info</a>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            marginBottom: "10px",
          }}
        >
          <br />

          <Dropdown value={selectedKey} onChange={handleDropdownChange}>
            <option value="GPT4">GPT4</option>
            <option value="GPT35">GPT3.5</option>
            <option value="Claude">Claude</option>
            <option value="Groq">Groq</option>
          </Dropdown>
          <Input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter API key"
          />
          <Button onClick={handleSubmit}>Submit</Button>
        </div>
      </header>
    </div>
  );
}

export default App;
