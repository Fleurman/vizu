var Vizu = (function () {

    const config = {
        transition: "0.3s",
        arrowNavigation:false,
        touchNavigation:true,
        closeBackground: false,
        closeButton: true
    };
    const Listener = {
        branch: function (name,fn) {
            this._listeners[name] = this._listeners[name] || [];
            this._listeners[name].push(fn);
        },
        _listeners: {},
        trigger:function(name){
            this._listeners[name].forEach(function(fn){
                fn();
            });
        }
    };

    const callbacks = {
        preOpen: [],preClose: [],preNext: [],prePrevious: [],preVview: [],preTitle: [],preCount: [],
        open: [],close: [],next: [],previous: [],view: [],title: [],count: []
    };

    let fireEvent = function (key, ev, src) {
        for (let n in callbacks[key]) {
            let fn = callbacks[key][n];
            if (src!==undefined) {
                fn = fn.bind(src);
            }
            fn(ev,Gallery);
        }
    };

    let Error = {
        badListener: function (key) { console.warn("Vizu listener '" + key + "' is not valid. Availaible listeners are : " + Object.keys(callbacks)); },
        badListenerRemove: function (key, fn) { console.warn("Couldn't remove listener '" + fn.toString() + "' on event '" + key + "'"); }
    };

    let Gallery = (function(){
        let o = {
            _single:{},
            images: [],
            next: function () {
                fireEvent("preNext", { id: this.id }, this);
                if (this.id + 1 < this.size)
                    this.id = this.id + 1;
                fireEvent("next", { id: this.id }, this);
            },
            prev: function () {
                fireEvent("prePrevious", { id: this.id }, this);
                if (this.id - 1 > 0)
                    this.id = this.id - 1;
                fireEvent("previous", { id: this.id }, this);
            },
            listen: function (name, fn) {
                this._listeners[name] = fn;
            },
            unlisten: function (name) {
                this._listeners[name] = undefined;
            },
            _listeners: {},
            _id:0
        }
        Object.defineProperty(o, "size", {
            get: function () { return this.images.length; }
        })
        Object.defineProperty(o, "id", {
            get: function () { return this._id; },
            set: function (v) {
                v = Math.max(0, Math.min(v, this.size-1));
                this._id = v;
                for (let p in this._listeners) {
                    this._listeners[p](v);
                }
            }
        })
        Object.defineProperty(o, "isFirst", {
            get: function () { return this.id == 0; },
        })
        Object.defineProperty(o, "isLast", {
            get: function () { return this.size - 1 == this.id; },
        })
        Object.defineProperty(o, "single", {
            get: function () { return this.size == 0; },
        })
        Object.defineProperty(o, "item", {
            get: function () { return this.images[this.id] || this._single; },
        })
        return o;
    })();
    
    let showEl = function () { this.style.display = "block"; };
    let hideEl = function () { this.style.display = "none"; };

    let Vizu = document.createElement("div");
    Vizu.id = "Vizu";
    Vizu.style.opacity = "0";
    Vizu.style.transition = config.transition;
    Listener.branch('config',function(){
        Vizu.style.transition = config.transition;
    })

    Vizu.show = function () { this.style.opacity = 1;this.className = "open"; }
    Vizu.hide = function () { this.style.opacity = 0;this.className = ""; }

    let arrowBlock = false;
    let navigate = function (dir) {
        if (loading) { return; }
        if (Gallery.size > 0) {
            let old = Gallery.id;
            Gallery.id += dir;
            if(old != Gallery.id){
                let element,preEvent,event;
                if(dir>0){
                    element = Next;
                    preEvent = "preNext";
                    event = "next";
                }else{
                    element = Previous;
                    preEvent = "prePrevious";
                    event = "previous";
                }
                fireEvent(preEvent,{id:Gallery.id},element);
                let item = Gallery.item;
                Title.set(item.title);
                Screen.set(item.url);
                arrowBlock = true;
                fireEvent(event,{id:Gallery.id},element);
            }
        }
    };

    let loading = false;
    let Screen = document.createElement("img");
    Screen.id = "VizuScreen";
    Screen.style = "width:auto;height:auto;max-width:100%;max-height:100%;top:50%;left:50%;position:relative;transform:translate(-50%, -50%);transition:"+config.transition;
    Listener.branch('config',function(){
        Screen.style.transition = config.transition;
    })
    Screen.init = function(url){
        this.style.opacity = 1;
        this.src = url;
        loading = false;
    }
    Screen.set = function (url) {
        fireEvent("preView", { value: url }, this);
        this.style.opacity = 0;
        setTimeout(function () {
            let fn = function () {
                this.style.opacity = 1;
                this.removeEventListener("load", fn);
                loading = false;
                fireEvent("view", { value: url }, this);
            };
            this.addEventListener("load", fn);
            this.src = url;
            loading = true;
        }.bind(this), parseFloat(config.transition) * 1000);
    }

    let Title = document.createElement("div");
    Title.id = "VizuTitle";
    Title.set = function (t) {
        fireEvent("preTitle", { value: t }, this);
        this.innerHTML = t;
        fireEvent("title", { value: t }, this);
    }

    let Count = document.createElement("span");
    Count.id = "VizuCount";
    Gallery.listen("count", function () {
        let id = Gallery.id + 1;
        let size = Gallery.size;
        fireEvent("preCount", { id: id, size: size }, Count);
        Count.innerHTML = id + "/" + size;
        fireEvent("count", { id: id, size: size }, Count);
    })

    let Close = document.createElement("div");
    Close.id = "VizuClose";
    Close.addEventListener("click", function(ev) {
        if (config.closeButton) {
            Vizu.close();
        }
    })

    Count.show = Close.show = showEl;
    Count.hide = Close.hide = hideEl;

    let Arrow = function (dir, name) {
        let el = document.createElement("span");
        el.className = "VizuArrow";
        el.id = "Vizu" + name;

        el.onclick = function () { navigate(dir); };

        Gallery.listen("arrows", function () {
            checkArrows();
        })

        el.show = function () { this.style.display = "block"; }
        el.hide = function () { this.style.display = "none"; }
        el.enable = function () { this.classList.remove("disabled"); }
        el.disable = function () { this.classList.add("disabled"); }

        return el;
    }

    let Previous = Arrow(-1, "Previous");
    let Next = Arrow(1, "Next");

    let showArrows = function () {
        Previous.show();
        Next.show();
    }
    let hideArrows = function () {
        Previous.hide();
        Next.hide();
    }
    let checkArrows = function () {
        if (Gallery.size > 0) {
            Previous.enable();
            Next.enable();
            showArrows();
            Count.show();
            if (Gallery.isFirst) {
                Previous.disable();
            }
            if (Gallery.isLast) {
                Next.disable();
            }
        } else {
            hideArrows();
            Count.hide();
        }
        config.closeButton ? Close.show() : Close.hide();
    }
    
    let initVizu = function (item) {
        Title.set(item.title);
        Screen.init(item.url);
    }

    let openVizu = function (item, id) {
        fireEvent("preOpen", { item: item, id: id });
        if (item instanceof Array) {
            openGallery(item, id);
        } else {
            openSingle(item);
        }
        this.className = "open";
        fireEvent("open", { item: item, id: id });
    };

    let keyDownHandler = function (e) {
        if (arrowBlock) { return; }
        if (e.keyCode == 39) {
            navigate(1);
        } else if (e.keyCode == 37) {
            navigate(-1);
        }
    };
    let keyUpHandler = function (e) {
        if (e.keyCode == 39 || e.keyCode == 37) {
            arrowBlock = false;
        }
    };
    let openSingle = function (item) {
        Gallery.id = 0;
        Gallery._single = item;
        initVizu(item);
        Vizu.show();
    };
    let openGallery = function (obj, id) {
        Gallery.images = obj;
        Gallery.id = id ? id-1 : 0;
        let item = obj[Gallery.id];
        initVizu(item);
        checkArrows();
        Vizu.show();
        if(config.arrowNavigation===true){
            window.addEventListener("keydown", keyDownHandler)
            window.addEventListener("keyup", keyUpHandler)
        }
    };

    let closeVizu = function () {
        fireEvent("preClose", {});
        Gallery.images = [];
        Vizu.hide();
        window.removeEventListener("keydown", keyDownHandler)
        window.removeEventListener("keyup", keyUpHandler)
        fireEvent("close", {});
    };

    let addListener = function (key, fn) {
        if (callbacks[key]) {
            callbacks[key].push(fn);
        } else {
            Error.badListener(key)
        }
    };
    let removeListener = function (key, fn) {
        if (callbacks[key]) {
            let id = -1;
            id = callbacks[key].indexOf(fn);
            if (id != -1) {
                callbacks[key].splice(id, 1);
            } else {
                Error.badListenerRemove(key, fn)
            }
        } else {
            Error.badListener(key)
        }
    };

    let touchDirection = function(ev){
        let w = window.innerWidth;
        return ev.clientX > w/2 ? 1 : -1;
    };

    window.addEventListener("click", function (ev) {
        if (config.closeBackground && ev.target == Vizu) {
            Vizu.close();
        }else if(!Gallery.single && config.touchNavigation && ev.target == Screen){
            navigate(touchDirection(ev));
        }
    })

    Vizu.getConfig = function(){return config;};
    Vizu.setConfig = function(table){
        Object.assign(config,table);
        Listener.trigger('config');
    };

    Vizu.open = openVizu;
    Vizu.close = closeVizu;

    Vizu.addVizuListener = addListener;
    Vizu.removeVizuListener = removeListener;

    [Screen,Previous,Next,Close,Count,Title].forEach(function(el){
        Vizu.appendChild(el);
    });

    document.body.appendChild(Vizu);

    return Vizu;

})();