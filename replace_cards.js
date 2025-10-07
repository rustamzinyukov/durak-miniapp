const fs = require('fs');
const path = require('path');

// Функция для копирования файлов
function copyFile(source, destination) {
    try {
        fs.copyFileSync(source, destination);
        console.log(`Copied: ${path.basename(source)} -> ${path.basename(destination)}`);
        return true;
    } catch (error) {
        console.error(`Error copying ${source}:`, error.message);
        return false;
    }
}

// Функция для копирования всех карт из папки
function copyCardsFromFolder(sourceFolder, destFolder) {
    try {
        const files = fs.readdirSync(sourceFolder);
        let copied = 0;
        
        files.forEach(file => {
            if (file.endsWith('.webp')) {
                const sourcePath = path.join(sourceFolder, file);
                const destPath = path.join(destFolder, file);
                
                if (copyFile(sourcePath, destPath)) {
                    copied++;
                }
            }
        });
        
        console.log(`Copied ${copied} files from ${sourceFolder} to ${destFolder}`);
        return copied;
    } catch (error) {
        console.error(`Error reading folder ${sourceFolder}:`, error.message);
        return 0;
    }
}

// Основная функция
function main() {
    console.log('Starting card replacement...');
    
    const themes = ['tavern', 'underground', 'casino'];
    let totalCopied = 0;
    
    themes.forEach(theme => {
        const sourceFolder = `сonverted_webp/${theme}`;
        const destFolder = `themes/${theme}/cards/WEBP_cards`;
        
        console.log(`\nProcessing ${theme}...`);
        const copied = copyCardsFromFolder(sourceFolder, destFolder);
        totalCopied += copied;
    });
    
    console.log(`\nTotal files copied: ${totalCopied}`);
    console.log('Card replacement completed!');
}

// Запускаем скрипт
main();
