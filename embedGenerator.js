window.generateEmbedCode = function () {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const previewContainer = document.getElementById("previewContainer");
    const outputArea = document.getElementById("embedCode");

    if (!sheetUrl.includes("https://docs.google.com/spreadsheets/")) {
        alert("Please enter a valid Google Sheet URL.");
        return;
    }

    const csvUrl = sheetUrl.replace(/\/edit.*/, "/pub?output=csv");

    const embedCode = `
<div id="fucketlist-container"></div>
<link rel="stylesheet" href="https://use.typekit.net/vdp2gno.css">
<style>
    @font-face {
        font-family: "adobe-handwriting-tiffany";
        src: url("https://use.typekit.net/vdp2gno.css");
    }
    .fucketlist-item {
        font-family: "adobe-handwriting-tiffany", sans-serif;
        font-weight: 400;
        font-style: normal;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
    }
    .fucketlist-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .fucketlist-dot.blue {
        background-color: blue;
    }
    .fucketlist-dot.yellow {
        background-color: yellow;
    }
    .fucketlist-title {
        position: relative;
        font-size: 1.2em;
    }
    .fucketlist-title.red {
        position: relative;
        display: inline-block;
    }
    .fucketlist-title.red::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -4px; /* Adjust to position the underline below the text */
        width: 100%;
        height: 6px; /* Thickness of the underline */
        background: url("https://your-github-url/hand-drawn-underline.png") repeat-x;
        background-size: contain;
    }
</style>
<script>
    const sheetUrl = "${csvUrl}";

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\\n").map(row => row.split(","));
            const container = document.getElementById("fucketlist-container");

            const list = document.createElement("ul");
            list.style.listStyle = "none";
            list.style.padding = "0";
            list.style.margin = "20px auto";
            list.style.fontFamily = "adobe-handwriting-tiffany, sans-serif";
            list.style.maxWidth = "800px";

            rows.slice(1).forEach(([title, status]) => {
                if (!title) return;

                const li = document.createElement("li");
                li.classList.add("fucketlist-item");

                const dotSpan = document.createElement("span");
                dotSpan.classList.add("fucketlist-dot");

                const titleSpan = document.createElement("span");
                titleSpan.classList.add("fucketlist-title");

                if (status.toLowerCase().trim() === "in progress") {
                    dotSpan.classList.add("blue");
                    li.appendChild(dotSpan);
                } else if (status.toLowerCase().trim() === "initiated") {
                    dotSpan.classList.add("yellow");
                    li.appendChild(dotSpan);
                } else if (status.toLowerCase().trim() === "help needed") {
                    titleSpan.classList.add("red");
                } else if (status.toLowerCase().trim() === "completed") {
                    titleSpan.style.textDecoration = "line-through";
                }

                titleSpan.textContent = title;
                li.appendChild(titleSpan);
                list.appendChild(li);
            });

            container.innerHTML = ""; // Clear previous content
            container.appendChild(list);
        })
        .catch(error => {
            console.error("Error loading Fucketlist:", error);
        });
</script>
`;

    // Update the live preview
    previewContainer.innerHTML = embedCode;

    // Store the embed code for copying
    outputArea.value = embedCode;
};

window.copyToClipboard = function () {
    const outputArea = document.getElementById("embedCode");
    if (!outputArea.value) {
        alert("There is nothing to copy!");
        return;
    }

    navigator.clipboard.writeText(outputArea.value)
        .then(() => {
            alert("Embed code copied to clipboard!");
        })
        .catch((err) => {
            console.error("Failed to copy: ", err);
            alert("Failed to copy the embed code. Please try again.");
        });
};
