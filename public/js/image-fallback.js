// Global image error handler (runs even if error happens early)
window.addEventListener(
    "error",
    function (e) {
        const target = e.target;

        if (target && target.tagName === "IMG") {
            if (target.src.includes("/img/placeholder.png")) return;

            target.src = "/img/placeholder.png";
        }
    },
    true
);
