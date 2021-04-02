document.querySelector(".submit-btn").addEventListener("click", (e) => {
    e.preventDefault();
    let name = document.querySelector("#name-input").value;
    if (name) {
        console.log(name)
    }
})

