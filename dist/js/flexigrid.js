/*
 * Flexigrid for jQuery -  v1.1
 *
 * Copyright (c) 2008 Paulo P. Marinas (code.google.com/p/flexigrid/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 2012-10-26 dingrong add checkbox to each tr at first td,add check all checkbox at the first th
 * 2012-10-29 dingrong fix the bug e is undefined
 * 2012-10-29 dingrong add the option set the grid single select
 * 2012-10-30 dingrong 增加行选中和checkbox选中，改变选中的行的样式
 * 2012-10-30 dingrong 增加获取当前选中列的id的方法
 * 2012-10-30 dingrong 增加获取任意列的值的方法（暂时只能获取排序列的值）
 * 2012-11-9 dingrong 修改选中以后再选中选中状态消失的bug
 * 2012-11-13 dingrong 默认不显示用来隐藏列显示的按钮
 * 2012-11-13 dingrong 数据改为默认json
 * 2012-11-14 dingrong 修改ie8下面不能全选的bug
 * dingrong 2012-11-14 增加行序号显示，需在表头中配置，name写死的"flexigrid_index"，目前只支持json数据格式
 * 2012-11-24 dingrong 增加回调函数在加载数据的时候提供接口操作返回的json对象（加图片，超链接，事件等）
 * 2012-11-24 dingrong 增加列头名称可以通过点取json格式下级数据
 * 2012-11-28 dingrong 修改名字rp->pagesize
 * 2012-12-20 zengxiao 自动补未填充行
 * 2012-12-20 zengxiao 增加checkbox位置
 * 2012-12-22 zengxiao 增加grid数据显示更新
 * 2012-12-26 zengxiao 在绘画之前调用render事件
 * 2013-01-06 zengxiao 增加clearChecked和setChecked方法
 * 2013-01-09 zengxiao 增加setInitChecked和clearCheckedWithStatus/getStatusChange/getCheckedRecords方法来获取变更的信息
 * 2013-02-18 zengxiao 保证设置值在值加载并且绘会完成之后执行,增加值加载状态,loadStatus:loading,error,loaded
 * 2013-02-19 zengxiao 增加数据加载时的遮罩
 * 2013-02-28 zengxiao 增加统计行功能
 * 2013-03-04 zengxiao 增加tip提示列备注
 * 2013-07-22 zengxiao 增加数据追加功能
 * 2016-11-28 zhangxin14 jquery版本升级，增加$.browser兼容方案修改live()方法
 */
