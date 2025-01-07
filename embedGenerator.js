function generateEmbedCode() {
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

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split("\\n").map(row => row.split(","));
            const container = document.getElementById('fucketlist-container');

            const list = document.createElement('ul');
            list.style.listStyle = "none";
            list.style.padding = "0";
            list.style.margin = "20px auto";
            list.style.display = "grid";
            list.style.gridTemplateColumns = "repeat(auto-fit, minmax(300px, 1fr))";
            list.style.gap = "20px";
            list.style.maxWidth = "1000px";

            rows.slice(1).forEach(([title, status]) => {
                if (!title) return;

                const li = document.createElement('li');
                li.style.backgroundColor = "#f9f9f9";
                li.style.borderRadius = "5px";
                li.style.padding = "10px 15px";
                li.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                li.style.display = "flex";
                li.style.justifyContent = "space-between";
                li.style.alignItems = "center";

                const titleSpan = document.createElement('span');
                if (status.toLowerCase().trim() === "completed") {
                    titleSpan.style.textDecoration = "line-through";
                }
                titleSpan.textContent = title;

                const dotSpan = document.createElement('span');
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
            console.error("Error loading data:", error);
        });
</script>`;
    outputArea.value = embedCode;
}

function copyToClipboard() {
    const outputArea = document.getElementById("embedCode");
    outputArea.select();
    document.execCommand("copy");
    alert("Embed code copied to clipboard!");
}
