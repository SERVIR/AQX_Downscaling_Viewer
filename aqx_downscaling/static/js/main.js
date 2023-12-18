var map1 = L.map('map1').setView([51.505, -0.09], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map1);
map1.panTo(new L.LatLng(13.73,100.52));
var map2 = L.map('map2').setView([51.505, -0.09], 4);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);
map2.panTo(new L.LatLng(13.73,100.52));
var wmsLayer ="";
var wmsLayer2 ="";
function formatDate(date,character) {
            var d=new Date(date).toISOString().slice(0, 10);

    if(character===""){
            var newStr = d.replace(/-/g, "");
            return newStr;
    }
    else {
        return d;
    }
}

function add_wms1() {
    if(wmsLayer !== ""){
        map1.removeLayer(wmsLayer);
    }

    var threddss_wms_url="";
    if($("#variable-dropdown1").val().includes("DS")){
             threddss_wms_url = 'https://thredds.servirglobal.net/thredds/wms/mk_aqx/downscaling_test/new_data/';

    }
    else{
                     threddss_wms_url = 'https://thredds.servirglobal.net/thredds/wms/mk_aqx/downscaling_test/old_data/';

    }
    var run_date =formatDate($("#date-dropdown1").val(),'')+".nc";
    // var variable = ($("#variable-dropdown option:selected").val());
    var wmsUrl = threddss_wms_url + run_date;
    var time =  formatDate($("#date-dropdown1").val(),'-')+"T22:30:00.000Z";
    var style = 'boxfill/pm25';


    var range = '0,100';
     wmsLayer = L.tileLayer.wms(wmsUrl, {
        layers: $("#variable-dropdown1").val(),
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

wmsLayer.addTo(map1);
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

$("#variable-dropdown1").onChange = function(){add_wms1();};

$("#date-dropdown1").onChange = function(){add_wms1();};

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
    var select = document.getElementById("date-dropdown1");
    console.log(data.dates);
    var options =data.dates;

    for(var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
 select = document.getElementById("date-dropdown2");
     options =data.dates;

    for(var i = 0; i < options.length; i++) {
        var opt = options[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        select.appendChild(el);
    }
    });