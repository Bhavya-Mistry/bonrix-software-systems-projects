import sys
import os

# Add the 'retriever' directory path to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'retriever')))

# Now you should be able to import retriever
from preprocess import load_rgb

img = load_rgb(r'../data/images/test.png')
img.show()
