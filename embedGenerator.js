window.generateEmbedCode = function () {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const outputArea = document.getElementById("embedCode");

    // Validate the URL
    if (!sheetUrl.includes("https://docs.google.com/spreadsheets/")) {
        alert("Please enter a valid Google Sheet URL.");
        outputArea.value = "";
        return;
    }

    // Convert the URL to CSV format
    const csvUrl = sheetUrl.replace(/\/edit.*/, "/pub?output=csv");

    // Generate the HTML code
    const embedCode = `
<div id="fucketlist-container"></div>
<script>
    const sheetUrl = "${csvUrl}";

    // CSV parsing function that handles quoted fields and preserves titles with commas
    function parseCSV(csvText) {
        const rows = [];
        const lines = csvText.split("\n");
        for (const line of lines) {
            const matches = line.match(/("(?:[^"]|"")*"|[^",]+)(?=,|$)/g); // Match quoted and unquoted fields
            if (matches) {
                rows.push(matches.map(field => field.replace(/^"|"$/g, "").trim())); // Remove surrounding quotes and trim spaces
            }
        }
        return rows;
    }

    // Fetch Google Sheet data
    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            const container = document.getElementById("fucketlist-container");

            // Add legend
            const legend = document.createElement("div");
            legend.style.marginBottom = "20px";
            legend.style.fontFamily = "Helvetica, Arial, sans-serif";
            legend.innerHTML = "
                <strong>Legend:</strong>
                <span style="display: inline-block; width: 10px; height: 10px; background-color: orange; border-radius: 50%; margin-right: 5px;"></span> Initiated
                <span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 50%; margin-right: 5px;"></span> Help Needed
                <span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 50%; margin-right: 5px;"></span> In Progress
                <span style="text-decoration: line-through; margin-left: 15px;">Completed</span>
            ";
            container.appendChild(legend);

            // Build HTML
            const list = document.createElement("ul");
            list.style.listStyle = "none";
            list.style.padding = "0";
            list.style.margin = "20px auto";
            list.style.display = "grid";
            list.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))"; // Dynamic columns
            list.style.gap = "20px";
            list.style.maxWidth = "1000px";
            list.style.fontFamily = "Helvetica, Arial, sans-serif";

            rows.slice(1).forEach(([title, status]) => {
                if (!title) return; // Skip empty rows

                const li = document.createElement("li");
                li.style.backgroundColor = "#fff";
                li.style.borderRadius = "5px";
                li.style.padding = "10px 15px";
                li.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.alignItems = "center";

                const titleSpan = document.createElement("span");
                if (status.toLowerCase().trim() === "completed") {
                    titleSpan.style.textDecoration = "line-through";
                }
                titleSpan.textContent = title;

                const dotSpan = document.createElement("span");
                if (status.toLowerCase().trim() === "initiated") {
                    dotSpan.style.backgroundColor = "orange";
                } else if (status.toLowerCase().trim() === "help needed") {
                    dotSpan.style.backgroundColor = "red";
                } else if (status.toLowerCase().trim() === "in progress") {
                    dotSpan.style.backgroundColor = "blue";
                }
                dotSpan.style.height = "10px";
                dotSpan.style.width = "10px";
                dotSpan.style.borderRadius = "50%";
                dotSpan.style.display = status.toLowerCase().trim() === "default" || status.toLowerCase().trim() === "completed" ? "none" : "inline-block";

                li.appendChild(titleSpan);
                li.appendChild(dotSpan);
                list.appendChild(li);
            });

            // Add a hidden placeholder to fix uneven rows
            const placeholder = document.createElement("li");
            placeholder.style.flex = "1 1 calc(33.333% - 20px)";
            placeholder.style.visibility = "hidden";
            list.appendChild(placeholder);

            container.appendChild(list);
        })
        .catch(error => {
            console.error("Error loading Fucketlist:", error);
            const container = document.getElementById("fucketlist-container");
            container.textContent = "Failed to load Fucketlist.";
        });
</script>`;
    outputArea.value = embedCode;
};

window.copyToClipboard = function () {
    const outputArea = document.getElementById("embedCode");
    outputArea.select();
    document.execCommand("copy");
    alert("Embed code copied to clipboard!");
};
