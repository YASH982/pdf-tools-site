# Image to pdf
from flask import Flask, request, send_file
from utils.image_to_pdf import convert_images_to_pdf
import os

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/")
def home():
    return "PDF Tools API is running!"

@app.route("/image-to-pdf", methods=["POST"])
def image_to_pdf():
    images = request.files.getlist("images")
    output_path = os.path.join(UPLOAD_FOLDER, "output.pdf")
    
    convert_images_to_pdf(images, output_path)
    return send_file(output_path, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)



# Merge pdf

from PyPDF2 import PdfMerger

@app.route("/merge-pdf", methods=["POST"])
def merge_pdf():
    pdfs = request.files.getlist("pdfs")
    output_path = os.path.join(UPLOAD_FOLDER, "merged.pdf")

    merger = PdfMerger()

    for pdf in pdfs:
        merger.append(pdf.stream)

    merger.write(output_path)
    merger.close()

    return send_file(output_path, as_attachment=True)


# split pdf

from PyPDF2 import PdfReader, PdfWriter

@app.route("/split-pdf", methods=["POST"])
def split_pdf():
    pdf_file = request.files["pdf"]
    pages = request.form.get("pages")  # e.g., "1,3,5"
    output_path = os.path.join(UPLOAD_FOLDER, "split.pdf")

    page_numbers = [int(p.strip()) - 1 for p in pages.split(",") if p.strip().isdigit()]

    reader = PdfReader(pdf_file.stream)
    writer = PdfWriter()

    for page_num in page_numbers:
        if 0 <= page_num < len(reader.pages):
            writer.add_page(reader.pages[page_num])

    with open(output_path, "wb") as f:
        writer.write(f)

    return send_file(output_path, as_attachment=True)


#Deleat pages from pdf


@app.route("/delete-pages", methods=["POST"])
def delete_pages():
    pdf_file = request.files["pdf"]
    delete_pages_input = request.form.get("pages")  # e.g., "2,4"
    output_path = os.path.join(UPLOAD_FOLDER, "deleted.pdf")

    delete_pages = set(int(p.strip()) - 1 for p in delete_pages_input.split(",") if p.strip().isdigit())

    reader = PdfReader(pdf_file.stream)
    writer = PdfWriter()

    for i in range(len(reader.pages)):
        if i not in delete_pages:
            writer.add_page(reader.pages[i])

    with open(output_path, "wb") as f:
        writer.write(f)

    return send_file(output_path, as_attachment=True)




#add pages to pdf

@app.route("/add-pages", methods=["POST"])
def add_pages():
    main_pdf = request.files["main_pdf"]
    insert_pdfs = request.files.getlist("insert_pdfs")
    insert_after = int(request.form.get("page")) - 1  # 1-based index

    output_path = os.path.join(UPLOAD_FOLDER, "added.pdf")

    main_reader = PdfReader(main_pdf.stream)
    insert_readers = [PdfReader(f.stream) for f in insert_pdfs]

    writer = PdfWriter()

    # Step 1: Add pages before insertion point
    for i in range(len(main_reader.pages)):
        writer.add_page(main_reader.pages[i])
        if i == insert_after:
            for reader in insert_readers:
                for page in reader.pages:
                    writer.add_page(page)

    # If insert_after >= total pages, insert at end
    if insert_after >= len(main_reader.pages):
        for reader in insert_readers:
            for page in reader.pages:
                writer.add_page(page)

    with open(output_path, "wb") as f:
        writer.write(f)

    return send_file(output_path, as_attachment=True)



@app.route("/list-files", methods=["GET"])
def list_files():
    files = os.listdir(UPLOAD_FOLDER)
    files = [f for f in files if f.endswith(".pdf")]
    files.sort(key=lambda x: os.path.getmtime(os.path.join(UPLOAD_FOLDER, x)), reverse=True)
    return jsonify(files)



@app.route("/download/<filename>", methods=["GET"])
def download_file(filename):
    path = os.path.join(UPLOAD_FOLDER, filename)
    if os.path.exists(path):
        return send_file(path, as_attachment=True)
    return "File not found", 404




