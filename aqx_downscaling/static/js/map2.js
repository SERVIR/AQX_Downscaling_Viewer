var map2 = L.map('map2').setView([51.505, -0.09], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);
map2.panTo(new L.LatLng(13.73,100.52));
var drawnItems2 = new L.FeatureGroup();
map2.addLayer(drawnItems2);

var var_options=[];

        var xhr = ajax_update_database("generate_variables_meta", {
        });
    xhr.done(function (result) {
        var_options = result.variable_list;
    });
function find_var_index(item,data){
    var index = -1;
    console.log(item);
    for (var i = 0; i < data.length; ++i) {
        if (item.includes(data[i]["id"])) {
            index = i;
            break;
        }
    }
    return index;
}
function ajax_update_database(ajax_url, ajax_data) {
    //backslash at end of url is required
    if (ajax_url.substr(-1) !== "/") {
        ajax_url = ajax_url.concat("/");
    }
    //update database
    var xhr = jQuery.ajax({
        type: "POST",
        url: ajax_url,
        dataType: "json",
        data: ajax_data
    });

    xhr.done(function(data) {

        if("success" in data) {
            // console.log("success");
        } else {
            console.log(xhr.responseText);
        }
    })
        .fail(function(xhr, status, error) {
            console.log(xhr.responseText);
        });

    return xhr;
}
    var drawControlFull2 = new L.Control.DrawPlus({
            edit: {
                featureGroup: drawnItems2,
                edit: false,
            },
            draw: {
                polyline: false,
                circlemarker: false,
                rectangle: {
                    shapeOptions: {
                        color: '#007df3',
                        weight: 4
                    }
                },
                circle: false,
                polygon: false,

            }
        });
map2.addControl(drawControlFull2);
var wmsLayer2 ="";
function formatDate(date,character) {
    console.log(date);
    var d = new Date(date).toISOString().slice(0, 10);

    if (character === "") {
        var newStr = d.replace(/-/g, "");
        return newStr;
    } else {
        return d;
    }
}

function add_wms2() {
    if(wmsLayer2 !== ""){
        map2.removeLayer(wmsLayer2);
    }

    var threddss_wms_url="";
    if($("#variable-dropdown2").val().includes("DS")){
             threddss_wms_url = 'https://thredds.servirglobal.net/thredds/wms/mk_aqx/downscaling_test/new_data/';

    }
    else{
                     threddss_wms_url = 'https://thredds.servirglobal.net/thredds/wms/mk_aqx/downscaling_test/old_data/';

    }
    var run_date =formatDate($("#date-dropdown2").val(),'')+".nc";
    // var variable = ($("#variable-dropdown option:selected").val());
    var wmsUrl = threddss_wms_url + run_date;
    var time =  formatDate($("#date-dropdown2").val(),'-')+"T22:30:00.000Z";
    var style = 'boxfill/pm25';


    var range = '0,100';
     wmsLayer2 = L.tileLayer.wms(wmsUrl, {
        layers: $("#variable-dropdown2").val(),
        format: 'image/png',
        time: time,
        transparent: true,
        styles: style,
        colorscalerange: range,
        opacity: 0.7,
        version: '1.3.0',
        zIndex: 100,
        ABOVEMAXCOLOR: 'extend',
        BELOWMINCOLOR: 'extend'

    });

wmsLayer2.addTo(map2);
}
$("#variable-dropdown2").onChange = function(){add_wms2();};

