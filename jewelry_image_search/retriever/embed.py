# retriever/embed.py
import os
import numpy as np
import torch
from PIL import Image
import torchvision.transforms as transforms
import open_clip
import glob

# Basic transform without preprocessing - just convert PIL to tensor
def get_basic_transform():
    return transforms.Compose([
        transforms.Resize((224, 224)),  # Standard size for most vision models
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.48145466, 0.4578275, 0.40821073], 
                           std=[0.26862954, 0.26130258, 0.27577711])  # CLIP normalization
    ])

@torch.no_grad()
def embed_image_pil(pil_img, model, device: str):
    # Simple transform without preprocessing
    transform = get_basic_transform()
    img = transform(pil_img).unsqueeze(0).to(device)
    feats = model.encode_image(img)
    feats = feats / feats.norm(dim=-1, keepdim=True)
    return feats.squeeze(0).cpu().numpy().astype("float32")

@torch.no_grad()
def embed_text(text: str, model, device: str):
    """Embed text query using CLIP text encoder"""
    text_tokens = open_clip.tokenize([text]).to(device)
    text_features = model.encode_text(text_tokens)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    return text_features.squeeze(0).cpu().numpy().astype("float32")

@torch.no_grad()
def embed_image_path(path: str, model, device: str):
    pil = Image.open(path).convert("RGB")
    return embed_image_pil(pil, model, device)

def embed_directory(img_dir: str, model, device: str):
    paths, vecs = [], []
    for p in sorted(glob.glob(os.path.join(img_dir, "**/*"), recursive=True)):
        if p.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            try:
                v = embed_image_path(p, model, device)
                paths.append(p)
                vecs.append(v)
            except Exception as e:
                print(f"[skip] {p}: {e}")
    if not vecs:
        raise RuntimeError("No images found.")
    return np.vstack(vecs).astype('float32'), paths