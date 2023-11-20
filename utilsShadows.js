const fs = require('fs').promises
const path = require('path');
const glob = require('glob');
const { match } = require('assert');

class Obj {

    // Inicia la connexió amb la base de dades
    async init (indexPath, shadowsPath) {
        this.indexDev = await this.processIndexDev(indexPath, shadowsPath)
        this.shadows = await this.processShadows(shadowsPath)
    }

    getIndexDev () { return this.indexDev }
    getShadows () { return this.shadows }

    async processIndexDev(indexPath, shadowsPath) {
        try {
            // Busca archivos JavaScript en subcarpetas de shadowsPath
            const jsFiles = await new Promise((resolve, reject) => {
                glob('**/*.js', { cwd: shadowsPath }, (err, files) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(files)
                    }
                });
            })
    
            const scripts = jsFiles.map(jsFile => `<script src="/shadows/${jsFile}" defer></script>`).join('\n        ')
            let indexTXT = await fs.readFile(indexPath, 'utf8')
            
            // Reemplaza la etiqueta de script existente con los nuevos scripts
            indexTXT = indexTXT.replace('<script src="/shadows.js" defer></script>', scripts)
    
            return indexTXT;
        } catch (error) {
            console.error("Error 'processIndexDev':", error)
            return "<html><body>Error</body></html>"
        }
    }
    
    async processShadows(shadowsPath) {
        let accumulatedContent = "";
        try {
            const files = await fs.readdir(shadowsPath);
    
            for (const file of files) {
                const fullPath = path.join(shadowsPath, file);
                const stats = await fs.stat(fullPath);
    
                if (stats.isFile() && path.extname(file) === '.js') {
                    let fileTXT = await fs.readFile(fullPath, 'utf8')
                    let fixed = fileTXT
    
                    // Substituir el contingut del .css i .html
                    fixed = await this.replaceFetchWithContent(fixed)
    
                    accumulatedContent += '\n\n' + fixed
                } else if (stats.isDirectory()) {
                    // Recursivamente procesar subdirectorios y concatenar el resultado
                    const subfolderContent = await this.processShadows(fullPath)
                    accumulatedContent += '\n\n' + subfolderContent
                }
            }
        } catch (error) {
            console.error("Error 'processShadows':", error)
        }
        return accumulatedContent
    }
    
    async replaceFetchWithContent(input) {
        const regex = /\/(.*?)\.\w+/g
        const lines = input.split('\n')
        let lineNumber = 0
        let result = ''
        for (const line of lines) {
            lineNumber++
            const match = line.match(regex)
            if (match && (match[0].indexOf(".html") >= 0 || match[0].indexOf(".css") >= 0)) {
                const filePath = './public' + match;
                const fullPath = path.resolve(filePath)
                if (await this.isFile(fullPath)) {
                    const fileTxt = await fs.readFile(fullPath, 'utf8')
                    if (match[0].indexOf(".css") >= 0) {
                        result += 'style.textContent = `\n' + fileTxt + '`\n'
                    }
                    if (match[0].indexOf(".html") >= 0) {
                        result += 'const htmlContent = `\n' + fileTxt + '`\n'
                    }
                }
            } else {
                result += line + '\n'
            }
        }
        return result;
    }

    async isFile(filePath) {
        try {
            const stats = await fs.stat(filePath)
            return stats.isFile()
        } catch (err) {
            return false
        }
    }
}

// Export
module.exports = Obj