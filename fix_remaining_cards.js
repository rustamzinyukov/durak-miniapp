const fs = require('fs');
const path = require('path');

// Функция для переименования оставшихся карт
function fixRemainingCards(folderPath, theme) {
    try {
        const files = fs.readdirSync(folderPath);
        let renamed = 0;
        
        files.forEach(file => {
            if (file.endsWith('.webp')) {
                let newName = file;
                
                // Переименовываем оставшиеся карты с суффиксом ch
                if (file.includes('ch.webp')) {
                    const match = file.match(/^([0-9AJQK]+)ch\.webp$/);
                    if (match) {
                        let rank = match[1];
                        
                        // Преобразуем ранг
                        const rankMap = {
                            'A': 'ace',
                            'J': 'jack',
                            'Q': 'queen',
                            'K': 'king'
                        };
                        
                        if (rankMap[rank]) {
                            rank = rankMap[rank];
                        }
                        
                        newName = `${rank}_of_hearts.webp`;
                    }
                }
                
                // Переименовываем файл, если название изменилось
                if (newName !== file) {
                    const oldPath = path.join(folderPath, file);
                    const newPath = path.join(folderPath, newName);
                    
                    // Проверяем, что файл с новым именем не существует
                    if (!fs.existsSync(newPath)) {
                        fs.renameSync(oldPath, newPath);
                        console.log(`Renamed: ${file} -> ${newName}`);
                        renamed++;
                    } else {
                        console.log(`Skipped: ${file} (${newName} already exists)`);
                    }
                }
            }
        });
        
        console.log(`Renamed ${renamed} files in ${folderPath}`);
        return renamed;
    } catch (error) {
        console.error(`Error renaming files in ${folderPath}:`, error.message);
        return 0;
    }
}

// Основная функция
function main() {
    console.log('Fixing remaining card names...');
    
    const themes = ['tavern', 'underground'];
    let totalRenamed = 0;
    
    themes.forEach(theme => {
        const folderPath = `themes/${theme}/cards/WEBP_cards`;
        console.log(`\nProcessing ${theme}...`);
        const renamed = fixRemainingCards(folderPath, theme);
        totalRenamed += renamed;
    });
    
    console.log(`\nTotal files renamed: ${totalRenamed}`);
    console.log('Remaining card fix completed!');
}

// Запускаем скрипт
main();
