import tiktoken

# Create a dictionary with the pricing for each model, in $ per 1 token
pricing_dict = {}

pricing_dict["gpt-4o_input"] = 0.005 / 1000
pricing_dict["gpt-4o_output"] = 0.015 / 1000

pricing_dict["gpt-3.5-turbo_input"] = 0.0005 / 1000
pricing_dict["gpt-3.5-turbo_output"] = 0.0015 / 1000

encoding = tiktoken.get_encoding("cl100k_base")
assert encoding.decode(encoding.encode("hello world")) == "hello world"

# To get the tokeniser corresponding to a specific model in the OpenAI API:
gpt4o_enc = tiktoken.encoding_for_model("gpt-4o")
gpt35_enc = tiktoken.encoding_for_model("gpt-3.5-turbo")

print("Text:", "hello world", "Length tokenized input", len(gpt4o_enc.encode("hello world")), "Input price", pricing_dict["gpt-4o_input"] * len(gpt4o_enc.encode("hello world")))

