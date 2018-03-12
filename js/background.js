chrome.runtime.onMessage.addListener((request) => {
    if(request.data) {
        if(request.data.errors){
            sendToExtension(request.data);
        }else {
            sendToCurrentTab(request.data);
        };
    };
});

function sendToCurrentTab(data){
    getCurerentTab((currentTab) => {
        if(!currentTab || !currentTab.id || !currentTab.url){
            sendToExtension({errors:config.errors.noTab});
        }else if(config.domainName.split('/')[2] !== currentTab.url.split('/')[2]){
            sendToExtension({errors: config.errors.badDomain});
        }else {
            chrome.tabs.sendMessage(currentTab.id, {data: data});
        };
    });
};

function getCurerentTab(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        callback(tabs[0]);
    });
};

function sendToExtension(data){
     chrome.runtime.sendMessage({ data: data});
};

function stopRun(){
    chrome.runtime.sendMessage({ data : { stopRun : true} });
};


