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
            },
            "startAuto" : function(){
                self.startAuto.call(self);
            },
            "stopAuto" : function(){
                self.stopAuto.call(self);
            }
        }
        
    }

    Slide.prototype = {
        // 初始化
        "init" : function(){
            // 处理/获取 dom元素
            this.getDom();

            // 获取数据
            this.getData();

            // 懒加载一次
            this.lazyLoad();

            // 静态事件
            this.staticEvent();

            // 自动轮播
            this.autoplay();
        },

        // 自动轮播
        "autoplay" : function(){
            var self = this;
            if(self.opts.autoplay!=0){
                self.startAuto();
            }
        },
        "play" : function(){
            var self=this;
            clearInterval(self.data.timer);
            self.data.timer = setInterval(function(){
                self.next();
            },self.opts.autoplay);
        },
        "stop" : function(){
            var self=this;
            clearInterval(self.data.timer);
        },

        // 开启自动轮播功能
        "startAuto" : function(){
            var self = this;
            if(self.opts.autoplay==0){
                self.opts.autoplay=Slide.Default.autoplay;
            }
            self.play();
            self.obj.on("mouseover",function(){
                self.stop();
            }).on("mouseout",function(){
                self.play();
            });
        },

        // 移除自动轮播功能
        "stopAuto" : function(){
            var self = this;
            self.stop();
            self.obj.off("mouseover");
            self.obj.off("mouseout");
        },

        // 获取dom元素
        "getDom" : function(){
            var self=this;
            self.dom.bigUl = self.obj.find(".showBox ul");
            self.dom.bigLi = self.obj.find(".showBox ul li");
            self.dom.smallUl = self.obj.find(".listBox ul");
            self.dom.smallLi = self.obj.find(".listBox ul li");
            self.dom.prev = self.obj.find(".btn-prev");
            self.dom.next = self.obj.find(".btn-next");

            // 大图首尾增加一个li
            self.dom.bigUl.prepend(bigLazy.call(self.dom.bigLi.last()).clone().css("marginLeft",-self.opts.bWidth+"px"));
            self.dom.bigUl.append(bigLazy.call(self.dom.bigLi.eq(0)).clone());
        },

        // 处理数据
        "getData" : function(){
            this.data.work = true;
            this.data.bigNow=0;
            this.data.smallNow = 0;
            this.data.count = this.dom.smallLi.size();
        },

        // 静态事件
        "staticEvent" : function(){

            var self = this;

            // 小图点击事件
            this.dom.smallUl.find("li").on("click",function(){
                if(!$(this).is(".on")){
                    var _index = $(this).index();
                    self.data.bigNow = _index;
                    self.goto(self.data.bigNow);
                }
            });

            // 上一张按钮
            this.dom.prev.on("click",function(){
                self.prev.call(self)
            });

            // 下一张按钮
            this.dom.next.on("click",function(){
                self.next.call(self)
            });

        },

        // 上一张
        "prev" : function(){
            var self = this;
            if(self.data.work){
                self.data.work = false;
                self.data.bigNow = self.data.bigNow>0 ? self.data.bigNow-1 : self.data.count-1;
                if(self.data.bigNow == self.data.count-1){
                    self.dom.bigUl.css("marginLeft",-self.data.count*self.opts.bWidth);
                }
                self.goto(self.data.bigNow);
            }
        },

        // 下一张
        "next" : function(){
            var self = this;
            if(self.data.work){
                self.data.work = false;
                self.data.bigNow = self.data.bigNow<self.data.count-1 ? self.data.bigNow+1 : 0;
                if(self.data.bigNow==0){
                    self.dom.bigUl.css("marginLeft",self.opts.bWidth);
                }
                self.goto(self.data.bigNow);
            }
        },

        // 去到某一张
        "goto" : function(num){
            var self = this;
            if(num>self.data.count-1 || num<0){
                return;
            }
            self.data.bigNow=num;
            self.dom.bigUl.animate({marginLeft:-self.data.bigNow*self.opts.bWidth});

            if(num<self.opts.lock){
                self.data.smallNow=0;
            }else if(num>self.data.count-(self.opts.show-self.opts.lock)){
                self.data.smallNow=self.data.count-self.opts.show;
            }else{
                self.data.smallNow=num-self.opts.lock;
            }
            this.dom.smallLi.removeClass("on").eq(num).addClass("on");
            if(self.data.count<self.opts.show){return;}
            self.dom.smallUl.animate({marginLeft:-self.data.smallNow*self.opts.sWidth},function(){
                self.data.work=true;
            });
            self.lazyLoad();
        },

        // 懒加载
        "lazyLoad" : function(){
            var self = this;
            // 大图懒加载
            self.dom.bigLi.each(function(index){
                if(index==self.data.bigNow){
                    bigLazy.call($(this));
                }
            });

            // 小图懒加载
            self.dom.smallLi.each(function(index){
                if(index>self.data.smallNow-1 && index < self.data.smallNow + self.opts.show){
                    smallLazy.call($(this));
                }
            }); 
        },
    };

    // 处理对应li的懒加载内容
    function bigLazy(){
        var img = this.find("img[data-url]");
        img.attr("src",img.attr("data-url")).removeAttr("data-url");
        return this;
    }
    function smallLazy(){
        var img = this.find("img[data-url]");
        img.attr("src",img.attr("data-url")).removeAttr("data-url");
        return this;
    }

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
