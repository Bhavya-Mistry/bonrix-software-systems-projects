# pip install google-genai

import base64
import mimetypes
import os
from google import genai
from google.genai import types

GOOGLE_GENAI_API_KEY="AIzaSyDVwkLbC2az9dzwAIqYeIh-WDq1pWAqwhw"

def save_binary_file(file_name, data):
    # data may be raw bytes or a base64-encoded string; handle both
    if isinstance(data, str):
        try:
            data = base64.b64decode(data)
        except Exception:
            # Fall back to writing the string as-is if it wasn't base64
            data = data.encode("utf-8")
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")


def part_from_image_path(image_path: str) -> types.Part:
    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type or not mime_type.startswith("image/"):
        raise ValueError(f"Could not determine image mime type for: {image_path}")
    with open(image_path, "rb") as f:
        data = f.read()
    # Build an image part from bytes
    return types.Part.from_bytes(mime_type=mime_type, data=data)


def generate(prompt: str, image_path: str, out_file_prefix: str = "gen_image"):
    """
    Sends a text prompt + input image to the image-capable model
    and saves any returned images. Also prints any returned text.
    """
    # api_key = os.getenv("GENAI_API_KEY") or os.getenv("GOOGLE_GENAI_API_KEY")
    api_key = GOOGLE_GENAI_API_KEY
    if not api_key:
        raise RuntimeError("Set your API key in GENAI_API_KEY (or GOOGLE_GENAI_API_KEY).")

    client = genai.Client(api_key=api_key)

    model = "gemini-2.0-flash-preview-image-generation"

    # Construct contents with both text and image parts
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=prompt),
                part_from_image_path(image_path),
            ],
        ),
    ]

    # Ask for image (and text, in case the model also returns a caption/explanation)
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"]
    )

    file_index = 0
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        # Skip empty chunks
        if (
            not chunk.candidates
            or not chunk.candidates[0].content
            or not chunk.candidates[0].content.parts
        ):
            continue

        for part in chunk.candidates[0].content.parts:
            # Image part
            if getattr(part, "inline_data", None) and getattr(part.inline_data, "data", None):
                file_name = f"{out_file_prefix}_{file_index}"
                file_index += 1
                inline_data = part.inline_data
                data_buffer = inline_data.data
                file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".bin"
                save_binary_file(f"{file_name}{file_extension}", data_buffer)

            # Text part (e.g., safety notes or captions)
            if getattr(part, "text", None):
                print(part.text)

    if file_index == 0:
        print("No images were returned by the model.")


if __name__ == "__main__":
    # EXAMPLE:
    # Place an image on disk and update these two lines:
    user_prompt = r"Please analyze the attached image. First, identify the primary object of attention or the main subject in this photo. Based on your analysis, generate a new image that is a close-up crop of only that object. The final generated image should have the object placed on a clean, plain white background. Make sure the image does not get changed."
    input_image_path = r"test1.jpg"
    generate(user_prompt, input_image_path, out_file_prefix="result")
