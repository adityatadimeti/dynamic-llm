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
pricing_dict["llama-70b-8192"] = (0.59 / 1000000, llama_tokenizer)
pricing_dict["llama-8b-8192"] = (0.05 / 1000000, llama_tokenizer)


def get_pricing(model, message):
    if model == "gpt-4o" or model == "gpt-3.5-turbo":
        return pricing_dict[model][0] * len(pricing_dict[model][1].encode(message))
    elif model == "open-mixtral-8x7b":
        return len(pricing_dict[model][1].encode_chat_completion(ChatCompletionRequest(messages=[UserMessage(content=message)])).tokens) * pricing_dict[model][0]
    elif model == "llama-70b" or model == "llama-8b":
        return len(pricing_dict[model][1].encode(message)) * pricing_dict[model][0]
    else:
        return None

