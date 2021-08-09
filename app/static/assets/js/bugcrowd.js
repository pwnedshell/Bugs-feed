var bugcrowd_table;

$("#bugcrowd_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/vulnerabilities/bugcrowd/refresh").done(function(data) {
        if (!bugcrowd_table) {
            bugcrowd_table.destroy();
        }
        $("#bugcrowd_table").DataTable().ajax.reload(null, false);
        $("#bugcrowd_button").prop("disabled", false);
        $("#bugcrowd_button").html("Refresh");
        update_todays_chart();
    });
});

function restore_bugcrowd() {
    $("#bugcrowd_table").DataTable().ajax.reload(null, false);
    $("#saved_bugcrowd_table").DataTable().ajax.reload(null, false);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function show_bugcrowd(id_param, url_param) {
    bugcrowd_table = $(id_param).DataTable({
        ajax: {
            url: url_param,
            dataSrc: ""
        },
        columns: [{
                data: "name",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        data = "<a href='" + row.link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                    }
                    return data;
                }
            }, {
                data: "program",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        data = "<a href='" + row.program_link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                    }
                    return data;
                }
            }, {
                data: "priority",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        if (data == "P1") {
                            data = "<span class='critical'>" + data + "<span>";
                        } else if (data == "P2") {
                            data = "<span class='high'>" + data + "<span>";
                        } else if (data == "P3") {
                            data = "<span class='medium'>" + data + "<span>";
                        } else {
                            data = "<span class='green'>" + data + "<span>";
                        }
                    }
                    return data;
                }
            },
            {
                data: "date",
                render: function(data, type, row, meta) {
                    d = new Date(data["$date"]);
                    var datestring = d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
                    return datestring;
                }
            },
            {
                render: function(data, type, row, meta) {
                    if (google) {
                        data = "<a class='float-start' href='https://www.google.es/search?q=" + row.name.replace(/['"]+/g, "") + " in " + row.program.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/google.svg' width='22'></a>";
                    } else {
                        data = "<a class='float-start' href='https://duckduckgo.com/?q=" + row.name.replace(/['"]+/g, "") + " in " + row.program.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/duck.svg' width='22'></a>";
                    }
                    return data;
                }
            },
            {
                data: "saved",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        template = `<div class="form-check form-check-rounded form-check-lg radio-has-check me-2">
                <input name="[name]" type="checkbox"
                    class="check_saved_bugcrowd form-check-input" style="float:none" [saved]>
            </div>`
                        var checked = "";
                        if (data == true) {
                            checked = 'checked="true"';
                        }
                        data = template.replace("[saved]", checked);
                        data = data.replace("[name]", row.name);
                    }
                    return data;
                }
            }
        ],
        order: [
            [3, "desc"]
        ],
        bAutoWidth: false,
        info: false,
        lengthChange: false,
        language: {
            search: "",
            searchPlaceholder: "Search"
        },
        destroy: true,
        columnDefs: [
            { targets: 0, className: text_alignment },
            { targets: 2, width: "1%" },
            { targets: 3, width: "8%", type: "date-eu" },
            { targets: 4, width: "2%", orderable: false }
        ],
        pageLength: 10
    });
    $(".dataTables_filter input").addClass("form-line-control");
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("body").on("click", ".check_saved_bugcrowd", function(e) {
    e.preventDefault();
    var check = $(this);
    var a = "check";
    if (!check.prop("checked")) {
        a = "uncheck";
    }
    var dict = { name: check.attr("name"), action: a };
    $.ajax({
        type: "PUT",
        url: "/api/feeds/vulnerabilities/bugcrowd/saved",
        data: JSON.stringify(dict),
        success: function(data) {
            if (data) {
                check.prop("checked", true);
            } else {
                check.prop("checked", false);
            }
            $("#bugcrowd_table").DataTable().ajax.reload(null, false);
            $("#saved_bugcrowd_table").DataTable().ajax.reload(null, false);
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});