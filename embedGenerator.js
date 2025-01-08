document.getElementById("generateCode").addEventListener("click", () => {
    const sheetUrl = document.getElementById("sheetUrl").value.trim();
    const viewType = document.querySelector('input[name="viewType"]:checked').value;
    const embedCode = generateEmbedCode(sheetUrl, viewType);

    // Populate output area
    document.getElementById("outputArea").value = embedCode;

    // Clear and set up preview
    const previewArea = document.getElementById("previewArea");
    previewArea.innerHTML = ""; // Clear previous preview content

    // Create a container for the preview content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = embedCode;

    // Add container to preview
    const container = tempDiv.querySelector("#fucketlist-container");
    previewArea.appendChild(container);

    // Add <style>
    const styleElement = tempDiv.querySelector("style");
    if (styleElement) {
        const newStyle = document.createElement("style");
        newStyle.textContent = styleElement.textContent;
        previewArea.appendChild(newStyle); // Attach style to the preview area
    }

    // Add <script> wrapped in an IIFE to avoid variable redeclaration
    const scriptElement = tempDiv.querySelector("script");
    if (scriptElement) {
        const newScript = document.createElement("script");
        newScript.textContent = `
            (() => {
                ${scriptElement.textContent}
            })();
        `;
        previewArea.appendChild(newScript); // Attach script to the preview area
    }
});

document.getElementById("copyToClipboard").addEventListener("click", () => {
    const outputArea = document.getElementById("outputArea");
    outputArea.select();
    document.execCommand("copy");
    alert("Embed code copied to clipboard!");
});

const viewTypeRadios = document.querySelectorAll('input[name="viewType"]');
viewTypeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
        // Reset generated code and preview on view type switch
        document.getElementById("outputArea").value = "";
        document.getElementById("previewArea").innerHTML = ""; // Clear preview
    });
});


function generateEmbedCode(sheetUrl, viewType) {
    return `
        <div id="fucketlist-container"></div>
        <link rel="stylesheet" href="https://use.typekit.net/vdp2gno.css">
        <style>
            #fucketlist-container {
                background-color: #fff; /* Light beige paper-like background */
                background-image: radial-gradient(circle, rgba(255, 255, 255, 0.4), rgba(0, 0, 0, 0.05)), url('https://www.transparenttextures.com/patterns/linen.png');
                background-blend-mode: overlay;
                border: 1px solid #d3d3d3;
                box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.06);
                padding: 20px;
                border-radius: 10px;
                min-width: 260px;
                margin: 20px 20px;
                font-family: 'adobe-handwriting-tiffany', sans-serif;
            }
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
                        <span style="display: inline-block; width: 10px; height: 10px; background-color: orange; border-radius: 50%;"></span> Started  
                        <span style="display: inline-block; width: 10px; height: 10px; background-color: #00b2ff; border-radius: 50%; margin-left: 15px;"></span> Making Progress
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
                                    status.toLowerCase().trim() === "started" ? "orange" :
                                    status.toLowerCase().trim() === "making progress" ? "#00b2ff" :
                                    status.toLowerCase().trim() === "help needed" ? "black" : "black";
                                li.appendChild(dotSpan);
                            } else {
                                const numberSpan = document.createElement("span");
                                numberSpan.className = "fucketlist-number";
                                numberSpan.textContent = \`\${sortedNumberRows[index][0]}.\`;
                                numberSpan.style.color =
                                    status.toLowerCase().trim() === "started" ? "orange" :
                                    status.toLowerCase().trim() === "making progress" ? "#00b2ff" :
                                    status.toLowerCase().trim() === "help needed" ? "black" : "black";
                                li.appendChild(numberSpan);
                            }

                            const titleSpan = document.createElement("span");
                            titleSpan.className = "fucketlist-title";
                            titleSpan.textContent = title;
                            if (status.toLowerCase().trim() === "hidden") {
                                titleSpan.textContent = "To be revealed soon";
                                titleSpan.classList.add("hidden");
                            } else if (status.toLowerCase().trim() === "completed") {
                                titleSpan.style.textDecoration = "line-through";
                            } else if (status.toLowerCase().trim() === "help needed") {
                                titleSpan.classList.add("help-needed");
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
