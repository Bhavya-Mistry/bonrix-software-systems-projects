import os
import io
from typing import Dict, Any, List
from PIL import Image
import torch
import torchvision
from torchvision import transforms
import numpy as np

# Load COCO labels
COCO_INSTANCE_CATEGORY_NAMES = [
    '__background__', 'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
    'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
    'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
    'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
    'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
    'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant',
    'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone',
    'microwave', 'oven', 'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors',
    'teddy bear', 'hair drier', 'toothbrush'
]

# Load the pre-trained Faster R-CNN model
model = torchvision.models.detection.fasterrcnn_resnet50_fpn(weights="DEFAULT")
model.eval()

def detect_objects(image_content: bytes) -> Dict[str, Any]:
    """
    Detect objects in an image using torchvision's Faster R-CNN.
    Args:
        image_content: Image content as bytes
    Returns:
        Dictionary with detection results
    """
    # Load the image
    image = Image.open(io.BytesIO(image_content)).convert("RGB")
    transform = transforms.Compose([
        transforms.ToTensor()
    ])
    img_tensor = transform(image)
    with torch.no_grad():
        predictions = model([img_tensor])[0]
    objects = []
    counts = {}
    for label, score, box in zip(predictions['labels'], predictions['scores'], predictions['boxes']):
        if score < 0.5:
            continue
        class_name = COCO_INSTANCE_CATEGORY_NAMES[label]
        box = box.tolist()
        objects.append({
            "class": class_name,
            "confidence": float(score),
            "box": [int(b) for b in box]
        })
        if class_name in counts:
            counts[class_name] += 1
        else:
            counts[class_name] = 1
    return {
        "objects": objects,
        "counts": counts
    }
