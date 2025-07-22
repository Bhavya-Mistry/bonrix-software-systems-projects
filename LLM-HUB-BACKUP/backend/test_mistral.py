import os
from dotenv import load_dotenv
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("MISTRAL_API_KEY", "")
print(f"API key length: {len(api_key)}")
print(f"API key first 5 chars: {api_key[:5]}...")

try:
    # Initialize client
    client = MistralClient(api_key=api_key)
    print("Client initialized successfully")
    
    # Test API with a simple request
    messages = [ChatMessage(role="user", content="Hello, how are you?")]
    
    print("Sending request to Mistral API...")
    response = client.chat(
        model="mistral-tiny",
        messages=messages
    )
    
    print("Response received:")
    print(response.choices[0].message.content)
    
except Exception as e:
    print(f"Error: {str(e)}")
