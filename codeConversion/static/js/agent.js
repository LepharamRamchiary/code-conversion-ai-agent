// static/js/agent.js
class CodeConverter {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.currentTab = 'code';
    }

    initializeElements() {
        // Language selectors
        this.sourceLanguageSelect = document.getElementById('source-language');
        this.targetLanguageSelect = document.getElementById('target-language');
        this.swapLanguagesBtn = document.getElementById('swap-languages');

        // Code editors
        this.sourceCodeTextarea = document.getElementById('source-code');
        this.outputCodeTextarea = document.getElementById('output-code');

        // Buttons
        this.convertBtn = document.getElementById('convert-btn');
        this.clearSourceBtn = document.getElementById('clear-source');
        this.copySourceBtn = document.getElementById('copy-source');
        this.copyOutputBtn = document.getElementById('copy-output');
        this.downloadOutputBtn = document.getElementById('download-output');
        this.runCodeBtn = document.getElementById('run-code');
        this.clearOutputBtn = document.getElementById('clear-output');

        // UI elements
        this.convertText = document.querySelector('.convert-text');
        this.loadingSpinner = document.querySelector('.loading-spinner');
        this.outputStatus = document.getElementById('output-status');
        this.outputContent = document.getElementById('output-content');

        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.tabContents = document.querySelectorAll('.tab-content');

        // CSRF token
        this.csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value || 
                        document.querySelector('input[name="csrfmiddlewaretoken"]')?.value ||
                        this.getCSRFTokenFromCookie();
    }

    getCSRFTokenFromCookie() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 'csrftoken'.length + 1) === ('csrftoken' + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    attachEventListeners() {
        // Language swap functionality
        this.swapLanguagesBtn?.addEventListener('click', () => this.swapLanguages());

        // Convert button
        this.convertBtn?.addEventListener('click', () => this.convertCode());

        // Clear and copy buttons
        this.clearSourceBtn?.addEventListener('click', () => this.clearSource());
        this.copySourceBtn?.addEventListener('click', () => this.copyToClipboard(this.sourceCodeTextarea));
        this.copyOutputBtn?.addEventListener('click', () => this.copyToClipboard(this.outputCodeTextarea));
        this.downloadOutputBtn?.addEventListener('click', () => this.downloadCode());
        this.runCodeBtn?.addEventListener('click', () => this.runCode());
        this.clearOutputBtn?.addEventListener('click', () => this.clearOutput());

        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });

        // Auto-resize textareas
        this.sourceCodeTextarea?.addEventListener('input', () => this.autoResize(this.sourceCodeTextarea));
        this.outputCodeTextarea?.addEventListener('input', () => this.autoResize(this.outputCodeTextarea));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    swapLanguages() {
        const sourceValue = this.sourceLanguageSelect.value;
        const targetValue = this.targetLanguageSelect.value;
        
        this.sourceLanguageSelect.value = targetValue;
        this.targetLanguageSelect.value = sourceValue;

        // Also swap the code if there's converted code
        if (this.outputCodeTextarea.value.trim()) {
            const sourceCode = this.sourceCodeTextarea.value;
            const outputCode = this.outputCodeTextarea.value;
            
            this.sourceCodeTextarea.value = outputCode;
            this.outputCodeTextarea.value = sourceCode;
        }

        this.showNotification('Languages swapped successfully!', 'success');
    }

    async convertCode() {
        const sourceCode = this.sourceCodeTextarea.value.trim();
        const sourceLanguage = this.sourceLanguageSelect.value;
        const targetLanguage = this.targetLanguageSelect.value;

        // Validation
        if (!sourceCode) {
            this.showNotification('Please enter source code to convert', 'error');
            this.sourceCodeTextarea.focus();
            return;
        }

        if (sourceLanguage === targetLanguage) {
            this.showNotification('Please select different source and target languages', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);
        this.outputStatus.textContent = 'Converting code...';

        try {
            const response = await fetch('/convert/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken,
                },
                body: JSON.stringify({
                    source_code: sourceCode,
                    source_language: sourceLanguage,
                    target_language: targetLanguage
                })
            });

            const data = await response.json();

            if (data.success) {
                this.outputCodeTextarea.value = data.converted_code;
                this.outputStatus.textContent = `Successfully converted from ${data.source_language} to ${data.target_language}`;
                this.showNotification(data.message, 'success');
                
                // Switch to code tab to show result
                this.switchTab('code');
                
                // Auto-resize the output textarea
                this.autoResize(this.outputCodeTextarea);
            } else {
                this.outputStatus.textContent = 'Conversion failed';
                this.showNotification(data.error, 'error');
                this.clearOutput();
            }
        } catch (error) {
            console.error('Conversion error:', error);
            this.outputStatus.textContent = 'Network error occurred';
            this.showNotification('Failed to connect to the server. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    async runCode() {
        const code = this.outputCodeTextarea.value.trim();
        const language = this.targetLanguageSelect.value;

        if (!code) {
            this.showNotification('No code to run', 'error');
            return;
        }

        // Switch to output tab
        this.switchTab('output');
        this.outputStatus.textContent = 'Running code...';
        this.outputContent.textContent = 'Executing...';

        try {
            const response = await fetch('/run-code/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.csrfToken,
                },
                body: JSON.stringify({
                    code: code,
                    language: language
                })
            });

            const data = await response.json();

            if (data.success) {
                this.outputStatus.textContent = 'Execution completed';
                this.outputContent.textContent = data.output || 'Code executed successfully (no output)';
                
                if (data.error) {
                    this.outputContent.textContent += '\n\nWarnings/Errors:\n' + data.error;
                }
                
                this.showNotification('Code executed successfully!', 'success');
            } else {
                this.outputStatus.textContent = 'Execution failed';
                this.outputContent.textContent = data.error;
                this.showNotification(data.error, 'error');
            }
        } catch (error) {
            console.error('Execution error:', error);
            this.outputStatus.textContent = 'Network error';
            this.outputContent.textContent = 'Failed to execute code. Please try again.';
            this.showNotification('Failed to connect to the server', 'error');
        }
    }

    clearSource() {
        this.sourceCodeTextarea.value = '';
        this.sourceCodeTextarea.focus();
        this.showNotification('Source code cleared', 'info');
    }

    clearOutput() {
        this.outputContent.textContent = 'Click "Run" to execute the converted code...';
        this.outputStatus.textContent = 'Ready to run';
    }

    async copyToClipboard(textarea) {
        const text = textarea.value;
        
        if (!text.trim()) {
            this.showNotification('Nothing to copy', 'warning');
            return;
        } 

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            // Fallback method
            textarea.select();
            document.execCommand('copy');
            this.showNotification('Code copied to clipboard!', 'success');
        }
    }

    downloadCode() {
        const code = this.outputCodeTextarea.value;
        const language = this.targetLanguageSelect.value;
        
        if (!code.trim()) {
            this.showNotification('No code to download', 'warning');
            return;
        }

        const fileExtensions = {
            javascript: '.js',
            python: '.py',
            java: '.java',
            cpp: '.cpp',
            csharp: '.cs',
            php: '.php',
            ruby: '.rb',
            go: '.go',
            rust: '.rs',
            typescript: '.ts'
        };

        const extension = fileExtensions[language] || '.txt';
        const filename = `converted_code${extension}`;
        
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(`Code downloaded as ${filename}`, 'success');
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });

        this.currentTab = tabName;
    }

    setLoadingState(isLoading) {
        this.convertBtn.disabled = isLoading;
        
        if (isLoading) {
            this.convertText.style.display = 'none';
            this.loadingSpinner.style.display = 'flex';
        } else {
            this.convertText.style.display = 'inline';
            this.loadingSpinner.style.display = 'none';
        }
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 600) + 'px';
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            this.convertCode();
        }
        
        // Ctrl/Cmd + Shift + R to run code
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            this.runCode();
        }

        // Ctrl/Cmd + Shift + S to swap languages
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            this.swapLanguages();
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
    }
}

// Initialize the code converter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.codeConverter = new CodeConverter();
    
    // Add some helpful information
    console.log('Code Converter initialized successfully!');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl/Cmd + Enter: Convert code');
    console.log('  Ctrl/Cmd + Shift + R: Run code');
    console.log('  Ctrl/Cmd + Shift + S: Swap languages');
});