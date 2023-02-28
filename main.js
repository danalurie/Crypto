/// <reference path="jquery-3.6.1.js" />
"use strict";

$(() => {

    let allCoins;
    let selectedCoins = loadFromStorage();

    //----------------------------move to currencies page---------------------------
    $("#currenciesLink").click(displayCoins);

    //---------------------hide-----------------------------------
    function hide() {
        $("#about").hide();
        $("#contentDiv").empty();
        $("#reports").empty();
        $("#dynamicHeader").empty();
        $("#spinner").css('display', "none");
        $("#spinner").hide();
    }
    //--------------------------------------get json---------------------------------
    async function getJson(url) {
        const response = await fetch(url);
        const json = await response.json();
        return json;
    }

    //-------------------------------------------------------------------------------
    async function handleCurrencies() {
        allCoins = await getJson("https://api.coingecko.com/api/v3/coins");
        displayCoins();
        limitCheckboxes();
        displayMarquee();
    }
    handleCurrencies();

    //--------------------------search coins by letter--------------------------------
    const arrOfCoinSymbols = [];

    $(".search-input").keyup(() => {
        event.preventDefault();
        const searchValue = $(".search-input").val();
        $(".card").hide();
        arrOfCoinSymbols.filter(symbol => symbol.toLowerCase().includes(searchValue.toLowerCase()))
            .forEach(symbol => {
                if (arrOfCoinSymbols.length > 0) {
                    $(`#${symbol}`).show();
                }
            });
    });
    //-----------------------------dynamic coin display---------------------------------
    function displayCoins() {
        hide();
        $(".searchArea").css("display", "block");
        $("#dynamicHeader").append("Currencies");
        let html = "";

        for (const coin of allCoins) {
            let checkedToggle = "";
            if (selectedCoins.indexOf(coin.symbol) !== -1) {
                checkedToggle = "checked";
                console.log(selectedCoins);
            }
            html += `
                    <div class="card" id="${coin.symbol}">
                        <label class="switch">
                            <input type="checkbox" ${checkedToggle} class="card-toggle">
                            <span class="slider round"></span>
                        </label>
                        <div>
                        <img src="${coin.image.small}" class="currencyImg">
                        </div>
                        <div id="coinSymbol">
                        ${coin.symbol}
                        </div>
                       
                        <div id="coinName">
                            ${coin.name}
                        </div>
    
                        <button class="btn btn-primary moreInfoBtn" data-bs-toggle="collapse" data-bs-target="#${coin.id}">
                            More Info
                        </button>
                        <div class="collapse" id="${coin.id}">
                            <div class="card-body" id="showInfo">
                                
                                ${coin.market_data.current_price.usd}$
                                <span> | </span>
                                ${coin.market_data.current_price.eur}€
                                <span> | </span>
                                ${coin.market_data.current_price.ils}₪
                            </div>
                        </div>
    
                    </div>
                `;
            arrOfCoinSymbols.push(coin.symbol);
        }

        $("#contentDiv").append(html);
    }

    //-------------------limit the user to selecting 5 coin-------------------------
    function limitCheckboxes() {
        $('input[type="checkbox"]').change(function () {
            let cardId = event.target.parentElement.parentElement.id;
            if (event.target.checked) {
                if (selectedCoins.length < 5) {
                    selectedCoins.push(cardId);
                    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins))
                }
                else {
                    event.target.checked = false;
                    coinsModal();
                }
            }
            else {
                let index = selectedCoins.indexOf(cardId);
                if (index !== -1) {
                    selectedCoins.splice(index, 1);
                    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins))
                }
            }
        });
    }

    //-------------------------------------coin modal-------------------------------
    function coinsModal() {
        $(".modal-body").empty();
        for (let i = 0; i < selectedCoins.length; i++) {
            $(".modal").modal("show");
            $(".modal-body").append(`<div class="selectedCardDiv">
                                        <div>
                                            <label class="switch">
                                                <input type="checkbox" checked class="card-toggle" id="${selectedCoins[i]}">
                                                <span class="slider round"></span>
                                            </label> 
                                        </div>
                                        <div>
                                            ${selectedCoins[i]}
                                        </div>
                                        <div class="selectedCardImg">
                                            <img src="assets/image/background-removed.png">
                                        </div>
                                     </div>`);
        }
    }

    //--------------------change toggle inside the modal---------------------
    $(".modal").on("change", "input", function () {
        const modalChangedCoin = $(this).attr("id")
        const indexOfChosen = selectedCoins.indexOf(modalChangedCoin)
        if (!event.target.checked) {
            selectedCoins.splice(indexOfChosen, 1);
        }
        else {
            for (const allCoins of arrOfCoinSymbols) {
                if (allCoins === event.target.id) {
                    selectedCoins.push(event.target.id);
                }
            }
        }
    });

    //-------------------------modal's save button---------------------------
    $("#saveButton").on("click", function () {
        $(".modal").modal("hide");
        $("#contentDiv").empty();
        handleCurrencies();
    });

    //---------------------------modal's X button-----------------------------
    $(".btn-close").on("click", () => {
        $(".modal").modal("hide");
        $("#contentDiv").show();
    })

    //---------preventing modal to close on clicking on the screen------------
    $('.modal').modal({
        backdrop: 'static',
        keyboard: false
    })

    //------------------------Load from local storage-------------------------
    function loadFromStorage() {
        const jsonString = JSON.parse(localStorage.getItem("selectedCoins"));
        if (jsonString !== null) {
            return jsonString;
        }
        else {
            return [];
        }
    }
    // -----------------handle reports api----------------------------------------
    async function handleReports() {
        const favorite = selectedCoins.join(",");
        console.log(favorite);
        const favorites = await getJson(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${favorite}&tsyms=USD`);
        reportsChar(favorites);
    }

    // --------------create a chart------------------------------------------
    

    // -------------------reports page---------------------
    $("#reportsLink").click(() => {
        hide();
        $(".searchArea").css("display", "none");
        $("#dynamicHeader").append("Reports");
        $("#reports").css("background-color", "lavender").append(
            `
                <p>
                <marquee 
                speed: 5000,
                gap: 50,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true,
                pauseOnHover: true>
                ${displayMarquee()}
                </marquee>
                </p>
                <div class="imageForReports">
                    <img src="assets/image/coinNotFoundBlackAndWhite.jpg">
                </div>
                `
        );
    });

    //------------------------------------------------------------------------------
    function displayMarquee() {
        let html = ""
        for (const coin of allCoins) {
            html += `${coin.symbol}: ${coin.market_data.current_price.usd}$, `
        }
        return html;
    }
    // -----------------------about my self and the project-------------------------

    $("#aboutLink").click(() => {
        hide();
        $(".searchArea").css("display", "none");
        $("#dynamicHeader").append("About");
        $("#about").show();
    });
});
