const fs = require('fs');
const path = require('path');

// Функция для переименования файлов в папке
function renameCardsInFolder(folderPath, theme) {
    try {
        const files = fs.readdirSync(folderPath);
        let renamed = 0;
        
        files.forEach(file => {
            if (file.endsWith('.webp')) {
                let newName = file;
                
                // Удаляем суффиксы типа (1), (2), (3)
                newName = newName.replace(/ \(\d+\)/g, '');
                
                // Унифицируем названия для всех тем
                if (theme === 'casino') {
                    // Для casino оставляем старый формат: 10_of_clubs.webp
                    // (уже правильный)
                } else {
                    // Для tavern и underground используем суффиксы: 10t.webp, 10ch.webp, 10p.webp, 10b.webp
                    // (уже правильный)
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
    console.log('Renaming card files...');
    
    const themes = ['tavern', 'underground', 'casino'];
    let totalRenamed = 0;
    
    themes.forEach(theme => {
        const folderPath = `themes/${theme}/cards/WEBP_cards`;
        console.log(`\nProcessing ${theme}...`);
        const renamed = renameCardsInFolder(folderPath, theme);
        totalRenamed += renamed;
    });
    
    console.log(`\nTotal files renamed: ${totalRenamed}`);
    console.log('Card renaming completed!');
}

// Запускаем скрипт
main();
