from mistral_common.protocol.instruct.messages import (
    AssistantMessage,
    UserMessage,
    ToolMessage
)
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.protocol.instruct.tool_calls import Function, Tool, ToolCall, FunctionCall
from mistral_common.tokens.instruct.normalize import ChatCompletionRequest

tokenizer_v1 = MistralTokenizer.v1()
tokenizer_v3 = MistralTokenizer.v3()

pricing_dict = {}

# v1 tokenizing model
pricing_dict["open-mistral-7b_input"] = 0.25 / 1000000
pricing_dict["open-mistral-7b_output"] = 0.25 / 1000000

# v1 tokenizing model
pricing_dict["open-mixtral-8x7b_input"] = 0.7 / 1000000
pricing_dict["open-mixtral-8x7b_output"] = 0.7 / 1000000

# v3 tokenizing model
pricing_dict["open-mixtral-8x22b_input"] = 2 / 1000000
pricing_dict["open-mixtral-8x22b_output"] = 6 / 1000000
