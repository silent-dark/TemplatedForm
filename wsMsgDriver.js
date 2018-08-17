// 消息驱动器对象：
//  通过该对象驱动所有消息的传递，并执行消息处理函数。
if (window.WSMsgDriver == null) {
	window.WSMsgDriver = function() {
		//// 消息处理函数接口：
		////   所有消息处理函数的命名应按此规范：["onHandleMsg" + msgId]
		//function (from, isBroadcast, msgBody) {
		//	// TODO: 在响应某消息的对象中实现该接口。
		//};
		this.mWebsocket = null;
		this.mTryAgain = 0;
		this.mSendPending = false;
	};
	window.WSMsgDriver.prototype = {
		log: function(logMsg) {
			console.log(logMsg);
		},
		// 消息处理对象注册函数：
		regMsgHandler: function(msgId, handlerOwner) {
			if (handlerOwner["onHandleMsg" + msgId] == null)
				throw new Error("onHandleMsg" + msgId + " is undefined!");
			var handlerOwners = this[msgId + "HandlerOwners"];
			if (handlerOwners == null) {
				handlerOwners = new Set();
				this[msgId + "HandlerOwners"] = handlerOwners;
			}
			handlerOwners.add(handlerOwner);
			this.log("WSMsgDriver.regMsgHandler: " + msgId);
		},
		// 消息匹配函数：
		dispatchMsg: function(msgObj) {
			var handlerOwners = this[msgObj.head.id + "HandlerOwners"];
			if (handlerOwners == null) {
				throw new ReferenceError(
				    msgObj.head.id + "HandlerOwners is unregistered!"
				);
			}
			var dispatched = false;
			var isBroadcast = (
			    msgObj.head.to == null || msgObj.head.to === "all"
			);
			handlerOwners.forEach(function(item) {
				if (isBroadcast || (
				        msgObj.head.scope === "local" &&
				        msgObj.head.to == item
				    ) || (
				        msgObj.head.scope === "remote" &&
				        item.getUserID != null &&
					    msgObj.head.to === item.getUserID()
				    )
				) {
					item["onHandleMsg" + msgObj.head.id].call(
					    item, msgObj.head.from, isBroadcast, msgObj.body
					);
					dispatched = true;
				}
			})
			this.log(
			    "WSMsgDriver.dispatchMsg: " + dispatched + "\n\t" +
			    JSON.stringify(msgObj)
			);
			return dispatched;
		},
		// 本地消息触发函数：
		triggerLocalMsg: function(by, msgId, msgBody) {
			this.dispatchMsg({
				head: {
					id: msgId,
					scope: "local",
					from: by,
					timestamp: Date.now()
				},
				body: msgBody
			});
		},
		// 驱动器对象停止函数：
		shutdown: function() {
			if (this.mWebsocket != null) {
				if (window.mPingTimer != null) {
					window.clearInterval(window.mPingTimer);
					window.mPingTimer = null;
				}
				this.mWebsocket.onmessage = null;
				this.mWebsocket.onclose = null;
				this.mWebsocket.onopen = null;
				if (this.mWebsocket.readyState < 2)
					this.mWebsocket.close(1000);
				this.mWebsocket = null;
				if (this.mTryAgain === 0) {
					try {
						this.triggerLocalMsg("msgDriver", "FinalExit");
					} catch (err) {
						// Do nothing.
					}
				}
				this.log("WSMsgDriver.shutdown: OK!");
			}
		},
		asyncShutdown: function() {
			ConditionalCall.invoke(
				this,
				function() {
					if (this.mWebsocket != null) {
						if (this.mSendPending ||
						    this.mWebsocket.bufferedAmount > 0)
						{
							this.log("WSMsgDriver.shutdown: pending...");
							return false;
						}
					}
					return true;
				},
				function() {
				    this.shutdown();
				}
			);
		},
		// 服务器连接函数：
		connectServer: function(url, retryTimes, onStateChanged, onFailed) {
			if (window.WebSocket == null) {
				if (onFailed)
					onFailed( new TypeError("WebSocket is undefined!") );
				else
					alert("浏览器暂不支持！");
			}
			this.shutdown();
			this.mWebsocket = new WebSocket(url);
    		var self = this;
			this.mWebsocket.onopen = function(ev) {
				if (onStateChanged)
					onStateChanged(0);
				self.mTryAgain = 0;
				self.log("WSMsgDriver.connectServer: OK!");
			};
			this.mWebsocket.onclose = function(ev) {
				if (window.mPingTimer != null) {
					window.clearInterval(window.mPingTimer);
					window.mPingTimer = null;
				}
				if (self.mTryAgain === 0) {
					if (onStateChanged)
						onStateChanged(1);
					try {
						self.triggerLocalMsg("msgDriver", "ReconnectServer");
					} catch (err) {
						// Do nothing.
					}
				}
				if (self.mTryAgain < retryTimes) {
					++(self.mTryAgain);
					window.setTimeout(function() {
						self.connectServer(
						    url, retryTimes, onStateChanged, onFailed
						);
					}, 3000);
				} else {
					self.mTryAgain = 0;
					if (onStateChanged)
						onStateChanged(-1);
					if (onFailed)
						onFailed( new Error("Failed to connect!") );
					else
						alert("无法连接服务器，请检查您的网络或稍后重试！");
					self.log("WSMsgDriver.connectServer: Failed!");
				}
			};
			this.mWebsocket.onmessage = function(ev) {
				try {
					self.dispatchMsg( JSON.parse(ev.data) );
				} catch (err) {
					if (onFailed)
						onFailed(err);
					else
						alert("收到错误消息：" + err.message);
					self.log(err);
				}
			};
			this.log("WSMsgDriver.connectServer: " + url);
		},
		// 消息发送函数：
		sendMsg: function(msgObj) {
			if (this.mWebsocket == null)
				throw new ReferenceError("websocket is uninitizlized!");
			var msg = JSON.stringify(msgObj);
			ConditionalCall.invoke(
				this,
				function() {
					this.mSendPending = false;
					if (this.mWebsocket == null)
						return 1;
					switch (this.mWebsocket.readyState) {
					case 0:
						this.mSendPending = true;
						this.log("WSMsgDriver.sendMsg: Pending...\n\t" + msg);
						break;
					case 2:
					case 3:
						this.log("WSMsgDriver.sendMsg: Cancelled!\n\t" + msg);
					}
					return this.mWebsocket.readyState;
				},
				function() {
					if (this.mWebsocket == null) {
						this.log("WSMsgDriver.sendMsg: Cancelled!\n\t" + msg);
					} else {
						this.mWebsocket.send(msg);
						this.log("WSMsgDriver.sendMsg:\n\t" + msg);
					}
				}
			);
		},
		// 连接状态查询函数：
		getReadyState: function() {
			return this.mWebsocket.readyState;
		}
	};
}
