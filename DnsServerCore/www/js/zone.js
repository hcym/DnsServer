﻿/*
Technitium DNS Server
Copyright (C) 2023  Shreyas Zare (shreyas@technitium.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

var zoneOptionsAvailableTsigKeyNames;
var editZoneInfo;
var editZoneRecords;

$(function () {
    $("input[type=radio][name=rdAddZoneType]").change(function () {
        $("#divAddZonePrimaryNameServerAddresses").hide();
        $("#divAddZoneZoneTransferProtocol").hide();
        $("#divAddZoneTsigKeyName").hide();
        $("#divAddZoneForwarderProtocol").hide();
        $("#divAddZoneForwarder").hide();
        $("#divAddZoneForwarderDnssecValidation").hide();
        $("#divAddZoneForwarderProxy").hide();

        var zoneType = $('input[name=rdAddZoneType]:checked').val();
        switch (zoneType) {
            case "Primary":
                break;

            case "Secondary":
                $("#divAddZonePrimaryNameServerAddresses").show();
                $("#divAddZoneZoneTransferProtocol").show();
                $("#divAddZoneTsigKeyName").show();

                loadTsigKeyNames($("#optAddZoneTsigKeyName"), null, $("#divAddZoneAlert"));
                break;

            case "Stub":
                $("#divAddZonePrimaryNameServerAddresses").show();
                break;

            case "Forwarder":
                $("#divAddZoneForwarderProtocol").show();
                $("#divAddZoneForwarder").show();
                $("#divAddZoneForwarderDnssecValidation").show();
                $("#divAddZoneForwarderProxy").show();
                break;
        }
    });

    $("input[type=radio][name=rdAddZoneForwarderProtocol]").change(function () {
        var protocol = $('input[name=rdAddZoneForwarderProtocol]:checked').val();
        switch (protocol) {
            case "Udp":
            case "Tcp":
                $("#txtAddZoneForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")
                break;

            case "Tls":
            case "Quic":
                $("#txtAddZoneForwarder").attr("placeholder", "dns.quad9.net (9.9.9.9:853)")
                break;

            case "Https":
                $("#txtAddZoneForwarder").attr("placeholder", "https://cloudflare-dns.com/dns-query (1.1.1.1)")
                break;
        }
    });

    $("input[type=radio][name=rdAddZoneForwarderProxyType]").change(function () {
        var proxyType = $('input[name=rdAddZoneForwarderProxyType]:checked').val();

        $("#txtAddZoneForwarderProxyAddress").prop("disabled", (proxyType === "None"));
        $("#txtAddZoneForwarderProxyPort").prop("disabled", (proxyType === "None"));
        $("#txtAddZoneForwarderProxyUsername").prop("disabled", (proxyType === "None"));
        $("#txtAddZoneForwarderProxyPassword").prop("disabled", (proxyType === "None"));
    });

    $("input[type=radio][name=rdZoneTransfer]").change(function () {
        var zoneTransfer = $('input[name=rdZoneTransfer]:checked').val();
        switch (zoneTransfer) {
            case "AllowOnlySpecifiedNameServers":
            case "AllowBothZoneAndSpecifiedNameServers":
                $("#txtZoneTransferNameServers").prop("disabled", false);
                break;

            default:
                $("#txtZoneTransferNameServers").prop("disabled", true);
                break;
        }
    });

    $("input[type=radio][name=rdZoneNotify]").change(function () {
        var zoneNotify = $('input[name=rdZoneNotify]:checked').val();
        switch (zoneNotify) {
            case "SpecifiedNameServers":
            case "BothZoneAndSpecifiedNameServers":
                $("#txtZoneNotifyNameServers").prop("disabled", false);
                break;

            default:
                $("#txtZoneNotifyNameServers").prop("disabled", true);
                break;
        }
    });

    $("input[type=radio][name=rdDynamicUpdate]").change(function () {
        var dynamicUpdate = $('input[name=rdDynamicUpdate]:checked').val();
        switch (dynamicUpdate) {
            case "AllowOnlySpecifiedIpAddresses":
            case "AllowBothZoneNameServersAndSpecifiedIpAddresses":
                $("#txtDynamicUpdateIpAddresses").prop("disabled", false);
                break;

            default:
                $("#txtDynamicUpdateIpAddresses").prop("disabled", true);
                break;
        }
    });

    $("input[type=radio][name=rdDnssecSignZoneAlgorithm]").change(function () {
        var algorithm = $("input[name=rdDnssecSignZoneAlgorithm]:checked").val();
        switch (algorithm) {
            case "RSA":
                $("#divDnssecSignZoneRsaParameters").show();
                $("#divDnssecSignZoneEcdsaParameters").hide();
                break;

            case "ECDSA":
                $("#divDnssecSignZoneRsaParameters").hide();
                $("#divDnssecSignZoneEcdsaParameters").show();
                break;
        }
    });

    $("input[type=radio][name=rdDnssecSignZoneNxProof]").change(function () {
        var nxProof = $("input[name=rdDnssecSignZoneNxProof]:checked").val();
        switch (nxProof) {
            case "NSEC":
                $("#divDnssecSignZoneNSEC3Parameters").hide();
                break;

            case "NSEC3":
                $("#divDnssecSignZoneNSEC3Parameters").show();
                break;
        }
    });

    $("#optDnssecPropertiesGenerateKeyKeyType").change(function () {
        var keyType = $("#optDnssecPropertiesGenerateKeyKeyType").val();
        switch (keyType) {
            case "ZoneSigningKey":
                $("#divDnssecPropertiesGenerateKeyAutomaticRollover").show();
                $("#txtDnssecPropertiesGenerateKeyAutomaticRollover").val(30);
                break;

            default:
                $("#divDnssecPropertiesGenerateKeyAutomaticRollover").hide();
                $("#txtDnssecPropertiesGenerateKeyAutomaticRollover").val(0);
                break;
        }
    });

    $("#optDnssecPropertiesGenerateKeyAlgorithm").change(function () {
        var algorithm = $("#optDnssecPropertiesGenerateKeyAlgorithm").val();
        switch (algorithm) {
            case "RSA":
                $("#divDnssecPropertiesGenerateKeyRsaParameters").show();
                $("#divDnssecPropertiesGenerateKeyEcdsaParameters").hide();
                break;

            case "ECDSA":
                $("#divDnssecPropertiesGenerateKeyRsaParameters").hide();
                $("#divDnssecPropertiesGenerateKeyEcdsaParameters").show();
                break;
        }
    });

    $("input[type=radio][name=rdDnssecPropertiesNxProof]").change(function () {
        var nxProof = $("input[name=rdDnssecPropertiesNxProof]:checked").val();
        switch (nxProof) {
            case "NSEC":
                $("#divDnssecPropertiesNSEC3Parameters").hide();
                break;

            case "NSEC3":
                $("#divDnssecPropertiesNSEC3Parameters").show();
                break;
        }
    });

    $("#chkAddEditRecordDataPtr").click(function () {
        var addPtrRecord = $("#chkAddEditRecordDataPtr").prop('checked');
        $("#chkAddEditRecordDataCreatePtrZone").prop('disabled', !addPtrRecord);
    });

    $("input[type=radio][name=rdAddEditRecordDataForwarderProtocol]").change(updateAddEditFormForwarderPlaceholder);

    $("input[type=radio][name=rdAddEditRecordDataForwarderProxyType]").change(updateAddEditFormForwarderProxyType);

    $("#optAddEditRecordDataAppName").change(function () {
        if (appsList == null)
            return;

        var appName = $("#optAddEditRecordDataAppName").val();
        var optClassPaths = "<option></option>";

        for (var i = 0; i < appsList.length; i++) {
            if (appsList[i].name == appName) {
                for (var j = 0; j < appsList[i].dnsApps.length; j++) {
                    if (appsList[i].dnsApps[j].isAppRecordRequestHandler)
                        optClassPaths += "<option>" + appsList[i].dnsApps[j].classPath + "</option>";
                }

                break;
            }
        }

        $("#optAddEditRecordDataClassPath").html(optClassPaths);
        $("#txtAddEditRecordDataData").val("");
    });

    $("#optAddEditRecordDataClassPath").change(function () {
        if (appsList == null)
            return;

        var appName = $("#optAddEditRecordDataAppName").val();
        var classPath = $("#optAddEditRecordDataClassPath").val();

        for (var i = 0; i < appsList.length; i++) {
            if (appsList[i].name == appName) {
                for (var j = 0; j < appsList[i].dnsApps.length; j++) {
                    if (appsList[i].dnsApps[j].classPath == classPath) {
                        $("#txtAddEditRecordDataData").val(appsList[i].dnsApps[j].recordDataTemplate);
                        return;
                    }
                }
            }
        }

        $("#txtAddEditRecordDataData").val("");
    });

    $("#optZoneOptionsQuickTsigKeyNames").change(function () {
        var selectedOption = $("#optZoneOptionsQuickTsigKeyNames").val();
        switch (selectedOption) {
            case "blank":
                break;

            case "none":
                $("#txtZoneOptionsZoneTransferTsigKeyNames").val("");
                break;

            default:
                var existingList = $("#txtZoneOptionsZoneTransferTsigKeyNames").val();

                if (existingList.indexOf(selectedOption) < 0) {
                    existingList += selectedOption + "\n";
                    $("#txtZoneOptionsZoneTransferTsigKeyNames").val(existingList);
                }

                break;
        }
    });

    $("#optZonesPerPage").change(function () {
        localStorage.setItem("optZonesPerPage", $("#optZonesPerPage").val());
    });

    var optZonesPerPage = localStorage.getItem("optZonesPerPage");
    if (optZonesPerPage != null)
        $("#optZonesPerPage").val(optZonesPerPage);

    $("#optEditZoneRecordsPerPage").change(function () {
        localStorage.setItem("optEditZoneRecordsPerPage", $("#optEditZoneRecordsPerPage").val());
    });

    var optEditZoneRecordsPerPage = localStorage.getItem("optEditZoneRecordsPerPage");
    if (optEditZoneRecordsPerPage != null)
        $("#optEditZoneRecordsPerPage").val(optEditZoneRecordsPerPage);

    $("#chkEditRecordDataSoaUseSerialDateScheme").click(function () {
        var useSerialDateScheme = $("#chkEditRecordDataSoaUseSerialDateScheme").prop("checked");

        $("#txtEditRecordDataSoaSerial").prop("disabled", useSerialDateScheme);
    });
});

function refreshZones(checkDisplay, pageNumber) {
    if (checkDisplay == null)
        checkDisplay = false;

    var divViewZones = $("#divViewZones");

    if (checkDisplay) {
        if (divViewZones.css("display") === "none")
            return;

        if (($("#tableZonesBody").html().length > 0) && !$("#mainPanelTabPaneZones").hasClass("active"))
            return;
    }

    if (pageNumber == null) {
        pageNumber = $("#txtZonesPageNumber").val();
        if (pageNumber == "")
            pageNumber = 1;
    }

    var zonesPerPage = Number($("#optZonesPerPage").val());
    if (zonesPerPage < 1)
        zonesPerPage = 10;

    var divViewZonesLoader = $("#divViewZonesLoader");
    var divEditZone = $("#divEditZone");

    divViewZones.hide();
    divEditZone.hide();
    divViewZonesLoader.show();

    HTTPRequest({
        url: "/api/zones/list?token=" + sessionData.token + "&pageNumber=" + pageNumber + "&zonesPerPage=" + zonesPerPage,
        success: function (responseJSON) {
            var zones = responseJSON.response.zones;
            var firstRowNumber = ((responseJSON.response.pageNumber - 1) * zonesPerPage) + 1;
            var lastRowNumber = firstRowNumber + (zones.length - 1);
            var tableHtmlRows = "";

            for (var i = 0; i < zones.length; i++) {
                var id = Math.floor(Math.random() * 10000);
                var name = zones[i].name;

                if (name === "")
                    name = ".";

                var type;
                if (zones[i].internal)
                    type = "<span class=\"label label-default\">Internal</span>";
                else
                    type = "<span class=\"label label-primary\">" + zones[i].type + "</span>";

                var dnssecStatus = "";

                switch (zones[i].dnssecStatus) {
                    case "SignedWithNSEC":
                    case "SignedWithNSEC3":
                        dnssecStatus = "<span class=\"label label-default\">DNSSEC</span>";
                        break;
                }

                var status = "";

                if (zones[i].disabled)
                    status = "<span id=\"tdZoneStatus" + id + "\" class=\"label label-warning\">Disabled</span>";
                else if (zones[i].isExpired)
                    status = "<span id=\"tdZoneStatus" + id + "\" class=\"label label-danger\">Expired</span>";
                else if (zones[i].syncFailed)
                    status = "<span id=\"tdZoneStatus" + id + "\" class=\"label label-warning\">Sync Failed</span>";
                else if (zones[i].notifyFailed)
                    status = "<span id=\"tdZoneStatus" + id + "\" class=\"label label-warning\">Notify Failed</span>";
                else
                    status = "<span id=\"tdZoneStatus" + id + "\" class=\"label label-success\">Enabled</span>";

                var expiry = zones[i].expiry;
                if (expiry == null)
                    expiry = "&nbsp;";
                else
                    expiry = moment(expiry).local().format("YYYY-MM-DD HH:mm");

                var isReadOnlyZone = zones[i].internal;

                var showResyncMenu;

                switch (zones[i].type) {
                    case "Secondary":
                    case "Stub":
                        showResyncMenu = true;
                        break;

                    default:
                        showResyncMenu = false;
                        break;
                }

                var hideOptionsMenu;

                switch (zones[i].type) {
                    case "Primary":
                    case "Secondary":
                        hideOptionsMenu = zones[i].internal;
                        break;

                    default:
                        hideOptionsMenu = true;
                        break;
                }

                tableHtmlRows += "<tr id=\"trZone" + id + "\"><td>" + (firstRowNumber + i) + "</td>";

                if (zones[i].nameIdn == null)
                    tableHtmlRows += "<td><a href=\"#\" onclick=\"showEditZone('" + name + "'); return false;\">" + htmlEncode(name === "." ? "<root>" : name) + "</a></td>";
                else
                    tableHtmlRows += "<td><a href=\"#\" onclick=\"showEditZone('" + name + "'); return false;\">" + htmlEncode(zones[i].nameIdn + " (" + name + ")") + "</a></td>";

                tableHtmlRows += "<td>" + type + "</td>";
                tableHtmlRows += "<td>" + dnssecStatus + "</td>";
                tableHtmlRows += "<td>" + status + "</td>";
                tableHtmlRows += "<td>" + expiry + "</td>";

                tableHtmlRows += "<td align=\"right\"><div class=\"dropdown\"><a href=\"#\" id=\"btnZoneRowOption" + id + "\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"><span class=\"glyphicon glyphicon-option-vertical\" aria-hidden=\"true\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">";
                tableHtmlRows += "<li><a href=\"#\" onclick=\"showEditZone('" + name + "'); return false;\">" + (isReadOnlyZone ? "View" : "Edit") + " Zone</a></li>";

                if (!zones[i].internal) {
                    tableHtmlRows += "<li id=\"mnuEnableZone" + id + "\"" + (zones[i].disabled ? "" : " style=\"display: none;\"") + "><a href=\"#\" data-id=\"" + id + "\" data-zone=\"" + htmlEncode(name) + "\" onclick=\"enableZoneMenu(this); return false;\">Enable</a></li>";
                    tableHtmlRows += "<li id=\"mnuDisableZone" + id + "\"" + (!zones[i].disabled ? "" : " style=\"display: none;\"") + "><a href=\"#\" data-id=\"" + id + "\" data-zone=\"" + htmlEncode(name) + "\" onclick=\"disableZoneMenu(this); return false;\">Disable</a></li>";
                }

                if (showResyncMenu) {
                    tableHtmlRows += "<li><a href=\"#\" data-id=\"" + id + "\" data-zone=\"" + htmlEncode(name) + "\" data-zone-type=\"" + zones[i].type + "\" onclick=\"resyncZoneMenu(this); return false;\">Resync</a></li>";
                }

                if (!hideOptionsMenu) {
                    tableHtmlRows += "<li><a href=\"#\" onclick=\"showZoneOptionsModal('" + name + "'); return false;\">Zone Options</a></li>";
                }

                if (!zones[i].internal) {
                    tableHtmlRows += "<li><a href=\"#\" onclick=\"showZonePermissionsModal('" + name + "'); return false;\">Permissions</a></li>";
                }

                if (!zones[i].internal) {
                    tableHtmlRows += "<li role=\"separator\" class=\"divider\"></li>";
                    tableHtmlRows += "<li><a href=\"#\" data-id=\"" + id + "\" data-zone=\"" + htmlEncode(name) + "\" onclick=\"deleteZoneMenu(this); return false;\">Delete Zone</a></li>";
                }

                tableHtmlRows += "</ul></div></td></tr>";
            }

            var paginationHtml = "";

            if (responseJSON.response.pageNumber > 1) {
                paginationHtml += "<li><a href=\"#\" aria-label=\"First\" onClick=\"refreshZones(false, 1); return false;\"><span aria-hidden=\"true\">&laquo;</span></a></li>";
                paginationHtml += "<li><a href=\"#\" aria-label=\"Previous\" onClick=\"refreshZones(false, " + (responseJSON.response.pageNumber - 1) + "); return false;\"><span aria-hidden=\"true\">&lsaquo;</span></a></li>";
            }

            var pageStart = responseJSON.response.pageNumber - 5;
            if (pageStart < 1)
                pageStart = 1;

            var pageEnd = pageStart + 9;
            if (pageEnd > responseJSON.response.totalPages) {
                var endDiff = pageEnd - responseJSON.response.totalPages;
                pageEnd = responseJSON.response.totalPages;

                pageStart -= endDiff;
                if (pageStart < 1)
                    pageStart = 1;
            }

            for (var i = pageStart; i <= pageEnd; i++) {
                if (i == responseJSON.response.pageNumber)
                    paginationHtml += "<li class=\"active\"><a href=\"#\" onClick=\"refreshZones(false, " + i + "); return false;\">" + i + "</a></li>";
                else
                    paginationHtml += "<li><a href=\"#\" onClick=\"refreshZones(false, " + i + "); return false;\">" + i + "</a></li>";
            }

            if (responseJSON.response.pageNumber < responseJSON.response.totalPages) {
                paginationHtml += "<li><a href=\"#\" aria-label=\"Next\" onClick=\"refreshZones(false, " + (responseJSON.response.pageNumber + 1) + "); return false;\"><span aria-hidden=\"true\">&rsaquo;</span></a></li>";
                paginationHtml += "<li><a href=\"#\" aria-label=\"Last\" onClick=\"refreshZones(false, -1); return false;\"><span aria-hidden=\"true\">&raquo;</span></a></li>";
            }

            var statusHtml;

            if (responseJSON.response.zones.length > 0)
                statusHtml = firstRowNumber + "-" + lastRowNumber + " (" + responseJSON.response.zones.length + ") of " + responseJSON.response.totalZones + " zones (page " + responseJSON.response.pageNumber + " of " + responseJSON.response.totalPages + ")";
            else
                statusHtml = "0 zones";

            $("#txtZonesPageNumber").val(responseJSON.response.pageNumber);
            $("#tableZonesBody").html(tableHtmlRows);

            $("#tableZonesTopStatus").html(statusHtml);
            $("#tableZonesTopPagination").html(paginationHtml);

            $("#tableZonesFooterStatus").html(statusHtml);
            $("#tableZonesFooterPagination").html(paginationHtml);

            divViewZonesLoader.hide();
            divViewZones.show();
        },
        error: function () {
            divViewZonesLoader.hide();
            divViewZones.show();
        },
        invalidToken: function () {
            showPageLogin();
        },
        objLoaderPlaceholder: divViewZonesLoader
    });
}

function enableZoneMenu(objMenuItem) {
    var mnuItem = $(objMenuItem);

    var id = mnuItem.attr("data-id");
    var zone = mnuItem.attr("data-zone");

    var btn = $("#btnZoneRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/enable?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);

            $("#mnuEnableZone" + id).hide();
            $("#mnuDisableZone" + id).show();
            $("#tdZoneStatus" + id).attr("class", "label label-success");
            $("#tdZoneStatus" + id).html("Enabled");

            showAlert("success", "Zone Enabled!", "Zone '" + zone + "' was enabled successfully.");
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function enableZone(objBtn) {
    var zone = $("#titleEditZone").attr("data-zone");

    var btn = $(objBtn);
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/enable?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.button("reset");

            $("#btnEnableZoneEditZone").hide();
            $("#btnDisableZoneEditZone").show();
            $("#titleStatusEditZone").attr("class", "label label-success");
            $("#titleStatusEditZone").html("Enabled");

            showAlert("success", "Zone Enabled!", "Zone '" + zone + "' was enabled successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            showPageLogin();
        }
    });
}

function disableZoneMenu(objMenuItem) {
    var mnuItem = $(objMenuItem);

    var id = mnuItem.attr("data-id");
    var zone = mnuItem.attr("data-zone");

    if (!confirm("Are you sure you want to disable the zone '" + zone + "'?"))
        return;

    var btn = $("#btnZoneRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/disable?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);

            $("#mnuEnableZone" + id).show();
            $("#mnuDisableZone" + id).hide();
            $("#tdZoneStatus" + id).attr("class", "label label-warning");
            $("#tdZoneStatus" + id).html("Disabled");

            showAlert("success", "Zone Disabled!", "Zone '" + zone + "' was disabled successfully.");
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function disableZone(objBtn) {
    var zone = $("#titleEditZone").attr("data-zone");

    if (!confirm("Are you sure you want to disable the zone '" + zone + "'?"))
        return;

    var btn = $(objBtn);
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/disable?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.button("reset");

            $("#btnEnableZoneEditZone").show();
            $("#btnDisableZoneEditZone").hide();
            $("#titleStatusEditZone").attr("class", "label label-warning");
            $("#titleStatusEditZone").html("Disabled");

            showAlert("success", "Zone Disabled!", "Zone '" + zone + "' was disabled successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            showPageLogin();
        }
    });
}

function deleteZoneMenu(objMenuItem) {
    var mnuItem = $(objMenuItem);

    var id = mnuItem.attr("data-id");
    var zone = mnuItem.attr("data-zone");

    if (!confirm("Are you sure you want to permanently delete the zone '" + zone + "' and all its records?"))
        return;

    var btn = $("#btnZoneRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/delete?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            refreshZones();

            showAlert("success", "Zone Deleted!", "Zone '" + zone + "' was deleted successfully.");
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function deleteZone(objBtn) {
    var zone = $("#titleEditZone").attr("data-zone");

    if (!confirm("Are you sure you want to permanently delete the zone '" + zone + "' and all its records?"))
        return;

    var btn = $(objBtn);
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/delete?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.button("reset");
            refreshZones();

            showAlert("success", "Zone Deleted!", "Zone '" + zone + "' was deleted successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            showPageLogin();
        }
    });
}

function showConvertZoneModal(zone, type) {
    var lblConvertZoneZoneName = $("#lblConvertZoneZoneName");

    lblConvertZoneZoneName.text(zone === "." ? "<root>" : zone);
    lblConvertZoneZoneName.attr("data-zone", zone);

    $("#divConvertZoneAlert").html("");

    switch (type) {
        case "Primary":
            $("#rdConvertZoneToTypePrimary").attr("disabled", true);
            $("#rdConvertZoneToTypeForwarder").attr("disabled", false);

            $("#rdConvertZoneToTypeForwarder").prop("checked", true);
            break;

        case "Secondary":
            $("#rdConvertZoneToTypePrimary").attr("disabled", false);
            $("#rdConvertZoneToTypeForwarder").attr("disabled", false);

            $("#rdConvertZoneToTypePrimary").prop("checked", true);
            break;

        case "Forwarder":
            $("#rdConvertZoneToTypePrimary").attr("disabled", false);
            $("#rdConvertZoneToTypeForwarder").attr("disabled", true);

            $("#rdConvertZoneToTypePrimary").prop("checked", true);
            break;

        default:
            $("#rdConvertZoneToTypePrimary").attr("disabled", true);
            $("#rdConvertZoneToTypeForwarder").attr("disabled", true);

            $("#rdConvertZoneToTypePrimary").prop("checked", false);
            $("#rdConvertZoneToTypeForwarder").prop("checked", false);
            break;
    }

    $("#modalConvertZone").modal("show");
}

function convertZone(objBtn) {
    var divConvertZoneAlert = $("#divConvertZoneAlert");

    var zone = $("#lblConvertZoneZoneName").attr("data-zone");
    var type = $("input[name=rdConvertZoneToType]:checked").val();

    var btn = $(objBtn);
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/convert?token=" + sessionData.token + "&zone=" + zone + "&type=" + type,
        success: function (responseJSON) {
            btn.button("reset");
            $("#modalConvertZone").modal("hide");

            showEditZone(zone);

            showAlert("success", "Zone Converted!", "The zone was converted successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalConvertZone").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divConvertZoneAlert
    });
}

function addZoneOptionsDynamicUpdatesSecurityPolicyRow(id, tsigKeyName, domain, allowedTypes) {
    var tbodyDynamicUpdateSecurityPolicy = $("#tbodyDynamicUpdateSecurityPolicy");

    if (id == null) {
        id = Math.floor(Math.random() * 10000);

        if (tbodyDynamicUpdateSecurityPolicy.is(":empty")) {
            tsigKeyName = null;
            domain = $("#lblZoneOptionsZoneName").attr("data-zone");
            allowedTypes = 'A,AAAA'.split(',');
        }
    }

    var tableHtmlRow = "<tr id=\"trDynamicUpdateSecurityPolicyRow" + id + "\"><td style=\"word-wrap: anywhere;\"><select class=\"form-control\">";

    if (tsigKeyName != null)
        tableHtmlRow += "<option selected>" + htmlEncode(tsigKeyName) + "</option>";

    for (var i = 0; i < zoneOptionsAvailableTsigKeyNames.length; i++) {
        if (zoneOptionsAvailableTsigKeyNames[i] === tsigKeyName)
            continue;

        tableHtmlRow += "<option>" + htmlEncode(zoneOptionsAvailableTsigKeyNames[i]) + "</option>";
    }

    tableHtmlRow += "</select></td>";
    tableHtmlRow += "<td><input class=\"form-control\" type=\"text\" value=\"" + htmlEncode(domain) + "\"></td>";
    tableHtmlRow += "<td><input class=\"form-control\" type=\"text\" value=\"";

    if (allowedTypes != null) {
        for (var i = 0; i < allowedTypes.length; i++) {
            if (i == 0)
                tableHtmlRow += htmlEncode(allowedTypes[i]);
            else
                tableHtmlRow += ", " + htmlEncode(allowedTypes[i]);
        }
    }

    tableHtmlRow += "\"></td>";
    tableHtmlRow += "<td align=\"right\"><button type=\"button\" class=\"btn btn-warning\" style=\"padding: 5px 7px;\" onclick=\"$('#trDynamicUpdateSecurityPolicyRow" + id + "').remove();\">Remove</button></td></tr>";

    tbodyDynamicUpdateSecurityPolicy.append(tableHtmlRow);
}

function showZoneOptionsModal(zone) {
    var divZoneOptionsAlert = $("#divZoneOptionsAlert");
    var divZoneOptionsLoader = $("#divZoneOptionsLoader");
    var divZoneOptions = $("#divZoneOptions");

    $("#lblZoneOptionsZoneName").text(zone === "." ? "<root>" : zone);
    $("#lblZoneOptionsZoneName").attr("data-zone", zone);
    divZoneOptionsLoader.show();
    divZoneOptions.hide();

    $("#modalZoneOptions").modal("show");

    HTTPRequest({
        url: "/api/zones/options/get?token=" + sessionData.token + "&zone=" + zone + "&includeAvailableTsigKeyNames=true",
        success: function (responseJSON) {
            $("#txtZoneTransferNameServers").prop("disabled", true);
            $("#txtZoneNotifyNameServers").prop("disabled", true);
            $("#txtDynamicUpdateIpAddresses").prop("disabled", true);

            //zone transfer
            switch (responseJSON.response.zoneTransfer) {
                case "Allow":
                    $("#rdZoneTransferAllow").prop("checked", true);
                    break;

                case "AllowOnlyZoneNameServers":
                    $("#rdZoneTransferAllowOnlyZoneNameServers").prop("checked", true);
                    break;

                case "AllowOnlySpecifiedNameServers":
                    $("#rdZoneTransferAllowOnlySpecifiedNameServers").prop("checked", true);
                    $("#txtZoneTransferNameServers").prop("disabled", false);
                    break;

                case "AllowBothZoneAndSpecifiedNameServers":
                    $("#rdZoneTransferAllowBothZoneAndSpecifiedNameServers").prop("checked", true);
                    $("#txtZoneTransferNameServers").prop("disabled", false);
                    break;

                case "Deny":
                default:
                    $("#rdZoneTransferDeny").prop("checked", true);
                    break;
            }

            {
                var value = "";

                for (var i = 0; i < responseJSON.response.zoneTransferNameServers.length; i++)
                    value += responseJSON.response.zoneTransferNameServers[i] + "\r\n";

                $("#txtZoneTransferNameServers").val(value);
            }

            {
                var value = "";

                if (responseJSON.response.zoneTransferTsigKeyNames != null) {
                    for (var i = 0; i < responseJSON.response.zoneTransferTsigKeyNames.length; i++) {
                        value += responseJSON.response.zoneTransferTsigKeyNames[i] + "\r\n";
                    }
                }

                $("#txtZoneOptionsZoneTransferTsigKeyNames").val(value);
            }

            {
                var options = "<option value=\"blank\" selected></option><option value=\"none\">None</option>";

                if (responseJSON.response.availableTsigKeyNames != null) {
                    for (var i = 0; i < responseJSON.response.availableTsigKeyNames.length; i++) {
                        options += "<option>" + htmlEncode(responseJSON.response.availableTsigKeyNames[i]) + "</option>";
                    }
                }

                $("#optZoneOptionsQuickTsigKeyNames").html(options);
            }

            //notify
            switch (responseJSON.response.notify) {
                case "ZoneNameServers":
                    $("#rdZoneNotifyZoneNameServers").prop("checked", true);
                    break;

                case "SpecifiedNameServers":
                    $("#rdZoneNotifySpecifiedNameServers").prop("checked", true);
                    $("#txtZoneNotifyNameServers").prop("disabled", false);
                    break;

                case "BothZoneAndSpecifiedNameServers":
                    $("#rdZoneNotifyBothZoneAndSpecifiedNameServers").prop("checked", true);
                    $("#txtZoneNotifyNameServers").prop("disabled", false);
                    break;

                case "None":
                default:
                    $("#rdZoneNotifyNone").prop("checked", true);
                    break;
            }

            {
                var value = "";

                for (var i = 0; i < responseJSON.response.notifyNameServers.length; i++)
                    value += responseJSON.response.notifyNameServers[i] + "\r\n";

                $("#txtZoneNotifyNameServers").val(value);
            }

            if (responseJSON.response.notifyFailed) {
                var value = "";

                for (var i = 0; i < responseJSON.response.notifyFailedFor.length; i++) {
                    if (i == 0)
                        value = responseJSON.response.notifyFailedFor[i];
                    else
                        value += ", " + responseJSON.response.notifyFailedFor[i];
                }

                $("#divZoneNotifyFailedNameServers").show();
                $("#lblZoneNotifyFailedNameServers").text(value);
            }
            else {
                $("#divZoneNotifyFailedNameServers").hide();
            }

            if (responseJSON.response.type == "Primary") {
                //dynamic update
                switch (responseJSON.response.update) {
                    case "Allow":
                        $("#rdDynamicUpdateAllow").prop("checked", true);
                        break;

                    case "AllowOnlyZoneNameServers":
                        $("#rdDynamicUpdateAllowOnlyZoneNameServers").prop("checked", true);
                        break;

                    case "AllowOnlySpecifiedIpAddresses":
                        $("#rdDynamicUpdateAllowOnlySpecifiedIpAddresses").prop("checked", true);
                        $("#txtDynamicUpdateIpAddresses").prop("disabled", false);
                        break;

                    case "AllowBothZoneNameServersAndSpecifiedIpAddresses":
                        $("#rdDynamicUpdateAllowBothZoneNameServersAndSpecifiedIpAddresses").prop("checked", true);
                        $("#txtDynamicUpdateIpAddresses").prop("disabled", false);
                        break;

                    case "Deny":
                    default:
                        $("#rdDynamicUpdateDeny").prop("checked", true);
                        break;
                }

                {
                    var value = "";

                    for (var i = 0; i < responseJSON.response.updateIpAddresses.length; i++)
                        value += responseJSON.response.updateIpAddresses[i] + "\r\n";

                    $("#txtDynamicUpdateIpAddresses").val(value);
                }

                {
                    $("#tbodyDynamicUpdateSecurityPolicy").html("");
                    zoneOptionsAvailableTsigKeyNames = responseJSON.response.availableTsigKeyNames;

                    if (responseJSON.response.updateSecurityPolicies != null) {
                        for (var i = 0; i < responseJSON.response.updateSecurityPolicies.length; i++)
                            addZoneOptionsDynamicUpdatesSecurityPolicyRow(i, responseJSON.response.updateSecurityPolicies[i].tsigKeyName, responseJSON.response.updateSecurityPolicies[i].domain, responseJSON.response.updateSecurityPolicies[i].allowedTypes);
                    }
                }

                $("#tabListZoneOptionsUpdate").show();
            }
            else {
                $("#tabListZoneOptionsUpdate").hide();
                $("#rdDynamicUpdateDeny").prop("checked", true);
                $("#txtDynamicUpdateIpAddresses").val("");
                $("#tbodyDynamicUpdateSecurityPolicy").html("");
            }

            $("#tabListZoneOptionsZoneTranfer").addClass("active");
            $("#tabPaneZoneOptionsZoneTransfer").addClass("active");
            $("#tabListZoneOptionsNotify").removeClass("active");
            $("#tabPaneZoneOptionsNotify").removeClass("active");
            $("#tabListZoneOptionsUpdate").removeClass("active");
            $("#tabPaneZoneOptionsUpdate").removeClass("active");

            divZoneOptionsLoader.hide();
            divZoneOptions.show();
        },
        error: function () {
            divZoneOptionsLoader.hide();
        },
        invalidToken: function () {
            $("#modalZoneOptions").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divZoneOptionsAlert,
        objLoaderPlaceholder: divZoneOptionsLoader
    });
}

function saveZoneOptions() {
    var divZoneOptionsAlert = $("#divZoneOptionsAlert");
    var divZoneOptionsLoader = $("#divZoneOptionsLoader");
    var zone = $("#lblZoneOptionsZoneName").attr("data-zone");

    //zone transfer
    var zoneTransfer = $("input[name=rdZoneTransfer]:checked").val();

    var zoneTransferNameServers = cleanTextList($("#txtZoneTransferNameServers").val());

    if ((zoneTransferNameServers.length === 0) || (zoneTransferNameServers === ","))
        zoneTransferNameServers = false;
    else
        $("#txtZoneTransferNameServers").val(zoneTransferNameServers.replace(/,/g, "\n"));

    var zoneTransferTsigKeyNames = cleanTextList($("#txtZoneOptionsZoneTransferTsigKeyNames").val());

    if ((zoneTransferTsigKeyNames.length === 0) || (zoneTransferTsigKeyNames === ","))
        zoneTransferTsigKeyNames = false;
    else
        $("#txtZoneOptionsZoneTransferTsigKeyNames").val(zoneTransferTsigKeyNames.replace(/,/g, "\n"));

    //notify
    var notify = $("input[name=rdZoneNotify]:checked").val();

    var notifyNameServers = cleanTextList($("#txtZoneNotifyNameServers").val());

    if ((notifyNameServers.length === 0) || (notifyNameServers === ","))
        notifyNameServers = false;
    else
        $("#txtZoneNotifyNameServers").val(notifyNameServers.replace(/,/g, "\n"));

    //dynamic update
    var update = $("input[name=rdDynamicUpdate]:checked").val();

    var updateIpAddresses = cleanTextList($("#txtDynamicUpdateIpAddresses").val());

    if ((updateIpAddresses.length === 0) || (updateIpAddresses === ","))
        updateIpAddresses = false;
    else
        $("#txtDynamicUpdateIpAddresses").val(updateIpAddresses.replace(/,/g, "\n"));

    var updateSecurityPolicies = serializeTableData($("#tableDynamicUpdateSecurityPolicy"), 3, divZoneOptionsAlert);
    if (updateSecurityPolicies === false)
        return;

    if (updateSecurityPolicies.length === 0)
        updateSecurityPolicies = false;

    var btn = $("#btnSaveZoneOptions");
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/options/set?token=" + sessionData.token + "&zone=" + zone
            + "&zoneTransfer=" + zoneTransfer + "&zoneTransferNameServers=" + encodeURIComponent(zoneTransferNameServers) + "&zoneTransferTsigKeyNames=" + encodeURIComponent(zoneTransferTsigKeyNames)
            + "&notify=" + notify + "&notifyNameServers=" + encodeURIComponent(notifyNameServers)
            + "&update=" + update + "&updateIpAddresses=" + encodeURIComponent(updateIpAddresses) + "&updateSecurityPolicies=" + encodeURIComponent(updateSecurityPolicies),
        success: function (responseJSON) {
            btn.button("reset");
            $("#modalZoneOptions").modal("hide");

            showAlert("success", "Options Saved!", "Zone options were saved successfully.");
        },
        error: function () {
            btn.button("reset");
            divZoneOptionsLoader.hide();
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalZoneOptions").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divZoneOptionsAlert,
        objLoaderPlaceholder: divZoneOptionsLoader
    });
}

function showZonePermissionsModal(zone) {
    var divEditPermissionsAlert = $("#divEditPermissionsAlert");
    var divEditPermissionsLoader = $("#divEditPermissionsLoader");
    var divEditPermissionsViewer = $("#divEditPermissionsViewer");

    $("#lblEditPermissionsName").text("Zones / " + (zone === "." ? "<root>" : zone));
    $("#tbodyEditPermissionsUser").html("");
    $("#tbodyEditPermissionsGroup").html("");

    divEditPermissionsLoader.show();
    divEditPermissionsViewer.hide();

    var btnEditPermissionsSave = $("#btnEditPermissionsSave");
    btnEditPermissionsSave.attr("onclick", "saveZonePermissions(this); return false;");
    btnEditPermissionsSave.show();

    var modalEditPermissions = $("#modalEditPermissions");
    modalEditPermissions.modal("show");

    HTTPRequest({
        url: "/api/zones/permissions/get?token=" + sessionData.token + "&zone=" + htmlEncode(zone) + "&includeUsersAndGroups=true",
        success: function (responseJSON) {
            $("#lblEditPermissionsName").text(responseJSON.response.section + " / " + (responseJSON.response.subItem == "." ? "<root>" : responseJSON.response.subItem));

            //user permissions
            for (var i = 0; i < responseJSON.response.userPermissions.length; i++) {
                addEditPermissionUserRow(i, responseJSON.response.userPermissions[i].username, responseJSON.response.userPermissions[i].canView, responseJSON.response.userPermissions[i].canModify, responseJSON.response.userPermissions[i].canDelete);
            }

            //load users list
            var userListHtml = "<option value=\"blank\" selected></option><option value=\"none\">None</option>";

            for (var i = 0; i < responseJSON.response.users.length; i++) {
                userListHtml += "<option>" + htmlEncode(responseJSON.response.users[i]) + "</option>";
            }

            $("#optEditPermissionsUserList").html(userListHtml);

            //group permissions
            for (var i = 0; i < responseJSON.response.groupPermissions.length; i++) {
                addEditPermissionGroupRow(i, responseJSON.response.groupPermissions[i].name, responseJSON.response.groupPermissions[i].canView, responseJSON.response.groupPermissions[i].canModify, responseJSON.response.groupPermissions[i].canDelete);
            }

            //load groups list
            var groupListHtml = "<option value=\"blank\" selected></option><option value=\"none\">None</option>";

            for (var i = 0; i < responseJSON.response.groups.length; i++) {
                groupListHtml += "<option>" + htmlEncode(responseJSON.response.groups[i]) + "</option>";
            }

            $("#optEditPermissionsGroupList").html(groupListHtml);

            btnEditPermissionsSave.attr("data-zone", responseJSON.response.subItem);

            divEditPermissionsLoader.hide();
            divEditPermissionsViewer.show();
        },
        error: function () {
            divEditPermissionsLoader.hide();
        },
        invalidToken: function () {
            modalEditPermissions.modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divEditPermissionsAlert,
        objLoaderPlaceholder: divEditPermissionsLoader
    });
}

function saveZonePermissions(objBtn) {
    var btn = $(objBtn);
    var divEditPermissionsAlert = $("#divEditPermissionsAlert");

    var zone = btn.attr("data-zone");

    var userPermissions = serializeTableData($("#tableEditPermissionsUser"), 4);
    var groupPermissions = serializeTableData($("#tableEditPermissionsGroup"), 4);

    var apiUrl = "/api/zones/permissions/set?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone) + "&userPermissions=" + encodeURIComponent(userPermissions) + "&groupPermissions=" + encodeURIComponent(groupPermissions);

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            btn.button("reset");
            $("#modalEditPermissions").modal("hide");

            showAlert("success", "Permissions Saved!", "Zone permissions were saved successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalEditPermissions").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divEditPermissionsAlert
    });
}

function resyncZoneMenu(objMenuItem) {
    var mnuItem = $(objMenuItem);

    var id = mnuItem.attr("data-id");
    var zone = mnuItem.attr("data-zone");
    var zoneType = mnuItem.attr("data-zone-type");

    if (zoneType == "Secondary") {
        if (!confirm("The resync action will perform a full zone transfer (AXFR). You will need to check the logs to confirm if the resync action was successful.\r\n\r\nAre you sure you want to resync the '" + zone + "' zone?"))
            return;
    }
    else {
        if (!confirm("The resync action will perform a full zone refresh. You will need to check the logs to confirm if the resync action was successful.\r\n\r\nAre you sure you want to resync the '" + zone + "' zone?"))
            return;
    }

    var btn = $("#btnZoneRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/resync?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);

            showAlert("success", "Resync Triggered!", "Zone '" + zone + "' resync was triggered successfully. Please check the Logs for confirmation.");
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function resyncZone(objBtn, zone) {
    if ($("#titleEditZoneType").text() == "Secondary") {
        if (!confirm("The resync action will perform a full zone transfer (AXFR). You will need to check the logs to confirm if the resync action was successful.\r\n\r\nAre you sure you want to resync the '" + zone + "' zone?"))
            return;
    }
    else {
        if (!confirm("The resync action will perform a full zone refresh. You will need to check the logs to confirm if the resync action was successful.\r\n\r\nAre you sure you want to resync the '" + zone + "' zone?"))
            return;
    }

    var btn = $(objBtn);
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/resync?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            btn.button("reset");
            showAlert("success", "Resync Triggered!", "Zone '" + zone + "' resync was triggered successfully. Please check the Logs for confirmation.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            showPageLogin();
        }
    });
}

function showAddZoneModal() {
    $("#divAddZoneAlert").html("");

    $("#txtAddZone").val("");
    $("#rdAddZoneTypePrimary").prop("checked", true);
    $("#txtAddZonePrimaryNameServerAddresses").val("");
    $("#rdAddZoneZoneTransferProtocolTcp").prop("checked", true);
    $("#optAddZoneTsigKeyName").val("");
    $("input[name=rdAddZoneForwarderProtocol]:radio").attr("disabled", false);
    $("#rdAddZoneForwarderProtocolUdp").prop("checked", true);
    $("#chkAddZoneForwarderThisServer").prop("checked", false);
    $("#txtAddZoneForwarder").prop("disabled", false);
    $("#txtAddZoneForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")
    $("#txtAddZoneForwarder").val("");
    $("#chkAddZoneForwarderDnssecValidation").prop("checked", $("#chkDnssecValidation").prop("checked"));
    $("#rdAddZoneForwarderProxyTypeNone").prop("checked", true);
    $("#txtAddZoneForwarderProxyAddress").prop("disabled", true);
    $("#txtAddZoneForwarderProxyPort").prop("disabled", true);
    $("#txtAddZoneForwarderProxyUsername").prop("disabled", true);
    $("#txtAddZoneForwarderProxyPassword").prop("disabled", true);
    $("#txtAddZoneForwarderProxyAddress").val("");
    $("#txtAddZoneForwarderProxyPort").val("");
    $("#txtAddZoneForwarderProxyUsername").val("");
    $("#txtAddZoneForwarderProxyPassword").val("");

    $("#divAddZonePrimaryNameServerAddresses").hide();
    $("#divAddZoneZoneTransferProtocol").hide();
    $("#divAddZoneTsigKeyName").hide();
    $("#divAddZoneForwarderProtocol").hide();
    $("#divAddZoneForwarder").hide();
    $("#divAddZoneForwarderDnssecValidation").hide();
    $("#divAddZoneForwarderProxy").hide();

    $("#btnAddZone").button('reset');

    $("#modalAddZone").modal("show");

    setTimeout(function () {
        $("#txtAddZone").focus();
    }, 1000);
}

function loadTsigKeyNames(jqDropDown, currentValue, divAlertPlaceholder) {
    jqDropDown.prop("disabled", true);

    if (currentValue == null)
        currentValue = "";

    if (currentValue.length == 0) {
        jqDropDown.html("<option selected></option>");
    }
    else {
        jqDropDown.html("<option></option><option selected>" + htmlEncode(currentValue) + "</option>");
        jqDropDown.val(currentValue);
    }

    HTTPRequest({
        url: "/api/settings/getTsigKeyNames?token=" + sessionData.token,
        success: function (responseJSON) {
            var optionsHtml;

            if (currentValue.length == 0)
                optionsHtml = "<option selected></option>";
            else
                optionsHtml = "<option></option>";

            for (var i = 0; i < responseJSON.response.tsigKeyNames.length; i++) {
                optionsHtml += "<option" + (responseJSON.response.tsigKeyNames[i] === currentValue ? " selected" : "") + ">" + htmlEncode(responseJSON.response.tsigKeyNames[i]) + "</option>";
            }

            jqDropDown.html(optionsHtml);
            jqDropDown.prop("disabled", false);
        },
        error: function () {
            jqDropDown.prop("disabled", false);
        },
        invalidToken: function () {
            jqDropDown.prop("disabled", false);
            showPageLogin();
        },
        objAlertPlaceholder: divAlertPlaceholder
    });
}

function updateAddZoneFormForwarderThisServer() {
    var useThisServer = $("#chkAddZoneForwarderThisServer").prop('checked');

    if (useThisServer) {
        $("input[name=rdAddZoneForwarderProtocol]:radio").attr("disabled", true);
        $("#rdAddZoneForwarderProtocolUdp").prop("checked", true);
        $("#txtAddZoneForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")

        $("#txtAddZoneForwarder").prop("disabled", true);
        $("#txtAddZoneForwarder").val("this-server");

        $("#divAddZoneForwarderProxy").hide();
    }
    else {
        $("input[name=rdAddZoneForwarderProtocol]:radio").attr("disabled", false);

        $("#txtAddZoneForwarder").prop("disabled", false);
        $("#txtAddZoneForwarder").val("");

        $("#divAddZoneForwarderProxy").show();
    }
}

function addZone() {
    var divAddZoneAlert = $("#divAddZoneAlert");
    var zone = $("#txtAddZone").val();

    if ((zone == null) || (zone === "")) {
        showAlert("warning", "Missing!", "Please enter a domain name to add zone.", divAddZoneAlert);
        $("#txtAddZone").focus();
        return;
    }

    var type = $('input[name=rdAddZoneType]:checked').val();

    var parameters;

    switch (type) {
        case "Secondary":
            var tsigKeyName = $("#optAddZoneTsigKeyName").val();

            parameters = "&primaryNameServerAddresses=" + encodeURIComponent(cleanTextList($("#txtAddZonePrimaryNameServerAddresses").val()));
            parameters += "&zoneTransferProtocol=" + $("input[name=rdAddZoneZoneTransferProtocol]:checked").val();
            parameters += "&tsigKeyName=" + encodeURIComponent(tsigKeyName);
            break;

        case "Stub":
            parameters = "&primaryNameServerAddresses=" + encodeURIComponent(cleanTextList($("#txtAddZonePrimaryNameServerAddresses").val()));
            break;

        case "Forwarder":
            var forwarder = $("#txtAddZoneForwarder").val();
            if ((forwarder == null) || (forwarder === "")) {
                showAlert("warning", "Missing!", "Please enter a forwarder server name to add zone.", divAddZoneAlert);
                $("#txtAddZoneForwarder").focus();
                return;
            }

            var dnssecValidation = $("#chkAddZoneForwarderDnssecValidation").prop("checked");

            parameters = "&protocol=" + $("input[name=rdAddZoneForwarderProtocol]:checked").val() + "&forwarder=" + encodeURIComponent(forwarder) + "&dnssecValidation=" + dnssecValidation;

            if (forwarder !== "this-server") {
                var proxyType = $("input[name=rdAddZoneForwarderProxyType]:checked").val();

                parameters += "&proxyType=" + proxyType;

                if (proxyType != "None") {
                    var proxyAddress = $("#txtAddZoneForwarderProxyAddress").val();
                    var proxyPort = $("#txtAddZoneForwarderProxyPort").val();
                    var proxyUsername = $("#txtAddZoneForwarderProxyUsername").val();
                    var proxyPassword = $("#txtAddZoneForwarderProxyPassword").val();

                    if ((proxyAddress == null) || (proxyAddress === "")) {
                        showAlert("warning", "Missing!", "Please enter a domain name or IP address for Proxy Server Address to add zone.", divAddZoneAlert);
                        $("#txtAddZoneForwarderProxyAddress").focus();
                        return;
                    }

                    if ((proxyPort == null) || (proxyPort === "")) {
                        showAlert("warning", "Missing!", "Please enter a port number for Proxy Server Port to add zone.", divAddZoneAlert);
                        $("#txtAddZoneForwarderProxyPort").focus();
                        return;
                    }

                    parameters += "&proxyAddress=" + encodeURIComponent(proxyAddress) + "&proxyPort=" + proxyPort + "&proxyUsername=" + encodeURIComponent(proxyUsername) + "&proxyPassword=" + encodeURIComponent(proxyPassword);
                }
            }
            break;

        default:
            parameters = "";
            break;
    }

    var btn = $("#btnAddZone").button('loading');

    HTTPRequest({
        url: "/api/zones/create?token=" + sessionData.token + "&zone=" + zone + "&type=" + type + parameters,
        success: function (responseJSON) {
            $("#modalAddZone").modal("hide");
            showEditZone(responseJSON.response.domain);

            showAlert("success", "Zone Added!", "Zone was added successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            $("#modalAddZone").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divAddZoneAlert
    });
}

function toggleHideDnssecRecords(hideDnssecRecords) {
    localStorage.setItem("zoneHideDnssecRecords", hideDnssecRecords);
    showEditZone($("#titleEditZone").attr("data-zone"));
}

function showEditZone(zone, showPageNumber) {
    if (zone == null) {
        zone = $("#txtZonesEdit").val();
        if (zone === "") {
            showAlert("warning", "Missing!", "Please enter a zone name to start editing.");
            $("#txtZonesEdit").focus();
            return;
        }
    }

    if (showPageNumber == null)
        showPageNumber = 1;

    var divViewZonesLoader = $("#divViewZonesLoader");
    var divViewZones = $("#divViewZones");
    var divEditZone = $("#divEditZone");

    divViewZones.hide();
    divEditZone.hide();
    divViewZonesLoader.show();

    HTTPRequest({
        url: "/api/zones/records/get?token=" + sessionData.token + "&domain=" + zone + "&zone=" + zone + "&listZone=true",
        success: function (responseJSON) {
            zone = responseJSON.response.zone.name;
            if (zone === "")
                zone = ".";

            var zoneType;
            if (responseJSON.response.zone.internal)
                zoneType = "Internal";
            else
                zoneType = responseJSON.response.zone.type;

            switch (responseJSON.response.zone.dnssecStatus) {
                case "SignedWithNSEC":
                case "SignedWithNSEC3":
                    $("#titleDnssecStatusEditZone").show();
                    break;

                default:
                    $("#titleDnssecStatusEditZone").hide();
                    break;
            }

            var status;
            if (responseJSON.response.zone.disabled)
                status = "Disabled";
            else if (responseJSON.response.zone.isExpired)
                status = "Expired";
            else if (responseJSON.response.zone.syncFailed)
                status = "Sync Failed";
            else if (responseJSON.response.zone.notifyFailed)
                status = "Notify Failed";
            else
                status = "Enabled";

            var expiry = responseJSON.response.zone.expiry;
            if (expiry == null)
                expiry = "&nbsp;";
            else
                expiry = "Expiry: " + moment(expiry).local().format("YYYY-MM-DD HH:mm:ss");

            $("#titleEditZoneType").html(zoneType);
            $("#titleStatusEditZone").html(status);
            $("#titleEditZoneExpiry").html(expiry);

            if (responseJSON.response.zone.internal)
                $("#titleEditZoneType").attr("class", "label label-default");
            else
                $("#titleEditZoneType").attr("class", "label label-primary");

            switch (status) {
                case "Disabled":
                case "Sync Failed":
                case "Notify Failed":
                    $("#titleStatusEditZone").attr("class", "label label-warning");
                    break;

                case "Expired":
                    $("#titleStatusEditZone").attr("class", "label label-danger");
                    break;

                case "Enabled":
                    $("#titleStatusEditZone").attr("class", "label label-success");
                    break;
            }

            switch (zoneType) {
                case "Internal":
                case "Secondary":
                case "Stub":
                    $("#btnEditZoneAddRecord").hide();
                    break;

                case "Forwarder":
                    $("#btnEditZoneAddRecord").show();
                    $("#optAddEditRecordTypeDs").hide();
                    $("#optAddEditRecordTypeSshfp").hide();
                    $("#optAddEditRecordTypeTlsa").hide();
                    $("#optAddEditRecordTypeAName").show();
                    $("#optAddEditRecordTypeFwd").show();
                    $("#optAddEditRecordTypeApp").show();
                    break;

                case "Primary":
                    $("#btnEditZoneAddRecord").show();
                    $("#optAddEditRecordTypeFwd").hide();

                    switch (responseJSON.response.zone.dnssecStatus) {
                        case "SignedWithNSEC":
                        case "SignedWithNSEC3":
                            $("#optAddEditRecordTypeDs").show();
                            $("#optAddEditRecordTypeSshfp").show();
                            $("#optAddEditRecordTypeTlsa").show();
                            $("#optAddEditRecordTypeAName").hide();
                            $("#optAddEditRecordTypeApp").hide();
                            break;

                        default:
                            $("#optAddEditRecordTypeDs").hide();
                            $("#optAddEditRecordTypeSshfp").hide();
                            $("#optAddEditRecordTypeTlsa").hide();
                            $("#optAddEditRecordTypeAName").show();
                            $("#optAddEditRecordTypeApp").show();
                            break;
                    }
                    break;
            }

            if (responseJSON.response.zone.internal) {
                $("#btnEnableZoneEditZone").hide();
                $("#btnDisableZoneEditZone").hide();
                $("#btnEditZoneDeleteZone").hide();
            }
            else if (responseJSON.response.zone.disabled) {
                $("#btnEnableZoneEditZone").show();
                $("#btnDisableZoneEditZone").hide();
                $("#btnEditZoneDeleteZone").show();
            }
            else {
                $("#btnEnableZoneEditZone").hide();
                $("#btnDisableZoneEditZone").show();
                $("#btnEditZoneDeleteZone").show();
            }

            switch (zoneType) {
                case "Secondary":
                case "Stub":
                    $("#btnZoneResync").show();
                    break;

                default:
                    $("#btnZoneResync").hide();
                    break;
            }

            switch (zoneType) {
                case "Primary":
                case "Secondary":
                case "Forwarder":
                    $("#divZoneOptions").show();
                    break;

                default:
                    $("#divZoneOptions").hide();
                    break;
            }

            switch (zoneType) {
                case "Primary":
                case "Secondary":
                case "Forwarder":
                    $("#lnkZoneConvert").show();
                    break;

                default:
                    $("#lnkZoneConvert").hide();
                    break;
            }

            switch (zoneType) {
                case "Primary":
                case "Secondary":
                    $("#lnkZoneOptions").show();
                    break;

                default:
                    $("#lnkZoneOptions").hide();
                    break;
            }

            switch (zoneType) {
                case "Primary":
                case "Secondary":
                case "Stub":
                case "Forwarder":
                    $("#btnZonePermissions").show();
                    break;

                default:
                    $("#btnZonePermissions").hide();
                    break;
            }

            var zoneHideDnssecRecords = (localStorage.getItem("zoneHideDnssecRecords") == "true");

            switch (zoneType) {
                case "Primary":
                    $("#divZoneDnssecOptions").show();

                    switch (responseJSON.response.zone.dnssecStatus) {
                        case "SignedWithNSEC":
                        case "SignedWithNSEC3":
                            $("#lnkZoneDnssecSignZone").hide();

                            if (zoneHideDnssecRecords) {
                                $("#lnkZoneDnssecHideRecords").hide();
                                $("#lnkZoneDnssecShowRecords").show();
                            }
                            else {
                                $("#lnkZoneDnssecHideRecords").show();
                                $("#lnkZoneDnssecShowRecords").hide();
                            }

                            $("#lnkZoneDnssecProperties").show();
                            $("#lnkZoneDnssecUnsignZone").show();
                            break;

                        default:
                            $("#lnkZoneDnssecSignZone").show();
                            $("#lnkZoneDnssecHideRecords").hide();
                            $("#lnkZoneDnssecShowRecords").hide();
                            $("#lnkZoneDnssecProperties").hide();
                            $("#lnkZoneDnssecUnsignZone").hide();
                            break;
                    }
                    break;

                case "Secondary":
                    switch (responseJSON.response.zone.dnssecStatus) {
                        case "SignedWithNSEC":
                        case "SignedWithNSEC3":
                            $("#divZoneDnssecOptions").show();

                            $("#lnkZoneDnssecSignZone").hide();

                            if (zoneHideDnssecRecords) {
                                $("#lnkZoneDnssecHideRecords").hide();
                                $("#lnkZoneDnssecShowRecords").show();
                            }
                            else {
                                $("#lnkZoneDnssecHideRecords").show();
                                $("#lnkZoneDnssecShowRecords").hide();
                            }

                            $("#lnkZoneDnssecProperties").hide();
                            $("#lnkZoneDnssecUnsignZone").hide();
                            break;

                        default:
                            $("#divZoneDnssecOptions").hide();
                            break;
                    }
                    break;

                default:
                    $("#divZoneDnssecOptions").hide();
                    break;
            }

            editZoneInfo = responseJSON.response.zone;

            if (!zoneHideDnssecRecords || (responseJSON.response.zone.dnssecStatus === "Unsigned")) {
                editZoneRecords = responseJSON.response.records;
            }
            else {
                var records = responseJSON.response.records;
                editZoneRecords = [];

                for (var i = 0; i < records.length; i++) {
                    switch (records[i].type.toUpperCase()) {
                        case "RRSIG":
                        case "NSEC":
                        case "DNSKEY":
                        case "NSEC3":
                        case "NSEC3PARAM":
                            continue;

                        default:
                            editZoneRecords.push(records[i]);
                            break;
                    }
                }
            }

            if (responseJSON.response.zone.nameIdn == null)
                $("#titleEditZone").text(zone === "." ? "<root>" : zone);
            else
                $("#titleEditZone").text(responseJSON.response.zone.nameIdn + " (" + zone + ")");

            $("#titleEditZone").attr("data-zone", zone);
            $("#titleEditZone").attr("data-zone-type", zoneType);

            showEditZonePage(showPageNumber);

            divViewZonesLoader.hide();
            divEditZone.show();
        },
        error: function () {
            divViewZonesLoader.hide();
            divViewZones.show();
        },
        invalidToken: function () {
            showPageLogin();
        },
        objLoaderPlaceholder: divViewZonesLoader
    });
}

function showEditZonePage(pageNumber) {
    if (pageNumber == null)
        pageNumber = Number($("#txtEditZonePageNumber").val());

    if (pageNumber == 0)
        pageNumber = 1;

    var recordsPerPage = Number($("#optEditZoneRecordsPerPage").val());
    if (recordsPerPage < 1)
        recordsPerPage = 10;

    var totalRecords = editZoneRecords.length;
    var totalPages = Math.floor(totalRecords / recordsPerPage) + (totalRecords % recordsPerPage > 0 ? 1 : 0);

    if ((pageNumber > totalPages) || (pageNumber < 0))
        pageNumber = totalPages;

    if (pageNumber < 1)
        pageNumber = 1;

    var start = (pageNumber - 1) * recordsPerPage;
    var end = Math.min(start + recordsPerPage, totalRecords);

    var tableHtmlRows = "";
    var zone = $("#titleEditZone").attr("data-zone");
    var zoneType = $("#titleEditZone").attr("data-zone-type");

    for (var i = start; i < end; i++)
        tableHtmlRows += getZoneRecordRowHtml(i, zone, zoneType, editZoneRecords[i]);

    var paginationHtml = "";

    if (pageNumber > 1) {
        paginationHtml += "<li><a href=\"#\" aria-label=\"First\" onClick=\"showEditZonePage(1); return false;\"><span aria-hidden=\"true\">&laquo;</span></a></li>";
        paginationHtml += "<li><a href=\"#\" aria-label=\"Previous\" onClick=\"showEditZonePage(" + (pageNumber - 1) + "); return false;\"><span aria-hidden=\"true\">&lsaquo;</span></a></li>";
    }

    var pageStart = pageNumber - 5;
    if (pageStart < 1)
        pageStart = 1;

    var pageEnd = pageStart + 9;
    if (pageEnd > totalPages) {
        var endDiff = pageEnd - totalPages;
        pageEnd = totalPages;

        pageStart -= endDiff;
        if (pageStart < 1)
            pageStart = 1;
    }

    for (var i = pageStart; i <= pageEnd; i++) {
        if (i == pageNumber)
            paginationHtml += "<li class=\"active\"><a href=\"#\" onClick=\"showEditZonePage(" + i + "); return false;\">" + i + "</a></li>";
        else
            paginationHtml += "<li><a href=\"#\" onClick=\"showEditZonePage(" + i + "); return false;\">" + i + "</a></li>";
    }

    if (pageNumber < totalPages) {
        paginationHtml += "<li><a href=\"#\" aria-label=\"Next\" onClick=\"showEditZonePage(" + (pageNumber + 1) + "); return false;\"><span aria-hidden=\"true\">&rsaquo;</span></a></li>";
        paginationHtml += "<li><a href=\"#\" aria-label=\"Last\" onClick=\"showEditZonePage(-1); return false;\"><span aria-hidden=\"true\">&raquo;</span></a></li>";
    }

    var statusHtml;

    if (editZoneRecords.length > 0)
        statusHtml = (start + 1) + "-" + end + " (" + (end - start) + ") of " + editZoneRecords.length + " records (page " + pageNumber + " of " + totalPages + ")";
    else
        statusHtml = "0 records";

    $("#txtEditZonePageNumber").val(pageNumber);
    $("#tableEditZoneBody").html(tableHtmlRows);

    $("#tableEditZoneTopStatus").html(statusHtml);
    $("#tableEditZoneTopPagination").html(paginationHtml);

    $("#tableEditZoneFooterStatus").html(statusHtml);
    $("#tableEditZoneFooterPagination").html(paginationHtml);
}

function getZoneRecordRowHtml(index, zone, zoneType, record) {
    var name = record.name.toLowerCase();
    if (name === "")
        name = ".";

    if (name === zone)
        name = "@";
    else
        name = name.replace("." + zone, "");

    var tableHtmlRow = "<tr id=\"trZoneRecord" + index + "\"><td>" + (index + 1) + "</td><td>" + htmlEncode(name) + "</td>";
    tableHtmlRow += "<td>" + record.type + "</td>";
    tableHtmlRow += "<td>" + record.ttl + "</td>";

    var lastUsedOn;

    if (record.lastUsedOn == "0001-01-01T00:00:00")
        lastUsedOn = moment(record.lastUsedOn).local().format("YYYY-MM-DD HH:mm:ss") + " (never)";
    else
        lastUsedOn = moment(record.lastUsedOn).local().format("YYYY-MM-DD HH:mm:ss") + " (" + moment(record.lastUsedOn).fromNow() + ")";

    var additionalDataAttributes = "";

    switch (record.type.toUpperCase()) {
        case "A":
        case "AAAA":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.ipAddress);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-ip-address=\"" + htmlEncode(record.rData.ipAddress) + "\" ";
            break;

        case "NS":
            var notifyFailed = false;

            if (editZoneInfo.notifyFailedFor != null) {
                for (var i = 0; i < editZoneInfo.notifyFailedFor.length; i++) {
                    if (editZoneInfo.notifyFailedFor[i] == record.rData.nameServer) {
                        notifyFailed = true;
                        break;
                    }
                }
            }

            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Name Server:</b> " + htmlEncode(record.rData.nameServer);

            if (notifyFailed)
                tableHtmlRow += "<span class=\"label label-warning\" style=\"margin-left: 8px;\">Notify Failed</span>";

            if (record.glueRecords != null) {
                var glue = null;

                for (var i = 0; i < record.glueRecords.length; i++) {
                    if (i == 0)
                        glue = record.glueRecords[i];
                    else
                        glue += ", " + record.glueRecords[i];
                }

                tableHtmlRow += "<br /><b>Glue Addresses:</b> " + glue;

                additionalDataAttributes = "data-record-glue=\"" + htmlEncode(glue) + "\" ";
            } else {
                additionalDataAttributes = "data-record-glue=\"\" ";
            }

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes += "data-record-name-server=\"" + htmlEncode(record.rData.nameServer) + "\" ";
            break;

        case "CNAME":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.cname);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-cname=\"" + htmlEncode(record.rData.cname) + "\" ";
            break;

        case "SOA":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Primary Name Server:</b> " + htmlEncode(record.rData.primaryNameServer) +
                "<br /><b>Responsible Person:</b> " + htmlEncode(record.rData.responsiblePerson) +
                "<br /><b>Serial:</b> " + htmlEncode(record.rData.serial) +
                "<br /><b>Refresh:</b> " + htmlEncode(record.rData.refresh) +
                "<br /><b>Retry:</b> " + htmlEncode(record.rData.retry) +
                "<br /><b>Expire:</b> " + htmlEncode(record.rData.expire) +
                "<br /><b>Minimum:</b> " + htmlEncode(record.rData.minimum);

            if (record.rData.useSerialDateScheme != null) {
                tableHtmlRow += "<br /><br /><b>Use Serial Date Scheme:</b> " + record.rData.useSerialDateScheme;

                additionalDataAttributes = "data-record-serial-scheme=\"" + htmlEncode(record.rData.useSerialDateScheme) + "\" ";
            }
            else {
                additionalDataAttributes = "data-record-serial-scheme=\"false\" ";
            }

            if (record.rData.primaryAddresses != null) {
                tableHtmlRow += "<br /><br /><b>Primary Name Server Addresses:</b> " + record.rData.primaryAddresses;

                additionalDataAttributes += "data-record-paddresses=\"" + htmlEncode(record.rData.primaryAddresses) + "\" ";
            } else {
                additionalDataAttributes += "data-record-paddresses=\"\" ";
            }

            if (record.rData.zoneTransferProtocol != null) {
                tableHtmlRow += "<br /><b>Zone Transfer Protocol:</b> XFR-over-" + record.rData.zoneTransferProtocol.toUpperCase();

                additionalDataAttributes += "data-record-zonetransferprotocol=\"" + htmlEncode(record.rData.zoneTransferProtocol) + "\" ";
            } else {
                additionalDataAttributes += "data-record-zonetransferprotocol=\"\" ";
            }

            if (record.rData.tsigKeyName != null) {
                tableHtmlRow += "<br /><b>TSIG Key Name:</b> " + record.rData.tsigKeyName;

                additionalDataAttributes += "data-record-tsigkeyname=\"" + htmlEncode(record.rData.tsigKeyName) + "\" ";
            } else {
                additionalDataAttributes += "data-record-tsigkeyname=\"\" ";
            }

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes += "data-record-pname=\"" + htmlEncode(record.rData.primaryNameServer) + "\" " +
                "data-record-rperson=\"" + htmlEncode(record.rData.responsiblePerson) + "\" " +
                "data-record-serial=\"" + htmlEncode(record.rData.serial) + "\" " +
                "data-record-refresh=\"" + htmlEncode(record.rData.refresh) + "\" " +
                "data-record-retry=\"" + htmlEncode(record.rData.retry) + "\" " +
                "data-record-expire=\"" + htmlEncode(record.rData.expire) + "\" " +
                "data-record-minimum=\"" + htmlEncode(record.rData.minimum) + "\" ";
            break;

        case "PTR":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.ptrName);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-ptr-name=\"" + htmlEncode(record.rData.ptrName) + "\" ";
            break;

        case "MX":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Preference: </b> " + htmlEncode(record.rData.preference) +
                "<br /><b>Exchange:</b> " + htmlEncode(record.rData.exchange);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-preference=\"" + htmlEncode(record.rData.preference) + "\" " +
                "data-record-exchange=\"" + htmlEncode(record.rData.exchange) + "\" ";
            break;

        case "TXT":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.text);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-text=\"" + htmlEncode(record.rData.text) + "\" ";
            break;

        case "SRV":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Priority: </b> " + htmlEncode(record.rData.priority) +
                "<br /><b>Weight:</b> " + htmlEncode(record.rData.weight) +
                "<br /><b>Port:</b> " + htmlEncode(record.rData.port) +
                "<br /><b>Target:</b> " + htmlEncode(record.rData.target);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-priority=\"" + htmlEncode(record.rData.priority) + "\" " +
                "data-record-weight=\"" + htmlEncode(record.rData.weight) + "\" " +
                "data-record-port=\"" + htmlEncode(record.rData.port) + "\" " +
                "data-record-target=\"" + htmlEncode(record.rData.target) + "\" ";
            break;

        case "DNAME":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.dname);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-dname=\"" + htmlEncode(record.rData.dname) + "\" ";
            break;

        case "DS":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Key Tag: </b> " + htmlEncode(record.rData.keyTag) +
                "<br /><b>Algorithm:</b> " + htmlEncode(record.rData.algorithm) +
                "<br /><b>Digest Type:</b> " + htmlEncode(record.rData.digestType) +
                "<br /><b>Digest:</b> " + htmlEncode(record.rData.digest);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-key-tag=\"" + htmlEncode(record.rData.keyTag) + "\" " +
                "data-record-algorithm=\"" + htmlEncode(record.rData.algorithm) + "\" " +
                "data-record-digest-type=\"" + htmlEncode(record.rData.digestType) + "\" " +
                "data-record-digest=\"" + htmlEncode(record.rData.digest) + "\" ";
            break;

        case "SSHFP":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Algorithm:</b> " + htmlEncode(record.rData.algorithm) +
                "<br /><b>Fingerprint Type:</b> " + htmlEncode(record.rData.fingerprintType) +
                "<br /><b>Fingerprint:</b> " + htmlEncode(record.rData.fingerprint);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-algorithm=\"" + htmlEncode(record.rData.algorithm) + "\" " +
                "data-record-fingerprint-type=\"" + htmlEncode(record.rData.fingerprintType) + "\" " +
                "data-record-fingerprint=\"" + htmlEncode(record.rData.fingerprint) + "\" ";
            break;

        case "RRSIG":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Type Covered: </b> " + htmlEncode(record.rData.typeCovered) +
                "<br /><b>Algorithm:</b> " + htmlEncode(record.rData.algorithm) +
                "<br /><b>Labels:</b> " + htmlEncode(record.rData.labels) +
                "<br /><b>Original TTL:</b> " + htmlEncode(record.rData.originalTtl) +
                "<br /><b>Signature Expiration:</b> " + moment(record.rData.signatureExpiration).local().format("YYYY-MM-DD HH:mm:ss") +
                "<br /><b>Signature Inception:</b> " + moment(record.rData.signatureInception).local().format("YYYY-MM-DD HH:mm:ss") +
                "<br /><b>Key Tag:</b> " + htmlEncode(record.rData.keyTag) +
                "<br /><b>Signer's Name:</b> " + htmlEncode(record.rData.signersName) +
                "<br /><b>Signature:</b> " + htmlEncode(record.rData.signature);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "";
            break;

        case "NSEC":
            var nsecTypes = null;

            for (var j = 0; j < record.rData.types.length; j++) {
                if (nsecTypes == null)
                    nsecTypes = record.rData.types[j];
                else
                    nsecTypes += ", " + record.rData.types[j];
            }

            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Next Domain Name: </b> " + htmlEncode(record.rData.nextDomainName) +
                "<br /><b>Types:</b> " + htmlEncode(nsecTypes);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "";
            break;

        case "DNSKEY":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Flags: </b> " + htmlEncode(record.rData.flags) +
                "<br /><b>Protocol:</b> " + htmlEncode(record.rData.protocol) +
                "<br /><b>Algorithm:</b> " + htmlEncode(record.rData.algorithm) +
                "<br /><b>Public Key:</b> " + htmlEncode(record.rData.publicKey);

            if (record.rData.dnsKeyState == null) {
                tableHtmlRow += "<br />";
            }
            else {
                if (record.rData.dnsKeyStateReadyBy == null)
                    tableHtmlRow += "<br /><br /><b>Key State:</b> " + htmlEncode(record.rData.dnsKeyState);
                else
                    tableHtmlRow += "<br /><br /><b>Key State:</b> " + htmlEncode(record.rData.dnsKeyState) + " (ready by: " + moment(record.rData.dnsKeyStateReadyBy).local().format("YYYY-MM-DD HH:mm") + ")";
            }

            tableHtmlRow += "<br /><b>Computed Key Tag:</b> " + htmlEncode(record.rData.computedKeyTag);

            if (record.rData.computedDigests != null) {
                tableHtmlRow += "<br /><b>Computed Digests:</b> ";

                for (var j = 0; j < record.rData.computedDigests.length; j++) {
                    tableHtmlRow += "<br />" + htmlEncode(record.rData.computedDigests[j].digestType) + ": " + htmlEncode(record.rData.computedDigests[j].digest)
                }
            }

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "";
            break;

        case "NSEC3":
            var nsec3Types = null;

            for (var j = 0; j < record.rData.types.length; j++) {
                if (nsec3Types == null)
                    nsec3Types = record.rData.types[j];
                else
                    nsec3Types += ", " + record.rData.types[j];
            }

            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Hash Algorithm: </b> " + htmlEncode(record.rData.hashAlgorithm) +
                "<br /><b>Flags: </b> " + htmlEncode(record.rData.flags) +
                "<br /><b>Iterations: </b> " + htmlEncode(record.rData.iterations) +
                "<br /><b>Salt: </b>" + htmlEncode(record.rData.salt) +
                "<br /><b>Next Hashed Owner Name: </b> " + htmlEncode(record.rData.nextHashedOwnerName) +
                "<br /><b>Types:</b> " + htmlEncode(nsec3Types);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "";
            break;

        case "NSEC3PARAM":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Hash Algorithm: </b> " + htmlEncode(record.rData.hashAlgorithm) +
                "<br /><b>Flags: </b> " + htmlEncode(record.rData.flags) +
                "<br /><b>Iterations: </b> " + htmlEncode(record.rData.iterations) +
                "<br /><b>Salt: </b>" + htmlEncode(record.rData.salt);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "";
            break;

        case "TLSA":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Certificate Usage: </b> " + htmlEncode(record.rData.certificateUsage) +
                "<br /><b>Selector: </b> " + htmlEncode(record.rData.selector) +
                "<br /><b>Matching Type: </b> " + htmlEncode(record.rData.matchingType) +
                "<br /><b>Certificate Association Data:</b> " + (record.rData.certificateAssociationData == "" ? "<br />" : "<pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.rData.certificateAssociationData) + "</pre>");

            tableHtmlRow += "<br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-certificate-usage=\"" + htmlEncode(record.rData.certificateUsage) + "\" " +
                "data-record-selector=\"" + htmlEncode(record.rData.selector) + "\" " +
                "data-record-matching-type=\"" + htmlEncode(record.rData.matchingType) + "\" " +
                "data-record-certificate-association-data=\"" + htmlEncode(record.rData.certificateAssociationData) + "\" ";
            break;

        case "SVCB":
        case "HTTPS":
            var tableHtmlSvcParams;

            if (Object.keys(record.rData.svcParams).length == 0) {
                tableHtmlSvcParams = "<br />";
            }
            else {
                tableHtmlSvcParams = "<br /><b>Params: </b><table class=\"table table-condensed\" style=\"background: transparent; margin-bottom: 0px;\">" +
                    "<thead><tr>" +
                    "<th>Key</th>" +
                    "<th>Value</th>" +
                    "</thead>" +
                    "<tbody>";

                for (var paramKey in record.rData.svcParams) {
                    tableHtmlSvcParams += "<tr><td>" + htmlEncode(paramKey) + "</td><td>" + htmlEncode(record.rData.svcParams[paramKey]) + "</td></tr>";
                }

                tableHtmlSvcParams += "</tbody></table>";
            }

            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Priority: </b> " + htmlEncode(record.rData.svcPriority) + (record.rData.svcPriority == 0 ? " (alias mode)" : " (service mode)") +
                "<br /><b>Target Name: </b> " + (record.rData.svcTargetName == "" ? "." : htmlEncode(record.rData.svcTargetName)) +
                tableHtmlSvcParams;

            tableHtmlRow += "<br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-svc-priority=\"" + htmlEncode(record.rData.svcPriority) + "\"" +
                "data-record-svc-target-name=\"" + (record.rData.svcTargetName == "" ? "." : htmlEncode(record.rData.svcTargetName)) + "\"" +
                "data-record-svc-params=\"" + htmlEncode(JSON.stringify(record.rData.svcParams)) + "\"";
            break;

        case "URI":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Priority: </b> " + htmlEncode(record.rData.priority) +
                "<br /><b>Weight:</b> " + htmlEncode(record.rData.weight) +
                "<br /><b>URI:</b> " + htmlEncode(record.rData.uri);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-priority=\"" + htmlEncode(record.rData.priority) + "\" " +
                "data-record-weight=\"" + htmlEncode(record.rData.weight) + "\" " +
                "data-record-uri=\"" + htmlEncode(record.rData.uri) + "\" ";
            break;

        case "CAA":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Flags: </b> " + htmlEncode(record.rData.flags) +
                "<br /><b>Tag:</b> " + htmlEncode(record.rData.tag) +
                "<br /><b>Authority:</b> " + htmlEncode(record.rData.value);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-flags=\"" + htmlEncode(record.rData.flags) + "\" " +
                "data-record-tag=\"" + htmlEncode(record.rData.tag) + "\" " +
                "data-record-value=\"" + htmlEncode(record.rData.value) + "\" ";
            break;

        case "ANAME":
            tableHtmlRow += "<td style=\"word-break: break-all;\">" + htmlEncode(record.rData.aname);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-aname=\"" + htmlEncode(record.rData.aname) + "\" ";
            break;

        case "FWD":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>Protocol: </b> " + htmlEncode(record.rData.protocol) +
                "<br /><b>Forwarder:</b> " + htmlEncode(record.rData.forwarder) +
                "<br /><b>Enable DNSSEC Validation:</b> " + htmlEncode(record.rData.dnssecValidation) +
                "<br /><b>Proxy Type:</b> " + htmlEncode(record.rData.proxyType);

            if (record.rData.proxyType !== "None") {
                tableHtmlRow += "<br /><b>Proxy Address:</b> " + htmlEncode(record.rData.proxyAddress) +
                    "<br /><b>Proxy Port:</b> " + htmlEncode(record.rData.proxyPort) +
                    "<br /><b>Proxy Username:</b> " + htmlEncode(record.rData.proxyUsername) +
                    "<br /><b>Proxy Password:</b> ************";
            }

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-protocol=\"" + htmlEncode(record.rData.protocol) + "\" " +
                "data-record-forwarder=\"" + htmlEncode(record.rData.forwarder) + "\" " +
                "data-record-dnssec-validation=\"" + htmlEncode(record.rData.dnssecValidation) + "\" " +
                "data-record-proxy-type=\"" + htmlEncode(record.rData.proxyType) + "\" ";

            if (record.rData.proxyType != "None") {
                additionalDataAttributes += "data-record-proxy-address=\"" + htmlEncode(record.rData.proxyAddress) + "\" " +
                    "data-record-proxy-port=\"" + htmlEncode(record.rData.proxyPort) + "\" " +
                    "data-record-proxy-username=\"" + htmlEncode(record.rData.proxyUsername) + "\" " +
                    "data-record-proxy-password=\"" + htmlEncode(record.rData.proxyPassword) + "\" ";
            }
            break;

        case "APP":
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>App Name: </b> " + htmlEncode(record.rData.appName) +
                "<br /><b>Class Path:</b> " + htmlEncode(record.rData.classPath) +
                "<br /><b>Record Data:</b> " + (record.rData.data == "" ? "<br />" : "<pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.rData.data) + "</pre>");

            tableHtmlRow += "<br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-app-name=\"" + htmlEncode(record.rData.appName) + "\" " +
                "data-record-classpath=\"" + htmlEncode(record.rData.classPath) + "\" " +
                "data-record-data=\"" + htmlEncode(record.rData.data) + "\"";
            break;

        default:
            tableHtmlRow += "<td style=\"word-break: break-all;\"><b>RDATA:</b> " + htmlEncode(record.rData.value);

            tableHtmlRow += "<br /><br /><b>Last Used:</b> " + lastUsedOn;

            if ((record.comments != null) && (record.comments.length > 0))
                tableHtmlRow += "<br /><b>Comments:</b> <pre style=\"white-space: pre-wrap;\">" + htmlEncode(record.comments) + "</pre>";

            tableHtmlRow += "</td>";

            additionalDataAttributes = "data-record-rdata=\"" + htmlEncode(record.rData.value) + "\"";
            break;
    }

    var hideActionButtons = false;
    var disableEnableDisableDeleteButtons = false;

    switch (zoneType) {
        case "Internal":
            hideActionButtons = true;
            break;

        case "Secondary":
            switch (record.type) {
                case "SOA":
                    disableEnableDisableDeleteButtons = true;
                    break;

                default:
                    hideActionButtons = true;
                    break;
            }
            break;

        case "Stub":
            switch (record.type) {
                case "SOA":
                    disableEnableDisableDeleteButtons = true;
                    break;

                case "NS":
                    if (name == "@")
                        hideActionButtons = true;

                    break;
            }
            break;

        default:
            switch (record.type) {
                case "SOA":
                    disableEnableDisableDeleteButtons = true;
                    break;

                case "DNSKEY":
                case "RRSIG":
                case "NSEC":
                case "NSEC3":
                case "NSEC3PARAM":
                    hideActionButtons = true;
                    break;
            }
            break;
    }

    if (hideActionButtons) {
        tableHtmlRow += "<td align=\"right\">&nbsp;</td>";
    }
    else {
        tableHtmlRow += "<td align=\"right\" style=\"min-width: 220px;\">";
        tableHtmlRow += "<div id=\"data" + index + "\" data-record-name=\"" + htmlEncode(record.name) + "\" data-record-type=\"" + record.type + "\" data-record-ttl=\"" + record.ttl + "\" " + additionalDataAttributes + " data-record-disabled=\"" + record.disabled + "\" data-record-comments=\"" + htmlEncode(record.comments) + "\" style=\"display: none;\"></div>";
        tableHtmlRow += "<button type=\"button\" class=\"btn btn-primary\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 0 0;\" data-id=\"" + index + "\" onclick=\"showEditRecordModal(this);\">Edit</button>";
        tableHtmlRow += "<button type=\"button\" class=\"btn btn-default\" id=\"btnEnableRecord" + index + "\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 0 0;" + (record.disabled ? "" : " display: none;") + "\" data-id=\"" + index + "\" onclick=\"updateRecordState(this, false);\"" + (disableEnableDisableDeleteButtons ? " disabled" : "") + " data-loading-text=\"Enabling...\">Enable</button>";
        tableHtmlRow += "<button type=\"button\" class=\"btn btn-warning\" id=\"btnDisableRecord" + index + "\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 0 0;" + (!record.disabled ? "" : " display: none;") + "\" data-id=\"" + index + "\" onclick=\"updateRecordState(this, true);\"" + (disableEnableDisableDeleteButtons ? " disabled" : "") + " data-loading-text=\"Disabling...\">Disable</button>";
        tableHtmlRow += "<button type=\"button\" class=\"btn btn-danger\" style=\"font-size: 12px; padding: 2px 0px; width: 60px; margin: 0 6px 0 0;\" data-loading-text=\"Deleting...\" data-id=\"" + index + "\" onclick=\"deleteRecord(this);\"" + (disableEnableDisableDeleteButtons ? " disabled" : "") + ">Delete</button></td>";
    }

    tableHtmlRow += "</tr>";

    return tableHtmlRow;
}

function clearAddEditRecordForm() {
    $("#divAddEditRecordAlert").html("");

    $("#txtAddEditRecordName").prop("placeholder", "@");
    $("#txtAddEditRecordName").prop("disabled", false);
    $("#optAddEditRecordType").prop("disabled", false);
    $("#txtAddEditRecordTtl").prop("disabled", false);
    $("#divAddEditRecordTtl").show();

    $("#txtAddEditRecordName").val("");
    $("#optAddEditRecordType").val("A");
    $("#txtAddEditRecordTtl").val("");

    $("#divAddEditRecordData").show();
    $("#divAddEditRecordDataUnknownType").hide();
    $("#txtAddEditRecordDataUnknownType").val("");
    $("#txtAddEditRecordDataUnknownType").prop("disabled", false);
    $("#lblAddEditRecordDataValue").text("IPv4 Address");
    $("#txtAddEditRecordDataValue").val("");
    $("#divAddEditRecordDataPtr").show();
    $("#chkAddEditRecordDataPtr").prop("checked", false);
    $("#chkAddEditRecordDataCreatePtrZone").prop('disabled', true);
    $("#chkAddEditRecordDataCreatePtrZone").prop("checked", false);
    $("#chkAddEditRecordDataPtrLabel").text("Add reverse (PTR) record");

    $("#divAddEditRecordDataNs").hide();
    $("#txtAddEditRecordDataNsNameServer").prop("disabled", false);
    $("#txtAddEditRecordDataNsNameServer").val("");
    $("#txtAddEditRecordDataNsGlue").val("");

    $("#divEditRecordDataSoa").hide();
    $("#txtEditRecordDataSoaPrimaryNameServer").prop("disabled", false);
    $("#txtEditRecordDataSoaResponsiblePerson").prop("disabled", false);
    $("#txtEditRecordDataSoaSerial").prop("disabled", false);
    $("#txtEditRecordDataSoaRefresh").prop("disabled", false);
    $("#txtEditRecordDataSoaRetry").prop("disabled", false);
    $("#txtEditRecordDataSoaExpire").prop("disabled", false);
    $("#txtEditRecordDataSoaMinimum").prop("disabled", false);
    $("#txtEditRecordDataSoaPrimaryNameServer").val("");
    $("#txtEditRecordDataSoaResponsiblePerson").val("");
    $("#txtEditRecordDataSoaSerial").val("");
    $("#txtEditRecordDataSoaRefresh").val("");
    $("#txtEditRecordDataSoaRetry").val("");
    $("#txtEditRecordDataSoaExpire").val("");
    $("#txtEditRecordDataSoaMinimum").val("");

    $("#divAddEditRecordDataMx").hide();
    $("#txtAddEditRecordDataMxPreference").val("");
    $("#txtAddEditRecordDataMxExchange").val("");

    $("#divAddEditRecordDataSrv").hide();
    $("#txtAddEditRecordDataSrvPriority").val("");
    $("#txtAddEditRecordDataSrvWeight").val("");
    $("#txtAddEditRecordDataSrvPort").val("");
    $("#txtAddEditRecordDataSrvTarget").val("");

    $("#divAddEditRecordDataDs").hide();
    $("#txtAddEditRecordDataDsKeyTag").val("");
    $("#optAddEditRecordDataDsAlgorithm").val("");
    $("#optAddEditRecordDataDsDigestType").val("");
    $("#txtAddEditRecordDataDsDigest").val("");

    $("#divAddEditRecordDataSshfp").hide();
    $("#optAddEditRecordDataSshfpAlgorithm").val("");
    $("#optAddEditRecordDataSshfpFingerprintType").val("");
    $("#txtAddEditRecordDataSshfpFingerprint").val("");

    $("#divAddEditRecordDataTlsa").hide();
    $("#optAddEditRecordDataTlsaCertificateUsage").val("");
    $("#optAddEditRecordDataTlsaSelector").val("");
    $("#optAddEditRecordDataTlsaMatchingType").val("");
    $("#txtAddEditRecordDataTlsaCertificateAssociationData").val("");

    $("#divAddEditRecordDataSvcb").hide();
    $("#txtAddEditRecordDataSvcbPriority").val("");
    $("#txtAddEditRecordDataSvcbTargetName").val("");
    $("#tableAddEditRecordDataSvcbParams").html("");

    $("#divAddEditRecordDataUri").hide();
    $("#txtAddEditRecordDataUriPriority").val("");
    $("#txtAddEditRecordDataUriWeight").val("");
    $("#txtAddEditRecordDataUri").val("");

    $("#divAddEditRecordDataCaa").hide();
    $("#txtAddEditRecordDataCaaFlags").val("");
    $("#txtAddEditRecordDataCaaTag").val("");
    $("#txtAddEditRecordDataCaaValue").val("");

    $("#divAddEditRecordDataForwarder").hide();
    $("#rdAddEditRecordDataForwarderProtocolUdp").prop("checked", true);
    $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr('disabled', false);
    $("#chkAddEditRecordDataForwarderThisServer").prop("checked", false);
    $('#txtAddEditRecordDataForwarder').prop('disabled', false);
    $("#txtAddEditRecordDataForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")
    $("#txtAddEditRecordDataForwarder").val("");
    $("#chkAddEditRecordDataForwarderDnssecValidation").prop("checked", $("#chkDnssecValidation").prop("checked"));
    $("#rdAddEditRecordDataForwarderProxyTypeNone").prop("checked", true);
    $("#txtAddEditRecordDataForwarderProxyAddress").prop("disabled", true);
    $("#txtAddEditRecordDataForwarderProxyPort").prop("disabled", true);
    $("#txtAddEditRecordDataForwarderProxyUsername").prop("disabled", true);
    $("#txtAddEditRecordDataForwarderProxyPassword").prop("disabled", true);
    $("#txtAddEditRecordDataForwarderProxyAddress").val("");
    $("#txtAddEditRecordDataForwarderProxyPort").val("");
    $("#txtAddEditRecordDataForwarderProxyUsername").val("");
    $("#txtAddEditRecordDataForwarderProxyPassword").val("");

    $("#divAddEditRecordDataApplication").hide();
    $("#optAddEditRecordDataAppName").html("");
    $("#optAddEditRecordDataAppName").attr('disabled', false);
    $("#optAddEditRecordDataClassPath").html("");
    $("#optAddEditRecordDataClassPath").attr('disabled', false);
    $("#txtAddEditRecordDataData").val("");

    $("#divAddEditRecordOverwrite").show();
    $("#chkAddEditRecordOverwrite").prop("checked", false);

    $("#txtAddEditRecordComments").val("");

    $("#btnAddEditRecord").button("reset");
}

function showAddRecordModal() {
    var zone = $("#titleEditZone").attr("data-zone");

    var lastType = $("#optAddEditRecordType").val();

    clearAddEditRecordForm();

    if (zone.endsWith(".in-addr.arpa") || zone.endsWith(".ip6.arpa")) {
        $("#optAddEditRecordType").val("PTR");
        modifyAddRecordFormByType(true);
    }
    else if (lastType != "SOA") {
        $("#optAddEditRecordType").val(lastType);
        modifyAddRecordFormByType(true);
    }

    $("#titleAddEditRecord").text("Add Record");
    $("#lblAddEditRecordZoneName").text(zone === "." ? "" : zone);
    $("#optEditRecordTypeSoa").hide();
    $("#btnAddEditRecord").attr("onclick", "addRecord(); return false;");

    $("#modalAddEditRecord").modal("show");

    setTimeout(function () {
        $("#txtAddEditRecordName").focus();
    }, 1000);
}

var appsList;

function loadAddRecordModalAppNames() {
    var optAddEditRecordDataAppName = $("#optAddEditRecordDataAppName");
    var optAddEditRecordDataClassPath = $("#optAddEditRecordDataClassPath");
    var txtAddEditRecordDataData = $("#txtAddEditRecordDataData");
    var divAddEditRecordAlert = $("#divAddEditRecordAlert");

    optAddEditRecordDataAppName.prop("disabled", true);
    optAddEditRecordDataClassPath.prop("disabled", true);
    txtAddEditRecordDataData.prop("disabled", true);

    optAddEditRecordDataAppName.html("");
    optAddEditRecordDataClassPath.html("");
    txtAddEditRecordDataData.val("");

    HTTPRequest({
        url: "/api/apps/list?token=" + sessionData.token,
        success: function (responseJSON) {
            appsList = responseJSON.response.apps;

            var optApps = "<option></option>";
            var optClassPaths = "<option></option>";

            for (var i = 0; i < appsList.length; i++) {
                for (var j = 0; j < appsList[i].dnsApps.length; j++) {
                    if (appsList[i].dnsApps[j].isAppRecordRequestHandler) {
                        optApps += "<option>" + appsList[i].name + "</option>";
                        break;
                    }
                }
            }

            $("#optAddEditRecordDataAppName").html(optApps);
            $("#optAddEditRecordDataClassPath").html(optClassPaths);

            optAddEditRecordDataAppName.prop("disabled", false);
            optAddEditRecordDataClassPath.prop("disabled", false);
            txtAddEditRecordDataData.prop("disabled", false);
        },
        invalidToken: function () {
            showPageLogin();
        },
        objAlertPlaceholder: divAddEditRecordAlert
    });
}

function modifyAddRecordFormByType(addMode) {
    $("#divAddEditRecordAlert").html("");

    $("#txtAddEditRecordName").prop("placeholder", "@");
    $("#divAddEditRecordTtl").show();
    $("#txtAddEditRecordDataValue").attr("placeholder", "");

    var type = $("#optAddEditRecordType").val();

    $("#divAddEditRecordData").hide();
    $("#divAddEditRecordDataUnknownType").hide();
    $("#divAddEditRecordDataPtr").hide();
    $("#divAddEditRecordDataNs").hide();
    $("#divEditRecordDataSoa").hide();
    $("#divAddEditRecordDataMx").hide();
    $("#divAddEditRecordDataSrv").hide();
    $("#divAddEditRecordDataDs").hide();
    $("#divAddEditRecordDataSshfp").hide();
    $("#divAddEditRecordDataTlsa").hide();
    $("#divAddEditRecordDataSvcb").hide();
    $("#divAddEditRecordDataUri").hide();
    $("#divAddEditRecordDataCaa").hide();
    $("#divAddEditRecordDataForwarder").hide();
    $("#divAddEditRecordDataApplication").hide();

    switch (type) {
        case "A":
            $("#lblAddEditRecordDataValue").text("IPv4 Address");
            $("#txtAddEditRecordDataValue").val("");
            $("#chkAddEditRecordDataPtr").prop("checked", false);
            $("#chkAddEditRecordDataCreatePtrZone").prop('disabled', true);
            $("#chkAddEditRecordDataCreatePtrZone").prop("checked", false);
            $("#chkAddEditRecordDataPtrLabel").text("Add reverse (PTR) record");
            $("#divAddEditRecordData").show();
            $("#divAddEditRecordDataPtr").show();
            break;

        case "AAAA":
            $("#lblAddEditRecordDataValue").text("IPv6 Address");
            $("#txtAddEditRecordDataValue").val("");
            $("#chkAddEditRecordDataPtr").prop("checked", false);
            $("#chkAddEditRecordDataCreatePtrZone").prop('disabled', true);
            $("#chkAddEditRecordDataCreatePtrZone").prop("checked", false);
            $("#chkAddEditRecordDataPtrLabel").text("Add reverse (PTR) record");
            $("#divAddEditRecordData").show();
            $("#divAddEditRecordDataPtr").show();
            break;

        case "NS":
            $("#txtAddEditRecordDataNsNameServer").val("");
            $("#txtAddEditRecordDataNsGlue").val("");
            $("#divAddEditRecordDataNs").show();
            break;

        case "SOA":
            $("#txtEditRecordDataSoaPrimaryNameServer").val("");
            $("#txtEditRecordDataSoaResponsiblePerson").val("");
            $("#txtEditRecordDataSoaSerial").val("");
            $("#txtEditRecordDataSoaRefresh").val("");
            $("#txtEditRecordDataSoaRetry").val("");
            $("#txtEditRecordDataSoaExpire").val("");
            $("#txtEditRecordDataSoaMinimum").val("");
            $("#txtEditRecordDataSoaPrimaryAddresses").val("");
            $("#rdEditRecordDataSoaZoneTransferProtocolTcp").prop("checked", true);
            $("#optEditRecordDataSoaTsigKeyName").val("");
            $("#divEditRecordDataSoa").show();
            break;

        case "PTR":
        case "CNAME":
        case "DNAME":
        case "ANAME":
            $("#lblAddEditRecordDataValue").text("Domain Name");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "MX":
            $("#txtAddEditRecordDataMxPreference").val("");
            $("#txtAddEditRecordDataMxExchange").val("");
            $("#divAddEditRecordDataMx").show();
            break;

        case "TXT":
            $("#lblAddEditRecordDataValue").text("Text Data");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "SRV":
            $("#txtAddEditRecordName").prop("placeholder", "_service._protocol.name");
            $("#txtAddEditRecordDataSrvPriority").val("");
            $("#txtAddEditRecordDataSrvWeight").val("");
            $("#txtAddEditRecordDataSrvPort").val("");
            $("#txtAddEditRecordDataSrvTarget").val("");
            $("#divAddEditRecordDataSrv").show();
            break;

        case "DS":
            $("#txtAddEditRecordDataDsKeyTag").val("");
            $("#optAddEditRecordDataDsAlgorithm").val("");
            $("#optAddEditRecordDataDsDigestType").val("");
            $("#txtAddEditRecordDataDsDigest").val("");
            $("#divAddEditRecordDataDs").show();
            break;

        case "SSHFP":
            $("#optAddEditRecordDataSshfpAlgorithm").val("");
            $("#optAddEditRecordDataSshfpFingerprintType").val("");
            $("#txtAddEditRecordDataSshfpFingerprint").val("");
            $("#divAddEditRecordDataSshfp").show();
            break;

        case "TLSA":
            $("#txtAddEditRecordName").prop("placeholder", "_port._protocol.name");
            $("#optAddEditRecordDataTlsaCertificateUsage").val("");
            $("#optAddEditRecordDataTlsaSelector").val("");
            $("#optAddEditRecordDataTlsaMatchingType").val("");
            $("#txtAddEditRecordDataTlsaCertificateAssociationData").val("");
            $("#divAddEditRecordDataTlsa").show();
            break;

        case "SVCB":
        case "HTTPS":
            $("#txtAddEditRecordName").prop("placeholder", "_port._scheme.name");
            $("#txtAddEditRecordDataSvcbPriority").val("");
            $("#txtAddEditRecordDataSvcbTargetName").val("");
            $("#tableAddEditRecordDataSvcbParams").html("");
            $("#divAddEditRecordDataSvcb").show();
            break;

        case "URI":
            $("#txtAddEditRecordDataUriPriority").val("");
            $("#txtAddEditRecordDataUriWeight").val("");
            $("#txtAddEditRecordDataUri").val("");
            $("#divAddEditRecordDataUri").show();
            break;

        case "CAA":
            $("#txtAddEditRecordDataCaaFlags").val("");
            $("#txtAddEditRecordDataCaaTag").val("");
            $("#txtAddEditRecordDataCaaValue").val("");
            $("#divAddEditRecordDataCaa").show();
            break;

        case "FWD":
            $("#divAddEditRecordTtl").hide();
            $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr("disabled", false);
            $("#rdAddEditRecordDataForwarderProtocolUdp").prop("checked", true);
            $("#chkAddEditRecordDataForwarderThisServer").prop("checked", false);
            $('#txtAddEditRecordDataForwarder').prop('disabled', false);
            $("#txtAddEditRecordDataForwarder").val("");
            $("#chkAddEditRecordDataForwarderDnssecValidation").prop("checked", $("#chkDnssecValidation").prop("checked"));
            $("#rdAddEditRecordDataForwarderProxyTypeNone").prop("checked", true);
            $("#txtAddEditRecordDataForwarderProxyAddress").prop("disabled", true);
            $("#txtAddEditRecordDataForwarderProxyPort").prop("disabled", true);
            $("#txtAddEditRecordDataForwarderProxyUsername").prop("disabled", true);
            $("#txtAddEditRecordDataForwarderProxyPassword").prop("disabled", true);
            $("#txtAddEditRecordDataForwarderProxyAddress").val("");
            $("#txtAddEditRecordDataForwarderProxyPort").val("");
            $("#txtAddEditRecordDataForwarderProxyUsername").val("");
            $("#txtAddEditRecordDataForwarderProxyPassword").val("");
            $("#divAddEditRecordDataForwarder").show();
            $("#divAddEditRecordDataForwarderProxy").show();
            break;

        case "APP":
            $("#optAddEditRecordDataAppName").val("");
            $("#optAddEditRecordDataClassPath").val("");
            $("#txtAddEditRecordDataData").val("");
            $("#divAddEditRecordDataApplication").show();

            if (addMode)
                loadAddRecordModalAppNames();

            break;

        default:
            $("#txtAddEditRecordDataUnknownType").val("");
            $("#lblAddEditRecordDataValue").text("RDATA");
            $("#txtAddEditRecordDataValue").val("");
            $("#txtAddEditRecordDataValue").attr("placeholder", "hex string");

            $("#divAddEditRecordData").show();
            $("#divAddEditRecordDataUnknownType").show();
            break;
    }
}

function addRecord() {
    var btn = $("#btnAddEditRecord");
    var divAddEditRecordAlert = $("#divAddEditRecordAlert");

    var zone = $("#titleEditZone").attr("data-zone");

    var domain;
    {
        var subDomain = $("#txtAddEditRecordName").val();
        if (subDomain === "")
            subDomain = "@";

        if (subDomain === "@")
            domain = zone;
        else if (zone === ".")
            domain = subDomain + ".";
        else
            domain = subDomain + "." + zone;
    }

    var type = $("#optAddEditRecordType").val();

    var ttl = $("#txtAddEditRecordTtl").val();
    var overwrite = $("#chkAddEditRecordOverwrite").prop("checked");
    var comments = $("#txtAddEditRecordComments").val();

    var apiUrl = "";

    switch (type) {
        case "A":
        case "AAAA":
            var ipAddress = $("#txtAddEditRecordDataValue").val();
            if (ipAddress === "") {
                showAlert("warning", "Missing!", "Please enter an IP address to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&ipAddress=" + encodeURIComponent(ipAddress) + "&ptr=" + $("#chkAddEditRecordDataPtr").prop('checked') + "&createPtrZone=" + $("#chkAddEditRecordDataCreatePtrZone").prop('checked');
            break;

        case "NS":
            var nameServer = $("#txtAddEditRecordDataNsNameServer").val();
            if (nameServer === "") {
                showAlert("warning", "Missing!", "Please enter a name server to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataNsNameServer").focus();
                return;
            }

            var glue = cleanTextList($("#txtAddEditRecordDataNsGlue").val());

            apiUrl += "&nameServer=" + encodeURIComponent(nameServer) + "&glue=" + encodeURIComponent(glue);
            break;

        case "CNAME":
            var subDomainName = $("#txtAddEditRecordName").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the CNAME record.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var cname = $("#txtAddEditRecordDataValue").val();
            if (cname === "") {
                showAlert("warning", "Missing!", "Please enter a domain name to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&cname=" + encodeURIComponent(cname);
            break;

        case "PTR":
            var ptrName = $("#txtAddEditRecordDataValue").val();
            if (ptrName === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&ptrName=" + encodeURIComponent(ptrName);
            break;

        case "MX":
            var preference = $("#txtAddEditRecordDataMxPreference").val();
            if (preference === "")
                preference = 1;

            var exchange = $("#txtAddEditRecordDataMxExchange").val();
            if (exchange === "") {
                showAlert("warning", "Missing!", "Please enter a mail exchange domain name to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataMxExchange").focus();
                return;
            }

            apiUrl += "&preference=" + preference + "&exchange=" + encodeURIComponent(exchange);
            break;

        case "TXT":
            var text = $("#txtAddEditRecordDataValue").val();
            if (text === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&text=" + encodeURIComponent(text);
            break;

        case "SRV":
            if ($("#txtAddEditRecordName").val() === "") {
                showAlert("warning", "Missing!", "Please enter a name that includes service and protocol labels.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var priority = $("#txtAddEditRecordDataSrvPriority").val();
            if (priority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPriority").focus();
                return;
            }

            var weight = $("#txtAddEditRecordDataSrvWeight").val();
            if (weight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvWeight").focus();
                return;
            }

            var port = $("#txtAddEditRecordDataSrvPort").val();
            if (port === "") {
                showAlert("warning", "Missing!", "Please enter a suitable port number.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPort").focus();
                return;
            }

            var target = $("#txtAddEditRecordDataSrvTarget").val();
            if (target === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the target field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvTarget").focus();
                return;
            }

            apiUrl += "&priority=" + priority + "&weight=" + weight + "&port=" + port + "&target=" + encodeURIComponent(target);
            break;

        case "DNAME":
            var dname = $("#txtAddEditRecordDataValue").val();
            if (dname === "") {
                showAlert("warning", "Missing!", "Please enter a domain name to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&dname=" + encodeURIComponent(dname);
            break;

        case "DS":
            var subDomainName = $("#txtAddEditRecordName").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the DS record.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var keyTag = $("#txtAddEditRecordDataDsKeyTag").val();
            if (keyTag === "") {
                showAlert("warning", "Missing!", "Please enter the Key Tag value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataDsKeyTag").focus();
                return;
            }

            var algorithm = $("#optAddEditRecordDataDsAlgorithm").val();
            if ((algorithm === null) || (algorithm === "")) {
                showAlert("warning", "Missing!", "Please select an DNSSEC algorithm to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataDsAlgorithm").focus();
                return;
            }

            var digestType = $("#optAddEditRecordDataDsDigestType").val();
            if ((digestType === null) || (digestType === "")) {
                showAlert("warning", "Missing!", "Please select a Digest Type to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataDsDigestType").focus();
                return;
            }

            var digest = $("#txtAddEditRecordDataDsDigest").val();
            if (digest === "") {
                showAlert("warning", "Missing!", "Please enter the Digest hash in hex string format to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataDsDigest").focus();
                return;
            }

            apiUrl += "&keyTag=" + keyTag + "&algorithm=" + algorithm + "&digestType=" + digestType + "&digest=" + encodeURIComponent(digest);
            break;

        case "SSHFP":
            var sshfpAlgorithm = $("#optAddEditRecordDataSshfpAlgorithm").val();
            if ((sshfpAlgorithm === null) || (sshfpAlgorithm === "")) {
                showAlert("warning", "Missing!", "Please select an Algorithm to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataSshfpAlgorithm").focus();
                return;
            }

            var sshfpFingerprintType = $("#optAddEditRecordDataSshfpFingerprintType").val();
            if ((sshfpFingerprintType === null) || (sshfpFingerprintType === "")) {
                showAlert("warning", "Missing!", "Please select a Fingerprint Type to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataSshfpFingerprintType").focus();
                return;
            }

            var sshfpFingerprint = $("#txtAddEditRecordDataSshfpFingerprint").val();
            if (sshfpFingerprint === "") {
                showAlert("warning", "Missing!", "Please enter the Fingerprint hash in hex string format to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSshfpFingerprint").focus();
                return;
            }

            apiUrl += "&sshfpAlgorithm=" + sshfpAlgorithm + "&sshfpFingerprintType=" + sshfpFingerprintType + "&sshfpFingerprint=" + encodeURIComponent(sshfpFingerprint);
            break;

        case "TLSA":
            var tlsaCertificateUsage = $("#optAddEditRecordDataTlsaCertificateUsage").val();
            if ((tlsaCertificateUsage === null) || (tlsaCertificateUsage === "")) {
                showAlert("warning", "Missing!", "Please select a Certificate Usage to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaCertificateUsage").focus();
                return;
            }

            var tlsaSelector = $("#optAddEditRecordDataTlsaSelector").val();
            if ((tlsaSelector === null) || (tlsaSelector === "")) {
                showAlert("warning", "Missing!", "Please select a Selector to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaSelector").focus();
                return;
            }

            var tlsaMatchingType = $("#optAddEditRecordDataTlsaMatchingType").val();
            if ((tlsaMatchingType === null) || (tlsaMatchingType === "")) {
                showAlert("warning", "Missing!", "Please select a Matching Type to add the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaMatchingType").focus();
                return;
            }

            var tlsaCertificateAssociationData = $("#txtAddEditRecordDataTlsaCertificateAssociationData").val();
            if (tlsaCertificateAssociationData === "") {
                showAlert("warning", "Missing!", "Please enter the Certificate Association Data to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataTlsaCertificateAssociationData").focus();
                return;
            }

            if ((tlsaMatchingType === "Full") && !tlsaCertificateAssociationData.startsWith("-")) {
                showAlert("warning", "Missing!", "Please enter a complete certificate in PEM format as the Certificate Association Data to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataTlsaCertificateAssociationData").focus();
                return;
            }

            apiUrl += "&tlsaCertificateUsage=" + tlsaCertificateUsage + "&tlsaSelector=" + tlsaSelector + "&tlsaMatchingType=" + tlsaMatchingType + "&tlsaCertificateAssociationData=" + encodeURIComponent(tlsaCertificateAssociationData);
            break;

        case "SVCB":
        case "HTTPS":
            var svcPriority = $("#txtAddEditRecordDataSvcbPriority").val();
            if ((svcPriority === null) || (svcPriority === "")) {
                showAlert("warning", "Missing!", "Please enter a Priority value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSvcbPriority").focus();
                return;
            }

            var svcTargetName = $("#txtAddEditRecordDataSvcbTargetName").val();
            if ((svcTargetName === null) || (svcTargetName === "")) {
                showAlert("warning", "Missing!", "Please enter a Target Name to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSvcbTargetName").focus();
                return;
            }

            var svcParams = serializeTableData($("#tableAddEditRecordDataSvcbParams"), 2, divAddEditRecordAlert);
            if (svcParams === false)
                return;

            if (svcParams.length === 0)
                svcParams = false;

            apiUrl += "&svcPriority=" + svcPriority + "&svcTargetName=" + encodeURIComponent(svcTargetName) + "&svcParams=" + encodeURIComponent(svcParams);
            break;

        case "URI":
            var uriPriority = $("#txtAddEditRecordDataUriPriority").val();
            if (uriPriority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUriPriority").focus();
                return;
            }

            var uriWeight = $("#txtAddEditRecordDataUriWeight").val();
            if (uriWeight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUriWeight").focus();
                return;
            }

            var uri = $("#txtAddEditRecordDataUri").val();
            if (uri === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the URI field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUri").focus();
                return;
            }

            apiUrl += "&uriPriority=" + uriPriority + "&uriWeight=" + uriWeight + "&uri=" + encodeURIComponent(uri);
            break;

        case "CAA":
            var flags = $("#txtAddEditRecordDataCaaFlags").val();
            if (flags === "")
                flags = 0;

            var tag = $("#txtAddEditRecordDataCaaTag").val();
            if (tag === "")
                tag = "issue";

            var value = $("#txtAddEditRecordDataCaaValue").val();
            if (value === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the authority field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataCaaValue").focus();
                return;
            }

            apiUrl += "&flags=" + flags + "&tag=" + encodeURIComponent(tag) + "&value=" + encodeURIComponent(value);
            break;

        case "ANAME":
            var aname = $("#txtAddEditRecordDataValue").val();
            if (aname === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&aname=" + encodeURIComponent(aname);
            break;

        case "FWD":
            var forwarder = $("#txtAddEditRecordDataForwarder").val();
            if (forwarder === "") {
                showAlert("warning", "Missing!", "Please enter a domain name or IP address or URL as a forwarder to add the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataForwarder").focus();
                return;
            }

            var dnssecValidation = $("#chkAddEditRecordDataForwarderDnssecValidation").prop("checked");
            var proxyType = $("input[name=rdAddEditRecordDataForwarderProxyType]:checked").val();

            apiUrl += "&protocol=" + $('input[name=rdAddEditRecordDataForwarderProtocol]:checked').val() + "&forwarder=" + encodeURIComponent(forwarder);
            apiUrl += "&dnssecValidation=" + dnssecValidation + "&proxyType=" + proxyType;

            if (proxyType != "None") {
                var proxyAddress = $("#txtAddEditRecordDataForwarderProxyAddress").val();
                var proxyPort = $("#txtAddEditRecordDataForwarderProxyPort").val();
                var proxyUsername = $("#txtAddEditRecordDataForwarderProxyUsername").val();
                var proxyPassword = $("#txtAddEditRecordDataForwarderProxyPassword").val();

                if ((proxyAddress == null) || (proxyAddress === "")) {
                    showAlert("warning", "Missing!", "Please enter a domain name or IP address for Proxy Server Address to add the record.", divAddEditRecordAlert);
                    $("#txtAddEditRecordDataForwarderProxyAddress").focus();
                    return;
                }

                if ((proxyPort == null) || (proxyPort === "")) {
                    showAlert("warning", "Missing!", "Please enter a port number for Proxy Server Port to add the record.", divAddEditRecordAlert);
                    $("#txtAddEditRecordDataForwarderProxyPort").focus();
                    return;
                }

                apiUrl += "&proxyAddress=" + encodeURIComponent(proxyAddress) + "&proxyPort=" + proxyPort + "&proxyUsername=" + encodeURIComponent(proxyUsername) + "&proxyPassword=" + encodeURIComponent(proxyPassword);
            }
            break;

        case "APP":
            var appName = $("#optAddEditRecordDataAppName").val();

            if ((appName === null) || (appName === "")) {
                showAlert("warning", "Missing!", "Please select an application name to add record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataAppName").focus();
                return;
            }

            var classPath = $("#optAddEditRecordDataClassPath").val();

            if ((classPath === null) || (classPath === "")) {
                showAlert("warning", "Missing!", "Please select a class path to add record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataClassPath").focus();
                return;
            }

            var recordData = $("#txtAddEditRecordDataData").val();

            apiUrl += "&appName=" + encodeURIComponent(appName) + "&classPath=" + encodeURIComponent(classPath) + "&recordData=" + encodeURIComponent(recordData);
            break;

        default:
            type = $("#txtAddEditRecordDataUnknownType").val();
            if ((type === null) || (type === "")) {
                showAlert("warning", "Missing!", "Please enter a resoure record name or number to add record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUnknownType").focus();
                return;
            }

            var rdata = $("#txtAddEditRecordDataValue").val();
            if ((rdata === null) || (rdata === "")) {
                showAlert("warning", "Missing!", "Please enter a hex value as the RDATA to add record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&rdata=" + encodeURIComponent(rdata);
            break;
    }

    apiUrl = "/api/zones/records/add?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone) + "&domain=" + encodeURIComponent(domain) + "&type=" + encodeURIComponent(type) + "&ttl=" + ttl + "&overwrite=" + overwrite + "&comments=" + encodeURIComponent(comments) + apiUrl;

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            $("#modalAddEditRecord").modal("hide");

            if (overwrite) {
                var currentPageNumber = Number($("#txtEditZonePageNumber").val());
                showEditZone(zone, currentPageNumber);
            }
            else {
                //update local array
                editZoneRecords.unshift(responseJSON.response.addedRecord);

                //show page
                showEditZonePage(1);
            }

            showAlert("success", "Record Added!", "Resource record was added successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            $("#modalAddEditRecord").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divAddEditRecordAlert
    });
}

function updateAddEditFormForwarderPlaceholder() {
    var protocol = $('input[name=rdAddEditRecordDataForwarderProtocol]:checked').val();
    switch (protocol) {
        case "Udp":
        case "Tcp":
            $("#txtAddEditRecordDataForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")
            break;

        case "Tls":
        case "Quic":
            $("#txtAddEditRecordDataForwarder").attr("placeholder", "dns.quad9.net (9.9.9.9:853)")
            break;

        case "Https":
            $("#txtAddEditRecordDataForwarder").attr("placeholder", "https://cloudflare-dns.com/dns-query (1.1.1.1)")
            break;
    }
}

function updateAddEditFormForwarderProxyType() {
    var proxyType = $('input[name=rdAddEditRecordDataForwarderProxyType]:checked').val();

    $("#txtAddEditRecordDataForwarderProxyAddress").prop("disabled", (proxyType === "None"));
    $("#txtAddEditRecordDataForwarderProxyPort").prop("disabled", (proxyType === "None"));
    $("#txtAddEditRecordDataForwarderProxyUsername").prop("disabled", (proxyType === "None"));
    $("#txtAddEditRecordDataForwarderProxyPassword").prop("disabled", (proxyType === "None"));
}

function updateAddEditFormForwarderThisServer() {
    var useThisServer = $("#chkAddEditRecordDataForwarderThisServer").prop('checked');

    if (useThisServer) {
        $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr("disabled", true);
        $("#rdAddEditRecordDataForwarderProtocolUdp").prop("checked", true);
        $("#txtAddEditRecordDataForwarder").attr("placeholder", "8.8.8.8 or [2620:fe::10]")

        $("#txtAddEditRecordDataForwarder").prop("disabled", true);
        $("#txtAddEditRecordDataForwarder").val("this-server");

        $("#divAddEditRecordDataForwarderProxy").hide();
    }
    else {
        $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr("disabled", false);

        $("#txtAddEditRecordDataForwarder").prop("disabled", false);
        $("#txtAddEditRecordDataForwarder").val("");

        $("#divAddEditRecordDataForwarderProxy").show();
    }
}

function addSvcbRecordParamEditRow(paramKey, paramValue) {
    var id = Math.floor(Math.random() * 10000);

    var tableHtmlRows = "<tr id=\"tableAddEditRecordDataSvcbParamsRow" + id + "\">";

    if ((paramKey != "") && isFinite(paramKey)) {
        tableHtmlRows += "<td><input type=\"text\" class=\"form-control\" placeholder=\"key number\" value=\"" + htmlEncode(paramKey) + "\"></td>";
        tableHtmlRows += "<td><input type=\"text\" data-optional=\"true\" class=\"form-control\" placeholder=\"hex string\" value=\"" + htmlEncode(paramValue) + "\"></td>";
    }
    else {
        tableHtmlRows += "<td id=\"tableAddEditRecordDataSvcbParamsRowColumn1" + id + "\">";
        tableHtmlRows += "<select class=\"form-control\" onchange=\"if (event.target.value === 'Unknown') { $('#tableAddEditRecordDataSvcbParamsRowColumn1" + id + "').html('<input type=\\\'text\\\' class=\\\'form-control\\\' placeholder=\\\'key number\\\' >'); $('#tableAddEditRecordDataSvcbParamsRowColumn2" + id + "').html('<input type=\\\'text\\\' data-optional=\\\'true\\\' class=\\\'form-control\\\' placeholder=\\\'hex string\\\' >'); }\">";
        tableHtmlRows += "<option" + (paramKey == "mandatory" ? " selected" : "") + ">mandatory</option>";
        tableHtmlRows += "<option" + (paramKey == "alpn" ? " selected" : "") + ">alpn</option>";
        tableHtmlRows += "<option" + (paramKey == "no-default-alpn" ? " selected" : "") + ">no-default-alpn</option>";
        tableHtmlRows += "<option" + (paramKey == "port" ? " selected" : "") + ">port</option>";
        tableHtmlRows += "<option" + (paramKey == "ipv4hint" ? " selected" : "") + ">ipv4hint</option>";
        tableHtmlRows += "<option" + (paramKey == "ipv6hint" ? " selected" : "") + ">ipv6hint</option>";
        tableHtmlRows += "<option" + (paramKey == "dohpath" ? " selected" : "") + ">dohpath</option>";
        tableHtmlRows += "<option>Unknown</option>";
        tableHtmlRows += "</select></td>";

        tableHtmlRows += "<td id=\"tableAddEditRecordDataSvcbParamsRowColumn2" + id + "\"><input type=\"text\" data-optional=\"true\" class=\"form-control\" value=\"" + htmlEncode(paramValue) + "\"></td>";
    }

    tableHtmlRows += "<td><button type=\"button\" class=\"btn btn-warning\" onclick=\"$('#tableAddEditRecordDataSvcbParamsRow" + id + "').remove();\">Remove</button></td></tr>";

    $("#tableAddEditRecordDataSvcbParams").append(tableHtmlRows);
}

function showEditRecordModal(objBtn) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");
    var divData = $("#data" + id);

    var zone = $("#titleEditZone").attr("data-zone");
    var name = divData.attr("data-record-name");
    var type = divData.attr("data-record-type");
    var ttl = divData.attr("data-record-ttl");
    var comments = divData.attr("data-record-comments");

    if (name === zone)
        name = "@";
    else
        name = name.replace("." + zone, "");

    clearAddEditRecordForm();
    $("#titleAddEditRecord").text("Edit Record");
    $("#lblAddEditRecordZoneName").text(zone === "." ? "" : zone);
    $("#optEditRecordTypeSoa").show();
    $("#optAddEditRecordType").val(type);
    $("#divAddEditRecordOverwrite").hide();
    modifyAddRecordFormByType(false);

    $("#txtAddEditRecordName").val(name);
    $("#txtAddEditRecordTtl").val(ttl)
    $("#txtAddEditRecordComments").val(comments);

    var disableSoaRecordModalFields = false;
    var hideSoaRecordUseSerialDateSchemeField = false;
    var hideSoaRecordPrimaryAddressesField = false;
    var hideSoaRecordXfrAndTsigFields = false;

    var zoneType = $("#titleEditZoneType").text();
    switch (zoneType) {
        case "Primary":
            switch (type) {
                case "SOA":
                    hideSoaRecordPrimaryAddressesField = true;
                    hideSoaRecordXfrAndTsigFields = true;
                    break;
            }
            break;

        case "Secondary":
            switch (type) {
                case "SOA":
                    disableSoaRecordModalFields = true;
                    hideSoaRecordUseSerialDateSchemeField = true;
                    break;
            }
            break;

        case "Stub":
            switch (type) {
                case "SOA":
                    disableSoaRecordModalFields = true;
                    hideSoaRecordUseSerialDateSchemeField = true;
                    hideSoaRecordXfrAndTsigFields = true;
                    break;
            }
            break;
    }

    switch (type) {
        case "A":
        case "AAAA":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-ip-address"));
            $("#chkAddEditRecordDataPtr").prop("checked", false);
            $("#chkAddEditRecordDataCreatePtrZone").prop('disabled', true);
            $("#chkAddEditRecordDataCreatePtrZone").prop("checked", false);
            $("#chkAddEditRecordDataPtrLabel").text("Update reverse (PTR) record");
            break;

        case "NS":
            $("#txtAddEditRecordDataNsNameServer").val(divData.attr("data-record-name-server"));
            $("#txtAddEditRecordDataNsGlue").val(divData.attr("data-record-glue").replace(/, /g, "\n"));
            break;

        case "CNAME":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-cname"));
            break;

        case "SOA":
            $("#txtEditRecordDataSoaPrimaryNameServer").val(divData.attr("data-record-pname"));
            $("#txtEditRecordDataSoaResponsiblePerson").val(divData.attr("data-record-rperson"));
            $("#txtEditRecordDataSoaSerial").val(divData.attr("data-record-serial"));
            $("#txtEditRecordDataSoaSerial").prop("disabled", divData.attr("data-record-serial-scheme") === "true");
            $("#txtEditRecordDataSoaRefresh").val(divData.attr("data-record-refresh"));
            $("#txtEditRecordDataSoaRetry").val(divData.attr("data-record-retry"));
            $("#txtEditRecordDataSoaExpire").val(divData.attr("data-record-expire"));
            $("#txtEditRecordDataSoaMinimum").val(divData.attr("data-record-minimum"));
            $("#chkEditRecordDataSoaUseSerialDateScheme").prop("checked", divData.attr("data-record-serial-scheme") === "true");
            $("#txtEditRecordDataSoaPrimaryAddresses").val(divData.attr("data-record-paddresses").replace(/, /g, "\n"));

            switch (divData.attr("data-record-zonetransferprotocol").toLowerCase()) {
                case "tls":
                    $("#rdEditRecordDataSoaZoneTransferProtocolTls").prop("checked", true);
                    break;

                case "quic":
                    $("#rdEditRecordDataSoaZoneTransferProtocolQuic").prop("checked", true);
                    break;

                case "tcp":
                default:
                    $("#rdEditRecordDataSoaZoneTransferProtocolTcp").prop("checked", true);
                    break;
            }

            $("#txtAddEditRecordName").prop("disabled", true);

            if (disableSoaRecordModalFields) {
                $("#txtAddEditRecordTtl").prop("disabled", true);

                $("#txtEditRecordDataSoaPrimaryNameServer").prop("disabled", true);
                $("#txtEditRecordDataSoaResponsiblePerson").prop("disabled", true);
                $("#txtEditRecordDataSoaSerial").prop("disabled", true);
                $("#txtEditRecordDataSoaRefresh").prop("disabled", true);
                $("#txtEditRecordDataSoaRetry").prop("disabled", true);
                $("#txtEditRecordDataSoaExpire").prop("disabled", true);
                $("#txtEditRecordDataSoaMinimum").prop("disabled", true);
            }

            if (hideSoaRecordUseSerialDateSchemeField)
                $("#divEditRecordDataSoaUseSerialDateScheme").hide();
            else
                $("#divEditRecordDataSoaUseSerialDateScheme").show();

            if (hideSoaRecordPrimaryAddressesField) {
                $("#divEditRecordDataSoaPrimaryAddresses").hide();
            } else {
                $("#divEditRecordDataSoaPrimaryAddresses").show();
            }

            if (hideSoaRecordXfrAndTsigFields) {
                $("#divEditRecordDataSoaZoneTransferProtocol").hide();
                $("#divEditRecordDataSoaTsigKeyName").hide();
            } else {
                $("#divEditRecordDataSoaZoneTransferProtocol").show();
                $("#divEditRecordDataSoaTsigKeyName").show();

                loadTsigKeyNames($("#optEditRecordDataSoaTsigKeyName"), divData.attr("data-record-tsigkeyname"), $("#divAddEditRecordAlert"));
            }

            break;

        case "PTR":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-ptr-name"));
            break;

        case "MX":
            $("#txtAddEditRecordDataMxPreference").val(divData.attr("data-record-preference"));
            $("#txtAddEditRecordDataMxExchange").val(divData.attr("data-record-exchange"));
            break;

        case "TXT":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-text"));
            break;

        case "SRV":
            $("#txtAddEditRecordDataSrvPriority").val(divData.attr("data-record-priority"));
            $("#txtAddEditRecordDataSrvWeight").val(divData.attr("data-record-weight"));
            $("#txtAddEditRecordDataSrvPort").val(divData.attr("data-record-port"));
            $("#txtAddEditRecordDataSrvTarget").val(divData.attr("data-record-target"));
            break;

        case "DNAME":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-dname"));
            break;

        case "DS":
            $("#txtAddEditRecordDataDsKeyTag").val(divData.attr("data-record-key-tag"));
            $("#optAddEditRecordDataDsAlgorithm").val(divData.attr("data-record-algorithm"));
            $("#optAddEditRecordDataDsDigestType").val(divData.attr("data-record-digest-type"));
            $("#txtAddEditRecordDataDsDigest").val(divData.attr("data-record-digest"));
            break;

        case "SSHFP":
            $("#optAddEditRecordDataSshfpAlgorithm").val(divData.attr("data-record-algorithm"));
            $("#optAddEditRecordDataSshfpFingerprintType").val(divData.attr("data-record-fingerprint-type"));
            $("#txtAddEditRecordDataSshfpFingerprint").val(divData.attr("data-record-fingerprint"));
            break;

        case "TLSA":
            $("#optAddEditRecordDataTlsaCertificateUsage").val(divData.attr("data-record-certificate-usage"));
            $("#optAddEditRecordDataTlsaSelector").val(divData.attr("data-record-selector"));
            $("#optAddEditRecordDataTlsaMatchingType").val(divData.attr("data-record-matching-type"));
            $("#txtAddEditRecordDataTlsaCertificateAssociationData").val(divData.attr("data-record-certificate-association-data"));
            break;

        case "SVCB":
        case "HTTPS":
            $("#txtAddEditRecordDataSvcbPriority").val(divData.attr("data-record-svc-priority"));
            $("#txtAddEditRecordDataSvcbTargetName").val(divData.attr("data-record-svc-target-name"));

            var svcParams = JSON.parse(divData.attr("data-record-svc-params"));

            for (var paramKey in svcParams) {
                addSvcbRecordParamEditRow(paramKey, svcParams[paramKey]);
            }
            break;

        case "URI":
            $("#txtAddEditRecordDataUriPriority").val(divData.attr("data-record-priority"));
            $("#txtAddEditRecordDataUriWeight").val(divData.attr("data-record-weight"));
            $("#txtAddEditRecordDataUri").val(divData.attr("data-record-uri"));
            break;

        case "CAA":
            $("#txtAddEditRecordDataCaaFlags").val(divData.attr("data-record-flags"));
            $("#txtAddEditRecordDataCaaTag").val(divData.attr("data-record-tag"));
            $("#txtAddEditRecordDataCaaValue").val(divData.attr("data-record-value"));
            break;

        case "ANAME":
            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-aname"));
            break;

        case "FWD":
            $("#divAddEditRecordTtl").hide();
            $("#rdAddEditRecordDataForwarderProtocol" + divData.attr("data-record-protocol")).prop("checked", true);

            var forwarder = divData.attr("data-record-forwarder");

            $("#chkAddEditRecordDataForwarderThisServer").prop("checked", (forwarder == "this-server"));
            $("#txtAddEditRecordDataForwarder").prop("disabled", (forwarder == "this-server"));
            $("#txtAddEditRecordDataForwarder").val(forwarder);

            if (forwarder === "this-server") {
                $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr("disabled", true);
                $("#divAddEditRecordDataForwarderProxy").hide();
            }
            else {
                $("input[name=rdAddEditRecordDataForwarderProtocol]:radio").attr("disabled", false);
                $("#divAddEditRecordDataForwarderProxy").show();
            }

            $("#chkAddEditRecordDataForwarderDnssecValidation").prop("checked", divData.attr("data-record-dnssec-validation") === "true");

            var proxyType = divData.attr("data-record-proxy-type");
            $("#rdAddEditRecordDataForwarderProxyType" + proxyType).prop("checked", true);

            if (proxyType !== "None") {
                $("#txtAddEditRecordDataForwarderProxyAddress").val(divData.attr("data-record-proxy-address"));
                $("#txtAddEditRecordDataForwarderProxyPort").val(divData.attr("data-record-proxy-port"));
                $("#txtAddEditRecordDataForwarderProxyUsername").val(divData.attr("data-record-proxy-username"));
                $("#txtAddEditRecordDataForwarderProxyPassword").val(divData.attr("data-record-proxy-password"));
            }

            updateAddEditFormForwarderPlaceholder();
            updateAddEditFormForwarderProxyType();
            break;

        case "APP":
            $("#optAddEditRecordDataAppName").attr("disabled", true);
            $("#optAddEditRecordDataClassPath").attr("disabled", true);

            $("#optAddEditRecordDataAppName").html("<option>" + divData.attr("data-record-app-name") + "</option>")
            $("#optAddEditRecordDataAppName").val(divData.attr("data-record-app-name"))

            $("#optAddEditRecordDataClassPath").html("<option>" + divData.attr("data-record-classpath") + "</option>")
            $("#optAddEditRecordDataClassPath").val(divData.attr("data-record-classpath"))

            $("#txtAddEditRecordDataData").val(divData.attr("data-record-data"))
            break;

        default:
            $("#optAddEditRecordType").val("Unknown");
            $("#txtAddEditRecordDataUnknownType").val(type);
            $("#txtAddEditRecordDataUnknownType").prop("disabled", true);

            $("#txtAddEditRecordDataValue").val(divData.attr("data-record-rdata"));
            break;
    }

    $("#optAddEditRecordType").prop("disabled", true);

    $("#btnAddEditRecord").attr("data-id", id);
    $("#btnAddEditRecord").attr("onclick", "updateRecord(); return false;");

    $("#modalAddEditRecord").modal("show");

    setTimeout(function () {
        $("#txtAddEditRecordName").focus();
    }, 1000);
}

function updateRecord() {
    var btn = $("#btnAddEditRecord");
    var divAddEditRecordAlert = $("#divAddEditRecordAlert");

    var index = Number(btn.attr("data-id"));
    var divData = $("#data" + index);

    var zone = $("#titleEditZone").attr("data-zone");
    var type = divData.attr("data-record-type");
    var domain = divData.attr("data-record-name");

    if (domain === "")
        domain = ".";

    var newDomain;
    {
        var newSubDomain = $("#txtAddEditRecordName").val();
        if (newSubDomain === "")
            newSubDomain = "@";

        if (newSubDomain === "@")
            newDomain = zone;
        else if (zone === ".")
            newDomain = newSubDomain + ".";
        else
            newDomain = newSubDomain + "." + zone;
    }

    var ttl = $("#txtAddEditRecordTtl").val();
    var disable = (divData.attr("data-record-disabled") === "true");
    var comments = $("#txtAddEditRecordComments").val();

    var apiUrl = "";

    switch (type) {
        case "A":
        case "AAAA":
            var ipAddress = divData.attr("data-record-ip-address");

            var newIpAddress = $("#txtAddEditRecordDataValue").val();
            if (newIpAddress === "") {
                showAlert("warning", "Missing!", "Please enter an IP address to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&ipAddress=" + encodeURIComponent(ipAddress) + "&newIpAddress=" + encodeURIComponent(newIpAddress) + "&ptr=" + $("#chkAddEditRecordDataPtr").prop('checked') + "&createPtrZone=" + $("#chkAddEditRecordDataCreatePtrZone").prop('checked');
            break;

        case "NS":
            var nameServer = divData.attr("data-record-name-server");

            var newNameServer = $("#txtAddEditRecordDataNsNameServer").val();
            if (newNameServer === "") {
                showAlert("warning", "Missing!", "Please enter a name server to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataNsNameServer").focus();
                return;
            }

            var glue = cleanTextList($("#txtAddEditRecordDataNsGlue").val());

            apiUrl += "&nameServer=" + encodeURIComponent(nameServer) + "&newNameServer=" + encodeURIComponent(newNameServer) + "&glue=" + encodeURIComponent(glue);
            break;

        case "CNAME":
            var subDomainName = $("#txtAddEditRecordName").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the CNAME record.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var cname = $("#txtAddEditRecordDataValue").val();
            if (cname === "") {
                showAlert("warning", "Missing!", "Please enter a domain name to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&cname=" + encodeURIComponent(cname);
            break;

        case "SOA":
            var primaryNameServer = $("#txtEditRecordDataSoaPrimaryNameServer").val();
            if (primaryNameServer === "") {
                showAlert("warning", "Missing!", "Please enter a value for primary name server.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaPrimaryNameServer").focus();
                return;
            }

            var responsiblePerson = $("#txtEditRecordDataSoaResponsiblePerson").val();
            if (responsiblePerson === "") {
                showAlert("warning", "Missing!", "Please enter a value for responsible person.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaResponsiblePerson").focus();
                return;
            }

            var serial = $("#txtEditRecordDataSoaSerial").val();
            if (serial === "") {
                showAlert("warning", "Missing!", "Please enter a value for serial.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaSerial").focus();
                return;
            }

            var refresh = $("#txtEditRecordDataSoaRefresh").val();
            if (refresh === "") {
                showAlert("warning", "Missing!", "Please enter a value for refresh.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaRefresh").focus();
                return;
            }

            var retry = $("#txtEditRecordDataSoaRetry").val();
            if (retry === "") {
                showAlert("warning", "Missing!", "Please enter a value for retry.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaRetry").focus();
                return;
            }

            var expire = $("#txtEditRecordDataSoaExpire").val();
            if (expire === "") {
                showAlert("warning", "Missing!", "Please enter a value for expire.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaExpire").focus();
                return;
            }

            var minimum = $("#txtEditRecordDataSoaMinimum").val();
            if (minimum === "") {
                showAlert("warning", "Missing!", "Please enter a value for minimum.", divAddEditRecordAlert);
                $("#txtEditRecordDataSoaMinimum").focus();
                return;
            }

            var useSerialDateScheme = $("#chkEditRecordDataSoaUseSerialDateScheme").prop("checked");
            var primaryAddresses = cleanTextList($("#txtEditRecordDataSoaPrimaryAddresses").val());
            var zoneTransferProtocol = $('input[name=rdEditRecordDataSoaZoneTransferProtocol]:checked').val();
            var tsigKeyName = $("#optEditRecordDataSoaTsigKeyName").val();

            apiUrl += "&primaryNameServer=" + encodeURIComponent(primaryNameServer) +
                "&responsiblePerson=" + encodeURIComponent(responsiblePerson) +
                "&serial=" + encodeURIComponent(serial) +
                "&refresh=" + encodeURIComponent(refresh) +
                "&retry=" + encodeURIComponent(retry) +
                "&expire=" + encodeURIComponent(expire) +
                "&minimum=" + encodeURIComponent(minimum) +
                "&useSerialDateScheme=" + encodeURIComponent(useSerialDateScheme) +
                "&primaryAddresses=" + encodeURIComponent(primaryAddresses) +
                "&zoneTransferProtocol=" + encodeURIComponent(zoneTransferProtocol) +
                "&tsigKeyName=" + encodeURIComponent(tsigKeyName);

            break;

        case "PTR":
            var ptrName = divData.attr("data-record-ptr-name");

            var newPtrName = $("#txtAddEditRecordDataValue").val();
            if (newPtrName === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&ptrName=" + encodeURIComponent(ptrName) + "&newPtrName=" + encodeURIComponent(newPtrName);
            break;

        case "MX":
            var preference = divData.attr("data-record-preference");

            var newPreference = $("#txtAddEditRecordDataMxPreference").val();
            if (newPreference === "")
                newPreference = 1;

            var exchange = divData.attr("data-record-exchange");

            var newExchange = $("#txtAddEditRecordDataMxExchange").val();
            if (newExchange === "") {
                showAlert("warning", "Missing!", "Please enter a mail exchange domain name to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataMxExchange").focus();
                return;
            }

            apiUrl += "&preference=" + preference + "&newPreference=" + newPreference + "&exchange=" + encodeURIComponent(exchange) + "&newExchange=" + encodeURIComponent(newExchange);
            break;

        case "TXT":
            var text = divData.attr("data-record-text");

            var newText = $("#txtAddEditRecordDataValue").val();
            if (newText === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&text=" + encodeURIComponent(text) + "&newText=" + encodeURIComponent(newText);
            break;

        case "SRV":
            if ($("#txtAddEditRecordName").val() === "") {
                showAlert("warning", "Missing!", "Please enter a name that includes service and protocol labels.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var priority = divData.attr("data-record-priority");

            var newPriority = $("#txtAddEditRecordDataSrvPriority").val();
            if (newPriority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPriority").focus();
                return;
            }

            var weight = divData.attr("data-record-weight");

            var newWeight = $("#txtAddEditRecordDataSrvWeight").val();
            if (newWeight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvWeight").focus();
                return;
            }

            var port = divData.attr("data-record-port");

            var newPort = $("#txtAddEditRecordDataSrvPort").val();
            if (newPort === "") {
                showAlert("warning", "Missing!", "Please enter a suitable port number.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvPort").focus();
                return;
            }

            var target = divData.attr("data-record-target");

            var newTarget = $("#txtAddEditRecordDataSrvTarget").val();
            if (newTarget === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the target field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSrvTarget").focus();
                return;
            }

            apiUrl += "&priority=" + priority + "&newPriority=" + newPriority + "&weight=" + weight + "&newWeight=" + newWeight + "&port=" + port + "&newPort=" + newPort + "&target=" + encodeURIComponent(target) + "&newTarget=" + encodeURIComponent(newTarget);
            break;

        case "DNAME":
            var dname = $("#txtAddEditRecordDataValue").val();
            if (dname === "") {
                showAlert("warning", "Missing!", "Please enter a domain name to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&dname=" + encodeURIComponent(dname);
            break;

        case "DS":
            var subDomainName = $("#txtAddEditRecordName").val();
            if ((subDomainName === "") || (subDomainName === "@")) {
                showAlert("warning", "Missing!", "Please enter a name for the DS record.", divAddEditRecordAlert);
                $("#txtAddEditRecordName").focus();
                return;
            }

            var keyTag = divData.attr("data-record-key-tag");
            var algorithm = divData.attr("data-record-algorithm");
            var digestType = divData.attr("data-record-digest-type");

            var newKeyTag = $("#txtAddEditRecordDataDsKeyTag").val();
            if (newKeyTag === "") {
                showAlert("warning", "Missing!", "Please enter the Key Tag value to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataDsKeyTag").focus();
                return;
            }

            var newAlgorithm = $("#optAddEditRecordDataDsAlgorithm").val();
            if ((newAlgorithm === null) || (newAlgorithm === "")) {
                showAlert("warning", "Missing!", "Please select an DNSSEC algorithm to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataDsAlgorithm").focus();
                return;
            }

            var newDigestType = $("#optAddEditRecordDataDsDigestType").val();
            if ((newDigestType === null) || (newDigestType === "")) {
                showAlert("warning", "Missing!", "Please select a Digest Type to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataDsDigestType").focus();
                return;
            }

            var digest = divData.attr("data-record-digest");

            var newDigest = $("#txtAddEditRecordDataDsDigest").val();
            if (newDigest === "") {
                showAlert("warning", "Missing!", "Please enter the Digest hash in hex string format to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataDsDigest").focus();
                return;
            }

            apiUrl += "&keyTag=" + keyTag + "&algorithm=" + algorithm + "&digestType=" + digestType + "&newKeyTag=" + newKeyTag + "&newAlgorithm=" + newAlgorithm + "&newDigestType=" + newDigestType + "&digest=" + encodeURIComponent(digest) + "&newDigest=" + encodeURIComponent(newDigest);
            break;

        case "SSHFP":
            var sshfpAlgorithm = divData.attr("data-record-algorithm");
            var sshfpFingerprintType = divData.attr("data-record-fingerprint-type");
            var sshfpFingerprint = divData.attr("data-record-fingerprint");

            var newSshfpAlgorithm = $("#optAddEditRecordDataSshfpAlgorithm").val();
            if ((newSshfpAlgorithm === null) || (newSshfpAlgorithm === "")) {
                showAlert("warning", "Missing!", "Please select an Algorithm to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataSshfpAlgorithm").focus();
                return;
            }

            var newSshfpFingerprintType = $("#optAddEditRecordDataSshfpFingerprintType").val();
            if ((newSshfpFingerprintType === null) || (newSshfpFingerprintType === "")) {
                showAlert("warning", "Missing!", "Please select a Fingerprint Type to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataSshfpFingerprintType").focus();
                return;
            }

            var newSshfpFingerprint = $("#txtAddEditRecordDataSshfpFingerprint").val();
            if (newSshfpFingerprint === "") {
                showAlert("warning", "Missing!", "Please enter the Fingerprint hash in hex string format to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSshfpFingerprint").focus();
                return;
            }

            apiUrl += "&sshfpAlgorithm=" + sshfpAlgorithm + "&newSshfpAlgorithm=" + newSshfpAlgorithm + "&sshfpFingerprintType=" + sshfpFingerprintType + "&newSshfpFingerprintType=" + newSshfpFingerprintType + "&sshfpFingerprint=" + encodeURIComponent(sshfpFingerprint) + "&newSshfpFingerprint=" + encodeURIComponent(newSshfpFingerprint);
            break;

        case "TLSA":
            var tlsaCertificateUsage = divData.attr("data-record-certificate-usage");
            var tlsaSelector = divData.attr("data-record-selector");
            var tlsaMatchingType = divData.attr("data-record-matching-type");
            var tlsaCertificateAssociationData = divData.attr("data-record-certificate-association-data");

            var newTlsaCertificateUsage = $("#optAddEditRecordDataTlsaCertificateUsage").val();
            if ((newTlsaCertificateUsage === null) || (newTlsaCertificateUsage === "")) {
                showAlert("warning", "Missing!", "Please select a Certificate Usage to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaCertificateUsage").focus();
                return;
            }

            var newTlsaSelector = $("#optAddEditRecordDataTlsaSelector").val();
            if ((newTlsaSelector === null) || (newTlsaSelector === "")) {
                showAlert("warning", "Missing!", "Please select a Selector to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaSelector").focus();
                return;
            }

            var newTlsaMatchingType = $("#optAddEditRecordDataTlsaMatchingType").val();
            if ((newTlsaMatchingType === null) || (newTlsaMatchingType === "")) {
                showAlert("warning", "Missing!", "Please select a Matching Type to update the record.", divAddEditRecordAlert);
                $("#optAddEditRecordDataTlsaMatchingType").focus();
                return;
            }

            var newTlsaCertificateAssociationData = $("#txtAddEditRecordDataTlsaCertificateAssociationData").val();
            if (newTlsaCertificateAssociationData === "") {
                showAlert("warning", "Missing!", "Please enter the Certificate Association Data to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataTlsaCertificateAssociationData").focus();
                return;
            }

            apiUrl += "&tlsaCertificateUsage=" + tlsaCertificateUsage + "&newTlsaCertificateUsage=" + newTlsaCertificateUsage + "&tlsaSelector=" + tlsaSelector + "&newTlsaSelector=" + newTlsaSelector + "&tlsaMatchingType=" + tlsaMatchingType + "&newTlsaMatchingType=" + newTlsaMatchingType + "&tlsaCertificateAssociationData=" + encodeURIComponent(tlsaCertificateAssociationData) + "&newTlsaCertificateAssociationData=" + encodeURIComponent(newTlsaCertificateAssociationData);
            break;

        case "SVCB":
        case "HTTPS":
            var svcPriority = divData.attr("data-record-svc-priority");
            var svcTargetName = divData.attr("data-record-svc-target-name");
            var svcParams = "";
            {
                var jsonSvcParams = JSON.parse(divData.attr("data-record-svc-params"));

                for (var paramKey in jsonSvcParams) {
                    if (svcParams.length === 0)
                        svcParams = paramKey + "|" + jsonSvcParams[paramKey];
                    else
                        svcParams += "|" + paramKey + "|" + jsonSvcParams[paramKey];
                }

                if (svcParams.length === 0)
                    svcParams = false;
            }

            var newSvcPriority = $("#txtAddEditRecordDataSvcbPriority").val();
            if ((newSvcPriority === null) || (newSvcPriority === "")) {
                showAlert("warning", "Missing!", "Please enter a Priority value to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSvcbPriority").focus();
                return;
            }

            var newSvcTargetName = $("#txtAddEditRecordDataSvcbTargetName").val();
            if ((newSvcTargetName === null) || (newSvcTargetName === "")) {
                showAlert("warning", "Missing!", "Please enter a Target Name to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataSvcbTargetName").focus();
                return;
            }

            var newSvcParams = serializeTableData($("#tableAddEditRecordDataSvcbParams"), 2, divAddEditRecordAlert);
            if (newSvcParams === false)
                return;

            if (newSvcParams.length === 0)
                newSvcParams = false;

            apiUrl += "&svcPriority=" + svcPriority + "&newSvcPriority=" + newSvcPriority + "&svcTargetName=" + encodeURIComponent(svcTargetName) + "&newSvcTargetName=" + encodeURIComponent(newSvcTargetName) + "&svcParams=" + encodeURIComponent(svcParams) + "&newSvcParams=" + encodeURIComponent(newSvcParams);
            break;

        case "URI":
            var uriPriority = divData.attr("data-record-priority");

            var newUriPriority = $("#txtAddEditRecordDataUriPriority").val();
            if (newUriPriority === "") {
                showAlert("warning", "Missing!", "Please enter a suitable priority.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUriPriority").focus();
                return;
            }

            var uriWeight = divData.attr("data-record-weight");

            var newUriWeight = $("#txtAddEditRecordDataUriWeight").val();
            if (newUriWeight === "") {
                showAlert("warning", "Missing!", "Please enter a suitable weight.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUriWeight").focus();
                return;
            }

            var uri = divData.attr("data-record-uri");

            var newUri = $("#txtAddEditRecordDataUri").val();
            if (newUri === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the URI field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataUri").focus();
                return;
            }

            apiUrl += "&uriPriority=" + uriPriority + "&newUriPriority=" + newUriPriority + "&uriWeight=" + uriWeight + "&newUriWeight=" + newUriWeight + "&uri=" + encodeURIComponent(uri) + "&newUri=" + encodeURIComponent(newUri);
            break;

        case "CAA":
            var flags = divData.attr("data-record-flags");
            var tag = divData.attr("data-record-tag");

            var newFlags = $("#txtAddEditRecordDataCaaFlags").val();
            if (newFlags === "")
                newFlags = 0;

            var newTag = $("#txtAddEditRecordDataCaaTag").val();
            if (newTag === "")
                newTag = "issue";

            var value = divData.attr("data-record-value");

            var newValue = $("#txtAddEditRecordDataCaaValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the authority field.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataCaaValue").focus();
                return;
            }

            apiUrl += "&flags=" + flags + "&tag=" + encodeURIComponent(tag) + "&newFlags=" + newFlags + "&newTag=" + encodeURIComponent(newTag) + "&value=" + encodeURIComponent(value) + "&newValue=" + encodeURIComponent(newValue);
            break;

        case "ANAME":
            var aname = divData.attr("data-record-aname");

            var newAName = $("#txtAddEditRecordDataValue").val();
            if (newAName === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&aname=" + encodeURIComponent(aname) + "&newAName=" + encodeURIComponent(newAName);
            break;

        case "FWD":
            var protocol = divData.attr("data-record-protocol");
            var newProtocol = $("input[name=rdAddEditRecordDataForwarderProtocol]:checked").val();

            var forwarder = divData.attr("data-record-forwarder");

            var newForwarder = $("#txtAddEditRecordDataForwarder").val();
            if (newForwarder === "") {
                showAlert("warning", "Missing!", "Please enter a domain name or IP address or URL as a forwarder to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataForwarder").focus();
                return;
            }

            var dnssecValidation = $("#chkAddEditRecordDataForwarderDnssecValidation").prop("checked");

            apiUrl += "&protocol=" + protocol + "&newProtocol=" + newProtocol + "&forwarder=" + encodeURIComponent(forwarder) + "&newForwarder=" + encodeURIComponent(newForwarder) + "&dnssecValidation=" + dnssecValidation;

            if (newForwarder !== "this-server") {
                var proxyType = $("input[name=rdAddEditRecordDataForwarderProxyType]:checked").val();

                apiUrl += "&proxyType=" + proxyType;

                if (proxyType != "None") {
                    var proxyAddress = $("#txtAddEditRecordDataForwarderProxyAddress").val();
                    var proxyPort = $("#txtAddEditRecordDataForwarderProxyPort").val();
                    var proxyUsername = $("#txtAddEditRecordDataForwarderProxyUsername").val();
                    var proxyPassword = $("#txtAddEditRecordDataForwarderProxyPassword").val();

                    if ((proxyAddress == null) || (proxyAddress === "")) {
                        showAlert("warning", "Missing!", "Please enter a domain name or IP address for Proxy Server Address to update the record.", divAddEditRecordAlert);
                        $("#txtAddEditRecordDataForwarderProxyAddress").focus();
                        return;
                    }

                    if ((proxyPort == null) || (proxyPort === "")) {
                        showAlert("warning", "Missing!", "Please enter a port number for Proxy Server Port to update the record.", divAddEditRecordAlert);
                        $("#txtAddEditRecordDataForwarderProxyPort").focus();
                        return;
                    }

                    apiUrl += "&proxyAddress=" + encodeURIComponent(proxyAddress) + "&proxyPort=" + proxyPort + "&proxyUsername=" + encodeURIComponent(proxyUsername) + "&proxyPassword=" + encodeURIComponent(proxyPassword);
                }
            }
            break;

        case "APP":
            apiUrl += "&appName=" + encodeURIComponent(divData.attr("data-record-app-name")) + "&classPath=" + encodeURIComponent(divData.attr("data-record-classpath")) + "&recordData=" + encodeURIComponent($("#txtAddEditRecordDataData").val());
            break;

        default:
            type = $("#txtAddEditRecordDataUnknownType").val();
            var rdata = divData.attr("data-record-rdata");

            var newRData = $("#txtAddEditRecordDataValue").val();
            if ((newRData === null) || (newRData === "")) {
                showAlert("warning", "Missing!", "Please enter a hex value as the RDATA to update the record.", divAddEditRecordAlert);
                $("#txtAddEditRecordDataValue").focus();
                return;
            }

            apiUrl += "&rdata=" + encodeURIComponent(rdata) + "&newRData=" + encodeURIComponent(newRData);
            break;
    }

    apiUrl = "/api/zones/records/update?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone) + "&type=" + encodeURIComponent(type) + "&domain=" + encodeURIComponent(domain) + "&newDomain=" + encodeURIComponent(newDomain) + "&ttl=" + ttl + "&disable=" + disable + "&comments=" + encodeURIComponent(comments) + apiUrl;

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            $("#modalAddEditRecord").modal("hide");

            //update local data
            editZoneInfo = responseJSON.response.zone;
            editZoneRecords[index] = responseJSON.response.updatedRecord;

            //show record
            var zoneType;
            if (responseJSON.response.zone.internal)
                zoneType = "Internal";
            else
                zoneType = responseJSON.response.zone.type;

            var tableHtmlRow = getZoneRecordRowHtml(index, zone, zoneType, responseJSON.response.updatedRecord);
            $("#trZoneRecord" + index).replaceWith(tableHtmlRow);

            showAlert("success", "Record Updated!", "Resource record was updated successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            $("#modalAddEditRecord").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divAddEditRecordAlert
    });
}

function updateRecordState(objBtn, disable) {
    var btn = $(objBtn);
    var index = Number(btn.attr("data-id"));
    var divData = $("#data" + index);

    var type = divData.attr("data-record-type");
    var domain = divData.attr("data-record-name");
    var ttl = divData.attr("data-record-ttl");
    var comments = divData.attr("data-record-comments");

    if (domain === "")
        domain = ".";

    if (disable && !confirm("Are you sure to disable the " + type + " record '" + domain + "'?"))
        return;

    var apiUrl = "/api/zones/records/update?token=" + sessionData.token + "&type=" + encodeURIComponent(type) + "&domain=" + encodeURIComponent(domain) + "&ttl=" + ttl + "&disable=" + disable + "&comments=" + encodeURIComponent(comments);

    switch (type) {
        case "A":
        case "AAAA":
            apiUrl += "&ipAddress=" + encodeURIComponent(divData.attr("data-record-ip-address"));
            break;

        case "NS":
            apiUrl += "&nameServer=" + encodeURIComponent(divData.attr("data-record-name-server")) + "&glue=" + encodeURIComponent(divData.attr("data-record-glue"));
            break;

        case "CNAME":
            apiUrl += "&cname=" + encodeURIComponent(divData.attr("data-record-cname"));
            break;

        case "PTR":
            apiUrl += "&ptrName=" + encodeURIComponent(divData.attr("data-record-ptr-name"));
            break;

        case "MX":
            apiUrl += "&preference=" + divData.attr("data-record-preference") + "&exchange=" + encodeURIComponent(divData.attr("data-record-exchange"));
            break;

        case "TXT":
            apiUrl += "&text=" + encodeURIComponent(divData.attr("data-record-text"));
            break;

        case "SRV":
            apiUrl += "&priority=" + divData.attr("data-record-priority") + "&weight=" + divData.attr("data-record-weight") + "&port=" + divData.attr("data-record-port") + "&target=" + encodeURIComponent(divData.attr("data-record-target"));
            break;

        case "DNAME":
            apiUrl += "&dname=" + encodeURIComponent(divData.attr("data-record-dname"));
            break;

        case "DS":
            apiUrl += "&keyTag=" + divData.attr("data-record-key-tag") + "&algorithm=" + divData.attr("data-record-algorithm") + "&digestType=" + divData.attr("data-record-digest-type") + "&digest=" + encodeURIComponent(divData.attr("data-record-digest"));
            break;

        case "SSHFP":
            apiUrl += "&sshfpAlgorithm=" + divData.attr("data-record-algorithm") + "&sshfpFingerprintType=" + divData.attr("data-record-fingerprint-type") + "&sshfpFingerprint=" + encodeURIComponent(divData.attr("data-record-fingerprint"));
            break;

        case "TLSA":
            apiUrl += "&tlsaCertificateUsage=" + divData.attr("data-record-certificate-usage") + "&tlsaSelector=" + divData.attr("data-record-selector") + "&tlsaMatchingType=" + divData.attr("data-record-matching-type") + "&tlsaCertificateAssociationData=" + encodeURIComponent(divData.attr("data-record-certificate-association-data"));
            break;

        case "SVCB":
        case "HTTPS":
            var svcPriority = divData.attr("data-record-svc-priority");
            var svcTargetName = divData.attr("data-record-svc-target-name");
            var svcParams = "";
            {
                var jsonSvcParams = JSON.parse(divData.attr("data-record-svc-params"));

                for (var paramKey in jsonSvcParams) {
                    if (svcParams.length == 0)
                        svcParams = paramKey + "|" + jsonSvcParams[paramKey];
                    else
                        svcParams += "|" + paramKey + "|" + jsonSvcParams[paramKey];
                }

                if (svcParams.length === 0)
                    svcParams = false;
            }

            apiUrl += "&svcPriority=" + svcPriority + "&svcTargetName=" + encodeURIComponent(svcTargetName) + "&svcParams=" + encodeURIComponent(svcParams);
            break;

        case "URI":
            apiUrl += "&uriPriority=" + divData.attr("data-record-priority") + "&uriWeight=" + encodeURIComponent(divData.attr("data-record-weight")) + "&uri=" + encodeURIComponent(divData.attr("data-record-uri"));
            break;

        case "CAA":
            apiUrl += "&flags=" + divData.attr("data-record-flags") + "&tag=" + encodeURIComponent(divData.attr("data-record-tag")) + "&value=" + encodeURIComponent(divData.attr("data-record-value"));
            break;

        case "ANAME":
            apiUrl += "&aname=" + encodeURIComponent(divData.attr("data-record-aname"));
            break;

        case "FWD":
            apiUrl += "&protocol=" + divData.attr("data-record-protocol") + "&forwarder=" + encodeURIComponent(divData.attr("data-record-forwarder"));

            var proxyType = divData.attr("data-record-proxy-type");

            apiUrl += "&dnssecValidation=" + divData.attr("data-record-dnssec-validation") + "&proxyType=" + proxyType;

            if (proxyType != "None") {
                apiUrl += "&proxyAddress=" + encodeURIComponent(divData.attr("data-record-proxy-address")) + "&proxyPort=" + divData.attr("data-record-proxy-port") + "&proxyUsername=" + encodeURIComponent(divData.attr("data-record-proxy-username")) + "&proxyPassword=" + encodeURIComponent(divData.attr("data-record-proxy-password"));
            }
            break;

        case "APP":
            apiUrl += "&appName=" + encodeURIComponent(divData.attr("data-record-app-name")) + "&classPath=" + encodeURIComponent(divData.attr("data-record-classpath")) + "&recordData=" + encodeURIComponent(divData.attr("data-record-data"));
            break;

        default:
            apiUrl += "&rdata=" + encodeURIComponent(divData.attr("data-record-rdata"));
            break;
    }

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            btn.button("reset");

            //update local arrays
            editZoneRecords[index] = responseJSON.response.updatedRecord;

            //set new state
            divData.attr("data-record-disabled", disable);

            if (disable) {
                $("#btnEnableRecord" + index).show();
                $("#btnDisableRecord" + index).hide();

                showAlert("success", "Record Disabled!", "Resource record was disabled successfully.");
            }
            else {
                $("#btnEnableRecord" + index).hide();
                $("#btnDisableRecord" + index).show();

                showAlert("success", "Record Enabled!", "Resource record was enabled successfully.");
            }
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function deleteRecord(objBtn) {
    var btn = $(objBtn);
    var index = btn.attr("data-id");
    var divData = $("#data" + index);

    var zone = $("#titleEditZone").attr("data-zone");
    var domain = divData.attr("data-record-name");
    var type = divData.attr("data-record-type");

    if (domain === "")
        domain = ".";

    if (!confirm("Are you sure to permanently delete the " + type + " record '" + domain + "'?"))
        return;

    var apiUrl = "/api/zones/records/delete?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone) + "&domain=" + encodeURIComponent(domain) + "&type=" + encodeURIComponent(type);

    switch (type) {
        case "A":
        case "AAAA":
            apiUrl += "&ipAddress=" + encodeURIComponent(divData.attr("data-record-ip-address"));
            break;

        case "NS":
            apiUrl += "&nameServer=" + encodeURIComponent(divData.attr("data-record-name-server"));
            break;

        case "PTR":
            apiUrl += "&ptrName=" + encodeURIComponent(divData.attr("data-record-ptr-name"));
            break;

        case "MX":
            apiUrl += "&preference=" + divData.attr("data-record-preference") + "&exchange=" + encodeURIComponent(divData.attr("data-record-exchange"));
            break;

        case "TXT":
            apiUrl += "&text=" + encodeURIComponent(divData.attr("data-record-text"));
            break;

        case "SRV":
            apiUrl += "&priority=" + divData.attr("data-record-priority") + "&weight=" + divData.attr("data-record-weight") + "&port=" + divData.attr("data-record-port") + "&target=" + encodeURIComponent(divData.attr("data-record-target"));
            break;

        case "DS":
            apiUrl += "&keyTag=" + divData.attr("data-record-key-tag") + "&algorithm=" + divData.attr("data-record-algorithm") + "&digestType=" + divData.attr("data-record-digest-type") + "&digest=" + encodeURIComponent(divData.attr("data-record-digest"));
            break;

        case "SSHFP":
            apiUrl += "&sshfpAlgorithm=" + divData.attr("data-record-algorithm") + "&sshfpFingerprintType=" + divData.attr("data-record-fingerprint-type") + "&sshfpFingerprint=" + encodeURIComponent(divData.attr("data-record-fingerprint"));
            break;

        case "TLSA":
            apiUrl += "&tlsaCertificateUsage=" + divData.attr("data-record-certificate-usage") + "&tlsaSelector=" + divData.attr("data-record-selector") + "&tlsaMatchingType=" + divData.attr("data-record-matching-type") + "&tlsaCertificateAssociationData=" + encodeURIComponent(divData.attr("data-record-certificate-association-data"));
            break;

        case "SVCB":
        case "HTTPS":
            var svcPriority = divData.attr("data-record-svc-priority");
            var svcTargetName = divData.attr("data-record-svc-target-name");
            var svcParams = "";
            {
                var jsonSvcParams = JSON.parse(divData.attr("data-record-svc-params"));

                for (var paramKey in jsonSvcParams) {
                    if (svcParams.length == 0)
                        svcParams = paramKey + "|" + jsonSvcParams[paramKey];
                    else
                        svcParams += "|" + paramKey + "|" + jsonSvcParams[paramKey];
                }

                if (svcParams.length === 0)
                    svcParams = false;
            }

            apiUrl += "&svcPriority=" + svcPriority + "&svcTargetName=" + encodeURIComponent(svcTargetName) + "&svcParams=" + encodeURIComponent(svcParams);
            break;

        case "URI":
            apiUrl += "&uriPriority=" + divData.attr("data-record-priority") + "&uriWeight=" + encodeURIComponent(divData.attr("data-record-weight")) + "&uri=" + encodeURIComponent(divData.attr("data-record-uri"));
            break;

        case "CAA":
            apiUrl += "&flags=" + divData.attr("data-record-flags") + "&tag=" + encodeURIComponent(divData.attr("data-record-tag")) + "&value=" + encodeURIComponent(divData.attr("data-record-value"));
            break;

        case "ANAME":
            apiUrl += "&aname=" + encodeURIComponent(divData.attr("data-record-aname"));
            break;

        case "FWD":
            apiUrl += "&protocol=" + divData.attr("data-record-protocol") + "&forwarder=" + encodeURIComponent(divData.attr("data-record-forwarder"));
            break;

        default:
            var rdata = divData.attr("data-record-rdata");
            if (rdata != null)
                apiUrl += "&rdata=" + encodeURIComponent(rdata);
    }

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            //update local array
            editZoneRecords.splice(index, 1);

            //show page
            showEditZonePage();

            showAlert("success", "Record Deleted!", "Resource record was deleted successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            showPageLogin();
        }
    });
}

function showSignZoneModal(zoneName) {
    $("#divDnssecSignZoneAlert").html("");
    $("#lblDnssecSignZoneZoneName").text(zoneName === "." ? "<root>" : zoneName);
    $("#lblDnssecSignZoneZoneName").attr("data-zone", zoneName);
    $("#rdDnssecSignZoneAlgorithmEcdsa").prop("checked", true);

    $("#divDnssecSignZoneRsaParameters").hide();
    $("#optDnssecSignZoneRsaHashAlgorithm").val("SHA256");
    $("#optDnssecSignZoneRsaKSKKeySize").val("2048");
    $("#optDnssecSignZoneRsaZSKKeySize").val("1280");

    $("#divDnssecSignZoneEcdsaParameters").show();
    $("#optDnssecSignZoneEcdsaCurve").val("P256");

    $("#rdDnssecSignZoneNxProofNSEC").prop("checked", true);

    $("#divDnssecSignZoneNSEC3Parameters").hide();
    $("#txtDnssecSignZoneNSEC3Iterations").val("0");
    $("#txtDnssecSignZoneNSEC3SaltLength").val("0");

    $("#txtDnssecSignZoneDnsKeyTtl").val("3600");
    $("#txtDnssecSignZoneZskAutoRollover").val("30");

    $("#modalDnssecSignZone").modal("show");
}

function signPrimaryZone() {
    var divDnssecSignZoneAlert = $("#divDnssecSignZoneAlert");
    var zone = $("#lblDnssecSignZoneZoneName").attr("data-zone");
    var algorithm = $("input[name=rdDnssecSignZoneAlgorithm]:checked").val();
    var dnsKeyTtl = $("#txtDnssecSignZoneDnsKeyTtl").val();
    var zskRolloverDays = $("#txtDnssecSignZoneZskAutoRollover").val();
    var nxProof = $("input[name=rdDnssecSignZoneNxProof]:checked").val();

    var additionalParameters = "";

    if (nxProof === "NSEC3") {
        var iterations = $("#txtDnssecSignZoneNSEC3Iterations").val();
        var saltLength = $("#txtDnssecSignZoneNSEC3SaltLength").val();

        additionalParameters += "&iterations=" + iterations + "&saltLength=" + saltLength;
    }

    switch (algorithm) {
        case "RSA":
            var hashAlgorithm = $("#optDnssecSignZoneRsaHashAlgorithm").val();
            var kskKeySize = $("#optDnssecSignZoneRsaKSKKeySize").val();
            var zskKeySize = $("#optDnssecSignZoneRsaZSKKeySize").val();

            additionalParameters += "&hashAlgorithm=" + hashAlgorithm + "&kskKeySize=" + kskKeySize + "&zskKeySize=" + zskKeySize;
            break;

        case "ECDSA":
            var curve = $("#optDnssecSignZoneEcdsaCurve").val();

            additionalParameters += "&curve=" + curve;
            break;
    }

    var btn = $("#btnDnssecSignZone");
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/sign?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone) + "&algorithm=" + algorithm + "&dnsKeyTtl=" + dnsKeyTtl + "&zskRolloverDays=" + zskRolloverDays + "&nxProof=" + nxProof + additionalParameters,
        success: function (responseJSON) {
            btn.button("reset");
            $("#modalDnssecSignZone").modal("hide");

            var zoneHideDnssecRecords = (localStorage.getItem("zoneHideDnssecRecords") == "true");
            if (zoneHideDnssecRecords) {
                $("#titleDnssecStatusEditZone").show();

                $("#lnkZoneDnssecSignZone").hide();

                $("#lnkZoneDnssecHideRecords").hide();
                $("#lnkZoneDnssecShowRecords").show();

                $("#lnkZoneDnssecProperties").show();
                $("#lnkZoneDnssecUnsignZone").show();

                $("#optAddEditRecordTypeDs").show();
                $("#optAddEditRecordTypeSshfp").show();
                $("#optAddEditRecordTypeTlsa").show();
                $("#optAddEditRecordTypeAName").hide();
                $("#optAddEditRecordTypeApp").hide();
            }
            else {
                showEditZone(zone);
            }

            showAlert("success", "Zone Signed!", "The primary zone was signed successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecSignZone").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecSignZoneAlert
    });
}

function showUnsignZoneModal(zoneName) {
    $("#divDnssecUnsignZoneAlert").html("");
    $("#lblDnssecUnsignZoneZoneName").text(zoneName === "." ? "<root>" : zoneName);
    $("#lblDnssecUnsignZoneZoneName").attr("data-zone", zoneName);

    $("#modalDnssecUnsignZone").modal("show");
}

function unsignPrimaryZone() {
    var divDnssecUnsignZoneAlert = $("#divDnssecUnsignZoneAlert");
    var zone = $("#lblDnssecUnsignZoneZoneName").attr("data-zone");

    var btn = $("#btnDnssecUnsignZone");
    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/unsign?token=" + sessionData.token + "&zone=" + encodeURIComponent(zone),
        success: function (responseJSON) {
            btn.button("reset");
            $("#modalDnssecUnsignZone").modal("hide");

            var zoneHideDnssecRecords = (localStorage.getItem("zoneHideDnssecRecords") == "true");
            if (zoneHideDnssecRecords) {
                $("#titleDnssecStatusEditZone").hide();

                $("#lnkZoneDnssecSignZone").show();

                $("#lnkZoneDnssecHideRecords").hide();
                $("#lnkZoneDnssecShowRecords").hide();

                $("#lnkZoneDnssecProperties").hide();
                $("#lnkZoneDnssecUnsignZone").hide();

                $("#optAddEditRecordTypeDs").hide();
                $("#optAddEditRecordTypeSshfp").hide();
                $("#optAddEditRecordTypeTlsa").hide();
                $("#optAddEditRecordTypeAName").show();
                $("#optAddEditRecordTypeApp").show();
            }
            else {
                showEditZone(zone);
            }

            showAlert("success", "Zone Unsigned!", "The primary zone was unsigned successfully.");
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecUnsignZone").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecUnsignZoneAlert
    });
}

function showDnssecPropertiesModal(zoneName) {
    var divDnssecPropertiesLoader = $("#divDnssecPropertiesLoader");
    var divDnssecProperties = $("#divDnssecProperties");

    $("#divDnssecPropertiesAlert").html("");
    $("#lblDnssecPropertiesZoneName").text(zoneName === "." ? "<root>" : zoneName);
    $("#lblDnssecPropertiesZoneName").attr("data-zone", zoneName);

    $("#divDnssecPropertiesGenerateKey").collapse("hide");
    $("#optDnssecPropertiesGenerateKeyKeyType").val("KeySigningKey");
    $("#divDnssecPropertiesGenerateKeyAutomaticRollover").hide();
    $("#txtDnssecPropertiesGenerateKeyAutomaticRollover").val(0);
    $("#divDnssecPropertiesGenerateKeyRsaParameters").hide();
    $("#optDnssecPropertiesGenerateKeyRsaHashAlgorithm").val("SHA256");
    $("#optDnssecPropertiesGenerateKeyRsaKeySize").val("1024");
    $("#divDnssecPropertiesGenerateKeyEcdsaParameters").show();
    $("#optDnssecPropertiesGenerateKeyAlgorithm").val("ECDSA");

    divDnssecPropertiesLoader.show();
    divDnssecProperties.hide();

    $("#modalDnssecProperties").modal("show");

    refreshDnssecProperties(divDnssecPropertiesLoader);
}

function refreshDnssecProperties(divDnssecPropertiesLoader) {
    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/get?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            var tableHtmlRows = "";
            var foundGeneratedKey = false;

            for (var i = 0; i < responseJSON.response.dnssecPrivateKeys.length; i++) {
                var id = Math.floor(Math.random() * 10000);

                tableHtmlRows += "<tr id=\"trDnssecPropertiesPrivateKey" + id + "\">"
                    + "<td>" + responseJSON.response.dnssecPrivateKeys[i].keyTag + "</td>"
                    + "<td>" + responseJSON.response.dnssecPrivateKeys[i].keyType + "</td>"
                    + "<td>" + responseJSON.response.dnssecPrivateKeys[i].algorithm + "</td>"
                    + "<td>" + responseJSON.response.dnssecPrivateKeys[i].state + "</td>"
                    + "<td>" + moment(responseJSON.response.dnssecPrivateKeys[i].stateChangedOn).local().format("YYYY-MM-DD HH:mm");

                if (responseJSON.response.dnssecPrivateKeys[i].stateReadyBy != null)
                    tableHtmlRows += "</br>(ready by: " + moment(responseJSON.response.dnssecPrivateKeys[i].stateReadyBy).local().format("YYYY-MM-DD HH:mm") + ")";

                tableHtmlRows += "</td><td>";

                if (responseJSON.response.dnssecPrivateKeys[i].keyType === "ZoneSigningKey") {
                    switch (responseJSON.response.dnssecPrivateKeys[i].state) {
                        case "Generated":
                        case "Published":
                        case "Ready":
                        case "Active":
                            if (responseJSON.response.dnssecPrivateKeys[i].isRetiring) {
                                tableHtmlRows += "-";
                            }
                            else {
                                tableHtmlRows += "<input id=\"txtDnssecPropertiesPrivateKeyAutomaticRollover" + id + "\" type=\"text\" placeholder=\"days\" style=\"width: 40px;\" value=\"" + responseJSON.response.dnssecPrivateKeys[i].rolloverDays + "\" />" +
                                    "<button type=\"button\" class=\"btn btn-default\" style=\"padding: 2px 6px; margin-top: -2px; margin-left: 4px; font-size: 12px; height: 26px; width: 46px;\" data-id=\"" + id + "\" data-loading-text=\"Save\" onclick=\"updateDnssecPrivateKey(" + responseJSON.response.dnssecPrivateKeys[i].keyTag + ", this);\">Save</button>";
                            }
                            break;

                        default:
                            tableHtmlRows += "-";
                            break;
                    }
                }
                else {
                    tableHtmlRows += "-";
                }

                tableHtmlRows += "</td>" +
                    "<td align=\"right\">";

                switch (responseJSON.response.dnssecPrivateKeys[i].state) {
                    case "Generated":
                        tableHtmlRows += "<div class=\"dropdown\"><a href=\"#\" id=\"btnDnssecPropertiesDnsKeyRowOption" + id + "\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"><span class=\"glyphicon glyphicon-option-vertical\" aria-hidden=\"true\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">";
                        tableHtmlRows += "<li><a href=\"#\" onclick=\"deleteDnssecPrivateKey(" + responseJSON.response.dnssecPrivateKeys[i].keyTag + ", '" + id + "'); return false;\">Delete</a></li>";
                        tableHtmlRows += "</ul></div>";
                        foundGeneratedKey = true;
                        break;

                    case "Ready":
                    case "Active":
                        if (!responseJSON.response.dnssecPrivateKeys[i].isRetiring) {
                            tableHtmlRows += "<div class=\"dropdown\"><a href=\"#\" id=\"btnDnssecPropertiesDnsKeyRowOption" + id + "\" class=\"dropdown-toggle\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"true\"><span class=\"glyphicon glyphicon-option-vertical\" aria-hidden=\"true\"></span></a><ul class=\"dropdown-menu dropdown-menu-right\">";
                            tableHtmlRows += "<li><a href=\"#\" onclick=\"rolloverDnssecDnsKey(" + responseJSON.response.dnssecPrivateKeys[i].keyTag + ", '" + id + "'); return false;\">Rollover</a></li>";
                            tableHtmlRows += "<li><a href=\"#\" onclick=\"retireDnssecDnsKey(" + responseJSON.response.dnssecPrivateKeys[i].keyTag + ", '" + id + "'); return false;\">Retire</a></li>";
                            tableHtmlRows += "</ul></div>";
                        }
                        break;
                }

                tableHtmlRows += "</td></tr>";
            }

            $("#tableDnssecPropertiesPrivateKeysBody").html(tableHtmlRows);
            $("#btnDnssecPropertiesPublishKeys").prop("disabled", !foundGeneratedKey);

            switch (responseJSON.response.dnssecStatus) {
                case "SignedWithNSEC":
                    $("#rdDnssecPropertiesNxProofNSEC").prop("checked", true);

                    $("#divDnssecPropertiesNSEC3Parameters").hide();
                    $("#txtDnssecPropertiesNSEC3Iterations").val(0);
                    $("#txtDnssecPropertiesNSEC3SaltLength").val(0);

                    $("#btnDnssecPropertiesChangeNxProof").attr("data-nx-proof", "NSEC");
                    break;

                case "SignedWithNSEC3":
                    $("#rdDnssecPropertiesNxProofNSEC3").prop("checked", true);

                    $("#divDnssecPropertiesNSEC3Parameters").show();
                    $("#txtDnssecPropertiesNSEC3Iterations").val(responseJSON.response.nsec3Iterations);
                    $("#txtDnssecPropertiesNSEC3SaltLength").val(responseJSON.response.nsec3SaltLength);

                    $("#btnDnssecPropertiesChangeNxProof").attr("data-nx-proof", "NSEC3");
                    $("#btnDnssecPropertiesChangeNxProof").attr("data-nsec3-iterations", responseJSON.response.nsec3Iterations);
                    $("#btnDnssecPropertiesChangeNxProof").attr("data-nsec3-salt-length", responseJSON.response.nsec3SaltLength);
                    break;
            }

            $("#txtDnssecPropertiesDnsKeyTtl").val(responseJSON.response.dnsKeyTtl);

            if (divDnssecPropertiesLoader != null)
                divDnssecPropertiesLoader.hide();

            $("#divDnssecProperties").show();
        },
        error: function () {
            if (divDnssecPropertiesLoader != null)
                divDnssecPropertiesLoader.hide();
        },
        invalidToken: function () {
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert,
        objLoaderPlaceholder: divDnssecPropertiesLoader
    });
}

function updateDnssecPrivateKey(keyTag, objBtn) {
    var btn = $(objBtn);
    var id = btn.attr("data-id");
    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");
    var rolloverDays = $("#txtDnssecPropertiesPrivateKeyAutomaticRollover" + id).val();

    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/updatePrivateKey?token=" + sessionData.token + "&zone=" + zone + "&keyTag=" + keyTag + "&rolloverDays=" + rolloverDays,
        success: function (responseJSON) {
            btn.button("reset");
            showAlert("success", "Updated!", "The DNSKEY automatic rollover config was updated successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function deleteDnssecPrivateKey(keyTag, id) {
    if (!confirm("Are you sure to permanently delete the private key (" + keyTag + ")?"))
        return;

    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");

    var btn = $("#btnDnssecPropertiesDnsKeyRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/deletePrivateKey?token=" + sessionData.token + "&zone=" + zone + "&keyTag=" + keyTag,
        success: function (responseJSON) {
            $("#trDnssecPropertiesPrivateKey" + id).remove();
            showAlert("success", "Private Key Deleted!", "The DNSSEC private key was deleted successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function rolloverDnssecDnsKey(keyTag, id) {
    if (!confirm("Are you sure you want to rollover the DNS Key (" + keyTag + ")?"))
        return;

    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");

    var btn = $("#btnDnssecPropertiesDnsKeyRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/rolloverDnsKey?token=" + sessionData.token + "&zone=" + zone + "&keyTag=" + keyTag,
        success: function (responseJSON) {
            refreshDnssecProperties();
            showAlert("success", "Rollover Done!", "The DNS Key was rolled over successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function retireDnssecDnsKey(keyTag, id) {
    if (!confirm("Are you sure you want to retire the DNS Key (" + keyTag + ")?"))
        return;

    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");

    var btn = $("#btnDnssecPropertiesDnsKeyRowOption" + id);
    var originalBtnHtml = btn.html();
    btn.prop("disabled", true);
    btn.html("<img src='/img/loader-small.gif'/>");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/retireDnsKey?token=" + sessionData.token + "&zone=" + zone + "&keyTag=" + keyTag,
        success: function (responseJSON) {
            refreshDnssecProperties();
            showAlert("success", "DNS Key Retired!", "The DNS Key was retired successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.prop("disabled", false);
            btn.html(originalBtnHtml);
        },
        invalidToken: function () {
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function publishAllDnssecPrivateKeys(objBtn) {
    if (!confirm("Are you sure you want to publish all generated DNSSEC private keys?"))
        return;

    var btn = $(objBtn);
    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");

    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/publishAllPrivateKeys?token=" + sessionData.token + "&zone=" + zone,
        success: function (responseJSON) {
            refreshDnssecProperties();
            btn.button("reset");
            showAlert("success", "Keys Published!", "All the generated DNSSEC private keys were published successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function generateAndAddDnssecPrivateKey(objBtn) {
    var btn = $(objBtn);
    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");
    var keyType = $("#optDnssecPropertiesGenerateKeyKeyType").val();
    var algorithm = $("#optDnssecPropertiesGenerateKeyAlgorithm").val();
    var rolloverDays = $("#txtDnssecPropertiesGenerateKeyAutomaticRollover").val();

    var additionalParameters = "";

    switch (algorithm) {
        case "RSA":
            var hashAlgorithm = $("#optDnssecPropertiesGenerateKeyRsaHashAlgorithm").val();
            var keySize = $("#optDnssecPropertiesGenerateKeyRsaKeySize").val();

            additionalParameters = "&hashAlgorithm=" + hashAlgorithm + "&keySize=" + keySize;
            break;

        case "ECDSA":
            var curve = $("#optDnssecPropertiesGenerateKeyEcdsaCurve").val();

            additionalParameters = "&curve=" + curve;
            break;
    }

    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/generatePrivateKey?token=" + sessionData.token + "&zone=" + zone + "&keyType=" + keyType + "&rolloverDays=" + rolloverDays + "&algorithm=" + algorithm + additionalParameters,
        success: function (responseJSON) {
            $("#divDnssecPropertiesGenerateKey").collapse("hide");
            refreshDnssecProperties();
            btn.button("reset");
            showAlert("success", "Key Generated!", "The DNSSEC private key was generated successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function changeDnssecNxProof(objBtn) {
    var btn = $(objBtn);
    var currentNxProof = btn.attr("data-nx-proof");
    var currentIterations = btn.attr("data-nsec3-iterations");
    var currentSaltLength = btn.attr("data-nsec3-salt-length");

    var nxProof = $("input[name=rdDnssecPropertiesNxProof]:checked").val();
    var iterations;
    var saltLength;

    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");

    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");
    var apiUrl;

    switch (currentNxProof) {
        case "NSEC":
            if (nxProof === "NSEC") {
                showAlert("success", "Proof Changed!", "The proof of non-existence was changed successfully.", divDnssecPropertiesAlert)
                return;
            }
            else {
                var iterations = $("#txtDnssecPropertiesNSEC3Iterations").val();
                var saltLength = $("#txtDnssecPropertiesNSEC3SaltLength").val();

                apiUrl = "/api/zones/dnssec/properties/convertToNSEC3?token=" + sessionData.token + "&zone=" + zone + "&iterations=" + iterations + "&saltLength=" + saltLength;
            }
            break;

        case "NSEC3":
            if (nxProof === "NSEC3") {
                iterations = $("#txtDnssecPropertiesNSEC3Iterations").val();
                saltLength = $("#txtDnssecPropertiesNSEC3SaltLength").val();

                if ((currentIterations == iterations) && (currentSaltLength == saltLength)) {
                    showAlert("success", "Proof Changed!", "The proof of non-existence was changed successfully.", divDnssecPropertiesAlert)
                    return;
                }
                else {
                    apiUrl = "/api/zones/dnssec/properties/updateNSEC3Params?token=" + sessionData.token + "&zone=" + zone + "&iterations=" + iterations + "&saltLength=" + saltLength;
                }
            } else {
                apiUrl = "/api/zones/dnssec/properties/convertToNSEC?token=" + sessionData.token + "&zone=" + zone;
            }
            break;

        default:
            return;
    }

    if (!confirm("Are you sure you want to change the proof of non-existence options for the zone?"))
        return;

    btn.button("loading");

    HTTPRequest({
        url: apiUrl,
        success: function (responseJSON) {
            btn.attr("data-nx-proof", nxProof);

            if (iterations != null)
                btn.attr("data-nsec3-iterations", iterations);

            if (saltLength != null)
                btn.attr("data-nsec3-salt-length", saltLength);

            btn.button("reset");

            var zoneHideDnssecRecords = (localStorage.getItem("zoneHideDnssecRecords") == "true");
            if (!zoneHideDnssecRecords)
                showEditZone(zone);

            showAlert("success", "Proof Changed!", "The proof of non-existence was changed successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}

function updateDnssecDnsKeyTtl(objBtn) {
    var btn = $(objBtn);
    var divDnssecPropertiesAlert = $("#divDnssecPropertiesAlert");
    var zone = $("#lblDnssecPropertiesZoneName").attr("data-zone");
    var ttl = $("#txtDnssecPropertiesDnsKeyTtl").val();

    btn.button("loading");

    HTTPRequest({
        url: "/api/zones/dnssec/properties/updateDnsKeyTtl?token=" + sessionData.token + "&zone=" + zone + "&ttl=" + ttl,
        success: function (responseJSON) {
            btn.button("reset");
            showAlert("success", "TTL Updated!", "The DNSKEY TTL was updated successfully.", divDnssecPropertiesAlert);
        },
        error: function () {
            btn.button("reset");
        },
        invalidToken: function () {
            btn.button("reset");
            $("#modalDnssecProperties").modal("hide");
            showPageLogin();
        },
        objAlertPlaceholder: divDnssecPropertiesAlert
    });
}
