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

  initializeElements() {
    this.sourceLanguage = document.getElementById("source-language");
    this.targetLanguage = document.getElementById("target-language");
    this.sourceCode = document.getElementById("source-code");
    this.outputCode = document.getElementById("output-code");
    this.convertBtn = document.getElementById("convert-btn");
    this.swapBtn = document.getElementById("swap-languages");
    this.convertText = this.convertBtn.querySelector(".convert-text");
    this.loadingSpinner = this.convertBtn.querySelector(".loading-spinner");
  }

  bindEvents() {
    this.convertBtn.addEventListener("click", () => this.convertCode());
    this.swapBtn.addEventListener("click", () => this.swapLanguages());

    // Button events
    document.getElementById("clear-source").addEventListener("click", () => {
      this.sourceCode.value = "";
      this.outputCode.value = "";
    });

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
  new CodeConverter();
});
