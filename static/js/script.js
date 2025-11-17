let tablesbtn = document.getElementById("get-tables-btn");
let db_field = document.getElementById("db-input");

tablesbtn.addEventListener("click", () => {
    fetch("/api/tables", {
        method: "GET",
        headers: {
            "db": db_field.value
        }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error("Error:", error));
});
