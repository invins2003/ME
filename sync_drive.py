import os
import requests
import json
import glob
import gdown
from PyPDF2 import PdfReader
from docx import Document
from google import genai
from google.genai import types

# Folder ID extracted from the provided Google Drive link
DRIVE_FOLDER_ID = "1sTYUsVAt_Dr599SsDDaizP3-RjweCfMu"
DRIVE_LINK = "https://drive.google.com/drive/folders/1sTYUsVAt_Dr599SsDDaizP3-RjweCfMu?usp=sharing"

def download_resumes():
    print("Downloading folder from Google Drive...")
    if not os.path.exists("downloads"):
        os.makedirs("downloads")
    
    url = f"https://drive.google.com/drive/folders/{DRIVE_FOLDER_ID}?usp=sharing"
    gdown.download_folder(url, quiet=False, use_cookies=False, output="downloads")

def extract_text_from_files():
    print("Extracting text from downloaded PDFs and Word Docs...")
    text_content = ""
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
    print("Calling Gemini API via Official SDK (google-genai)...")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set. Check your GitHub Secrets.")
    
    # Force v1beta to ensure compatibility with the latest preview models
    client = genai.Client(api_key=api_key, http_options={'api_version': 'v1beta'})
    
    prompt = f"""
    You are an expert data structured parser. Below is the raw extracted text from a user's resume/portfolio PDF.
    Please parse all the data and map it EXACTLY into the following JSON format.
    
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
    
    try:
        # Use the 2026 Pro model equivalent
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type='application/json' # This forces pure JSON output
            )
        )
        
        # Because we used response_mime_type, we can parse it directly
        parsed_json = json.loads(response.text.strip())
        return json.dumps(parsed_json)

    except Exception as e:
        print(f"Gemini SDK Error: {e}")
        raise e

def rewrite_constants(json_payload):
    print("Updating constants.js with live data...")
    file_content = f"const PORTFOLIO_DATA = {json_payload};\n"
    with open("constants.js", "w", encoding="utf-8") as f:
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