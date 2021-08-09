var hackerone_table;

$("#hackerone_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/vulnerabilities/hackerone/refresh").done(function(data) {
        if (!hackerone_table) {
            hackerone_table.destroy();
        }
        $("#hackerone_table").DataTable().ajax.reload(null, false);
        $("#hackerone_button").prop("disabled", false);
        $("#hackerone_button").html("Refresh");
        update_todays_chart();
    });
});

function restore_hackerone() {
    $("#hackerone_table").DataTable().ajax.reload(null, false);
    $("#saved_hackerone_table").DataTable().ajax.reload(null, false);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function show_hackerone(id_param, url_param) {
    hackerone_table = $(id_param).DataTable({
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
                data: "product",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        data = "<a href='" + row.product_link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                    }
                    return data;
                }
            }, {
                data: "level",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        if (data == "Medium") {
                            data = "<span class='medium'>" + data + "<span>";
                        } else if (data == "High") {
                            data = "<span class='high'>" + data + "<span>";
                        } else if (data == "Critical") {
                            data = "<span class='critical'>" + data + "<span>";
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
                        data = "<a class='float-start' href='https://www.google.es/search?q=" + row.name.replace(/['"]+/g, "") + " in " + row.product.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/google.svg' width='22'></a>";
                    } else {
                        data = "<a class='float-start' href='https://duckduckgo.com/?q=" + row.name.replace(/['"]+/g, "") + " in " + row.product.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/duck.svg' width='22'></a>";
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
                class="check_saved_hackerone form-check-input" style="float:none" [saved]>
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
            }, {
                data: "date",
                visible: false
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
            { targets: 3, type: "date-eu", width: "10%" },
            { targets: 4, width: "2%", orderable: false }
        ],
        pageLength: 10
    });
    $(".dataTables_filter input").addClass("form-line-control");
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("body").on("click", ".check_saved_hackerone", function(e) {
    e.preventDefault();
    var check = $(this);
    var a = "check";
    if (!check.prop("checked")) {
        a = "uncheck";
    }
    var dict = { name: check.attr("name"), action: a };
    $.ajax({
        type: "PUT",
        url: "/api/feeds/vulnerabilities/hackerone/saved",
        data: JSON.stringify(dict),
        success: function(data) {
            if (data) {
                check.prop("checked", true);
            } else {
                check.prop("checked", false);
            }
            $("#hackerone_table").DataTable().ajax.reload(null, false);
            $("#saved_hackerone_table").DataTable().ajax.reload(null, false);
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});