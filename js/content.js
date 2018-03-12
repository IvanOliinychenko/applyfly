console.log('test');

let url = new URL(window.location.href);
if(url.searchParams.get("applyFly")){
    Main();
}
else{
    localStorage[config.state]  = JSON.stringify({ state: 0 });
};


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.data.validate) {
        if(!document.cookie.match(new RegExp(config.loginCookiName + '=([^;]+)'))) {
            chrome.runtime.sendMessage({data: {errors : config.errors.notSignIn} });
        }else {
            chrome.runtime.sendMessage({data:{}});
        };
    };

    if(request.data.run){
        cleanLocalStorage();
        window.location = `${config.scriptStartPage}&keywords=${encodeURIComponent(request.data.search)}&location=${encodeURIComponent(request.data.location)}&applyFly=true`;
    };
    if(request.data.stopRun){
        cleanLocalStorage();
        window.location = config.domainName;
    };
});

function cleanLocalStorage(){
    localStorage.removeItem(config.state);
    localStorage.removeItem(config.storageName);
    localStorage.removeItem(config.jobsHome);
};

function Main(){

    let links = new Storage(config.storageName);

    if (localStorage[config.state] == undefined || JSON.parse(localStorage[config.state]).state == 0) {
        startJobCollection(function (storage) {
            StartApplying(storage);
        });
    }
    else if(JSON.parse(localStorage[config.state]).state == 3){

    }
    else {

        setTimeout(function () {
            // we collected everything and we started applying to jobs

            // TODO: If something fail update record in localstorage
            // #ember2317 > button > span:nth-child(2)
            console.log("We are applying");
            let applyBtn = document.querySelector(".jobs-s-apply__button.js-apply-button");
            if(applyBtn) applyBtn.click();

            let applyPhone = document.querySelector("#apply-form-phone-input");
            if(applyPhone) applyPhone.click();

            let optionText = document.querySelector(".jobs-apply-form__upload-options-text");
            if(optionText) optionText.click();

            sleep(2);

            let resume = document.querySelector(".jobdetails_apply_reuse_resume");
            if(resume) resume.click();

            //sleep(500);

            let closeBtn = document.querySelector("[data-ember-action-11811='11811']");
            if(closeBtn) closeBtn.click();
            //sleep(500);

            StartApplying(links);
        }, 2000);
    }

    function startJobCollection(callback) {
        setTimeout(function () {

            localStorage[config.jobsHome] = window.location;

        
            window.scrollTo(0, document.body.scrollHeight);
            getJobsUrls(callback);

        }, 2000);

        function getJobsUrls(callback) {
            setTimeout(() => {

                links.pushLinks(getListOfElementsOnAJobPage());
                localStorage[config.jobsHome] = window.location;

                if (links.getLength() >= config.limit) {
                    callback(links);
                }else {
                    let url = new URL(window.location.href);
                    let start = url.searchParams.get("start");
                    if(start) {
                        start = parseInt(start) + 25;
                        window.location = window.location.href.replace(/(start=).*?(&)/,'$1' + start + '$2');;
                    }else {
                        window.location = window.location.href + "&start=25";
                    };
    
                    start = start ? start += 25 * 1 : start = 25;

                    return startJobCollection();
                };

            }, 5000);
        }
    }

    // we are moving to the next application page
    function StartApplying(storage) {
        let links = storage.getStore();
        // we get list of urls that we haven't visisted
        let stack = Object.keys(links).filter(key => !links[key]);

        console.log(stack);

        localStorage[config.state] = JSON.stringify({ state: 1 });

        if (stack.length === 0) {
            localStorage[config.state] = JSON.stringify({ state: 3 });
            return;
        }

        // need to put to false into storage
        var url = stack.pop();

        // we saw this link so update
        links[url] = true;

        storage.update(links);

        window.location.href = url;
    }

    function getListOfElementsOnAJobPage() {
        return _x('//h3').filter(x => x.id.includes("ember")).map(x => x.parentNode.parentNode.href);
    }


    function Storage(storeName) {
        let rawStore = localStorage[storeName];

        if (!rawStore) {
            let s = new Object();
            localStorage[storeName] = JSON.stringify(s);
        }

        return {
            pushLinks: function (links) {
                let store = JSON.parse(localStorage[storeName]);

                links.forEach(element => {
                    if (!store[element])
                        store[element] = false;
                });

                localStorage[storeName] = JSON.stringify(store);
            },
            getLength: function () {
                console.log(JSON.parse(localStorage[storeName]));
                return Object.keys(JSON.parse(localStorage[storeName])).length;
            },
            getStore: function () {
                return JSON.parse(localStorage[storeName]);
            },
            update: function (links) {
                localStorage[storeName] = JSON.stringify(links);
            }
        };
    }

    function _x(STR_XPATH) {
        var xresult = document.evaluate(STR_XPATH, document, null, XPathResult.ANY_TYPE, null);
        var xnodes = [];
        var xres;
        while (xres = xresult.iterateNext()) {
            xnodes.push(xres);
        }
        return xnodes;
    }

    function sleep(seconds) 
    {
    var e = new Date().getTime() + (seconds * 1000);
    while (new Date().getTime() <= e) {}
    }
}


