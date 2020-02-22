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
// 渲染标题5，使其即便不显示在目录上，也能够带有锚点和链接，
$(document).ready(
    $("h5").each(function () {
        // 获取数值和文本
        var str = $(this).text();
        var num = str.replace(/[.]/ig, "").replace(/[^0-9]+/ig, '-');
        if (num[0] == "-") {
            num = num.substring(1, num.length)
        }
        // 清除内容
        $(this).html("");
        // 添加链接id属性
        $(this).attr("id", num);
        // 添加超链接
        $(this).append('<a class="toclink" href="#' + num + '">' + str + '</a>');
        $(this).append('<a class="headerlink" href="#' + num + '" title="Permanent link">#</a>');
    }));
