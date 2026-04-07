import os
import requests
import time
import json
import glob
import re
import gdown
from PyPDF2 import PdfReader
from docx import Document

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

def extract_text_from_files():
    print("Extracting text from downloaded PDFs and Word Docs...")
    text_content = ""
    # Look for both PDF and DOCX
    files = glob.glob("downloads/**/*.pdf", recursive=True) + glob.glob("downloads/**/*.docx", recursive=True)
    
    for file_path in files:
        try:
            if file_path.endswith(".pdf"):
                reader = PdfReader(file_path)
                for page in reader.pages:
                    text_content += (page.extract_text() or "") + "\n"
            elif file_path.endswith(".docx"):
                doc = Document(file_path)
                for para in doc.paragraphs:
                    text_content += para.text + "\n"
        except Exception as e:
            print(f"Failed to parse {file_path}: {e}")
            
    return text_content

def process_with_ai(raw_text):
    print("Calling Gemini API via REST (requests)...")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Check your GitHub Secrets.")
    
    # REST URL and headers as per the curl example exactly
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent"
    
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": api_key
    }
    
    prompt = f"""
    You are an expert data structured parser. Below is the raw extracted text from a user's resume/portfolio PDF.
    Please parse all the data and map it EXACTLY into the following JSON format.
    Return ONLY valid, minified JSON. Do not include markdown codeblocks (no ```json).
    
    JSON Schema Requirements:
    {{
      "personalInfo": {{
        "name": "", "role": "", "location": "", "email": "", "phone": "",
        "summary": "A 2 sentence professional bio"
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
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload)
            result = response.json()
            
            # Handle specifically 503 (Overloaded) or 429 (Rate Limit)
            if response.status_code in [429, 503]:
                print(f"Gemini API is busy/throttled (Attempt {attempt + 1}/{max_retries}). Retrying in 10s...")
                time.sleep(10)
                continue
                
            if "candidates" not in result:
                print("API Error Response:", result)
                raise ValueError(f"Gemini API Error: {result.get('error', {}).get('message', 'Unknown response structure')}")
                
            response_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()
            
            # Strip markdown block if it was still added
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            # Validate and format JSON
            parsed_json = json.loads(response_text.strip())
            return json.dumps(parsed_json)

        except Exception as e:
            if attempt == max_retries - 1:
                raise e
            print(f"Request failed: {e}. Retrying in 5s...")
            time.sleep(5)
    
    raise ValueError("Failed to get response from Gemini API after multiple retries.")

def rewrite_constants(json_payload):
    print("Updating constants.js with live data...")
    file_content = f"const PORTFOLIO_DATA = {json_payload};\n"
    with open("constants.js", "w") as f:
        f.write(file_content)
    print("Update successful!")

def fetch_github_repos(username):
    print(f"Fetching GitHub repositories for {username}...")
    url = f"https://api.github.com/users/{username}/repos?sort=stars&per_page=6"
    try:
        response = requests.get(url)
        repos = response.json()
        formatted_projects = []
        for repo in repos:
            formatted_projects.append({
                "title": repo.get("name"),
                "description": repo.get("description") or "Source code on GitHub.",
                "link": repo.get("html_url"),
                "tags": [repo.get("language") or "Project"]
            })
        return formatted_projects
    except Exception as e:
        print(f"Failed to fetch GitHub repos: {e}")
        return []

def main():
    try:
        download_resumes()
        text = extract_text_from_files()
        if not text.strip():
            print("No text could be extracted from the drive link. Aborting.")
            return
            
        json_data_str = process_with_ai(text)
        json_data = json.loads(json_data_str)
        
        # Inject live GitHub data into the JSON
        github_username = "invins2003"
        json_data["projects"] = fetch_github_repos(github_username)
        
        # Save back to constants.js
        rewrite_constants(json.dumps(json_data, indent=4))
    except Exception as e:
        print(f"Workflow failed: {e}")
        exit(1)

if __name__ == "__main__":
    main()
