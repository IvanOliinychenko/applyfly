let submitSearchForm,
    stopSearch,
    errorsContainer,
    locationField,
    searchField;

document.addEventListener('DOMContentLoaded', () => {
    submitSearchForm = document.querySelector('#submitSearchForm');
    stopSearch = document.querySelector('#stopSearch');
    errorsContainer = document.querySelector('#errorsContainer');
    searchField = document.querySelector("input[name='search']");
    locationField = document.querySelector("input[name='location']");

    submitSearchForm.addEventListener('click', () => validateAndSendFunc());
    stopSearch.addEventListener('click', () => stopSearchFunc());
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let url = new URL(tabs[0].url);
        if(url.searchParams.get("applyFly")){
            searchField.value = decodeURIComponent(url.searchParams.get("keywords"));
            locationField.value = decodeURIComponent(url.searchParams.get("location"));
            showStopSearch();
        };
    });
    
    var background = chrome.extension.getBackgroundPage();
    
    chrome.runtime.onMessage.addListener( (request) => {
        if(request.data) {
            if(request.data.errors){
                showErrors(request.data.errors);
            }else{
                runSearchFunc();
            }
        }
    });
});

function validateAndSendFunc() {
    if(searchFormIsValid()){
        validateContent();
    };
};

function searchFormIsValid(){
    
    let errors = "";
    errorsContainer.setAttribute("data-show", "false");

    if(!searchField.value) errors += "<div>Search input is reqired.</div>";
    if(!locationField.value) errors += "<div>Location input is reqired.</div>";

    if(errors.length){
        showErrors(errors);
        return false;
    };

    return true;
};


function showErrors(errorsString){
    errorsContainer.setAttribute("data-show", "true");
    errorsContainer.innerHTML = errorsString;
};

function stopSearchFunc() {
    showStartSearch();
    chrome.runtime.sendMessage({ data : {stopRun : true} });
};

function runSearchFunc() {
    chrome.runtime.sendMessage({ data : {run : true, search : searchField.value.trim(), location : locationField.value.trim()} });
    showStopSearch();
};

function validateContent() {
    chrome.runtime.sendMessage({ data : {validate : true} });
};

function showStartSearch(){
    stopSearch.setAttribute("data-show", "false");
    submitSearchForm.setAttribute("data-show", "true");
};

function showStopSearch() {
    stopSearch.setAttribute("data-show", "true");
    submitSearchForm.setAttribute("data-show", "false");
};