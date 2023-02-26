/*
此版本为 2023 翻新版，功能比以往强大许多，使用时请遵循开源协议;
可运行本工具的网址: 
http://lonelystar.org/plantsvszombies.htm
http://jspvz.com/plantsvszombies.htm
*/

window["oChat"] = { // 配置，可更改
	View: top["window"]["frames"]["ChatView"], Send: top["window"]["frames"]["IF2"], // 这个就不要动啦
	Black_User: {"用户": true}, // 黑名单列表，这里取不存在的用户名作为例子
	Black_Word_Set: { // 坏词语屏蔽，支持正则表达式
		Open_Black_Word: false, // 是否开启词语检测，可能会消耗性能
		Change_Word_Vip: [{Word: "测试", Change: "测试"}], // 单个词/全局正则(/xxx/g)替换特定字符
		Change_Word_List: ["6"], // 需要替换的屏蔽词列表，若要使用正则请使用全局正则(/xxx/g)
		Change_Str: "6", // 替换后的字符串，屏蔽词里每个字符都会替换成这个字符
		Delete_Word_List: [/(\d{50})/g], // 一级屏蔽词，检测到将整句不显示
		Delete_UserName_List: [/WSSB/g, "无畏"] // 名称屏蔽，支持正则
	}, //黑名单词语
	White_User: {"用户": true}, // 白名单列表
	Get_Visitor_Chat: false, // 是否接收游客信息
	Get_More_Chat: true, // 一秒接收多条信息
	Get_One_Same_Chat: true, // 接收一个人连续相同信息
	Get_System_Chat: true, // 接收系统消息
	Get_Chat_Times: 1000, // 接收消息间隔，单位毫秒，安全考虑最低1000，从下一次接收开始。（未实装）
	Open_WhiteList: false, // 是否开启白名单
	Open_Face: false, // 开启表情系统
	Max_Save_Chat_Num: Infinity, // 最大消息容纳数（页面总最多容纳历史记录条数）
	Max_Delete_Chat_Num: 100, // 最大删除消息量
	Max_Face_Show_Num: 5, // 每条消息最大容纳表情数量
	New_Chat_Set_Bottom: true, // 新消息回到底部
	New_System_Chat_Set_Bottom: true, // 新系统消息回到底部
	Show_Invalid_Chat: false // 用颜色提示、显示出未开屏蔽者无法收到的消息
};

