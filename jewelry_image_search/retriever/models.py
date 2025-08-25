# retriever/models.py
import torch
import open_clip

# Define available models here
CLIP_MODELS = {
    'ViT-B/32': 'laion2b_s34b_b79k',  # default model
    'ViT-L/14': 'laion2b_s32b_b82k',
    'RN50': 'openai/clip-vit-base-patch32',
    'RN101': 'openai/clip-vit-large-patch16'
}

# Set your desired model from the available ones
SELECTED_MODEL = 'ViT-B/32'  # Change this to any model from the list

# Model setup
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
PRETRAINED = CLIP_MODELS[SELECTED_MODEL]  # Use the model you selected

def load_model():
    """Load selected CLIP model and preprocess function"""
    model, _, preprocess = open_clip.create_model_and_transforms(
        SELECTED_MODEL, pretrained=PRETRAINED, device=DEVICE
    )
    model.eval()
    embed_dim = model.visual.output_dim if hasattr(model, "visual") else 512
    print(SELECTED_MODEL, "loaded on", DEVICE)
    return model, preprocess, DEVICE, embed_dim