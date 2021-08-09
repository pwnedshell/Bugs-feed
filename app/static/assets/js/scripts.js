$(document).ready(function() {

    $(document).endlessScroll({
        fireDelay: 1000,
        bottomPixels: 1500,
        callback: function() {
            var safe_mode = $("#saved_button").hasClass("saved_active");
            if ($("#news_tab").hasClass("active")) {
                insert_news(safe_mode, false);
            } else if ($("#videos_tab").hasClass("active")) {
                insert_videos(safe_mode, false);
            } else if ($("#tweets_tab").hasClass("active")) {
                insert_tweets(safe_mode, false);
            }
        }
    });

    window.onscroll = function() {
        if (document.body.scrollTop > 1500 || document.documentElement.scrollTop > 1500) {
            $(".fabrx-back-top").show("slow");
        } else {
            $(".fabrx-back-top").hide("slow");
        }
    }

    //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/


    $(".moon").click(function(e) {
        e.preventDefault();
        $("body").toggleClass("light dark");
        if ($("body").hasClass("light")) {
            $(".align-icon").attr("style", "");
            localStorage.setItem("theme", "light");
            Chart.defaults.color = "#666";
            update_todays_chart();
            update_saved_chart();
        } else {
            $(".align-icon").attr("style", "filter: invert(1)");
            localStorage.setItem("theme", "dark");
            Chart.defaults.color = "#EFEFEF";
            update_todays_chart();
            update_saved_chart();
        }
    });

    const theme = localStorage.getItem("theme");

    if (theme) {
        $("body").removeClass("dark");
        $("body").removeClass("light");
        $("body").addClass(theme);
        if (theme == "dark") {
            Chart.defaults.color = "#EFEFEF";
            $(".align-icon").attr("style", "filter: invert(1)");
        }
    }

    //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

    var saved_splide = new Splide("#saved_splide", {
        arrows: false,
        pagination: false,
        drag: false
    }).mount();

    $("#saved_button").on("click", function() {
        if (saved_splide.index == 0) {
            saved_splide.go("+1");
        } else {
            saved_splide.go("-1");
        }
        $(this).toggleClass("saved_active");
        if (localStorage.getItem("saved_tab") == "true") {
            localStorage.setItem("saved_tab", "false");
        } else {
            localStorage.setItem("saved_tab", "true");
        }
    });

    //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

    $("#welcome_tab").on("click", function() {
        localStorage.setItem("tab", "welcome_tab");
    });

    $("#media_tab").on("click", function() {
        if (!$("#saved_media").hasClass("show active")) {
            $("#saved_media").toggleClass("show active");
        }
        if ($("#saved_vulnerabilities").hasClass("show active")) {
            $("#saved_vulnerabilities").toggleClass("show active");
        }
        if ($("#saved_papers").hasClass("show active")) {
            $("#saved_papers").toggleClass("show active");
        }
        localStorage.setItem("tab", "media_tab");
    });

    $("#vulnerabilities_tab").on("click", function() {
        if (!$("#saved_vulnerabilities").hasClass("show active")) {
            $("#saved_vulnerabilities").toggleClass("show active");
        }
        if ($("#saved_media").hasClass("show active")) {
            $("#saved_media").toggleClass("show active");
        }
        if ($("#saved_papers").hasClass("show active")) {
            $("#saved_papers").toggleClass("show active");
        }
        localStorage.setItem("tab", "vulnerabilities_tab");
    });

    $("#papers_tab").on("click", function() {
        if (!$("#saved_papers").hasClass("show active")) {
            $("#saved_papers").toggleClass("show active");
        }
        if ($("#saved_media").hasClass("show active")) {
            $("#saved_media").toggleClass("show active");
        }
        if ($("#saved_vulnerabilities").hasClass("show active")) {
            $("#saved_vulnerabilities").toggleClass("show active");
        }
        localStorage.setItem("tab", "papers_tab");
    });

    $(".subtab-button").on("click", function() {
        var id = $(this).attr("id");
        if (id.startsWith("saved_")) {
            if (!$("#" + id.substr(6, )).hasClass("active")) {
                $("#" + id.substr(6, ))[0].click();
            }
            localStorage.setItem("sub_tab", id.substr(6, ));
            localStorage.setItem("sub_saved_tab", id);
        } else {
            if ($(this).hasClass("content-media")) {
                $(".saved-media").each(function() {
                    $("#" + $(this).attr("id")).removeClass("active");
                });
            } else if ($(this).hasClass("content-vulnerabilities")) {
                $(".saved-vulnerabilities").each(function() {
                    $("#" + $(this).attr("id")).removeClass("active");
                });
            } else if ($(this).hasClass("content-papers")) {
                $(".saved-papers").each(function() {
                    $("#" + $(this).attr("id")).removeClass("active");
                });
            }
            $("#saved_" + id)[0].click();
            localStorage.setItem("sub_tab", id);
            localStorage.setItem("sub_saved_tab", "saved_" + id);
        }
    });

    if (localStorage.getItem("tab") == null) {
        localStorage.setItem("tab", "welcome_tab");
    }

    $("#" + localStorage.getItem("tab"))[0].click();
    if (localStorage.getItem("sub_tab") != null) {
        $("#" + localStorage.getItem("sub_tab"))[0].click();
    }
    if (localStorage.getItem("sub_saved_tab") != null) {
        $("#" + localStorage.getItem("sub_saved_tab"))[0].click();
    }
    if (localStorage.getItem("saved_tab") == "true") {
        $("#saved_button")[0].click();
        localStorage.setItem("saved_tab", "true");
    }

    //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

    $(".fabrx-back-top").click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, 500);
        setTimeout(function() { $(".fabrx-back-top").hide("slow"); }, 500);
    });

    //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

    show_hackerone("#hackerone_table", "/api/feeds/vulnerabilities/hackerone");
    show_hackerone("#saved_hackerone_table", "/api/feeds/vulnerabilities/hackerone/saved");
    show_bugcrowd("#bugcrowd_table", "/api/feeds/vulnerabilities/bugcrowd");
    show_bugcrowd("#saved_bugcrowd_table", "/api/feeds/vulnerabilities/bugcrowd/saved");
    show_exploitdb("#exploitdb_table", "/api/feeds/vulnerabilities/exploitdb");
    show_exploitdb("#saved_exploitdb_table", "/api/feeds/vulnerabilities/exploitdb/saved");
    show_cve("#cve_table", "/api/feeds/vulnerabilities/cve");
    show_cve("#saved_cve_table", "/api/feeds/vulnerabilities/cve/saved");
    show_exploitdbsp("#exploitdbsp_table", "/api/feeds/papers/exploitdbsp");
    show_exploitdbsp("#saved_exploitdbsp_table", "/api/feeds/papers/exploitdbsp/saved");
    show_nist("#nist_table", "/api/feeds/papers/nist");
    show_nist("#saved_nist_table", "/api/feeds/papers/nist/saved");
    show_oxford("#oxford_table", "/api/feeds/papers/oxford");
    show_oxford("#saved_oxford_table", "/api/feeds/papers/oxford/saved");
    insert_news(false, false);
    insert_news(true, false);
    insert_videos(false, false);
    insert_videos(true, false);
    insert_tweets(false, false);
    insert_tweets(true, false);
    update_saved_chart();
    update_todays_chart();
});