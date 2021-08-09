var searched_hackerone_table;
var searched_bugcrowd_table;
var searched_exploitdb_table;
var searched_cve_table;
var searched_exploitdbsp_table;
var searched_nist_table;
var searched_oxford_table;

search_tab_template = `
<li class="nav-item mx-1" role="presentation">
    <button class="nav-link subtab-button m-2" id="searched_[collection]_tab" data-bs-toggle="tab" data-bs-target="#searched_[collection]" type="button" role="tab" aria-controls="searched_[collection]" aria-selected="true">[collection_title]</button>
</li>
`
search_media_tab_template = `
<li class="nav-item mx-1" role="presentation">
    <button class="nav-link m-2" id="searched_media_tab" data-bs-toggle="tab" data-bs-target="#searched_media" type="button" role="tab" aria-controls="searched_media" aria-selected="true">Media</button>
</li>
`
search_vulnerabilities_tab_template = `
<li class="nav-item mx-1" role="presentation">
    <button class="nav-link m-2" id="searched_vulnerabilities_tab" data-bs-toggle="tab" data-bs-target="#searched_vulnerabilities" type="button" role="tab" aria-controls="searched_vulnerabilities" aria-selected="true">Vulnerabilities</button>
</li>
`
search_papers_tab_template = `
<li class="nav-item mx-1" role="presentation">
    <button class="nav-link m-2" id="searched_papers_tab" data-bs-toggle="tab" data-bs-target="#searched_papers" type="button" role="tab" aria-controls="searched_papers" aria-selected="true">Papers</button>
</li>
`
search_pane_template = `
<div class="tab-pane fade" id="searched_[collection]" role="tabpanel" aria-labelledby="searched_[collection]_tab">
    <div id="insert_searched_[collection]" class="[class]">
    </div>
</div>
`

//""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

function get_collection_tab_name(collection) {
    switch (collection) {
        case "news":
            return "News";
        case "videos":
            return "Videos";
        case "tweets":
            return "Tweets";
        case "hackerone":
            return "Hackerone";
        case "bugcrowd":
            return "Bugcrowd";
        case "exploitdb":
            return "Exploit-db";
        case "cve":
            return "CVE";
        case "exploitdbsp":
            return "Exploit-db";
        case "nist":
            return "Nist";
        case "oxford":
            return "Oxford";
        default:
            return ":("
    }
}

function insert_tab(collection, cssclass) {
    var tab_template = search_tab_template;
    tab_template = tab_template.split("[collection]").join(collection);
    tab_template = tab_template.split("[collection_title]").join(get_collection_tab_name(collection));
    if (["news", "videos", "tweets"].indexOf(collection) > -1) {
        var pane_template = search_pane_template;
        pane_template = pane_template.split("[collection]").join(collection);
        pane_template = pane_template.split("[class]").join(cssclass);
        $("#searched_media_tab_list").append(tab_template);
        $("#searched_media_pane_list").append(pane_template);
    } else if (["hackerone", "bugcrowd", "exploitdb", "cve"].indexOf(collection) > -1) {
        $("#searched_vulnerabilities_tab_list").append(tab_template);
    } else {
        $("#searched_papers_tab_list").append(tab_template);
    }
}

$("#search").bind("enterKey", function(e) {
    search();
});
$("#search").keyup(function(e) {
    if (e.keyCode == 13) {
        $(this).trigger("enterKey");
    }
});

$("#search_button").on("click", function(e) {
    e.preventDefault();
    search();
});

