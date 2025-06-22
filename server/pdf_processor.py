import pdfplumber
import PyPDF2
import json
import os
from typing import List, Dict, Any

def process_uploaded_pdf(file_path: str) -> str:
    """
    Process an uploaded PDF file and extract text content using pdfplumber.
    """
    try:
        text_content = ""
        
        # Try pdfplumber first (better for complex layouts)
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text_content += page_text + "\n"
        except Exception as pdfplumber_error:
            # Fallback to PyPDF2 if pdfplumber fails
            try:
                with open(file_path, 'rb') as file:
                    pdf_reader = PyPDF2.PdfReader(file)
                    for page in pdf_reader.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text_content += page_text + "\n"
            except Exception as pypdf2_error:
                raise Exception(f"Both PDF extraction methods failed. pdfplumber: {pdfplumber_error}, PyPDF2: {pypdf2_error}")
        
        if not text_content.strip():
            raise Exception("No text content could be extracted from the PDF")
        
        return text_content.strip()
    except Exception as e:
        raise Exception(f"Failed to process PDF file: {str(e)}")

def generate_flashcards_with_ai(text_content: str, count: int = 10, difficulty: str = "medium") -> Dict[str, Any]:
    """
    Prepare text content for AI flashcard generation.
    The actual AI generation will be done in Node.js using OpenAI API.
    """
    try:
        # Return structured response for AI processing
        return {
            "success": True,
            "text_content": text_content,
            "requested_count": count,
            "difficulty": difficulty,
            "message": "Text extracted successfully. Ready for AI processing."
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Usage: python pdf_processor.py <pdf_path>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        text_content = process_uploaded_pdf(pdf_path)
        result = {
            "success": True,
            "text_content": text_content
        }
        print(json.dumps(result))
    except Exception as e:
        result = {
            "success": False,
            "error": str(e)
        }
        print(json.dumps(result))