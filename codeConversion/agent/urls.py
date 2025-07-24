
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.agent, name='agent'),
    path('convert/', views.convert_code, name='convert_code'),
    path('run-code/', views.run_code, name='run_code'),
    path('about/', views.about, name='about'),
    path('blog/', views.blog, name='blog'),
]
