const fs = require('fs');
const path = require('path');

// Функция для переименования карт в casino формат
function standardizeCardNames(folderPath, theme) {
    try {
        const files = fs.readdirSync(folderPath);
        let renamed = 0;
        
        files.forEach(file => {
            if (file.endsWith('.webp')) {
                let newName = file;
                
                // Переименовываем карты в casino формат
                if (theme === 'tavern' || theme === 'underground') {
                    // Маппинг суффиксов в casino формат
                    const suitMap = {
                        't': 'clubs',    // трефы
                        'ch': 'hearts',  // черви
                        'p': 'spades',   // пики
                        'b': 'diamonds' // буби
                    };
                    
                    const rankMap = {
                        'A': 'ace',
                        'J': 'jack',
                        'Q': 'queen',
                        'K': 'king'
                    };
                    
                    // Извлекаем ранг и масть из названия
                    const match = file.match(/^([0-9AJQK]+)([tchpb])\.webp$/);
                    if (match) {
                        let rank = match[1];
                        const suitSuffix = match[2];
                        
                        // Преобразуем ранг
                        if (rankMap[rank]) {
                            rank = rankMap[rank];
                        }
                        
                        // Преобразуем масть
                        const suit = suitMap[suitSuffix];
                        
                        if (suit) {
                            newName = `${rank}_of_${suit}.webp`;
                        }
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
    console.log('Standardizing card names to casino format...');
    
    const themes = ['tavern', 'underground'];
    let totalRenamed = 0;
    
    themes.forEach(theme => {
        const folderPath = `themes/${theme}/cards/WEBP_cards`;
        console.log(`\nProcessing ${theme}...`);
        const renamed = standardizeCardNames(folderPath, theme);
        totalRenamed += renamed;
    });
    
    console.log(`\nTotal files renamed: ${totalRenamed}`);
    console.log('Card name standardization completed!');
}

// Запускаем скрипт
main();
