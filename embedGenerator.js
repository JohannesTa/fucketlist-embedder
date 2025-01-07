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
    #fucketlist-container {
        font-family: "adobe-handwriting-tiffany", sans-serif;
        max-width: 1000px;
        margin: 0 auto;
    }
    .fucketlist-legend {
        margin-bottom: 20px;
        font-family: "adobe-handwriting-tiffany", sans-serif;
        font-weight: 400;
        font-style: normal;
    }
    .fucketlist-legend span {
        display: inline-block;
        vertical-align: middle;
        margin-right: 10px;
    }
    .fucketlist-legend .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }
    .fucketlist-legend .yellow { background-color: yellow; }
    .fucketlist-legend .red { border-bottom: 2px solid red; }
    .fucketlist-legend .blue { background-color: blue; }
    .fucketlist-legend .completed { text-decoration: line-through; }
    ul.fucketlist-items {
        list-style: none;
        padding: 0;
        margin: 20px auto;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
    }
    .fucketlist-item {
        display: flex;
        align-items: center;
        background-color: #fff;
        border-radius: 5px;
        padding: 10px 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .fucketlist-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        margin-right: 10px;
    }
    .fucketlist-dot.blue { background-color: blue; }
    .fucketlist-dot.yellow { background-color: yellow; }
    .fucketlist-title {
        font-size: 1.2em;
        position: relative;
        font-family: "adobe-handwriting-tiffany", sans-serif;
    }
    .fucketlist-title.red {
        position: relative;
    }
    .fucketlist-title.red::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: -2px; /* Position underline below text */
        width: 100%; /* Stretch underline across text */
        height: 4px; /* Thickness of underline */
        background: url("https://raw.githubusercontent.com/your-username/your-repository/main/hand-drawn-underline.png") no-repeat;
        background-size: 100% 100%; /* Stretch the underline image */
    }
    .fucketlist-title.completed { text-decoration: line-through; }
</style>
<script>
    const sheetUrl = "${csvUrl}";

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\\n").map(row => row.split(","));
            const container = document.getElementById("fucketlist-container");

            // Create legend
            const legend = document.createElement("div");
            legend.className = "fucketlist-legend";
            legend.innerHTML = \`
                <span class="dot yellow"></span> Initiated
                <span class="dot blue"></span> In Progress
                <span class="dot red"></span> Help Needed
                <span class="completed">Completed</span>
            \`;
            container.appendChild(legend);

            // Create list
            const list = document.createElement("ul");
            list.className = "fucketlist-items";

            rows.slice(1).forEach(([title, status]) => {
                if (!title) return;

                const li = document.createElement("li");
                li.className = "fucketlist-item";

                const dotSpan = document.createElement("span");
                dotSpan.className = "fucketlist-dot";

                const titleSpan = document.createElement("span");
                titleSpan.className = "fucketlist-title";

                if (status.toLowerCase().trim() === "in progress") {
                    dotSpan.classList.add("blue");
                    li.appendChild(dotSpan);
                } else if (status.toLowerCase().trim() === "initiated") {
                    dotSpan.classList.add("yellow");
                    li.appendChild(dotSpan);
                } else if (status.toLowerCase().trim() === "help needed") {
                    titleSpan.classList.add("red");
                } else if (status.toLowerCase().trim() === "completed") {
                    titleSpan.classList.add("completed");
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
