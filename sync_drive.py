import os
import json
import glob
import re
import gdown
from PyPDF2 import PdfReader
import google.generativeai as genai

# Folder ID extracted from the provided Google Drive link
DRIVE_FOLDER_ID = "1sTYUsVAt_Dr599SsDDaizP3-RjweCfMu"
DRIVE_LINK = "https://drive.google.com/drive/folders/1sTYUsVAt_Dr599SsDDaizP3-RjweCfMu?usp=sharing"

def download_resumes():
    print("Downloading folder from Google Drive...")
    # Create temp dir
    if not os.path.exists("downloads"):
        os.makedirs("downloads")
    
    # Download the folder using gdown
    # This fetches all files in the public folder.
    url = f"https://drive.google.com/drive/folders/{DRIVE_FOLDER_ID}?usp=sharing"
    gdown.download_folder(url, quiet=False, use_cookies=False, output="downloads")

def extract_text_from_pdfs():
    print("Extracting text from downloaded PDFs...")
    text_content = ""
    pdf_files = glob.glob("downloads/**/*.pdf", recursive=True)
    
    for pdf_file in pdf_files:
        try:
            reader = PdfReader(pdf_file)
            for page in reader.pages:
                text_content += page.extract_text() + "\n"
        except Exception as e:
            print(f"Failed to parse {pdf_file}: {e}")
            
    return text_content

def process_with_ai(raw_text):
    print("Sending text to Google Gemini API for parsing...")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Check your GitHub Secrets.")
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    prompt = f"""
    You are an expert data structured parser. Below is the raw extracted text from a user's resume/portfolio PDF.
    Please parse all the data and map it EXACTLY into the following JSON format.
    Return ONLY valid, minified JSON. Do not include markdown codeblocks (no ```json).
    
    JSON Schema Requirements:
    {{
      "personalInfo": {{
        "name": "", "role": "", "location": "", "email": "", "phone": "",
        "summary": "A 2 sentence professional bio",
        "driveLink": "{DRIVE_LINK}"
      }},
      "socialLinks": {{ "linkedin": "", "github": "" }},
      "skills": {{
        "languages": [], "frameworks": [], "tools": [], "specialized": []
      }},
      "experience": [
        {{ "role": "", "company": "", "duration": "", "description": "" }}
      ],
      "projects": [
        {{ "title": "", "description": "", "link": "Use URL if available, else #", "tags": [] }}
      ],
      "education": [
        {{ "institution": "", "degree": "", "duration": "" }}
      ],
      "certifications": [ "List of strings" ]
    }}
    
    Raw Resume Text:
    {raw_text}
    """
    
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    # Strip markdown block if it was still added
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
        
    try:
        # Validate that it is parseable JSON
        parsed_json = json.loads(response_text)
        return json.dumps(parsed_json, indent=4)
    except json.JSONDecodeError as e:
        print("Failed to decode AI response as JSON")
        print("Raw response:", response.text)
        raise e

def rewrite_constants(json_data_str):
    print("Overwriting constants.js...")
    file_content = f"const PORTFOLIO_DATA = {json_data_str};\n"
    with open("constants.js", "w", encoding="utf-8") as f:
        f.write(file_content)
    print("Update successful!")

def main():
    try:
        download_resumes()
        text = extract_text_from_pdfs()
        if not text.strip():
            print("No text could be extracted from the drive link. Aborting.")
            return
            
        json_data = process_with_ai(text)
        rewrite_constants(json_data)
    except Exception as e:
        print(f"Workflow failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()
