$(document).ready(function () {
    renderMathInElement(document.body, {
        delimiters: [{
            left: "$$",
            right: "$$",
            display: true
        },  {
            left: "$",
            right: "$",
            display: false
        }]
    })
});

