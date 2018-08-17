if (window.ConditionalCall == null) {
	var ConditionalCallDriver = function() {
		this.mTaskQueue = new Set();
		this.mTimer = null;
	};
	ConditionalCallDriver.prototype = {
        _schedule: function () {
            var self = this;
            this.mTaskQueue.forEach(function(item) {
                try {
	                var result = item.condition.call(item.context);
	                if (result === true || result === 1) {
		                item.callback.call(item.context);
		                self.mTaskQueue.delete(item);
	                } else if (result === false || result === 0) {
		                // Do nothing.
	                } else {
		                self.mTaskQueue.delete(item);
	                }
	            } catch(err) {
	                console.log(err);
	                self.mTaskQueue.delete(item);
	            }
            });
            if (this.mTaskQueue.size === 0) {
	            window.clearInterval(this.mTimer);
	            this.mTimer = null;
            }
        },
		invoke: function(that, cond, cb) {
			if ( cond.call(that) ) {
				cb.call(that);
			} else {
				this.mTaskQueue.add({
					context: that,
					condition: cond,
					callback: cb
				});
				if (this.mTimer == null) {
				    var self = this;
					this.mTimer = window.setInterval(function() {
					    self._schedule();
					}, 50);
				}
			}
		};
	};
	window.ConditionalCall = new ConditionalCallDriver();
}
