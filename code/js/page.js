/**
 * Created by huang on 2017/5/19.
 */
(function($){
    //配置信息
    var doptions = {
        url: undefined, //请求地址
        pagesize: 20, //每页的大小
        pageindex: 1, //索引下标
        tableClass:"table1", //表格class
        columns:[], //列信息[{hname:"表头1",name:"name",width:"20%,align:"center"}]
        pageSizeOptions: [10, 20, 30, 40, 50], //可选择设定的每页结果数
        pageNum:4, //显示页数索引数
        checkbox: false, //是否有checkbox
        checkboxWidth: undefined, //checkbox th宽度
        muiltiCheck: true, //是否多选
        onCheck: null, //复选框勾选事件
        selected:true,//是否点击选择行
        selectChecked:false, //选中行是联动选中复选框
        parms: {}, //提交到服务器的参数
        root: 'Rows', //数据源字段名,
        method: "post", //提交方式
        async: true, //同步异步
        record: 'Total', //数据源记录数字段名
        countPage:1,  //总页数
        pageParmName: 'page', //页索引参数名，(提交给服务器)
        pagesizeParmName: 'pagesize', //页记录数参数名，(提交给服务器)
        dataAdapter:null  //数据适配器，如果加载数据不符合设计所需数据格式，可以定义适配转换方法
    };
    var privateMethods={
        //初始渲染建立基本结构
        render:function(ele){
            var $ele = ele;
            var opts=$ele.data("setting");
            var viewTableArr=[];
            //渲染表格
            viewTableArr.push('<table class="'+opts.tableClass+'">');
            viewTableArr.push('    <thead><tr class="vt-header">');
            viewTableArr.push('    </tr></thead>');
            viewTableArr.push('</table>');
            //底部分页
            viewTableArr.push('<div class="all-page pull-right">');
            viewTableArr.push('    <p class="pull-left page-record mr20">当前显示');
            viewTableArr.push('       <span class="onepage">0</span>条记录，共');
            viewTableArr.push('       <span class="total">0</span>条记录');
            viewTableArr.push('    </p>');
            viewTableArr.push('    <p class="pull-left mr20">每页显示：');
            viewTableArr.push('        <select class="pagesize">');
            viewTableArr.push('        </select>');
            viewTableArr.push('    </p>');
            viewTableArr.push('    <div class="pagination pull-left">');
            viewTableArr.push('         <a class="page-first">首页</a>');
            viewTableArr.push('         <a class="page-prev">«</a>');
            viewTableArr.push('         <a class="page-num">1</a>');
            viewTableArr.push('         <a class="page-next">»</a>');
            viewTableArr.push('         <a class="page-last">最后一页</a>');
            viewTableArr.push('    </div>');
            viewTableArr.push('</div>');
            var $viewTable = $(viewTableArr.join(''));
            var $header= $viewTable.find(".vt-header");
            //是否开启复选框
            if(opts.checkbox) {
                var styleWidth = opts.checkboxWidth === undefined ? "" : 'style="width:' + opts.checkboxWidth + '"';
                if(opts.muiltiCheck) {   //是否开启多选
                    $header.append('<th class="vt-checkbox " ' + styleWidth + '> <input type="checkbox" name="selectall" class="vt-selectAll"></th>');
                } else {
                    $header.append('<th class="vt-checkbox " ' + styleWidth + '></th>');
                }
            }
            //创建表头
            if(opts.columns&&opts.columns.length){
                for(var i= 0,len=opts.columns.length;i<len;i++){
                    var $th = $("<th></th>");
                    var item=opts.columns[i];
                    if (item.hname) {
                        $th.text(item.hname); //显示内容
                    }
                    if (item.width != undefined) {
                        $th.css("width", item.width); //列宽度
                    }
                    if (item.hcss != undefined) {
                        $th.css(item.hcss);   //表头样式
                    }
                    $header.append($th);
                }
            }
            //下拉每页列表
            var $pagelist = $viewTable.find(".pagesize");
            $.each(opts.pageSizeOptions, function(i, n) {
                var selected = '';
                if (n == opts.pagesize) {  //默认选中每页数据大小
                    selected = 'selected="selected" ';
                }
                $pagelist.append('<option ' + selected + ' value=' + n + '>' + n + '</option>');
            });
            //下拉改变每页显示事件
            $pagelist.unbind("change").change(function() {
                $ele.data("setting").pagesize=$(this).val();
                $ele.data("setting").pageindex=1;
                privateMethods.loadData($ele,opts);
            });
            //统一绑定分页点击事件
            $viewTable.find(".pagination").unbind("click").click(function(e){
                var page = 0;
                switch($(e.target).attr("class")){
                    case "page-first": page = 1;break;   //点击首页
                    case "page-prev": page = $ele.data("setting").pageindex - 1;break; //点击上一页
                    case "page-num":  page = $(e.target).attr("data-value");break;  //点击页码
                    case "page-next": page = Number($ele.data("setting").pageindex) + 1;break;  //点击下一页
                    case "page-last": page = $ele.data("setting").countPage;break;  //点击最后一页
                    default:page = $ele.data("setting").pageindex;break;
                }
                if(page>0 && page != $ele.data("setting").pageindex && page <= $ele.data("setting").countPage){//页数不等于当前页且小于等于总页数
                    $ele.data("setting").pageindex=page;
                    privateMethods.loadData($ele,opts);
                }
            });
            if(opts.checkbox) {
                //全选复选框操作
                $header.find(".vt-selectAll").click(function() {
                    var checked = this.checked;
                    $viewTable.find(".vt-ckItem").prop("checked", checked);
                });
                $viewTable.off("click",".vt-ckItem").on("click",".vt-ckItem",function() {
                    var checked = this.checked;
                    if(opts.muiltiCheck) {
                        var $checkall = $header.find(".vt-selectAll");
                        var allchecked = $checkall.prop("checked");
                        if(checked && !allchecked) {
                            $viewTable.find(".vt-ckItem").not(":checked").length == 0 && $checkall.prop("checked", checked);
                        } else if(!checked && allchecked) {
                            $checkall.prop("checked", checked);
                        }
                    } else {
                        if(checked) {
                            $(this).parents("tr").siblings().find(".vt-ckItem").prop("checked", !checked);
                        }
                    }
                    if(typeof opts.onCheck === "function") {
                        var index = $(this).attr("data-index");
                        var row = undefined;
                        if(index >= 0 && index < g.currentData[p.root].length) {
                            row = g.currentData[p.root][index];
                        }
                        opts.onCheck.call(this, checked, row);
                    }
                });
            }
            $ele.empty();
            $ele.append($viewTable);
            privateMethods.loadData($ele,opts);
        },
        //加载数据，请求后台
        loadData:function(ele){
            var $ele=ele;
            var opts=$ele.data("setting");
            var data={};
            data[opts.pageParmName]=opts.pageindex; //第几页
            data[opts.pagesizeParmName]=opts.pagesize; //每页多少行
            data = $.extend( {},opts.parms,data); //预防还需要别的参数parms
            if(opts.url){
                $.ajax({
                    type: opts.method,
                    url: opts.url,
                    data: data,
                    async: opts.async,
                    dataType: 'json',
                    success:function(res){
                        if(typeof opts.dataAdapter == "function") {  //如果加载数据不符合设计所需数据格式，可以定义适配转换方法
                            res = opts.dataAdapter(res);
                        }
                        if(!res || !res[opts.root]) { //数据不对，清空数据，预防渲染报错
                            opts.data = {};
                            privateMethods.showData($ele,opts);
                            return;
                        }
                        opts.data = res;
                        privateMethods.showData($ele,opts);
                    }
                })
            }
        },
        //展现数据
        showData: function(ele,opts) {
            var $ele=ele;
            if(!opts.data || !opts.data[opts.root]) {  //数据不对返回
                return;
            }
            opts.checkbox&&$ele.find(".vt-selectAll").prop("checked", false);//把表头的多选框√去掉
            var $table = $ele.find("table");
            $table.find("tbody").remove();  //把原先数据清空
            var $tr,col,n,tdcss;
            var trArr=[];
            var jkkeys,jklen;
            for(var i= 0,dlen=opts.data[opts.root].length;i<dlen;++i){  //循环页面数据，展现每一行
                $tr= "<tr>";
                //if(col.css != undefined) {  //列内容样式 td.css
                //    jkkeys=Object.keys(col.css);
                //    jklen=jkkeys.length;
                //    for(var jk=0;jk<jklen;++jk){
                //        tdcss+=(jkkeys[jk]+':'+col.css[jkkeys[jk]]+';');
                //    }
                //}
                n=opts.data[opts.root][i];
                //复选框是否开启
                opts.checkbox && ($tr+='<td style="text-align: center"><input type="checkbox" class="vt-ckItem" data-index="' + i + '"></td>');
                for(var j= 0,plen=opts.columns.length;j<plen;++j){ //循环列数据，展现每一列内容
                    $tr += "<td";
                    col=opts.columns[j];
                    tdcss="";
                    if(col.align!==undefined){ //列内容是否区中 td
                        tdcss+='text-align:'+col.align+';';
                    }
                    if(col.css != undefined) {  //列内容样式 td.css
                        jkkeys=Object.keys(col.css);
                        jklen=jkkeys.length;
                        for(var jk=0;jk<jklen;++jk){
                            if(jkkeys[jk]==="text-align"&&col.align!==undefined){
                                continue;
                            }
                            tdcss+=(jkkeys[jk]+':'+col.css[jkkeys[jk]]+';');
                        }
                    }
                    tdcss.length&&($tr+=' style="'+tdcss+'" ');
                    $tr+=">";
                    if(typeof col.render == "function") {  //用户自定义渲染
                        $tr+=col.render(i, n); //用户传进来的渲染结果return
                    } else {
                        var dataItem = n[col.name];  //用户自定义数据名
                        if(dataItem == undefined) {
                            dataItem = '';
                        }
                        $tr+=dataItem;
                    }
                    $tr+='</td>';
                }
                $tr+='</tr>';
                trArr.push($tr);
            }
            $table.append(trArr.join(''));
            var currPage=parseInt(opts.pageindex);   //当前页
            var countPage= Math.ceil(opts.data[opts.record]/opts.pagesize)||1;  //总页数，预防数据为0时显示为1页
            $ele.data("setting").countPage=countPage;  //记录总页数
            var pageNum=opts.pageNum<countPage?opts.pageNum:countPage;  //展示分页按钮数
            var pagination=$ele.find(".pagination");
            if(currPage > 1) { //判断是否有上一页
                pagination.find(".page-prev").removeClass('disabled');
            } else {
                pagination.find(".page-prev").addClass('disabled');
            }
            var num=1;
            if(countPage<opts.pageNum){   //页数不足预设的按钮数，没这个条件有可能进入下一个条件，出现负数
                num=1
            } else if(currPage>(countPage-opts.pageNum+1)){  //当页面到倒数的时候固定，不给往上加
                num=countPage-opts.pageNum+1;
            }else if(currPage>1&&currPage<=(countPage-opts.pageNum+1)){  //平时状态，以第二个为当前页
                num=currPage-1;
            }
            pagination.find(".page-num").remove();//清空，预防重复
            for(var m=0;m<pageNum;m++){  //渲染按钮
                var $a=$("<a class='page-num' data-value='"+num+"'>"+num+"</a>");
                if(num==currPage){
                    $a.addClass("active");
                }
                pagination.find(".page-next").before($a);
                num++;
            }
            if(currPage <countPage) { //判断是否有下一页
                pagination.find(".page-next").removeClass('disabled');
            } else {
                pagination.find(".page-next").addClass('disabled');
            }
            $ele.find(".onepage").html($ele.find("tbody tr").length);  //当前页有多少行
            $ele.find(".total").html(opts.data[opts.record]);   //总行数
            trArr=null;
        }
    };
    //公用方法
    var publicMethods = {
        //初始化
        init:function(options){
            options.parms = options.parms || {};
            var opts = $.extend({}, doptions, options);
            this.data("setting", opts);
            return this.each(function() {
                privateMethods.render($(this), opts);
            });
        },
        //传参数请求数据
        loadData:function(options){
            var parms={pageindex:1,parms:options};
            var opts=this.data("setting");
            opts=$.extend({}, opts, parms);
            this.data("setting", opts);
            return this.each(function() {
                privateMethods.loadData($(this), opts);
            });
        },
        //获取选中行的数据
        getChecked: function() {
            var opts=this.data("setting");
            var data = [];
            $(this).find(".vt-ckItem:checked").each(function() {
                var index = $(this).attr("data-index");
                if(index >= 0 && index <opts.data[opts.root].length) {
                    data.push(opts.data[opts.root][index]);
                }
            });
            return data;
        },
        //获取当前数据
        getData: function() {
            var opts=this.data("setting");
            if(opts.data && opts.data [opts.root]) {
                return opts.data [opts.root];
            }
            return [];
        }
    };
    //插件主体
    $.fn.pagination = function(options) {
        var method = arguments[0];
        if (typeof options == "string" && publicMethods[options]) {
            method = publicMethods[options];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if (typeof(options) == 'object' || !options) {
            method = publicMethods.init;
        } else {
            return this;
        }
        return method.apply(this, arguments);
    }
})(jQuery);