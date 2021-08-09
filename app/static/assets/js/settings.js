const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const currentMonth = new Date().getMonth();

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$.get("/api/configs/checkVersion").done(function(data) {
    if (data != "True") {
        $("#version").append(" <a href='https://github.com/PwnedShell/Bugs-feed/releases/latest' style='color:var(--red)' target='_blank' rel='noopener noreferrer'>New version available</a>")
    }
})

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$.get("/api/configs/refreshMedia").done(function(data) {
    $("#media_scheduler").selectpicker("val", data.toString());
    $("#media_scheduler").on("changed.bs.select", function() {
        $.ajax({
            url: "/api/configs/refreshMedia",
            type: "PUT",
            data: JSON.stringify({ "time": $("#media_scheduler").val() }),
            contentType: "application/json",
            dataType: "json"
        });
    });
});

$.get("/api/configs/refreshTables").done(function(data) {
    $("#tables_scheduler").selectpicker("val", data.toString());
    $("#tables_scheduler").on("changed.bs.select", function() {
        $.ajax({
            url: "/api/configs/refreshTables",
            type: "PUT",
            data: JSON.stringify({ "time": $("#tables_scheduler").val() }),
            contentType: "application/json",
            dataType: "json"
        });
    });
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$.get("/api/configs/checkInit").done(function(data) {
    if (data) {
        $.ajax({
            url: "/api/configs/checkInit",
            type: "PUT",
            success: function(data) {
                $("#welcome_footer").html("<strong style='color: var(--blue)'>All set for bugs hunting! Please reload the page</strong>")
            }
        });
        new bootstrap.Modal(document.getElementById("init_modal"), { backdrop: "static", keyboard: false }).toggle();
        startTimer(60 * 5, "#5_minutes");
    }
});

function startTimer(duration, display) {
    var timer = duration,
        minutes, seconds;
    setInterval(function() {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        $(display).html(minutes + ":" + seconds);
        if (--timer < 0) {
            $(display).html("<strong style='color: var(--red)'>That took to much... Some bugs might not be correctly loaded (reload the page)</strong>");
        }
    }, 1000);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var google = true;

$.get("/api/configs/google").done(function(data) {
    google = data;
    $("#google_switch").prop("checked", google);
});

$("#google_switch").click(function() {
    $.ajax({
        url: "/api/configs/google",
        type: "PUT",
        success: function(result) {
            google = result;
            restore_hackerone();
            restore_bugcrowd();
            restore_exploitdb();
            restore_cve();
            restore_exploitdbsp();
            restore_nist();
            restore_oxford();
        }
    });
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var text_alignment = "align ";

$.get("/api/configs/align").done(function(data) {
    text_alignment += data;
    $("#align_switch").prop("checked", data == "text-center");
});

$("#align_switch").click(function() {
    $.ajax({
        url: "/api/configs/align",
        type: "PUT",
        success: function(result) {
            if (result == "text-start") {
                $(".align").removeClass("text-center");
                $(".align").addClass("text-start");
            } else {
                $(".align").removeClass("text-start");
                $(".align").addClass("text-center");
            }
        }
    });
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var channel_template = `
<div class="row py-2">
    <div class="col-5">
        <div class="form-group mb-md-4">
            <input type="text" disabled channel="[id]" value="[id]" placeholder="Channel id" class="form-control form-control-invert">
        </div>
    </div>
    <div class="col-5">
        <div class="form-group mb-md-4">
            <input type="text" disabled username="[name]" value="[name]" placeholder="Channel custom name" class="form-control form-control-invert">
        </div>
    </div>
    <div class="col-2">
        <a href="#" channel_id="[id]" channel_username="[name]" class="btn btn-primary btn-has-one channel-update">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
            style="fill:rgba(0, 0, 0, 1);transform:;-ms-filter:">
                <path
                    d="M8.707 19.707L18 10.414 13.586 6l-9.293 9.293c-.128.128-.219.289-.263.464L3 21l5.242-1.03C8.418 19.926 8.579 19.835 8.707 19.707zM21 7.414c.781-.781.781-2.047 0-2.828L19.414 3c-.781-.781-2.047-.781-2.828 0L15 4.586 19.414 9 21 7.414z">
                </path>
            </svg>
        </a>
        <a href="#" channel_id="[id]" channel_username="[name]" class="btn btn-danger btn-has-one channel-delete">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                    fill="currentColor" />
                <path d="M9 9H11V17H9V9Z" fill="currentColor" />
                <path d="M13 9H15V17H13V9Z" fill="currentColor" />
            </svg>
        </a>
    </div>
</div>
`

var new_channel_template = `
<div class="row py-2">
    <div class="col-5">
        <div class="form-group mb-md-4">
            <input type="text" channel="[id]" placeholder="Channel id" class="form-control form-control-invert">
        </div>
    </div>
    <div class="col-5">
        <div class="form-group mb-md-4">
            <input type="text" username="[name]" placeholder="Channel custom name" class="form-control form-control-invert">
        </div>
    </div>
    <div class="col-2">
        <a href="#" channel_username="[name]" channel_id="[id]" class="btn btn-success btn-has-one channel-add">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path d="M19 11L13 11 13 5 11 5 11 11 5 11 5 13 11 13 11 19 13 19 13 13 19 13z"></path>
            </svg>
        </a>
    </div>
</div>
`

var invalid_channel_template = `
<div class="invalid-feedback">
    <svg xmlns="http://www.w3.org/2000/svg" width="16.001" height="16" viewBox="0 0 16.001 16">
        <g transform="translate(0.001)">
            <path data-name="Icon Color"
                d="M14.91,14.666H1.092a1.073,1.073,0,0,1-.982-.448,1.118,1.118,0,0,1,.1-1.118L7.13.649A1.061,1.061,0,0,1,8,0a1.062,1.062,0,0,1,.871.649L15.8,13.1a1.117,1.117,0,0,1,.094,1.117A1.071,1.071,0,0,1,14.91,14.666Zm-6.91-4A1.333,1.333,0,1,0,9.334,12,1.335,1.335,0,0,0,8,10.667ZM8,4a1.209,1.209,0,0,0-.871.422,1.211,1.211,0,0,0-.343.906L7.1,8.817A1.3,1.3,0,0,0,8.167,9.98.722.722,0,0,1,8,10h.4a1.317,1.317,0,0,1-.229-.02.937.937,0,0,0,.7-.77l.349-3.882a1.209,1.209,0,0,0-.342-.905A1.21,1.21,0,0,0,8,4Z"
                transform="translate(-0.001 0.667)" fill="#f46363"></path>
        </g>
    </svg>
    <span>Invalid [msg]</span>
</div>
`

$.get("/api/configs/channels").done(function(data) {
    for (i = 0; i < data.channels.length; i++) {
        var template = channel_template;
        template = template.split("[id]").join(data.channels[i]);
        template = template.split("[name]").join(data.usernames[i]);
        $("#channels_row").append(template);
    }
    for (i = data.channels.length; i < 15; i++) {
        var template = new_channel_template;
        template = template.split("[id]").join("new_channel_id_" + i);
        template = template.split("[name]").join("new_channel_name_" + i);
        $("#channels_row").append(template);
    }
});

$("body").on("click", ".channel-add", function(e) {
    e.preventDefault();
    var _this = $(this);
    var id = _this.attr("channel_id");
    var username = _this.attr("channel_username");
    var input = $("input[channel='" + id + "']");
    var input2 = $("input[username='" + username + "']");
    input.siblings().remove();
    input2.siblings().remove();
    input.removeClass("is-invalid");
    input2.removeClass("is-invalid");
    var new_id = input.val();
    var new_username = input2.val();
    $.ajax({
        type: "POST",
        url: "/api/configs/channels",
        data: JSON.stringify({ "channel": new_id, "username": new_username }),
        success: function(data) {
            var _msg = data.invalid;
            if (_msg == null) {
                var sibling = _this.parent().parent().prev();
                console.log(sibling)
                var template = channel_template;
                template = template.split("[id]").join(new_id);
                template = template.split("[name]").join(new_username);
                if (sibling[0] == undefined) {
                    _this.parent().parent().before(template);
                } else {
                    sibling.after(template);
                }
                _this.parent().parent().remove();
                $("#sp-channels").append("<option value='" + new_id + "'>" + new_username + "</option>");
                $("#sp-saved-channels").append("<option value='" + new_id + "'>" + new_username + "</option>");
                $("#sp-channels").selectpicker("refresh");
                $("#sp-saved-channels").selectpicker("refresh");
            } else {
                if (_msg == "channel") {
                    var template = invalid_channel_template;
                    template = template.split("[msg]").join("channel id");
                    input.after(template);
                    input.addClass("is-invalid");
                } else {
                    var template = invalid_channel_template;
                    template = template.split("[msg]").join("username");
                    input2.after(template);
                    input2.addClass("is-invalid");
                }
            }
        },
        contentType: "application/json",
        dataType: "json"
    });
});

$("body").on("click", ".channel-update", function(e) {
    e.preventDefault();
    var _this = $(this);
    var id = _this.attr("channel_id");
    var username = _this.attr("channel_username");
    var input = $("input[channel='" + id + "']");
    var input2 = $("input[username='" + username + "']");
    input.siblings().remove();
    input2.siblings().remove();
    input.removeClass("is-invalid");
    input2.removeClass("is-invalid");
    var new_id = input.val();
    var new_username = input2.val();
    var disabled = input.attr("disabled");
    if (disabled) {
        input.removeAttr("disabled");
        input2.removeAttr("disabled");
        _this.removeClass("btn-primary");
        _this.addClass("btn-success");
    } else {
        $.ajax({
            type: "PUT",
            url: "/api/configs/channels",
            data: JSON.stringify({ "channel": new_id, "old_channel": id, "username": new_username, "old_username": username }),
            success: function(data) {
                var _msg = data.invalid;
                if (_msg == null) {
                    _this.removeClass("btn-success");
                    _this.addClass("btn-primary");
                    _this.attr("channel_id", new_id);
                    _this.attr("channel_username", new_username);
                    input.attr("channel", new_id);
                    input2.attr("username", new_username);
                    input.attr("disabled", "disabled");
                    input2.attr("disabled", "disabled");
                    $("#sp-channels").find("[value='" + new_id + "']").remove();
                    $("#sp-saved-channels").find("[value='" + new_id + "']").remove();
                    $("#sp-channels").append("<option value='" + new_id + "'>" + new_username + "</option>");
                    $("#sp-saved-channels").append("<option value='" + new_id + "'>" + new_username + "</option>");
                    $("#sp-channels").selectpicker("refresh");
                    $("#sp-saved-channels").selectpicker("refresh");
                    insert_videos(false, true);
                    insert_videos(true, true);
                } else {
                    if (_msg == "channel") {
                        var template = invalid_channel_template;
                        template = template.split("[msg]").join("channel id");
                        input.after(template);
                        input.addClass("is-invalid");
                    } else {
                        var template = invalid_channel_template;
                        template = template.split("[msg]").join("username");
                        input2.after(template);
                        input2.addClass("is-invalid");
                    }
                }
            },
            contentType: "application/json",
            dataType: "json"
        });
    }
});


$("body").on("click", ".channel-delete", function(e) {
    e.preventDefault();
    var _this = $(this);
    var id = _this.attr("channel_id");
    var username = _this.attr("channel_username");
    $.ajax({
        type: "DELETE",
        url: "/api/configs/channels",
        data: JSON.stringify({ "channel": id, "username": username }),
        success: function(data) {
            if (data != null) {
                _this.parent().parent().remove();
                var template = new_channel_template;
                template = template.split("[id]").join(id);
                template = template.split("[name]").join(username);
                _this.parent().prev().remove();
                _this.parent().remove();
                $("#channels_row").append(template);
                $("#sp-channels").find("[value='" + id + "']").remove();
                $("#sp-saved-channels").find("[value='" + id + "']").remove();
                $("#sp-channels").selectpicker("refresh");
                $("#sp-saved-channels").selectpicker("refresh");
                insert_videos(false, true);
                insert_videos(true, true);
            }
        },
        contentType: "application/json",
        dataType: "json"
    });
});

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

var hashtag_template = `
<div class="col-4 py-2">
    <div class="form-group mb-md-4">
        <input type="text" disabled hashtag="[name]" value="[name]" placeholder="Placeholder" class="form-control form-control-invert">
    </div>
</div>
<div class="col-2 py-2">
    <a href="#" name="[name]" class="btn btn-primary btn-has-one hashtag-update">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M8.707 19.707L18 10.414 13.586 6l-9.293 9.293c-.128.128-.219.289-.263.464L3 21l5.242-1.03C8.418 19.926 8.579 19.835 8.707 19.707zM21 7.414c.781-.781.781-2.047 0-2.828L19.414 3c-.781-.781-2.047-.781-2.828 0L15 4.586 19.414 9 21 7.414z">
            </path>
        </svg>
    </a>
    <a href="#" name="[name]" class="btn btn-danger btn-has-one hashtag-delete">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M17 5V4C17 2.89543 16.1046 2 15 2H9C7.89543 2 7 2.89543 7 4V5H4C3.44772 5 3 5.44772 3 6C3 6.55228 3.44772 7 4 7H5V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V7H20C20.5523 7 21 6.55228 21 6C21 5.44772 20.5523 5 20 5H17ZM15 4H9V5H15V4ZM17 7H7V18C7 18.5523 7.44772 19 8 19H16C16.5523 19 17 18.5523 17 18V7Z"
                fill="currentColor" />
            <path d="M9 9H11V17H9V9Z" fill="currentColor" />
            <path d="M13 9H15V17H13V9Z" fill="currentColor" />
        </svg>
    </a>
</div>
`

var new_hashtag_template = `
<div class="col-4 py-2">
    <div class="form-group mb-md-4">
        <input type="text" hashtag="[name]" placeholder="Add new hashtag" class="form-control form-control-invert">
    </div>
</div>
<div class="col-2 py-2">
    <a href="#" name="[name]" class="btn btn-success btn-has-one hashtag-add">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M19 11L13 11 13 5 11 5 11 11 5 11 5 13 11 13 11 19 13 19 13 13 19 13z"></path>
        </svg>
    </a>
</div>
`

var invalid_hashtag = `
<div class="invalid-feedback">
    <svg xmlns="http://www.w3.org/2000/svg" width="16.001" height="16" viewBox="0 0 16.001 16">
        <g transform="translate(0.001)">
            <path data-name="Icon Color"
                d="M14.91,14.666H1.092a1.073,1.073,0,0,1-.982-.448,1.118,1.118,0,0,1,.1-1.118L7.13.649A1.061,1.061,0,0,1,8,0a1.062,1.062,0,0,1,.871.649L15.8,13.1a1.117,1.117,0,0,1,.094,1.117A1.071,1.071,0,0,1,14.91,14.666Zm-6.91-4A1.333,1.333,0,1,0,9.334,12,1.335,1.335,0,0,0,8,10.667ZM8,4a1.209,1.209,0,0,0-.871.422,1.211,1.211,0,0,0-.343.906L7.1,8.817A1.3,1.3,0,0,0,8.167,9.98.722.722,0,0,1,8,10h.4a1.317,1.317,0,0,1-.229-.02.937.937,0,0,0,.7-.77l.349-3.882a1.209,1.209,0,0,0-.342-.905A1.21,1.21,0,0,0,8,4Z"
                transform="translate(-0.001 0.667)" fill="#f46363"></path>
        </g>
    </svg>
    <span>Invalid hashtag</span>
</div>
`

$.get("/api/configs/hashtags").done(function(hashtags) {
    for (i = 0; i < hashtags.length; i++) {
        var template = hashtag_template;
        template = template.split("[name]").join(hashtags[i]);
        $("#hashtags_row").append(template);
    }
    for (i = hashtags.length; i < 10; i++) {
        var template = new_hashtag_template;
        template = template.split("[name]").join("new_hashtag_" + i);
        $("#hashtags_row").append(template);
    }
});

$("body").on("click", ".hashtag-add", function(e) {
    e.preventDefault();
    var _this = $(this);
    var name = _this.attr("name");
    var input = $("input[hashtag='" + name + "']");
    input.siblings().remove();
    input.removeClass("is-invalid");
    hashtag = input.val();
    $.ajax({
        type: "POST",
        url: "/api/configs/hashtags",
        data: JSON.stringify({ "hashtag": hashtag }),
        success: function(data) {
            if (data != null) {
                var sibling = _this.parent().prev().prev();
                var template = hashtag_template;
                template = template.split("[name]").join(hashtag);
                if (sibling[0] == undefined) {
                    sibling = _this.parent().prev();
                    sibling.before(template);
                } else {
                    sibling.after(template);
                }
                _this.parent().prev().remove();
                _this.parent().remove();
                $("#sp-hashtags").append("<option value='" + hashtag + "'>" + hashtag + "</option>");
                $("#sp-saved-hashtags").append("<option value='" + hashtag + "'>" + hashtag + "</option>");
                $("#sp-hashtags").selectpicker("refresh");
                $("#sp-saved-hashtags").selectpicker("refresh");
            } else {
                input.after(invalid_hashtag);
                input.addClass("is-invalid");
            }
        },
        contentType: "application/json",
        dataType: "json"
    });
});

$("body").on("click", ".hashtag-update", function(e) {
    e.preventDefault();
    var _this = $(this);
    var name = _this.attr("name");
    var input = $("input[hashtag='" + name + "']");
    var disabled = input.attr("disabled");
    input.siblings().remove();
    input.removeClass("is-invalid");
    if (disabled) {
        input.removeAttr("disabled");
        _this.removeClass("btn-primary");
        _this.addClass("btn-success");
    } else {
        new_value = input.val();
        $.ajax({
            type: "PUT",
            url: "/api/configs/hashtags",
            data: JSON.stringify({ "hashtag": new_value, "name": name }),
            success: function(data) {
                if (data != null) {
                    _this.removeClass("btn-success");
                    _this.addClass("btn-primary");
                    _this.attr("name", new_value);
                    input.attr("hashtag", new_value);
                    input.attr("value", new_value);
                    input.attr("disabled", "disabled");
                    $("#sp-hashtags").find("[value='" + name + "']").remove();
                    $("#sp-saved-hashtags").find("[value='" + name + "']").remove();
                    $("#sp-hashtags").append("<option value='" + new_value + "'>" + new_value + "</option>");
                    $("#sp-saved-hashtags").append("<option value='" + new_value + "'>" + new_value + "</option>");
                    $("#sp-hashtags").selectpicker("refresh");
                    $("#sp-saved-hashtags").selectpicker("refresh");
                    insert_tweets(false, true);
                    insert_tweets(true, true);
                } else {
                    input.after(invalid_hashtag);
                    input.addClass("is-invalid");
                }
            },
            contentType: "application/json",
            dataType: "json"
        });
    }
});

$("body").on("click", ".hashtag-delete", function(e) {
    e.preventDefault();
    var _this = $(this);
    var name = _this.attr("name");
    var input = $("input[hashtag='" + name + "']");
    hashtag = input.val();
    $.ajax({
        type: "DELETE",
        url: "/api/configs/hashtags",
        data: JSON.stringify({ "hashtag": hashtag }),
        success: function(data) {
            if (data != null) {
                var template = new_hashtag_template;
                template = template.split("[name]").join(hashtag);
                _this.parent().prev().remove();
                _this.parent().remove();
                $("#hashtags_row").append(template);
                $("#sp-hashtags").find("[value='" + name + "']").remove();
                $("#sp-saved-hashtags").find("[value='" + name + "']").remove();
                $("#sp-hashtags").selectpicker("refresh");
                $("#sp-saved-hashtags").selectpicker("refresh");
                insert_tweets(false, true);
                insert_tweets(true, true);
            }
        },
        contentType: "application/json",
        dataType: "json"
    });
});