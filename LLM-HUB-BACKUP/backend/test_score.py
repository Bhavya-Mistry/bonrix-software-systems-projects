# Test script to demonstrate fit score extraction
import re

# Sample LLM responses with different score formats
samples = [
    "1) Fit Score: 0.8 The candidate has some relevant skills...",
    "1) Fit Score (0-100): 75 Based on the candidate's resume...",
    "Fit Score: 85/100 The candidate demonstrates...",
    "Fit Score: 0.65 out of 1 The candidate shows...",
    "1) Fit Score: 0 The candidate lacks relevant experience..."
]

def extract_fit_score(response_text):
    # Default to a reasonable score if extraction fails
    default_score = 75  # Default to a moderate score
    
    try:
        # Extract fit score from the response
        fit_score_lines = [line for line in response_text.split('\n') if "Fit Score" in line or "fit score" in line.lower()]
        if fit_score_lines:
            fit_score_line = fit_score_lines[0]
            # Parse the score, handling different formats
            score_parts = fit_score_line.split(':')
            if len(score_parts) > 1:
                score_text = score_parts[1].strip()
                # Handle various formats like '85/100', '85', '0.85', etc.
                if '/' in score_text:
                    score_text = score_text.split('/')[0].strip()
                
                # Extract the first number from the text
                numbers = re.findall(r'\d+\.?\d*', score_text)
                if numbers:
                    score_value = float(numbers[0])
                    # Check if it's a decimal between 0 and 1 (like 0.85)
                    if 0 <= score_value <= 1:
                        # Convert to 0-100 scale
                        fit_score = int(score_value * 100)
                    else:
                        # Already on 0-100 scale
                        fit_score = int(score_value)
                    
                    # Ensure score is between 1 and 100
                    return max(1, min(fit_score, 100))
    except Exception as e:
        print(f"Error extracting fit score: {e}")
    
    return default_score

# Test the extraction function
for i, sample in enumerate(samples):
    score = extract_fit_score(sample)
    print(f"Sample {i+1}: {score}")
    print(f"Original text: {sample[:50]}...\n")

# This function can be used in the LLM service to ensure we always get a valid score
