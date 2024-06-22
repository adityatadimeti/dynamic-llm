from dotenv import load_dotenv
from dataclasses import dataclass
import os
from groq import Groq
from openai import OpenAI
import time


load_dotenv()

class LLMManager:
    def __init__(self, llms):
        self.llms = llms
        self.current_index = 0

    def get_next_llm(self):
        llm = self.llms[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.llms)
        return llm

    def get_llm_by_model_name(self, model_name):
        for llm in self.llms:
            if llm.model_name == model_name:
                return llm
        return None

@dataclass
class LLM:
    client: any
    model_name: str


groq_client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)
openai_client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY")
)

llm_options = [
    LLM(client=openai_client, model_name="gpt-3.5-turbo"),
    LLM(client=groq_client, model_name="llama3-8b-8192")
]

llm_manager = LLMManager(llm_options)

def main():
    system_text = "You are a helpful assistant. You reply with very short answers."
    system_prompt = {
        "role": "system",
        "content": system_text
    }
    print("System: ", system_text)

    chat_history = [system_prompt]
    

    while True:
        llm = llm_manager.get_next_llm()
        client = llm.client
        model_name = llm.model_name

        user_input = input("User: ")
        chat_history.append({"role": "user", "content": user_input})

        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=chat_history[-10:],
                max_tokens=100,
                temperature=1.2
            )
            assistant_response = response.choices[0].message.content
            chat_history.append({
                "role": "assistant",
                "content": assistant_response
            })
            print(f"Assistant ({model_name}):", assistant_response)
        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()