// 从标题获取锚点值
function getAnchor(text) {
    // 将数字以外的文本转换为连接符
    var num = text.replace(/[.]/ig, "").replace(/[^0-9]+/ig, '-');
    // 去除开头结尾的连接符
    num = num.replace(/^-|-$/ig, "");
    return num;
}

// 定义树节点
class node {
    constructor(id, name, depth, parent = null, children = []) {
        this.id = id;
        this.name = name;
        this.depth = depth;
        this.parent = parent;
        this.children = children;
        this.isLeaf = false;
    }
    // 上移方法
    goUp() {
        // 指针上移，返回父节点
        // console.log("go up to parent:" + this.parent.name
        //     + " depth:" + this.parent.depth
        //     + " from:" + this.name
        //     + " depth:" + this.depth);
        if (this.children.length == 0) {
            this.isLeaf = true;
        }
        return this.parent;
    }
    // 下移方法
    goDown(newNode) {
        // 指针下移，创建子节点，并返回新建的子节点
        // 指定新节点父节点
        newNode.parent = this;
        // 指定本节点的子节点
        this.children.push(newNode);
        // console.log("parent:" + this.name + " children:" + newNode.name);
        return newNode;
    }
}
// 定义获取根节点函数
function getRoot(headingList, seq) {
    // 获取根节点
    var flag = false;
    for (let i = 0; i < headingList.length; i++) {
        const element = $(headingList[i]);
        // 获取节点信息
        var depth = element[0].tagName.toLowerCase()[1];
        // 将第一个一级标题作为根节点
        if (depth == 1) {
            // 获取节点id
            var id;
            if (element[0].id.length > 0) {
                id = element[0].id;
            } else {
                id = "node_" + i;
            }
            // 获取节点name
            var name;
            if (element.children(".toclink").length > 0) {
                name = element.children(".toclink")[0].innerText.replace(/\n.*?\n/ig, "");
            } else {
                name = element.text().replace(/\n.*?\n/ig, "");
            }
            flag = true;
            return new node(id, name, depth);
        }
    }
    if (!flag) {
        throw "Mindmap " + seq + " 不存在根节点";
    }
}

// 定义将标题以树状结构存储的函数
function buildTree(root, headingList) {
    var nodePointer = root;
    for (let i = 0; i < headingList.length; i++) {
        const element = $(headingList[i]);
        // ===获取节点信息===
        // 获取节点深度
        const depth = element[0].tagName.toLowerCase()[1];
        // 获取节点id
        var id = "";
        if (element[0].id.length > 0) {
            id = element[0].id;
        } else {
            id = "node_" + String(i);
        }
        // 获取节点name
        var name = "";
        if (element.children(".toclink").length > 0) {
            name = element.children(".toclink")[0].innerText.replace(/\n.*?\n/ig, "");
        } else {
            name = element.text().replace(/\n.*?\n/ig, "");
        }
        // 判断节点是否为根节点或者目录节点，若是则不插入
        if (id != root.id && name != "目录") {
            // 判断节点深度
            if (depth > nodePointer.depth) {
                // 若新节点深度比指针深，则插入位为指针处
                nodePointer = nodePointer;
            } else {
                // 若新节点深度比指针小或相等，指针上移至插入位
                // var diff = nodePointer.depth - depth;
                // for (let j = 0; j <= diff; j++) {
                while (depth <= nodePointer.depth) {
                    if (nodePointer.parent != null) {
                        nodePointer = nodePointer.goUp();
                    } else {
                        break;
                    }
                }
            }
            // 插入新节点作为子节点
            nodePointer = nodePointer.goDown(new node(id, name, depth));
        }
        // 把最后一个节点也设为叶子节点
        if (i == headingList.length - 1) {
            nodePointer.isLeaf = true;
        }
    }
    return root;
}

// 获取所有标题，并以树状结构存储
function headToTree(parent, text, seq) {
    var headingList = $(parent).find(text);
    // 获取根节点
    var root = getRoot(headingList, seq);
    // 构建节点树
    var tree_root = buildTree(root, headingList);
    // console.log("length:" + tree_root.children.length);
    return tree_root;
}

function getSvgTemplate(id) {
    var str = '<div style="height:300px;"><svg style="width:100%; height:100%;" id ="' +
        id + '" ></svg></div><hr>';
    return str;
}

