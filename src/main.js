import "./style.scss";

import {createClient} from "webdav";

import {FileEditorView} from "./views/file-editor-view.class";
import {FileListView} from "./views/file-list-view.class";
import {LoginView} from "./views/login-view.class";
import config from "./config.json";

async function testCredentials (webdavClient) {
    try {
        const statRootDirectory = await webdavClient.stat("/");
        return true;
    } catch (error) {
        return false;
    }
}

async function attemptLogin(event) {
    const webdavClient = createClient(config.webdavUrl, {
        username: event.detail.username,
        password: event.detail.password,
    });

    if (await testCredentials(webdavClient)) {
        const fileListView = new FileListView(container, webdavClient, config.rootDirectoryName);

        fileListView.addEventListener("editFile", (event) => {
            const fileEditorView = new FileEditorView(container, webdavClient, event.detail.filename, config.rootDirectoryName);
            fileEditorView.addEventListener("closeFile", (event) => {
                fileListView.update();
            });
        });
    } else {
        event.target.loginFailed();
    }
}

window.addEventListener("beforeunload", function (event) {
    event.preventDefault();
    // Chrome requires returnValue to be set
    event.returnValue = "";
});

window.addEventListener("load", async (event) => {
    const container = document.querySelector("#container");
    const loginView = new LoginView(container);
    loginView.addEventListener("login", attemptLogin);
});
