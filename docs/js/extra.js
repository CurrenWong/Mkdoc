// 渲染未被mkdocs捕捉到的公式，此处暂时用不上
// $(document).ready(function () {
//     renderMathInElement(document.body, {
//         delimiters: [{
//             left: "$$",
//             right: "$$",
//             display: true
//         }, {
//             left: "$",
//             right: "$",
//             display: false
//         }]
//     })
// });

// 渲染折叠公式
$(document).ready($("math-details").each(function () {
    renderMathInElement(document.body, {
        delimiters: [{
            left: "$$",
            right: "$$",
            display: true
        }, {
            left: "$",
            right: "$",
            display: false
        }]
    })
}));
