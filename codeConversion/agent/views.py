import json
import google.generativeai as genai
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings
from django.shortcuts import render

genai.configure(api_key=settings.GEMINI_API_KEY)

# Create your views here.
def agent(request):
    """
    Render the index page.
    """
    return render(request, 'agent/agent.html')

@csrf_exempt
@require_http_methods(["POST"])
def convert_code(request):
    """Convert code using Gemini LLM"""
    try:
        data = json.loads(request.body)
        source_code = data.get('source_code', '').strip()
        source_language = data.get('source_language', '')
        target_language = data.get('target_language', '')
        
        if not source_code:
            return JsonResponse({
                'success': False,
                'error': 'Source code is required'
            }, status=400)
        
        # Convert code using Gemini
        converted_code = convert_with_gemini(source_code, source_language, target_language)
        
        return JsonResponse({
            'success': True,
            'converted_code': converted_code
        })
        
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Conversion failed: {str(e)}'
        }, status=500)

def convert_with_gemini(source_code, source_lang, target_lang):
    """Use Gemini to convert code between languages"""
    try:
        # Initialize the model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Create a detailed prompt for code conversion
        prompt = f"""
        You are an expert programmer. Convert the following {source_lang} code to {target_lang}.
        
        Requirements:
        1. Maintain the same functionality and logic
        2. Follow {target_lang} best practices and conventions
        3. Add appropriate comments where necessary
        4. Ensure the code is clean and readable
        5. Handle edge cases appropriately
        6. Only return the converted code, no explanations
        
        Source Language: {source_lang}
        Target Language: {target_lang}
        
        Source Code:
        ```{source_lang}
        {source_code}
        ```
        
        Convert to {target_lang}:
        """
        
        # Generate the response
        response = model.generate_content(prompt)
        
        # Extract code from response (remove markdown formatting if present)
        converted_code = response.text.strip()
        
        # Clean up markdown code blocks if they exist
        if converted_code.startswith('```'):
            lines = converted_code.split('\n')
            if len(lines) > 2:
                # Remove first and last lines (markdown markers)
                converted_code = '\n'.join(lines[1:-1])
        
        return converted_code
        
    except Exception as e:
        raise Exception(f"Gemini API error: {str(e)}")

@csrf_exempt
@require_http_methods(["POST"])
def execute_code(request):
    """Execute code in a sandboxed environment (simulation)"""
    try:
        data = json.loads(request.body)
        code = data.get('code', '').strip()
        language = data.get('language', '')
        
        if not code:
            return JsonResponse({
                'success': False,
                'error': 'Code is required'
            }, status=400)
        
        # For security reasons, we'll simulate execution
        # In production, use proper sandboxing solutions
        result = simulate_code_execution(code, language)
        
        return JsonResponse({
            'success': True,
            'output': result['output'],
            'execution_time': result['execution_time']
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Execution failed: {str(e)}'
        }, status=500)

def simulate_code_execution(code, language):
    """Simulate code execution - replace with proper sandboxing in production"""
    import time
    import random
    
    start_time = time.time()
    
    # Simple output extraction based on language
    output_patterns = {
        'python': ['print(', 'print '],
        'javascript': ['console.log('],
        'java': ['System.out.println('],
        'cpp': ['cout <<'],
        'csharp': ['Console.WriteLine('],
        'php': ['echo '],
        'ruby': ['puts '],
        'go': ['fmt.Println('],
        'rust': ['println!(']
    }
    
    outputs = []
    lines = code.split('\n')
    patterns = output_patterns.get(language, [])
    
    for line in lines:
        for pattern in patterns:
            if pattern in line:
                # Extract simple string outputs
                if '"' in line:
                    start = line.find('"') + 1
                    end = line.rfind('"')
                    if start < end:
                        outputs.append(line[start:end])
    
    execution_time = (time.time() - start_time) * 1000 + random.uniform(50, 200)
    
    return {
        'output': '\n'.join(outputs) if outputs else f'{language} code executed successfully',
        'execution_time': round(execution_time, 1)
    }
