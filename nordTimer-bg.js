if (typeof (nordTimer) == "undefined") {
	var nordTimer = {};
}
nordTimer = {
	dbug : false,
	timing : false,
	state : "unstarted",
	clickTime : null,
	startTime : null,
	totalTime : 0,
	divisor : 1000,
	timeIntervalID : null,
	inited : false,
	updateTimer : function (tm) {
		nordTimer.totalTime += tm - nordTimer.startTime;
	},
	updateLabel : function () {
		var totalTime = 0;
		if (nordTimer.timing) {
			totalTime = nordTimer.totalTime + (new Date() - nordTimer.startTime);
		} else {
			totalTime = nordTimer.totalTime;
		}
		//nordTimer.nordLbl.setAttribute("label", nordTimer.toTime(totalTime));
		chrome.browserAction.setTitle({title : nordTimer.toTime(totalTime)});
	},
	toTime : function (ms) {
		ms = Math.round(ms / 1000);
		var hours = "00";
		var minutes = "00";
		var seconds = "00";
		var returnValue = 0;
		if (ms >= 3600) {
			hours = Math.floor(ms/3600);
			ms = ms - (hours * 3600);
		}

		if (ms >= 60) {
			minutes = Math.floor(ms/60);
			if (minutes < 10) minutes = "0" + minutes;
			ms = ms - (minutes * 60);
		}

		seconds = (ms < 10 ? "0" + ms : ms);

		if (nordTimer.dbug) console.log ("Returning " +  hours + ":" + minutes + ":" + seconds + ".");
		return hours + ":" + minutes + ":" + seconds;
	}, // End of toTime
	handleClick : function () {
		if (nordTimer.dbug) console.log ("Handling click");
		switch (nordTimer.state) {
			case "unstarted" :
				if (nordTimer.dbug) console.log ("It's unstarted.  Starting....");
				nordTimer.state = "timing";
				nordTimer.timing = true;
				nordTimer.startTime = new Date();
				nordTimer.timeIntervalID = setInterval(nordTimer.updateLabel, 1000);
				break;
			case "timing" :
				var now = new Date();
				if (nordTimer.clickTime && (now.getTime() - nordTimer.clickTime.getTime() < 1000)) {
					// double click - reset
					if (nordTimer.dbug) console.log ("It's timing, but it's a double-click, so resetting...");
					clearInterval(nordTimer.timeIntervalID);
					nordTimer.timeIntervalID = null;
					chrome.browserAction.setTitle({title : chrome.i18n.getMessage("extensionName")});
					nordTimer.state = "unstarted";
					nordTimer.timing = false;
					nordTimer.startTime = null;
					nordTimer.clickTime = null;
					nordTimer.totalTime = 0;

				} else {
					if (nordTimer.dbug) console.log ("It's timing.  Pausing....");
					nordTimer.state = "paused";
					nordTimer.timing = false;
					clearInterval(nordTimer.timeIntervalID);
					nordTimer.timeIntervalID = null;
					nordTimer.updateTimer(new Date());
					//chrome.browserAction.setTitle({title : chrome.i18n.getMessage("extensionName")});
				}
				break;
			case "paused" :
				if (nordTimer.dbug) console.log ("It's unstarted.  resuming....");
				nordTimer.clickTime = new Date();
				nordTimer.startTime = new Date();
				if (nordTimer.dbug) console.log ("Setting clickTime as " + nordTimer.clickTime.getTime() + ".");
				nordTimer.state = "timing";
				nordTimer.timing = true;
				nordTimer.timeIntervalID = setInterval(nordTimer.updateLabel, 1000);
				break;
		}
	}
}
browser.browserAction.onClicked.addListener(nordTimer.handleClick);

if (nordTimer.dbug) console.log ("Loaded nordTimer-bg.js.");
