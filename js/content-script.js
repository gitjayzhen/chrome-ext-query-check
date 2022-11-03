console.log('《测试部 - 让测试更简单》');

// 滑动计算
function getTop(e){
	var offset=e.offsetTop;
	if(e.offsetParent!=null){
		offset+=getTop(e.offsetParent);
	}
	return offset
};

