import json
import os
from datetime import datetime
from pathlib import Path

import psycopg2
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from aqx_downscaling.timeseries import get_poylgon_values, get_pt_values, get_pm25_data

BASE_DIR = Path(__file__).resolve().parent.parent

f = open(str(BASE_DIR) + '/data.json', )
data = json.load(f)

@csrf_exempt
def get_ts(request):
    """Get Time Series for Point and Polygon"""

    return_obj = {}

    if request.method == 'POST':
        print(request.POST["variable"])
        variable = request.POST["variable"]
        interaction = request.POST["interaction"]
        platform = request.POST["run_type"]
        freq = request.POST["freq"]
        run_date = request.POST["run_date"]
        geom_data = request.POST["geom_data"]
    # elif request.method == 'POST':
    #     request_wsgi = json.loads(request.body)
    #     variable = request_wsgi["variable"]
    #     interaction = request_wsgi["interaction"]
    #     platform = "geos"
    #     freq = "3dayrecent"
    #     run_date = request_wsgi["run_date"]+'.nc'
    #     geom_data = request_wsgi["geom_data"]
    print(interaction)
    """If a point is clicked on the map, get the values for graph"""
    if interaction == 'Point':
        try:
            graph = get_pt_values(variable, geom_data, freq, platform, run_date)
            print(graph)
            return_obj["data"] = graph
            return_obj["success"] = "success"
        except Exception as e:
            return_obj["error"] = "Error processing request: "+ str(e)
    """If a polygon is selected on the map, get the values for graph"""
    if interaction == 'Polygon':
        try:
            graph = get_poylgon_values(variable, geom_data, freq, platform, run_date)
            return_obj["data"] = graph
            return_obj["success"] = "success"
        except Exception as e:
            return_obj["error"] = "Error processing request: "+ str(e)
    if interaction == 'Station':
        try:
            print(geom_data)
            x=geom_data.split(',')
            print(x)
            station = x[0]
            lat = x[1]
            lon = x[2]
            graph = get_pm25_data(variable, platform, run_date, station, lat, lon)
            if len(graph)>0:
                return_obj["data"] = graph
                return_obj["success"] = "success"
            else:
                return_obj["error"] = "Error processing data"
        except Exception as e:
            return_obj["error"] = "Error processing request: " + str(e)

    return JsonResponse(return_obj)


@csrf_exempt
def get_dates(request):
    return_obj={}
    date_arr=[]
    file_path1=data["FILE_PATH"]+"BC_MLPM25"
    for x in os.listdir(file_path1):
        if x.endswith(".nc"):
            filename = x[:-3]
            date_format = '%Y%m%d'

            date_obj = datetime.strptime(filename, date_format)
            date_arr.append( date_obj.strftime('%Y-%m-%d'))

        return_obj['var1'] = filename
    # for x in os.listdir(file_path2):
    #     if x.endswith(".nc"):
    #         filename = x[:-3]
    #         date_format = '%Y%m%d'
    #
    #         date_obj = datetime.strptime(filename, date_format)
    #         date_arr.append(date_obj.strftime('%Y-%m-%d'))
    #     return_obj['var2'] = filename
    return_obj['dates'] = sorted(list(set(date_arr)))
    print(return_obj)
    return JsonResponse(return_obj)

@csrf_exempt
def get_station_data(req):
    try:
        BASE_DIR = Path(__file__).resolve().parent.parent

        f = open(str(BASE_DIR) + '/data.json', )
        data = json.load(f)

        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(data['dbname'], data['user'],
                                                               data['host'], data['password']))
        cur = conn.cursor()
        print("Connected to DB")
        sql = """SELECT  DISTINCT ON (s.station_id) s.station_id,s.rid,s.name_en, s.lat, s."long" as longitude,m.pm25,m.datetime
                    FROM    stations s
                    JOIN    nrt_measurements m
                    ON      m.station_id = s.station_id and m.pm25 is not null
                    ORDER BY s.station_id, m.datetime DESC"""
        cur.execute(sql)
        data = cur.fetchall()
        stations=[]
        for row in data:
            rid = row[1]
            name = row[2]
            station_id = row[0]
            lat = row[3]
            lon = row[4]
            pm25 = row[5]
            latest_date = row[6]
            stations.append({
                'rid': rid,
                'station_id': station_id,
                'latest_date': str(latest_date),
                'lon': lon,
                'lat': lat,
                'pm25': pm25,
                'name': name
            })
        conn.close()
        return JsonResponse({"stations":stations})
    except Exception as e:
        return ["error"]

@csrf_exempt
def generate_variables_meta(req):
    """Generate Variables Metadata from the Var Info text"""
    print(os.path.dirname(os.path.realpath(__file__)))
    db_file = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static/data/var_info.txt')
    variable_list = []
    with open(db_file, mode='r') as f:
        f.readline()  # Skip first line

        lines = f.readlines()
    for line in lines:
        if line != '':
            line = line.strip()
            linevals = line.split('|')
            variable_id = linevals[0]
            category = linevals[1]
            display_name = linevals[2]
            units = linevals[3]
            vmin = linevals[4]
            vmax = linevals[5]

            try:
                variable_list.append({
                    'id': variable_id,
                    'category': category,
                    'display_name': display_name,
                    'units': units,
                    'min': vmin,
                    'max': vmax,
                })
            except Exception:
                continue
    return JsonResponse({"variable_list": variable_list})