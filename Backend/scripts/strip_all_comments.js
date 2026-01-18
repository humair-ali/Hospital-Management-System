const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../');
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css'];
const excludes = ['node_modules', '.next', 'dist', 'build', '.git', 'coverage', 'logs', 'tmp'];

function isRegexStart(lastChar, lastWord) {
    if ('(,=:[!&|?{};'.includes(lastChar)) return true;
    if (['return', 'print', 'throw', 'case', 'new', 'typeof', 'void', 'delete', 'await', 'yield'].includes(lastWord)) return true;
    return false;
}

function stripFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath).toLowerCase();

    let output = '';

    if (ext === '.css') {
        
        let state = 'CODE';
        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const next = content[i + 1];

            if (state === 'CODE') {
                if (char === '/' && next === '*') {
                    state = 'COMMENT';
                    i++;
                } else {
                    output += char;
                }
            } else if (state === 'COMMENT') {
                if (char === '*' && next === '/') {
                    state = 'CODE';
                    i++;
                }
            }
        }
    } else {
        
        let state = 'CODE'; 
        let quoteChar = '';
        let lastSignificantChar = ';'; 
        let tokenBuffer = ''; 

        for (let i = 0; i < content.length; i++) {
            const char = content[i];
            const next = content[i + 1];

            if (state === 'CODE') {
                
                if (char === '"' || char === "'") {
                    state = 'STRING';
                    quoteChar = char;
                    output += char;
                }
                
                else if (char === '`') {
                    state = 'TEMPLATE';
                    output += char;
                }
                
                else if (char === '/' && next === '/') {
                    state = 'COMMENT_LINE';
                    i++;
                }
                else if (char === '/' && next === '*') {
                    state = 'COMMENT_BLOCK';
                    i++;
                }
                
                else if (char === '/') {
                    
                    if (isRegexStart(lastSignificantChar, tokenBuffer)) {
                        state = 'REGEX';
                        output += char;
                    } else {
                        output += char; 
                    }
                }
                else {
                    output += char;
                    if (!/\s/.test(char)) {
                        lastSignificantChar = char;
                        if (/[a-zA-Z0-9_$]/.test(char)) {
                            
                        } else {
                            tokenBuffer = ''; 
                        }
                    }
                    if (/[a-zA-Z0-9_$]/.test(char)) {
                        tokenBuffer += char;
                    } else {
                        if (lastSignificantChar === char) tokenBuffer = ''; 
                    }
                    
                    
                    
                    
                    if (char === ' ' || char === '\n' || char === '\t') {
                        
                    } else if (!/[a-zA-Z0-9_$]/.test(char)) {
                        tokenBuffer = ''; 
                    }
                }
            }
            else if (state === 'STRING') {
                output += char;
                if (char === '\\') {
                    output += next; 
                    i++;
                } else if (char === quoteChar) {
                    state = 'CODE';
                    
                    lastSignificantChar = '"';
                    tokenBuffer = '';
                }
            }
            else if (state === 'TEMPLATE') {
                output += char;
                if (char === '\\') {
                    output += next;
                    i++;
                } else if (char === '`') {
                    state = 'CODE';
                    lastSignificantChar = '`';
                    tokenBuffer = '';
                }
                
                
                
                
                
                
                
                
                
                
            }
            else if (state === 'REGEX') {
                output += char;
                if (char === '\\') {
                    output += next;
                    i++;
                } else if (char === '/') {
                    state = 'CODE';
                    lastSignificantChar = '/';
                    tokenBuffer = '';
                }
            }
            else if (state === 'COMMENT_LINE') {
                if (char === '\n') {
                    output += char;
                    state = 'CODE';
                    lastSignificantChar = '\n'; 
                    tokenBuffer = '';
                }
                
            }
            else if (state === 'COMMENT_BLOCK') {
                if (char === '*' && next === '/') {
                    state = 'CODE';
                    i++;
                    lastSignificantChar = '/'; 
                    tokenBuffer = '';
                }
                
            }
        }

        
        if (output !== content) {
            fs.writeFileSync(filePath, output, 'utf8');
            console.log(`Processed: ${filePath}`);
        }
    }
}

function traverse(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (excludes.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverse(fullPath);
        } else {
            if (extensions.includes(path.extname(file).toLowerCase())) {
                stripFile(fullPath);
            }
        }
    }
}

console.log('Starting comment removal...');
traverse(rootDir);
console.log('Done.');