$("#date-dropdown2").onChange = function(){add_wms2();};



 var xhr=$.ajax({
        type: "POST",
        url: 'get_dates/',
        dataType: "json",
        data: {}
    });
    xhr.done(function (data) {
            // console.log("success");
    var select = document.getElementById("date-dropdown2");
     options =data.dates;

    for(var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    });
      function gen_chart(field_val, forecast_val) {
        var myConfig = {
            type: "gauge",
            legend: {
                  align: 'center',
               offsetY:260


            },
            scaleR: {
                "aperture": 200,
                "values": "0:99:3",
                center: {
                    "size": 10,
                    "background-color": "#66CCFF #FFCCFF",
                    "border-color": "none"
                },
                labels: ['0', '', '', '', '12', '', '', '', '24', '', '', '', '36', '', '', '', '48', '', '', '', '60', '', '', '', '72', '', '', '', '84', '', '', '', '', 'Max'],
                item: {  //Scale Label Styling
                    "font-color": "black",
                    "font-family": "Arial",
                    "font-size": 12,
                    "font-weight": "bold",   //or "normal"
                    "font-style": "normal",   //or "italic"
                    "offset-r": 0,
                    "angle": "auto"
                },

                ring: {  //Ring with Rules
                    "size": 20,
                    "rules": [
                        {
                            "rule": "%v >= 0 && %v < 25",
                            "background-color": "#6ef0ff"
                        },
                        {
                            "rule": "%v >= 25 && %v < 37",
                            "background-color": "#24cf1b"
                        },
                        {
                            "rule": "%v >= 37 && %v < 50",
                            "background-color": "#eff213"
                        },
                        {
                            "rule": "%v >= 50 && %v < 90",
                            "background-color": "#eda702"
                        },
                        {
                            "rule": "%v >= 90",
                            "background-color": "#ed1e02"
                        }
                    ]
                }
            },
            series: [
                {
                    values: [Math.round(field_val) >= 300 ? 300 : Math.round(field_val)], // starting value
                    // backgroundColor: 'black',
                    // indicator: [5, 5, 5, 5, 0.75],
                    animation: {
                        effect: 2,
                        method: 1,
                        sequence: 4,
                        speed: 900
                    },
                    csize: "7%",     //Needle Width
                    size: "90%",    //Needle Length
                    'background-color': "blue",  //Needle Color
                    text: "PM2.5 Measurement"
                },
                {
                    values: [Math.round(forecast_val) >= 99 ? 99 : Math.round(forecast_val)],
                    animation: {
                        effect: 2,
                        method: 1,
                        sequence: 4,
                        speed: 700
                    },
                    csize: "7%",
                    size: "90%",
                    'background-color': "green",
                    text: "PM2.5 Forecast"
                }


            ]
        };

        zingchart.render({
            id: 'guage_chart2',
            data: myConfig,
            height: 350,
            width: '100%'
        });
    }

    get_ts = function () {
        var interaction = int_type;
        console.log(interaction);
        if (interaction === "Station") {
            //console.log("station");
        } else if ($("#poly-lat-lon2").val() == "" && $("#point-lat-lon2").val() == "" && $("#shp-lat-lon2").val() == "") {
            // $('.error').html('<b>No feature selected. Please create a feature using the map interaction dropdown. Plot cannot be generated without a feature.</b>');
            return false;
        } else {
            // $('.error').html('');
        }


        // var run_type = ($("#run_table option:selected").val());
        // var freq = ($("#freq_table option:selected").val());
        // var rd_type = ($("#rd_table option:selected").text());
        var var_type = ($("#variable-dropdown2 option:selected").val());
        // var z = rd_type.split('/').reverse()[0];
        // var y = ($("#date_table option:selected").val());
        // if (($("#date_table option:selected").val()) != undefined)
        //     rd_type = rd_type.replace(z, y.split('/').reverse()[0]);
        if (interaction == "Point") {
            var geom_data = $("#point-lat-lon2").val();
            //console.log(geom_data);

        }
        else if (interaction == "Polygon") {
            var geom_data = $("#poly-lat-lon2").val();
        } else if (interaction == "Station") {
            var geom_data = $("#station2").val();


        }
var rd_type=($("#date-dropdown2 option:selected").val());
        $("#chart-modal2").modal('show');
                $("#cube2").removeClass('hidden');

        // $("#chart-modal1").modal('hide');
        var back2=document.getElementsByClassName("modal-backdrop");
        back2[0].style.display="none";
        $("#cube2").removeClass('hidden');
        $("#plotter2").addClass('hidden');
        var serieses = [];

        var xhr = ajax_update_database("get-ts", {
            "variable": $("#variable-dropdown2 option:selected").val(),
            "run_type":  $("#variable-dropdown2 option:selected").val(),
            "freq": "station",
            "run_date":formatDate($("#date-dropdown2 option:selected").val(),''),//$("#date-dropdown1").val(),
            "interaction": interaction,
            "geom_data": geom_data
        });


        //  var secondday = rd_type.substring(0, 4) + '-' + rd_type.substring(4, 6) + '-' + (((parseInt(rd_type.substring(6, 8)) + 1).toString().length < 2) ? ('0' + (parseInt(rd_type.substring(6, 8)) + 1)) : (parseInt(rd_type.substring(6, 8)) + 1));
        //   var thirdday = rd_type.substring(0, 4) + '-' + rd_type.substring(4, 6) + '-' + (((parseInt(rd_type.substring(6, 8)) + 2).toString().length < 2) ? ('0' + (parseInt(rd_type.substring(6, 8)) + 2)) : (parseInt(rd_type.substring(6, 8)) + 2));
        xhr.done(function (result) {
            if ("success" in result) {
                if (interaction === "Station") {
                    var guage_val, field_day1_avg, field_day2_avg, field_day3_avg,
        forecast_day1_avg, forecast_day2_avg, forecast_day3_avg, sum1 = 0, sum2 = 0, sum3 = 0;

                    var values = result.data["field_data"];
                    var forecast_values = result.data["bc_mlpm25"];
                    var firstday = rd_type; //.substring(0, 4) + '-' + rd_type.substring(4, 6) + '-' + rd_type.substring(6, 8);
                    var d1 = new Date(firstday);
                    var date1 = d1.toISOString().split('T')[0];
                    d1.setDate(d1.getDate() + 1);
                    var d2 = new Date(firstday);
                    d2.setDate(d2.getDate() + 2);
                    var secondday = d1.toISOString().split('T')[0];
                    var thirdday = d2.toISOString().split('T')[0];
                    // document.getElementById("firstday").innerHTML = date1;
                    // document.getElementById("secondday").innerHTML = secondday;
                    // document.getElementById("thirdday").innerHTML = thirdday;
                    document.getElementById("day1_guage2").innerHTML = date1;
                    document.getElementById("day2_guage2").innerHTML = secondday;
                    document.getElementById("day3_guage2").innerHTML = thirdday;

                    //     populateValues(values);
                    field_day1_avg = 0
                    field_day2_avg = 0;
                    field_day3_avg = 0;

                    forecast_day1_avg = 0
                    forecast_day2_avg = 0;
                    forecast_day3_avg = 0;
                    sum1 = 0, sum2 = 0, sum3 = 0;
                    var count1 = 0, count2 = 0, count3 = 0
                    for (var i = 0; i < 8; i++) {
                        if (values[i] != -1) count1 = count1 + 1;
                        if (values[i + 8] != -1) count2 = count2 + 1;
                        if (values[i + 16] != -1) count3 = count3 + 1;

                        sum1 = sum1 + (values[i] ? values[i][1] : 0);
                        sum2 = sum2 + (values[i + 8] ? values[i + 8][1] : 0);
                        sum3 = sum3 + (values[i + 16] ? values[i + 16][1] : 0);

                    }
                    field_day1_avg = sum1 / count1;
                    field_day2_avg = sum2 / count2;
                    field_day3_avg = sum3 / count3;
                    sum1 = 0, sum2 = 0, sum3 = 0;
                    count1 = 0, count2 = 0, count3 = 0
                    for (var i = 0; i < 8; i++) {

                        if (i >= 2 && forecast_values[i] != -1) {
                            count1 = count1 + 1;
                            sum1 = sum1 + (forecast_values[i] ? forecast_values[i][1] : 0);
                        }
                        if (forecast_values[i + 8] != -1) count2 = count2 + 1;
                        sum2 = sum2 + (forecast_values[i + 8] ? forecast_values[i + 8][1] : 0);
                        if ((i + 16) < 22 && forecast_values[i + 16] != -1) {
                            count3 = count3 + 1;
                            sum3 = sum3 + (forecast_values[i + 16] ? forecast_values[i + 16][1] : 0);
                        }


                    }
                    forecast_day1_avg = sum1 / count1;
                    forecast_day2_avg = sum2 / count2;
                    forecast_day3_avg = sum3 / count3;

                    gen_chart(field_day1_avg < 0 ? -1 : field_day1_avg, forecast_day1_avg < 0 ? -1 : forecast_day1_avg);
                    document.getElementById("datevalue2").innerHTML = document.getElementById("day1_guage2").innerHTML;
                      document.getElementById("fromd2").innerHTML = document.getElementById("day1_guage2").innerHTML+" 08:30";
            document.getElementById("tod2").innerHTML = document.getElementById("day1_guage2").innerHTML+" 23:30";
                    $("#day1_guage2").css("background-color", "black");
                    $("#day1_guage2").css("color", "white");
                    $("#day2_guage2").css("background-color", "gray");
                    $("#day2_guage2").css("color", "white");
                    $("#day3_guage2").css("background-color", "gray");
                    $("#day3_guage2").css("color", "white");
                }

                var arr = [];
                var title = "";
                var index = find_var_index(var_type, var_options);
                var display_name = var_options[index]["display_name"];
                var units = var_options[index]["units"];
                if (units == 'mcgm-3') {
                    units = '&micro;gm<sup>-3</sup>';
                }

                if (interaction == "Station") {
                    document.getElementsByClassName("forpm252")[0].style.display = 'flex';
                    document.getElementsByClassName("forpm252")[1].style.display = 'flex';
                    // document.getElementsByClassName("forpm25")[2].style.display = 'table';
                    // document.getElementsByClassName("forpm25")[2].style.width = 'inherit';
                    document.getElementById("chartonly2").style.width = '50%';
                    // document.getElementById("modalchart").style.width = "70%";
                    document.getElementById("modalchart2").style.display = "contents";
                    document.getElementById("modalchart2").style.alignItems = "center";
                    document.getElementById("modalchart2").style.justifyContent = "center";
                    serieses = [
                        // {
                        //     data: result.data["ml_pm25"],
                        //     name: "ML PM25 data",
                        //     color: "brown",
                        //     marker: {
                        //         enabled: true,
                        //         radius: 3
                        //     }
                        // },
                     {
                            data: result.data["field_data"],
                            name: "PM2.5 Measurement",
                            color: "blue"
                        },
                        {
                            data: result.data["bc_mlpm25"],
                            name: "BC MLPM25 data",//
                            color: "green"
                        },
                          // {
                          //      data: result.data["geos_pm25"],
                          //      name: "GEOS PM25 data",
                          //      color: "red"
                          //  }
                    ];
                    document.getElementById('pmlabel2').style.display="inline-table";
                               $("#day1_guage2").click(function () {
            gen_chart(field_day1_avg < 0 ? -1 : field_day1_avg, forecast_day1_avg < 0 ? -1 : forecast_day1_avg);
            document.getElementById("datevalue2").innerHTML = document.getElementById("day1_guage2").innerHTML;
            document.getElementById("fromd2").innerHTML = document.getElementById("day1_guage2").innerHTML+" 08:30";
            document.getElementById("tod2").innerHTML = document.getElementById("day1_guage2").innerHTML+" 23:30";
            $(this).css("background-color", "black");
            $("#day2_guage2").css("background-color", "gray");
            $("#day3_guage2").css("background-color", "gray");
        });
        $("#day2_guage2").click(function () {
            gen_chart(field_day2_avg < 0 ? -1 : field_day2_avg, forecast_day2_avg < 0 ? -1 : forecast_day2_avg);
            document.getElementById("datevalue2").innerHTML = document.getElementById("day2_guage2").innerHTML;
              document.getElementById("fromd2").innerHTML = document.getElementById("day2_guage2").innerHTML+" 02:30";
            document.getElementById("tod2").innerHTML = document.getElementById("day2_guage2").innerHTML+" 23:30";
            $(this).css("background-color", "black");
            $("#day1_guage2").css("background-color", "gray");
            $("#day3_guage2").css("background-color", "gray");
        });
        $("#day3_guage2").click(function () {
            gen_chart(field_day3_avg < 0 ? -1 : field_day3_avg, forecast_day3_avg < 0 ? -1 : forecast_day3_avg);
            document.getElementById("datevalue2").innerHTML = document.getElementById("day3_guage2").innerHTML;
              document.getElementById("fromd2").innerHTML = document.getElementById("day3_guage2").innerHTML+" 02:30";
            document.getElementById("tod2").innerHTML = document.getElementById("day3_guage2").innerHTML+" 23:30";
            $(this).css("background-color", "black");
            $("#day2_guage2").css("background-color", "gray");
            $("#day1_guage2").css("background-color", "gray");
        });
                } else {

                    document.getElementsByClassName("forpm252")[0].style.display = 'none';
                    document.getElementsByClassName("forpm252")[1].style.display = 'none';
                    //          document.getElementsByClassName("forpm25")[2].style.display = 'none';
                    document.getElementById("chartonly2").style.width = '100%';
                    document.getElementById("modalchart2").style.width = "";
                    document.getElementById("modalchart2").style.display = "";
                    document.getElementById("modalchart2").style.alignItems = "";
                    document.getElementById("modalchart2").style.justifyContent = "";
                    serieses = [{
                        data: result.data["plot"],
                        name: display_name,
                        color: "black",
                        marker: {
                            enabled: true,
                            radius: 3
                        }
                    }];
                    document.getElementById('pmlabel2').style.display="none";
                }
                if (interaction == "Station") {

                    arr = [{
                        color: "#6ef0ff",
                        from: 0,
                        to: 25
                    },
                        {
                            color: "#24cf1b",
                            from: 25,
                            to: 37
                        },
                        {
                            color: "#eff213",
                            from: 37,
                            to: 50
                        },
                        {
                            color: "#eda702",
                            from: 50,
                            to: 90
                        },
                        {
                            color: "#ed1e02",
                            from: 90,
                            to: 200
                        }];
                    title = "PM2.5 values at " + titleforst;

                } else {
                    arr = [];
                    title = $("#variable_dropdown2 option:selected").text() + " values at " + result.data["geom"];
                }
                $('.error').html('');
                $('#plotter2').highcharts({
                    chart: {
                        type: 'spline',
                        zoomType: 'x',
                        events: {
                            load: function () {
                                var label = this.renderer.label($("#run_table option:selected").val()=="geos"?"Graph dates and times are in Bangkok time":"Graph dates and times are in UTC time")
                                    .css({
                                        width: '400px',
                                        fontSize: '12px'
                                    })
                                    .attr({
                                        'stroke': 'silver',
                                        'stroke-width': 1,
                                        'r': 2,
                                        'padding': 5
                                    })
                                    .add();

                                label.align(Highcharts.extend(label.getBBox(), {
                                    align: 'center',
                                    x: 20, // offset
                                    verticalAlign: 'bottom',
                                    y: 0 // offset
                                }), null, 'spacingBox');

                            }
                        },
                        paddingBottom: 50
                    },
                    tooltip: {
                        backgroundColor: '#FCFFC5',
                        borderColor: 'black',
                        borderRadius: 10,
                        borderWidth: 3
                    },
                    title: {
                        text: title,
                        style: {
                            fontSize: '14px'
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value: %Y-%m-%d}'
                            // rotation: 45,
                            // align: 'left'
                        },
                        title: {
                            text: 'Date'
                        }
                    },
                    legend: {
                        align: 'center',
                        verticalAlign: 'bottom',
                        y: -25
                    },
                    yAxis: {
                        title: {
                            useHTML: true,
                            text: units
                        },
                        plotBands: arr,

                    },
                    plotOptions: {
                        series: {
                            color: "black"
                        }
                    },
                    exporting: {
                        enabled: true
                    },
                    series: serieses

                });
                $("#cube2").addClass('hidden');
                $("#plotter2").removeClass('hidden');


            } else {
                $("#cube2").addClass('hidden');
                $(".error").html('<h3>Error Processing Request.</h3>');

                $('.forpm252').hide();
                 $('#pmlabel2').hide();

            }
        });


    };
    var selectforGIF;
   map2.on("draw:drawstart ", function (e) {
            // clear_coords();
            drawnItems2.clearLayers();
        });

        map2.on("draw:created", function (e) {
            // clear_coords();
            drawnItems2.clearLayers();

            var layer = e.layer;
            layer.addTo(drawnItems1);
            var feature = drawnItems1.toGeoJSON();
            var type = feature.features[0].geometry.type;
            int_type = type;
            if (type == 'Point') {
                // markersLayer.setZIndex(null);
                var coords = feature["features"][0]["geometry"]["coordinates"];
                $("#point-lat-lon2").val(coords);
                get_ts();

            } else if (type == 'Polygon') {
                // markersLayer.setZIndex(null);
                var coords = feature["features"][0]["geometry"];
                $("#poly-lat-lon2").val(JSON.stringify(coords.coordinates[0]));
                get_ts();
            }

        });


        var xhr = ajax_update_database("get-station-data", {

        });


        //  var secondday = rd_type.substring(0, 4) + '-' + rd_type.substring(4, 6) + '-' + (((parseInt(rd_type.substring(6, 8)) + 1).toString().length < 2) ? ('0' + (parseInt(rd_type.substring(6, 8)) + 1)) : (parseInt(rd_type.substring(6, 8)) + 1));
        //   var thirdday = rd_type.substring(0, 4) + '-' + rd_type.substring(4, 6) + '-' + (((parseInt(rd_type.substring(6, 8)) + 2).toString().length < 2) ? ('0' + (parseInt(rd_type.substring(6, 8)) + 2)) : (parseInt(rd_type.substring(6, 8)) + 2));
        xhr.done(function (result) {
            var stations = result.stations;
            console.log(stations.length);
            var myIcon;
            var markersLayer = L.featureGroup().addTo(map2);
            var pm25_legend = L.control({position: 'bottomright'});
            pm25_legend.onAdd = function (map) {
                function getColor(d) {
                    return d === '0-25' ? "#6ef0ff" :
                        d === '26-37' ? "#24cf1b" :
                            d === '38-50' ? "#eff213" :
                                d === '51-90' ? "#eda702" :
                                    "#ed1e02";
                }

                var div = L.DomUtil.create('div', 'info pm25_legend');
                var labels = ['<strong>PM2.5(&micro;gm<sup>-3</sup>)</strong>'];
                var categories = ['0-25', '26-37', '38-50', '51-90', '91 and up'];

                for (var i = 0; i < categories.length; i++) {

                    div.innerHTML +=
                        labels.push(
                            '<i class="circle" style="background:' + getColor(categories[i]) + '"></i> ' +
                            (categories[i] ? categories[i] : '+'));

                }
                div.innerHTML = labels.join('<br>');
                return div;
            };
            pm25_legend.addTo(map2);
            if (stations[0] == "error") {
                alert("Could not load stations from database. Please retry later.");
            } else {
                for (var i = 0; i < stations.length; ++i) {
                    if (stations[i].pm25 > 90) {
                        myIcon = L.icon({
                            iconUrl: '/static/images/rr.png',
                            iconSize: [32, 32],
                            iconAnchor: [9, 21],
                            popupAnchor: [0, -50]
                        });
                    } else if (stations[i].pm25 > 50 && stations[i].pm25 < 91) {
                        myIcon = L.icon({
                            iconUrl: '/static/images/oo.png',
                            iconSize: [32, 32],
                            iconAnchor: [9, 21],
                            popupAnchor: [0, -18]
                        });
                    } else if (stations[i].pm25 > 37 && stations[i].pm25 < 51) {
                        myIcon = L.icon({
                            iconUrl: '/static/images/yy.png',
                            iconSize: [32, 32],
                            iconAnchor: [9, 21],
                            popupAnchor: [0, -14]
                        });

                    } else if (stations[i].pm25 > 25 && stations[i].pm25 < 38) {
                        myIcon = L.icon({
                            iconUrl: '/static/images/gg.png',
                            iconSize: [32, 32],
                            iconAnchor: [9, 21],
                            popupAnchor: [0, -14]
                        });
                    } else if (stations[i].pm25 >= 0 && stations[i].pm25 < 26) {
                        myIcon = L.icon({
                            iconUrl: '/static/images/bb.png',
                            iconSize: [32, 32],
                            iconAnchor: [9, 21],
                            popupAnchor: [0, -14]
                        });
                    }
                    var oneMarker =

                        L.marker([stations[i].lat, stations[i].lon], {
                            icon: myIcon
                        });
                    oneMarker.bindTooltip("<b>Station:</b> " + stations[i].name + "<br>Field data for " + stations[i].latest_date + "<br> (<i>All dates and times are in Bangkok time</i>)");
                    oneMarker.name = stations[i].station_id;
                    oneMarker.fullname = stations[i].name;
                    oneMarker.lat = stations[i].lat;
                    oneMarker.lon = stations[i].lon;
                    oneMarker.addTo(markersLayer);
                }
                markersLayer.on("click", markerOnClick);
                markersLayer.setZIndex(500);
            }

            function markerOnClick(e) {

                var attributes = e.layer;
                int_type = "Station";
                $("#station2").val(attributes.name + ',' + attributes.lat + ',' + attributes.lon);
                titleforst = attributes.fullname;
                get_ts();

            }

        });

