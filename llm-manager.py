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

    # If it was a good response then try the cheaper model.
    def get_next_llm(self, good_model):
        if good_model:
            return llm_manager.llms[0]
        else:
            return llm_manager.llms[1]

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
    LLM(client=groq_client, model_name="llama3-8b-8192"),
    LLM(client=openai_client, model_name="gpt-3.5-turbo")
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
    
    good_model = True
    while True:
        llm = llm_manager.get_next_llm(good_model)
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

            was_good_model = input("Was the model response good? (y/n): ")
            if was_good_model == "y":
                good_model = True
            elif was_good_model == "n":
                good_model = False
            else:
                print("Invalid input. Please enter 'y' or 'n'.")

        except Exception as e:
            print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()