var mediumPosts = {};
var historyData = {};
var agendaData = {};

var historyTableEl = document.getElementById("history-table");
var historyTableBodyEl = document.getElementById("history-table-body");

var agendaTableEl = document.getElementById("agenda-table");
var agendaTableBodyEl = document.getElementById("agenda-table-body");

var mediumPostsEl = document.getElementById('medium-posts-container');
var mediumPostsTitleEl = document.getElementById('medium-posts-title');
var mediumPostListContainerEl = document.getElementById('medium-post-list-container');

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
