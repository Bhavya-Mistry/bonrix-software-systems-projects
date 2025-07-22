import os
import re

def fix_imports_in_file(file_path):
    with open(file_path, 'r') as file:
        content = file.read()
    
    # Replace relative imports with absolute imports
    modified_content = re.sub(r'from \.\.([\w\.]+) import', r'from \1 import', content)
    modified_content = re.sub(r'from \.([\w\.]+) import', r'from utils.\1 import', content)
    
    if content != modified_content:
        with open(file_path, 'w') as file:
            file.write(modified_content)
        print(f"Fixed imports in {file_path}")

def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                fix_imports_in_file(file_path)

if __name__ == "__main__":
    # Fix imports in API directory
    process_directory("api")
    
    # Fix imports in services directory
    process_directory("services")
    
    # Fix imports in utils directory
    process_directory("utils")
    
    print("Import fixing completed!")
