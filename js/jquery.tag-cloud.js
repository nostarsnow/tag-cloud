(function(window, $) {
    $.fn.tagCloud = function(opts) {
        var defaults = {
                minColor: "#333",
                maxColor: "#eee",
                minSize: 40,
                maxSize: 150,
                minFontSize: 12,
                currentClass: "tag-cloud-enter",
                debug: false,
                offset: [0, 0, 0, 0],
                radius: "50%",
                colorType: 16,
                anim: {
                    name: "bomb",
                    time: "500",
                    delay: "50"
                },
                bgColor : "",
                color : "",
                enter: function(opt, id, pos, posArr, posRc, W, H, opts) {},
                leave: function(opt, id, pos, posArr, rc, W, H, opts) {},
                start: function(opts) {},
                printing: function(opts) {},
                printed: function(opts) {},
                addEvented: function(opts) {},
                animed: function(opts) {},
                complate: function(opts) {}
            },
            opts = $.extend(defaults, opts),
            _this = this,
            $this = $(_this),
            W = $this.width(),
            H = $this.height(),
            $list = $this.children(),
            listLength = $list.length;
        opts.pos = [];
        opts.posRc = [];
        var $warp = $("<div/>").addClass("tag-cloud-warp"),
            killIe = (/msie [6|7|8|9]/i.test(navigator.userAgent)),
            animed = false;

        $.extend(jQuery.easing, {
            easeInOutBack: function(x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
                return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
            },
            easeOutElastic: function(x, t, b, c, d) {
                var s = 1.70158;
                var p = 0;
                var a = c;
                if (t == 0) return b;
                if ((t /= d) == 1) return b + c;
                if (!p) p = d * .3;
                if (a < Math.abs(c)) {
                    a = c;
                    var s = p / 4;
                } else var s = p / (2 * Math.PI) * Math.asin(c / a);
                return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
            },
            easeOutBack: function(x, t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }
        });
        Number.prototype.to10 = String.prototype.to10 = function() {
            if (isInt(this)) {
                return this.toString(10);
            } else if (is16(this)) {
                return parseInt(this, 16).toString(10);
            }
        };
        Number.prototype.to16 = String.prototype.to16 = function() {
            if (isInt(this)) {
                return parseInt(this, 10).toString(16);
            } else if (is16(this)) {
                return this.toString(16);;
            }
        };

        function isInt(num) {
            return String.prototype.match.call(num, /^\d+$/) !== null
        }

        function is16(str) {
            return String.prototype.match.call(str, /^[0-9a-f]+$/) !== null
        }
        Array.prototype.slices = function(arr) {
            for (var length = arr.length, i = length - 1; i >= 0; i--) {
                this.splice(arr[i], 1);
            }
        }
        if (killIe) {
            var prefix = "";
        } else {

            var prefix = (function() {
                var styles = window.getComputedStyle(document.documentElement, ''),
                    pre = (Array.prototype.slice
                        .call(styles)
                        .join('')
                        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
                    )[1],
                    dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
                return {
                    dom: dom,
                    lowercase: pre,
                    css: '-' + pre + '-',
                    js: pre[0].toUpperCase() + pre.substr(1)
                };
            })();
        }

        function getRgb(color) {
            var rgb = [];
            if (color.indexOf("#") > -1) {
                if (color.length === 4) {
                    for (var i = 0; i < 3; i++) {
                        rgb[i] = (color.substr(i + 1, 1) + '' + color.substr(i + 1, 1)).to10()
                    }
                } else if (color.length === 7) {
                    for (var i = 0; i < 3; i++) {
                        rgb[i] = pad(color.substr(2 * i + 1, 2).to10())
                    }
                }
            } else if (color.indexOf("rgb") > -1) {
                var match = color.match(/rgb.*\((\d*)\,(\d*)\,(\d*).*/);
                rgb = [
                    match[1],
                    match[2],
                    match[3]
                ]
            }
            for (var i = 0; i < 3; i++) {
                rgb[i] = pad(rgb[i]);
            }
            return rgb;
        }

        function getRandom(min, max) {
            return ~~(Math.random() * (max - min + 1) + min);
        }

        function pad(value, length, str, right) {
            length = length || 2;
            str = str || "0";
            value = String(value);
            if (value.length >= length) {
                return String(value);
            }
            for (var i = 0, total = length - value.length; i < total; i++) {
                if (right) {
                    value = value + '' + str;
                } else {
                    value = str + '' + value;
                }
            }
            return value;
        }

        function getRandomColor(min, max, type, trans) {
            type = type || opts.colorType;
            trans = trans || "1";
            var rgb = [],
                color = '';
            for (var i = 0; i < 3; i++) {
                rgb[i] = pad(getRandom(~~min[i], ~~max[i])).to10()
            }
            return returnColor(rgb, type, trans);
        }

        function getBgColor(min, max) {
            min = min || opts.minColor;
            max = max || opts.maxColor;
            return getRandomColor(getRgb(min), getRgb(max));
        }

        function hslToRgb(h, s, l) {
            var r, g, b;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

        function rgbToHsl(r, g, b) {
            r /= 255, g /= 255, b /= 255;
            var max = Math.max(r, g, b),
                min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;

            if (max == min) {
                h = s = 0; // achromatic
            } else {
                var d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r:
                        h = (g - b) / d + (g < b ? 6 : 0);
                        break;
                    case g:
                        h = (b - r) / d + 2;
                        break;
                    case b:
                        h = (r - g) / d + 4;
                        break;
                }
                h /= 6;
            }

            return [h, s, l];
        }

        function getCheepColor(color, type, trans) {
            type = type || opts.colorType;
            trans = trans || "1";
            var brgb = getRgb(color);
            var hsl = rgbToHsl(brgb[0], brgb[1], brgb[2]);
            var rgb = hslToRgb(hsl[0], hsl[1] / 3 * 1, hsl[2]);
            return returnColor(rgb, type, trans);
        }

        function returnColor(rgb, type, trans) {
            type = type || opts.colorType;
            trans = trans || "1";
            if (!$.isArray(rgb)) {
                rgb = getRgb(rgb);
            }
            switch (type) {
                case 16:
                    return '#' + pad(rgb[0].to16()) + pad(rgb[1].to16()) + pad(rgb[2].to16());
                    break;
                case "rgb":
                    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                    break;
                case "rgba":
                    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + trans + ')';
                    break;
            }
        }

        function inverseBgColor(bgColor, type, trans) {
            type = type || opts.colorType;
            trans = trans || "1";
            var rgb = [],
                color = getRgb(bgColor);
            for (var i = 0; i < 3; i++) {
                rgb[i] = pad(255 - color[i].to10());
            }
            return returnColor(rgb, type, trans);
        }

        function getBigest(pos, posRc, rows, cols) {
            var length = pos.length;

            function getPosById(id) {
                for (var i = 0; i < length; i++) {
                    if (pos[i].id === id) {
                        return pos[i];
                        break;
                    }
                }
                return false;
            }
            for (var i = 0, _pos, _id, distance = []; i < length; i++) {
                _pos = pos[i];
                _id = _pos.id;
                if (_id < cols || _id % cols === 0 || _id % cols + 1 === cols || _id > cols * (rows - 1)) {
                    distance[i] = 0;
                    continue;
                }
                for (var j = 0, anotherId, another, _distance = []; j < 8; j++) {
                    switch (j) {
                        case 0:
                            anotherId = _id - cols - 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(_pos.x - another.x - another.w) : posRc.rc.w);
                            break;
                        case 1:
                            anotherId = _id - cols;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(_pos.y - another.y - another.h) : posRc.rc.w);
                            break;
                        case 2:
                            anotherId = _id - cols + 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(another.x - _pos.x - _pos.w) : posRc.rc.w);
                            break;
                        case 3:
                            anotherId = _id + 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(another.x - _pos.x - _pos.w) : posRc.rc.w);
                            break;
                        case 4:
                            anotherId = _id + cols + 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(another.x - _pos.x - _pos.w) : posRc.rc.w);
                            break;
                        case 5:
                            anotherId = _id + cols;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(another.y - _pos.y - _pos.w) : posRc.rc.w);
                            break;
                        case 6:
                            anotherId = _id + cols - 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(_pos.x - another.x - another.w) : posRc.rc.w);
                            break;
                        case 7:
                            anotherId = _id + cols - 1;
                            another = getPosById(anotherId);
                            _distance.push(another ? +(_pos.x - another.x - another.w) : posRc.rc.w);
                            break;
                    }
                }
                console.log(_distance, _id);
                distance[i] = Math.min.apply(null, _distance);
            }
            var move = Math.max.apply(null, distance);
            var id = distance.indexOf(move);
            return {
                move: move,
                id: id
            }
        }

        function isPrime(n) { //是否为质数
            if (n <= 3) {
                return n > 1;
            }
            if (n % 2 == 0 || n % 3 == 0) {
                return false;
            }

            for (var i = 5; i * i <= n; i += 6) {
                if (n % i == 0 || n % (i + 2) == 0) {
                    return false;
                }
            }
            return true;
        }

        function maxPrime(n) {
            var gap = 0;
            while (isPrime(n)) {
                n--;
                gap--;
            }
            return {
                num: n,
                gap: gap
            }
        }

        function maxDivisor(m, n, correct) {
            var u = +m,
                v = +n,
                t = n,
                _u;
            while (v != 0) {
                t = u % v;
                u = v;
                v = t;
            }
            if (correct !== undefined) {
                while (correct != 0) {
                    var arr = [
                        Math.sqrt(u),
                        u / 2,
                        u / 3,
                        u / 5,
                        u / 7
                    ];
                    u = Math.max.apply(null, arr);
                    correct--;
                }
            }
            return u;
        }

        function checkRowsAndCols(r, c, l, count) {
            return r / l * c / l >= count;
        }

        function getRowsAndCols(m, n, count) {
            var om = m - opts.offset[1] - opts.offset[3],
                on = n - opts.offset[0] - opts.offset[2];
            sm = 0,
                sn = 0,
                mP = maxPrime(om),
                nP = maxPrime(on),
                divistor = 0,
                correct = 0;
            divistor = maxDivisor(mP.num, nP.num, correct);
            if (mP.num / divistor > count || nP.num / divistor > count) {
                sm = om % 200;
                sn = on % 200;
                mP = maxPrime(om - sm),
                    nP = maxPrime(on - sn);
                divistor = maxDivisor(mP.num, nP.num, correct);
            }
            while (!checkRowsAndCols(mP.num, nP.num, divistor, count)) {
                divistor = maxDivisor(mP.num, nP.num, ++correct);
            }
            return {
                rows: ~~(nP.num / divistor),
                cols: ~~(mP.num / divistor),
                w: divistor,
                l: mP.gap / 2 + opts.offset[1] + sm / 2,
                t: nP.gap / 2 + opts.offset[0] + sn / 2
            };
        }

        function maxSquares(w,h,n){
            var m = ~~Math.sqrt(w*h);
            while( ~~(w/m)*~~(h/m) < n ){
                m--;
            }
            return m;
        }

        function getRowsAndColsByArea(m,n,count){
            var om = m - opts.offset[1] - opts.offset[3],
                on = n - opts.offset[0] - opts.offset[2],
                divistor = maxSquares(m,n,count),
                result = {
                    rows: ~~(on / divistor),
                    cols: ~~(om / divistor),
                    w: divistor
                };
            result.l = opts.offset[1] + (om-divistor*result.cols)/2;
            result.t = opts.offset[0] + (on-divistor*result.rows)/2;
            return result;
        }

        function push() {
            var posRc = opts.posRc = debug();
            var pos = Array.prototype.slice.call(posRc.pos),
                rows = posRc.rc.rows,
                cols = posRc.rc.cols,
                width = posRc.rc.w;
            for (var i = 0; i < listLength; i++) {
                var key = ~~(Math.random() * pos.length);
                var random = 0;
                var w, x, y;
                random = (getRandom(30, 95) + Math.random()) / 100;
                if (pos[key].id < cols || pos[key].id % cols === 0 || pos[key].id % cols + 1 === cols || pos[key].id > cols * (rows - 1)) {
                    if (random > 0.4) {
                        random = random * 0.5;
                    }
                    if (rows > 3 && cols > 3) {
                        if (random > 0.4) {
                            random = random * 0.5;
                        }
                    } else {
                        if (random > 0.8) {
                            random = random * 0.8;
                        }
                        if (random < 0.35) {
                            random = random * 1.5;
                        }
                    }

                }
                w = width * random;
                if (w < opts.minSize) {
                    w = opts.minSize + 7 * random;
                }
                if (w > opts.maxSize) {
                    w = opts.maxSize - 7 * random;
                }
                x = (width - w) * Math.random();
                y = (width - w) * Math.random();
                opts.pos[i] = {
                    x: ~~(pos[key].x + x),
                    y: ~~(pos[key].y + y),
                    w: ~~w,
                    h: ~~w,
                    id: pos[key].id
                };
                if ( opts.bgColor ){
                    opts.pos[i].bgColor = opts.bgColor;
                }else{
                    opts.pos[i].bgColor = getBgColor();
                }
                var $t = $list.eq(i),
                    fontSize = (opts.pos[i].w - 40) / $t.text().length;
                if (fontSize < opts.minFontSize) {
                    fontSize = opts.minFontSize;
                }
                opts.pos[i].fontSize = ~~fontSize;
                opts.pos[i].$el = $t;
                if ( opts.color ){
                    opts.pos[i].color = opts.color;
                }else{
                    opts.pos[i].color = inverseBgColor(opts.pos[i].bgColor);
                }
                if (killIe) {
                    opts.pos[i].bColor = returnColor(getCheepColor(opts.pos[i].bgColor), 16);
                } else {
                    opts.pos[i].bColor = returnColor(getCheepColor(opts.pos[i].bgColor), "rgba", .7);
                }
                var css = {
                    "background-color": opts.pos[i].bgColor,
                    "left": opts.pos[i].x,
                    "top": opts.pos[i].y,
                    "width": opts.pos[i].w,
                    "height": opts.pos[i].h,
                    "color": opts.pos[i].color,
                    "line-height": opts.pos[i].h + 'px',
                    "position": "absolute",
                    "font-size": opts.pos[i].fontSize,
                    "overflow": "hidden",
                    "border": "0px solid " + opts.pos[i].bColor
                };
                if (opts.radius) {
                    css[prefix.css + "border-radius"] = opts.radius;
                    css["border-radius"] = opts.radius;
                }
                if (opts.anim.name === "one") {
                    css["display"] = "none";
                    if (killIe) {
                        css["left"] = opts.pos[i].x + opts.pos[i].w / 2;
                        css["top"] = opts.pos[i].y + opts.pos[i].h / 2;
                        css["width"] = 0;
                        css["height"] = 0;
                        css["line-height"] = 0;
                        css["font-size"] = 0;
                    }

                } else if (opts.anim.name === "warp") {
                    $warp.hide();
                    if (killIe) {
                        $warp.css({
                            width: "0%",
                            height: "0%",
                            top: "50%",
                            left: "50%"
                        });
                    }

                } else if (opts.anim.name = "bomb") {
                    css["display"] = "none";
                    css["left"] = W * 0.5 - opts.pos[i].w / 2;
                    css["top"] = H * 0.5 - opts.pos[i].h / 2;
                    css["width"] = 0;
                    css["height"] = 0;
                    css["line-height"] = 0;
                    css["font-size"] = 0;
                }
                $t.css(css).attr({
                    "list": i,
                    "pos": opts.pos[i].id
                });
                $warp.append($t);
                pos.splice(key, 1);
            };
            /*    var bigest = getBigest(opts.pos,posRc,rows,cols);
                var bigPos = opts.pos[bigest.id];
                bigPos.$el.css({
                    width : bigPos.w = bigPos.w + bigest.move,
                    height : bigPos.h = bigPos.h + bigest.move,
                    left : bigPos.x = bigPos.x - bigest.move/2,
                    top : bigPos.y = bigPos.y - bigest.move/2,

                }).addClass("tag-cloud-big");*/
            $this.append($warp);
            $this.removeClass("tag-cloud-printing").addClass("tag-cloud-printed");
        }


        function animate(type) {
            switch (type.name) {
                case "one":
                    var $l = Array.prototype.slice.call($list);

                    var anim = function() {
                        var length = $l.length;
                        if (length < 1) {
                            animed = true;
                            return false;
                        }
                        var key = ~~(Math.random() * $l.length),
                            $t = $($l[key]),
                            id = $t.attr("list");
                        if (killIe) {
                            $t.addClass("tag-cloud-anim tag-cloud-db").animate({
                                left: opts.pos[id].x,
                                top: opts.pos[id].y,
                                width: opts.pos[id].w,
                                height: opts.pos[id].h,
                                lineHeight: opts.pos[id].h + 'px',
                                fontSize: opts.pos[id].fontSize
                            }, opts.anim.time, "easeOutBack");
                        } else {
                            $t.addClass("tag-cloud-anim tag-cloud-anim-scale tag-cloud-db");
                        }
                        $l.splice(key, 1);
                        setTimeout(function() {
                            anim();
                        }, opts.anim.delay);
                    }
                    anim();
                    break;
                case "bomb":
                    var $l = Array.prototype.slice.call($list);

                    var anim = function() {
                        var length = $l.length;
                        if (length < 1) {
                            animed = true;
                            return false;
                        }
                        var key = ~~(Math.random() * $l.length),
                            $t = $($l[key]),
                            id = $t.attr("list");
                        $t.addClass("tag-cloud-anim tag-cloud-db").animate({
                            left: opts.pos[id].x,
                            top: opts.pos[id].y,
                            width: opts.pos[id].w,
                            height: opts.pos[id].h,
                            lineHeight: opts.pos[id].h + 'px',
                            fontSize: opts.pos[id].fontSize
                        }, opts.anim.time, "easeOutBack");
                        $l.splice(key, 1);
                        setTimeout(function() {
                            anim();
                        }, opts.anim.delay);
                    }
                    anim();
                    break;
                case "warp":
                    setTimeout(function() {
                        if (killIe) {
                            $warp.addClass("tag-cloud-anim tag-cloud-db").animate({
                                width: "100%",
                                height: "100%",
                                top: "0%",
                                left: "0%"
                            }, opts.anim.time, "easeOutBack");
                        } else {
                            $warp.addClass("tag-cloud-anim tag-cloud-anim-scale tag-cloud-db");
                        }
                        animed = true;
                    }, opts.anim.delay);
                    break;
            }
        }

        function initStyle() {
            var style = ('<style type="text/css" id="tag-cloud-style">.tag-cloud-db{display:block!important;}.tag-cloud{position:relative;overflow:hidden}.tag-cloud .tag-cloud-debug{position:absolute;width:100%;height:100%;z-index:1;left:0;top:0;' + prefix.css + 'box-sizing: border-box;box-sizing: border-box;}.tag-cloud .tag-cloud-debug span{position:absolute;border:#fff 1px solid;' + prefix.css + 'box-sizing: border-box;box-sizing: border-box;}.tag-cloud .tag-cloud-warp{position:absolute;width:100%;height:100%;z-index:2;left:0;top:0;overflow:hidden;}.tag-cloud .' + opts.currentClass + '{z-index:777;}.tag-cloud-anim-scale{' + prefix.css + 'animation:tag-cloud-anim-scale ' + opts.anim.time + 'ms;}@' + prefix.css + 'keyframes tag-cloud-anim-scale{0%{ ' + prefix.css + 'transform:scale(0)}100%{' + prefix.css + 'transform:scale(1);}}.tag-cloud .tag-cloud-warp.tag-cloud-warp-hover>*{' + prefix.css + 'transition: opacity .3s;opacity: .4!important;filter:alpha(opacity=40)!important;}.tag-cloud .tag-cloud-warp.tag-cloud-warp-hover .' + opts.currentClass + '{' + prefix.css + 'transition:opacity 0s;opacity:1!important;filter:alpha(opacity=100)!important;  }</style>');
            $("head").prepend(style);
        }

        function addEvent() {
            $warp.on("mouseenter", ">*", function() {
                if (!animed) {
                    return false;
                }
                var $t = $(this),
                    id = $t.attr("list"),
                    pos = $t.attr("pos");
                var opt = opts.pos[id],
                    posRc = opts.posRc;
                if (opt.cw === undefined) {
                    var maxWidth;
                    if (posRc.rc.w > opts.maxSize) {
                        maxWidth = opts.maxSize;
                    } else {
                        maxWidth = posRc.rc.w;
                    }
                    var width = maxWidth * 1.3;

                    var x = opt.x - (width - opt.w) / 2,
                        y = opt.y - (width - opt.h) / 2;
                    if (x < 15) {
                        x = 15;
                    }
                    if (x + width > W - 15) {
                        x = W - width - 15;
                    }
                    if (y < 15) {
                        y = 15;
                    }
                    if (y + width > H - 15) {
                        y = H - width - 15;
                    }
                    opt.cx = x;
                    opt.cy = y;
                    opt.cw = width;
                    opt.ch = width;
                    opt.fs = (opt.cw - 40) / $t.text().length * 0.9;
                }
                if (opt.fs < opts.minFontSize) {
                    opt.fs = opt.minFontSize;
                }
                var css = {
                    left: opt.cx,
                    top: opt.cy,
                    width: opt.cw,
                    height: opt.ch,
                    "line-height": opt.ch + 'px',
                    "font-size": opt.fs,
                    "border-width": 5
                };
                var shadow = {};
                shadow[prefix.css + "box-shadow"] = opt.bgColor + " 0 0 11px 3px";
                shadow["box-shadow"] = opt.bColor + " 0 0 11px 3px";
                $t.stop().fadeTo(0, 1).animate(css, 300, "easeOutBack", function() {}).addClass(opts.currentClass).css(shadow).parent().addClass("tag-cloud-warp-hover");
                //$t.siblings().fadeTo(0,.7);
                opts.enter.call(this, $.extend(true, {}, opts.pos[id]), id, pos, $.extend(true, {}, opts));
            });
            $warp.on("mouseleave", ">*", function() {
                if (!animed) {
                    return false;
                }
                var $t = $(this),
                    id = $t.attr("list"),
                    pos = $t.attr("pos");
                var opt = opts.pos[id],
                    posRc = opts.posRc;
                var css = {
                    left: opt.x,
                    top: opt.y,
                    width: opt.w,
                    height: opt.h,
                    "line-height": opt.h + 'px',
                    "font-size": opt.fontSize,
                    "border-width": 0
                };
                var shadow = {};
                shadow[prefix.css + "box-shadow"] = opt.bgColor + " 0 0 0 0";
                shadow["box-shadow"] = opt.bgColor + " 0 0 0 0";
                $t.stop().fadeTo(0, 1).animate(css, 200, "easeInOutBack", function() {
                    $t.removeClass(opts.currentClass);
                }).css(shadow).parent().removeClass("tag-cloud-warp-hover");
                //$t.siblings().fadeTo(200,1);
                opts.leave.call(this, $.extend(true, {}, opts.pos[id]), id, pos, $.extend(true, {}, opts));
            });
        }

        function debug() {
            var rc;
            if ( opts.method === "divisor" ){
                rc = getRowsAndCols(W, H, listLength);
            }else{
                rc = getRowsAndColsByArea(W, H, listLength);
            }
            var html = '<div class="tag-cloud-debug">',
                pos = [];
            for (var i = 0; i < rc.rows; i++) {
                for (var j = 0; j < rc.cols; j++) {
                    var num = i * rc.cols + j;
                    pos[num] = {
                        x: j * rc.w + rc.l,
                        y: i * rc.w + rc.t,
                        id: num
                    }
                    html += '<span style="width:' + rc.w + 'px;height:' + rc.w + 'px;left:' + (pos[num].x) + 'px;top:' + (pos[num].y) + 'px;">' + num + '</span>';
                }
            }
            html += '</div>';
            if (opts.debug) {
                $this.prepend(html);
            }
            return {
                rc: rc,
                pos: pos
            }
        }

        function init() {
            var options = $.extend(true, {}, opts);
            opts.start.call(_this, options);
            opts.printing.call(_this, options);
            $this.addClass("tag-cloud-printing").empty();
            initStyle();
            push();
            opts.printed.call(_this, options);
            addEvent();
            opts.addEvented.call(_this, options);
            animate(opts.anim);
            opts.animed.call(_this, options);
            opts.complate.call(_this, options);
        }
        init();
    }
})(window, jQuery);
