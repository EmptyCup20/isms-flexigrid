/* 
 * jquery-1.7.1
 * twitter-bootstrap-v2.0.4
 * 
 * 编码人员：hik-caishiding
 * 编码时间：2012-08-28
 * 
 * 系统名称：云管理平台--HEC(V1.0)
 * 功能界面：数据中心界面
 */

$(document).ready(function(){

// 进入界面session验证
	// 全局变量
	var $sessionid = CookieUtil.get("hecSessionId");
	// fn_get_session
	function fn_get_session(){
		$.ajax({
			url: encodeURI(baseHecUri+"sessions/"+$sessionid),
			type: "GET",
			processData: false,
			headers: {"Content-Type":'text/plain;charset=UTF-8',"SESSIONID":$sessionid},
			dataType: "json",
			success: function(data,textStatus) {
				if(data.role==='admin'){
					$('#body-user-message').text(data.user);
				}else{
					window.location.href="/hecweb";
				}
			},
			error: function(XMLHttpRequest,textStatus,errorThown) {
				window.location.href="/hecweb";
			}
		});
	}
	fn_get_session();
// end-----进入界面session验证

// 表单
	// $('#modal_password')
	// $('#modal_email')
	// $('#modal_add')
	// $('#modal_del')
// end-----表单



// 列表
	
//	{"id":1,"detail":{"active_hosts":1,"total_hosts":1,"num_of_pools":2,"used_disk":55,"used_memory":1776,
//		"total_vms":3,"total_memory":3916,"active_vms":3,"total_disk":461,"used_cpu":3,"total_cpu":4},
//	"status":"normal","name":"资源中心","ip":"10.64.49.201"}]}
	
	var $grid_center = $("#grid_center").flexigrid({
		url: encodeURI(baseHecUri+"centers"),//"../../json/grid-data.json",//
		method: 'GET',
		dataType: 'json',
		field: ["id","name","ip","status","status_v","detail.num_of_pools","detail.active_hosts","detail.total_hosts","host_v",
		        "detail.active_vms","detail.total_vms","vm_v","detail.used_memory","detail.total_memory","ram_v",
		        "detail.used_cpu","detail.total_cpu","cpu_v","detail.used_disk","detail.total_disk","disk_v"],
		colModel : [
			{display: '', name : 'rownum', width : 20, sortable : false, align: 'center'},
			{display: 'id', name : 'id', width : 100, sortable : true, align: 'center', hide : true},
			{display: '数据中心名称', name : 'name', width : 150, sortable : true, align: 'center'},
			{display: '数据中心IP地址', name : 'ip', width : 100, sortable : true, align: 'center'},
			{display: 'status', name : 'status', width : 100, sortable : true, align: 'center', hide : true},
			{display: '状态', name : 'status_v', width : 80, sortable : true, align: 'center', process: process_status_v},
			{display: '资源池(个)', name : 'num_of_pools', width : 80, sortable : true, align: 'center'},
			{display: '', name : 'active_hosts', width : 100, sortable : true, align: 'center', hide : true},
			{display: '', name : 'total_hosts', width : 100, sortable : true, align: 'center', hide : true},
			{display: '物理机(台)', name : 'host_v', width : 130, sortable : true, align: 'center', process: process_host_v},
			{display: '', name : 'active_vms', width : 100, sortable : true, align: 'center', hide : true},
			{display: '', name : 'total_vms', width : 100, sortable : true, align: 'center', hide : true},
			{display: '虚拟机(台)', name : 'vm_v', width : 130, sortable : true, align: 'center', process: process_vm_v},
			{display: '', name : 'used_memory', width : 100, sortable : true, align: 'center', hide : true},
			{display: '', name : 'total_memory', width : 100, sortable : true, align: 'center', hide : true},
			{display: '内存分配情况(MB)', name : 'ram_v', width : 130, sortable : true, align: 'center', process: process_ram_v},
			{display: '', name : 'used_cpu', width : 100, sortable : true, align: 'center', hide : true},
			{display: '', name : 'total_cpu', width : 100, sortable : true, align: 'center', hide : true},
			{display: 'CPU分配情况(核)', name : 'cpu_v', width : 130, sortable : true, align: 'center', process: process_cpu_v},
			{display: '', name : 'used_disk', width : 100, sortable : true, align: 'center', hide : true},
			{display: '', name : 'total_disk', width : 100, sortable : true, align: 'center', hide : true},
			{display: '硬盘分配情况(GB)', name : 'disk_v', width : 130, sortable : true, align: 'center', process: process_disk_v}
			],
		buttons : [
			{separator: true},
			{name: '<i class="icon-plus"></i> 新增数据中心', onpress : fn_grid_add},
			{separator: true},
			{name: '<i class="icon-minus"></i> 删除数据中心', onpress : fn_grid_del},
			{separator: true}
			],
		sortname: "",
		sortorder: "",
		resizable: false,
		usepager: true,
		useRp: true,
		rp: 50,
		
		errormsg: '发生错误!',
		pagestat: '显示记录从 {from} 到 {to} ，总数 {total} 条',
		procmsg: '加载中，请稍等...',
		nomsg: '没有符合条件的记录!',
		singleSelect:true,
		autoload: false,
		onSuccess: fn_grid_onSuccess,
		showToggleBtn: false,
		
		width: 'auto',
		height: 'auto',
		
		headers: {"SESSIONID":$sessionid},
		detail: true,
		login: '/hecweb',
		onRowClick:fn_grid_rowClick
	});
	// process_status_v
	function process_status_v(value, pid){
		switch($("#row"+pid+" td[abbr=status]").text()){
			case 'normal': $(value).html('<span style="color:green;">运行正常</span>');break;
			case 'error': $(value).html('<span style="color:red;">运行出错</span>');break;
			default: $(value).html('<span style="color:orange;">未知状态</span>');
		}
	}
	// process_server
	function process_server(value, pid, _used, _total){
		_used = $("#row"+pid+" td[abbr="+_used+"]").text();
		_total = $("#row"+pid+" td[abbr="+_total+"]").text();
		var _progress = '';
		switch(true){
			case (_used/_total*100>80): _progress = 'progress-danger';break;
			case (_used/_total*100>60): _progress = 'progress-warning';break;
			default: _progress = 'progress-success';
		}
		$(value).html(_used+' / '+_total+
			'<div class="progress progress-striped '+_progress+'" style="margin-bottom: 0px; padding: 0px; ">'+
				'<div class="bar" style="width: '+_used/_total*100+'%; "></div>'+
			'</div>'
		);
		_progress = null;
	}
	// process_host_v
	function process_host_v(value, pid){
		$(value).html($("#row"+pid+" td[abbr=active_hosts]").text()+
				' / '+$("#row"+pid+" td[abbr=total_hosts]").text()+'<br>运行 / 总数');
	}
	// process_vm_v
	function process_vm_v(value, pid){
		$(value).html($("#row"+pid+" td[abbr=active_vms]").text()+
				' / '+$("#row"+pid+" td[abbr=total_vms]").text()+'<br>运行 / 总数');
	}
	// process_ram_v
	function process_ram_v(value, pid){
		process_server(value, pid, 'used_memory', 'total_memory');
	}
	// process_cpu_v
	function process_cpu_v(value, pid){
		process_server(value, pid, 'used_cpu', 'total_cpu');
	}
	// process_disk_v
	function process_disk_v(value, pid){
		process_server(value, pid, 'used_disk', 'total_disk');
	}
	// 默认读取列表
	fn_grid_query();
	// 列表函数
	// fn_grid_rowClick
	function fn_grid_rowClick(){
		
	}
	// fn_grid_onSuccess
	function fn_grid_onSuccess(){
		
	}
	// fn_grid_add
	function fn_grid_add(){
		$('#modal_add').modal('show');
	}
	// fn_grid_del
	function fn_grid_del(){
		if(HecCommonUtil.fn_get_gridValues($grid_center,'name')){
			$('#modal_del').modal('show');
			$('#input_center_name_del').val(HecCommonUtil.fn_get_gridValues($grid_center,'name'));
			$('#input_center_ip_del').val(HecCommonUtil.fn_get_gridValues($grid_center,'ip'));
		}else{
			HecCommonUtil.fn_show_error('请选择要删除的记录！');
		}
	}
	// 列表查询按钮
	$("#btn_grid_query").bind('click', function (e) {
		e.preventDefault();
		fn_grid_query();
    });
	// 新增界面提交按钮
	$("#btn_add").bind('click', function (e) {
		if($("#input_center_name").val()===''){
			$(".alert_form").html("<strong>提示信息！</strong> 数据中心名称不能为空，请输入！");
		}else if($("#input_center_ip").val()===''){
			$(".alert_form").html("<strong>提示信息！</strong> 数据中心IP地址不能为空，请输入！");
		}else if(!$("#input_center_ip").val()
				.match(/^([1-9]|[1-9]\d|1\d\d|2[0-1]\d|22[0-3])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/)){
			$(".alert_form").html("<strong>提示信息！</strong> 数据中心IP地址有误，请重新输入！");
		}else{
			fn_add();
		}
    });
	// 删除界面删除按钮
	$("#btn_del").bind('click', function (e) {
		fn_del();
    });
	// fn_grid_query
	function fn_grid_query(){
		$grid_center.flexQuery(HecCommonUtil.fn_get_query_formValue("#grid_queryForm"));
	}
	// fn_add
	function fn_add(){
		$.ajax({
			url: encodeURI(baseHecUri+"centers"),
			type: "Post",
			processData: false,
			headers: {"Content-Type":'text/plain;charset=UTF-8',"SESSIONID":$sessionid},
			dataType: "json",
			data: HecCommonUtil.fn_get_formValue("#modal_add"),
			success: function(data,textStatus) {
				$('#modal_add').modal('hide');
				HecCommonUtil.fn_show_success('新增数据中心成功！');
				fn_grid_query();
			},
			error: function(XMLHttpRequest,textStatus,errorThown) {
				$('#modal_add').modal('hide');
				HecCommonUtil.fn_show_error(XMLHttpRequest.responseText);
				HecCommonUtil.fn_session_logout(XMLHttpRequest.status);
			}
		});
	}
	// fn_del
	function fn_del(){
		$.ajax({
			url: encodeURI(baseHecUri+"centers/"+HecCommonUtil.fn_get_gridValues($grid_center,'name')),
			type: "Delete",
			processData: false,
			headers: {"Content-Type":'text/plain;charset=UTF-8',"SESSIONID":$sessionid},
			dataType: "json",
			success: function(data,textStatus) {
				$('#modal_del').modal('hide');
				HecCommonUtil.fn_show_success('删除数据中心成功！');
				fn_grid_query();
			},
			error: function(XMLHttpRequest,textStatus,errorThown) {
				$('#modal_del').modal('hide');
				HecCommonUtil.fn_show_error(XMLHttpRequest.responseText);
				HecCommonUtil.fn_session_logout(XMLHttpRequest.status);
			}
		});
	}
// end-----列表



// public function
	// 菜单跳转
	var _menu = ['','btn_menu_hm','btn_menu_vm','btn_menu_approval','btn_menu_flavor','btn_menu_user','btn_menu_log'];
	$.each(_menu, function (i) {
		(_menu[i]==='')?'':HecCommonUtil.fn_menu_jump(_menu[i]);
	});
// end-----public function

});