from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib import messages
import json
import logging
import subprocess
import tempfile
import os
from django.http import JsonResponse
from .gemini_service import gemini_converter

logger = logging.getLogger('converter')

# Create your views here.
def agent(request):
    """
    Render the index page.
    """
    return render(request, 'agent/agent.html')

@csrf_exempt
@require_http_methods(["POST"])
def convert_code(request):
    """Handle code conversion requests"""
    try:
        # Parse JSON data from request
        data = json.loads(request.body)
        
        source_code = data.get('source_code', '').strip()
        source_language = data.get('source_language', '').lower()
        target_language = data.get('target_language', '').lower()
        
        # Validate input
        if not source_code:
            return JsonResponse({
                'success': False,
                'error': 'Source code is required'
            }, status=400)
        
        if not source_language or not target_language:
            return JsonResponse({
                'success': False,
                'error': 'Both source and target languages are required'
            }, status=400)
        
        if source_language == target_language:
            return JsonResponse({
                'success': False,
                'error': 'Source and target languages must be different'
            }, status=400)
        
        # Validate supported languages
        supported_languages = [
            'javascript', 'python', 'java', 'cpp', 'csharp', 
            'php', 'ruby', 'go', 'rust', 'typescript'
        ]
        
        if source_language not in supported_languages:
            return JsonResponse({
                'success': False,
                'error': f'Unsupported source language: {source_language}'
            }, status=400)
        
        if target_language not in supported_languages:
            return JsonResponse({
                'success': False,
                'error': f'Unsupported target language: {target_language}'
            }, status=400)
        
        # Log the conversion request
        logger.info(f"Code conversion request: {source_language} -> {target_language}")
        
        # Convert the code using Gemini AI
        result = gemini_converter.convert_code(source_code, source_language, target_language)
        
        if result['success']:
            logger.info("Code conversion completed successfully")
            return JsonResponse({
                'success': True,
                'converted_code': result['converted_code'],
                'source_language': result['source_language'],
                'target_language': result['target_language'],
                'message': f'Code successfully converted from {source_language.title()} to {target_language.title()}'
            })
        else:
            logger.error(f"Code conversion failed: {result['error']}")
            return JsonResponse({
                'success': False,
                'error': result['error']
            }, status=500)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        error_msg = f'Unexpected error during conversion: {str(e)}'
        logger.error(error_msg)
        return JsonResponse({
            'success': False,
            'error': error_msg
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def run_code(request):
    """Handle code execution requests (limited support)"""
    try:
        data = json.loads(request.body)
        code = data.get('code', '').strip()
        language = data.get('language', '').lower()
        
        if not code:
            return JsonResponse({
                'success': False,
                'error': 'Code is required for execution'
            })
        
        # Security check - only allow safe languages for execution
        executable_languages = ['javascript', 'python', 'java', 'cpp', 'csharp', 
            'php', 'ruby', 'go', 'rust', 'typescript']
        
        if language not in executable_languages:
            return JsonResponse({
                'success': False,
                'error': f'Code execution not supported for {language}. Supported languages: {", ".join(executable_languages)}'
            })
        
        # Execute the code based on language
        result = execute_code(code, language)
        
        return JsonResponse(result)
    
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'error': 'Invalid JSON data'
        }, status=400)
    
    except Exception as e:
        logger.error(f"Code execution error: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Execution error: {str(e)}'
        }, status=500)

def execute_code(code, language):
    """Execute code safely in a temporary environment"""
    try:
        # Create a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix=get_file_extension(language), delete=False) as temp_file:
            temp_file.write(code)
            temp_file_path = temp_file.name
        
        try:
            if language == 'python':
                # Execute Python code
                result = subprocess.run(
                    ['python', temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            
            elif language == 'javascript':
                # Execute JavaScript code with Node.js
                result = subprocess.run(
                    ['node', temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            elif language == 'java':
                result = subprocess.run(
                    ['java', temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=10
                )
            elif language == 'php':
                # Execute PHP code
                result = subprocess.run(
                    ['php', temp_file_path],
                    capture_output=True,
                    text=True,
                    timeout=10
                )          
            else:
                return {
                    'success': False,
                    'error': f'Execution not implemented for {language}'
                }
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'output': result.stdout,
                    'error': result.stderr if result.stderr else None
                }
            else:
                return {
                    'success': False,
                    'error': result.stderr or 'Execution failed',
                    'output': result.stdout
                }
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except OSError:
                pass
    
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Code execution timed out (10 seconds limit)'
        }
    except FileNotFoundError as e:
        return {
            'success': False,
            'error': f'Runtime not found for {language}. Please ensure it is installed. Details: {str(e)}'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Execution error: {str(e)}'
        }

def get_file_extension(language):
    """Get file extension for a programming language"""
    extensions = {
        'python': '.py',
        'javascript': '.js',
        'java': '.java',
        'cpp': '.cpp',
        'csharp': '.cs',
        'php': '.php',
        'ruby': '.rb',
        'go': '.go',
        'rust': '.rs',
        'typescript': '.ts'
    }
    return extensions.get(language, '.txt')