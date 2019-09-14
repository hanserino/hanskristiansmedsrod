var mediumPosts = {};
var historyData = {};
var agendaData = {};
var stravaData = {};

var funFacts = {
    earthDiameter_km: 12742,
    distanceToMoon_km: 384400,
    nordkappLindesnes_km: 2377,
    everestHeight_m: 8848
}

var today = new Date();
var year = today.getFullYear();

var endOfYear = new Date(year, 11, 31)
var oneDay = 1000 * 60 * 60 * 24
var remainingDays = Math.ceil((endOfYear.getTime() - today.getTime()) / (oneDay));

var historyTableEl = document.getElementById("history-table");
var historyTableBodyEl = document.getElementById("history-table-body");

var agendaTableEl = document.getElementById("agenda-table");
var agendaTableBodyEl = document.getElementById("agenda-table-body");

var isTouchDevice = function () {
    return (
        !!(typeof window !== 'undefined' &&
            ('ontouchstart' in window ||
                (window.DocumentTouch &&
                    typeof document !== 'undefined' &&
                    document instanceof window.DocumentTouch))) ||
        !!(typeof navigator !== 'undefined' &&
            (navigator.maxTouchPoints || navigator.msMaxTouchPoints))
    );
};

function descriptionListHelper(dt, dd) {
    if (dt && dt) {
        return `<dt>${dt}:</dt><dd>${dd}</dd>`;
    } else {
        return empty;
    }
}

function kilometerFormatter(metersInt, prettyfied) {
    //Takes meters, converts it to kilometers, rounds the number
    //and makes it look good
    var kilometers = metersInt / 1000;
    var roundedKilometers = Math.round(kilometers * 10) / 10;

    if (prettyfied) {
        return roundedKilometers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    }
    else {
        return roundedKilometers;
    }
}

function init() {
    fetch('./data/history.json').then(function (response) {
        return response.json().then(function (data) {
            historyData = data.reverse();
            historyTableEl.dataset.fetchSuccess = true;

            for (var i = 0; i < historyData.length; i++) {
                historyTableBodyEl.innerHTML += `
                    <tr>
                        <td>${historyData[i].date}</td>
                        <td>${historyData[i].description}</td>
                        <td>${historyData[i].category}</td>
                    </tr>
                `;
            }
        });
    }).catch(error => {
        console.log(error);;
    });

    fetch('./data/agenda.json').then(function (response) {
        return response.json().then(function (data) {
            agendaData = data;
            agendaTableEl.dataset.fetchSuccess = true;

            var descriptionEl = "";

            for (var i = 0; i < agendaData.length; i++) {
                if (agendaData[i].url) {
                    descriptionEl = `<td><a href="${agendaData[i].url}">${agendaData[i].description}</a></td>`;
                } else {
                    descriptionEl = `<td>${agendaData[i].description}</td>`;
                }
                agendaTableBodyEl.innerHTML += `
                    <tr>
                        <td>${agendaData[i].date}</td>
                        ${descriptionEl}
                        <td>${agendaData[i].category}</td>
                    </tr>
                `;
            }
        });
    }).catch(error => {
        console.log(error);
    });
    

var mediumPostsEl = document.getElementById('medium-posts-container');
var mediumPostsTitleEl = document.getElementById('medium-posts-title');
var mediumPostListContainerEl = document.getElementById('medium-post-list-container');

fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@hanserino')
   .then((res) => res.json())
   .then((data) => {
        mediumPostsEl.dataset.fetchSuccess = true;
        mediumPostsTitleEl.innerHTML = "Skriverier";

      // Filter for acctual posts. Comments don't have categories, therefore can filter for items with categories bigger than 0
      const res = data.items //This is an array with the content. No feed, no info about author etc..
      const posts = res.filter(item => item.categories.length > 0) // That's the main trick* !

      // Functions to create a short text out of whole blog's content
      function toText(node) {
         let tag = document.createElement('div')
         tag.innerHTML = node
         node = tag.innerText
         return node
      }
      function shortenText(text,startingPoint ,maxLength) {
         return text.length > maxLength?
         text.slice(startingPoint, maxLength):
         text
      }

      // Put things in right spots of markup
      let output = '';
      posts.forEach((item) => {
            console.log(item)
            let publishedDate = moment(shortenText(item.pubDate,0 ,10)).locale('nb').format('Do MMMM YYYY');
            console.log(publishedDate);
            output += `
            <li>
                <a href="${item.link}">
                <div>
                        <span class="medium-article-date">${publishedDate}</span>
                        <img class="medium-article-thumb" src="${item.thumbnail}" alt="">
                    </div>
                    <div>
                        <h3 class="medium-article-title">${item.title}</h3>
                        <p class="medium-article-subtitle">${shortenText(toText(item.content),0, 300)+ '...'}</p>
                    </div>
                <a/>
            </li>`
      })
      mediumPostListContainerEl.innerHTML = output
})
    var touchClass = isTouchDevice() ? "touch" : "no-touch";
    document.body.classList.add(touchClass);
}

window.onload = function () {
    init();
    document.body.classList.add("loaded");
}
