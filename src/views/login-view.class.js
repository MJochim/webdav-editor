const htmlTemplate = `
<style>
#container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

#login-form {
    width: 350px;
    max-width: 95%;
    border: 1px solid darkgrey;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: stretch;
}

h1 {
    background-color: #ec5b23;
    color: white;
    font-size: 1em;
    margin: 0;
    padding: 15px;
    line-height: 1.5em;
}

input {
    border: 1px solid #cdcdcd;
    padding: 10px;
    margin: 10px;
}

button#login {
    padding: 10px;
    margin: 10px;
}

.version-indicator {
    background-color: #FFF4;
    padding: 2px 5px;
}

</style>

<form id="login-form">
    <h1>
        Junge Sprachwissenschaft e.&thinsp;V
        <br>
        Text-Editor
        <small class="version-indicator">v0.0.1</small>
    </h1>
    <input id="username" placeholder="Username">
    <input id="password" type="password" placeholder="Password">

    <div class="message-container error">
        Login failed
    </div>
    
    <div class="message-container in-progress">
        <div class="load-spinner"></div>
        Login is in progress
    </div>

    <button id="login">Login</button>
</form>
`;

export class LoginView extends EventTarget {
    constructor(container) {
        super();
        this.container = container;

        this.update();
    }

    update() {
        this.container.innerHTML = htmlTemplate;
        this.container.querySelector("form").addEventListener("submit", this.onclickLogin.bind(this));
        this.container.querySelector("#username").focus();
    }

    onclickLogin(event) {
            event.preventDefault();
            this.container.querySelector(".error.message-container").classList.remove("visible");
            this.container.querySelector(".in-progress.message-container").classList.add("visible");

            this.dispatchEvent(new CustomEvent("login", {detail: {
                username: this.container.querySelector("#username").value,
                password: this.container.querySelector("#password").value,
            }}));
    }

    loginFailed() {
        this.container.querySelector(".error.message-container").classList.add("visible");
        this.container.querySelector(".in-progress.message-container").classList.remove("visible");
    }
}
