from django.shortcuts import render

# Create your views here.
def agent(request):
    """
    Render the index page.
    """
    return render(request, 'agent/agent.html')
