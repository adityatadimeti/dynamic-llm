from pinecone import Pinecone, ServerlessSpec
import os
import tiktoken

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv

load_dotenv()
tokenizer = tiktoken.get_encoding('cl100k_base')

# create the length function
def tiktoken_len(text): # this should be modified for each unique model.
    tokens = tokenizer.encode(
        text,
        disallowed_special=()
    )
    return len(tokens)


text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=400,
    chunk_overlap=20,
    length_function=tiktoken_len,
    separators=["\n\n", "\n", " ", ""]
)
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
#pc = Pinecone(os.environ.get("PINECONE_API_KEY"))


model_name = 'text-embedding-ada-002'

embed = OpenAIEmbeddings(
    model=model_name,
    openai_api_key=OPENAI_API_KEY
)

texts = [
    'this is the first chunk of text',
    'then another second chunk of text is here'
]

res = embed.embed_documents(texts)
print(len(res), len(res[0]))