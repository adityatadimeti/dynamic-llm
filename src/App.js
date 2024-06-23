import logo from "./logo.svg";
import "./App.css";
import firebase from "firebase/compat/app";
import { firebaseConfig } from "./firebaseConfig.js"; // Ensure this path is correct
import React, { useEffect, useState } from "react";
import {
  getDatabase,
  ref,
  child,
  push,
  update,
  get,
  set,
} from "firebase/database";
import styled from "styled-components";

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
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState("");
  const [selectedKey, setSelectedKey] = useState("GPT4");
  const [genModel, setGenModel] = useState("");
  const [genModelOptions, setGenModelOptions] = useState([]);
  const [encryptedData, setEncryptedData] = useState("");
  const [userData, setUserData] = useState({});

  // if the user exists, set the genmodel options to the keys in the user data
  useEffect(() => {
    if (Object.keys(userData).length > 0) {
      setGenModelOptions(Object.keys(userData));
    }
  }, [userData]);

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };
  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };
  const handleDropdownChange = (event) => {
    setSelectedKey(event.target.value);

    console.log(event.target.value);
    if (userData[event.target.value]) {
      const encrypted = userData[event.target.value];
      //decrypt it
      decryptData(encrypted).then((decryptedData) => {
        setInputText(decryptedData.decryptedData);
      });
    }
  };

  const handleGenModelChange = (event) => {
    setGenModel(event.target.value);
  };
  const db = getDatabase();

  async function decryptData(data) {
    const postData = {
      data: data,
    };
    const queryString = new URLSearchParams(postData).toString();
    try {
      const response = await fetch(`/decrypt?${queryString}`, {
        method: "GET",
      });
      console.log(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  async function generateTextAPICall(model, prompt) {
    const postData = {
      model: model,
      prompt: prompt,
    };
    const queryString = new URLSearchParams(postData).toString();
    try {
      const response = await fetch(`/genText?${queryString}`, {
        method: "GET",
      });
      console.log(response);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error generating", error);
    }
  }

  const retrieveUser = () => {
    async function checkIfSubchildExists(subchildKey) {
      const dbRef = ref(db);
      const subchildRef = child(dbRef, `users/${subchildKey}`);

      try {
        const snapshot = await get(subchildRef);
        if (!snapshot.exists()) {
          alert(
            "You do not exist, you will get added to DB after submitting your first API key."
          );
        } else {
          //get all the keys in their child and store it as dictionary, because there data will be in format of
          //GPT4: encryptedData

          const data = snapshot.val();
          setUserData(data);
          alert("retrieved you");
        }
      } catch (error) {
        console.error("Error checking subchild existence:", error);
      }
    }

    checkIfSubchildExists(username);
  };

  const generateText = () => {
    //grab the chosen model
    //grab the prompt
    //run it through
    generateTextAPICall(genModel, prompt).then((output) => {
      //console.log(output)
    });
  };

  const handleSubmit = () => {
    //remove leading and trailing spaces and check if empty or not
    if (username.trim() === "") {
      alert("Please enter a valid username");
      return;
    }
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
        console.log(response);
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
        <div>
          <Input
            type="text"
            style={{ marginTop: "20px" }}
            value={username}
            onChange={handleUsernameChange}
            placeholder="Enter your username"
          />
          <Button onClick={retrieveUser}>Retrieve</Button>
        </div>

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
        <a style={{ marginTop: "20px" }}>enter conversation prompt</a>
        <Input
          type="text"
          value={prompt}
          style={{ marginTop: "20px" }}
          onChange={handlePromptChange}
          placeholder="enter prompt"
        />
        <a style={{ marginTop: "20px" }}>choose model</a>
        <div style={{ marginTop: "20px" }}>
          <Dropdown value={genModel} onChange={handleGenModelChange}>
            {genModelOptions.map((option) => (
              <option value={option}>{option}</option>
            ))}
          </Dropdown>
          <Button onClick={generateText}>Submit</Button>
        </div>
      </header>
    </div>
  );
}

export default App;
