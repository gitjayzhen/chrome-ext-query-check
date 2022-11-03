//-------------------- 右键菜单演示 ------------------------//
chrome.contextMenus.create({
	title: "测试下一个Query",
	onclick: function(){
		// chrome.notifications.create(null, {
		// 	type: 'basic',
		// 	iconUrl: 'img/favicon.png',
		// 	title: '这是标题',
		// 	message: '您刚才点击了自定义右键菜单！'
		// });
		chrome.storage.local.get({querys: [], cursor: 0}, function(item) {
			if(item.cursor < item.querys.length){
				var qr = item.querys[item.cursor];
				var q = qr.q;
				var tips = "第"+(item.cursor + 1)+"条(总"+item.querys.length+")测试：" + qr.id + " " + q;
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
				alert("当前设定的"+item.querys.length+"条词条，已经验证完毕，请输入新的词条内容")
			}
		});
	}
});


// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
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