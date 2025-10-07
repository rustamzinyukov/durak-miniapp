const fs = require('fs');
const path = require('path');

// Функция для удаления старых карт
function cleanOldCards(folderPath) {
    try {
        const files = fs.readdirSync(folderPath);
        let deleted = 0;
        
        files.forEach(file => {
            // Удаляем файлы со старыми названиями (содержат "_of_")
            if (file.includes('_of_')) {
                const filePath = path.join(folderPath, file);
                fs.unlinkSync(filePath);
                console.log(`Deleted old card: ${file}`);
                deleted++;
            }
        });
        
        console.log(`Deleted ${deleted} old cards from ${folderPath}`);
        return deleted;
    } catch (error) {
        console.error(`Error cleaning folder ${folderPath}:`, error.message);
        return 0;
    }
}

// Основная функция
function main() {
    console.log('Cleaning old card files...');
    
    const themes = ['tavern', 'underground'];
    let totalDeleted = 0;
    
    themes.forEach(theme => {
        const folderPath = `themes/${theme}/cards/WEBP_cards`;
        console.log(`\nCleaning ${theme}...`);
        const deleted = cleanOldCards(folderPath);
        totalDeleted += deleted;
    });
    
    console.log(`\nTotal old cards deleted: ${totalDeleted}`);
    console.log('Old cards cleanup completed!');
}

// Запускаем скрипт
main();
