var nist_table;

$("#nist_button").click(function() {
    $(this).prop("disabled", true);
    $(this).html(
        `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`
    );
    $.get("/api/feeds/papers/nist/refresh").done(function(data) {
        if (!nist_table) {
            nist_table.destroy();
        }
        $("#nist_table").DataTable().ajax.reload(null, false);
        $("#nist_button").prop("disabled", false);
        $("#nist_button").html("Refresh");
        update_todays_chart();
    });
});

function restore_nist() {
    $("#nist_table").DataTable().ajax.reload(null, false);
    $("#saved_nist_table").DataTable().ajax.reload(null, false);
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function show_nist(id_param, url_param) {
    nist_table = $(id_param).DataTable({
        ajax: {
            url: url_param,
            dataSrc: ""
        },
        columns: [{
                data: "serie",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        switch (data) {
                            case "NISTIR":
                                data = '<span class="blue">' + data + '</span>';
                                break;
                            case "SP":
                                data = '<span class="high">' + data + '</span>';
                                break;
                            case "White Paper":
                                data = '<span class="green">' + data + '</span>';
                                break;
                            case "Journal Article":
                                data = '<span class="pink">' + data + '</span>';
                                break;
                            case "FIPS":
                                data = '<span class="cyan">' + data + '</span>';
                                break;
                            case "ITL Bulletin":
                                data = '<span class="medium">' + data + '</span>';
                                break;
                            case "Building Block":
                                data = '<span class="purple">' + data + '</span>';
                                break;
                            case "Use Case":
                                data = '<span class="critical">' + data + '</span>';
                                break;
                            default:
                                data = '<span class="dark-grey">' + data + '</span>';
                        }
                    }
                    return data;
                }
            },
            {
                data: "name",
                render: function(data, type, row, meta) {
                    if (type === "display") {
                        data = "<a href='" + row.link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                    }

                    return data;
                }
            },
            {
                data: "number"
            },
            {
                data: "status"
            },
            {
                data: "language"
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
                        data = "<a class='float-start' href='https://www.google.es/search?q=" + row.name.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/google.svg' width='22'></a>";
                    } else {
                        data = "<a class='float-start' href='https://duckduckgo.com/?q=" + row.name.replace(/['"]+/g, "") + "' target='_blank' rel='noopener noreferrer'><img src='/static/assets/img/duck.svg' width='22'></a>";
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
                class="check_saved_nist form-check-input" style="float:none" [saved]>
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
            },
            {
                data: "date",
                visible: false
            }
        ],
        order: [
            [5, "desc"]
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
            { targets: 1, className: text_alignment },
            { targets: 5, type: "date-eu", width: "10%" },
            { targets: 6, width: "2%", orderable: false }
        ],
        pageLength: 10
    });
    $(".dataTables_filter input").addClass("form-line-control");
}

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

$("body").on("click", ".check_saved_nist", function(e) {
    e.preventDefault();
    var check = $(this);
    var a = "check";
    if (!check.prop("checked")) {
        a = "uncheck";
    }
    var dict = { name: check.attr("name"), action: a };
    $.ajax({
        type: "PUT",
        url: "/api/feeds/papers/nist/saved",
        data: JSON.stringify(dict),
        success: function(data) {
            if (data) {
                check.prop("checked", true);
            } else {
                check.prop("checked", false);
            }
            $("#nist_table").DataTable().ajax.reload(null, false);
            $("#saved_nist_table").DataTable().ajax.reload(null, false);
            update_saved_chart();
        },
        contentType: "application/json",
        dataType: "json"
    });
});