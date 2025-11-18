let tablesbtn = document.getElementById("get-tables-btn");
let db_field = document.getElementById("db-input");
let tables = [];
let statusline = document.getElementById("statusline");
let selected_table = null;
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
            selected_table = tab.dataset.target;
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
    fetch("/api/databases", { method: "GET" })
        .then((response) => response.json())
        .then((data) => {
            // удаляем все option, кроме refresh
            Array.from(db_dropdown.options).forEach((opt) => {
                if (opt.id !== "db-dropdown-refresh-option") {
                    db_dropdown.removeChild(opt);
                }
            });

            data.forEach((x) => {
                const option = document.createElement("option");
                option.value = x;
                option.innerText = x;
                db_dropdown.appendChild(option);
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
async function fetch_json_async(endpoint, method, headers, body) {
    const response = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

function make_table(columns, rows) {
    let table = document.createElement("table");
    let hrow = document.createElement("tr");
    table.appendChild(hrow);
    columns.forEach((col) => {
        let cell = document.createElement("th");
        cell.innerText = col;
        hrow.appendChild(cell);
    });
    rows.forEach((row) => {
        let row_element = document.createElement("tr");
        table.appendChild(row_element);
        columns.forEach((key) => {
            let cell = document.createElement("td");
            cell.innerText = row[key];
            row_element.appendChild(cell);
        });
    });
    return table;
}
let make_table_preview_button = document.getElementById("preview-table-btn");
let table_info_container = document.getElementById("table-info");
make_table_preview_button.addEventListener("click", async () => {
    let data = await fetch_json_async(
        "/api/tables/sample",
        "GET",
        {
            db: db_field.value,
            table: selected_table,
        },
        undefined
    );
    // console.log(data);

    if (table_info_container.childElementCount > 0) {
        table_info_container.removeChild(table_info_container.firstChild);
    }
    table_info_container.appendChild(make_table(data.columns, data.data));
});
