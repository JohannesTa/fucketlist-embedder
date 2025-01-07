function generateEmbedCode(sheetUrl, viewType) {
    if (!sheetUrl) {
        alert("Please provide a valid Google Sheets URL.");
        return '';
    }

    const sharedStyles = `
<link rel="stylesheet" href="https://use.typekit.net/vdp2gno.css">
<style>
    .fucketlist-title {
        font-size: 1.2em;
        line-height: 1.4;
        position: relative;
    }

    .fucketlist-title.hidden {
        position: relative;
        text-align: center;
        overflow: hidden;
        background-image: url('https://johannesta.github.io/fucketlist-embedder/scratch-effect.svg');
        background-repeat: repeat-x;
        background-size: cover;
        cursor: default;
    }

    .fucketlist-title.hidden:hover {
        background-image: none;
        color: grey;
    }

    .fucketlist-title.help-needed {
        color: black;
    }

    .fucketlist-title.help-needed::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 4px;
        background-image: url('https://johannesta.github.io/fucketlist-embedder/underline.png');
        background-repeat: repeat-x;
        background-size: 100% 4px;
    }

    .fucketlist-legend {
        margin-bottom: 20px;
        font-family: 'adobe-handwriting-tiffany', sans-serif;
        font-weight: 400;
        font-style: normal;
        font-size: 1.2em;
        display: inline-block;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
    }

    .fucketlist-list {
        list-style: none;
        padding: 0;
        margin: 20px auto;
        display: grid;
        gap: 20px;
        max-width: 1000px;
        font-family: 'adobe-handwriting-tiffany', sans-serif;
        font-weight: 800;
        font-style: normal;
    }

    .fucketlist-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    ${viewType === "dots" ? `
    .fucketlist-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        margin-top: 4px;
    }
    ` : `
    .fucketlist-number {
        font-weight: bold;
        font-size: 1.2em;
        flex-shrink: 0;
    }
    `}
</style>
`;

    const script = `
<script>
    const sheetUrl = "${sheetUrl}";

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

    function sortItemsByColumn(rows, numColumns) {
        const itemsPerColumn = Math.ceil(rows.length / numColumns);
        const sorted = Array.from({ length: numColumns }, () => []);

        rows.forEach((row, index) => {
            const colIndex = Math.floor(index / itemsPerColumn);
            sorted[colIndex].push(row);
        });

        return sorted.flat();
    }

    fetch(sheetUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = parseCSV(csvText).slice(1);
            const container = document.getElementById("fucketlist-container");

            const legend = document.createElement("div");
            legend.className = "fucketlist-legend";
            legend.innerHTML = \`
                <span style="display: inline-block; width: 10px; height: 10px; background-color: orange; border-radius: 50%;"></span> Initiated  
                <span style="display: inline-block; width: 10px; height: 10px; background-color: #00b2ff; border-radius: 50%; margin-left: 15px;"></span> In Progress
                <span style="color: black; text-decoration: underline; text-decoration-color: red; margin-left: 15px;">Help Needed</span>
                <span style="text-decoration: line-through; margin-left: 15px;">Completed</span>
            \`;
            container.appendChild(legend);

            const determineColumns = () => {
                const width = window.innerWidth;
                if (width > 1400) return 4;
                if (width > 1000) return 3;
                if (width > 600) return 2;
                return 1;
            };

            const renderList = () => {
                const numColumns = determineColumns();
                const sortedRows = sortItemsByColumn(rows, numColumns);

                const list = document.createElement("ul");
                list.className = "fucketlist-list";
                list.style.gridTemplateColumns = \`repeat(\${numColumns}, 1fr)\`;

                sortedRows.forEach(([title, status], index) => {
                    if (!title) return;

                    const li = document.createElement("li");
                    li.className = "fucketlist-item";

                    if ("${viewType}" === "dots") {
                        const dotSpan = document.createElement("span");
                        dotSpan.className = "fucketlist-dot";
                        dotSpan.style.backgroundColor = status.toLowerCase().trim() === "completed" ? "black" : status.toLowerCase().trim() === "initiated" ? "orange" : "#00b2ff";
                        li.appendChild(dotSpan);
                    } else {
                        const numberSpan = document.createElement("span");
                        numberSpan.className = "fucketlist-number";
                        numberSpan.style.color = status.toLowerCase().trim() === "completed" ? "black" : status.toLowerCase().trim() === "initiated" ? "orange" : "#00b2ff";
                        numberSpan.textContent = \`\${index + 1}.\`;
                        li.appendChild(numberSpan);
                    }

                    const titleSpan = document.createElement("span");
                    titleSpan.className = "fucketlist-title";
                    titleSpan.textContent = title;

                    if (status.toLowerCase().trim() === "hidden") {
                        titleSpan.className = "fucketlist-title hidden";
                        titleSpan.textContent = "To be revealed soon";
                    } else if (status.toLowerCase().trim() === "help needed") {
                        titleSpan.classList.add("help-needed");
                    } else if (status.toLowerCase().trim() === "completed") {
                        titleSpan.style.textDecoration = "line-through";
                    }

                    li.appendChild(titleSpan);
                    list.appendChild(li);
                });

                const existingList = container.querySelector(".fucketlist-list");
                if (existingList) existingList.remove();
                container.appendChild(list);
            };

            renderList();
            window.addEventListener("resize", renderList);
        })
        .catch(error => {
            console.error("Error loading Fucketlist:", error);
            const container = document.getElementById("fucketlist-container");
            container.textContent = "Failed to load Fucketlist.";
        });
</script>
`;

    return `<div id="fucketlist-container"></div>${sharedStyles}${script}`;
}

document.getElementById("generateCode").addEventListener("click", () => {
    const sheetUrl = document.getElementById("sheetUrl").value;
    const viewType = document.getElementById("viewType").value;
    const embedCode = generateEmbedCode(sheetUrl, viewType);

    document.getElementById("outputArea").value = embedCode;
    document.getElementById("previewArea").innerHTML = embedCode;
});

document.getElementById("copyToClipboard").addEventListener("click", () => {
    const outputArea = document.getElementById("outputArea");
    outputArea.select();
    document.execCommand("copy");
    alert("Embed code copied to clipboard!");
});
