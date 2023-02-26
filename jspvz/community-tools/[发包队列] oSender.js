// oSender 信息队列处理器
let oSender = (function(){
	let Sleep = (T) => new Promise((R) => setTimeout(R, T));
	let PromiseWait = (F, WaitT) => new Promise((R) => {(async () => R(await F()))(), (async () => R(await Sleep(WaitT), null))();});
	let ret = {
		Sleep: Sleep, PromiseWait: PromiseWait,
		MaxWaitTime: 5000, WaitTimeSend: 1000, TQ: [], // MaxWaitTime: 判定请求超时范围; WaitTimeSend: 两次发包最小间隔毫秒
		Timer: null,
		Init: (self) => (self = ret, self["TQ"] = []),
		Start: (self) => { // 开始请求
			if ((self = ret)["Timer"] != null) return; self["Timer"] = 0;
			(async function () {
				let N = Date["now"]();
				self["TQ"]["length"] && (await PromiseWait(async () => (await self["TQ"][0]["f"]["apply"](self["TQ"][0]["f"], self["TQ"][0]["ar"])), self["MaxWaitTime"]), self["TQ"]["splice"](0, 1));
				(self["Timer"] != null) && (self["Timer"] = setTimeout(arguments.callee, self["WaitTimeSend"] - (Date["now"]() - N))); // 发包冷却
			})();
		},
		Stop: () => { // 暂停请求
			clearTimeout(ret["Timer"]), ret["Timer"] = null;
		},
		Clear: () => { // 清除所有请求任务
			ret["TQ"]["length"] = 0;
		},
		addTask: (f, arr, self) => (self = ret, self["TQ"]["push"]({f: f, ar: arr})) // 加入请求任务至队列末尾
	};
	return ret;
})();


// oSender 使用方法
oSender.Start(); // 开启队列

oSender.addTask((A, B, C) => console.log(A, B, C), [1, 2, 3]); // 加入队列，支持非异步函数
oSender.addTask((A, B, C) => console.log(A, B, C), [4, 5, 6]); // 加入队列，支持非异步函数
oSender.addTask(async (A) => console.log(await fetch(A)), ["asp/GetChat.asp?T=0&" + Math.random()]); // 加入队列，可使用异步函数，运行时会等待其完成
oSender.addTask((T) => new Promise((R) => setTimeout(() => (console.log(T), R()), T)), [1000]); // 加入队列，异步函数
oSender.addTask((T) => new Promise((R) => setTimeout(() => (console.log(T), R()), T)), [2000]); // 加入队列，异步函数
oSender.addTask((T) => new Promise((R) => setTimeout(() => (console.log(T), R()), T)), [3000]); // 加入队列，异步函数

oSender.Stop(); // 关闭


/*
oSender: 请求队列，功能为执行队列头的异步函数并等待其完成，若等待时长超过规定超时时长，则强制执行下一个请求

浏览器运行需求: 支持 HTML5 async 等功能
*/