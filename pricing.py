import tiktoken
from transformers import LlamaTokenizerFast
from mistral_common.protocol.instruct.messages import UserMessage
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.protocol.instruct.request import ChatCompletionRequest

llama_tokenizer = LlamaTokenizerFast.from_pretrained("hf-internal-testing/llama-tokenizer")

pricing_dict = {}

mistral_tokenizer_v1 = MistralTokenizer.v1()
gpt4o_enc = tiktoken.encoding_for_model("gpt-4o")
gpt35turbo_enc = tiktoken.encoding_for_model("gpt-3.5-turbo")

pricing_dict["open-mixtral-8x7b"] = (0.24 / 1000000, mistral_tokenizer_v1)
pricing_dict["gpt-4o"] = (0.005 / 1000, gpt4o_enc)
pricing_dict["gpt-3.5-turbo"] = (0.0005 / 1000, gpt35turbo_enc)
pricing_dict["llama-70b"] = (0.59 / 1000000, llama_tokenizer)
pricing_dict["llama-8b"] = (0.05 / 1000000, llama_tokenizer)


input_message = "hello world"

print("GPT4o price", pricing_dict["gpt-4o"][0] * len(gpt4o_enc.encode(input_message)))
print("GPT3.5 turbo price", pricing_dict["gpt-3.5-turbo"][0] * len(gpt35turbo_enc.encode(input_message)))
print("Mistral price", len(mistral_tokenizer_v1.encode_chat_completion(ChatCompletionRequest(messages=[UserMessage(content="hello world")])).tokens) * pricing_dict["open-mixtral-8x7b"][0])
print("Llama price", len(llama_tokenizer.encode("Hello this is a test")) * pricing_dict["llama-70b"][0])
