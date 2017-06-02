window.icare = window.icare || {};
icare.adapter = (function () {
    var version = "1.0.2";
    var callbacks = {};
    var mIdx = 0;
    var operator = '[iCareCPAdapter] ';
    var pager = '[' + document.title + '] ';
    var pageId = encodeURIComponent(document.title);

    function executePostMessage(e) {
        var params;
        try {
            if (typeof e.data == 'undefined' || e.data == null) return;
            writeLog('executePostMessage Data : ' + e.data);
            var eventObject = '';
            try{
                eventObject = JSON.parse(e.data);
            }
            catch(e){
                eventObject = null;
            }
            if (eventObject != null && typeof eventObject["destination"] !== 'undefined') {
                // check post to which browser
                if (eventObject.destination != 'iCareCP') {
                    eventObject = reversionRoute(eventObject);
                    doPostMessage(eventObject);
                    //var iframe = document.getElementById(eventObject.destination);
                    //if (iframe) {
                    //    writeLog('executePostMessage send to contentWindow : ' + eventObject.destination);
                    //    iframe.contentWindow.postMessage(JSON.stringify(eventObject), '*');
                    //}
                }
                else {
                    writeLog('executePostMessage will execute method name : ' + eventObject.name);
                    //改寫為eval版本會比較小，但eval效能較差
                    switch (eventObject.name)
                    {
                        case 'setSoftPhoneButtonStatus':
                            icare.adapter.setSoftPhoneButtonStatus(isNull(eventObject.buttonId), (isNull(eventObject.buttonStatus) == 'Enable'));
                            break;
                        case 'setUserDataVar':
                            icare.adapter.setUserDataVar(isNull(eventObject.varname), isNull(eventObject.varvalue));
                            break;
                        case 'getUserDataVar':
                            eventObject['return'] = icare.adapter.getUserDataVar(isNull(eventObject.varname));
                            eventObject = reversionRoute(eventObject);
                            doPostMessage(eventObject);
                            break;
                        case 'RefreshBrowser':
                            icare.adapter.refreshBrowser(isNull(eventObject.browserId));
                            break;
                        case 'CloseTabBrowsers':
                            icare.adapter.closeTabBrowsers();
                            break;
                        case 'CloseBrowser':
                            icare.adapter.closeBrowser(isNull(eventObject.browserId));
                            break;
                        case 'DialCall':
                            icare.adapter.dialCall(isNull(eventObject.phonenum));
                            break;
                        case 'TransferCall':
                            icare.adapter.transferCall(isNull(eventObject.phonenum), isNull(eventObject.attached));
                            break;
                        case 'ConferenceCall':
                            icare.adapter.conferenceCall(isNull(eventObject.phonenum), isNull(eventObject.attached));
                            break;
                        case 'HoldCall':
                            icare.adapter.holdCall();
                            break;
                        case 'UnHoldCall':
                            icare.adapter.unHoldCall();
                            break;
                        case 'CancelCall':
                            icare.adapter.cancelCall();
                            break;
                        case 'HangupCall':
                            icare.adapter.hangupCall();
                            break;
                        case 'AnswerCall':
                            icare.adapter.answerCall();
                            break;
                        case 'isOffline':
                            eventObject['return'] = icare.adapter.isOffline();
                            eventObject = reversionRoute(eventObject);
                            doPostMessage(eventObject);
                            break;
                        case 'isOnCall':
                            eventObject['return'] = icare.adapter.isOnCall();
                            eventObject = reversionRoute(eventObject);
                            doPostMessage(eventObject);
                            break;
                        case 'getCurrentCallType':
                            eventObject['return'] = icare.adapter.getCurrentCallType();
                            eventObject = reversionRoute(eventObject);
                            doPostMessage(eventObject);
                            break;
                        case 'OpenBrowser':
                            icare.adapter.openBrowser(isNull(eventObject.browserId), 
                                isNull(eventObject.type), 
                                isNull(eventObject.url), 
                                isNull(eventObject.sourceId), 
                                isNull(eventObject.width), 
                                isNull(eventObject.height), 
                                isNull(eventObject.otype));
                            break;
                        case 'showPopup':
                            icare.adapter.showPopup(eventObject.msgtype, eventObject.title, eventObject.content);
                            break;
                        default:
                            break;
                    }

                }
            }
        } catch (e) {
            writeLog('executePostMessage Error : ' + e.message);
        }
    }

    function reversionRoute(obj)
    {
        // if has return value meens done, then forward back
        if (typeof obj.return !== 'undefined') {
            var tempRoute = obj.destination;
            obj.destination = obj.organization;
            obj.organization = tempRoute;
        }
        return obj;
    }

    function writeLog(message) {
        if (window.console && console.log) {
            console.log(operator + pager + message);    // + ' version:' + version
        }
    }

    function isNull(v)
    {
        return (typeof v == 'undefined' || v == null) ? '' : v;
    }

    function doPostMessage(eventObject) {
        var iframe = document.getElementById(eventObject.destination);
        if (iframe) {
            var appURL = $('#iCareAppiframe1').attr('src');
            if (appURL.indexOf('&iCareBrowserId=') > 0) {
                writeLog('executePostMessage send to contentWindow : ' + eventObject.destination);
                iframe.contentWindow.postMessage(JSON.stringify(eventObject), '*');
            }
            else {
                writeLog('executePostMessage send back contentWindow : ' + eventObject.destination);
                //再次反轉回原頁面
                //eventObject = reversionRoute(eventObject);
                var tempRoute = eventObject.destination;
                eventObject.destination = eventObject.organization;
                eventObject.organization = tempRoute;

                eventObject["return"] = null;
                var orgiframe = document.getElementById(eventObject.destination);
                if (orgiframe) {
                    orgiframe.contentWindow.postMessage(JSON.stringify(eventObject), '*');
                }
            }
        }
    }

    function initialize() {
        //
    };
    initialize();

    return {
        initialize: function () {
            if (window.attachEvent) {
                window.attachEvent('onmessage', executePostMessage);
            } else {
                window.addEventListener('message', executePostMessage, false);
            }
        }
        , checkVersion: function () {
            return '' + version;
        }
        , setSoftPhoneButtonStatus: function (id, enabled) {
            if (enabled) {
                if ($('#' + id)) {
                    $('#' + id).linkbutton("enable");
                    $('#' + id).show();
                }
            }
            else {
                if ($('#' + id)) {
                    $('#' + id).linkbutton("disable");
                    $('#' + id).hide();
                }
            }
        }
        , setUserDataVar: function (key, val) {
            icare.cti.setUserData(key, val);
        }
        , getUserDataVar: function (key) {
            return icare.cti.getUserData(key);
        }
        , refreshBrowser: function (browserId) {
            var iframe = document.getElementById(browserId);
            if (iframe)
                iframe.src = iframe.src;
        }
        , closeTabBrowsers: function () {
            var current_tab = $('#tabs').tabs('getSelected');
            if (current_tab) {
                var index = $("#tabs").tabs("getTabIndex", current_tab);
                $("#tabs").tabs("close", index);
            }
        }
        , closeBrowser: function (browserId) {
            var maps = $('#tabs div[class="panel-body panel-body-noheader panel-body-noborder"]');
            for (var i in maps) {
                if (maps[i].id == browserId)
                {
                    $("#tabs").tabs("close", $('#tabs ul[class="tabs"] span[class="tabs-title tabs-closable"]')[i].innerText);
                    break;
                }
            }
        }
        , dialCall: function (phone) {
            //icare.sip.Dial(phone);
            document.getElementById("txtDial").value = phone;
            $('#iCareSP_btn_Dial').click();
        }
        , transferCall: function (phone, attached) {
            //icareState.line.transferingTargetNo = phone;
            //icare.sip.Transfer(icareState.line.transferingTargetNo);
            //console.log(attached);
            if (attached != "undefined" && attached != null) {
                try {
                    var pObj = JSON.parse(attached);
                    for (var w in pObj) {
                        //console.log("icare.cti.setUserData(" + w + ", " + pObj[w] + ")");
                        icare.cti.setUserData(w, pObj[w]);
                    }
                }
                catch (e) {
                    console.log("transferCall parse JSON format error");
                }
            }
            document.getElementById("txtTransfer").value = phone;
            $('#iCareSP_btn_Transfer').click();
        }
        , conferenceCall: function (phone, attached) {
            //icareState.line.conferencingTargetNo = phone;
            //icare.sip.Conference(icareState.line.conferencingTargetNo);
            //console.log(attached);
            try {
                var pObj = JSON.parse(attached);
                for (var w in pObj) {
                    //console.log("icare.cti.setUserData(" + w + ", " + pObj[w] + ")");
                    icare.cti.setUserData(w, pObj[w]);
                }
            }
            catch (e) {
                console.log("conferenceCall parse JSON format error");
            }
            document.getElementById("txtConference").value = phone;
            $('#iCareSP_btn_Conf').click();
        }
        , holdCall: function () {
            //icare.sip.Hold();
            $('#iCareSP_btn_Hold').click();
        }
        , unHoldCall: function () {
            //icare.sip.UnHold();
            $('#iCareSP_btn_HoldUN').click();
        }
        , cancelCall: function () {
            $('#iCareSP_btn_Cancel').click();
        }
        , hangupCall: function () {
            //icare.sip.HangUp();
            $('#iCareSP_btn_Hangup').click();
        }
        , answerCall: function () {
            //icare.sip.Answer();
            $('#iCareSP_btn_Answer').click();
        }
        , isOffline: function () {
            return loginOption.offline;
        }
        , isOnCall: function () {
            //20160614 replace icareState.line.currentState to icareState.agent.current
            return (icareState.agent.current == 'BUSY' || icareState.agent.current == 'RING');
        }
        , getCurrentCallType: function () {
            return icareState.ContactType;
        }
        , openBrowser: function (BrowseId, sType, sURL, sSourceId, iWidth, iHeight, sOType) {//0607 fix
            icare.Log(operator + pageId + " openBrowser In ...");
            icare.Log(BrowseId + "/" + sType + "/" + sURL + "/" + sSourceId + "/" + iWidth + "/" + iHeight + "/" + sOType);
            if (sType == "MAIN") {
                initMainTab(sURL);
            }
            else if (sType == "NEW") {
                openWin(BrowseId, icare.cti.initParamURL(sURL), iHeight, iWidth);
            }
            else if (sType == "TAB") {
                addTab(BrowseId, BrowseId, sURL, true);
            }
            else if (sType == 'iCareAppiframe1') {
                icare.Log(operator + pageId + " openBrowser iCareAppiframe1 In ...");
                if (!$('#appiframe').is('visabled')) {
                    $('#appiframe').show();
                }
                addPanel('tabContent', 'south');
                icare.Log(operator + pageId + "openBrowser addPanel");
                ////[FFSC-6245]
                //if (!$('#iCareAppiframe1')[0]) {    
                //    document.getElementById("appiframe").innerHTML = "<iframe id=\"iCareAppiframe1\" src=\"about:blank\" height=\"95%\" width=\"100%\" frameborder=\"0\" style=\"margin:0px auto;padding:0px;\"></iframe>";
                //    //[PDT-915]
                //    if (_setting_.system.appframeLoading) {
                //        document.getElementById("appiframe").innerHTML += "<div id=\"AppiframeLoading\" style=\"text-align:center\"><img src=\"images/wait.gif\" /></div>";
                //    }
                //}
                showiCareAppiframe(icare.cti.initParamURL(sURL));
                icare.Log(operator + pageId + " openBrowser iCareAppiframe1 End ...");
            }
            else {
                //addTab(skill, skillname, skillURL, true);
            }
            icare.Log(operator + pageId + " openBrowser End ...");
        }
        , showPopup: function (sTitle, sContent, isRight) {
            //20160908 3秒設定不作用，改到系統設定
            popMsg('slide', sTitle, sContent, isRight, 3, 250, 150);
        }
    }
})();
icare.adapter.initialize();
