let tablesbtn = document.getElementById("get-tables-btn");
let db_field = document.getElementById("db-input");
let tables = [];
let statusline = document.getElementById("statusline");

function notify_error(text) {
    statusline.innerText = text;
}

function generate_tables_header() {
    //TODO: animations
    let tabs_container = document.getElementById("tables-tabs");
    tabs_container.innerHTML = "";
    tables.forEach((t) => {
        let tab = document.createElement("button");
        tab.className = "table-tab";
        tab.innerText = t;
        tab.dataset.target = t;
        tabs_container.appendChild(tab);
        tab.addEventListener("click", (event) => {
            tabs_container.childNodes.forEach((x) => {
                // if (x != tab)
                x.classList.remove("active-tab");
            });
            tab.classList.add("active-tab");
        });
    });
}

tablesbtn.addEventListener("click", () => {
    fetch("/api/tables", {
        method: "GET",
        headers: {
            db: db_field.value,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data)
            // if (response.status === 400 || response.status == 404) {
            //     notify_error("БД не найдена")
            //     return
            // }
            if (data && data.tables) {
                tables = data.tables;
                generate_tables_header();
            } else {
                notify_error(data.error);
            }
        })
        .catch((error) => console.error("Error:", error));
});

let db_dropdown = document.getElementById("db-dropdown");
//TODO: refresh wen click refresh option even if refresh option now
function fetch_databases() {
    fetch("/api/databases", {
        method: "GET",
    })
        .then((response) => response.json())
        .then((data) => {
            // console.log(data);
            db_dropdown.childNodes.forEach((x) => {
                if (x.id !== "db-dropdown-refresh-option") {
                    db_dropdown.removeChild(x);
                }
            });
            data.forEach((x) => {
                let option = document.createElement("option");
                option.value = x;
                option.innerText = x;
                db_dropdown.appendChild(option);
                console.log(x);
            });
        });
}
fetch_databases();
db_dropdown.addEventListener("change", (event) => {
    const selectedOption = event.target.value;
    if (selectedOption == "$get") {
        fetch_databases();
    } else {
        db_field.value = selectedOption;
    }
});
