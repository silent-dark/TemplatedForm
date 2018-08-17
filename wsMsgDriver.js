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
		this.log = function (log) {
			console.log(log);
		};
		var self = this;

		// 消息处理对象注册函数：
		this.regMsgHandler = function(msgId, handlerOwner) {
			if (handlerOwner["onHandleMsg" + msgId] == null) {
				throw new Error("onHandleMsg" + msgId + " is undefined!");
			}
			var handlerOwners = self[msgId + "HandlerOwners"];
			if (handlerOwners == null) {
				handlerOwners = new Set();
				self[msgId + "HandlerOwners"] = handlerOwners;
			}
			handlerOwners.add(handlerOwner);
			self.log("WSMsgDriver.regMsgHandler: " + msgId);
		};
		// 消息匹配函数：
		this.dispatchMsg = function(msgObj) {
			var handlerOwners = self[msgObj.head.id + "HandlerOwners"];
			if (handlerOwners == null) {
				throw new ReferenceError(msgObj.head.id + "HandlerOwners is unregistered!");
			}
			var dispatched = false;
			var isBroadcast = (msgObj.head.to == null || msgObj.head.to === "all");
			var itr = handlerOwners.values();
			var itrItem = null;
			for ( itrItem = itr.next(); !itrItem.done; itrItem = itr.next() ) {
				if (  isBroadcast ||
					( msgObj.head.scope === "local" && msgObj.head.to == itrItem.value ) ||
					( msgObj.head.scope === "remote" && itrItem.value.getUserID != null && msgObj.head.to === itrItem.value.getUserID() )  )
				{
					itrItem.value["onHandleMsg" + msgObj.head.id](msgObj.head.from, isBroadcast, msgObj.body);
					dispatched = true;
				}
			}
			self.log("WSMsgDriver.dispatchMsg:\n\t" + JSON.stringify(msgObj) + "\n\t" + dispatched);
			return dispatched;
		};
		// 本地消息触发函数：
		this.triggerLocalMsg = function(by, msgId, msgBody) {
			self.dispatchMsg({
				head: {
					id: msgId,
					scope: "local",
					from: by,
					timestamp: Date.now()
				},
				body: msgBody
			});
		};
		// 驱动器对象停止函数：
		this.shutdown = function() {
			if (self.mWebsocket != null) {
				if (window.mPingTimer != null) {
					window.clearInterval(window.mPingTimer);
					window.mPingTimer = null;
				}
				self.mWebsocket.onmessage = null;
				self.mWebsocket.onclose = null;
				self.mWebsocket.onopen = null;
				if (self.mWebsocket.readyState < 2) {
					self.mWebsocket.close(1000);
				}
				self.mWebsocket = null;
				if (self.mTryAgain === 0) {
					try {
						self.triggerLocalMsg("msgDriver", "FinalExit", null);
					} catch (err) {
						// Do nothing.
					}
				}
				self.log("WSMsgDriver.shutdown: OK!");
			}
		};
		this.asyncShutdown = function() {
			ConditionalCall.invoke(
				self,
				function(ctx) {
					if (ctx.mWebsocket != null) {
						if (ctx.mSendPending || ctx.mWebsocket.bufferedAmount > 0) {
							ctx.log("WSMsgDriver.shutdown: pending...");
							return false;
						}
					}
					return true;
				},
				function(ctx) { ctx.shutdown(); }
			);
		};
		// 服务器连接函数：
		this.connectServer = function(url, tryAgainTimes, stateCallback, failedCallback) {
			if (window.WebSocket == null) {
				if (failedCallback == null) {
					alert("很抱歉！您的浏览器暂时不支持！");
				} else {
					failedCallback( new TypeError("WebSocket is undefined!") );
				}
			}
			self.shutdown();
			self.mWebsocket = new WebSocket(url); // it will throw an Error if the WebSocket is undefined.
			self.mWebsocket.onopen = function(ev) {
				if (stateCallback != null) {
					stateCallback(0);
				}
				self.mTryAgain = 0;
				self.log("WSMsgDriver.connectServer: OK!");
			};
			self.mWebsocket.onclose = function(ev) {
				if (window.mPingTimer != null) {
					window.clearInterval(window.mPingTimer);
					window.mPingTimer = null;
				}
				if (self.mTryAgain === 0) {
					if (stateCallback != null) {
						stateCallback(1);
					}
					try {
						self.triggerLocalMsg("msgDriver", "ReconnectServer", null);
					} catch (err) {
						// Do nothing.
					}
				}
				if (self.mTryAgain < tryAgainTimes) {
					self.mTryAgain++;
					window.setTimeout( function() {
						self.connectServer(url, tryAgainTimes, stateCallback, failedCallback);
					}, 3000 );
				} else {
					self.mTryAgain = 0;
					if (stateCallback != null) {
						stateCallback(-1);
					}
					if (failedCallback == null) {
						alert("很抱歉！目前无法连接直播教室，请检查您的网络或稍后重试！");
					} else {
						failedCallback( new Error("Failed to connect!") );
					}
					self.log("WSMsgDriver.connectServer: Failed!");
				}
			};
			self.mWebsocket.onmessage = function(ev) {
				try {
					self.dispatchMsg( JSON.parse(ev.data) );
				} catch (err) {
					if (failedCallback == null) {
						alert("很抱歉！收到错误消息：" + err.message);
					} else {
						failedCallback(err);
					}
					self.log(err);
				}
			};
			self.log("WSMsgDriver.connectServer: " + url);
		};
		// 消息发送函数：
		this.sendMsg = function(msgObj) {
			if (self.mWebsocket == null) {
				throw new ReferenceError("websocket is uninitizlized!");
			}
			var msg = JSON.stringify(msgObj);
			ConditionalCall.invoke(
				self,
				function(ctx) {
					ctx.mSendPending = false;
					if (ctx.mWebsocket == null) {
						return 1;
					}
					switch (ctx.mWebsocket.readyState) {
					case 0:
						ctx.mSendPending = true;
						ctx.log("WSMsgDriver.sendMsg:\n\t" + msg + "\n\tPending...");
						break;
					case 2:
					case 3:
						ctx.log("WSMsgDriver.sendMsg:\n\t" + msg + "\n\tCancelled!");
					}
					return ctx.mWebsocket.readyState;
				},
				function(ctx) {
					if (ctx.mWebsocket == null) {
						ctx.log("WSMsgDriver.sendMsg:\n\t" + msg + "\n\tCancelled!");
					} else {
						ctx.mWebsocket.send(msg);
						ctx.log("WSMsgDriver.sendMsg:\n\t" + msg);
					}
				}
			);
		};
		// 连接状态查询函数：
		this.getReadyState = function() {
			return self.mWebsocket.readyState;
		};
	};
}
