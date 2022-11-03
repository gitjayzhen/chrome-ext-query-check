$(function() {
	// 加载设置
	var defaultConfig = {color: 'white'}; // 默认配置
	chrome.storage.sync.get(defaultConfig, function(items) {
		document.body.style.backgroundColor = items.color;
		chrome.storage.local.get({querys: [], cursor: 0}, function(item) {
			if(item.cursor < item.querys.length){
				var qr = item.querys[item.cursor - 1];
				var q = qr.q;
				var tips = "第"+item.cursor+"条(总"+item.querys.length+")测试：" + qr.id + " " + q;
				document.getElementById('current_query').innerText = tips;
			}
		});
	});

});

// 打开后台页
$('#open_background').click(e => {
	var querys = $('#querys').val();
	var query_list = querys.split('\n');
	var query_storage = []
	for(var i=0; i < query_list.length; i++){
		var tmp = query_list[i].trim().split('\t');
		var id = tmp.slice(-1)
		var q = tmp.slice(0, -1).join(' ');
		query_storage.push({id: id, q: q.trim()})
	}
	alert("共有测试数据：" + query_storage.length)
	chrome.storage.local.set({querys: query_storage, cursor: 0}, function() {});

	window.open('http://sl.m.jayzhen.com/');
	chrome.devtools.inspectedWindow.eval("window.location.href", function(result, isException)
	{
		chrome.devtools.panels.openResource(result, 20, function()
		{
			console.log('资源打开成功！');
		});
	});
});

// 隐藏词条的输入框
$('#hidden_area').click(e => {
	var tmp = document.getElementById('querys');
	if(tmp.style.display === "none"){
		tmp.style.display = "block"
	}else{
		tmp.style.display = "none"
	}
})

// 测试吓一跳内容
$('#check_one').click(e => {
	chrome.storage.local.get({querys: [], cursor: 0}, function(item) {
		if(item.cursor < item.querys.length){
			var qr = item.querys[item.cursor];
			var q = qr.q;
			var tips = "第"+(item.cursor + 1)+"条(总"+item.querys.length+")测试：" + qr.id + " " + q;
			document.getElementById('current_query').innerText = tips;
			getCurrentTabId(tabId => {
				chrome.tabs.update(tabId, {url: "http://sl.m.jayzhen.com/web/searchList.jsp?keyword=" + q});
				chrome.storage.local.set({ cursor: item.cursor + 1}, function() {});
			});
			setTimeout(()=> {
				var codeStr = 'console.log("'+tips+'");var el = window.document.querySelector("div[id*=\'jayzhen_vr_'+qr.id+'\']");';
				codeStr = codeStr + 'if(el){console.log("存在VR请查看标记绿框内容.");el.style.border="2px solid green";window.scrollTo(0, getTop(el) - 200);}else{'
				codeStr = codeStr + 'console.log("未检查到VRID:' + qr.id +', 请手动检查.");}'
				executeScriptToCurrentTab(codeStr);
				}, 2000)
		}else{
			console.log("当前设定的"+item.querys.length+"条词条，已经验证完毕，请输入新的词条内容")
		}
	});
})


// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 这2个获取当前选项卡id的方法大部分时候效果都一致，只有少部分时候会不一样
function getCurrentTabId2()
{
	chrome.windows.getCurrent(function(currentWindow)
	{
		chrome.tabs.query({active: true, windowId: currentWindow.id}, function(tabs)
		{
			if(callback) callback(tabs.length ? tabs[0].id: null);
		});
	});
}


// 向content-script注入JS片段
function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
	});
}
