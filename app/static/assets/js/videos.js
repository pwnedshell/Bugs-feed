if (localStorage.getItem("channels") == null) {
    localStorage.setItem("channels", JSON.stringify([]));
}
if (localStorage.getItem("saved_channels") == null) {
    localStorage.setItem("saved_channels", JSON.stringify([]));
}

$("#sp-channels").selectpicker("val", JSON.parse(localStorage.getItem("channels")));
$("#sp-saved-channels").selectpicker("val", JSON.parse(localStorage.getItem("saved_channels")));

var channels = $("#sp-channels").val();
$("#sp-channels").on("changed.bs.select", function() {
    channels = $("#sp-channels").val();
    localStorage.setItem("channels", JSON.stringify(channels));
    insert_videos(false, true);
});

var saved_channels = $("#sp-saved-channels").val();
$("#sp-saved-channels").on("changed.bs.select", function() {
    saved_channels = $("#sp-saved-channels").val();
    localStorage.setItem("saved_channels", JSON.stringify(saved_channels));
    insert_videos(true, true);
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/


var videos_counter = 0;
var saved_videos_counter = 0;

function show_image(image) {
    $("#insert-image").attr("src", image);
    $("#image-modal").modal("show");
}

function get_videos_card(obj, safe) {
    var template = `<div class="col-12 card m-3 px-0 videos" name="[_id]">
            <div class="row g-0">
                <div class="col-3" style="background-color: black; border-radius: 5px;">
                    <iframe width="100" srcdoc="<style>*{padding:0;margin:0;overflow:hidden}html,body{height:100%}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{height:1.5em;text-align:center;font:48px/1.5 sans-serif;color:white;text-shadow:0 0 0.5em black}p{position:absolute;bottom:5px;right:5px;color:white;font-family:montserrat;font-size:12px;background:black;padding:2.2px;border-radius:5px;}</style><a href=https://www.youtube.com/embed/[video_id]?autoplay=1><img src='https://i.ytimg.com/vi/[video_id]/hqdefault.jpg'><span>▶</span><p>[duration]</p></a>"
                        height="150" showinfo=0 src="https://www.youtube.com/embed/[video_id]" frameborder="0" allowfullscreen></iframe>
                </div>
                <div class="col px-3 pt-3 pb-2">
                    <h6>[name]</h6>
                    <a href="https://www.youtube.com/channel/[channel]" target="_blank" rel="noopener noreferrer" class="card-subtitle mb-2 web">[username]</a>
                    <div class="mt-4">
                        <svg video-id="[id]" viewBox="0 0 24 24" width="24" height="24" class="thumbs-up float-end" fill="[filled_color]" preserveAspectRatio="xMidYMid meet" focusable="false"><g class="style-scope yt-icon"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" class="style-scope yt-icon"></path></g></svg>
                        <small class="float-start mt-2 text-muted">[date]</small>
                    </div>
                </div>
            </div>
        </div>`;

    var _id = obj._id.$oid;
    template = template.split("[id]").join(_id);
    if (safe) {
        _id = "saved_" + _id;
    }
    template = template.split("[_id]").join(_id);
    template = template.split("[name]").join(obj.name);
    template = template.split("[username]").join(obj.username);
    template = template.split("[channel]").join(obj.channel);
    template = template.split("[video_id]").join(obj.video_id);
    template = template.split("[duration]").join(obj.duration);
    d = new Date(obj.date["$date"]);
    var datestring = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    template = template.split("[date]").join(datestring);
    if (obj.saved) {
        template = template.split("[filled_color]").join("var(--blue)");
    } else {
        template = template.split("[filled_color]").join("var(--dark-grey)");
    }
    return $(template);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function get_videos(safe) {
    var _channels, url, counter;
    if (safe) {
        _channels = saved_channels;
        url = "/api/feeds/media/videos/saved/load?c=";
        counter = saved_videos_counter;
    } else {
        _channels = channels;
        url = "/api/feeds/media/videos/load?c=";
        counter = videos_counter;
    }
    var query = url + counter;
    if (_channels == undefined || _channels == []) {
        return $.get(query);
    }
    for (i in _channels) {
        query = query + "&" + "channels=" + encodeURIComponent(_channels[i]);
    }
    return $.get(query);
}

function insert_videos(safe, destroy) {
    if (destroy) {
        if (safe) {
            $("#insert_saved_videos").empty();
            saved_videos_counter = 0;
        } else {
            $("#insert_videos").empty();
            videos_counter = 0;
        }
    }
    var jquery_selector;
    if (safe) {
        jquery_selector = "#insert_saved_videos";
    } else {
        jquery_selector = "#insert_videos";
    }
    get_videos(safe).done(function(data) {
        if (data.hasOwnProperty("insert")) {
            return;
        }
        var delay = 0;
        $.each(JSON.parse(data), function(index, obj) {
            var card = get_videos_card(obj, safe);
            card.slideToggle();
            $(jquery_selector).append(card);
            card.delay(delay).slideToggle(500);
            delay += 120;
            if (safe) {
                saved_videos_counter += 1;
            } else {
                videos_counter += 1;
            }
        });
    });
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("#videos_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/media/videos/refresh").done(function(data) {
        videos_counter = 0;
        $("#videos_button").html("Refresh");
        $("#videos_button").prop("disabled", false);
        insert_videos(false, true);
        update_todays_chart();
    });
});

$("body").on("click", ".thumbs-up", function(e) {
    e.preventDefault();
    id_to_update = $(this).attr("video-id");
    jquery_selector = "svg[video-id='" + id_to_update + "']";
    safe = $(this).attr("fill") == "var(--dark-grey)";
    $.ajax({
        type: "PUT",
        url: "/api/feeds/media/videos/safe",
        data: JSON.stringify({ "id": id_to_update, "safe": safe }),
        success: function(data) {
            if (data) {
                $(jquery_selector).each(function() {
                    $(this).attr("fill", "var(--blue)")
                });
                insert_videos(true, true);
            } else {
                $(jquery_selector).each(function() {
                    $(this).attr("fill", "var(--dark-grey)")
                });
                $("div[name='saved_" + id_to_update + "']").remove();
            }
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});