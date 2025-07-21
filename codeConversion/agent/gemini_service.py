import google.generativeai as genai
from django.conf import settings
import logging
import json
import re

logger = logging.getLogger('converter')

class GeminiCodeConverter:
    def __init__(self):
        """Initialize the Gemini API client"""
        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            logger.info("Gemini API client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini API client: {str(e)}")
            raise

    def get_conversion_prompt(self, source_code, source_lang, target_lang):
        """Generate a detailed prompt for code conversion"""
        prompt = f"""
You are an expert software engineer specializing in code conversion between programming languages. 
Your task is to convert the provided {source_lang} code to {target_lang} while maintaining:

1. **Exact Functionality**: The converted code must perform identically to the original
2. **Best Practices**: Follow {target_lang} coding conventions and idioms
3. **Error Handling**: Preserve or improve error handling mechanisms
4. **Comments**: Add only one comment into the top of code helpful comment explaining complex conversions
5. **Optimization**: Use {target_lang}-specific optimizations where appropriate

**IMPORTANT GUIDELINES:**
- Only return the converted code, no explanations or markdown formatting
- Ensure the code is syntactically correct and runnable
- Handle language-specific features appropriately (e.g., memory management, type systems)
- Convert data structures to their {target_lang} equivalents
- Maintain variable naming conventions appropriate for {target_lang}
- Handle imports/libraries by using {target_lang} standard libraries or popular equivalents

**Source Language**: {source_lang}
**Target Language**: {target_lang}

**Code to Convert:**
```{source_lang}
{source_code}
```

**Converted {target_lang} Code:**
"""
        return prompt

    def convert_code(self, source_code, source_lang, target_lang):
        """
        Convert code from source language to target language using Gemini AI
        
        Args:
            source_code (str): The source code to convert
            source_lang (str): Source programming language
            target_lang (str): Target programming language
            
        Returns:
            dict: Result containing converted code or error information
        """
        try:
            # Validate inputs
            if not source_code.strip():
                return {
                    'success': False,
                    'error': 'Source code cannot be empty',
                    'converted_code': ''
                }

            if source_lang == target_lang:
                return {
                    'success': False,
                    'error': 'Source and target languages must be different',
                    'converted_code': ''
                }

            # Generate the prompt
            prompt = self.get_conversion_prompt(source_code, source_lang, target_lang)
            
            logger.info(f"Converting code from {source_lang} to {target_lang}")
            
            # Generate response from Gemini
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                return {
                    'success': False,
                    'error': 'No response generated from AI model',
                    'converted_code': ''
                }

            converted_code = self._clean_response(response.text)
            
            logger.info(f"Code conversion completed successfully")
            
            return {
                'success': True,
                'error': None,
                'converted_code': converted_code,
                'source_language': source_lang,
                'target_language': target_lang
            }

        except Exception as e:
            error_msg = f"Code conversion failed: {str(e)}"
            logger.error(error_msg)
            return {
                'success': False,
                'error': error_msg,
                'converted_code': ''
            }

    def _clean_response(self, response_text):
        """Clean the AI response to extract only the code"""
        # Remove markdown code blocks if present
        code_block_pattern = r'```[\w]*\n?(.*?)\n?```'
        matches = re.findall(code_block_pattern, response_text, re.DOTALL)
        
        if matches:
            # Use the first code block found
            cleaned_code = matches[0].strip()
        else:
            # If no code blocks found, use the entire response
            cleaned_code = response_text.strip()
        
        # Remove any leading/trailing whitespace
        cleaned_code = cleaned_code.strip()
        
        return cleaned_code

    def get_language_info(self, language):
        """Get information about programming language"""
        language_info = {
            'javascript': {
                'name': 'JavaScript',
                'extension': '.js',
                'comment': '//',
                'features': ['dynamic typing', 'functional programming', 'async/await']
            },
            'python': {
                'name': 'Python',
                'extension': '.py',
                'comment': '#',
                'features': ['dynamic typing', 'indentation-based', 'duck typing']
            },
            'java': {
                'name': 'Java',
                'extension': '.java',
                'comment': '//',
                'features': ['static typing', 'object-oriented', 'garbage collection']
            },
            'cpp': {
                'name': 'C++',
                'extension': '.cpp',
                'comment': '//',
                'features': ['static typing', 'manual memory management', 'templates']
            },
            'csharp': {
                'name': 'C#',
                'extension': '.cs',
                'comment': '//',
                'features': ['static typing', '.NET framework', 'LINQ']
            },
            'php': {
                'name': 'PHP',
                'extension': '.php',
                'comment': '//',
                'features': ['dynamic typing', 'web-focused', 'server-side']
            },
            'ruby': {
                'name': 'Ruby',
                'extension': '.rb',
                'comment': '#',
                'features': ['dynamic typing', 'everything is object', 'blocks']
            },
            'go': {
                'name': 'Go',
                'extension': '.go',
                'comment': '//',
                'features': ['static typing', 'goroutines', 'interfaces']
            },
            'rust': {
                'name': 'Rust',
                'extension': '.rs',
                'comment': '//',
                'features': ['memory safety', 'zero-cost abstractions', 'ownership']
            },
            'typescript': {
                'name': 'TypeScript',
                'extension': '.ts',
                'comment': '//',
                'features': ['static typing', 'JavaScript superset', 'interfaces']
            }
        }
        
        return language_info.get(language, {
            'name': language.capitalize(),
            'extension': f'.{language}',
            'comment': '//',
            'features': []
        })

# Create a singleton instance
gemini_converter = GeminiCodeConverter()