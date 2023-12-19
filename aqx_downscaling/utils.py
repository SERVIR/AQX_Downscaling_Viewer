import json
import os
from datetime import datetime
from pathlib import Path

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
BASE_DIR = Path(__file__).resolve().parent.parent

f = open(str(BASE_DIR) + '/data.json', )
data = json.load(f)

@csrf_exempt
def get_dates(request):
    return_obj={}
    date_arr=[]
    file_path1=data["FILE_PATH_1"]
    file_path2=data["FILE_PATH_2"]
    for x in os.listdir(file_path1):
        if x.endswith(".nc"):
            filename = x[:-3]
            date_format = '%Y%m%d'

            date_obj = datetime.strptime(filename, date_format)
            date_arr.append( date_obj.strftime('%Y-%m-%d'))

        return_obj['var1'] = filename
    for x in os.listdir(file_path2):
        if x.endswith(".nc"):
            filename = x[:-3]
            date_format = '%Y%m%d'

            date_obj = datetime.strptime(filename, date_format)
            date_arr.append(date_obj.strftime('%Y-%m-%d'))
        return_obj['var2'] = filename
    return_obj['dates'] = sorted(list(set(date_arr)))
    print(return_obj)
    return JsonResponse(return_obj)

