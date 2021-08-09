if (localStorage.getItem("hashtags") == null) {
    localStorage.setItem("hashtags", JSON.stringify([]));
}
if (localStorage.getItem("saved_hashtags") == null) {
    localStorage.setItem("saved_hashtags", JSON.stringify([]));
}

$("#sp-hashtags").selectpicker("val", JSON.parse(localStorage.getItem("hashtags")));
$("#sp-saved-hashtags").selectpicker("val", JSON.parse(localStorage.getItem("saved_hashtags")));

var hashtags = $("#sp-hashtags").val();
$("#sp-hashtags").on("changed.bs.select", function() {
    hashtags = $("#sp-hashtags").val();
    localStorage.setItem("hashtags", JSON.stringify(hashtags));
    insert_tweets(false, true);
});

var saved_hashtags = $("#sp-saved-hashtags").val();
$("#sp-saved-hashtags").on("changed.bs.select", function() {
    saved_hashtags = $("#sp-saved-hashtags").val();
    localStorage.setItem("saved_hashtags", JSON.stringify(saved_hashtags));
    insert_tweets(true, true);
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var tweets_counter = 0;
var saved_tweets_counter = 0;

function get_tweets_card(obj, ids, safe) {
    var template = `<div class="col" name="[_id]" style="width: 570px;">
            <div class="p-4 pb-5 m-3 tweet-card">
              <a href="https://twitter.com/[user]" target="_blank" rel="noopener noreferrer">
                <img style="background-color: [color]; padding: 5px" src="/static/assets/img/lego/[lego]"width="38" class="d-inline me-2 rounded-circle">
              </a>
              <a href="https://twitter.com/[user]" target="_blank" rel="noopener noreferrer" class="font-weight-bold d-inline align-top">@[user]</a>
              <a href="https://twitter.com/hashtag/[hashtag]" target="_blank" rel="noopener noreferrer"><small class="d-inline align-top float-end">[hashtag]</small></a>
              <p class="text-start mt-3">[tweet]</p>
              <div>[photos]</div>
              <div class="float-end">
                <a href="[link]" target="__blank" rel="noopener noreferrer" class="me-1" style="color: inherit">
                  <svg
                       width="24"
                       height="24"
                       viewBox="0 0 24 24"
                       fill="none"
                       xmlns="http://www.w3.org/2000/svg"
                       >
                    <path
                          d="M15.6396 7.02527H12.0181V5.02527H19.0181V12.0253H17.0181V8.47528L12.1042 13.3892L10.6899 11.975L15.6396 7.02527Z"
                          fill="var(--muted_text)"
                          />
                    <path
                          d="M10.9819 6.97473H4.98193V18.9747H16.9819V12.9747H14.9819V16.9747H6.98193V8.97473H10.9819V6.97473Z"
                          fill="var(--muted_text)"
                          />
                  </svg>
                </a>
                <svg name="[id]" class="heart" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="[fill-rule]" clip-rule="evenodd"
                        d="M12.0122 5.57169L10.9252 4.48469C8.77734 2.33681 5.29493 2.33681 3.14705 4.48469C0.999162 6.63258 0.999162 10.115 3.14705 12.2629L11.9859 21.1017L11.9877 21.0999L12.014 21.1262L20.8528 12.2874C23.0007 10.1395 23.0007 6.65711 20.8528 4.50923C18.705 2.36134 15.2226 2.36134 13.0747 4.50923L12.0122 5.57169ZM11.9877 18.2715L16.9239 13.3352L18.3747 11.9342L18.3762 11.9356L19.4386 10.8732C20.8055 9.50635 20.8055 7.29028 19.4386 5.92344C18.0718 4.55661 15.8557 4.55661 14.4889 5.92344L12.0133 8.39904L12.006 8.3918L12.005 8.39287L9.51101 5.89891C8.14417 4.53207 5.92809 4.53207 4.56126 5.89891C3.19442 7.26574 3.19442 9.48182 4.56126 10.8487L7.10068 13.3881L7.10248 13.3863L11.9877 18.2715Z"
                        fill="[fill]" />
                </svg>
              </div>
              <small class="float-start mt-2 text-muted">[date]
              </small>
            </div>
          </div>`;
    var tweet = obj.tweet;
    try {
        var expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        var domain = new URL(tweet.match(new RegExp(expression))[0]).hostname;
        tweet = tweet.replace(new RegExp(expression), "<a class='hashtag' title='" + tweet.match(new RegExp(expression))[0] + "' href='" + tweet.match(new RegExp(expression))[0] + "' target='_blank' rel='noopener noreferrer'>" + domain + "</a>");
    } catch (error) {};

    tweet = tweet.split("<br>").join("\n");
    tweet = tweet.replace(/(^|\s)(#[a-z\d_]+)/ig, "");
    tweet = tweet.replace(/(^|\s)(@[a-z\d_]+)/ig, "$1<a href='https://twitter.com/$2' target='_blank' rel='noopener noreferrer' class='hashtag'>$2</a>");
    tweet = tweet.split("https://twitter.com/@").join("https://twitter.com/");

    template = template.split("[tweet]").join(tweet);
    template = template.split("[user]").join(obj.user);
    template = template.split("[link]").join(obj.link);
    template = template.split("[hashtag]").join(obj.hashtag.substring(1));
    template = template.split("[color]").join(obj.color);
    template = template.split("[lego]").join(obj.lego);

    var id = obj.link.match(/.*\/(.*)\/(.*)$/)[2];
    if (typeof obj.photos !== "undefined" && obj.photos.length > 0) {
        photo_template = "<div class='row justify-content-center my-2' id='" + id + "'>";
        for (i in obj.photos) {
            photo_template = photo_template + "<a class='col tweet-img-col m-1' href='" + obj.photos[i] + "'><img src='" + obj.photos[i] + "' /></a>";
        }
        photo_template = photo_template + "</div>";
        template = template.split("[photos]").join(photo_template);
        ids.push(id);
    } else {
        template = template.split("[photos]").join("");
    }
    var _id = obj._id.$oid;
    template = template.split("[id]").join(_id);
    if (safe) {
        _id = "saved_" + _id;
    }
    template = template.split("[_id]").join(_id);
    var d = new Date(obj.date["$date"]);
    var datestring = d.getHours() + ":" + d.getMinutes() + " &nbsp; " + monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    template = template.split("[date]").join(datestring);
    if (obj.saved == true) {
        template = template.split("[fill-rule]").join("none");
        template = template.split("[fill]").join("var(--red)");
    } else {
        template = template.split("[fill-rule]").join("evenodd");
        template = template.split("[fill]").join("var(--muted_text)");
    }
    return $(template);
}

function show_image(image) {
    $("#insert-image").attr("src", image);
    $("#image-modal").modal("show");
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function get_tweets(safe) {
    var _hashtags, url, counter;
    if (safe) {
        _hashtags = saved_hashtags;
        url = "/api/feeds/media/tweets/saved/load?c=";
        counter = saved_tweets_counter;
    } else {
        _hashtags = hashtags;
        url = "/api/feeds/media/tweets/load?c=";
        counter = tweets_counter;
    }
    var query = url + counter;
    if (_hashtags == undefined || _hashtags == []) {
        return $.get(query);
    }
    for (i in _hashtags) {
        query = query + "&" + "hashtags=" + encodeURIComponent(_hashtags[i]);
    }
    return $.get(query);
}

function insert_tweets(safe, destroy) {
    if (destroy) {
        if (safe) {
            $("#insert_saved_tweets").empty();
            saved_tweets_counter = 0;
        } else {
            $("#insert_tweets").empty();
            tweets_counter = 0;
        }
    }
    var jquery_selector;
    if (safe) {
        jquery_selector = "#insert_saved_tweets";
    } else {
        jquery_selector = "#insert_tweets";
    }
    get_tweets(safe).done(function(data) {
        if (data.hasOwnProperty("insert")) {
            return;
        }
        var delay = 0;
        var ids = [];
        $.each(JSON.parse(data), function(index, obj) {
            var card = get_tweets_card(obj, ids, safe);
            card.slideToggle();
            $(jquery_selector).append(card);
            card.delay(delay).slideToggle(500);
            for (var i = 0; i < ids.length; i++) {
                $("#" + ids[i]).lightGallery({});
            }
            delay += 120;
            if (safe) {
                saved_tweets_counter += 1;
            } else {
                tweets_counter += 1;
            }
        });
    });
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("#tweets_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/media/tweets/refresh").done(function(data) {
        tweets_counter = 0;
        $("#tweets_button").html("Refresh");
        $("#tweets_button").prop("disabled", false);
        insert_tweets(false, true);
        update_todays_chart();
    });
});

$("body").on("click", ".heart", function(e) {
    e.preventDefault();
    var path = $(this).children("path");

    var tweet_to_update = $(this).closest("svg").attr("name");
    var jquery_selector = 'svg[name="' + tweet_to_update + '"]';
    var safe = path.attr("fill-rule") != "none";

    $.ajax({
        type: "PUT",
        url: "/api/feeds/media/tweets/safe",
        data: JSON.stringify({ "id": tweet_to_update, "safe": safe }),
        success: function(data) {
            if (data) {
                $(jquery_selector).each(function() {
                    $(this).children("path").attr("fill-rule", "none");
                    $(this).children("path").attr("fill", "var(--red)");
                });
                insert_tweets(true, true);
            } else {
                $(jquery_selector).each(function() {
                    $(this).children("path").attr("fill-rule", "evenodd");
                    $(this).children("path").attr("fill", "var(--muted_text)");
                });
                $("div[name='saved_" + tweet_to_update + "']").remove();
            }
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});