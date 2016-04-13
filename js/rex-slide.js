;(function(factory){
    if(typeof define === "function" && define.amd && define.amd.jQuery){
        define(["jquery"],factory);
    }else{
        factory(jQuery);
    }
}(function($){

    function Slide(selector, opts){
        // 如果没有传入selector, 报错
        var self = this;
        if(!selector){
            console.log("传参有误");
            return;
        }
        this.obj = $(selector);
        // 先获取默认参数
        this.opts = $.extend({},Slide.Default);
        // 如果有opts,就获取opts
        if(!!opts){
            this.opts = $.extend(this.opts,opts);
        }

        // 创建空间,放置dom元素
        this.dom = {};
        // 创建空间,放置数据
        this.data = {};

        // 初始化
        this.init();

        return {
            "goto" : function(num){
                self.goto.call(self,num);
            },
            "prev" : function(){
                self.prev.call(self);
            },
            "next" : function(){
                self.next.call(self);
            }
        }
        
    }

    Slide.prototype = {
        // 初始化
        "init" : function(){
            // 获取dom元素
            this.getDom();

            // 获取数据
            this.getData();

            // 静态事件
            this.staticEvent();

            // 加载第一张大图
            this.lazyLoad(0);

            // 自动轮播
            this.autoplay();
        },

        // 自动轮播
        "autoplay" : function(){
            var self = this;
            if(self.opts.autoplay!=0){

                play();
                self.obj.hover(function(){
                    clearInterval(self.data.timer);
                },function(){
                    play();
                });
            }

            function play(){
                    clearInterval(self.data.timer);
                    self.data.timer = setInterval(function(){
                        self.next();
                    },self.opts.autoplay);
            }
        },

        // 获取dom元素
        "getDom" : function(){
            this.dom.bigUl = this.obj.find(".showBox ul");
            this.dom.bigLi = this.obj.find(".showBox ul li");
            this.dom.smallUl = this.obj.find(".listBox ul");
            this.dom.smallLi = this.obj.find(".listBox ul li");
            this.dom.prev = this.obj.find(".btn-prev");
            this.dom.next = this.obj.find(".btn-next");
        },

        // 处理数据
        "getData" : function(){
            this.data.bigNow=0;
            this.data.smallNow = 0;
            this.data.count = this.dom.smallLi.size();
        },

        // 静态事件
        "staticEvent" : function(){

            var self = this;

            // 小图点击事件
            this.dom.smallUl.find("li").on("click",function(){
                var _index = $(this).index();
                self.data.bigNow = _index;
                self.goto(self.data.bigNow);
            });

            // 上一张
            this.dom.prev.on("click",function(){
                self.prev.call(self)
            });

            // 下一张
            this.dom.next.on("click",function(){
                self.next.call(self)
            });

        },

        "prev" : function(){
            var self = this;
            self.data.bigNow = self.data.bigNow>0 ? self.data.bigNow-1 : self.data.count-1;
            self.goto(self.data.bigNow);
        },

        "next" : function(){
            var self = this;
            self.data.bigNow = self.data.bigNow<self.data.count-1 ? self.data.bigNow+1 : 0;
            self.goto(self.data.bigNow);
        },

        // 去到某一张
        "goto" : function(num){
            var self = this;
            if(num>self.data.count-1 || num<0){
                console.log("参数有误");
                return;
            }
            self.data.bigNow=num;
            self.lazyLoad(self.data.bigNow);    // 懒加载大图
            self.dom.bigUl.animate({marginLeft:-self.data.bigNow*self.opts.bWidth});

            if(num<self.opts.lock){
                self.data.smallNow=0;
            }else if(num>self.data.count-(self.opts.show-self.opts.lock)){
                self.data.smallNow=self.data.count-self.opts.show;
            }else{
                self.data.smallNow=num-1;
            }
            this.dom.smallLi.removeClass("on").eq(num).addClass("on");
            if(self.data.count<self.opts.show){return;}
            self.dom.smallUl.animate({marginLeft:-self.data.smallNow*self.opts.sWidth});
        },

        "lazyLoad" : function(num){
            var self = this,
                liDom = self.dom.bigLi.eq(num).find("img");
            if(typeof liDom.attr("data-url") != "undefined"){
                liDom.attr("src",liDom.attr("data-url")).removeAttr("data-url");
            }
            
        }
    };

    Slide.Default = {
        "bWidth" : 600, //大图宽度
        "sWidth" : 130, //小图宽度+右边距
        "show" : 4,  //小图显示个数
        "lock" : 1, //小图锁定位置
        "autoplay" : 4000
    };

    $.rexSlide = function(selector,opts){
        return new Slide(selector,opts);
    }
}));
