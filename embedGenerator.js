window.generateEmbedCode = function () {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const outputArea = document.getElementById("embedCode");

    if (!sheetUrl.includes("https://docs.google.com/spreadsheets/")) {
        alert("Please enter a valid Google Sheet URL.");
        outputArea.value = "";
        return;
    }

    const csvUrl = sheetUrl.replace(/\/edit.*/, "/pub?output=csv");

    const embedCode = `
<div id="fucketlist-container"></div>
<script>
    const sheetUrl = "${csvUrl}";

    function parseCSV(csvText) {
        const rows = [];
        const lines = csvText.split("\\n");
        for (const line of lines) {
            const matches = line.match(/("(?:[^"]|"")*"|[^",]+)(?=,|$)/g);
            if (matches) {
                rows.push(matches.map(field => field.replace(/^"|"$/g, "").trim()));
            }
        }
        return rows;
    }

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            const container = document.getElementById("fucketlist-container");

            // Add legend without the word "Legend"
            const legend = document.createElement("div");
            legend.style.marginBottom = "20px";
            legend.style.fontFamily = "Helvetica, Arial, sans-serif";
            legend.innerHTML = \`
                <span style="display: inline-block; width: 10px; height: 10px; background-color: orange; border-radius: 50%;"></span> Initiated  
                <span style="display: inline-block; width: 10px; height: 10px; background-color: red; border-radius: 50%; margin-left: 15px;"></span> Help Needed
                <span style="display: inline-block; width: 10px; height: 10px; background-color: blue; border-radius: 50%; margin-left: 15px;"></span> In Progress
                <span style="text-decoration: line-through; margin-left: 15px;">Completed</span>
            \`;
            container.appendChild(legend);

            // Build HTML for the list
            const list = document.createElement("ul");
            list.style.listStyle = "none";
            list.style.padding = "0";
            list.style.margin = "20px auto";
            list.style.display = "grid";
            list.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
            list.style.gap = "20px";
            list.style.maxWidth = "1000px";
            list.style.fontFamily = "Helvetica, Arial, sans-serif";

            rows.slice(1).forEach(([title, status]) => {
                if (!title) return;

                const li = document.createElement("li");
                li.style.backgroundColor = "#fff";
                li.style.borderRadius = "5px";
                li.style.padding = "10px 15px";
                li.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.alignItems = "center";
                li.style.fontFamily = "Helvetica, Arial, sans-serif";

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
