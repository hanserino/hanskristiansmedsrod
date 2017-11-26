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
var oneDay = 1000*60*60*24
var remainingDays = Math.ceil((endOfYear.getTime()-today.getTime())/(oneDay));

var historyTableEl = document.getElementById("history-table");
var historyTableBodyEl = document.getElementById("history-table-body");

var agendaTableEl = document.getElementById("agenda-table");
var agendaTableBodyEl = document.getElementById("agenda-table-body");

var mediumPostsEl = document.getElementById('medium-posts-container');
var mediumPostsTitleEl = document.getElementById('medium-posts-title');
var mediumPostListContainerEl = document.getElementById('medium-post-list-container');

var stravaStatsEl = document.getElementById('strava-stats');
var stravaStatsTitleEl = document.getElementById('strava-stats-title');
var stravaTextEl = document.getElementById('strava-text');

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

    fetch('https://www.strava.com/api/v3/athletes/10448277/stats/?access_token=004c1253768c9e83f4ed64f2bad715436c35d1fb').then(function (response) {
        return response.json().then(function (data) {
            if (data.ytd_run_totals) {

                stravaData = data.ytd_run_totals;
                console.log(stravaData);

                stravaStatsEl.dataset.fetchSuccess = true;
                stravaStatsTitleEl.innerHTML = `Løpe-stats fra Strava`;

                //Distance - meters
                if (stravaData.distance) {
                    var formattedDistance = kilometerFormatter(stravaData.distance, true);
                    var earthComparison = Math.round(funFacts.earthDiameter_km / kilometerFormatter(stravaData.distance, false) * 10) / 10;

                    stravaTextEl.innerHTML += `
                    <p>
                        Hittil i ${year} har jeg løpt <em>${formattedDistance} <abbr title="kilometer">km</abbr></em>, noe somilsvarer å ha løpt jorda rundt <em>${earthComparison}</em> ganger.
                    </p>
                    `;
                }

                //Moving time - hours
                //Elevation gain - meters
                if (stravaData.moving_time && stravaData.elevation_gain) {
                    var formattedTime = Math.floor(stravaData.moving_time / 3600);
                    var everestComparison = Math.round(stravaData.elevation_gain / funFacts.everestHeight_m * 10) / 10;

                    stravaTextEl.innerHTML += `
                    <p>
                       Dette har jeg brukt <em>${formattedTime} timer</em> på. 
                       Det er kanskje ikke kjempeimponerende, men det er tross alt fordelt på <em>${stravaData.elevation_gain} akkumulerte høydemetere</em>. 
                       Det vil si at jeg har besteget <em>Mount Everest ${everestComparison} ganger</em> fra havnivå på denne strekningen.
                    </p>
                    <p>
                        Det er fortsatt ${remainingDays} dager igjen av året, så det er fortsatt god tid til å pynte på årets statistikk.
                    </p>
                    `;
                }

            }
            else{
                console.log('no running stats');
            }

        });
    }).catch(error => {
        console.log(error);
        stravaStatsEl.innerHTML = "";
    });

    fetch("https://exec.clay.run/nicoslepicos/medium-get-user-posts-new?profile=hanserino", {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        return response.json().then(function (data) {
            mediumPosts.data = data;

            mediumPostsEl.dataset.fetchSuccess = true;

            for (var key in mediumPosts.data.posts) {
                if (mediumPosts.data.posts.hasOwnProperty(key)) {
                    var postPath = mediumPosts.data.posts[key];

                    var titleEl = "",
                        subTitleEl = "",
                        publishedDateEl = "",
                        thumbEl = "";

                    var publishedDate = moment(postPath.firstPublishedAt).locale('nb').format('Do MMMM YYYY');

                    if (postPath.title) {
                        titleEl = `<h3 class="medium-article-title">${postPath.title}</h3>`;
                    }
                    if (postPath.content.subtitle) {
                        subTitleEl = `<p class="medium-article-subtitle">${postPath.content.subtitle}</p>`;
                    }
                    if (postPath.virtuals.previewImage.imageId) {
                        thumbEl = `<img class="medium-article-thumb" src="https://cdn-images-1.medium.com/fit/t/200/200/${postPath.virtuals.previewImage.imageId}">`;
                    }
                    if (publishedDate) {
                        publishedDateEl = `<span class="medium-article-date">${publishedDate}</span>`;
                    }

                    mediumPostsTitleEl.innerHTML = "Siste fra Medium";
                    mediumPostListContainerEl.innerHTML += `
                        <li>
                            <a href="https://medium.com/@hanserino/${postPath.uniqueSlug}">
                                <div>
                                    ${publishedDateEl}
                                    ${thumbEl}
                                </div>
                                <div>
                                    ${titleEl}
                                    ${subTitleEl}
                                </div>
                            </a>
                        </li>
                    `;
                }
            }

        });
    }).catch(error => {
        console.log(error);
    });

    var touchClass = isTouchDevice() ? "touch" : "no-touch";
    document.body.classList.add(touchClass);
}

window.onload = function () {
    init();
    document.body.classList.add("loaded");
}
