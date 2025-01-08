document.getElementById("generateCode").addEventListener("click", () => {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const viewType = document.getElementById("viewType").value;
    const embedCode = generateEmbedCode(sheetUrl, viewType);

    // Populate output and preview areas
    document.getElementById("outputArea").value = embedCode;
    document.getElementById("previewArea").innerHTML = embedCode;
});

document.getElementById("copyToClipboard").addEventListener("click", () => {
    const outputArea = document.getElementById("outputArea");
    outputArea.select();
    document.execCommand("copy");
    alert("Embed code copied to clipboard!");
});

function generateEmbedCode(sheetUrl, viewType) {
    return `
        <div id="fucketlist-container"></div>
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
            .fucketlist-number {
                font-weight: bold;
                font-size: 1.2em;
                flex-shrink: 0;
            }
            .fucketlist-dot {
                display: inline-block;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                flex-shrink: 0;
                margin-top: 4px;
            }
        </style>
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
                const sorted = [];

                for (let i = 0; i < itemsPerColumn; i++) {
                    for (let col = 0; col < numColumns; col++) {
                        const index = col * itemsPerColumn + i;
                        if (index < rows.length) {
                            sorted.push(rows[index]);
                        }
                    }
                }

                return sorted;
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

                        const sortedNumbers = Array.from({ length: rows.length }, (_, i) => i + 1);
                        const sortedNumberRows = sortItemsByColumn(sortedNumbers.map(n => [n.toString()]), numColumns);

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
                                dotSpan.style.backgroundColor =
                                    status === "initiated" ? "orange" :
                                    status === "in progress" ? "#00b2ff" :
                                    status === "help needed" ? "black" : "black";
                                li.appendChild(dotSpan);
                            } else {
                                const numberSpan = document.createElement("span");
                                numberSpan.className = "fucketlist-number";
                                numberSpan.textContent = \`\${sortedNumberRows[index][0]}.\`;
                                numberSpan.style.color =
                                    status === "initiated" ? "orange" :
                                    status === "in progress" ? "#00b2ff" :
                                    status === "help needed" ? "black" : "black";
                                li.appendChild(numberSpan);
                            }

                            const titleSpan = document.createElement("span");
                            titleSpan.className = "fucketlist-title";
                            titleSpan.textContent = title;
                            if (status === "hidden") {
                                titleSpan.textContent = "To be revealed soon";
                                titleSpan.classList.add("hidden");
                            } else if (status === "completed") {
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
                .catch(() => {
                    const container = document.getElementById("fucketlist-container");
                    container.textContent = "Failed to load Fucketlist.";
                });
        </script>`;
}
