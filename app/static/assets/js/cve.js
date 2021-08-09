var cve_table;

$("#cve_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/vulnerabilities/cve/refresh").done(function(data) {
        if (!cve_table) {
            cve_table.destroy();
        }
        $("#cve_table").DataTable().ajax.reload(null, false);
        $("#cve_button").prop("disabled", false);
        $("#cve_button").html("Refresh");
        update_todays_chart();
    });
});

function restore_cve() {
    $("#cve_table").DataTable().ajax.reload(null, false);
    $("#saved_cve_table").DataTable().ajax.reload(null, false);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function show_cve(id_param, url_param) {
    cve_table = $(id_param).DataTable({
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
            },
            {
                data: "description",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        data = "<a href='" + row.link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
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
                        data = "<a class='float-start' href='https://www.google.es/search?q=" + row.name + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/google.svg' width='22'></a>";
                    } else {
                        data = "<a class='float-start' href='https://duckduckgo.com/?q=" + row.name + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/duck.svg' width='22'></a>";
                    }
                    var github = "<a class='float-end' href='https://github.com/search?q=" + row.name + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/github.svg' width='22'></a>";
                    return data + github
                }
            },
            {
                data: "saved",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        template = `<div class="form-check form-check-rounded form-check-lg radio-has-check me-2">
                <input name="[name]" type="checkbox"
                    class="check_saved_cve form-check-input" style="float:none" [saved]>
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
            [0, "desc"]
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
            { targets: 0, width: "13%" },
            { targets: 1, className: text_alignment },
            { targets: 2, width: "10%", type: "date-eu" },
            { targets: 3, width: "7.5%", orderable: false }
        ],
        pageLength: 10
    });
    $(".dataTables_filter input").addClass("form-line-control");
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("body").on("click", ".check_saved_cve", function(e) {
    e.preventDefault();
    var check = $(this);
    var a = "check";
    if (!check.prop("checked")) {
        a = "uncheck";
    }
    var dict = { name: check.attr("name"), action: a };
    $.ajax({
        type: "PUT",
        url: "/api/feeds/vulnerabilities/cve/saved",
        data: JSON.stringify(dict),
        success: function(data) {
            if (data) {
                check.prop("checked", true);
            } else {
                check.prop("checked", false);
            }
            $("#cve_table").DataTable().ajax.reload(null, false);
            $("#saved_cve_table").DataTable().ajax.reload(null, false);
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});