(function(){
	let CV = top["oChat"]["View"], CS = top["oChat"]["Send"], ToStrEval = (f, n, i) => {i["eval"](n + "=" + f["toString"]()); return i;}, Tp = top, Wd = window;
	let Make_New_Chat = () => { // 制造新消息
		let Tp = top, Wd = window;
		return (Name = "", Val = "", Col = "#005", System = false) => {
			if (System == true && Tp["oChat"]["Get_System_Chat"] == false) return; // 不显示系统消息
			let ret = NewEle(0, 'div', 'white-space:pre;float:left;position:relative;width:100%;min-height:20px;line-height:20px;word-break:break-all;', {'innerHTML': '<span style="font-family:幼圆;color:#005">' + (new Date()).format("hh:mm:ss") + '</span> <span style="font-weight:bold;color:' + Col + '">' + Name + ':</span> ' + Val},dbody);
			if (System == true) ret["firstChild"]["onclick"] = function() {ClearChild(this["parentElement"])}, ret["firstChild"]["style"]["cursor"] = "pointer";
			if (Tp["oChat"]["New_System_Chat_Set_Bottom"] == true && System == true) Wd["dbody"]["scrollTop"] = 1e10; // 是系统消息，且允许滚动，滚动
			if (Tp["oChat"]["New_Chat_Set_Bottom"] == true && System == false) Wd["dbody"]["scrollTop"] = 1e10; // 不是系统消息但允许滚动，滚动
			Wd["childNodes"] = Wd["dbody"]["childElementCount"];
		};
	};
	let ClearScreen = () => { //删除消息释放内存
		let T = top, W = window, NMax = (A, B) => {return Math.max(A, B) || B;};
		return (Str) => {
			ClearChild($('dLoader'));
			ClearScreen = function(Str){
				if (Str == "") return;
				let MN = NMax(T["oChat"]["Max_Delete_Chat_Num"], 1), MG = NMax(T["oChat"]["Max_Save_Chat_Num"], 0), N;
				for (N = 0; N < MN && childNodes > MG; ++N, --childNodes) ClearChild(dbody["firstChild"]);
				childNodes = dbody["childElementCount"]; //更新数量
				delete MN, MG, N; //释放内存
			};
			ClearScreen(Str);
		};
	};
	let AjaxChat = () => {
		let Tp = top, Wd = window;
		let ChatLen, Arr, i, LastChatArr = [], FinalShowTextNum, FinalT, FinalHTML; // Arr: 消息数组; ChatLen: 数组长度; i: 计算后的起始位置; LastChatArr: 上次显示的数组; FinalShowTextNum: 显示消息数，直接决定是否滚屏; FinalT: 不屏蔽时最后一次发言时间; FinalHTML: 发言的html
		let UseFace, SendT, SendContent, SendLevel, LastSendContent, Sender; // UseFace: 本句话使用表情次数; SendT: 发送时间; SendContent: 发送内容; SendLevel: 发送者等级; LastSendContent: 最后一次发送的内容; Sender: 本次发送消息的用户
		let Get_Last_Location = (Arr, LastChatArr, Num) => {
			let key1 = {}, key2 = {}, keycode = [], Alen = Arr["length"], Llen = LastChatArr["length"], ret = Alen;
			for (let _ = 0; _ < Alen; ++_) key1[Arr[_]] = Math.random(), key2[Arr[_]] = Math.random(); // 可能会有很大冲突概率，故生成两次哈希
			for (let _ = 0; _ < Alen; ++_) keycode[_] = [key1[Arr[_]], key2[Arr[_]]]; // 重新得到哈希，因为句子可能一样

			for (let _ = 0, l; _ < Alen; ++_) { // 暴力枚举
				for (l = 0; l < Llen && _ + l < Alen; ++l) if(!(key1[LastChatArr[l]] == keycode[_ + l][0] && key2[LastChatArr[l]] == keycode[_ + l][1])) break;
				if (_ + l == Alen) ret = Math.min(ret, _); // 最早找到的匹配，理论可直接break。
			};
			delete key1, key2, keycode, Alen, Llen;
			return ret;
		};
		let Decode_SendContent = (Str) => { // 解码
			UseFace = 0, Str = unescape(Str).replace(/</g, '&lt;').replace(/>/g, '&gt;'); //反html
			(Tp["oChat"]["Open_Face"]) && (Str = Str.replace(/(\\\\\d{4})/g, (m, p) => {return ((++UseFace) > Tp["oChat"]["Max_Face_Show_Num"]) ? (p) : ('<img src="../images/faces/' + p.substr(2,4) + '.gif">');}));
			return Str;
		};
		let Check_Continue = (SendContent, SendT, Sender, SendLevel, tmp1, tmp2) => {
			if (Tp["oChat"]["Get_One_Same_Chat"] == false && LastSendContent == tmp1[1]) return true; // 不接收一个人连续相同信息
			if (Tp["oChat"]["Get_Visitor_Chat"] == false && SendLevel == 0) return true; // 是否屏蔽游客
			if (Tp["oChat"]["Black_User"][Sender] == true) return true; // 是否在黑名单中，是则屏蔽
			if (Tp["oChat"]["Open_WhiteList"] == true && Tp["oChat"]["White_User"][Sender] != true) return true; // 是否打开白名单、是否在白名单中
			if (Tp["oChat"]["Get_More_Chat"] == true && SendT < T) return true; // 如果是一秒接收多条消息，那么小于跳过
			if (Tp["oChat"]["Get_More_Chat"] == false && SendT <= T) return true; // 否则可以接收同一秒的信息
			if (Tp["oChat"]["Black_Word_Set"]["Open_Black_Word"] == true && (function(){for(let _ of Tp["oChat"]["Black_Word_Set"]["Delete_Word_List"])try{if(SendContent.search(_)!=-1)return true;}catch(why){console.error("匹配出现错误！",why);};return false;})() == true) return true;
			if (Tp["oChat"]["Black_Word_Set"]["Open_Black_Word"] == true && (function(){for(let _ of Tp["oChat"]["Black_Word_Set"]["Delete_UserName_List"])try{if(Sender.search(_)!=-1)return true;}catch(why){console.error("匹配出现错误！",why);};return false;})() == true) return true;

			LastSendContent = tmp1[1]; // 更新上一次的聊天数据
			return false;
		};
		let Change_SendContent = (Str) => {
			for (let Obj of Tp["oChat"]["Black_Word_Set"]["Change_Word_Vip"]) try{Str = Str.replaceAll(Obj["Word"], function(){return Obj["Change"];});}catch(why){console.error("替换失败",why);}; // 特殊替换
			for (let Obj of Tp["oChat"]["Black_Word_Set"]["Change_Word_List"]) try{Str = Str.replaceAll(Obj, function(n, m){return n.split("").fill(Tp["oChat"]["Black_Word_Set"]["Change_Str"]).join("");});}catch(why){console.error("替换失败",why);}; // 普通替换
			return Str;
		};
		let Set_Invalid_Chat = (HTML, Bool) => { // 给html设置为不显示消息的格式
			if (!Tp["oChat"]["Show_Invalid_Chat"] || !Bool) return HTML; // 未开启/不需要，不执行
			SetStyle(HTML, {"opacity": "0.5", "filter": "grayscale(50%)", "color": "#FF0000"});
			return HTML; // 如果非屏蔽时发言时间与本条相等，那么这一句在别人眼里将不会显示
		};
		return () => { // T - 1500方便定位
			Ajax("GetChat.asp?T=" + (T - 1500) + "&" + Math.random(), "Get", "", function(Str) {
				if (Str == "") return; //没有新发言
				FinalShowTextNum = 0, Arr = Str["split"](",,,"), ChatLen = Arr["length"], i = Get_Last_Location(Arr, LastChatArr);
				for (let _ = i - 1, tmp1, tmp2, tbl; _ >= 0; --_, tmp1 = null, tmp2 = null, tbl = false) { // 处理消息
					UseFace = 0, tmp1 = Arr[_]["split"](',,'), tmp2 = tmp1[1]["split"](','); // tmp1: [Time, str], tmp2: [Sender, Content];
					SendContent = Decode_SendContent(tmp2[1]), SendT = parseInt(tmp1[0]), Sender = tmp2[0], SendLevel = parseInt(tmp2[2]), tbl = (FinalT == SendT), FinalT = SendT; // 发送内容解码、获取时间、等级、重置最后一句话时间

					if (Check_Continue(SendContent, SendT, Sender, SendLevel, tmp1, tmp2)) continue; // 判断是否跳过本句显示
					if (Tp["oChat"]["Black_Word_Set"]["Open_Black_Word"] == true) SendContent = Change_SendContent(SendContent); //检查替换

					FinalHTML = NewEle(0, 'div', 'white-space:pre;float:left;position:relative;width:100%;min-height:20px;line-height:20px;word-break:break-all;', {'innerHTML': '<span style="font-family:幼圆;color:#005;cursor:pointer;" onclick="Add_User_List(\'' + Sender + '\', \'White_User\', \'白名单\');">' + (new Date(SendT)).format("hh:mm:ss") + '</span> <span style="cursor:pointer;' + (SendLevel > 0 ? 'font-weight:bold;': '') + 'color:' + {0 : '#000' , 1 : '#005' , 255 : '#00F'} [SendLevel] + '" onclick="Add_User_List(\'' + Sender + '\', \'Black_User\', \'黑名单\');" type="butoon">' + Sender + ':</span> ' + SendContent},dbody);
					Set_Invalid_Chat(FinalHTML, tbl); //tbl: 是否要提示

					Wd["T"] = SendT, Wd["childNodes"] = Wd["dbody"]["childElementCount"], FinalShowTextNum++;
				};
				if (Tp["oChat"]["New_Chat_Set_Bottom"] && FinalShowTextNum > 0) Wd["dbody"]["scrollTop"] = 1e10;
				LastChatArr = Arr, ClearScreen(Str); // 更新最后一次获取到的数组，同时确保稳定; 清除多余消息
			});
		}
	};
	let Add_User_List = () => {
		let Tp = top, Wd = window;
		return (User, ListName, StrName) => {
			Tp["oChat"][ListName][User] = !Tp["oChat"][ListName][User];
			Make_New_Chat("系统", `您对用户${User}进行了设置${StrName}操作，Ta目前${StrName}状态: ${Tp["oChat"][ListName][User]}`, "#00F", true);
		};
	};

	CS && (CS["ChatInterval"] = 2500); // 设置发言间隔

	CV["dbody"]["parentElement"]["childNodes"][1]["style"]["cursor"] = 'pointer';//白名单功能按钮
	CV["dbody"]["parentElement"]["childNodes"][1]["onclick"] = function() {//白名单功能功能
		Tp["oChat"]["Open_WhiteList"] = !Tp["oChat"]["Open_WhiteList"];
		CV["Make_New_Chat"]("系统", "您" + (Tp["oChat"]["Open_WhiteList"] ? "开启" : "关闭") + "了白名单功能", "#00F", true);
	};

	ToStrEval(Make_New_Chat, "Make_New_Chat", CV)["Make_New_Chat"] = CV["Make_New_Chat"]();
	ToStrEval(ClearScreen, "ClearScreen", CV)["ClearScreen"] = CV["ClearScreen"]();
	ToStrEval(AjaxChat, "AjaxChat", CV)["AjaxChat"] = CV["AjaxChat"]();
	ToStrEval(Add_User_List, "Add_User_List", CV)["Add_User_List"] = CV["Add_User_List"]();
})(window); //闭包