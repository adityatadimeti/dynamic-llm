from pinecone import Pinecone, ServerlessSpec
import os

pc = Pinecone(os.environ.get("PINECONE_API_KEY"))