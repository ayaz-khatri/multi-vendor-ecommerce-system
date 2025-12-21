/**
 * Initialize a Tabulator table with common features
 */
export function initTabulator({
    tableId,
    data,
    columns,
    height = "550px",
    pageSize = 10,
    pageSizeSelector = [5, 10, 20, 50],
    actions = null,
    url = null,
    method = "DELETE",
    approveUrl = null,
    approveModalId = null,
}) {

    /* -----------------------------
       Utilities
    ----------------------------- */

    function timeAgo(value) {
        if (!value) return "";
        const date = new Date(value);
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

        const intervals = [
            { label: "year", seconds: 31536000 },
            { label: "month", seconds: 2592000 },
            { label: "day", seconds: 86400 },
            { label: "hour", seconds: 3600 },
            { label: "minute", seconds: 60 },
            { label: "second", seconds: 1 },
        ];

        const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

        for (const interval of intervals) {
            const count = Math.floor(seconds / interval.seconds);
            if (count >= 1) return rtf.format(-count, interval.label);
        }

        return "just now";
    }

    /* -----------------------------
       Enhance date columns
    ----------------------------- */

    const enhancedColumns = columns.map(col => {
        if (["createdAt", "updatedAt", "deletedAt"].includes(col.field)) {
            return {
                ...col,
                formatter: cell => timeAgo(cell.getValue()),
                hozAlign: "center",
                cellMouseOver(e, cell) {
                    e.target.setAttribute(
                        "title",
                        new Date(cell.getValue()).toLocaleString()
                    );
                }
            };
        }
        return col;
    });

    /* -----------------------------
       Global Actions column
    ----------------------------- */

    if (typeof actions === "function") {
        enhancedColumns.push({
            title: "Actions",
            hozAlign: "center",
            headerSort: false,
            formatter: cell => actions(cell.getData())
        });
    }

    /* -----------------------------
       Init Tabulator
    ----------------------------- */

    const table = new Tabulator(tableId, {
        data,
        layout: "fitColumns",
        responsiveLayout: "collapse",
        pagination: true,
        paginationSize: pageSize,
        paginationSizeSelector: pageSizeSelector,
        paginationCounter: "rows",
        movableColumns: true,
        resizableColumns: true,
        height,
        columnDefaults: {
            headerSort: true,
            headerHozAlign: "center",
            hozAlign: "left",
            vertAlign: "middle",
        },
        columns: enhancedColumns,
    });

    /* -----------------------------
       Bootstrap Modal Delete Logic
    ----------------------------- */

    if (url) {
        let itemId = null;

        window.openModal = function (id) {
            itemId = id;
            new bootstrap.Modal(
                document.getElementById("ConfirmModal")
            ).show();
        };

        const confirmBtn = document.getElementById("confirmBtn");

        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                if (!itemId) return;

                try {
                    const res = await fetch(`${url}/${itemId}`, {
                        method: method,
                        headers: { "Content-Type": "application/json" }
                    });

                    if (res.ok) {
                        window.location.reload();
                    } else {
                        alert("Failed to perform action.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("An error occurred while deleting.");
                }

                itemId = null;

                bootstrap.Modal.getInstance(
                    document.getElementById("ConfirmModal")
                ).hide();
            };
        }
    }

    if (approveUrl && approveModalId) {
        let approveItemId = null;

        window.openApproveModal = function (id) {
            approveItemId = id;
            new bootstrap.Modal(
                document.getElementById(approveModalId)
            ).show();
        };

        const confirmBtn = document.getElementById("confirmApproveBtn");
        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                if (!approveItemId) return;

                try {
                     const res = await fetch(`${approveUrl}/${approveItemId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                    });

                    if (res.ok) {
                        window.location.reload();
                    } else {
                        alert("Failed to approve shop.");
                    }
                } catch (err) {
                    console.error(err);
                    alert("An error occurred while approving.");
                }

                approveItemId = null;
                bootstrap.Modal.getInstance(
                    document.getElementById(approveModalId)
                ).hide();
            };
        }
    }


    return table;
}
