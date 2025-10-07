const fs = require('fs');
const path = require('path');

// Функция для удаления дублирующихся файлов
function removeDuplicates(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        let deleted = 0;
        
        files.forEach(file => {
            if (file.endsWith('.webp')) {
                // Удаляем файлы с суффиксами (1), (2), (3) - оставляем только чистые названия
                if (file.includes(' (')) {
                    const filePath = path.join(folderPath, file);
                    fs.unlinkSync(filePath);
                    console.log(`Deleted duplicate: ${file}`);
                    deleted++;
                }
            }
        });
        
        console.log(`Deleted ${deleted} duplicate files from ${folderPath}`);
        return deleted;
    } catch (error) {
        console.error(`Error removing duplicates from ${folderPath}:`, error.message);
        return 0;
    }
}

// Основная функция
function main() {
    console.log('Removing duplicate card files...');
    
    const themes = ['casino'];
    let totalDeleted = 0;
    
    themes.forEach(theme => {
        const folderPath = `themes/${theme}/cards/WEBP_cards`;
        console.log(`\nProcessing ${theme}...`);
        const deleted = removeDuplicates(folderPath);
        totalDeleted += deleted;
    });
    
    console.log(`\nTotal duplicate files deleted: ${totalDeleted}`);
    console.log('Duplicate removal completed!');
}

// Запускаем скрипт
main();
