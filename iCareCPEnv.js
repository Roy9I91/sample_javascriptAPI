/*!
 * iCareCPEnv.js 
 *      - version   : 0
 *      - descript  : base on iCareEnv.js version 1.8
 *      - note      : can't cross between http and https
 *                    can't work on cross domain browser(ActiveX Object Browser)
 */     
window.icare = window.icare || {};
icare.interaction = (function () {
    var version = 1;
    var majoy = 0;
    var Minor = 2;
    var callbacks = {};     //callback function List
    var mIdx = 0;           //method index
    var operator = '[iCareCPEnv] ';
    var pager = '[' + document.title + '] ';
    var pageId = getUrlParams('iCareBrowserId');    //encodeURIComponent(document.title);
    var no_support = 'no support';

    function executePostMessage(e) {
        try {
            if (typeof e.data == 'undefined' || e.data == null) return;
            writeLog('executePostMessage Data : ' + e.data + ' from ' + e.origin);
            var eventObject = JSON.parse(e.data);
            var returnValue;
            if (typeof eventObject.destination !== 'undefined') {
                if (eventObject.destination != 'iCareCP') {
                    if (eventObject.name.indexOf('RunBrowser') >= 0 && typeof eventObject.return === 'undefined') {
                        //do method 
                        writeLog('executePostMessage do method ' + eventObject.function + '(\'' + eventObject.parameter + '\')');
                        returnValue = window[eventObject.function](eventObject.parameter);
                        writeLog('executePostMessage get return value \'' + returnValue + '\'');
                        //attached return value in eventObject
                        eventObject["return"] = returnValue;
                        //post back to iCareCP
                        doPostMessage(eventObject);
                    }
                    //else if (eventObject.name.indexOf('RunBrowser') >= 0 && typeof eventObject.return !== 'undefined') {
                    //    //execute callback method 
                    //    writeLog('executePostMessage do 1 callbacks[\'' + eventObject.uuid + '\'](\'' + eventObject.return + '\')');
                    //    if (typeof callbacks[eventObject.uuid] !== 'undefined') {
                    //        writeLog('executePostMessage do callbacks[\'' + eventObject.uuid + '\'](\'' + eventObject.return + '\')');
                    //        callbacks[eventObject.uuid](eventObject.return);
                    //    }
                    //}
                    else if (eventObject.destination == pageId && typeof eventObject.return !== 'undefined') {
                        //execute callback method 
                        writeLog('executePostMessage do 2 callbacks[\'' + eventObject.uuid + '\'](\'' + eventObject.return + '\')');
                        if (typeof callbacks[eventObject.uuid] !== 'undefined') {
                            writeLog('executePostMessage do callbacks[\'' + eventObject.uuid + '\'](\'' + eventObject.return + '\')');
                            callbacks[eventObject.uuid](eventObject.return);
                        }
                    }
                    else { }
                }
                else {
                    writeLog('executePostMessage doPostMessage ' + eventObject.function);
                    //window[eventObject.function](eventObject.parameter);
                    doPostMessage(eventObject); //, callback
                }
            }
        } catch (e) {
            writeLog("executePostMessage Failed to process API response.");
        }
    }

    function doPostMessage(raiseevent, callback) {
        writeLog('doPostMessage Data : ' + JSON.stringify(raiseevent));
        if (callback) {
            raiseevent.uuid = regCallback(raiseevent.uuid, callback);
            writeLog('doPostMessage registed callbacks[\'' + raiseevent.uuid + '\']');
        }
        //allow-all-domain
        if (window.parent) {
            window.parent.postMessage(JSON.stringify(raiseevent), '*');
        }
        else {
            writeLog('There is no parent window');
        }
    }

    function regCallback(uuid, callback) {
        //hard to dup
        if (callbacks[uuid]) {
            uuid += '_' + mIdx;
            mIdx++;
        }
        callbacks[uuid] = callback;
        return uuid;
    }

    function generateUUID() {
        var uuid = '', i, random;
        for (loop = 0; loop < 32; loop++) {
            random = Math.floor(Math.random() * 16 | 0);
            if (loop === 8 || loop === 12 || loop === 16 || loop === 20) {
                uuid += '-';
            }
            uuid += (loop === 12 ? 4 : (loop === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid.toUpperCase();
    }

    function writeLog(message) {
        if (window.console && console.log) {
            console.log(operator + pager + message);
        }
    }

    function getUrlParams(Params) {
        var GetUrl = document.location.href;

        if (GetUrl.indexOf(Params) >= 0) {
            var UrlParams = (GetUrl.split("?", 2)[1] || "").split("#")[0].split("&") || [];
            for (var i = 0; i < UrlParams.length; i++) {
                var single = UrlParams[i].split("=");
                if (single[0] == Params) {
                    return unescape(single[1]);
                }
            }
        }

        return "";
    }

    function initialize() {
        //do something if need initialize
    };
    initialize();

    return {
        initialize: function () {
            //build API event listener
            if (window.attachEvent) {
                window.attachEvent('onmessage', executePostMessage);
            } else {
                window.addEventListener('message', executePostMessage, false);
            }
        }
        , checkVersion: function () {
            return version + '.' + majoy + '.' + Minor;
        }
        , runBrowser: function (frameId, functionname, parameter) {
            var raiseevent = {
                'organization': pageId,
                'destination': frameId,
                'uuid': generateUUID(),
                'name': 'RunBrowser',
                'function': functionname,
                'parameter': parameter
            };
            doPostMessage(raiseevent);  //without register callback
        }
        , runBrowser2: function (frameId, functionname, parameter, callback) {
            var raiseevent = {
                'organization': pageId,
                'destination': frameId,
                'uuid': generateUUID(),
                'name': 'RunBrowser2',
                'function': functionname,
                'parameter': parameter
            };
            doPostMessage(raiseevent, callback);
        }
        , setSoftPhoneButtonStatus: function (ButtonId, BtnStatus) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'setSoftPhoneButtonStatus',
                'buttonId': ButtonId,
                'buttonStatus': BtnStatus
            };
            doPostMessage(raiseevent);
        }
        , getUserDataVar: function (VarName, callback) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'getUserDataVar',
                'varname': VarName
            };
            doPostMessage(raiseevent, callback);
        }
        , setUserDataVar: function (VarName, VarValue) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'setUserDataVar',
                'varname': VarName,
                'varvalue': VarValue
            };
            doPostMessage(raiseevent);
        }
        , refreshBrowser: function (BrowserId) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'RefreshBrowser',
                'browserId': BrowserId
            };
            doPostMessage(raiseevent);
        }
        , closeTabBrowsers: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'CloseTabBrowsers'
            };
            doPostMessage(raiseevent);
        }
        , closeBrowser: function (BrowserId) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'CloseBrowser',
                'browserId': BrowserId
            };
            doPostMessage(raiseevent);
        }
        , dialCall: function (strPhoneNum) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'DialCall',
                'phonenum': strPhoneNum
            };
            doPostMessage(raiseevent);
        }
        , transferCall: function (strPhoneNum, attached) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'TransferCall',
                'phonenum': strPhoneNum,
                'attached': (typeof attached !== "undefined" && attached != null) ? attached : ""
            };
            doPostMessage(raiseevent);
        }
        , conferenceCall: function (strPhoneNum, attached) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'ConferenceCall',
                'phonenum': strPhoneNum,
                'attached': (typeof attached !== "undefined" && attached != null) ? attached : ""
            };
            doPostMessage(raiseevent);
        }
        , holdCall: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'HoldCall'
            };
            doPostMessage(raiseevent);
        }
        , unHoldCall: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'UnHoldCall'
            };
            doPostMessage(raiseevent);
        }
        , cancelCall: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'CancelCall'
            };
            doPostMessage(raiseevent);
        }
        , hangupCall: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'HangupCall'
            };
            doPostMessage(raiseevent);
        }
        , answerCall: function () {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'AnswerCall'
            };
            doPostMessage(raiseevent);
        }
        , isOffline: function (callback) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'isOffline'
            };
            doPostMessage(raiseevent, callback);
        }
        , isOnCall: function (callback) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'isOnCall'
            };
            doPostMessage(raiseevent, callback);
        }
        , getCurrentCallType: function (callback) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'getCurrentCallType'
            };
            doPostMessage(raiseevent, callback);
        }
        , openBrowser: function (BrowserId, sType, sURL, sSourceId, iWidth, iHeight, sOType) {  //0607 fix
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'OpenBrowser',
                'browserId': BrowserId,
                'type': sType,
                'url': sURL,
                'sourceId': sSourceId,
                'width': iWidth,
                'height': iHeight,
                'otype': sOType
            };
            doPostMessage(raiseevent);
        }
        , showPopup: function (sType, sTitle, sContent) {
            var raiseevent = {
                'organization': pageId,
                'destination': 'iCareCP',
                'uuid': generateUUID(),
                'name': 'showPopup',
                'msgtype': sType,
                'title': sTitle,
                'content': sContent
            };
            doPostMessage(raiseevent);
        }
    }
})();
icare.interaction.initialize();

