$(function() {
    $("select").select2({
        minimumResultsForSearch: -1
    });

    /**
     * demo
     */
    var $tagCloud = $(".tag-cloud"),
        num = "〇①②③④⑤⑥⑦⑧⑨",
        html = '<a href="javascript:;">标签</a>',
        $number = $("#tag-number"),
        $boxsize = $("#tag-boxsize"),
        $mincolor = $("#tag-mincolor"),
        $maxcolor = $("#tag-maxcolor"),
        $debug = $("#tag-debug"),
        $radius = $("#tag-radius"),
        $bgcolor = $("#tag-bgcolor"),
        $color = $("#tag-color"),
        $anim = $("#tag-anim"),
        $animtime = $("#tag-animtime"),
        $animdelay = $("#tag-animdelay"),
        $minsize = $("#tag-minsize"),
        $method = $("#tag-method"),
        $go = $("#go");

    function getTimesHtml(times) {
        var html = '';
        for (var i = 0,_html; i < times; i++) {
            _html = '<a href="javascript:;">标签' + i + '</a>';
            html += _html.replace(/\d/g,function(v,i){
                return num[v];
            });
        }
        return html;
    }

    function getOpts() {
        console.log($minsize.val());
        return {
            minColor: $mincolor.val(),
            maxColor: $maxcolor.val(),
            minSize: 30,
            maxSize: 150,
            minFontSize: 12,
            currentClass: "tag-cloud-enter",
            debug: $debug.prop("checked"),
            offset: [0, 0, 0, 0],
            radius: $radius.val(),
            bgColor: $bgcolor.val(),
            color: $color.val(),
            colorType: 16,
            method : $method.val(),
            anim: {
                name: $anim.val(),
                time: $animtime.val(),
                delay: $animdelay.val()
            },
            enter: function(opt, id, pos, posArr, posRc, W, H, opts) {
                //console.log("Event:mouseenter");
            },
            leave: function(opt, id, pos, posArr, rc, W, H, opts) {
                //console.log("Event:mouseleave");
            },
            start: function(opts) {
                console.log("0、准备开始");
            },
            printing: function(opts) {
                console.log("1、开始绘制");
            },
            printed: function(opts) {
                console.log("2、绘制结束");
            },
            addEvented: function(opts) {
                console.log("3、事件添加完成");
            },
            animed: function(opts) {
                console.log("4、动画完成");
            },
            complate: function(opts) {
                console.log("5、一切结束了");
            }
        }
    }
    function clickEvent(e){
        destroy();
        $tagCloud.html(getTimesHtml(~~$number.val())).tagCloud(getOpts());
    }

    function destroy() {
        var boxsize = $boxsize.val().split("*");
        $tagCloud.attr("class", "tag-cloud").css({
            width : boxsize[0],
            height : boxsize[1]
        }).empty();
        $("#tag-cloud-style").remove();
    }

    $go.on("click",clickEvent);

    clickEvent();
    /**
     * $.fn.tagCloud
     * @type {object}
     * 要求：
     *     1、父标签宽高度固定
     *     2、tag为父标签的子标签。最好不要太多。否则会影响性能。100个以下吧。
     *     3、英文标签因为字符长度问题导致内容溢出。太长的中文字符同理。可以配合css的text-overflow酌情使用
     * 实现：
     *     1、根据tag数目随机设置大小和位置。尽量保证分布均匀且大小自行适配
     *     2、随机背景颜色
     *     3、文字颜色与背景色取rgb反值
     *     4、边框颜色为背景色的的rgb值转为hsl降低饱和度后再转为rgb
     *     5、兼容ie7+。
     *     6、尽可能在能用css3的基础上不用js动画。
     *     7、鼠标进入标签其他标签透明度降低的效果。切换太快会导致闪动。如删请自行使用!important解决。
     */
/*    $tagCloud.tagCloud({
        //颜色最小值。支持十六位(#000000)、十六位简写(#000)。rgb格式带aplha(rgb(0,0,0))
        //默认：#333
        minColor: "#333",
        //同上
        //默认：#eee
        maxColor: "#eee",
        //每个tag最小宽度。单位px
        //默认：40
        minSize: 40,
        //每个tag最大宽度。同时也会影响放大的效果。单位px
        //默认：150
        maxSize: 150,
        //最小文字大小。单位px
        //默认：12
        minFontSize: 14,
        //鼠标放在tag上为tag添加的样式。会影响生成的style
        //默认：tag-cloud-enter
        currentClass: "tag-cloud-enter",
        //是否处于编辑状态。显示方格背景
        //默认: false
        debug: false,
        //上右下左的边距。大概没啥用
        //默认: [0,0,0,0]
        offset: [0, 0, 0, 0],
        //圆角度。
        //默认：50%
        radius: "50%",
        //设置同一背景颜色。
        //默认为空。即随机从minColor和maxColor范围内取值
        bgColor: "",
        //设置同一文字颜色
        //默认为空。即取背景颜色的rgb相反值
        color: "",
        //默认显示的颜色样式。16(如#000),rgb(如rgb(0,0,0)),rgba(如rgba(0,0,0,1))。其实没什么用处的参数。也就调试用
        //默认：16
        colorType: 16,
        //计算方式。area是根据面积开方计算。divisor是根据公约数来计算。
        //默认: area
        method : "area",
        //动画。默认为 { name : "bomb" , time : "500" , delay : "50"}
        //name : "one","warp","bomb"。三种
        //time : 动画时间
        //delay : 下一动画延迟。注意。动画结束后才可以触发鼠标事件
        anim: {
            name: "bomb",
            time: "500",
            delay: "50"
        },
        //鼠标进入tag触发的事件。参数可不理睬。
        enter: function(opt, id, pos, posArr, posRc, W, H, opts) {
            console.log("Event:mouseenter");
        },
        //鼠标离开tag触发的事件。参数可不理睬。
        leave: function(opt, id, pos, posArr, rc, W, H, opts) {
            console.log("Event:mouseleave");
        },
        //准备阶段。顺序0
        start: function(opts) {
            console.log("0、准备开始");
        },
        //开始处理tag的html之前调用。顺序1
        printing: function(opts) {
            console.log("1、开始绘制");
        },
        //处理tag的html内容和格式完成之后调用。顺序2
        printed: function(opts) {
            console.log("2、绘制结束");
        },
        //为tag添加代理事件后调用。顺序3
        addEvented: function(opts) {
            console.log("3、事件添加完成");
        },
        //动画完成之后调用。顺序4
        animed: function(opts) {
            console.log("4、动画完成");
        },
        //插件完成。顺序5
        complate: function(opts) {
            console.log("5、一切结束了");
        }
    });*/
})
