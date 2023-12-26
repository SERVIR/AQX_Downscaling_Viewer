import calendar
import json
import os

from datetime import timedelta, datetime
from itertools import product
from pathlib import Path

import netCDF4
import shapely.geometry
from django.views.decorators.csrf import csrf_exempt
import numpy as np
from geopy.distance import great_circle
from shapely.geometry import Polygon
import shapely
import psycopg2

BASE_DIR = Path(__file__).resolve().parent.parent

f = open(str(BASE_DIR) + '/data.json', )
data = json.load(f)

@csrf_exempt
def get_pt_values(s_var, geom_data, freq, run_type, run_date):
    print("from get_pt_values")
    """Helper function to generate time series for a point"""
    # logger.info("PARAMETERS : ['" + s_var + "','" + geom_data + "','" + freq + "','" + run_type + "','" + run_date+"']")
    # Empty list to store the timeseries values
    ts_plot = []
    ts_plot_pm25 = []
    ts_plot_bcpm25 = []
    ts_plot_geospm25 = []
    ts_plot_ds = []

    s_var1 = 'PM25'
    s_var2 = 'BC_MLPM25'
    s_var3 = 'GEOSPM25'
    # s_var4 = 'DS_BC_DNN_PM25'
    # s_var5 = 'DS_GEOSPM25'


    json_obj = {}

    # Defining the lat and lon from the coords string
    coords = geom_data.split(',')
    stn_lat = float(coords[1])
    stn_lon = float(coords[0])
    st_point=(stn_lat,stn_lon)
    """Make sure you have this path for all the run_types(/home/tethys/aq_dir/fire/combined/combined.nc)"""
    try:
        # if run_type:
        infile = os.path.join(data["FILE_PATH"], run_type, run_date+".nc")
        # infile = os.path.join(data["FILE_PATH_2"], run_date+".nc")
        print(infile)
        # else:
        #     infile = os.path.join(data["FILE_PATH"], run_type, freq, run_date)

        nc_fid = netCDF4.Dataset(infile, 'r',)  # Reading the netCDF file
        lis_var = nc_fid.variables
        print(s_var)
        if "DS" not in s_var:
            field = nc_fid.variables[s_var][:]
            lats = nc_fid.variables['lat'][:]
            lons = nc_fid.variables['lon'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            abslat = np.abs(lats - stn_lat)  # Finding the absolute latitude
            abslon = np.abs(lons - stn_lon)  # Finding the absolute longitude
            lat_idx = (abslat.argmin())
            lon_idx = (abslon.argmin())
            for timestep, v in enumerate(time):
                val = field[lat_idx, lon_idx][timestep]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    dtt = dt_str.strftime('%Y-%m-%dT%H:%M:%SZ')
                    dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                    time_stamp = calendar.timegm(dt.utctimetuple()) * 1000
                    ts_plot.append([time_stamp, float(val)])
            field1 = nc_fid.variables[s_var1][:]
            lats = nc_fid.variables['lat'][:]
            lons = nc_fid.variables['lon'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            abslat = np.abs(lats - stn_lat)  # Finding the absolute latitude
            abslon = np.abs(lons - stn_lon)  # Finding the absolute longitude
            lat_idx = (abslat.argmin())
            lon_idx = (abslon.argmin())
            for timestep, v in enumerate(time):
                val = field1[lat_idx, lon_idx][timestep]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    test=dt_str+timedelta(hours=7)
                    time_stamp = calendar.timegm(test.timetuple()) * 1000
                    ts_plot_pm25.append([time_stamp, float(val)])
            field2 = nc_fid.variables[s_var2][:]
            lats = nc_fid.variables['lat'][:]
            lons = nc_fid.variables['lon'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            # Defining the variable array(throws error if variable is not in combined.nc)
            #new way to cal dist
            coordinates=list(product(lats, lons))
            dist=[]
            for val in coordinates:
                distance=great_circle(val, st_point).kilometers
                dist.append(distance)
            index = np.argmin(np.array(dist))
            lat=coordinates[index][0]
            lon = coordinates[index][1]
            for l in range(len(lats)):
                if lat==lats[l]:
                    lat_idx=l
            for l in range(len(lons)):
                if lon == lons[l]:
                    lon_idx = l
            for timestep, v in enumerate(time):
                val = field2[lat_idx, lon_idx][timestep]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    test=dt_str+timedelta(hours=7)
                    dtt = test.strftime('%Y-%m-%dT%H:%M:%SZ')
                    dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                    time_stamp = calendar.timegm(dt.timetuple()) * 1000
                    ts_plot_bcpm25.append([time_stamp, float(val)])
            field3 = nc_fid.variables[s_var3][:]
            lats = nc_fid.variables['lat'][:]
            lons = nc_fid.variables['lon'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            coordinates = list(product(lats, lons))
            dist = []
            for val in coordinates:
                distance = great_circle(val, st_point).kilometers
                dist.append(distance)
            index = np.argmin(np.array(dist))
            lat = coordinates[index][0]
            lon = coordinates[index][1]
            for l in range(len(lats)):
                if lat == lats[l]:
                    lat_idx = l
            for l in range(len(lons)):
                if lon == lons[l]:
                    lon_idx = l
            for timestep, v in enumerate(time):

                val = field3[lat_idx, lon_idx][timestep]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    test=dt_str+timedelta(hours=7)
                    dtt = test.strftime('%Y-%m-%dT%H:%M:%SZ')
                    dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                    time_stamp = calendar.timegm(dt.timetuple()) * 1000
                    ts_plot_geospm25.append([time_stamp, float(val)])
        elif "DS" in s_var:
            field1 = nc_fid.variables[s_var][:]
            lats = nc_fid.variables['lat'][:]
            lons = nc_fid.variables['lon'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            abslat = np.abs(lats - stn_lat)  # Finding the absolute latitude
            abslon = np.abs(lons - stn_lon)  # Finding the absolute longitude
            lat_idx = (abslat.argmin())
            lon_idx = (abslon.argmin())
            for timestep, v in enumerate(time):
                val = field1[lat_idx, lon_idx][timestep]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    test=dt_str+timedelta(hours=7)
                    time_stamp = calendar.timegm(test.timetuple()) * 1000
                    ts_plot_ds.append([time_stamp, float(val)])
        else:
            field = nc_fid.variables[s_var][:]
            lats = nc_fid.variables['Latitude'][:]
            lons = nc_fid.variables['Longitude'][:]  # Defining the longitude array
            time = nc_fid.variables['time'][:]
            coordinates = list(product(lats, lons))
            dist = []
            for val in coordinates:
                distance = great_circle(val, st_point).kilometers
                dist.append(distance)
            index = np.argmin(np.array(dist))
            lat = coordinates[index][0]
            lon = coordinates[index][1]
            for l in range(len(lats)):
                if lat == lats[l]:
                    lat_idx = l
            for l in range(len(lons)):
                if lon == lons[l]:
                    lon_idx = l
            for timestep, v in enumerate(time):

                val = field[timestep,lat_idx,lon_idx]
                if np.isnan(val) == False:
                    dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                              calendar=lis_var['time'].calendar)
                    dtt = dt_str.strftime('%Y-%m-%dT%H:%M:%SZ')
                    dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                    time_stamp = calendar.timegm(dt.utctimetuple()) * 1000
                    ts_plot.append([time_stamp, float(val)])

        ts_plot.sort()
        ts_plot_pm25.sort()
        ts_plot_bcpm25.sort()
        ts_plot_geospm25.sort()
        ts_plot_ds.sort()
        point = [round(stn_lat, 2), round(stn_lon, 2)]
        json_obj["plot"] = ts_plot

        if freq == "station":
            print(ts_plot_pm25)
            json_obj["bc_mlpm25"] = ts_plot_bcpm25
            json_obj["geos_pm25"] = ts_plot_geospm25
            json_obj["ml_pm25"] = ts_plot_pm25
            json_obj["ds_pm25"] = ts_plot_ds
        json_obj["geom"] = point
        # if len(ts_plot) == 0:
        #     logger.warn("The selected point has no data")
        # else:
        #     pass
        #     # logger.info("PLOT POINT OBJECT : " + json.dumps(json_obj["plot"]))
        # logger.info(json.dumps(json_obj["geom"]))
    except Exception as e:
        return json_obj
    return json_obj

@csrf_exempt
def get_poylgon_values(s_var, geom_data, freq, run_type, run_date):
    """Helper function to generate time series for a polygon"""
    # logger.info("PARAMETERS : ['" + s_var +"','"+ geom_data +"','"+ freq +"','"+ run_type +"','"+ run_date+"']")
    # Empty list to store the timeseries values
    ts_plot = []

    json_obj = {}
    # Defining the lat and lon from the coords string
    poly_geojson = Polygon(json.loads(geom_data))
    shape_obj = shapely.geometry.asShape(poly_geojson)
    bounds = poly_geojson.bounds
    miny = float(bounds[0])
    minx = float(bounds[1])
    maxy = float(bounds[2])
    maxx = float(bounds[3])

    """Make sure you have this path for all the run_types(/home/tethys/aq_dir/fire/combined/combined.nc)"""
    if "geos" in run_type:
        infile = os.path.join(data["FILE_PATH_1"], run_type, run_date)
    else:
        infile = os.path.join(data["FILE_PATH_1"], run_type, freq, run_date)
    nc_fid = netCDF4.Dataset(infile, 'r')
    lis_var = nc_fid.variables

    if "geos" == run_type:
        field = nc_fid.variables[s_var][:]
        lats = nc_fid.variables['lat'][:]
        lons = nc_fid.variables['lon'][:]  # Defining the longitude array
        time = nc_fid.variables['time'][:]
        # Defining the variable array(throws error if variable is not in combined.nc)

        latli = np.argmin(np.abs(lats - minx))
        latui = np.argmin(np.abs(lats - maxx))

        lonli = np.argmin(np.abs(lons - miny))
        lonui = np.argmin(np.abs(lons - maxy))
        for timestep, v in enumerate(time):
            val = field[latli:latui,lonli:lonui,timestep]
            val = np.mean(val)
            if np.isnan(val) == False:
                dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                          calendar=lis_var['time'].calendar)
                test = dt_str + timedelta(hours=7)
                dtt = test.strftime('%Y-%m-%dT%H:%M:%SZ')
                dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                time_stamp = calendar.timegm(dt.timetuple()) * 1000
                ts_plot.append([time_stamp, float(val)])
    else:
        """Reading variables from combined.nc"""
        lats = nc_fid.variables['Latitude'][:]  # Defining the latitude array
        lons = nc_fid.variables['Longitude'][:]  # Defining the longitude array
        field = nc_fid.variables[s_var][:]  # Defning the variable array(throws error if variable is not in combined.nc)
        time = nc_fid.variables['time'][:]

        latli = np.argmin(np.abs(lats - minx))
        latui = np.argmin(np.abs(lats - maxx))

        lonli = np.argmin(np.abs(lons - miny))
        lonui = np.argmin(np.abs(lons - maxy))
        for timestep, v in enumerate(time):
            vals = field[timestep, latli:latui, lonli:lonui]
            if run_type == 'fire':
                val = np.sum(vals)
            else:
                val = np.mean(vals)
            if np.isnan(val) == False:
                dt_str = netCDF4.num2date(lis_var['time'][timestep], units=lis_var['time'].units,
                                          calendar=lis_var['time'].calendar)
                dtt = dt_str.strftime('%Y-%m-%dT%H:%M:%SZ')
                dt = datetime.strptime(dtt, '%Y-%m-%dT%H:%M:%SZ')
                time_stamp = calendar.timegm(dt.utctimetuple()) * 1000
                ts_plot.append([time_stamp, float(val)])

    ts_plot.sort()

    geom = [round(minx, 2), round(miny, 2), round(maxx, 2), round(maxy, 2)]

    json_obj["plot"] = ts_plot
    json_obj["geom"] = geom
    # if len(ts_plot) == 0:
    #     logger.warn("The selected polygon has no data")
    # else:
    #     logger.info("PLOT POLYGON OBJECT : " + json.dumps(json_obj["plot"]))
    # logger.info(json.dumps(json_obj["geom"]))
    return json_obj





def get_pm25_data(s_var, run_type, run_date, station, lat, lon):
    try:
        print("from pm25")
        BASE_DIR = Path(__file__).resolve().parent.parent

        f = open(str(BASE_DIR) + '/data.json', )
        data = json.load(f)
        geom_data = lon+',' + lat
        geos_pm25_data = get_pt_values(s_var, geom_data, "station", run_type, run_date)
        conn = psycopg2.connect(
            "dbname={0} user={1} host={2} password={3}".format(data['dbname'], data['user'],
                                                               data['host'], data['password']))
        cur = conn.cursor()
        # "2019-08-01 03:00:00"
        date_obj = datetime.strptime(run_date.split('.')[0],"%Y%m%d")
        end_date = date_obj+timedelta(days=3)
        sd = date_obj.strftime("%Y-%m-%d %H:%M:%S")
        ed = end_date.strftime("%Y-%m-%d %H:%M:%S")
        cur.execute(("SELECT  datetime, pm25 from nrt_measurements where station_id = %s and pm25 is not null \
                      and date_part('hour', datetime) in (2,5,8,11,14,17,20,23) \
                      and datetime between %s and %s"), (str(station), sd, ed,))
        data = cur.fetchall()
        pm25_data = {}
        ts_plot = []
        for row in data:
            dt = row[0]
            pm25 = row[1]
            time_stamp = calendar.timegm(dt.timetuple()) * 1000
            ts_plot.append([time_stamp, float(str(pm25))])

        ts_plot.sort()
        pm25_data["field_data"] = ts_plot
        pm25_data["ml_pm25"] = geos_pm25_data["ml_pm25"]
        pm25_data["bc_mlpm25"] = geos_pm25_data["bc_mlpm25"]
        pm25_data["geos_pm25"] = geos_pm25_data["geos_pm25"]
        pm25_data["ds_pm25"] = geos_pm25_data["ds_pm25"]
        pm25_data["geom"] = geos_pm25_data["geom"]
        conn.close()
        return pm25_data

    except Exception as e:
        print(e)
        return ""