// 将mindmap代码框中的markdown转为html<ni>text</ni>标记
function markToNode(map, seq) {
    // 获取所有文本，将换行符换成尖括号，每个封闭的尖括号代表一行
    var str = map.text().replace(/\n/ig, "><");
    // 去除没有封闭和没有内容的尖括号
    str = str.replace(/^>|<$|<>/ig, "");
    // 转换#记号为n标号
    var reg = new RegExp();
    // 要渲染的标题等级为1-6
    // 依次循环转换
    for (let i = 1; i < 7; i++) {
        reg.compile("<#{" + i + "} ", "ig");
        str = str.replace(reg, "<n" + i + " ");
    }
    // 关闭尖括号
    str = str.replace(/>/ig, "/>");
    // 按行分割
    reg.compile("<.*?>", "ig");
    var nodeList = str.match(reg);
    if (nodeList != null) {
        // 替换为html格式，方便使用jQuery选择器
        for (let i = 0; i < nodeList.length; i++) {
            const element = nodeList[i];
            var buffer;
            // 获取标题等级作为深度
            var depth = element[2];
            // 将开头关闭
            reg.compile("<n" + depth + " ");
            buffer = element.replace(reg, "<n" + depth + ">");
            // 将结尾关闭
            reg.compile("/>");
            buffer = buffer.replace(reg, "</n" + depth + ">");
            // 放入数组
            nodeList[i] = buffer;
        }
        // 转回文本，换行符分割
        str = nodeList.toString().replace(/,/ig, "\n");
        // 创建svg模板，用传入的顺序seq标号
        map.parent().after(getSvgTemplate("mindmap-inline-" + seq));
        // 将未渲染的节点元素添加到模板中
        map.html(str);
    } else {
        throw "Mindmap " + seq + " 不存在根节点";
    }
}

// 转换emoji
function translateEmoji(text = "a, text, p") {
    // 获取转换器
    var emoji = new EmojiConvertor();
    // 获取所有标题和思维导图节点
    var elements = $(text);
    // 转换Emoji
    elements.each(function () {
        $(this).html(emoji.replace_colons($(this).html()));
    });
    // 定义正则对象
    var reg = new RegExp();
    reg.compile(":[a-z|\-|1-9|\+|\-]*:", "ig");
    // 转换FontAwesome
    elements.each(function () {
        const element = $(this);
        // 获取符合格式的字符串数组
        var strList = $(this).html().match(reg);
        // 去除符合格式的字符串
        // $(this).html($(this).html().replace(reg, ""));
        if (strList != null) {
            for (let i = 0; i < strList.length; i++) {
                const element = strList[i];
                var newElement = $(this).html().replace(element, '<i class="fas ' + element.replace(/:/ig, "") + '"></i>');
                $(this).html(newElement);
                // 转为FontAwesome元素并添加为this的子元素
                // $(this).append('<i class="fas ' + element + '"></i>')
            }
        }
    });
}

// 判断访问设备是否是手机
function isMobile() {
    var ua = navigator.userAgent;
    // iPad 屏幕足够显示长公式
    var agent = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPod"];
    var flag = false;
    for (var i = 0; i < agent.length; i++) {
        if (ua.indexOf(agent[i]) > 0) {
            flag = true;
            break;
        }
    }
    return flag;
}

// 判断访问请求是否来自微信
function isWeixin() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
        return true;
    } else {
        return false;
    }
}

// 若是手机访问，去除长公式的标号，防止影响阅读
function clearTag() {
    if (isMobile() || isWeixin()) {
        $(".tag").remove();
    }
}

// 转换删除线
function translateDeleteLine(text = "text, p, li") {
    // 定义正则对象
    var reg = new RegExp();
    reg.compile("~~[^.]*~~", "ig");
    // 获取所有符合格式的DOM对象
    var elements = $(text);
    // 转换删除线
    elements.each(function () {
        // 获取符合格式的字符串数组
        var strList = $(this).html().match(reg);
        if (strList != null) {
            for (let i = 0; i < strList.length; i++) {
                const element = strList[i];
                var newElement = $(this).html().replace(element, '<s>' + element.replace(/~/ig, "") + '</s>');
                $(this).html(newElement);
            }
        }
    });
}

// 转换define中的代码高亮
function transferMetaCode(text = "pre code") {
    var reg = new RegExp();
    reg.compile("[A-Z|_]+[(][)]", "g");
    // 获取所有符合格式的DOM对象
    var elements = $(text);
    // 转换代码高亮
    elements.each(function () {
        // 获取符合格式的字符串数组
        var strList = new Set($(this).html().match(reg));
        strList = Array.from(strList);
        if (strList != null) {
            for (let i = 0; i < strList.length; i++) {
                const element = strList[i];
                var regExp = new RegExp();
                // 构造正则表达式
                regExp.compile(element.replace("()", "[(][)]"), "ig");
                // 转换格式
                var newElement = $(this).html().replace(regExp, '<span class="hljs-metaFun">' + element + '</span>');
                $(this).html(newElement);
            }
        }
    });
    // 
}

