// Mobile menu toggle
document.getElementById("menu-toggle").onclick = function () {
  var nav = document.getElementById("nav-menu");
  nav.classList.toggle("active");
};

// Code conversion functionality
class CodeConverter {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.codeExamples = this.initializeCodeExamples();
  }

  async runCode() {
    const code = this.outputCode.value.trim();
    if (!code) {
      this.showToast("No code to run!");
      return;
    }

    this.switchTab("output");
    this.setOutputStatus("Running...", "running");
    this.runBtn.disabled = true;
    this.runBtn.innerHTML = '<div class="mini-spinner"></div> Running';

    try {
      const result = await this.executeCode(code, this.targetLanguage.value);
      this.displayOutput(result);
    } catch (error) {
      this.displayError(error.message);
    } finally {
      this.runBtn.disabled = false;
      this.runBtn.innerHTML = "▶ Run";
    }
  }

  async executeCode(code, language) {
    // Simulate execution delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const executors = {
      javascript: this.executeJavaScript,
      python: this.executePython,
      java: this.executeJava,
      cpp: this.executeCpp,
      csharp: this.executeCsharp,
      php: this.executePHP,
      ruby: this.executeRuby,
      go: this.executeGo,
      rust: this.executeRust,
      typescript: this.executeTypeScript,
    };

    const executor = executors[language];
    if (executor) {
      return executor.call(this, code);
    } else {
      throw new Error(`Execution not supported for ${language}`);
    }
  }

  executeJavaScript(code) {
    try {
      // Create a safe execution environment
      const originalConsole = console.log;
      const outputs = [];

      // Override console.log to capture output
      console.log = (...args) => {
        outputs.push(
          args
            .map((arg) =>
              typeof arg === "object"
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(" ")
        );
      };

      // Execute the code in a try-catch
      const result = eval(code);

      // Restore original console.log
      console.log = originalConsole;

      // Return captured output or result
      if (outputs.length > 0) {
        return {
          success: true,
          output: outputs.join("\n"),
          executionTime: Math.random() * 100 + 50, // Simulated
        };
      } else if (result !== undefined) {
        return {
          success: true,
          output: String(result),
          executionTime: Math.random() * 100 + 50,
        };
      } else {
        return {
          success: true,
          output: "Code executed successfully (no output)",
          executionTime: Math.random() * 100 + 50,
        };
      }
    } catch (error) {
      throw new Error(`JavaScript Error: ${error.message}`);
    }
  }

  executePython(code) {
    // Simulate Python execution with basic interpretation
    const lines = code.split("\n").filter((line) => line.trim());
    const outputs = [];

    try {
      for (const line of lines) {
        if (line.trim().startsWith("print(")) {
          // Extract content from print statement
          const match = line.match(/print\((.*)\)/);
          if (match) {
            let content = match[1];
            // Handle string literals
            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1);
            } else if (content.startsWith("'") && content.endsWith("'")) {
              content = content.slice(1, -1);
            }
            // Handle simple expressions
            else if (/^\d+[\+\-\*\/]\d+$/.test(content)) {
              content = eval(content);
            }
            outputs.push(content);
          }
        } else if (line.includes("=") && !line.includes("==")) {
          // Variable assignment (simulate)
          outputs.push(`Variable assigned: ${line.trim()}`);
        }
      }

      return {
        success: true,
        output:
          outputs.length > 0
            ? outputs.join("\n")
            : "Python code executed successfully",
        executionTime: Math.random() * 150 + 80,
      };
    } catch (error) {
      throw new Error(`Python Error: ${error.message}`);
    }
  }

  executeJava(code) {
    // Simulate Java execution
    const outputs = [];
    const lines = code.split("\n");

    try {
      for (const line of lines) {
        if (line.includes("System.out.println(")) {
          const match = line.match(/System\.out\.println\((.*)\)/);
          if (match) {
            let content = match[1];
            if (content.startsWith('"') && content.endsWith('"')) {
              content = content.slice(1, -1);
            }
            outputs.push(content);
          }
        }
      }

      return {
        success: true,
        output:
          outputs.length > 0
            ? outputs.join("\n")
            : "Java code compiled and executed successfully",
        executionTime: Math.random() * 200 + 100,
      };
    } catch (error) {
      throw new Error(`Java Error: ${error.message}`);
    }
  }

  // Generic executors for other languages
  executeCpp(code) {
    return this.executeGeneric(code, "C++", /cout\s*<<\s*"([^"]*)"/, 120);
  }

  executeCsharp(code) {
    return this.executeGeneric(
      code,
      "C#",
      /Console\.WriteLine\("([^"]*)"\)/,
      140
    );
  }

  executePHP(code) {
    return this.executeGeneric(code, "PHP", /echo\s+"([^"]*)"/, 90);
  }

  executeRuby(code) {
    return this.executeGeneric(code, "Ruby", /puts\s+"([^"]*)"/, 110);
  }

  executeGo(code) {
    return this.executeGeneric(code, "Go", /fmt\.Println\("([^"]*)"\)/, 130);
  }

  executeRust(code) {
    return this.executeGeneric(code, "Rust", /println!\("([^"]*)"\)/, 160);
  }

  executeTypeScript(code) {
    // TypeScript uses same execution as JavaScript
    return this.executeJavaScript(code);
  }

  executeGeneric(code, language, printRegex, baseTime) {
    const outputs = [];
    const lines = code.split("\n");

    for (const line of lines) {
      const match = line.match(printRegex);
      if (match) {
        outputs.push(match[1]);
      }
    }

    return {
      success: true,
      output:
        outputs.length > 0
          ? outputs.join("\n")
          : `${language} code executed successfully`,
      executionTime: Math.random() * 100 + baseTime,
    };
  }

  displayOutput(result) {
    this.setOutputStatus(
      `Executed in ${result.executionTime.toFixed(1)}ms`,
      "success"
    );
    this.outputContent.textContent = result.output;
    this.outputContent.className = "output-content success";
  }

  displayError(errorMessage) {
    this.setOutputStatus("Execution failed", "error");
    this.outputContent.textContent = errorMessage;
    this.outputContent.className = "output-content error";
  }

  setOutputStatus(message, type) {
    this.outputStatus.textContent = message;
    this.outputStatus.className = `output-status ${type}`;
  }

  clearOutput() {
    this.outputContent.textContent =
      'Click "Run" to execute the converted code...';
    this.outputContent.className = "output-content";
    this.setOutputStatus("Ready to run", "");
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.toggle("active", content.dataset.tab === tabName);
    });
  }

  updateRunButtonState() {
    const hasCode = this.outputCode.value.trim().length > 0;
    this.runBtn.disabled = !hasCode;
    this.runBtn.style.opacity = hasCode ? "1" : "0.5";
  }

  initializeElements() {
    this.sourceLanguage = document.getElementById("source-language");
    this.targetLanguage = document.getElementById("target-language");
    this.sourceCode = document.getElementById("source-code");
    this.outputCode = document.getElementById("output-code");
    this.codeOutput = document.getElementById("code-output");
    this.outputContent = document.getElementById("output-content");
    this.outputStatus = document.getElementById("output-status");
    this.convertBtn = document.getElementById("convert-btn");
    this.runBtn = document.getElementById("run-code");
    this.swapBtn = document.getElementById("swap-languages");
    this.convertText = this.convertBtn.querySelector(".convert-text");
    this.loadingSpinner = this.convertBtn.querySelector(".loading-spinner");
  }

  bindEvents() {
    this.convertBtn.addEventListener("click", () => this.convertCode());
    this.runBtn.addEventListener("click", () => this.runCode());
    this.swapBtn.addEventListener("click", () => this.swapLanguages());

    // Tab switching
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.switchTab(e.target.dataset.tab)
      );
    });

    // Button events
    document.getElementById("clear-source").addEventListener("click", () => {
      this.sourceCode.value = "";
      this.outputCode.value = "";
      this.clearOutput();
    });

    document
      .getElementById("clear-output")
      .addEventListener("click", () => this.clearOutput());
    document
      .getElementById("copy-source")
      .addEventListener("click", () =>
        this.copyToClipboard(this.sourceCode.value)
      );
    document
      .getElementById("copy-output")
      .addEventListener("click", () =>
        this.copyToClipboard(this.outputCode.value)
      );
    document
      .getElementById("download-output")
      .addEventListener("click", () => this.downloadCode());

    // Example buttons
    document.querySelectorAll(".example-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const lang = e.target.dataset.lang;
        const code = e.target.dataset.code;
        this.loadExample(lang, code);
      });
    });
  }

  initializeCodeExamples() {
    return {
      fibonacci: {
        javascript: `function fibonacci(n) {
    if (n <= 1) return n;
                        return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));`,
        python: `def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))`,
        java: `public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println(fibonacci(10));
    }
}`,
      },
    };
  }

  async convertCode() {
    const sourceCode = this.sourceCode.value.trim();
    if (!sourceCode) {
      alert("Please enter some source code to convert.");
      return;
    }

    this.showLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const convertedCode = this.simulateConversion(
        sourceCode,
        this.sourceLanguage.value,
        this.targetLanguage.value
      );

      this.outputCode.value = convertedCode;
      this.clearOutput();
      this.updateRunButtonState();
    } catch (error) {
      alert("Conversion failed. Please try again.");
      console.error("Conversion error:", error);
    } finally {
      this.showLoading(false);
    }
  }

  simulateConversion(code, fromLang, toLang) {
    // This is a simple simulation - in real implementation, you'd call your AI API
    const conversions = {
      "javascript-python": this.jsToPython,
      "python-javascript": this.pythonToJs,
      "javascript-java": this.jsToJava,
      "python-java": this.pythonToJava,
    };

    const conversionKey = `${fromLang}-${toLang}`;
    const converter = conversions[conversionKey];

    if (converter) {
      return converter(code);
    } else {
      return `// Converted from ${fromLang} to ${toLang}
// Note: This is a simulated conversion for demo purposes
// In production, this would use actual AI conversion

${this.genericConversion(code, fromLang, toLang)}`;
    }
  }

  jsToPython(jsCode) {
    return jsCode
      .replace(/function\s+(\w+)\s*\([^)]*\)\s*{/g, "def $1():")
      .replace(/console\.log\(/g, "print(")
      .replace(/let\s+/g, "")
      .replace(/const\s+/g, "")
      .replace(/var\s+/g, "")
      .replace(/\/\/\s*/g, "# ")
      .replace(/true/g, "True")
      .replace(/false/g, "False")
      .replace(/null/g, "None");
  }

  pythonToJs(pythonCode) {
    return (
      pythonCode
        .replace(/def\s+(\w+)\s*\([^)]*\):/g, "function $1() {")
        .replace(/print\(/g, "console.log(")
        .replace(/#\s*/g, "// ")
        .replace(/True/g, "true")
        .replace(/False/g, "false")
        .replace(/None/g, "null")
        .split("\n")
        .map((line) => line.replace(/^(\s*)/, "$1"))
        .join("\n") + "\n}"
    );
  }

  jsToJava(jsCode) {
    return `public class ConvertedCode {
    ${jsCode
      .replace(/function\s+(\w+)/g, "public static void $1")
      .replace(/console\.log/g, "System.out.println")}
}`;
  }

  pythonToJava(pythonCode) {
    return `public class ConvertedCode {
    ${pythonCode
      .replace(/def\s+(\w+)/g, "public static void $1")
      .replace(/print/g, "System.out.println")
      .replace(/#/g, "//")}
}`;
  }

  genericConversion(code, fromLang, toLang) {
    const langComments = {
      javascript: "//",
      python: "#",
      java: "//",
      cpp: "//",
      csharp: "//",
      php: "//",
      ruby: "#",
      go: "//",
      rust: "//",
      typescript: "//",
    };

    const comment = langComments[toLang] || "//";
    return `${comment} Original ${fromLang} code converted to ${toLang}:\n\n${code}`;
  }

  swapLanguages() {
    const sourceValue = this.sourceLanguage.value;
    const targetValue = this.targetLanguage.value;

    this.sourceLanguage.value = targetValue;
    this.targetLanguage.value = sourceValue;

    // Also swap the code if there's converted code
    if (this.outputCode.value) {
      const tempCode = this.sourceCode.value;
      this.sourceCode.value = this.outputCode.value;
      this.outputCode.value = tempCode;
    }
  }

  loadExample(lang, code) {
    this.sourceLanguage.value = lang;
    this.sourceCode.value = code;
    this.outputCode.value = "";
    this.clearOutput();
    this.updateRunButtonState();
  }

  showLoading(show) {
    if (show) {
      this.convertText.style.display = "none";
      this.loadingSpinner.style.display = "block";
      this.convertBtn.disabled = true;
    } else {
      this.convertText.style.display = "block";
      this.loadingSpinner.style.display = "none";
      this.convertBtn.disabled = false;
    }
  }

  async copyToClipboard(text) {
    if (!text) {
      alert("Nothing to copy!");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      // Show temporary success message
      this.showToast("Copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      this.showToast("Copied to clipboard!");
    }
  }

  downloadCode() {
    const code = this.outputCode.value;
    if (!code) {
      alert("No converted code to download!");
      return;
    }

    const extensions = {
      javascript: "js",
      python: "py",
      java: "java",
      cpp: "cpp",
      csharp: "cs",
      php: "php",
      ruby: "rb",
      go: "go",
      rust: "rs",
      typescript: "ts",
    };

    const ext = extensions[this.targetLanguage.value] || "txt";
    const filename = `converted_code.${ext}`;

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("show");
    }, 100);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
  }
}

// Initialize the code converter when page loads
document.addEventListener("DOMContentLoaded", () => {
  const converter = new CodeConverter();

  // Update run button state when output code changes
  const outputCode = document.getElementById("output-code");
  if (outputCode) {
    outputCode.addEventListener("input", () =>
      converter.updateRunButtonState()
    );
  }
});