function search() {
    $.ajax({
        type: "POST",
        url: "/api/search",
        data: JSON.stringify({
            "search": $("#search").val()
        }),
        success: function(data) {
            $("#searched_media_tab_list").empty();
            $("#searched_media_pane_list").empty();
            $("#searched_type").empty();
            $("#searched_vulnerabilities_tab_list").empty();
            $("#searched_papers_tab_list").empty();
            $(".search-tab-pane").removeClass("active show");
            if (searched_hackerone_table != undefined) {
                searched_hackerone_table.destroy();
                searched_hackerone_table = undefined;
            }
            if (searched_bugcrowd_table != undefined) {
                searched_bugcrowd_table.destroy();
                searched_bugcrowd_table = undefined;
            }
            if (searched_exploitdb_table != undefined) {
                searched_exploitdb_table.destroy();
                searched_exploitdb_table = undefined;
            }
            if (searched_cve_table != undefined) {
                searched_cve_table.destroy();
                searched_cve_table = undefined;
            }
            if (searched_exploitdbsp_table != undefined) {
                searched_exploitdbsp_table.destroy();
                searched_exploitdbsp_table = undefined;
            }
            if (searched_nist_table != undefined) {
                searched_nist_table.destroy();
                searched_nist_table = undefined;
            }
            if (searched_oxford_table != undefined) {
                searched_oxford_table.destroy();
                searched_oxford_table = undefined;
            }
            if (data.news.length + data.news.length + data.news.length != 0) {
                $("#searched_type").append(search_media_tab_template);
            }
            if (data.hackerone.length + data.bugcrowd.length + data.exploitdb.length + data.cve.length != 0) {
                $("#searched_type").append(search_vulnerabilities_tab_template);
            }
            if (data.exploitdbsp.length + data.nist.length + data.oxford.length != 0) {
                $("#searched_type").append(search_papers_tab_template);
            }
            if (data.news.length != 0) {
                insert_tab("news", "row row-cols-1 row-cols-md-3 g-4 pb-6 mt-5");
                $.each(data.news, function(index, obj) {
                    var card = get_news_card(obj);
                    card.slideToggle();
                    $("#insert_searched_news").append(card);
                    card.delay(120).slideToggle(500);
                });
            }
            if (data.videos.length != 0) {
                insert_tab("videos", "row pb-6 mt-5");
                $.each(data.videos, function(index, obj) {
                    var card = get_videos_card(obj);
                    card.slideToggle();
                    $("#insert_searched_videos").append(card);
                    card.delay(120).slideToggle(500);
                });
            }
            if (data.tweets.length != 0) {
                insert_tab("tweets", "row row-cols-1 row-cols-md-2 mt-5");
                var ids = [];
                $.each(data.tweets, function(index, obj) {
                    var card = get_tweets_card(obj, ids);
                    card.slideToggle();
                    $("#insert_searched_tweets").append(card);
                    card.delay(120).slideToggle(500);
                    for (var i = 0; i < ids.length; i++) {
                        $("#" + ids[i]).lightGallery({});
                    }
                });
            }
            if (data.hackerone.length != 0) {
                insert_tab("hackerone", "");
                var array = data.hackerone;
                searched_hackerone_table = $("#searched_hackerone_table").DataTable({
                    data: array,
                    columns: [{
                            data: "name",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    data = "<a href='" + row.link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                                }

                                return data;
                            }
                        }, {
                            data: "product"
                        }, {
                            data: "level",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    if (data == "Medium") {
                                        data = '<span class="medium">' + data + '</span>';
                                    } else if (data == "High") {
                                        data = '<span class="high">' + data + '</span>';
                                    } else if (data == "Critical") {
                                        data = '<span class="critical">' + data + '</span>';
                                    } else {
                                        data = '<span class="green">' + data + '</span>';
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
            if (data.bugcrowd.length != 0) {
                insert_tab("bugcrowd", "");
                var array = data.bugcrowd;
                searched_bugcrowd_table = $("#searched_bugcrowd_table").DataTable({
                    data: array,
                    columns: [{
                            data: "name",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    data = "<a href='" + row.link + "' target='_blank' rel='noopener noreferrer'>" + data + "</a>";
                                }

                                return data;
                            }
                        }, {
                            data: "program"
                        }, {
                            data: "priority",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    if (data == "P1") {
                                        data = '<span class="critical">' + data + '</span>';
                                    } else if (data == "P2") {
                                        data = '<span class="high">' + data + '</span>';
                                    } else if (data == "P3") {
                                        data = '<span class="medium">' + data + '</span>';
                                    } else {
                                        data = '<span class="green">' + data + '</span>';
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
            if (data.exploitdb.length != 0) {
                insert_tab("exploitdb", "");
                var array = data.exploitdb;
                searched_exploitdb_table = $("#searched_exploitdb_table").DataTable({
                    data: array,
                    columns: [{
                            data: "category",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    switch (data) {
                                        case "dos":
                                            data = '<span class="pink">' + data + '</span>';
                                            break;
                                        case "local":
                                            data = '<span class="purple">' + data + '</span>';
                                            break;
                                        case "remote":
                                            data = '<span class="green">' + data + '</span>';
                                            break;
                                        case "webapps":
                                            data = '<span class="cyan">' + data + '</span>';
                                            break;
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
                            class="check_saved_exploitdb form-check-input" style="float:none" [saved]>
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
                        [2, "desc"]
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
                        { targets: 2, type: "date-eu", width: "10%" },
                        { targets: 3, width: "2%", orderable: false }
                    ],
                    pageLength: 10
                });
                $(".dataTables_filter input").addClass("form-line-control");
            }
            if (data.cve.length != 0) {
                insert_tab("cve", "");
                var array = data.cve;
                searched_cve_table = $("#searched_cve_table").DataTable({
                    data: array,
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
            if (data.exploitdbsp.length != 0) {
                insert_tab("exploitdbsp", "");
                var array = data.exploitdbsp;
                searched_exploitdbsp_table = $("#searched_exploitdbsp_table").DataTable({
                    data: array,
                    columns: [{
                            data: "platform",
                            render: function(data, type, row, meta) {
                                if (type === "display") {
                                    switch (data) {
                                        case "Windows":
                                            data = '<span class="blue">' + data + '</span>';
                                            break;
                                        case "Linux":
                                            data = '<span class="high">' + data + '</span>';
                                            break;
                                        case "Android":
                                            data = '<span class="green">' + data + '</span>';
                                            break;
                                        case "Multiple":
                                            data = '<span class="pink">' + data + '</span>';
                                            break;
                                        case "Python":
                                            data = '<span class="cyan">' + data + '</span>';
                                            break;
                                        case "PHP":
                                            data = '<span class="medium">' + data + '</span>';
                                            break;
                                        case "iOS":
                                            data = '<span class="purple">' + data + '</span>';
                                            break;
                                        case "Hardware":
                                            data = '<span class="critical">' + data + '</span>';
                                            break;
                                        case "Java":
                                            data = '<span class="high">' + data + '</span>';
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
                        }, {
                            data: "author"
                        }, {
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
                            class="check_saved_exploitdbsp form-check-input" style="float:none" [saved]>
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
                        [4, "desc"]
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
                        { targets: 4, type: "date-eu", width: "10%" },
                        { targets: 5, width: "2%", orderable: false }
                    ],
                    pageLength: 10
                });
                $(".dataTables_filter input").addClass("form-line-control");
            }
            if (data.nist.length != 0) {
                insert_tab("nist", "");
                var array = data.nist;
                searched_nist_table = $("#searched_nist_table").DataTable({
                    data: array,
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
            if (data.oxford.length != 0) {
                insert_tab("oxford", "");
                var array = data.oxford;
                oxford_table = $("#searched_oxford_table").DataTable({
                    data: array,
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
                            data: "author"
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
                            class="check_saved_oxford form-check-input" style="float:none" [saved]>
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
                        [2, "desc"]
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
                        { targets: 1, width: "20%" },
                        { targets: 2, type: "date-eu", width: "10%" },
                        { targets: 3, width: "2%", orderable: false }
                    ],
                    pageLength: 10
                });
                $(".dataTables_filter input").addClass("form-line-control");
            }

            //""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/""7__/

        },
        contentType: "application/json",
        dataType: "json"
    });
}