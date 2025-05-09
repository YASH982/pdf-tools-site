// Hide all tool sections
function hideAllTools() {
    document.querySelectorAll(".tool-section").forEach(section => {
        section.style.display = "none";
    });
}

// Show selected tool
function showTool(toolId) {
    hideAllTools();
    document.getElementById(toolId).style.display = "block";
}

// Attach click handlers to nav buttons
document.querySelectorAll("nav button").forEach(button => {
    button.addEventListener("click", () => {
        const toolId = button.getAttribute("data-target");
        showTool(toolId);
    });
});

// Initial load: show first tool
showTool("image-to-pdf");

// Image to PDF submission
document.getElementById("uploadForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const files = document.querySelector('input[type="file"]').files;

    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    const status = document.getElementById("status");
    status.innerText = "Uploading...";

    const response = await fetch("http://127.0.0.1:5000/image-to-pdf", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "converted.pdf";
        link.click();
        status.innerText = "Download ready!";
    } else {
        status.innerText = "Failed to convert.";
    }
});

// Merge PDFs submission
document.getElementById("mergeForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const files = document.querySelector('input[name="pdfs"]').files;

    for (let i = 0; i < files.length; i++) {
        formData.append("pdfs", files[i]);
    }

    const status = document.getElementById("mergeStatus");
    status.innerText = "Merging PDFs...";

    const response = await fetch("http://127.0.0.1:5000/merge-pdf", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "merged.pdf";
        link.click();
        status.innerText = "Download ready!";
    } else {
        status.innerText = "Failed to merge PDFs.";
    }
});

// Split PDF submission
document.getElementById("splitForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const file = document.querySelector('input[name="pdf"]').files[0];
    const pages = document.querySelector('input[name="pages"]').value;

    formData.append("pdf", file);
    formData.append("pages", pages);

    const status = document.getElementById("splitStatus");
    status.innerText = "Splitting...";

    const response = await fetch("http://127.0.0.1:5000/split-pdf", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "split.pdf";
        link.click();
        status.innerText = "Download ready!";
    } else {
        status.innerText = "Failed to split PDF.";
    }
});

// Delete Pages from PDF submission
document.getElementById("deleteForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const file = document.querySelector('input[name="pdf"]').files[0];
    const pages = document.querySelector('input[name="pages"]').value;

    formData.append("pdf", file);
    formData.append("pages", pages);

    const status = document.getElementById("deleteStatus");
    status.innerText = "Deleting pages...";

    const response = await fetch("http://127.0.0.1:5000/delete-pages", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "deleted.pdf";
        link.click();
        status.innerText = "Download ready!";
    } else {
        status.innerText = "Failed to delete pages.";
    }
});

// Add Pages to PDF submission
document.getElementById("addForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = new FormData();
    const mainPdf = document.querySelector('input[name="main_pdf"]').files[0];
    const insertPdfs = document.querySelector('input[name="insert_pdfs"]').files;
    const page = document.querySelector('input[name="page"]').value;

    formData.append("main_pdf", mainPdf);
    for (let i = 0; i < insertPdfs.length; i++) {
        formData.append("insert_pdfs", insertPdfs[i]);
    }
    formData.append("page", page);

    const status = document.getElementById("addStatus");
    status.innerText = "Processing...";

    const response = await fetch("http://127.0.0.1:5000/add-pages", {
        method: "POST",
        body: formData
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "added.pdf";
        link.click();
        status.innerText = "Download ready!";
    } else {
        status.innerText = "Failed to add pages.";
    }
});

// Loading download history
async function loadHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = "Loading...";

    const response = await fetch("http://127.0.0.1:5000/list-files");
    if (response.ok) {
        const files = await response.json();
        list.innerHTML = "";

        if (files.length === 0) {
            list.innerHTML = "<li class='list-group-item'>No files found.</li>";
        } else {
            files.forEach(file => {
                const li = document.createElement("li");
                li.className = "list-group-item";  // Apply Bootstrap class for styling
                const link = document.createElement("a");
                link.href = `http://127.0.0.1:5000/download/${file}`;
                link.textContent = file;
                link.download = file;
                li.appendChild(link);
                list.appendChild(li);
            });
        }
    } else {
        list.innerHTML = "<li class='list-group-item'>Failed to load history.</li>";
    }
}
