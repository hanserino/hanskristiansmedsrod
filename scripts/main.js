function isTouchDevice() {
    return (
        !!(typeof window !== "undefined" &&
            ("ontouchstart" in window ||
                (window.DocumentTouch &&
                    typeof document !== "undefined" &&
                    document instanceof window.DocumentTouch))) ||
        !!(typeof navigator !== "undefined" &&
            (navigator.maxTouchPoints || navigator.msMaxTouchPoints))
    );
}

function cell(text) {
    var td = document.createElement("td");
    td.textContent = text || "";
    return td;
}

function renderHistory(data) {
    var historyTableEl = document.getElementById("history-table");
    var historyTableBodyEl = document.getElementById("history-table-body");

    if (!historyTableEl || !historyTableBodyEl) {
        return;
    }

    historyTableBodyEl.replaceChildren();

    data.slice().reverse().forEach(function (item) {
        var row = document.createElement("tr");
        row.appendChild(cell(item.date));
        row.appendChild(cell(item.description));
        row.appendChild(cell(item.distance));
        row.appendChild(cell(item.category));
        historyTableBodyEl.appendChild(row);
    });

    historyTableEl.dataset.fetchSuccess = "true";
}

function showHistoryError() {
    var historyTableEl = document.getElementById("history-table");
    var historyTableBodyEl = document.getElementById("history-table-body");

    if (!historyTableEl || !historyTableBodyEl) {
        return;
    }

    historyTableBodyEl.replaceChildren();
    var row = document.createElement("tr");
    var message = document.createElement("td");
    message.colSpan = 4;
    message.textContent = "Klarte ikke å laste historikken.";
    row.appendChild(message);
    historyTableBodyEl.appendChild(row);
    historyTableEl.dataset.fetchSuccess = "true";
}

function init() {
    var historyTableEl = document.getElementById("history-table");

    if (historyTableEl) {
        fetch("./data/history.json")
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Kunne ikke hente historikk");
                }
                return response.json();
            })
            .then(function (data) {
                if (!Array.isArray(data)) {
                    throw new Error("Historikken har feil format");
                }
                renderHistory(data);
            })
            .catch(function (error) {
                console.log(error);
                showHistoryError();
            });
    }

    document.body.classList.add(isTouchDevice() ? "touch" : "no-touch");
}

window.onload = function () {
    init();
    document.body.classList.add("loaded");
};
