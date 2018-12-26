const editableFileExtensions = [
    "",
    "md",
    "txt",
    "tex",
    "html",
    "yml",
    "py",
    "ts",
    "css",
    "scss",
    "less",
    "r",
    "xml",
];

const htmlTemplate = `
<style>
#container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
}

.breadcrumbs {
    background-color: #ec5b23;
    padding: 16px;
    margin: 0 0 20px 0;
}

.breadcrumbs a {
    color: black;
}

.breadcrumbs span {
    display: inline-block;
    margin: 0 10px;
}

.table-container {
    width: 100%;
    flex-basis: 100%;
    overflow: auto;
}

table.file-list {
    border-collapse: collapse;
    width: 100%;
}

table.file-list td,
table.file-list th {
    text-align: left;
    border-bottom: 1px solid darkgrey;
    margin: 0;
    padding: 10px;
}

table.file-list tr:hover  td {
    background-color: lightgrey;
}

table.file-list td.type {
    text-align: center;
    width: 4ch;
}


a {
    color: #ec5b23;
    cursor: pointer;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
</style>

<p class="breadcrumbs"></p>
<div class="table-container">
    <table class="file-list">
    <tr>
    <th>Type</th>
    <th>Name</th>
    <th>Size</th>
    <th>Last modified</th>
    </tr>
    </table>
</div>
`;

export class FileListView extends EventTarget {
    constructor(container, webdavClient) {
        super();

        this.rootDirectoryName = "Junge Sprachwissenschaft";

        this.container = container;
        this.webdavClient = webdavClient;
        this.directory = "/";

        this.update();
    }

    static getFileExtension(filename) {
        const separatorIndex = filename.lastIndexOf(".");
        if (separatorIndex === -1) {
            return "";
        } else {
            return filename.substring(separatorIndex + 1).toLowerCase();
        }
    }

    static humanReadableFileSize(bytes) {
        if (bytes >= 1024**3) {
            const gibibytes = bytes / 1024**3;
            return Math.round (gibibytes * 10) / 10 + " GiB";
        } else if (bytes >= 1024**2) {
            const mebibytes = bytes / 1024**2;
            return Math.round (mebibytes * 10) / 10 + " MiB";
        } else if (bytes >= 1024) {
            const kibibytes = bytes / 1024;
            return Math.round (kibibytes * 10) / 10 + " KiB";
        } else {
            return bytes + " B";
        }
    }

    async update() {
        const files = await this.webdavClient.getDirectoryContents(this.directory);
        this.container.innerHTML = htmlTemplate;

        const breadcrumbs = this.container.querySelector(".breadcrumbs");
        const directories = this.directory.split("/").map(x => { return {name: x, isRoot: false}});
        directories[0].name = this.rootDirectoryName;
        directories[0].isRoot = true;

        let cumulativePath = "";

        for (const directory of directories) {
            let path;

            if (directory.isRoot) {
                path = "/";
            } else {
                cumulativePath += "/" + directory.name;
                path = cumulativePath;

                const separator = document.createElement("span");
                separator.innerText = "/";
                breadcrumbs.appendChild(separator);
            }

            const item = document.createElement("span");
            const link = document.createElement("a");
            link.innerText = directory.name;
            link.addEventListener("click", () => {
                this.directory = path;
                this.update();
            });
            item.appendChild(link);

            breadcrumbs.appendChild(item);
        }

        const list = this.container.querySelector("table");

        for (const file of files) {
            const fileExtension = FileListView.getFileExtension(file.basename);

            const row = document.createElement("tr");

            const typeCell = document.createElement("td");
            typeCell.classList.add("type");

            if (file.type === "directory") {
                typeCell.innerText = "📁";
            } else if (editableFileExtensions.includes(fileExtension)) {
                // typeCell.innerText = "✓";
                //typeCell.innerText = "Aa";
                typeCell.innerText = "✎";
            } else {
                typeCell.innerText = "↓";
            }
            row.appendChild(typeCell);

            const nameCell = document.createElement("td");
            const link = document.createElement("a");
            link.innerText = file.basename;

            if (file.type === "file" && !editableFileExtensions.includes(fileExtension)) {
                const data = await this.webdavClient.getFileContents(file.filename, {format: "binary"});
                const blob = new File([data], file.basename);
                const blobUrl = URL.createObjectURL(blob);
                link.href = blobUrl;
                link.target = "_blank";
            } else {
                link.addEventListener("click", async () => {
                    if (file.type === "directory") {
                        this.directory = file.filename;
                        this.update();
                    } else {
                        this.dispatchEvent(new CustomEvent("editFile", {detail: {
                            filename: file.filename
                        }}));
                    }
                });
            }
            nameCell.append(link);
            row.appendChild(nameCell);

            const sizeCell = document.createElement("td");
            if (file.type === "file") {
                sizeCell.title = file.size + " bytes";
                sizeCell.innerText = FileListView.humanReadableFileSize(file.size);
            }
            row.appendChild(sizeCell);

            const dateCell = document.createElement("td");
            if (file.lastmod) {
                dateCell.innerText = file.lastmod;
            }
            row.appendChild(dateCell);

            list.appendChild(row);
        }
    }
}