(function($) {

	/*
	 * jQuery 1.9 support. browser object has been removed in 1.9
	 */
	var browser = $.browser;

	if (!browser) {
		function uaMatch( ua ) {
			ua = ua.toLowerCase();

			var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
				/(webkit)[ \/]([\w.]+)/.exec( ua ) ||
				/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
				/(msie) ([\w.]+)/.exec( ua ) ||
				ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
				[];

			return {
				browser: match[ 1 ] || "",
				version: match[ 2 ] || "0"
			};
		};

		var matched = uaMatch( navigator.userAgent );
		browser = {};

		if ( matched.browser ) {
			browser[ matched.browser ] = true;
			browser.version = matched.version;
		}

		// Chrome is Webkit, but Webkit is also Safari.
		if ( browser.chrome ) {
			browser.webkit = true;
			browser.msie = false;
			browser.opera = false;
		} else if ( browser.webkit ) {
			browser.safari = true;
			browser.msie = false;
			browser.opera = false;
		}else if(browser.msie){
			browser.msie = true;
			browser.opera = false;
		}else if(browser.opera){
			browser.msie = false;
			browser.opera = true;
		}

		$.browser = browser;
	}

	/*!
	 * START code from jQuery UI
	 *
	 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
	 * Dual licensed under the MIT or GPL Version 2 licenses.
	 * http://jquery.org/license
	 *
	 * http://docs.jquery.com/UI
	 */

	if(typeof $.support.selectstart != 'function') {
		$.support.selectstart = "onselectstart" in document.createElement("div");
	}

	if(typeof $.fn.disableSelection != 'function') {
		$.fn.disableSelection = function() {
			return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
				".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	}

    $.addFlex = function(t, p) {
        if (t.grid) return false; //return if already exist
        p = $.extend({ //apply default properties
            height: 200, //default height
            width: 'auto', //auto width
            striped: true, //apply odd even stripes  默认不区分-------modify by dingrong 2012-10-30--默认区分xx
            novstripe: false,
            rowHeight: 34,
            minwidth: 30, //min width of columns
            minheight: 80, //min height of columns
            resizable: false, //allow table resizing
            url: false, //URL if using data from AJAX
            method: 'POST', //data sending method
            dataType: 'json', //type of data for AJAX, either xml or json -----modify by dingrong 2012-11-13
            timeout: 0, // 设置请求超时时间（毫秒）-- add by chenguanbin 2015-07-28
            errormsg: 'Connection Error',
            usepager: false,
            nowrap: true,
            page: 1, //current page
            total: 1, //total rows
            useRp: true, //use the results per page select box
            rp: 15, //results per page
            rpOptions: [10, 15, 20, 30, 50], //allowed per-page values
            title: false,
            idProperty: 'id',
            pagestat: 'Displaying {from} to {to} of {total} items',
            pagetext: 'Page',
            outof: 'of',
            findtext: 'Find',
            params: [], //allow optional parameters to be passed around
            procmsg: 'Processing, please wait ...',
            query: '',
            qtype: '',
            nomsg: '无记录',
            minColToggle: 1, //minimum allowed column to be hidden
            showToggleBtn: false, //show or hide column toggle popup ------modify by dingrong 2012-11-13
            showCheckbox: true, //show or hide checkbox ------ add by dingrong 2012-10-26
            nameSplit: false, //enable "." to get sub in json --------add by dingrong 2012-11-24
            singleSelect: false, //set the grid single select ------- add by dingrong 2012-10-29
            hideOnSubmit: true,
            autoload: true,
            blockOpacity: 0.5,
            preProcess: false,
            addTitleToCell: false, // add a title attr to cells with truncated contents
            dblClickResize: false, //auto resize column by double clicking
            onDragCol: false,
            onToggleCol: false,
            onChangeSort: false,
            onDoubleClick: false,
            onCellClick: false, //增加列点击事件------------------add by zengxiao 2013-1-6
            onSuccess: false,
            onError: false,
            onSubmit: false, //using a custom populate function
            onLoadData: false, //add by dingrong 2012-11-24
            countColumn: null, //结构以['','']为例
            checkEvent: null,
            resetHeight: false,
            titleColumn: [],
            repaint: null,
            maxPageSize: 9, //最大分页条数 2013-8-13 zengxiao
            isPicture: false,
            template: '<li>' +
                '<div class="iInspir-cover">' +
                '<div class="iInspir-cover-pic">' +
                '<img class="imgloadinglater" src="<&= src &>" ' +
                'data-original="<&= src &>" style="display: inline;"></div>' +
                '<div class="iInspir-cover-msg">' +
                '<p class="iInspir-title"><&= name &></p>' +
                '</div>' +
                '</div>' +
                '</li>'
        }, p);
        p.nomsg = "无记录";
        p.procmsg = "正在加载，请稍候...";
        p.titleColumns = "," + p.titleColumn.join(",") + ",";
        if (p.resetHeight) {
            p.height -= $.flexgridHeadHeight;
            if (p.usepager) {
                p.height -= $.flexgridPageBarHeight;
            }
        }
        $(t).show() //show if hidden
            .attr({
                cellPadding: 0,
                cellSpacing: 0,
                border: 0
            }) //remove padding and spacing
            .removeAttr('width'); //remove width properties
        //create grid class
        var g = {
            hset: {},
            idProperty: p.idProperty,
            colWidth: {},
            totalWidth: 0,
            onLoadedData: [], //add by zengxiao 2013-2-18,增加设置值延后
            rePosDrag: function() {
                var cdleft = 0 - this.hDiv.scrollLeft;
                if (this.hDiv.scrollLeft > 0) cdleft -= Math.floor(p.cgwidth / 2);
                $(g.cDrag).css({
                    top: g.hDiv.offsetTop + 1
                });
                var cdpad = this.cdpad;
                $('div', g.cDrag).hide();
                $('thead tr:first th:visible', this.hDiv).each(function() {
                    var n = $('thead tr:first th:visible', g.hDiv).index(this);
                    var cdpos = parseInt($('div', this).width());
                    if (cdleft == 0) cdleft -= Math.floor(p.cgwidth / 2);
                    cdpos = cdpos + cdleft + cdpad;
                    if (isNaN(cdpos)) {
                        cdpos = 0;
                    }
                    $('div:eq(' + n + ')', g.cDrag).css({
                        'left': cdpos + 'px'
                    }).show();
                    cdleft = cdpos;
                });
            },
            fixHeight: function(newH) {
                newH = false;
                if (!newH) newH = $(g.bDiv).height();
                var hdHeight = $(this.hDiv).height();
                $('div', this.cDrag).each(
                    function() {
                        $(this).height(newH + hdHeight);
                    }
                );
                var nd = parseInt($(g.nDiv).height());
                if (nd > newH) $(g.nDiv).height(newH).width(200);
                else $(g.nDiv).height('auto').width('auto');
                $(g.block).css({
                    height: newH,
                    marginBottom: (newH * -1)
                });
                var hrH = g.bDiv.offsetTop + newH;
                if (p.height != 'auto' && p.resizable) hrH = g.vDiv.offsetTop;
                $(g.rDiv).css({
                    height: hrH
                });
            },
            dragStart: function(dragtype, e, obj) { //default drag function start
                return false; //--------------禁用drag功能--------zengxiao 2013.3.9
                if (dragtype == 'colresize') { //column resize
                    $(g.nDiv).hide();
                    $(g.nBtn).hide();
                    var n = $('div', this.cDrag).index(obj);
                    var ow = $('th:visible div:eq(' + n + ')', this.hDiv).width();
                    $(obj).addClass('dragging').siblings().hide();
                    $(obj).prev().addClass('dragging').show();
                    this.colresize = {
                        startX: e.pageX,
                        ol: parseInt(obj.style.left),
                        ow: ow,
                        n: n
                    };
                    $('body').css('cursor', 'col-resize');
                } else if (dragtype == 'vresize') { //table resize
                    var hgo = false;
                    $('body').css('cursor', 'row-resize');
                    if (obj) {
                        hgo = true;
                        $('body').css('cursor', 'col-resize');
                    }
                    this.vresize = {
                        h: p.height,
                        sy: e.pageY,
                        w: p.width,
                        sx: e.pageX,
                        hgo: hgo
                    };
                } else if (dragtype == 'colMove') { //column header drag
                    $(g.nDiv).hide();
                    $(g.nBtn).hide();
                    this.hset = $(this.hDiv).offset();
                    this.hset.right = this.hset.left + $('table', this.hDiv).width();
                    this.hset.bottom = this.hset.top + $('table', this.hDiv).height();
                    this.dcol = obj;
                    this.dcoln = $('th', this.hDiv).index(obj);
                    this.colCopy = document.createElement("div");
                    this.colCopy.className = "colCopy";
                    this.colCopy.innerHTML = obj.innerHTML;
                    if ($.browser.msie) {
                        this.colCopy.className = "colCopy ie";
                    }
                    $(this.colCopy).css({
                        position: 'absolute',
                        float: 'left',
                        display: 'none',
                        textAlign: obj.align
                    });
                    $('body').append(this.colCopy);
                    $(this.cDrag).hide();
                }
                $('body').noSelect();
            },
            dragMove: function(e) {
                if (this.colresize) { //column resize
                    var n = this.colresize.n;
                    var diff = e.pageX - this.colresize.startX;
                    var nleft = this.colresize.ol + diff;
                    var nw = this.colresize.ow + diff;
                    if (nw > p.minwidth) {
                        $('div:eq(' + n + ')', this.cDrag).css('left', nleft);
                        this.colresize.nw = nw;
                    }
                } else if (this.vresize) { //table resize
                    var v = this.vresize;
                    var y = e.pageY;
                    var diff = y - v.sy;
                    if (!p.defwidth) p.defwidth = p.width;
                    if (p.width != 'auto' && !p.nohresize && v.hgo) {
                        var x = e.pageX;
                        var xdiff = x - v.sx;
                        var newW = v.w + xdiff;
                        if (newW > p.defwidth) {
                            this.gDiv.style.width = newW + 'px';
                            p.width = newW;
                        }
                    }
                    var newH = v.h + diff;
                    if ((newH > p.minheight || p.height < p.minheight) && !v.hgo) {
                        this.bDiv.style.height = newH + 'px';
                        p.height = newH;
                        this.fixHeight(newH);
                    }
                    v = null;
                } else if (this.colCopy) {
                    $(this.dcol).addClass('thMove').removeClass('thOver');
                    if (e.pageX > this.hset.right || e.pageX < this.hset.left || e.pageY > this.hset.bottom || e.pageY < this.hset.top) {
                        //this.dragEnd();
                        $('body').css('cursor', 'move');
                    } else {
                        $('body').css('cursor', 'pointer');
                    }
                    $(this.colCopy).css({
                        top: e.pageY + 10,
                        left: e.pageX + 20,
                        display: 'block'
                    });
                }
            },
            dragEnd: function() {
                if (this.colresize) {
                    var n = this.colresize.n;
                    var nw = this.colresize.nw;
                    $('th:visible div:eq(' + n + ')', this.hDiv).css('width', nw);
                    $('tr', this.bDiv).each(
                        function() {
                            var $tdDiv = $('td:visible div:eq(' + n + ')', this);
                            $tdDiv.css('width', nw);
                            g.addTitleToCell($tdDiv);
                        }
                    );
                    this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                    $('div:eq(' + n + ')', this.cDrag).siblings().show();
                    $('.dragging', this.cDrag).removeClass('dragging');
                    this.rePosDrag();
                    this.fixHeight();
                    this.colresize = false;
                    if ($.cookies) {
                        var name = p.colModel[n].name; // Store the widths in the cookies
                        $.cookie('flexiwidths/' + name, nw);
                    }
                } else if (this.vresize) {
                    this.vresize = false;
                } else if (this.colCopy) {
                    $(this.colCopy).remove();
                    if (this.dcolt != null) {
                        if (this.dcoln > this.dcolt) $('th:eq(' + this.dcolt + ')', this.hDiv).before(this.dcol);
                        else $('th:eq(' + this.dcolt + ')', this.hDiv).after(this.dcol);
                        this.switchCol(this.dcoln, this.dcolt);
                        $(this.cdropleft).remove();
                        $(this.cdropright).remove();
                        this.rePosDrag();
                        if (p.onDragCol) {
                            p.onDragCol(this.dcoln, this.dcolt);
                        }
                    }
                    this.dcol = null;
                    this.hset = null;
                    this.dcoln = null;
                    this.dcolt = null;
                    this.colCopy = null;
                    $('.thMove', this.hDiv).removeClass('thMove');
                    $(this.cDrag).show();
                }
                $('body').css('cursor', 'default');
                $('body').noSelect(false);
            },
            toggleCol: function(cid, visible) {
                var ncol = $("th[axis='col" + cid + "']", this.hDiv)[0];
                var n = $('thead th', g.hDiv).index(ncol);
                var cb = $('input[value=' + cid + ']', g.nDiv)[0];
                if (visible == null) {
                    visible = ncol.hidden;
                }
                if ($('input:checked', g.nDiv).length < p.minColToggle && !visible) {
                    return false;
                }
                if (visible) {
                    ncol.hidden = false;
                    $(ncol).show();
                    cb.checked = true;
                } else {
                    ncol.hidden = true;
                    $(ncol).hide();
                    cb.checked = false;
                }
                $('tbody tr', t).each(
                    function() {
                        if (visible) {
                            $('td:eq(' + n + ')', this).show();
                        } else {
                            $('td:eq(' + n + ')', this).hide();
                        }
                    }
                );
                this.rePosDrag();
                if (p.onToggleCol) {
                    p.onToggleCol(cid, visible);
                }
                return visible;
            },
            switchCol: function(cdrag, cdrop) { //switch columns
                $('tbody tr', t).each(
                    function() {
                        if (cdrag > cdrop) $('td:eq(' + cdrop + ')', this).before($('td:eq(' + cdrag + ')', this));
                        else $('td:eq(' + cdrop + ')', this).after($('td:eq(' + cdrag + ')', this));
                    }
                );
                //switch order in nDiv
                if (cdrag > cdrop) {
                    $('tr:eq(' + cdrop + ')', this.nDiv).before($('tr:eq(' + cdrag + ')', this.nDiv));
                } else {
                    $('tr:eq(' + cdrop + ')', this.nDiv).after($('tr:eq(' + cdrag + ')', this.nDiv));
                }
                if ($.browser.msie && $.browser.version < 7.0) {
                    $('tr:eq(' + cdrop + ') input', this.nDiv)[0].checked = true;
                }
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
            },
            scroll: function() {
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                this.rePosDrag();
            },
            //add by dingrong 2012-11-24
            getValue: function(data, name) {
                if ((!name) || (!data)) {
                    return;
                }
                names = name.split(".");
                var val = data[names[0]];
                for (var i = 1; val && i < names.length; i++) {
                    val = val[names[i]];
                }
                return val;
            },
            //默认tr高度值为30
            rowHeight: p.rowHeight,
            //-------------------增加更新grid内容方法-zengxiao 2012.12.22
            lastData: [],
            updateShow: function() {
                $("input[type=checkbox]", g.hDiv).removeAttr('checked');
                this.addData(this.lastData);
            },
            addData: function(data) { //parse data
                this.lastData = data;
                var columns = {},
                    columnstr;
                if (p.countColumn != null) {
                    columnstr = "," + p.countColumn.join(",") + ",";
                    for (var i = 0; i < p.countColumn.length; i++) {
                        columns[p.countColumn[i]] = 0;
                    }
                }
                if (p.dataType == 'json') {
                    /************处理兼容不分页的情况:zengxiao**************/
                    if ($.isArray(data)) {
                        data = {
                            rows: data,
                            page: 1,
                            total: data.length
                        };
                    }
                    /************处理兼容不分页的情况**************/
                    data = $.extend({
                        rows: [],
                        page: 0,
                        total: 0
                    }, data);
                }
                if (p.preProcess) {
                    data = p.preProcess(data);
                }
                $('.pReload', this.pDiv).removeClass('loading');
                this.loading = false;
                if (!data) {
                    $('.pPageStat', this.pDiv).html(p.errormsg);
                    return false;
                }
                if (p.dataType == 'xml') {
                    p.total = +$('rows total', data).text();
                } else {
                    p.total = data.total;
                }
                if (p.total == 0 && !p.isPicture) {
                    $('tr, a, td, div', t).unbind();
                    $(t).empty();
                    var tbody = document.createElement('tbody');
                    $(t).append(tbody);
                    p.pages = 1;
                    p.page = 1;
                    var tr;
                    /************增加显示行数:zengxiao----2012.12.22**************/
                    var trNum = parseInt(($(this.bDiv).height() - 2) / this.rowHeight);
                    for (var i = 0; i < trNum; i++) {
                        tr = document.createElement('tr');
                        $(tr).height(this.rowHeight);
                        if (i % 2 && p.striped) tr.className = 'erow noclick-event';
                        else
                            tr.className = 'noclick-event';
                        $('thead tr:first th', g.hDiv).each( //add cell
                            function(index, element) {
                                var td = document.createElement('td');
                                if (i == 0) {
                                    $(td).width(g.colWidth[index]);
                                }
                                $(tr).append(td);
                                td = null;
                            }
                        );
                        if ($('thead', this.gDiv).length < 1) { //handle if grid has no headers
                            for (idx = 0; idx < cell.length; idx++) {
                                var td = document.createElement('td');
                                $(tr).append(td);
                                td = null;
                            }
                        }
                        $(tbody).append(tr);
                        tr = null;
                    }
                    /************增加显示行数结束**************/
                    this.buildpager();
                    $('.pPageStat', this.pDiv).html(p.nomsg);
                    return false;
                }
                p.pages = Math.ceil(p.total / p.rp);
                if (p.dataType == 'xml') {
                    p.page = +$('rows page', data).text();
                } else {
                    p.page = data.page;
                }
                this.buildpager();

                //build new body
                if (p.isPicture) {
                    var tbody = $('<ul class="Inspir-list cl"></ul>');
                    if (data.rows == null) {
                        data.rows = [];
                    }
                    $.each(data.rows, function(n, index) {
                        tbody.append($($.template(p.template, index)));
                    });
                    // this.lastData = data.rows;
                } else {
                    var tbody = document.createElement('tbody');
                    if (p.dataType == 'json') {
                        $.each(data.rows, function(i, row) {
                            var tr = document.createElement('tr');
                            $(tr).height(this.rowHeight);
                            row._status = 0; // 增加选中标识和数据保存 0:初始未选中 1:初始选中
                            $(tr).data('flexgridRecord', row);
                            if (row.name) tr.name = row.name;
                            if (row.color) {
                                $(tr).css('background', row.color);
                            } else {
                                if (i % 2 && p.striped) tr.className = 'erow';
                            }
                            if (row[p.idProperty]) {
                                tr.id = 'row' + row[p.idProperty];
                            }
                            row["flexigrid_index"] = (p.page - 1) * p.rp + i + 1; //在json数据中加上序号------------------dingrong 2012-11-14
                            $('thead tr:first th', g.hDiv).each( //add cell
                                function() {
                                    var td = document.createElement('td');
                                    var idx = $(this).attr('axis').substr(3);
                                    $(td).width(g.colWidth[idx]);
                                    $(td).css('textAlign', $(this).attr('align'));
                                    var _val;
                                    td.align = this.align;
                                    // If each row is the object itself (no 'cell' key)
                                    if (typeof row.cell == 'undefined') {
                                        //modify by dingrong 2012-11-24
                                        if (p.nameSplit) {
                                            _val = g.getValue(row, p.colModel[idx].name);
                                        } else {
                                            _val = row[p.colModel[idx].name];
                                        }
                                    } else {
                                        // If the json elements aren't named (which is typical), use numeric order
                                        if (typeof row.cell[idx] != "undefined") {
                                            _val = (row.cell[idx] != null) ? row.cell[idx] : ''; //null-check for Opera-browser
                                        } else {
                                            _val = row.cell[p.colModel[idx].name];
                                        }
                                    }
                                    //----------add checkbox to each tr ----------------add by dingrong 2012-10-26
                                    if (p.showCheckbox && idx == p.showCheckboxNum) {
                                        $(td).append("<div><input type='checkbox' hik=flexigrid_checkbox value='" + _val + "'/></div>");
                                        $('div', td).width(g.colWidth[idx] - 10);
                                    } else {
                                        //增加统计功能
                                        if (p.countColumn != null) {
                                            if (columnstr.indexOf("," + p.colModel[idx].name + ",") > -1) {
                                                columns[p.colModel[idx].name] += ((isNaN(_val) || _val == '') ? 0 : parseInt(_val));
                                            }
                                        }
                                        //增加真写之前的事件---------zengxiao 2012-12-26
                                        if (p.colModel[idx] != null && p.colModel[idx].render != null && $.isFunction(p.colModel[idx].render)) {
                                            _val = p.colModel[idx].render(_val, p.colModel[idx].name, row);
                                        }

                                        if (_val == null) _val = "";
                                        td.innerHTML = "<div>" + _val + "</div>";
                                        $('div', td).width(g.colWidth[idx] - 10);
                                        if (p.titleColumns.indexOf("," + p.colModel[idx].name + ",") > -1) {

                                            $(td).attr("title", $(td).text());
                                            // $(td).attr("title",$(td).text().addSpace());
                                        }
                                    }
                                    //----------end add checkbox
                                    // If the content has a <BGCOLOR=nnnnnn> option, decode it.
                                    var offs = td.innerHTML.indexOf('<BGCOLOR=');
                                    if (offs > 0) {
                                        $(td).css('background', text.substr(offs + 7, 7));
                                    }
                                    //增加onCellClick事件-----------zengxiao 2013-1-6
                                    if (p.onCellClick && $.isFunction(p.onCellClick)) {
                                        $(td).bind('click', {
                                            record: row,
                                            name: p.colModel[idx].name
                                        }, p.onCellClick);
                                    }
                                    $(td).attr('abbr', $(this).attr('abbr'));
                                    $(tr).append(td);
                                    td = null;
                                }
                            );
                            if ($('thead', this.gDiv).length < 1) { //handle if grid has no headers
                                for (idx = 0; idx < cell.length; idx++) {
                                    var td = document.createElement('td');
                                    // If the json elements aren't named (which is typical), use numeric order
                                    if (typeof row.cell[idx] != "undefined") {
                                        td.innerHTML = (row.cell[idx] != null) ? row.cell[idx] : ''; //null-check for Opera-browser
                                    } else {
                                        td.innerHTML = row.cell[p.colModel[idx].name];
                                    }
                                    $(tr).append(td);
                                    td = null;
                                }
                            }
                            $(tbody).append(tr);
                            tr = null;
                        });
                    }
                }

                var startRow = data.rows.length;
                /************增加统计行***************/
                if (p.countColumn != null) {
                    var tr = document.createElement('tr');
                    $(tr).height(this.rowHeight);
                    if (startRow % 2 && p.striped) tr.className = 'erow noclick-event';
                    else
                        tr.className = 'noclick-event';
                    $('thead tr:first th', g.hDiv).each( //add cell
                        function(idx, item) {
                            var td = document.createElement('td');
                            $(td).width(g.colWidth[idx]);
                            $(td).css('textAlign', $(this).attr('align'));
                            if (idx == 0) {
                                td.innerHTML = "<label class='flex-count-label'>合计</label>";
                            } else if (columns[p.colModel[idx].name] != null) {
                                td.innerHTML = "<label class='flex-count-inner'>" + columns[p.colModel[idx].name] + "</label>";
                            }
                            $(tr).append(td);
                            td = null;
                        }
                    );

                    $(tbody).append(tr);
                    tr = null;
                    startRow++;
                }
                /************增加显示行数:zengxiao**************/
                var trNum = parseInt(($(t).parent().height() - 2) / this.rowHeight);
                var maxNum = trNum;
                /*				if(p.usepager==true){
                					maxNum = p.rp;
                				}*/
                if (!p.isPicture) {
                    for (var i = startRow; i < maxNum; i++) {
                        var tr = document.createElement('tr');
                        $(tr).height(this.rowHeight);
                        if (i % 2 && p.striped) tr.className = 'erow noclick-event';
                        else
                            tr.className = 'noclick-event';
                        $('thead tr:first th', g.hDiv).each( //add cell
                            function() {
                                var td = document.createElement('td');
                                $(tr).append(td);
                                td = null;
                            }
                        );
                        if ($('thead', this.gDiv).length < 1) { //handle if grid has no headers
                            for (idx = 0; idx < cell.length; idx++) {
                                var td = document.createElement('td');
                                $(tr).append(td);
                                td = null;
                            }
                        }
                        $(tbody).append(tr);
                        tr = null;
                    }
                }


                /************增加显示行数结束**************/
                $('tr', t).unbind();
                $(t).empty();


                $(t).append(tbody);
                //				this.addCellProp();
                this.addRowProp();
                //				this.rePosDrag();
                tbody = null;
                data = null;
                i = null;
                // 设置行选择事件和checkbox选择事件，改变选中的样式 ------------------dingrong 2012-10-30
                if (p.showCheckbox) {
                    //去除增加额外行的筛选功能------zengxiao
                    $("tr:not(.noclick-event)", g.bDiv).click(function() { //行单击事件
                        if (p.showCheckbox && $.isFunction(p.checkEvent)) {
                            if (!p.checkEvent($(this).data("flexgridRecord"), g.checkboxFlag)) {
                                g.checkboxFlag = false;
                                return;
                            }
                        }
                        g.checkboxFlag = false;
                        if (p.showCheckbox && $("input[type=checkbox][hik=flexigrid_checkbox]", this).attr("disabled") != null) {
                            return;
                        }
                        if ($("input[type=checkbox][hik=flexigrid_checkbox]", this).attr("checked")) {
                            g.checkedHandle($("input[type=checkbox][hik=flexigrid_checkbox]", this));
                            $("input[type=checkbox][hik=flexigrid_checkbox]", this).attr("checked", false);
                            $("input[type=checkbox]", g.hDiv).attr("checked", false);
                        } else {
                            g.checkedHandle($("input[type=checkbox][hik=flexigrid_checkbox]", this));
                            $("input[type=checkbox][hik=flexigrid_checkbox]", this).attr("checked", true);
                            if ($("input[type=checkbox][hik=flexigrid_checkbox]:checked", g.bDiv).length ==
                                $("input[type=checkbox][hik=flexigrid_checkbox]", g.bDiv).length) {
                                $("input[type=checkbox]", g.hDiv).attr("checked", true);
                            }
                        }

                        //设置全选框状态
                        /*						if($("input[type=checkbox][hik=flexigrid_checkbox]",g.bDiv).length===$("input[type=checkbox][hik=flexigrid_checkbox]:checked",g.bDiv).length){
                        							$("input[type=checkbox]",g.hDiv).attr("checked",true);
                        						}else{
                        							$("input[type=checkbox]",g.hDiv).attr("checked",false);
                        						}*/
                    });
                    $("input[type=checkbox][hik=flexigrid_checkbox]", g.bDiv).click(function(event) { //checkbox选中事件
                        /*
                        event.stopPropagation();
                        return;
                        if(p.showCheckbox&&$.isFunction(p.checkEvent)){
                        	if(!p.checkEvent($(this).data("flexgridRecord"))){*/
                        g.checkboxFlag = true;
                        $(this).attr("checked", !$(this).attr('checked'));
                        /*		return;
                        	}
                        }*/
                        //设置全选框状态
                        /*if($("input[type=checkbox][hik=flexigrid_checkbox]",g.bDiv).length===$("input[type=checkbox][hik=flexigrid_checkbox]:checked",g.bDiv).length){
                        	$("input[type=checkbox]",g.hDiv).attr("checked",true);
                        }else{
                        	$("input[type=checkbox]",g.hDiv).attr("checked",false);
                        }*/
                        //event.stopPropagation();
                    });
                    $("input[type=checkbox]", g.hDiv).on('click', function() { //修改IE8下面不能全选的bug---------------------dingrong 2012-11-14
                        var checked = this.checked;
                        $("input[hik=flexigrid_checkbox]", g.bDiv).each(function() {
                            if ($(this).attr('disabled') != null) return;
                            if (p.showCheckbox && $.isFunction(p.checkEvent)) {
                                if (!p.checkEvent($(this).parents("tr").last().data("flexgridRecord"))) {
                                    return;
                                }
                            }
                            this.checked = checked;
                        });
                        g.checkedHandle();
                    });
                }
                //end add
                if (p.onSuccess) {
                    p.onSuccess(this);
                }
                if (p.hideOnSubmit) {
                    $(g.block).remove();
                }
                this.hDiv.scrollLeft = this.bDiv.scrollLeft;
                if ($.browser.opera) {
                    $(t).css('visibility', 'visible');
                }

                if (p.repaint != null) {
                    p.repaint();
                }
            },
            changeSort: function(th) { //change sortOrder
                if (this.loading) {
                    return true;
                }
                $(g.nDiv).hide();
                $(g.nBtn).hide();
                if (p.sortName == $(th).attr('abbr')) {
                    if (p.sortOrder == 'asc') {
                        p.sortOrder = 'desc';
                    } else {
                        p.sortOrder = 'asc';
                    }
                }
                $(th).addClass('sorted').siblings().removeClass('sorted');
                $('.sdesc', this.hDiv).removeClass('sdesc');
                $('.sasc', this.hDiv).removeClass('sasc');
                $('div', th).addClass('s' + p.sortOrder);
                p.sortName = $(th).attr('abbr');
                if (p.onChangeSort) {
                    p.onChangeSort(p.sortName, p.sortOrder);
                } else {
                    this.populate();
                }
            },
            buildpager: function() { //rebuild pager based on new properties
                //$('.pcontrol input', this.pDiv).val(p.page);
                //$('.pcontrol span', this.pDiv).html(p.pages);
                /*				var r1 = (p.page - 1) * p.rp + 1;
                				var r2 = r1 + p.rp - 1;
                				if (p.total < r2) {
                					r2 = p.total;
                				}*/
                var stat = "共 {total} 条记录"; //p.pagestat;
                //				stat = stat.replace(/{from}/, r1);
                //				stat = stat.replace(/{to}/, r2);
                stat = stat.replace(/{total}/, p.total);
                $('.pPageStat', this.pDiv).html(stat);
                //依据记录页数重绘翻页条
                //				p.pages=18;
                var btns = $('[name=btns]', g.pDiv),
                    tmpBtnNo = 3;
                var leftBtnNo = (p.maxPageSize - 3) / 2;
                btns.empty();
                $('input', g.pDiv).val(p.page);
                if (p.pages <= p.maxPageSize) {
                    for (var i = 0; i < p.pages; i++) {
                        btns.append('<button class="btn btn-small' + (i == (p.page - 1) ? ' active' : '') + '" title="' + (i + 1) + '">' + (i + 1) + '</button>');
                    }
                } else {
                    if (p.page > (leftBtnNo + 2)) {
                        //说明前面会出现...
                        btns.append('<button class="btn btn-small">1</button>');
                        btns.append('<span name="cantSelect">...</span>');
                        tmpBtnNo = (p.pages - p.page < (leftBtnNo + 1)) ? (p.maxPageSize - 2 + p.page - p.pages) : leftBtnNo;
                        for (var i = 1; i < tmpBtnNo; i++) {
                            btns.append('<button class="btn btn-small" title="' + (i + p.page - tmpBtnNo) + '">' + (i + p.page - tmpBtnNo) + '</button>');
                        }
                        btns.append('<button class="btn btn-small active" title="' + p.page + '">' + p.page + '</button>');
                        if (p.pages - p.page > (leftBtnNo + 1)) {
                            //后面需要加...
                            for (var i = 1; i < leftBtnNo; i++) {
                                btns.append('<button class="btn btn-small" title="' + (i + p.page) + '">' + (i + p.page) + '</button>');
                            }
                            btns.append('<span name="cantSelect">...</span>');
                            btns.append('<button class="btn btn-small" title="' + p.pages + '">' + p.pages + '</button>');
                        } else {
                            for (var i = p.page; i < p.pages; i++) {
                                btns.append('<button class="btn btn-small" title="' + (i + 1) + '">' + (i + 1) + '</button>');
                            }
                        }
                    } else {
                        //前面不需要...
                        for (var i = 1; i <= p.maxPageSize - 2; i++) {
                            btns.append('<button class="btn btn-small' + ((p.page == i) ? ' active' : '') + '" title="' + i + '">' + i + '</button>');
                        }
                        btns.append('<span name="cantSelect">...</span>');
                        btns.append('<button class="btn btn-small" title="' + p.pages + '">' + p.pages + '</button>');
                    }
                }
                $('button', btns).click(function() {
                    g.changePage($(this).text());
                });
                if (p.page == p.pages) {
                    //最后一页
                    $('button[name=nextBtn]', g.pDiv).attr('disabled', true);
                } else {
                    $('button[name=nextBtn]', g.pDiv).removeAttr('disabled');
                }
                if (p.page == 1) {
                    //第一页
                    $('button[name=preBtn]', g.pDiv).attr('disabled', true);
                } else {
                    $('button[name=preBtn]', g.pDiv).removeAttr('disabled');
                }
            },
            populate: function() { //get latest data
                if (p.onSubmit) {
                    var gh = p.onSubmit();
                    if (!gh) {
                        return false;
                    }
                }
                if (!p.url) {
                    return false;
                }
                $('.pPageStat', this.pDiv).html(p.procmsg);
                $('.pReload', this.pDiv).addClass('loading');
                $(g.block).css({
                    top: g.bDiv.offsetTop
                });
                if (p.hideOnSubmit) {
                    $(this.gDiv).prepend(g.block);
                }
                if ($.browser.opera) {
                    $(t).css('visibility', 'hidden');
                }
                if (!p.newp) {
                    p.newp = 1;
                }
                if (p.page > p.pages) {
                    p.page = p.pages;
                }
                var param = [{
                    name: 'pageNo',
                    value: p.newp
                }, {
                    name: 'pageSize', //dingrong 2012-11-28 修改名字rp->pagesize
                    value: p.rp
                }, {
                    name: 'sortName',
                    value: p.sortName
                }, {
                    name: 'sortOrder',
                    value: p.sortOrder
                }, {
                    name: 'query',
                    value: p.query
                }, {
                    name: 'qtype',
                    value: p.qtype
                }];
                if (p.params.length) {
                    for (var pi = 0; pi < p.params.length; pi++) {
                        if (typeof p.params[pi].value == "string") {
                            p.params[pi].value = p.params[pi].value; //.replace(/_/g,'\\_');
                        }
                        param[param.length] = p.params[pi];
                    }
                }
                g.loadStatus = 'loading';
                $.ajax({
                    type: p.method,
                    url: p.url,
                    data: param,
                    dataType: p.dataType,
                    timeout: p.timeout,
                    success: function(data) {
                        g.loadStatus = 'loaded';
                        if (p.onLoadData) {
                            p.onLoadData(data);
                        }
                        g.addData(data);
                        if (g.onLoadedData != null) {
                            $.each(g.onLoadedData, function(index, item) {
                                item();
                            });
                            delete g.onLoadedData;
                            g.onLoadedData = [];
                        }
                    },
                    complete: function() {
                        $("input[type=checkbox]", g.hDiv).removeAttr('checked');
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                        try {
                            if (p.onError) p.onError(XMLHttpRequest, textStatus, errorThrown);
                        } catch (e) {}
                    }
                });
            },
            doSearch: function() {
                p.query = $('input[name=q]', g.sDiv).val();
                p.qtype = $('select[name=qtype]', g.sDiv).val();
                p.newp = 1;
                this.populate();
            },
            changePage: function(ctype) { //change page
                if (this.loading) {
                    return true;
                }
                switch (ctype) {
                    case 'first':
                        p.newp = 1;
                        break;
                    case 'prev':
                        if (p.page > 1) {
                            p.newp = parseInt(p.page) - 1;
                        }
                        break;
                    case 'next':
                        if (p.page < p.pages) {
                            p.newp = parseInt(p.page) + 1;
                        }
                        break;
                    case 'last':
                        p.newp = p.pages;
                        break;
                    case 'input':
                        var nv = parseInt($('input', this.pDiv).val().replace(/^0*/, ""));
                        if (isNaN(nv)) {
                            nv = 1;
                        }
                        if (nv < 1) {
                            nv = 1;
                        } else if (nv > p.pages) {
                            nv = p.pages;
                        }
                        $('input', this.pDiv).val(nv);
                        p.newp = nv;
                        break;
                    default:
                        p.newp = parseInt(ctype);
                        break;
                }
                if (p.newp == p.page) {
                    return false;
                }
                if (p.onChangePage) {
                    p.onChangePage(p.newp);
                } else {
                    this.populate();
                }
            },
            addCellProp: function() {
                $('tbody tr td', g.bDiv).each(function() {
                    var tdDiv = document.createElement('div');
                    var n = $('td', $(this).parent()).index(this);
                    var pth = $('th:eq(' + n + ')', g.hDiv).get(0);
                    if (pth != null) {
                        if (p.sortName == $(pth).attr('abbr') && p.sortName) {
                            this.className = 'sorted';
                        }
                        $(tdDiv).css({
                            textAlign: pth.align,
                            width: $('div:first', pth)[0].style.width
                        });
                        if (pth.hidden) {
                            $(this).css('display', 'none');
                        }
                    }

                    if (p.nowrap == false) {
                        $(tdDiv).css('white-space', 'normal');
                    }
                    if (this.innerHTML == '') {
                        this.innerHTML = '&nbsp;';
                    }
                    tdDiv.innerHTML = this.innerHTML;
                    var prnt = $(this).parent()[0];
                    var pid = false;
                    if (prnt.id) {
                        pid = prnt.id.substr(3);
                    }
                    if (pth != null) {
                        if (pth.process) pth.process(tdDiv, pid);
                    }
                    $(this).empty().append(tdDiv).removeAttr('width'); //wrap content
                    //					g.addTitleToCell(tdDiv);
                });
            },
            getCellDim: function(obj) { // get cell prop for editable event
                var ht = parseInt($(obj).height());
                var pht = parseInt($(obj).parent().height());
                var wt = parseInt(obj.style.width);
                var pwt = parseInt($(obj).parent().width());
                var top = obj.offsetParent.offsetTop;
                var left = obj.offsetParent.offsetLeft;
                var pdl = parseInt($(obj).css('paddingLeft'));
                var pdt = parseInt($(obj).css('paddingTop'));
                return {
                    ht: ht,
                    wt: wt,
                    top: top,
                    left: left,
                    pdl: pdl,
                    pdt: pdt,
                    pht: pht,
                    pwt: pwt
                };
            },
            addRowProp: function() {
                //去除增加额外行的筛选功能------zengxiao
                $('tbody tr:not(.noclick-event)', g.bDiv).each(function() {
                    $(this).click(function(e) {
                        var obj = (e.target || e.srcElement);
                        if (obj.href || obj.type) return true;
                        if (p.singleSelect || !g.multisel) {
                            $(this).siblings().removeClass('trSelected');
                        }
                        $(this).addClass('trSelected'); //move this down by dingrong 2012-10-29 fix 2012-11-9
                    }).mousedown(function(e) {
                        if (e.shiftKey) {
                            if (!p.singleSelect) {
                                $(this).addClass('trSelected'); //fix 2012-11-9
                                g.multisel = true;
                                this.focus();
                                $(g.gDiv).noSelect();
                            }
                        }
                        if (e.ctrlKey) {
                            if (!p.singleSelect) {
                                $(this).addClass('trSelected'); //fix 2012-11-9
                                g.multisel = true;
                                this.focus();
                            }
                        }
                    }).mouseup(function(e) { //add e by dingrong 2012-10-29
                        if (g.multisel && !e.ctrlKey) {
                            g.multisel = false;
                            $(g.gDiv).noSelect(false);
                        }
                    }).dblclick(function() {
                        if (p.onDoubleClick) {
                            p.onDoubleClick(this, g, p);
                        }
                    }).hover(function(e) {
                        if (g.multisel && e.shiftKey) {
                            $(this).toggleClass('trSelected');
                        }
                    }, function() {});
                    if ($.browser.msie && $.browser.version < 7.0) {
                        $(this).hover(function() {
                            $(this).addClass('trOver');
                        }, function() {
                            $(this).removeClass('trOver');
                        });
                    }
                });
            },

            combo_flag: true,
            combo_resetIndex: function(selObj) {
                if (this.combo_flag) {
                    selObj.selectedIndex = 0;
                }
                this.combo_flag = true;
            },
            combo_doSelectAction: function(selObj) {
                eval(selObj.options[selObj.selectedIndex].value);
                selObj.selectedIndex = 0;
                this.combo_flag = false;
            },
            //Add title attribute to div if cell contents is truncated
            addTitleToCell: function(tdDiv) {
                if (p.addTitleToCell) {
                    var $span = $('<span />').css('display', 'none'),
                        $div = (tdDiv instanceof jQuery) ? tdDiv : $(tdDiv),
                        div_w = $div.outerWidth(),
                        span_w = 0;

                    $('body').children(':first').before($span);
                    $span.html($div.html());
                    $span.css('font-size', '' + $div.css('font-size'));
                    $span.css('padding-left', '' + $div.css('padding-left'));
                    span_w = $span.innerWidth();
                    $span.remove();

                    if (span_w > div_w) {
                        $div.attr('title', $div.text());
                    } else {
                        $div.removeAttr('title');
                    }
                }
            },
            autoResizeColumn: function(obj) {
                if (!p.dblClickResize) {
                    return;
                }
                var n = $('div', this.cDrag).index(obj),
                    $th = $('th:visible div:eq(' + n + ')', this.hDiv),
                    ol = parseInt(obj.style.left),
                    ow = $th.width(),
                    nw = 0,
                    nl = 0,
                    $span = $('<span />');
                $('body').children(':first').before($span);
                $span.html($th.html());
                $span.css('font-size', '' + $th.css('font-size'));
                $span.css('padding-left', '' + $th.css('padding-left'));
                $span.css('padding-right', '' + $th.css('padding-right'));
                nw = $span.width();
                $('tr', this.bDiv).each(function() {
                    var $tdDiv = $('td:visible div:eq(' + n + ')', this),
                        spanW = 0;
                    $span.html($tdDiv.html());
                    $span.css('font-size', '' + $tdDiv.css('font-size'));
                    $span.css('padding-left', '' + $tdDiv.css('padding-left'));
                    $span.css('padding-right', '' + $tdDiv.css('padding-right'));
                    spanW = $span.width();
                    nw = (spanW > nw) ? spanW : nw;
                });
                $span.remove();
                nw = (p.minWidth > nw) ? p.minWidth : nw;
                nl = ol + (nw - ow);
                $('div:eq(' + n + ')', this.cDrag).css('left', nl);
                this.colresize = {
                    nw: nw,
                    n: n
                };
                g.dragEnd();
            },
            pager: 0,
            //set checked style add by dingrong 2012-10-30
            checkedHandle: function(me) {
                if (p.showCheckbox) {
                    if (me) {
                        $(me).parents("tr").toggleClass("trchecked");
                    } else {
                        /*$("tr",g.bDiv).has("input[type=checkbox][hik=flexigrid_checkbox]").each(function(){
                        	$(this).removeClass("trchecked");
                        });
                        $("tr",g.bDiv).has("input[type=checkbox][hik=flexigrid_checkbox]:checked").each(function(){
                        	$(this).addClass("trchecked");
                        })*/
                        $("input[hik=flexigrid_checkbox]:checked").parent().parent().addClass("trchecked");
                        $("input[hik=flexigrid_checkbox]:not(:checked)").parent().parent().removeClass("trchecked");
                    }
                }
            },
            getP: function() {
                    return p;
                }
                //end set checked
        };
        if (p.colModel) { //create model if any
            thead = document.createElement('thead');
            var tr = document.createElement('tr');
            for (var i = 0; i < p.colModel.length; i++) {
                var cm = p.colModel[i];
                var th = document.createElement('th');
                /*********将checkbox固定绑定在第一个无display的col上---------zengxiao  2012-12-21*************/
                if (cm.display == '' && p.showCheckboxNum == null) {
                    p.showCheckboxNum = i;
                    cm.width = 20;
                }
                $(th).attr('axis', 'col' + i);
                if (cm) { // only use cm if its defined
                    if ($.cookies) {
                        var cookie_width = 'flexiwidths/' + cm.name; // Re-Store the widths in the cookies
                        if ($.cookie(cookie_width) != undefined) {
                            cm.width = $.cookie(cookie_width);
                        }
                    }
                    if (cm.display != undefined) {
                        th.innerHTML = cm.display;
                    }
                    if (cm.name && cm.sortable) {
                        $(th).attr('abbr', cm.name);
                    }
                    if (cm.align) {
                        th.align = cm.align;
                    }
                    if (cm.width) {
                        $(th).attr('width', cm.width);
                    }
                    if ($(cm).attr('hide')) {
                        th.hidden = true;
                    }
                    if (cm.process) {
                        th.process = cm.process;
                    }
                } else {
                    th.innerHTML = "";
                    $(th).attr('width', 30);
                }
                $(tr).append(th);
            }
            $(thead).append(tr);
            $(t).prepend(thead);
        } // end if p.colmodel
        //init divs
        g.gDiv = document.createElement('div'); //create global container
        g.mDiv = document.createElement('div'); //create title container
        g.hDiv = document.createElement('div'); //create header container
        g.bDiv = document.createElement('div'); //create body container
        g.vDiv = document.createElement('div'); //create grip
        g.rDiv = document.createElement('div'); //create horizontal resizer
        g.cDrag = document.createElement('div'); //create column drag
        g.block = document.createElement('div'); //creat blocker
        g.nDiv = document.createElement('div'); //create column show/hide popup
        g.nBtn = document.createElement('div'); //create column show/hide button
        g.iDiv = document.createElement('div'); //create editable layer
        g.tDiv = document.createElement('div'); //create toolbar
        g.sDiv = document.createElement('div');
        g.pDiv = document.createElement('div'); //create pager container
        if (!p.usepager) {
            g.pDiv.style.display = 'none';
        }
        g.hTable = document.createElement('table');
        g.gDiv.className = 'flexigrid';
        if (p.width != 'auto') {
            g.gDiv.style.width = p.width + 'px';
        }
        //add conditional classes
        if ($.browser.msie) {
            $(g.gDiv).addClass('ie');
        }
        if (p.novstripe) {
            $(g.gDiv).addClass('novstripe');
        }
        $(t).before(g.gDiv);
        $(g.gDiv).append(t);
        //set toolbar
        if (p.buttons) {
            g.tDiv.className = 'tDiv';
            var tDiv2 = document.createElement('div');
            tDiv2.className = 'tDiv2';
            for (var i = 0; i < p.buttons.length; i++) {
                var btn = p.buttons[i];
                if (!btn.separator) {
                    var btnDiv = document.createElement('div');
                    btnDiv.className = 'fbutton';
                    btnDiv.innerHTML = ("<div><span>") + (btn.hidename ? "&nbsp;" : btn.name) + ("</span></div>");
                    if (btn.bclass) $('span', btnDiv).addClass(btn.bclass).css({
                        paddingLeft: 20
                    });
                    if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
                        $('span', btnDiv).css('background', 'url(' + btn.bimage + ') no-repeat center left');
                    $('span', btnDiv).css('paddingLeft', 20);

                    if (btn.tooltip) // add title if exists (RS)
                        $('span', btnDiv)[0].title = btn.tooltip;

                    btnDiv.onpress = btn.onpress;
                    btnDiv.name = btn.name;
                    if (btn.id) {
                        btnDiv.id = btn.id;
                    }
                    if (btn.onpress) {
                        $(btnDiv).click(function() {
                            this.onpress(this.id || this.name, g.gDiv);
                        });
                    }
                    $(tDiv2).append(btnDiv);
                    if ($.browser.msie && $.browser.version < 7.0) {
                        $(btnDiv).hover(function() {
                            $(this).addClass('fbOver');
                        }, function() {
                            $(this).removeClass('fbOver');
                        });
                    }
                } else {
                    $(tDiv2).append("<div class='btnseparator'></div>");
                }
            }
            $(g.tDiv).append(tDiv2);
            $(g.tDiv).append("<div style='clear:both'></div>");
            $(g.gDiv).prepend(g.tDiv);
        }
        g.hDiv.className = 'hDiv';

        // Define a combo button set with custom action'ed calls when clicked.
        if (p.combobuttons && $(g.tDiv2)) {
            var btnDiv = document.createElement('div');
            btnDiv.className = 'fbutton';

            var tSelect = document.createElement('select');
            $(tSelect).change(function() {
                g.combo_doSelectAction(tSelect)
            });
            $(tSelect).click(function() {
                g.combo_resetIndex(tSelect)
            });
            tSelect.className = 'cselect';
            $(btnDiv).append(tSelect);

            for (i = 0; i < p.combobuttons.length; i++) {
                var btn = p.combobuttons[i];
                if (!btn.separator) {
                    var btnOpt = document.createElement('option');
                    btnOpt.innerHTML = btn.name;

                    if (btn.bclass)
                        $(btnOpt)
                        .addClass(btn.bclass)
                        .css({
                            paddingLeft: 20
                        });
                    if (btn.bimage) // if bimage defined, use its string as an image url for this buttons style (RS)
                        $(btnOpt).css('background', 'url(' + btn.bimage + ') no-repeat center left');
                    $(btnOpt).css('paddingLeft', 20);

                    if (btn.tooltip) // add title if exists (RS)
                        $(btnOpt)[0].title = btn.tooltip;

                    if (btn.onpress) {
                        btnOpt.value = btn.onpress;
                    }
                    $(tSelect).append(btnOpt);
                }
            }
            $('.tDiv2').append(btnDiv);
        }


        $(t).before(g.hDiv);
        g.hTable.cellPadding = 0;
        g.hTable.cellSpacing = 0;
        $(g.hDiv).append('<div class="hDivBox"></div>');
        $('div', g.hDiv).append(g.hTable);
        var thead = $("thead:first", t).get(0);
        if (thead) $(g.hTable).append(thead);
        thead = null;
        if (!p.colmodel) var ci = 0;
        $('thead tr:first th', g.hDiv).each(function(i, n) {
            var thdiv = document.createElement('div');
            if ($(this).attr('abbr')) {
                $(this).click(function(e) {
                    if (!$(this).hasClass('thOver')) return false;
                    var obj = (e.target || e.srcElement);
                    if (obj.href || obj.type) return true;
                    g.changeSort(this);
                });
                if ($(this).attr('abbr') == p.sortName) {
                    this.className = 'sorted';
                    thdiv.className = 's' + p.sortOrder;
                }
            }
            if (this.hidden) {
                $(this).hide();
            }
            if (!p.colmodel) {
                $(this).attr('axis', 'col' + ci++);
            }
            $(thdiv).css({
                textAlign: this.align,
                width: this.width + 'px'
            });
            g.colWidth[i] = parseInt(this.width) + (($.browser.msie && $.browser.version == 7) ? 4 : 10);
            g.totalWidth += g.colWidth[i];

            thdiv.innerHTML = this.innerHTML;
            $(this).empty().append(thdiv).removeAttr('width').mousedown(function(e) {
                g.dragStart('colMove', e, this);
            }).hover(function() {
                if (!g.colresize && !$(this).hasClass('thMove') && !g.colCopy) {
                    $(this).addClass('thOver');
                }
                if ($(this).attr('abbr') != p.sortName && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
                    $('div', this).addClass('s' + p.sortOrder);
                } else if ($(this).attr('abbr') == p.sortName && !g.colCopy && !g.colresize && $(this).attr('abbr')) {
                    var no = (p.sortOrder == 'asc') ? 'desc' : 'asc';
                    $('div', this).removeClass('s' + p.sortOrder).addClass('s' + no);
                }
                if (g.colCopy) {
                    var n = $('th', g.hDiv).index(this);
                    if (n == g.dcoln) {
                        return false;
                    }
                    if (n < g.dcoln) {
                        $(this).append(g.cdropleft);
                    } else {
                        $(this).append(g.cdropright);
                    }
                    g.dcolt = n;
                } else if (!g.colresize) {
                    var nv = $('th:visible', g.hDiv).index(this);
                    var onl = parseInt($('div:eq(' + nv + ')', g.cDrag).css('left'));
                    var nw = jQuery(g.nBtn).outerWidth();
                    var nl = onl - nw + Math.floor(p.cgwidth / 2);
                    $(g.nDiv).hide();
                    $(g.nBtn).hide();
                    $(g.nBtn).css({
                        'left': nl,
                        top: g.hDiv.offsetTop
                    }).show();
                    var ndw = parseInt($(g.nDiv).width());
                    $(g.nDiv).css({
                        top: g.bDiv.offsetTop
                    });
                    if ((nl + ndw) > $(g.gDiv).width()) {
                        $(g.nDiv).css('left', onl - ndw + 1);
                    } else {
                        $(g.nDiv).css('left', nl);
                    }
                    if ($(this).hasClass('sorted')) {
                        $(g.nBtn).addClass('srtd');
                    } else {
                        $(g.nBtn).removeClass('srtd');
                    }
                }
            }, function() {
                $(this).removeClass('thOver');
                if ($(this).attr('abbr') != p.sortName) {
                    $('div', this).removeClass('s' + p.sortOrder);
                } else if ($(this).attr('abbr') == p.sortName) {
                    var no = (p.sortOrder == 'asc') ? 'desc' : 'asc';
                    $('div', this).addClass('s' + p.sortOrder).removeClass('s' + no);
                }
                if (g.colCopy) {
                    $(g.cdropleft).remove();
                    $(g.cdropright).remove();
                    g.dcolt = null;
                }
            }); //wrap content\
            //--------------add check all checkbox to th----------------add by dingrong 2012-10-26
            if (i == p.showCheckboxNum && p.showCheckbox) {
                var $checkAll = $("<input type='checkbox' />");
                $("div", this).prepend($checkAll);
            }
            //-------------end add check all checkbox to th

        });
        //set bDiv
        g.bDiv.className = 'bDiv';
        $(t).before(g.bDiv);
        $(g.bDiv).css({
            height: (p.height == 'auto') ? 'auto' : p.height + "px"
        }).scroll(function(e) {
            g.scroll()
        }).append(t);
        if (p.height == 'auto') {
            $('table', g.bDiv).addClass('autoht');
        }
        //add td & row properties
        //		g.addCellProp();
        g.addRowProp();
        //set cDrag
        var cdcol = $('thead tr:first th:first', g.hDiv).get(0);
        if (cdcol != null) {
            g.cDrag.className = 'cDrag';
            g.cdpad = 0;
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderLeftWidth'))) ? 0 : parseInt($('div', cdcol).css('borderLeftWidth')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('borderRightWidth'))) ? 0 : parseInt($('div', cdcol).css('borderRightWidth')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingLeft'))) ? 0 : parseInt($('div', cdcol).css('paddingLeft')));
            g.cdpad += (isNaN(parseInt($('div', cdcol).css('paddingRight'))) ? 0 : parseInt($('div', cdcol).css('paddingRight')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('borderLeftWidth'))) ? 0 : parseInt($(cdcol).css('borderLeftWidth')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('borderRightWidth'))) ? 0 : parseInt($(cdcol).css('borderRightWidth')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('paddingLeft'))) ? 0 : parseInt($(cdcol).css('paddingLeft')));
            g.cdpad += (isNaN(parseInt($(cdcol).css('paddingRight'))) ? 0 : parseInt($(cdcol).css('paddingRight')));
            $(g.bDiv).before(g.cDrag);
            var cdheight = $(g.bDiv).height();
            var hdheight = $(g.hDiv).height();
            $(g.cDrag).css({
                top: -hdheight + 'px'
            });
            $('thead tr:first th', g.hDiv).each(function() {
                var cgDiv = document.createElement('div');
                $(g.cDrag).append(cgDiv);
                if (!p.cgwidth) {
                    p.cgwidth = $(cgDiv).width();
                }
                $(cgDiv).css({
                    height: cdheight + hdheight
                }).mousedown(function(e) {
                    g.dragStart('colresize', e, this);
                }).dblclick(function(e) {
                    g.autoResizeColumn(this);
                });
                if ($.browser.msie && $.browser.version < 7.0) {
                    g.fixHeight($(g.gDiv).height());
                    $(cgDiv).hover(function() {
                        g.fixHeight();
                        $(this).addClass('dragging')
                    }, function() {
                        if (!g.colresize) $(this).removeClass('dragging')
                    });
                }
            });
        }
        //add strip
        if (p.striped) {
            $('tbody tr:odd', g.bDiv).addClass('erow');
        }
        if (p.resizable && p.height != 'auto') {
            g.vDiv.className = 'vGrip';
            $(g.vDiv).mousedown(function(e) {
                g.dragStart('vresize', e)
            }).html('<span></span>');
            $(g.bDiv).after(g.vDiv);
        }
        if (p.resizable && p.width != 'auto' && !p.nohresize) {
            g.rDiv.className = 'hGrip';
            $(g.rDiv).mousedown(function(e) {
                g.dragStart('vresize', e, true);
            }).html('<span></span>').css('height', $(g.gDiv).height());
            if ($.browser.msie && $.browser.version < 7.0) {
                $(g.rDiv).hover(function() {
                    $(this).addClass('hgOver');
                }, function() {
                    $(this).removeClass('hgOver');
                });
            }
            $(g.gDiv).append(g.rDiv);
        }
        // add pager
        if (p.usepager) {
            g.pDiv.className = 'pDiv';
            g.pDiv.innerHTML = '<div class="pDiv2 flexgrid-pagebar"></div>';

            $(g.bDiv).after(g.pDiv);
            /*			var html = ' <div class="pGroup"> <div class="pFirst pButton"><span></span></div><div class="pPrev pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pcontrol">' + p.pagetext + ' <input type="text" size="4" value="1" /> ' + p.outof + ' <span> 1 </span></span></div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pNext pButton"><span></span></div><div class="pLast pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"> <div class="pReload pButton"><span></span></div> </div> <div class="btnseparator"></div> <div class="pGroup"><span class="pPageStat"></span></div>';
             */
            var html = ['<div class="pGroup"><span class="pPageStat"></span></div>',
                '<div class="pGroup" name="pagesize"></div>',
                '<div class="pGroup" style="float:right;">',
                '<div style="float:left;"><button class="btn btn-small" name="preBtn" title="上一页"><b><</b></button></div>',
                '<div style="float:left;" name="btns">',
                /*'<button class="btn btn-small">1</button><button class="btn btn-small">2</button>',
                	'<button class="btn btn-small">...</button>',*/
                '</div>',
                '<div style="float:left;"><button class="btn btn-small" name="nextBtn" title="下一页"><b>></b></button></div>',
                '<div class="input-page" style="padding:0px;line-height:37px;margin:0px 5px;"><span style="position:relative;top:2px;">第</span>',
                '<input class="span2" style="font-size:12px;margin:2px 3px 0;" type="text"/><span style="position:relative;top:2px;">页</span></div>',
                '<div style="float:left;"><button class="btn btn-small" name="goPage">跳转</button></div>',

                '</div>'
            ].join("");


            //			'<div class="pGroup"><span class="pPageStat"></span></div>'
            $('div', g.pDiv).html(html);
            $('input', g.pDiv).on('keyup', function() {
                $(this).val($(this).val().replace(/\D/g, ''));
                if ($(this).val() == "") {
                    $(this).val(1);
                } else if ($(this).val() > p.pages) {
                    $(this).val(p.pages);
                }
            }).on('afterpaste', function() {
                $(this).val($(this).val().replace(/\D/g, ''));
                if ($(this).val() == "") {
                    $(this).val(1);
                } else if ($(this).val() > p.pages) {
                    $(this).val(p.pages);
                }
            });
            if (p.rpOptions != null) {
                var pagesizeHtml = [];
                $.each(p.rpOptions, function(index, item) {
                    pagesizeHtml.push('<option value="' + item + '"' + (item == p.rp ? "selected" : "") + '>' + item + '</option>');
                });
                $('div[name=pagesize]', g.pDiv).html('<select style="margin:0px;">' + pagesizeHtml.join("") + "</select>");
                $('div[name=pagesize] select', g.pDiv).on('change', function() {
                    p.rp = $(this).val();
                    p.newp = 1;
                    g.populate();
                });
            }
            $('button[name=preBtn]', g.pDiv).click(function() {
                g.changePage('prev');
            });
            $('button[name=nextBtn]', g.pDiv).click(function() {
                g.changePage('next');
            });
            $('button[name=goPage]', g.pDiv).click(function() {
                g.changePage('input');
            });
            $('input', g.pDiv).keydown(function(e) {
                if (e.keyCode == 13) g.changePage('input')
            });
        }
        $(g.pDiv, g.sDiv).append("<div style='clear:both'></div>");
        // add title
        if (p.title) {
            g.mDiv.className = 'mDiv';
            g.mDiv.innerHTML = '<div class="ftitle">' + p.title + '</div>';
            $(g.gDiv).prepend(g.mDiv);
            if (p.showTableToggleBtn) {
                $(g.mDiv).append('<div class="ptogtitle" title="Minimize/Maximize Table"><span></span></div>');
                $('div.ptogtitle', g.mDiv).click(function() {
                    $(g.gDiv).toggleClass('hideBody');
                    $(this).toggleClass('vsble');
                });
            }
        }

        //setup cdrops
        g.cdropleft = document.createElement('span');
        g.cdropleft.className = 'cdropleft';
        g.cdropright = document.createElement('span');
        g.cdropright.className = 'cdropright';
        //add block
        g.block.className = 'gBlock';
        var gh = $(g.bDiv).height();
        var gtop = g.bDiv.offsetTop;
        $(g.block).css({
            width: g.bDiv.style.width,
            height: gh,
            background: 'white',
            position: 'relative',
            marginBottom: (gh * -1),
            zIndex: 1,
            top: gtop,
            left: '0px'
        });
        $(g.block).fadeTo(0, p.blockOpacity);
        // add column control
        if ($('th', g.hDiv).length) {
            g.nDiv.className = 'nDiv';
            g.nDiv.innerHTML = "<table cellpadding='0' cellspacing='0'><tbody></tbody></table>";
            $(g.nDiv).css({
                marginBottom: (gh * -1),
                display: 'none',
                top: gtop
            }).noSelect();
            var cn = 0;
            $('th div', g.hDiv).each(function() {
                //---------------remove checkbox from show hide cloumn menu------ add by dingrong 2012-10-26
                if (p.showCheckbox && cn == p.showCheckboxNum) {
                    cn++;
                    return;
                }
                //-------------end remove checkbox from show hide cloumn menu-
                var kcol = $("th[axis='col" + cn + "']", g.hDiv)[0];
                var chk = 'checked="checked"';
                if (kcol.style.display == 'none') {
                    chk = '';
                }
                $('tbody', g.nDiv).append('<tr><td class="ndcol1"><input type="checkbox" ' + chk + ' class="togCol" value="' + cn + '" /></td><td class="ndcol2">' + this.innerHTML + '</td></tr>');
                cn++;
            });
            if ($.browser.msie && $.browser.version < 7.0) $('tr', g.nDiv).hover(function() {
                $(this).addClass('ndcolover');
            }, function() {
                $(this).removeClass('ndcolover');
            });
            $('td.ndcol2', g.nDiv).click(function() {
                if ($('input:checked', g.nDiv).length <= p.minColToggle && $(this).prev().find('input')[0].checked) return false;
                return g.toggleCol($(this).prev().find('input').val());
            });
            $('input.togCol', g.nDiv).click(function() {
                if ($('input:checked', g.nDiv).length < p.minColToggle && this.checked == false) return false;
                $(this).parent().next().trigger('click');
            });
            $(g.gDiv).prepend(g.nDiv);
            $(g.nBtn).addClass('nBtn')
                .html('<div></div>')
                .attr('title', 'Hide/Show Columns')
                .click(function() {
                    $(g.nDiv).toggle();
                    return true;
                });
            if (p.showToggleBtn) {
                $(g.gDiv).prepend(g.nBtn);
            }
        }
        // add date edit layer
        $(g.iDiv).addClass('iDiv').css({
            display: 'none'
        });
        $(g.bDiv).append(g.iDiv);
        // add flexigrid events
        $(g.bDiv).hover(function() {
            $(g.nDiv).hide();
            $(g.nBtn).hide();
        }, function() {
            if (g.multisel) {
                g.multisel = false;
            }
        });
        $(g.gDiv).hover(function() {}, function() {
            $(g.nDiv).hide();
            $(g.nBtn).hide();
        });
        //add document events
        $(document).mousemove(function(e) {
            g.dragMove(e)
        }).mouseup(function(e) {
            g.dragEnd()
        }).hover(function() {}, function() {
            g.dragEnd()
        });
        //browser adjustments
        if ($.browser.msie && $.browser.version < 7.0) {
            $('.hDiv,.bDiv,.mDiv,.pDiv,.vGrip,.tDiv, .sDiv', g.gDiv).css({
                width: '100%'
            });
            $(g.gDiv).addClass('ie6');
            if (p.width != 'auto') {
                $(g.gDiv).addClass('ie6fullwidthbug');
            }
        }
        g.rePosDrag();
        g.fixHeight();
        //make grid functions accessible
        t.p = p;
        t.grid = g;
        // load data
        if (p.url && p.autoload) {
            g.populate();
        }
        $('table', g.bDiv).width(g.totalWidth);
        return t;
    };
    var docloaded = false;
    $(document).ready(function() {
        docloaded = true
    });
    $.fn.flexigrid = function(p) {
        return this.each(function() {
            if (!docloaded) {
                $(this).hide();
                var t = this;
                $(document).ready(function() {
                    $.addFlex(t, p);
                });
            } else {
                $.addFlex(this, p);
            }
        });
    }; //end flexigrid
    $.fn.flexReloadFirstPage = function(p) {
            return this.each(function() {
                if (p == null) {
                    p = {
                        newp: 1
                    };
                } else {
                    p.newp = 1;
                }
                $(this).flexUpdateParams(p);
                $(this).flexReload();
            });
        }
        //直接改param再重新刷新页面，用于自定义列表加载
    $.fn.flexReloadByParam = function(p) {
        return this.each(function() {
            $.extend(this.p, p);
            $(this).flexUpdateParams(p);
            $(this).flexReload();
        });
    }
    $.fn.fixHeight = function(height) {
        return this.each(function() {
            var temp = height;

            if (this.p && this.p.usepager) {
                temp -= $.flexgridPageBarHeight;
                temp -= $.flexgridHeadHeight;
                // 方法写在adddata内部了
                // $(this.grid.bDiv).css({
                // 	height: (height == 'auto') ? 'auto' : temp + "px"
                // })
            }
            if (this.p) {
                this.p.height = temp;

                //图片列表重绘
                $(this.grid.bDiv).height(temp);
            }

            $(this).flexUpdateShow();
        })
    }
    $.fn.flexReload = function(p) { // function to reload grid
        return this.each(function() {
            if (this.grid && this.p.url) {
                $(this).flexUpdateParams(p); //------------修改查询条件设置--zengxiao 2012.12.27
                this.grid.populate();
            }
        });
    }; //end flexReload
    //--------------修改增加选项条件--zengxiao 2012.12.27
    $.fn.flexUpdateParams = function(p) {
            if (null == p) return this;
            return this.each(function() {
                if (!this.grid) return;
                if (p.params != null) {
                    for (var i = 0; i < this.p.params.length; i++) {
                        if (p.params[this.p.params[i].name] !== undefined) {
                            this.p.params[i].value = p.params[this.p.params[i].name];
                            delete p.params[this.p.params[i].name];
                        }
                    }
                    // 之前这里IE下出现死循环 改为for in xx
                    for (var tmp in p.params) {
                        if (tmp == 'page') {
                            this.p.newp = p.params[tmp];
                            continue;
                        }
                        if (p.params[tmp] == null) {
                            continue;
                        }
                        this.p.params.push({
                            name: tmp,
                            value: p.params[tmp]
                        });
                    }
                    delete p.params;
                }
                $(this).flexOptions(p);
            });
        }
        //清除数组类参数
    $.fn.flexDeleteParams = function(pStart) {
            if (null == pStart) return this;
            return this.each(function() {
                if (!this.grid) return;
                for (var i = 0; i < this.p.params.length; i++) {
                    if (this.p.params[i].name.startWith(pStart)) {
                        this.p.params.splice(i, 1);
                        i--;
                    }
                }
            });
        }
        //--------------增加更新显示内容-zengxiao 2012.12.22
    $.fn.flexUpdateShow = function() { // function to reload grid
        return this.each(function() {
            if (!this.grid) return;
            this.grid.updateShow();
        });
    }; //end flexReload
    $.flexgridHeadHeight = 35;
    $.flexgridPageBarHeight = 38;
    $.flexgridHeadAddPBHeight = 69;
    $.fn.flexOptions = function(p) { //function to update general options
        return this.each(function() {
            if (this.grid) {
                $.extend(this.p, p);
                $.extend(this.p, {
                    nomsg: "无记录",
                    procmsg: "正在加载，请稍候..."
                });
                $('div[name=pagesize] select', this.grid.pDiv).val(this.p.rp);
            }
        });
    }; //end flexOptions
    $.fn.flexToggleCol = function(cid, visible) { // function to reload grid
        return this.each(function() {
            if (this.grid) this.grid.toggleCol(cid, visible);
        });
    };
    //end flexToggleCol xx 清空并添加数据
    $.fn.flexAddData = function(arr) { // function to add data to grid
        return this.each(function() {
            if (!$.isArray(arr)) {
                arr = [arr];
            }
            if (this.grid) this.grid.addData(arr);
        });
    };
    /**
     * 追加数据,zx  2013.07.22
     * data为数组数据;_id为唯一标识字段,如果该字段相同,则不进行追加
     */
    $.fn.flexAppendData = function(data, _id) {
        return this.each(function() {
            if (this.grid) {
                var aData;
                if ($.isArray(this.grid.lastData)) {
                    aData = this.grid.lastData;
                } else {
                    if (this.grid.lastData == null) {
                        aData = [];
                    } else {
                        aData = this.grid.lastData.rows || [];
                    }
                }
                if (_id != null && aData.length > 0) {
                    var _hasIds = [];
                    for (var i = 0; i < aData.length; i++) {
                        _hasIds.push(aData[i][_id]);
                    }
                    var indexStr = ',' + _hasIds.join(',') + ',';
                    var index;
                    for (var i = 0; i < data.length; i++) {
                        index = indexStr.indexOf(',' + data[i][_id] + ',');
                        if (index > -1) {
                            aData.splice(index == 0 ? 0 : indexStr.substring(1, Math.max(1, index - 1)).split(',').length, 1, data[i]);
                            data.splice(i, 1);
                            i--;
                        }
                    }
                }
                this.grid.addData(aData.concat(data));
            }
        });
    }
    $.fn.flexGetData = function() {
        var aData = [];
        this.each(function() {
            if (this.grid) {
                if ($.isArray(this.grid.lastData)) {
                    aData = this.grid.lastData;
                } else if ($.isArray(this.grid.lastData.rows)) {
                    aData = this.grid.lastData.rows;
                }
            }
        })
        return aData;
    }

    $.fn.noSelect = function(p) { //no select plugin by me :-)
        var prevent = (p == null) ? true : p;
        if (prevent) {
            return this.each(function() {
                if ($.browser.msie || $.browser.safari) $(this).bind('selectstart', function() {
                    return false;
                });
                else if ($.browser.mozilla) {
                    $(this).css('MozUserSelect', 'none');
                    $('body').trigger('focus');
                } else if ($.browser.opera) $(this).bind('mousedown', function() {
                    return false;
                });
                else $(this).attr('unselectable', 'on');
            });
        } else {
            return this.each(function() {
                if ($.browser.msie || $.browser.safari) $(this).unbind('selectstart');
                else if ($.browser.mozilla) $(this).css('MozUserSelect', 'inherit');
                else if ($.browser.opera) $(this).unbind('mousedown');
                else $(this).removeAttr('unselectable', 'on');
            });
        }
    }; //end noSelect
    $.fn.flexSearch = function(p) { // function to search grid
        return this.each(function() {
            if (this.grid && this.p.searchitems) this.grid.doSearch();
        });
    }; //end flexSearch

    $.fn.getChecked = function() { // function to get checked -------add by dingrong 2012-10-26
        var checkedIds = [];
        this.each(function() {
            var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]:checked", this.grid.bDiv);
            $checkedCheckboxs.each(function() {
                checkedIds[checkedIds.length] = $(this).val();
            });
        });
        return checkedIds;
    }

    $.fn.getAllRowProVals = function(_proName) { // function to get checked -------add by zhl 2012-07-24
        var aProtoArray = [];
        this.each(function() {
            $("tr", this.grid.bDiv).each(function() {
                if ($(this).data('flexgridRecord') == null) return;
                aProtoArray.push($(this).data('flexgridRecord')[_proName]);
            });
        });
        return aProtoArray;
    }

    $.fn.getAllRowIds = function() { // function to get checked -------add by dingrong 2012-10-26
        var checkedIds = [];
        this.each(function() {
            var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", this.grid.bDiv);
            $checkedCheckboxs.each(function() {
                checkedIds[checkedIds.length] = $(this).val();
            });
        });
        return checkedIds;
    }

    //获取所有记录某行值
    $.fn.getAllRowsProperty = function(pro) {
        var proIds = [];
        var record;
        this.each(function() {
            var $trs = $("tr", this.grid.bDiv);
            $trs.each(function() {
                record = $(this).data('flexgridRecord');
                if (record == null) return;
                proIds.push(record[pro]);
            });
        });
        return proIds;
    }
    $.fn.clearChecked = function() { // function to clear checked -------add by zengxiao 2013-01-06
            this.each(function() {
                $('tr.trSelected', this.grid.bDiv).removeClass("trSelected");
                $('tr.trchecked', this.grid.bDiv).removeClass("trchecked");
                var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]:checked", this.grid.bDiv);
                $checkedCheckboxs.removeAttr('checked');
                $('input[type=checkbox]:checked', this.grid.hDiv).removeAttr('checked');
            });
        }
        //设置选中行(单选)
    $.fn.setSelected = function(name, id) {
        this.each(function() {
            $(this).clearChecked();
            if (name == null || name == "") return;
            if (id == null || id == "") return;
            var gridBody = this.grid.bDiv;
            $('tbody tr:not(.noclick-event)', gridBody).each(function() {
                if ($(this).data('flexgridRecord')[name] == id) {
                    $(this).click();
                    return;
                }
            })
        });
    }



    $.fn.setChecked = function(ids) { // function to set checked -------add by zengxiao 2013-01-06
            this.each(function() {
                $(this).clearChecked();
                if (ids == null || ids == "") return;
                var gridBody = this.grid.bDiv;
                var setValue = function() {
                    var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", gridBody);
                    if ((typeof ids) == "string") ids = ids.split(',');
                    for (var i = 0; i < ids.length; i++) {
                        $("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody).attr("checked", "true");
                        $("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody).parents('tr').addClass('trSelected trchecked');
                    }
                }
                if (this.grid.loadStatus == 'loading') {
                    this.grid.onLoadedData.push(setValue);
                } else {
                    setValue();
                }
            });
        }
        //初始化设置值,会将当前状态标识,方便后续获取变更的记录,变更的记录,指从选到不选,不选到选的记录,不会得到一直选与不选的记录
    $.fn.setInitChecked = function(ids, clear) { // function to set init checked with status -----------add by zengxiao 2013-01-29

        this.each(function() {
            if (clear == null || clear === true) {
                $(this).clearCheckedWithStatus();
            }
            if (ids == null || ids == "") return;
            var gridBody = this.grid.bDiv;
            var setValue = function() {
                var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", gridBody);
                if ((typeof ids) == "string") ids = ids.split(',');
                for (var i = 0; i < ids.length; i++) {
                    if ($("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody).length > 0) {
                        $("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody)
                            .attr("checked", "true")
                            .parentsUntil('tbody').last().data('flexgridRecord')._status = 1;
                    }
                }
            }
            if (this.grid.loadStatus == 'loading') {
                this.grid.onLoadedData.push(setValue);
            } else {
                setValue();
            }
        });
    }

    $.fn.setCheckboxDisabled = function(flag) {
            this.each(function() {
                var gridBody = this.grid.bDiv;
                var gridHead = this.grid.hDiv;
                var setDisabled = function() {
                    $("input[type=checkbox][hik=flexigrid_checkbox]", gridBody).attr('disabled', flag);
                    if (flag) {
                        $("input[type=checkbox]", gridHead).hide();
                    } else {
                        $("input[type=checkbox]", gridHead).show();
                    }
                }
                if (this.grid.loadStatus == 'loading') {
                    this.grid.onLoadedData.push(setDisabled);
                } else {
                    setDisabled();
                }
            });
        }
        //初始化设置值,会将当前状态标识,方便后续获取变更的记录,变更的记录,指从选到不选,不选到选的记录,不会得到一直选与不选的记录
    $.fn.setInitDisableChecked = function(ids, desc, clear) { // function to set init checked with status -----------add by zengxiao 2013-01-29
            this.each(function() {
                if (clear == null || clear === true) {
                    $(this).clearCheckedWithStatus();
                }
                if (ids == "") return;
                var gridBody = this.grid.bDiv;
                var setValue = function() {
                    var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", gridBody);
                    if ((typeof ids) == "string") ids = ids.split(',');
                    for (var i = 0; i < ids.length; i++) {
                        if ($("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody).length > 0) {
                            $("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody)
                                .attr({
                                    "checked": "true",
                                    'disabled': 'true',
                                    'title': (desc == null ? "" : desc)
                                })
                                .parentsUntil('tbody').last().data('flexgridRecord')._status = 1;
                        }
                    }
                }
                if (this.grid.loadStatus == 'loading') {
                    this.grid.onLoadedData.push(setValue);
                } else {
                    setValue();
                }
            });
        }
        //初始化设置值,会将当前状态标识,方便后续获取变更的记录,变更的记录,指从选到不选,不选到选的记录,不会得到一直选与不选的记录
    $.fn.setInitDisableNoChecked = function(ids, desc, clear) { // function to set init checked with status -----------add by zengxiao 2013-01-29
            this.each(function() {
                if (clear == null || clear === true) {
                    $(this).clearCheckedWithStatus();
                }
                if (ids == "") return;
                var gridBody = this.grid.bDiv;
                var setValue = function() {
                    var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", gridBody);
                    if ((typeof ids) == "string") ids = ids.split(',');
                    for (var i = 0; i < ids.length; i++) {
                        if ($("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody).length > 0) {
                            $("input[type=checkbox][hik=flexigrid_checkbox][value=" + ids[i] + "]", gridBody)
                                .attr({
                                    'disabled': 'true',
                                    'title': (desc == null ? "" : desc)
                                })
                                .parentsUntil('tbody').last().data('flexgridRecord')._status = 1;
                        }
                    }
                }
                if (this.grid.loadStatus == 'loading') {
                    this.grid.onLoadedData.push(setValue);
                } else {
                    setValue();
                }
            });
        }
        //清除所有初始状态标识为false
    $.fn.clearCheckedWithStatus = function() { // function to clear checked with status -----------add by zengxiao 2013-01-09
            this.each(function() {
                $('tr.trSelected', this.grid.bDiv).removeClass("trSelected");
                $('tr.trchecked', this.grid.bDiv).removeClass("trchecked");
                var $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", this.grid.bDiv);
                for (var i = 0; i < $checkedCheckboxs.length; i++) {
                    $($checkedCheckboxs[i]).removeAttr("checked").removeAttr('disabled')
                        .parentsUntil('tbody').last().data('flexgridRecord')._status = 0;
                }
                $('input[type=checkbox]:checked', this.grid.hDiv).removeAttr('checked');
            });
        }
        //flag true:从未选变成选择  others:从选择变成不选,获取变更的值 xx 添加了isDisable控制
    $.fn.getStatusChange = function(flag, isDisable) { // function to clear checked with status -----------add by zengxiao 2013-01-09
            var changeRecords = [];
            this.each(function() {
                var tr, $checkedCheckboxs = $("input[type=checkbox][hik=flexigrid_checkbox]", this.grid.bDiv);
                for (var i = 0; i < $checkedCheckboxs.length; i++) {
                    tr = $($checkedCheckboxs[i]).parentsUntil('tbody').last();
                    if (flag !== true && $($checkedCheckboxs[i]).attr('checked') == null && tr.data('flexgridRecord')._status == 1) {
                        //从选择变成不选
                        changeRecords.push(tr.data('flexgridRecord'));
                    } else if (flag === true && $($checkedCheckboxs[i]).attr('checked') != null && tr.data('flexgridRecord')._status == 0) {
                        //从未选变成选择
                        changeRecords.push(tr.data('flexgridRecord'));
                    } else if (flag === true && isDisable && tr.data('flexgridRecord')._status == 0 && $($checkedCheckboxs[i]).attr('checked')) {
                        changeRecords.push(tr.data('flexgridRecord'));
                    }

                }
            });
            return changeRecords;
        }
        //获取记录中的值,不管有没有显示在界面上,从store里面获取
    $.fn.getCheckedRecords = function() {
        var textArray = [];
        this.each(function() {
            $('input[hik=flexigrid_checkbox]:checked', this.grid.bDiv).parent().parent().each(function() {
                //this是td 要取tr 的 flexgridRecord值， xx 2015/8/3
                textArray.push($(this).parent().data('flexgridRecord'));
            });
        });
        return textArray;
    }
    $.fn.getSelected = function() { //function to get selected tr value -------add by dingrong 2012-10-30
        var selectedIds = [];
        this.each(function() {
            var $selectedTr = $("tr.trSelected", this.grid.bDiv);
            if ($selectedTr && $selectedTr.length > 0) {
                if (this.p.showCheckbox) {
                    var $selectedCheckbox = $("input[type=checkbox][hik=flexigrid_checkbox]", $selectedTr[0]);
                    if ($selectedCheckbox.val()) {
                        selectedIds[selectedIds.length] = $selectedCheckbox.val();
                    }
                } else {
                    selectedIds[selectedIds.length] = $selectedTr;
                }
            }
        });
        return selectedIds;
    }

    $.fn.getSelectedRecord = function() { //function to get selected tr value -------add by dingrong 2012-10-30 xiangxiao 2015.1.6
            var data;
            this.each(function() {
                data = $("tr.trSelected", this.grid.bDiv).data('flexgridRecord');
            });
            return data;
        }
        // 清除选中的行    zx 2013.07.22
    $.fn.clearAll = function(_idProName) {
        return this.each(function() {
            this.grid.lastData = {};
            var aOldData = this.grid.lastData;
            this.grid.addData({});
        });
    }

    // 清除选中的行    zx 2013.07.22
    $.fn.removeSelectedRecord = function(_idProName) {
            return this.each(function() {
                var aOldData = this.grid.lastData;
                aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
                $("tr.trSelected", this.grid.bDiv).each(function() {
                    var unqId = $(this).data('flexgridRecord')[_idProName];
                    for (var i = 0; i < aOldData.length; i++) {
                        if (aOldData[i][_idProName] == unqId) {
                            aOldData.splice(i, 1);
                            break;
                        }
                    }
                });
                this.grid.addData(aOldData);
            });
        }
        // 清除选中的行    zx 2013.07.22
    $.fn.getSelectedRecordProto = function(_idProName) {
            var aProtoArray = [];
            this.each(function() {
                $("tr.trSelected", this.grid.bDiv).each(function() {
                    aProtoArray.push($(this).data('flexgridRecord')[_idProName]);
                });
            });
            return aProtoArray;
        }
        // 清除某属性值的记录    zx 2013.07.24
    $.fn.removeRecordByProto = function(_proName, _value) {
        return this.each(function() {
            var aOldData = this.grid.lastData;
            aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
            for (var i = 0; i < aOldData.length; i++) {
                if (aOldData[i][_proName] == _value) {
                    aOldData.splice(i, 1);
                    i--;
                }
            }
            this.grid.addData(aOldData);
        });
    }
    $.fn.moveUp = function(_proName, _value) {
        return this.each(function() {
            var aOldData = this.grid.lastData;
            aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
            for (var i = 0; i < aOldData.length; i++) {
                if (aOldData[i][_proName] == _value) {
                    if (i > 0) {
                        var tmp = aOldData[i];
                        aOldData[i] = aOldData[i - 1];
                        aOldData[i - 1] = tmp;
                        delete tmp;
                    }
                    break;
                }
            }
            this.grid.addData(aOldData);
        });
    }
    $.fn.moveDown = function(_proName, _value) {
            return this.each(function() {
                var aOldData = this.grid.lastData;
                aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
                for (var i = 0; i < aOldData.length; i++) {
                    if (aOldData[i][_proName] == _value) {
                        if ((i + 1) < aOldData.length) {
                            var tmp = aOldData[i];
                            aOldData[i] = aOldData[i + 1];
                            aOldData[i + 1] = tmp;
                            delete tmp;
                        }
                        break;
                    }
                }
                this.grid.addData(aOldData);
            });
        }
        //删除选中的列
    $.fn.removeCheckedRecord = function(_id) {
        return this.each(function() {
            var aOldData = this.grid.lastData;
            aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
            $("input[type=checkbox][hik=flexigrid_checkbox]:checked", this.grid.bDiv).each(function() {
                var unqId = $(this).parents("tr").data('flexgridRecord')[_id];
                for (var i = 0; i < aOldData.length; i++) {
                    if (aOldData[i][_id] == unqId) {
                        aOldData.splice(i, 1);
                        break;
                    }
                }
            });
            $("input[type=checkbox]:checked", this.grid.hDiv).attr("checked", false);
            this.grid.addData(aOldData);
        });
    }

    //删除选中的行
    $.fn.removeCheckedRow = function(_id) {
        return this.each(function() {
            var aOldData = this.grid.lastData;
            aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
            $("input[type=checkbox][hik=flexigrid_checkbox]:checked", this.grid.bDiv).each(function() {
                var unqId = $(this).parents("tr").data('flexgridRecord')[_id];
                for (var i = 0; i < aOldData.length; i++) {
                    if (aOldData[i][_id] == unqId) {
                        aOldData.splice(i, 1);
                        break;
                    }
                }
            });
            $("input[type=checkbox]:checked", this.grid.hDiv).attr("checked", false);
            this.grid.addData(aOldData);
        });
    }

    $.fn.getSingleSelectedRecord = function() { //function to get selected tr value -------add by dingrong 2012-10-30
        var selectedIds = [];
        var $selectedTr = $("tr.trSelected", this.get(0).grid.bDiv);
        return (($selectedTr.length > 0)) ? $selectedTr.data('flexgridRecord') : null;
    }

    $.fn.getColumnValues = function(columnName, checked) { //function to get column value by column name ---------add by dingrong 2012-10-30
        var textArray = [];
        this.each(function() {
            if (checked === false) {
                $("tr", this.grid.bDiv).not($("tr.trchecked", this.grid.bDiv)).each(function() {
                    textArray[textArray.length] = $(this).children("td[abbr=" + columnName + "]").children("div").text();
                });
            } else {
                $("tr.trchecked", this.grid.bDiv).each(function() {
                    textArray[textArray.length] = $(this).children("td[abbr=" + columnName + "]").children("div").text();
                });
            }
        });
        return textArray;
    }
    $.fn.getAllRows = function() {
        var allRows = [];
        this.each(function() {
            var aOldData = this.grid.lastData;
            if (aOldData == null) {
                aOldData = [];
            } else {
                aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
            }
            allRows = allRows.concat(aOldData);
        });
        return allRows;
    }
    $.fn.setColumnValue = function(sProperty, uValue, uIdValue) {
            return this.each(function() {
                var aOldData = this.grid.lastData;
                aOldData = $.isArray(aOldData) ? aOldData : (aOldData.rows || []);
                for (var i = 0; i < aOldData.length; i++) {
                    if (aOldData[i][this.grid.idProperty] == uIdValue) {
                        aOldData[i][sProperty] = uValue;
                        break;
                    }
                }
                this.grid.addData(aOldData);
            });
        }
        //获取被选中的行的某个属性
    $.fn.getCheckedRecordsName = function(name) { //function to get column value by column name ---------add by hetielong 2013-7-30
            var textArray = [];
            this.each(function() {
                $("tr.trchecked", this.grid.bDiv).each(function() {
                    textArray.push($(this).data('flexgridRecord')[name]);
                });
            });
            return textArray;
        }
        //获取当前分页条信息
    $.fn.getPageBarInfo = function() {
        if (this.get(0).grid != null) {
            var p = this.get(0).grid.getP();
            return {
                rp: p.rp,
                page: p.page,
                total: p.total
            };
        } else {
            return null;
        }
    }
    $.fn.showHead = function(boo) {
        return this.each(function() {
            var temp = this.p.height;
            if (boo) {
                if (!$(this.grid.hDiv).is(":visible")) {
                    $(this.grid.hDiv).show();
                    // temp -= $.flexgridHeadHeight;
                }
            } else {
                if ($(this.grid.hDiv).is(":visible")) {
                    $(this.grid.hDiv).hide();
                }
                temp += $.flexgridHeadHeight;
            }
            $(this.grid.bDiv).css({
                height: temp
            })
        })
    }
})(jQuery);
