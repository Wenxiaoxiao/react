!(function ($) {

    

    /*数字处理*/
    template.helper('numberFormat', function (value) {
        value = parseInt(value);
        if (isNaN(value)) {
            return 0;
        }

        if (value >= 10000) {
            value=value+"";
            var len=value.length;
            value=value.slice(0,len-3);
            return parseFloat(value/10) + "万";
        } else {
            return value
        }
    });
    /*数字处理-保留文字*/
    template.helper('numberFormatSuffix', function (value) {
        var reg=/([0-9]\d*\.?\d*)|(0\.\d*[0-9])/;
        var Suffix=value.replace(reg,"");
        value = parseInt(value);
        if (isNaN(value)) {
            return 0;
        }

        if (value >= 10000) {
            value=value+"";
            var len=value.length;
            value=value.slice(0,len-3);
            return parseFloat(value/10) + "万"+Suffix;
        } else {
            return value+Suffix;
        }
    });
    /*默认头像*/
    template.helper('defaultIco', function (value) {
        return !!value ? value : 'http://file.dakawengu.com/pubimages/headImg.png';
    });


    /*字符串截取*/
    template.helper('subString', function (content, length) {
        if (!content) {
            return "";
        }
        content = content.trim();
        //content=content
        //    .replace(/\[b\]([^\[]*?)\[\/b\]/igm, '<b>$1</b>')
        //    .replace(/\[i\]([^\[]*?)\[\/i\]/igm, '<i>$1</i>')
        //    .replace(/\[span\]([^\[]*?)\[\/span\]/igm, '<span>$1</span>')
        //    .replace(/\[url=([^\]]*)\]([^\[]*?)\[\/url\]/igm, '<a href="$1">$2</a>')
        //    .replace(/\[img\]([^\[]*?)\[\/img\]/igm, '<img src="$1" />');

        if (content.length > length + 1) {
            var first = content.toString().substring(0, length);
            content = first + "...";
        }
        return content;
    });
    /*时间转换*/
    template.helper('trustTime', function (inHisTime, pattern) {
        if (!inHisTime) {
            return;
        }
        inHisTime = inHisTime.toString().trim().replace(/-/gm, "/");
        var date = null,
            now = new Date();
        if (inHisTime.indexOf("/") != -1) {//yyyy-mm-dd HH:mm:ss
            date = new Date(inHisTime);
        } else {
            date = new Date(Number(inHisTime));// long 整型
        }
        var year = date.getFullYear(),
            month = date.getMonth() + 1,
            day = date.getDate(),
            hours = date.getHours(),
            minute = date.getMinutes();
        var minuteTime = (hours < 10 ? "0" + hours : hours) + ":" + (minute < 10 ? "0" + minute : minute),
            monthTime = (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
        if (pattern && pattern.toLowerCase() === "time") {
            return minuteTime;
        } else if (now.toLocaleDateString() === date.toLocaleDateString()) {
            //当天 只显示时间
            return minuteTime;
        } else if (year === now.getFullYear()) {
            //当年 显示 月-日 时间
            return monthTime + " " + minuteTime;
        } else {
            //不是当年
            return year + "-" + monthTime + " " + minuteTime;
        }
    });
     //评论等级
     template.helper('levels', function (level) {
        if(!level)return;
        var l='<img src="./lib/images/bzjh/xx.png" alt="" class="lavels">';
        var html="";
        for(var i=0;i<Number(level);i++){
            html+=l;
        }
        return html;
    })
    
    $.extend({
        layerMsg: function(text,time){
            //中间轻提示框
            layer.open({
                content: text
                ,skin: 'msg'
                ,style: 'bottom:0;'
                ,time: time||2 //2秒后自动关闭
              });
        },
        layerAlert:function(text,btn){
            //ios风格确认按钮弹窗
            layer.open({
                content: text
                ,skin:'lzAlert'
                ,btn: btn || '我知道了'
              });
        },
        layerFooter:function(text){
            //底部提示框
            layer.open({ 
                content: text
                ,skin: 'footer'
              });
        },
        layerLoad:function(text){
            //加载中
            var loading=layer.open({
                type: 2
                ,content: text
                ,shadeClose:false
              });
              return loading
        },
        /**
         * 询问框弹窗
         * text-文字
         * btns-按钮文本
         * yes-成功回调
         * no-失败回调
         */
        layerinquiry:function(text,btns,yes,no){
            var inquiry=layer.open({
                content: text
                ,btn: btns
                ,skin:"inquiry"
                ,yes: function(index){
                  layer.close(inquiry);
                  yes(index);
                },
                no:function(){
                    no();
                }
              });
        }
    });




})(jQuery);


