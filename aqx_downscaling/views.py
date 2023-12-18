from django.shortcuts import render
import aqx_downscaling.utils

# Create your views here.
def home(request):
    return render(request, 'index.html')

