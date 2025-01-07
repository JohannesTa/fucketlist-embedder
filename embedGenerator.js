document.addEventListener("DOMContentLoaded", function () {
    const previewArea = document.getElementById("fucketlist-preview");
    const embedCodeArea = document.getElementById("embedCode");
    const generateButton = document.getElementById("generateEmbedCode");
    const viewSwitcher = document.getElementById("viewSwitcher");
    const sheetUrlInput = document.getElementById("sheetUrl");
    const copyButton = document.getElementById("copyCode");

    function generateEmbedCode(viewType, sheetUrl) {
        let embedCode = `
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
                transition: background-image 0.3s ease;
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
            }` : `
            .fucketlist-number {
                font-weight: bold;
                font-size: 1.2em;
                flex-shrink: 0;
            }`}
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
                    const rows = parseCSV(csvText).slice(1); // Skip the header row
                    const container = document.getElementById("fucketlist-container");

                    // Add legend
                    const legend = document.createElement("div");
                    legend.className = "fucketlist-legend";
                    legend.innerHTML = \`
                        <span style="display: inline-block; width: 10px; height: 10px; background-color: orange; border-radius: 50%;"></span> Initiated  
                        <span style="display: inline-block; width: 10px; height: 10px; background-color: #00b2ff; border-radius: 50%; margin-left: 15px;"></span> In Progress
                        <span style="color: black; text-decoration: underline; text-decoration-color: red; margin-left: 15px;">Help Needed</span>
                        <span style="text-decoration: line-through; margin-left: 15px;">Completed</span>
                    \`;
                    container.appendChild(legend);

                    // Determine the number of columns based on screen width
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

                        // Create list
                        const list = document.createElement("ul");
                        list.className = "fucketlist-list";
                        list.style.gridTemplateColumns = \`repeat(\${numColumns}, 1fr)\`;

                        sortedRows.forEach(([title, status], index) => {
                            if (!title) return;

                            const li = document.createElement("li");
                            li.className = "fucketlist-item";

                            if (viewType === "dots") {
                                const dotSpan = document.createElement("span");
                                dotSpan.className = "fucketlist-dot";
                                li.appendChild(dotSpan);
                            } else {
                                const numberSpan = document.createElement("span");
                                numberSpan.className = "fucketlist-number";
                                numberSpan.textContent = \`\${index + 1}.\`;
                                li.appendChild(numberSpan);
                            }

                            const titleSpan = document.createElement("span");
                            titleSpan.className = "fucketlist-title";
                            titleSpan.textContent = title;
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
        return embedCode;
    }

    function updatePreview() {
        const viewType = viewSwitcher.value;
        const sheetUrl = sheetUrlInput.value.trim();
        if (!sheetUrl) return;

        const embedCode = generateEmbedCode(viewType, sheetUrl);
        previewArea.innerHTML = embedCode;
    }

    generateButton.addEventListener("click", function () {
        const viewType = viewSwitcher.value;
        const sheetUrl = sheetUrlInput.value.trim();
        if (!sheetUrl) {
            alert("Please enter a valid Google Sheet URL!");
            return;
        }

        const embedCode = generateEmbedCode(viewType, sheetUrl);
        embedCodeArea.value = embedCode;
        alert("Embed code generated successfully!");
    });

    copyButton.addEventListener("click", function () {
        embedCodeArea.select();
        document.execCommand("copy");
        alert("Embed code copied to clipboard!");
    });

    viewSwitcher.addEventListener("change", updatePreview);
    sheetUrlInput.addEventListener("input", updatePreview);
});
