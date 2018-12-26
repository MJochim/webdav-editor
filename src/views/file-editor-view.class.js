// Monaco
import "../monaco-editor";
import * as marked from "marked";
import * as monaco from "monaco-editor";
import * as editor from "monaco-editor/esm/vs/editor/editor.main";

// SimpleMDE
import "simplemde/dist/simplemde.min.css";
import * as SimpleMDE from "simplemde";

const htmlTemplate = `
<style>
#container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
}

.main-menu {
    background-color: #ec5b23;
    padding: 16px;
    margin: 0;
    display: flex;
    flex-direction: row;
}

.main-menu button {
    padding: 5px 20px;
    margin: 0 10px;
    border: 0;
    background-color: #FFFFFF40;
    font-size: 1em;
}

.main-menu button:hover {
    background-color: #FFFFFFA0;
}

.main-menu #filename {
    flex-grow: 1;
    text-align: right;
    align-self: center;
}

a {
    color: #ec5b23;
    cursor: pointer;
}

.editor {
    flex-basis: 100%;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: stretch;
}

.editor .editor-toolbar {
}

.editor .CodeMirror {
    flex-basis: 100%;
}

.editor .editor-statusbar {
}

</style>

<div class="main-menu">
    <button id="close">╳ Close file</button>
    <button id="reload">↺ Reload file</button>
    <button id="save">💾 Save file</button>
    <span id="filename"></span>
</div>

<div class="editor">
</div>
`;

export class FileEditorView extends EventTarget {
    constructor(container, webdavClient, filename) {
        super();

        this.rootDirectoryName = "Junge Sprachwissenschaft";

        this.container = container;
        this.webdavClient = webdavClient;
        this.filename = filename;
        this.fileContents = "";

        this.fileEditor = null;
        this.editorType = "";

        this.update();
    }

    async getCurrentEditorValue() {
        switch (this.editorType) {
            case "monaco":
                return this.fileEditor.getValue();
            case "simple-mde":
                return this.fileEditor.value();
        }
    }

    setEditorValue(value) {
        switch (this.editorType) {
            case "monaco":
                this.fileEditor.setValue(value);
                break;
            case "simple-mde":
                this.fileEditor.value(value);
                break;
        }
    }

    async loadFile() {
        this.fileContents = await this.webdavClient.getFileContents(this.filename, {format: "text"});
    }

    async update() {
        this.container.innerHTML = htmlTemplate;

        const mainMenu = this.container.querySelector(".main-menu");
        
        const fileNameIndicator = mainMenu.querySelector("#filename");
        fileNameIndicator.innerText = this.filename.split("/").slice(-1);
        fileNameIndicator.title = this.filename;

        const closeButton = mainMenu.querySelector("#close");
        closeButton.addEventListener("click", () => {
            this.dispatchEvent(new CustomEvent("closeFile", { detail: {

            }}));
        });

        const reloadButton = mainMenu.querySelector("#reload");
        reloadButton.addEventListener("click", async () => {
            await this.loadFile();
            this.setEditorValue(this.fileContents);
        });

        const saveButton = mainMenu.querySelector("#save");
        saveButton.addEventListener("click", async () => {
            const newFileContents = await this.getCurrentEditorValue();
            try {
                await this.webdavClient.putFileContents(this.filename, newFileContents);
                alert("Successfully written");
            } catch (error) {
                alert ("Error while writing the file. Please see browser console for details and contact the administrator.");
                console.log("Error while writing", this.filename, error);
            }
        });

        await this.loadFile();

        if (this.filename.toLowerCase().endsWith(".md")) {
            this.createSimpleMDE();
        } else {
            this.createMonacoEditor();
        }

    }

    async createSimpleMDE() {
        this.editorType = "simple-mde";

        const editorArea = document.createElement("textarea");
        
        this.container.querySelector(".editor").appendChild(editorArea);

        this.fileEditor = new SimpleMDE({
            element: editorArea,
            spellChecker: false,
        });

        this.setEditorValue(this.fileContents);
    }

    static getFileExtension(filename) {
        const separatorIndex = filename.lastIndexOf(".");
        if (separatorIndex === -1) {
            return "";
        } else {
            return filename.substring(separatorIndex + 1).toLowerCase();
        }
    }

    static fileExtensionToMonacoLanguage(filename) {
        const fileExtension = FileEditorView.getFileExtension(filename);
        
        switch(fileExtension) {
            case "html":
            case "r":
            case "xml":
            case "css":
            case "scss":
            case "less":
                return fileExtension;

            case "yml":
                return "yaml";

            case "ts":
                return "typescript";

            case "py":
                return "python";

            case "md":
                return "markdown";
        }
    }

    async createMonacoEditor() {
        this.editorType = "monaco";

        const editorArea = this.container.querySelector(".editor");
        this.fileEditor = monaco.editor.create(editorArea, {
            language: FileEditorView.fileExtensionToMonacoLanguage(this.filename),
            minimap: {
                enabled: false,
            },
            rulers: [],
            wordWrap: "on",
            wrappingIndent: "same",
        });

        this.setEditorValue(this.fileContents);
    }
}
