"""AQXProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from aqx_downscaling.utils import get_dates, get_ts, get_station_data, generate_variables_meta
from aqx_downscaling.views import home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('',home,name='home'),
    path('get_dates/',get_dates,name='get_dates'),
    path('get-ts/',get_ts,name='get-ts'),
    path('get-station-data/',get_station_data,name='get-station-data'),
    path('generate_variables_meta/',generate_variables_meta,name='generate_variables_meta'),
]
