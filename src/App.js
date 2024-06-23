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
`;

const Dropdown = styled.select`
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
`;

const MultilineText = styled.div`
  white-space: pre-wrap; /* CSS property to handle multiline text */
  font-size: 16px;
  line-height: 1.5;
  color: white;
  text-align: center;
  width: 300px;
  margin-top: 20px;
  padding: 10px;
  background-color: #333;
`;

export const SubText = styled.div`
  font-size: 12px;
  font-style: italic;
  color: #666;
  margin-top: 8px;
`;

export const YesNoQuestionContainer = styled.div`
  margin-top: 16px;
`;

const ChatContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 20px auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;

const ChatMessages = styled.div`
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 10px;
  background-color: #fff;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 10px;
`;

const ChatSendButton = styled(Button)`
  width: 80px;
`;

const Message = styled.div`
  margin-bottom: 10px;
  ${props => props.isUser ? 'text-align: right;' : ''}
`;

const MessageContent = styled.span`
  background-color: ${props => props.isUser ? '#007bff' : '#e9e9e9'};
  color: ${props => props.isUser ? 'white' : 'black'};
  padding: 5px 10px;
  border-radius: 10px;
  display: inline-block;
`;

function App() {
  const system_text =
    "You are a helpful assistant. You reply with very short answers.";

  const system_prompt = {
    role: "system",
    content: system_text,
  };

  const [systemPrompt, setSystemPrompt] = useState(system_prompt);
  const [inputText, setInputText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [username, setUsername] = useState("");
  const [selectedKey, setSelectedKey] = useState("GPT4");
  const [genModel, setGenModel] = useState("");
  const [genModelOptions, setGenModelOptions] = useState([]);
  const [encryptedData, setEncryptedData] = useState("");
  const [userData, setUserData] = useState({});
  const [modelOutput, setModelOutput] = useState("");
  const [modelName, setModelName] = useState("");
  const [modelPricing, setModelPricing] = useState("");
  const [goodModel, setGoodModel] = useState(true);
  const [isGenerated, setIsGenerated] = useState(false);
  const [chatHistory, setChatHistory] = useState([systemPrompt]);
  const [curIndex, setCurIndex] = useState(0);
  const [convoId, setConvoId] = useState("");
  const [showModelPlayground, setShowModelPlayground] = useState(false);
  const [retrievePrevContext, setRetrievePreviousContext] = useState(false);
  const [prevChats, setPrevChats] = useState([]);
  const [prevResponses, setPrevResponses] = useState([]);
  
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

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

  async function generateTextAPICall(prompt) {
    let data;
    try {
      const response = await fetch(`/create_llm_manager`, {
        method: "GET",
      });
      data = await response.json();
      //return data;
    } catch (error) {
      console.error("Error llm manager", error);
    }

    let data2;
    const postData = {
      good_model: goodModel,
      cur_index: curIndex,
      chat_history: chatHistory,
      llm_manager: data,
      user_input: prompt,
      prevResponses: prevResponses,
      prevChats: prevChats,
    };
    const queryString = new URLSearchParams({
      data: JSON.stringify(postData),
    }).toString();
    try {
      const response = await fetch(`/process_through_llm_API?${queryString}`, {
        method: "GET",
      });
      data2 = await response.json();
      //return data;
    } catch (error) {
      console.error("Error in process through llm", error);
    }
    return data2;
  }

  const yesGoodModel = () => {
    setGoodModel(true);
    alert("feedback received");
  };

  const noGoodModel = () => {
    setGoodModel(false);
    setRetrievePreviousContext(true);
    alert("feedback received");
  };

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
          //remove speicifc key from data
          delete data["convos"];
          setUserData(data);
          alert("retrieved you");
          setShowModelPlayground(true);
        }
      } catch (error) {
        console.error("Error checking subchild existence:", error);
      }
    }

    checkIfSubchildExists(username);
  };

  function passToAPI() {
    let modelData;

    setPrompt("");

    generateTextAPICall(prompt).then((output) => {
      modelData = output;
      console.log(output);
      setModelOutput(modelData.assistant_response);
      setModelName(modelData.model_name);
      setModelPricing(modelData.pricing);
      setChatHistory(modelData.chat_history);
      setCurIndex(modelData.cur_index);
      setIsGenerated(true);

      //write to firebase DB
      if (convoId != "") {
        const convoRef = ref(db, `users/${username}/convos/${convoId}`);

        const timestamp = new Date().getTime();
        const data = {
          [timestamp]: {
            prompt: prompt,
            model_name: modelData.model_name,
            assistant_response: modelData.assistant_response,
            pricing: modelData.pricing,
            cur_index: modelData.cur_index,
            good_model: goodModel,
          },
        };
        update(convoRef, data);
      } else {
        const convoRef = ref(db, `users/${username}/convos/`);

        const newConvoRef = push(convoRef);
        //store that uuid
        setConvoId(newConvoRef.key);
        //add current timsetamp
        const timestamp = new Date().getTime();
        //just add timestamp under that uuid
        const data = {
          [timestamp]: {
            prompt: prompt,
            model_name: modelData.model_name,
            assistant_response: modelData.assistant_response,
            pricing: modelData.pricing,
            cur_index: modelData.cur_index,
            good_model: goodModel,
          },
        };
        update(newConvoRef, data);
      }
    });
  }

  const generateText = () => {
    //grab the chosen model
    //grab the prompt
    //run it through
    setIsGenerated(false);

    if (retrievePrevContext) {
      //go through the DB, go to the convo id, and get all the entries in an array
      async function getPrevData() {
        const convoRef = ref(db, `users/${username}/convos/${convoId}`);
        setPrevChats([]);
        setPrevResponses([]);
        await get(convoRef).then((snapshot) => {
          if (snapshot.exists()) {
            //go through the entries in this snapshot and add all the prompts to one list and all the responses to another list
            const data = snapshot.val();
            for (const key in data) {
              prevChats.push(data[key]["prompt"]);
              setPrevChats(prevChats);
              prevResponses.push(data[key]["assistant_response"]);
              setPrevResponses(prevResponses);
              passToAPI();
            }
            console.log("Retrieved previous context");
            setRetrievePreviousContext(false);
          }
        });
      }
      getPrevData();
    } else {
      passToAPI();
    }
  };

  const handleSubmit = () => {
    //remove leading and trailing spaces and check if empty or not

    if (username.trim() === "") {
      alert("Please enter a valid username");
      return;
    }
    console.log("Submitting", inputText);

    async function encryptData() {
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

    encryptData().then((encryptedData) => {
      console.log(encryptedData);
      const userRef = ref(db, `users/${username}`);

      const data = {
        [selectedKey]: encryptedData.encryptedData,
      };

      update(userRef, data);

      setInputText("");
    });

    setShowModelPlayground(true);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      setMessages([...messages, { role: "user", text: inputMessage }]);
      setInputMessage("");
      generateText();
    }
  };

  return (
    <div style={{ height: "100%" }}>
      <header className="App-header">
        <a style={{ marginTop: "20px" }}>enter username</a>
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
        {showModelPlayground ? (
          <>
            <div
              style={{
                backgroundColor: "#42b3f5",
                padding: "20px",
                marginTop: "20px",
                borderRadius: "20px",
                width: "400px",
                display: "flex",
                flexDirection: "column",
                marginBottom: "20px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isGenerated ? (
                <Container>
                  <SubText>{"Model: " + modelName}</SubText>
                  <SubText>{"Pricing: $" + Number(modelPricing).toExponential(3)}</SubText>
                  <a style={{ marginTop: "20px" }}>did you like this output?</a>

                  <YesNoQuestionContainer>
                    <Button
                      onClick={yesGoodModel}
                      style={{ marginRight: "20px" }}
                    >
                      Yes
                    </Button>
                    <Button onClick={noGoodModel}>No</Button>
                  </YesNoQuestionContainer>
                </Container>
              ) : null}
            </div>
          </>
        ) : null}

        {/* New Chat UI */}
        <ChatContainer>
          <ChatMessages>
            {messages.map((msg, index) => (
              <Message key={index} isUser={msg.role === "user"}>
                <MessageContent isUser={msg.role === "user"}>
                  <strong>{msg.role}: </strong>{msg.text}
                </MessageContent>
              </Message>
            ))}
            <Message isUser={false}>
              <MessageContent isUser={false}>{modelOutput}</MessageContent>
            </Message>
          </ChatMessages>
          
          <ChatInputContainer>
            <ChatInput
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value); // Set the input message
                handlePromptChange(e); // Additional functionality from handlePromptChange
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                  generateText();
                }
              }}
              placeholder="Type your message..."
            />
            <ChatSendButton onClick={() => {
              handleSendMessage();
              generateText();
            }}>Send</ChatSendButton>
          </ChatInputContainer>
        </ChatContainer>
      </header>
    </div>
  );
}

export default App;