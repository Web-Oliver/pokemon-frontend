import vertexai
from vertexai.generative_models import GenerativeModel

# --- Configuration ---
PROJECT_ID = "optimum-rock-467801-f1"
LOCATION = "us-central1"
# Initialize the Vertex AI SDK.
vertexai.init(project=PROJECT_ID, location=LOCATION)

# --- Model Selection ---
model = GenerativeModel("gemini-2.5-pro")

# --- Prompting the Model ---
prompt = """
Write a short, professional email to a client named Alex to confirm the meeting for next Tuesday.
Mention that you're looking forward to discussing the new project.
"""

# Generate content based on the prompt
response = model.generate_content(prompt)

# --- Output the Response ---
print("Model Response:")
print("---------------")
print(response.text)
