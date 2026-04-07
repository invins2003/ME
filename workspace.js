// AmbitDev Workspace IDE Logic - Monterey Premium Edition
document.addEventListener('DOMContentLoaded', () => {
    initWorkspace();
});

function initWorkspace() {
    setupMarkdownEditor();
    initCursor();
    logTerminal('Monterey System v2.0 initialized.', 'success');
    logTerminal('Visual Writing Canvas ready for high-fidelity output.');
}

// ---------------------------------------------------------
// TERMINAL LOGGING (Mac Style)
// ---------------------------------------------------------
function logTerminal(message, type = 'info') {
    const terminal = document.getElementById('terminal-output');
    if (!terminal) return;

    const line = document.createElement('div');
    line.className = `line ${type}`;
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    line.innerHTML = `<span class="prompt">[${timestamp}] ambit@macbook-pro ~ %</span> ${message}`;
    
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// ---------------------------------------------------------
// TOOL: PREMIUM VISUAL EDITOR
// ---------------------------------------------------------
function setupMarkdownEditor() {
    const editor = document.getElementById('md-input');
    const display = document.getElementById('md-code-display');
    const dlBtn = document.getElementById('dl-md-btn');
    const fontSizeSelect = document.getElementById('font-size-select');

    if (!editor || !display) return;

    // Real-time Sync & Paste Handling
    editor.oninput = () => syncMarkdown();
    editor.onpaste = (e) => {
        logTerminal('Processing incoming paste data...');
        // Delay sync slightly to allow paste to complete in DOM
        setTimeout(() => {
            syncMarkdown();
            logTerminal('Sanitized and synced content to Markdown.', 'success');
        }, 50);
    };

    function syncMarkdown() {
        const markdown = htmlToMarkdown(editor.innerHTML);
        display.textContent = markdown;
    }

    // Font Size Control
    if (fontSizeSelect) {
        fontSizeSelect.onchange = (e) => {
            editor.style.fontSize = e.target.value;
            logTerminal(`Document font size set to ${e.target.value}`);
        };
    }

    // Robust HTML to Markdown Parser (Sanitized for Word)
    function htmlToMarkdown(html) {
        // Clean Microsoft Junk and non-content tags
        const sanitizedHtml = html
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '') // Remove VML (Word-specific shapes)
            .replace(/<o:p>[\s\S]*?<\/o:p>/gi, '') // Remove Word-specific empty paragraphs
            .replace(/<meta[^>]*>/gi, '')
            .replace(/<link[^>]*>/gi, '');

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = sanitizedHtml;
        
        let md = "";

        // Blacklist tags that shouldn't contribute to text output
        const blacklistedTags = ['style', 'script', 'head', 'title', 'xml', 'link', 'meta'];

        function traverse(node, listPrefix = '') {
            if (node.nodeType === Node.TEXT_NODE) {
                // Remove Windows-style line breaks and limit extra spacing
                let text = node.textContent.replace(/\r\n/g, '\n');
                md += text;
                return;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const tag = node.tagName.toLowerCase();
                if (blacklistedTags.includes(tag)) return; // Skip tag AND children

                const children = Array.from(node.childNodes);
                const style = (node.getAttribute('style') || "").toLowerCase().replace(/\s/g, '');
                
                // Detect Formatting in Styles (More robust detection)
                const isBold = tag === 'b' || tag === 'strong' || 
                              style.includes('font-weight:bold') || 
                              style.includes('font-weight:700');
                const isItalic = tag === 'i' || tag === 'em' || 
                                style.includes('font-style:italic');
                const isUnderline = tag === 'u' || style.includes('text-decoration:underline');
                const isStrike = tag === 's' || tag === 'strike' || style.includes('text-decoration:line-through');

                switch(tag) {
                    case 'h1': md += '\n# '; break;
                    case 'h2': md += '\n## '; break;
                    case 'h3': md += '\n### '; break;
                    case 'p': case 'div': 
                        if (md.trim().length > 0 && !md.endsWith('\n\n')) md += '\n\n'; 
                        break;
                    case 'br': md += '\n'; break;
                    case 'li': md += `\n${listPrefix}- `; break;
                    case 'a': md += '['; break;
                    case 'img': 
                        const src = node.getAttribute('src') || '';
                        const alt = node.getAttribute('alt') || 'image';
                        md += `![${alt}](${src})`;
                        return; // Done for images
                }

                if (isBold) md += '**';
                if (isItalic) md += '*';
                if (isUnderline) md += '<u>';
                if (isStrike) md += '~~';

                children.forEach(child => traverse(child, tag === 'ul' || tag === 'ol' ? listPrefix + '  ' : listPrefix));

                if (isBold) md += '**';
                if (isItalic) md += '*';
                if (isUnderline) md += '</u>';
                if (isStrike) md += '~~';

                switch(tag) {
                    case 'a': md += `](${node.getAttribute('href') || '#'})`; break;
                    case 'ul': case 'ol': 
                        if (!md.endsWith('\n\n')) md += '\n'; 
                        break;
                }
            }
        }

        Array.from(tempDiv.childNodes).forEach(node => traverse(node));
        
        // Final cleanup: handle multiple newlines and trim
        return md
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+\n/g, '\n') // Trim trailing spaces on lines
            .trim();
    }

    // WYSIWYG Toolbar Logic
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const format = btn.dataset.format;
            applyVisualFormat(format);
            syncMarkdown();
        };
    });

    function applyVisualFormat(format) {
        editor.focus();
        
        // Ensure we are working with the selection in the editor
        const selection = window.getSelection();
        if (!editor.contains(selection.anchorNode)) {
            // Restore selection or just focus at the end if selection is lost
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }

        switch(format) {
            case 'bold': document.execCommand('bold', false); break;
            case 'italic': document.execCommand('italic', false); break;
            case 'h1': document.execCommand('formatBlock', false, 'H1'); break;
            case 'h2': document.execCommand('formatBlock', false, 'H2'); break;
            case 'link': 
                const url = prompt('Enter URL:', 'https://');
                if (url) document.execCommand('createLink', false, url);
                break;
            case 'list': document.execCommand('insertUnorderedList', false); break;
        }
        logTerminal(`Applied ${format} formatting.`);
    }

    // Export Logic
    dlBtn.onclick = () => {
        const text = display.textContent;
        if (!text || text.length < 5) {
            logTerminal('Error: Nothing substantial to export.', 'error');
            return;
        }
        const blob = new Blob([text], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ambitdev_visual_output.md';
        a.click();
        logTerminal('Visual creation exported as .md successfully.', 'success');
    };

    // Word-to-Markdown Conversion Feature
    const wordBtn = document.getElementById('import-word-btn');
    const wordInput = document.getElementById('word-upload');

    if (wordBtn && wordInput) {
        wordBtn.onclick = () => wordInput.click();

        wordInput.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (!file.name.endsWith('.docx')) {
                logTerminal('Error: Only .docx files are supported.', 'error');
                return;
            }

            logTerminal(`Inbound Document: ${file.name}`);
            logTerminal('Converting from Word semantic structure...');

            const reader = new FileReader();
            reader.onload = function(event) {
                const arrayBuffer = event.target.result;
                
                mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                    .then(result => {
                        const html = result.value; // The generated HTML
                        const messages = result.messages; // Any warnings
                        
                        messages.forEach(m => console.warn('Word Convert Warning:', m.message));
                        
                        // Update visual editor
                        editor.innerHTML = html;
                        
                        // Wait for DOM then sync to markdown
                        setTimeout(() => {
                            syncMarkdown();
                            logTerminal('Success: Document imported and converted to Markdown.', 'success');
                            document.getElementById('active-tab-name').textContent = file.name.replace('.docx', '.md');
                        }, 100);
                    })
                    .catch(err => {
                        logTerminal(`Conversion Error: ${err.message}`, 'error');
                        console.error(err);
                    });
            };
            
            reader.readAsArrayBuffer(file);
            // Reset input
            wordInput.value = '';
        };
    }

    syncMarkdown();
}

// ---------------------------------------------------------
// CUSTOM CURSOR LOGIC (Premium)
// ---------------------------------------------------------
function initCursor() {
    let cursor = document.getElementById('custom-cursor');
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'custom-cursor';
        document.body.appendChild(cursor);
    }

    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '10001';
    cursor.style.display = 'block';

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .nav-button, .rich-editor, select, h1, h2');
        if (target) {
            cursor.classList.add('hover');
        } else {
            cursor.classList.remove('hover');
        }
    });
}