// 将.hljs-title嵌套的.hljs-meta去掉
function transferMetaTitle() {
    $('.hljs-metaFun .hljs-meta').each(
        function () {
            $(this).parent().html($(this).html());
        }
    );
}

// 显示页面访问量
function showPageView() {
    $('h1').first().after('<p><strong>当前页面浏览量</strong>：<span data-hk-page="current"> - </span>次</p>');
}
// 显示阅读所需时间
function showReadingTime() {
    $('h1').first().after('<p><strong>阅读时间：</strong><span class="eta"></span> (<span class="words"></span> 字)</p>');
}


// 渲染mindmap代码框
function transferMindCode() {
    // 渲染mindmap
    if ($('.language-mindmap').length != 0) {
        // 获取所有mindmap代码框
        var mapList = $('.language-mindmap');
        for (let i = 0; i < mapList.length; i++) {
            const element = $(mapList[i]);
            // 转换格式
            markToNode(element, i + 1);
            // 构建标题树
            var tree_root = headToTree(element, "n1, n2, n3, n4, n5, n6", i + 1);
            // 渲染
            markmap('svg#mindmap-inline-' + String(i + 1), tree_root, {
                preset: 'colorful', // or default
                linkShape: 'diagonal' // or bracket
            });
            // 去除原来的代码区域
            element.parent().remove();
        }
    }
}


// 将标题渲染成思维导图
function transferMindMap() {
    // 在目录前插入思维导图
    $("h2").children(".toclink").filter(function () {
        return $(this).text() == "目录";
    }).parent().before(getSvgTemplate("mindmap"));
    // 渲染
    if ($('svg#mindmap').length != 0) {
        // 构建标题树
        var tree_root = headToTree($("body"), "h1, h2, h3, h4, h5, h6");
        markmap('svg#mindmap', tree_root, {
            preset: 'colorful', // or default
            linkShape: 'diagonal' // or bracket
        });
        // 将思维导图的叶子节点链接到对应内容锚点
        $("[isLeaf='true']").each(function () {
            if ($(this).attr("href") != null) {
                $(this).click(function () {
                    window.location.href = $(this).attr("href");
                });
            }
        });
    }
}


// 代码高亮
function transferCode() {
    // 不转换UML图
    var text = 'pre code';
    ignoreList = ['mermaid', 'mindmap'];
    document.querySelectorAll(text).forEach((block) => {
        if (ignoreList.indexOf(block.className) != -1) {

        } else {
            hljs.highlightBlock(block);
        }
    });
    $('.mermaid').each(function () {
        $(this).attr('style', 'background-color:blanchedalmond');
    });
}
// --------------------------------
// 代码运行

// 转换代码框中的代码高亮
$(transferCode());
// 转换define中的代码高亮
$(transferMetaCode());

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
    });
}));

// 渲染标题5，使其即便不显示在目录上，也能够带有锚点和链接，
$(document).ready(
    $("h5, h6").each(function () {
        // 获取数值和文本
        var str = $(this).text();
        var num = getAnchor(str);
        // 清除内容
        $(this).html("");
        // 添加链接id属性
        $(this).attr("id", num);
        // 添加超链接
        $(this).append('<a class="toclink" href="#' + num + '">' + str + '</a>');
        $(this).append('<a class="headerlink" href="#' + num + '" title="Permanent link">#</a>');
    }));


// 转换metaFun类中的meta，由于highlightjs后生效，没有效果
// $(transferMetaTitle());

// 渲染emoji和FontAwesome
$(translateEmoji());

// 若是手机访问，去除长公式的标号，防止影响阅读
$(clearTag());

// 渲染删除线
$(translateDeleteLine());

// 放置模板显示阅读所需时间
$(showReadingTime());

// 计算并显示阅读所需时间
$(function () {

    $('article').readingTime({
        // readingTimeAsNumber: true,
        // readingTimeTarget: $('.reading-time'),
        wordCountTarget: '.words',
        wordsPerMinute: 275,
        round: true,
        lang: 'zh',
        lessThanAMinuteString: 'Less than 1 min',
        success: function (data) {
            console.log(data);
        },
        error: function (data) {
            console.log(data.error);
            $('.reading-time').remove();
        }
    });
});

// 显示页面访问量，已经停止服务
// $(showPageView());

// 渲染思维导图
$(document).ready(transferMindMap());
// 渲染代码框中的思维导图
$(document).ready(transferMindCode());
