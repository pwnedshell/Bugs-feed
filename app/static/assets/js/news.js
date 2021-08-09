if (localStorage.getItem("webs") == null) {
    localStorage.setItem("webs", JSON.stringify([]));
}
if (localStorage.getItem("saved_webs") == null) {
    localStorage.setItem("saved_webs", JSON.stringify([]));
}

$("#sp-webs").selectpicker("val", JSON.parse(localStorage.getItem("webs")));
$("#sp-saved-webs").selectpicker("val", JSON.parse(localStorage.getItem("saved_webs")));

var webs = $("#sp-webs").val();
$("#sp-webs").on("changed.bs.select", function() {
    webs = $("#sp-webs").val();
    localStorage.setItem("webs", JSON.stringify(webs));
    insert_news(false, true);
});

var saved_webs = $("#sp-saved-webs").val();
$("#sp-saved-webs").on("changed.bs.select", function() {
    saved_webs = $("#sp-saved-webs").val();
    localStorage.setItem("saved_webs", JSON.stringify(saved_webs));
    insert_news(true, true);
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var news_counter = 0;
var saved_news_counter = 0;

function get_news_card(obj, safe) {
    var template = `<div class="col" name="[_id]">
    <a new-id="[id]" href="[link]" target="_blank" rel="noopener noreferrer" class="card">
        <div class="card-head text-center" style="background-color: [color];">
            <img src="/static/assets/img/lego/[lego]" class="card-img-top" width="5">
        </div>
        <div class="card-body">
            <h5 class="card-title">[name]</h5>
            <p class="card-subtitle mb-2 web">[web]</p>
            <p class="card-text">[description]...</p>
            <div class="float-end">
                <div class="form-check form-check-rounded form-check-lg radio-has-check me-2">
                    <input name="[id]" type="checkbox" class="safe_check form-check-input" [check]>
                </div>
            </div>
            <small class="float-start mt-2 text-muted">[date]</small>
        </div>
    </a>
</div>`;
    var _id = obj._id.$oid;
    template = template.split("[id]").join(_id);
    if (safe) {
        _id = "saved_" + _id;
    }
    template = template.split("[_id]").join(_id);
    template = template.split("[name]").join(obj.name);
    template = template.split("[description]").join(obj.description);
    template = template.split("[web]").join(obj.web);
    template = template.split("[link]").join(obj.link);
    template = template.split("[lego]").join(obj.lego);
    template = template.split("[color]").join(obj.color);

    var d = new Date(obj.date["$date"]);
    var datestring = monthNames[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
    template = template.split("[date]").join(datestring);

    if (obj.saved == true) {
        template = template.split("[check]").join('checked');
    }


    return $(template);
}


//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function get_news(safe) {
    var _webs, url, counter;
    if (safe) {
        _webs = saved_webs;
        url = "/api/feeds/media/news/saved/load?c=";
        counter = saved_news_counter;
    } else {
        _webs = webs;
        url = "/api/feeds/media/news/load?c=";
        counter = news_counter;
    }
    var query = url + counter;
    if (_webs == undefined || _webs == []) {
        return $.get(query);
    }
    for (i in _webs) {
        query = query + "&" + "webs=" + encodeURIComponent(_webs[i]);
    }
    return $.get(query);
}


function insert_news(safe, destroy) {
    if (destroy) {
        if (safe) {
            $("#insert_saved_news").empty();
            saved_news_counter = 0;
        } else {
            $("#insert_news").empty();
            news_counter = 0;
        }
    }
    var jquery_selector;
    if (safe) {
        jquery_selector = "#insert_saved_news";
    } else {
        jquery_selector = "#insert_news";
    }
    get_news(safe).done(function(data) {
        if (data.hasOwnProperty("insert")) {
            return;
        }
        var delay = 0;
        $.each(JSON.parse(data), function(index, obj) {
            var card = get_news_card(obj, safe);
            card.slideToggle();
            $(jquery_selector).append(card);
            card.delay(delay).slideToggle(500);
            delay += 120;
            if (safe) {
                saved_news_counter += 1;
            } else {
                news_counter += 1;
            }
        });
    });
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/


$("#news_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/media/news/refresh").done(function() {
        news_counter = 0;
        $("#news_button").html("Refresh");
        $("#news_button").prop("disabled", false);
        insert_news(false, true);
        update_todays_chart();
    });
});

$("body").on("click", ".safe_check", function(e) {
    e.preventDefault();
    id_to_update = $(this).closest("a").attr("new-id");
    jquery_selector = "a[new-id='" + id_to_update + "'] .safe_check";
    safe = $(this).prop("checked");
    $.ajax({
        type: "PUT",
        url: "/api/feeds/media/news/safe",
        data: JSON.stringify({ "id": id_to_update, "safe": safe }),
        success: function(data) {
            if (data) {
                $(jquery_selector).each(function() {
                    $(this).prop("checked", true);
                });
                insert_news(true, true);
            } else {
                $(jquery_selector).each(function() {
                    $(this).prop("checked", false);
                });
                $("div[name='saved_" + id_to_update + "']").remove();
            }
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });

});