// =========================================================================

function iCareInit(obj1, obj2, vlist) {
    return "Repeal";
}

function iCare_getAction(vlist) {
    return "Repeal";
}

function getCallSessionID(callback) {
    getUserDataVar('MMIP_SessionID', callback);
}

/* get current or lastest call's AttachData Variable
	param 
		VarName: UserData Name come from MMIP or by setUserDataVar	
		
	Note: standard UserData avaiable: {'ANI', 'DNIS', 'MMIP_SessionID', 'AgentID', 'Domain', 'Extension'}
		ANI: caller id of incoming call
		DNIS: calling number of incoming call, or dial number of outgoing call
		MMIP_SessionID: unique sessionID of currently(or lastest one) call
		AgentID: login user's ID		
		Domain: login user's tenant
		Extension: login user's extenstion number
*/
function getUserDataVar(VarName, callback) {
    icare.interaction.getUserDataVar(VarName, callback);
}

/* set or update current or lastest call's AttachData Variable 
	param 
		VarName:  UserData Name come from MMIP or by setUserDataVar	
		VarValue: new value for VarName	
		
	Note: 
		How new value of UserData set by this function affected (exsitence scope) ?
		1. It will pass to every ServiceTree launchs page as URL parameter,
			until set new value again or replace by next incoming call.
		2. When current call Transferring or Confferencing to another user,
		    It will pass this new UserData and value.
		3. It can be get back by call getUserDataVar, 
			until set new value again or replace by next incoming call.      	
*/
function setUserDataVar(VarName, VarValue) {
    icare.interaction.setUserDataVar(VarName, VarValue);
}

