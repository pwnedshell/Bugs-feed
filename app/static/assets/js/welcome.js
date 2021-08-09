var saved_chart = undefined;
var todays_chart = undefined;

function update_saved_chart() {
    $.ajax({
        url: "/api/feeds/metrics/saved",
        method: "GET",
        success: function(d) {
            if (saved_chart != undefined) {
                saved_chart.destroy();
            }
            var data = {
                labels: ["News", "Videos", "Hackerone", "Bugcrowd", "Exploit-db", "CVE", "Exploitdb papers", "NIST", "Oxford"],
                datasets: [{
                    label: "Saved feeds",
                    data: [d.news, d.videos, d.hackerone, d.bugcrowd, d.exploitdb, d.cve, d.exploitdbsp, d.nist, d.oxford],
                    backgroundColor: ["steelblue", "mediumaquamarine", "darkslategray", "darkorange", "lightslategray", "mediumvioletred", "darkred", "darkorchid", "khaki"]
                }, ]
            };
            var saved_config = {
                type: "bar",
                data: data,
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: "Saved feeds"
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            grid: {
                                display: false
                            }
                        },
                    },
                    ticks: {
                        precision: 0
                    }
                }
            };
            saved_chart = new Chart(document.getElementById("saved_chart").getContext("2d"), saved_config);
        },
        dataType: "json"
    });
}

function update_todays_chart() {
    $.ajax({
        url: "/api/feeds/metrics/todays",
        method: "GET",
        success: function(d) {
            if (todays_chart != undefined) {
                todays_chart.destroy();
            }
            var todays_data = {
                labels: ["News", "Videos", "Hackerone", "Bugcrowd", "Exploit-db", "CVE", "Exploitdb papers", "NIST", "Oxford"],
                datasets: [{
                    label: "Today's menu",
                    data: [d.news.length, d.videos.length, d.hackerone.length, d.bugcrowd.length, d.exploitdb.length, d.cve.length, d.exploitdbsp.length, d.nist.length, d.oxford.length],
                    backgroundColor: ["steelblue", "mediumaquamarine", "darkslategray", "darkorange", "lightslategray", "mediumvioletred", "darkred", "darkorchid", "khaki"]
                }]
            };
            var todays_config = {
                type: "doughnut",
                data: todays_data,
                options: {
                    plugins: {
                        legend: {
                            position: "top"
                        },
                        title: {
                            display: true,
                            text: "Last 24 hours"
                        }
                    }
                },
            };
            todays_chart = new Chart(document.getElementById("todays_chart").getContext("2d"), todays_config);
        },
        dataType: "json"
    });
}



//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

Number.prototype.pad = function(n) {
    for (var r = this.toString(); r.length < n; r = 0 + r);
    return r;
};

function updateClock() {
    var now = new Date();
    var milli = now.getMilliseconds(),
        sec = now.getSeconds(),
        min = now.getMinutes(),
        hou = now.getHours(),
        mo = now.getMonth(),
        dy = now.getDate(),
        yr = now.getFullYear();
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var tags = ["mon", "d", "y", "h", "m", "s"],
        corr = [months[mo], dy, yr, hou.pad(2), min.pad(2), sec.pad(2)];
    for (var i = 0; i < tags.length; i++)
        document.getElementById(tags[i]).firstChild.nodeValue = corr[i];
}
updateClock();
window.setInterval("updateClock()", 1);