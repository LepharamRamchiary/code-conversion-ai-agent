
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.agent, name='agent'),
    path('api/convert/', views.convert_code, name='convert_code'),
    path('api/execute/', views.execute_code, name='execute_code'),
]
