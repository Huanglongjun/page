(function(){
	$.fn.extend({
		//初始化form
		initForm: function(data) {
			if (data == undefined) {
				return;
			}
			$(this).each(function() {
				var tagName = this.tagName.toLowerCase();
				//key
				var key = $(this).attr("id") || "";
				var key1 = key.toLowerCase();
				//如果tagName不为span，则取name
				if (tagName != "span") {
					key = $(this).attr("name");
					key!==undefined&&(key1 = key.toLowerCase());
				}
				var value = data[key] == undefined ? data[key1] : data[key];
				//如果值为空，则直接返回
				if (value == undefined) {
					return true;
				}
				if (tagName == "span") {
					$(this).text(value);
				} else {
					var type = $(this).attr("type") || "";
					type = type.toLowerCase();
					var val = $(this).val();
					if ("text" == type || "hidden" == type || "email" == type || tagName == "textarea") {
						$(this).val(value);
					} else if (type == "radio") {
						if (value == $(this).val() ||
							(value == "false" && $(this).val() == 0)
						) {
							$(this).prop("checked", true);
						}
					} else if ("select" == tagName) {
						$(this).find("option[value='" + value + "']").prop("selected", true);
					} else if ("span" == tagName) {
						$(this).text(value);
					} else if (type == "checkbox") {
						if (value == $(this).val()||!!value) {
							$(this).prop("checked", true);
						}else{
							$(this).prop("checked", false);
						}
					}
				}
			});
			//each结果
		},
		//验证
		Validate: function() {
			if (!$(this).length) {
				return true;
			}
			var result = true;
			//规则
			var rules = {
				"email": /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,
				"url": /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
				"date":/^([1][7-9][0-9][0-9]|[2][0][0-9][0-9])(\-)([0][1-9]|[1][0-2])(\-)([0-2][1-9]|[3][0-1])$/g,
				"time": /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|\d|[0-1]\d):[0-5]\d$/
			};
			//验证
			$(this).each(function() {
				var verify = $(this).attr("data-verify");
				if (verify === undefined || $.trim(verify) == "") return false;
				verify = verify.split(' ');
				for (var i in verify) {
					var vname = verify[i];
					var _val = $.trim($(this).val())||$.trim($(this).text());
					switch ($.trim(vname).toLowerCase()) {
						case "required":
							var message = "不能为空！";
							var prefix = $(this).attr("data-enname") || $(this).attr("name") || "";
							result = _val ? true : showmessage($(this), prefix + message, false);
							if (!result) {
								return result;
							}
							break;
						case "email":
							result = _val !== undefined && _val.length && !rules.email.test(_val) ? showmessage($(this), "邮箱格式不正确！", false) : true;
							if (!result) {
								return result;
							}
							break;
						case "url":
							result = _val !== undefined && _val.length && !rules.url.test(_val) ? showmessage($(this), "Url格式不正确！", false) : true;
							if (!result) {
								return result;
							}
							break;
						case "data-len":
							var len = $(this).attr("data-len");
							//固定长度
							if (len && len != "" && !isNaN(len)) {
								result = _val !== undefined && _val.length && _val.length != parseInt(len) ? showmessage($(this), "要求长度为" + len + "位!", false) : true;
								if (!result) {
									return result;
								}
							}
							break;
						case "data-minlen":
							var minlen = $(this).attr("data-minlen");
							//最小长度
							if (minlen && minlen != "" && !isNaN(minlen)) {
								result = _val !== undefined && _val.length && _val.length < parseInt(minlen) ? showmessage($(this), "最小长度为" + minlen + "位!", false) : true;
								if (!result) {
									return result;
								}
							}
							break;
						case "data-min":
							var min = $(this).attr("data-min");
							//最小值
							if (min && min != "" && !isNaN(min)) {
								result = _val !== undefined && _val.length && parseFloat(_val) < parseFloat(min) ? showmessage($(this), "数值不小于" + min + "!", false) : true;
								if (!result) {
									return result;
								}
							}
							break;
						case "data-max":
							var max = $(this).attr("data-max");
							//最大值
							if (max && max != "" && !isNaN(max)) {
								result = _val !== undefined && _val.length && parseFloat(_val) > parseFloat(max) ? showmessage($(this), "数值不大于" + max + "!", false) : true;
								if (!result) {
									return result;
								}
							}
							break;
						case "date":
							result = _val !== undefined && !rules.date.test(_val) ? showmessage($(this), "时间为空或格式不正确！", false) : true;
							if (!result) {
								return result;
							}
							break;
						case "time":
							result = _val !== undefined && !rules.time.test(_val) ? showmessage($(this), "时间为空或格式不正确！", false) : true;
							if (!result) {
								return result;
							}
							break;
					}
				}
			});
			function showmessage(obj, message, mark) {
				obj.focus();
				layer.tips(message, obj[0], {
					tips: 1
				});
				return mark;
			}
			return result;
		},
		//验证时间大小
		timeLimit:function(){
			if (!$(this).length) {
				return true;
			}
			var result = true;
			$(this).each(function() {
				if(!$(this).attr("disabled")){
					var end=$(this).val();
					var start=$(this).parent().prev().find(".starTime").val();
					if(end<=start){
						layer.tips("结束时间必须大于开始时间", $(this)[0], {
							tips: 1
						});
						result=false;
						return result;
					}
				}
			});
			return result;
		},
		//获取数据，返回是数组
		getData: function(name) {
			var data=[];
			var key=name||"[data-name]";
			$(this).each(function() {
				var obj={};
				var element=$(this).find(key);
				for(var i= 0,len=element.length;i<len;i++){
					var names = element.eq(i).attr("data-name");
					if (names === undefined || $.trim(names) == "") continue;
					var values= element.eq(i).val()||element.eq(i).text();
					if(element.eq(i).hasClass("arr")){
						values=values.split(",");
					}
					obj[names]=values;
				}
				data.push(obj)
			});
			return data;
		}
	});

	Util = {
		times:null,
		//判读对象是否为空
		isEmptyObject: function(obj) {
			if (obj === undefined) return true;
			for (var n in obj) {
				return false
			}
			return true;
		},
		//判读是否是数值
		isNumeric: function(obj) {
			return !isNaN(parseFloat(obj)) && isFinite(obj);
		},
		//jvtable数据适配
		dataAdapter: function(data,n) {
			if(data === undefined||data.tables===undefined||Util.typeOf(data.tables)!=="array") return undefined;
			var m=n||0;
			data.tables[m].Total=data.Total;
			data=data.tables[m];
			if (data.Names === undefined || data.Values === undefined) return undefined;
			var names = data.Names;
			var values = data.Values;
			var result = new Array();
			for (var i in values) {
				if (values[i].length == 0 || values[i].length != names.length) {
					continue;
				}
				var row = {};
				for (var k in names) {
					row[names[k]] = values[i][k];
				}
				result.push(row);
			}
			//未分页的时候容错处理
			data.Total = data.Total || result.length;
			return {
				"Rows": result,
				"Total": data.Total
			};
		},
		//过滤数值
		numbersFilter: function(input, maxLength, type) {
			//如果参数传入2个，这可以动态方法比较
			if (arguments.length == 2) {
				if (Util.isNumeric(arguments[1])) {
					maxLength = arguments[1];
				} else if (typeof maxLength == "string") {
					type = arguments[1];
				}
			}
			var value = input.value;
			//因为是一个一个输入所以规则需要改变,即使输入"."不会过滤掉,但整体不会报错
			var rules = {
				"integer": /^\d+$/,
				"real": /(^[-+]?\d+(\.)?(\d+)?$)|(^[-+]$)/,
				"preal": /^\d+(\.)?(\d+)?$/
			};
			var reg = rules.integer;
			if (type !== undefined && rules[type] != undefined) {
				reg = rules[type];
			}
			//if (/^\d+$/.test(value)) {
			if (reg.test(value)) {
				if (maxLength !== undefined && value.length > maxLength) {
					input.value = value.substr(0, maxLength);
				}
				return true;
			}
			input.value = input.value.replace(/\D/g, '');
			return false;
		},
		//截取字符，缩略显示
		subStr: function(source, length, startIdnex, suffix) {
			if (!source||source.length == 0) return source;
			length = length || 10;
			(startIdnex == undefined) && (startIdnex = 0);
			suffix = suffix || "...";
			var result = source.length > length ? source.substr(startIdnex, length) + suffix : source;
			return result;
		},
		//获取url参数
		getQueryString: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return undefined;
		},
		//获取url数据
		getUrlData:function(str)
		{
			var url=window.location.href;
			var aGet={};
			str=str||"?";
			if (url.indexOf(str) != -1) {
				var urlQuery =url.split(str)[1];
				if (urlQuery.indexOf("&") !=-1) {
					var aUrlQuery = urlQuery.split("&");
					for (var i = 0; i< aUrlQuery.length; i++) {
						if (aUrlQuery[i].indexOf("=") !=-1) {
							var aParam = aUrlQuery[i].split("=");
							aGet[aParam[0]] = aParam[1];
						}
					}
				}
			}
			return aGet;
		},
		//获取类型
		typeOf: function(obj) {
			var type = Object.prototype.toString.call(obj);
			return type.replace("[object ", "").replace("]", "").toLowerCase();
		},
		//四舍五入（除去模式），返回数值类型，有别于toFixed不会再末尾补0
		toFixed2: function() {
			Number.prototype.toFixed2 = function(num) {
				if (this == 0) {
					return this.toString();
				}
				var tempNum = this.toFixed(num);
				var index = tempNum.indexOf(".");
				if (index == -1) {
					return tempNum;
				}
				var arr = tempNum.split(".");
				var len = arr[1].length;
				index = undefined;
				for (var i = len - 1; i >= 0; i--) {
					var n = arr[1][i];
					if (n !== "0") {
						index = i;
						break;
					}
				}
				if (index !== undefined) {
					arr[0] += ("." + arr[1].substr(0, index + 1));
				}
				return arr[0];
			}
		},
		//四舍五入（原型模式），把方法加到数值类型上，功能与toFixed一样，调用方式不同
		tofixed: function() {
			Number.prototype.tofixed = function(num) {
				num === undefined && (num = 0);
				return Math.round(this * Math.pow(10, num)) / Math.pow(10, num);
			}
		},
		 //获取时间的小时分钟秒
        formatHMS: function (value) {
            value = value / 1000; //value 是毫秒为单位的时间戳
            var days = parseInt(value / (24 * 3600)); //天
            var tempSecond = value % (24 * 3600); //剩余秒数
            var hours = parseInt(tempSecond / 3600); //小时
            tempSecond = tempSecond % 3600;
            var minutes = parseInt(tempSecond / 60); //分
            tempSecond = tempSecond % 60;
            var seconds = Math.round(tempSecond); //秒
            var result = days + "天" + hours + "小时" + minutes + "分" + seconds + "秒";
            return result;
        }, 
        //获取当前日期
        //GetDate: function () {
        //    var now = new Date();
        //    var year = now.getFullYear();
        //    var month = (month = "0" + (now.getMonth() + 1)).substr(month.length - 2, 2);
        //    var day = (day = "0" + now.getDate()).substr(day.length - 2, 2);
        //    var dateVal = year + "-" + month + "-" + day;
        //    return dateVal;
        //},
        GetDate: function (date) {
			var x=date;
			try {
				if(Util.typeOf(x)!=="date") {
					if(Util.typeOf(new Date(x))!=="date") {
						x = x.toString().replace(/-/g, "/");
					}
					x = new Date(x);
				}
				var month = ("0" + (x.getMonth() + 1)).slice(-2);
				var day = ("0" + x.getDate()).slice(- 2);
				var dateVal =  month + "-" + day;
				return dateVal;
			}
			catch (e) {
				return "";
			}
        },
        //时间格式化
        dateFormat: function (date, format) {
            format = format && format.toString().length > 0 ? format : "yyyy-MM-dd";
            if (date && format && date.toString().length > 0) {
              var x=date,  y = format.toString();
                try {
					if(Util.typeOf(x)!=="date") {
						if(Util.typeOf(new Date(x))!=="date") {
							x = x.toString().replace(/-/g, "/");
						}
						x = new Date(x);
					}
                    var z = { M: x.getMonth() + 1, d: x.getDate(), h: x.getHours(), m: x.getMinutes(), s: x.getSeconds() };
                    y = y.replace(/(M+|d+|h+|m+|s+)/g, function (v) { return ((v.length > 1 ? "0" : "") + eval('z.' + v.slice(-1))).slice(-2) });
                    return y.replace(/(y+)/g, function (v) { return x.getFullYear().toString().slice(-v.length) });
                }
                catch (e) {
                    return "";
                }
            } else {
                return "";
            }
        },
        //数据序列化
        Serialize:function(data){
        	var vdata=new Array();
        	if(Util.typeOf(data)=="object"){
        		for(var key in data){
        			vdata.push(key+"="+encodeURIComponent(data[key]));
        		}
        	}else if(Util.typeOf(data)=="array"){
        		var len=data.length;
				for(var i=0;i<len;i++){
					var n=data[i];
					n.value=encodeURIComponent(n.value);
					vdata.push(n.name+"="+n.value);
				}
			}
        	return vdata.join("&");
        },
        //获取数值某字段字符集（用分隔符分隔）
        getAttrStrByArrary:function(arr,delim,fieldname){
        	delim===undefined&&(delim=",");
        	var len;
        	if(Util.typeOf(arr)=="array"&&(len=arr.length)>0){
        		if(fieldname==undefined){
        			return arr.join(delim);
        		}else{
        			if(arr[0][fieldname]!==undefined){
        				var temp=[];
        				for(i=0;i<len;i++){
        					temp.push(arr[i][fieldname]);
        				}
        				return temp.join(delim);
        			}
        		}
        	}
        	return "";
        },
		alert_title: function(ops) { /*提示弹窗*/
			$('.prompt').hide();
			clearTimeout(Util.times);
			var type=ops.type||"success";
			var title_text = ops.text||"您还没有输入";
			var html='<div id="alert_title" class="prompt prompt-'+type+'"> <p><a class="icon"></a></p><div class="prompt-text"><p>'+title_text+'</p></div></div>';
			$("#alert_title").remove();
			$("body").append(html);
			$("#alert_title").fadeIn();
			var is_number = ops.time ? parseInt(ops.time) : 2000;
			Util.times = setTimeout(function() {$("#alert_title").remove();	}, is_number);
		},
		//数据缓存
		setStorage:function(name,obj){
			if(typeof obj=="object"){
				obj=JSON.stringify(obj)
			}
			sessionStorage.setItem(name,obj)
		},
		//获取缓存数据
		getStorage:function(key){
			var data;
			try{
				var obj=sessionStorage.getItem(key);
				data=JSON.parse(obj);
			}catch(e){
				data=obj;
			}
			return data;
		},
		//清空缓存数据
		removeStorage:function(key){
			localStorage.removeItem(key)
		}
	};
})();