/* iCare SoftPhone 'ACW' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnACWStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_ACW";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'AUX' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnAUXStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_AUX";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'DIAL' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnDialStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_Dial";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'READY' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnReadyStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_AVA";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'REDIAL' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnREDIALStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_REDIAL";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'CALLTYPE' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnCallTypeStatus(BtnStatus) {
    var ButtonId = "iCare_toolbar_CallType";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone 'MONITOR' Button Status Control 
	param
		BtnStatus: 'Disable' or 'Enable'
*/
function BtnMonitorStatus(BtnStatus) {
    var ButtonId = "iCareSP_btn_Monitor";
    setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

/* iCare SoftPhone Button Status Control 
	param
		ButtonId: Ids that configured by ToolbarCfg 
		BtnStatus: 'Disable' or 'Enable'
*/
function setSoftPhoneButtonStatus(ButtonId, BtnStatus) {
    if (BtnStatus != 'Disable' && BtnStatus != 'Enable') {
        alert("setSoftPhoneButtonStatus Error: BtnStatus MUST be one of {'Disable', 'Enable'}");
        return;
    }
    icare.interaction.setSoftPhoneButtonStatus(ButtonId, BtnStatus);
}

function getSoftPhoneButtonStatus(ButtonId) {
    return "No Support"; // Not Support
}

function OpenExternalIE(strUrl) {
 
    var BrowseId = "ExtIE";
    var TYPE = "TAB";
    var OType = "IE_EXT";
    var SourceId = "";
    var Width = "";
    var Height = "";
    var Url = strUrl;

    OpenBrowser(BrowseId, TYPE, Url, SourceId, Width, Height, OType);
}

/*
	Open new (or replace) iCare Browser
	Param
		BrowseId: unique string, if Id is exists, it will NOT create new browser but replace exists one
		sType: string value, one of {'NEW', 'iCareAppiframe1', 'TAB', 'MAIN'}
			'NEW': open sURL within pop-up window
			'iCareAppiframe1': open sURL within bottom window at iCare right side
			'TAB': open sURL within new firefox TAB
			'MAIN': open(or replace) within firefox Main Page 
		sURL: page URL will display
		sSourceId: simply leave it EMPTY
		iWidth, iHeight:  window's width and height in px, affected ONLY when sType='NEW' 	
		sOType: string value, one of {'FireFox', 'IE', 'IE_EXT'}
			'FireFox': open a firefox window
			'IE':	   open an IETab window ('IETab' extenstion MUST installed)
			'IE_EXT':  open an external standalong IE browser ('IETab' extenstion MUST installed)
*/
function OpenBrowser(BrowseId, sType, sURL, sSourceId, iWidth, iHeight, sOType) {
    icare.interaction.openBrowser(BrowseId, sType, sURL, sSourceId, iWidth, iHeight, sOType);
}

function RunBrowser(BrowserId, functionname, parameter) {
    icare.interaction.runBrowser(BrowserId, functionname, parameter);
}

function RunBrowser2(BrowserId, functionname, parameter, callback) {
    icare.interaction.runBrowser2(BrowserId, functionname, parameter, callback);
}

function RefreshBrowser(BrowserId) {
    icare.interaction.refreshBrowser(BrowserId);
}

function CloseTabBrowsers() {
    //actionList.push("iCareBrowser.closeTabBrowser()");
    icare.interaction.closeTabBrowsers();
}

/* Close iCare Pop-Window currently 
   Note: the pop-window MUST be iCare Browser witch create by iCare OpenBrowser	function
*/
function CloseBrowser(BrowserId) {
    //actionList.push("iCareBrowser.CloseBrowser('" + BrowserId + "')");
    icare.interaction.closeBrowser(BrowserId);
}

/* Get iCare Window currently 
   Note: the pop-window MUST be iCare Browser witch create by iCare OpenBrowser	function
*/
function GetBrowser(BrowserId) {
    return "No Support";
}

// ?????
/*
	Force turn On/Off that user Can NOT/Can Logout from iCare
	this usually for control user behavior
*/
function setICareCanNotLogout(YesOrNo, CanNotLogoutMsg) {
    //actionList.push("setICareCanNotLogout:" + YesOrNo + "#" + CanNotLogoutMsg);
    var ButtonId = "iCare_Toolbar_btnLogout_Tooltip";
    setSoftPhoneButtonStatus(ButtonId, (YesOrNo == 'Yes') ? 'Enabled' : 'Disable');
}

// ?????
/*
	Force turn On/Off that user Can NOT/Can set READY status for next Incoming Call
	this usually for control user behavior
*/
function setICareCanNotReady(YesOrNo, CanNotReadyMsg) {
    //actionList.push("setICareCanNotReady:" + YesOrNo + "#" + CanNotReadyMsg);
    var ButtonId = "iCareSP_btn_AVA";
    setSoftPhoneButtonStatus(ButtonId, (YesOrNo == 'Yes') ? 'Enabled' : 'Disable');
}

/*
	make an outgoing call
	param
		strPhoneNum: phone number that will be dial
					 for long distance or international call, MUST have national or area code
*/
function DialCall(strPhoneNum) {
    //actionList.push("iCareMMIP.Dial_Out('" + strPhoneNum + "', '');");
    icare.interaction.dialCall(strPhoneNum);
}

/*
	transfer the call
	param
		strPhoneNum: phone number that will be transfer to
					 for long distance or international call, MUST have national or area code
*/
function TransferCall(strPhoneNum, attached) {
    //actionList.push("iCareMMIP.transferCall('" + strPhoneNum + "');");
    //console.log(JSON.stringify(attached));
    icare.interaction.transferCall(strPhoneNum, JSON.stringify(attached));
}

/*
	conferenceCall the call
	param
		strPhoneNum: phone number that will be conferenceCall to
					 for long distance or international call, MUST have national or area code
*/
function ConferenceCall(strPhoneNum, attached) {
    //console.log(JSON.stringify(attached));
    //actionList.push("iCareMMIP.conferenceCall('" + strPhoneNum + "');");
    icare.interaction.conferenceCall(strPhoneNum, JSON.stringify(attached));
}

/*
	HoldCall the call
*/
function HoldCall() {
    //actionList.push("iCareMMIP.holdCall();");
    icare.interaction.holdCall();
}

/*
	HoldCall the call
*/
function UnHoldCall() {
    //actionList.push("iCareMMIP.unholdCall();");
    icare.interaction.unHoldCall();
}

/*
HoldCall the call
*/
function CancelCall() {
    //actionList.push("iCareMMIP.cancelCall();");
    icare.interaction.cancelCall();
}

/*
	Hangup current call
*/
function HangupCall() {
    //actionList.push("iCareMMIP.handup();");
    icare.interaction.hangupCall();
}

/*
	check that if iCare softPhone's is in BUSY status or NOT 
*/
function isOnCall(callback) {
    //return (objiCare["iCareStatus"] == "BUSY" || objiCare["iCareStatus"] == "RING");
    icare.interaction.isOnCall(callback);
}

/*
	check that if user login iCare with OFF-LINE option or not 
*/
function isOffline(callback) {
    //return (objiCare["isOffline"] == "true");
    icare.interaction.isOffline(callback);
}

/*
	normalize currently call type to the one of {'CT_INBOUND', 'CT_OUTBOUND', 'CT_INSIDE'}
*/
function getCurrentCallType(callback) {
    //return (objiCare["PhoneType"] == "true");
    icare.interaction.getCurrentCallType(callback);
}

/*
Answer current call
*/
function AnswerCall() {
    //actionList.push("iCareMMIP.RespondCall();");
    icare.interaction.answerCall();
}

//1.0.1
function showPopup(sType, sTitle, sContent) {
    if (sType != 'Alert' || sType != 'Warning') {
        return 'sType Error';
    }
    var isR;
    if (sType == 'Alert') {
        isR = false;
    }
    if (sType == 'Warning') {
        isR = true;
    }
    icare.interaction.showPopup(isR, sTitle, sContent);
}