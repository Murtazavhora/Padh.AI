import PyPDF2

def extract_text_from_pdf(file):
    try:
        pdf = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text.strip() or "No text found"
    except:
        return "Error reading PDF"