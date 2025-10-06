const fs = require('fs');
const path = require('path');

console.log('🎨 WebP Conversion Script (Alternative Method)');
console.log('📝 This script will prepare the conversion setup...');

// Создаем скрипт для ручной конвертации
const conversionScript = `
# WebP Conversion Instructions
# ==========================

# Method 1: Using Online Converter
# 1. Go to https://convertio.co/svg-webp/ or https://cloudconvert.com/svg-to-webp
# 2. Upload all SVG files from themes/casino/cards/SVG-cards-1.3/
# 3. Download as WebP and place in themes/casino/cards/WEBP_cards/

# Method 2: Using ImageMagick (if installed)
# magick convert input.svg output.webp
# magick convert input.png output.webp  
# magick convert input.jpg output.webp

# Method 3: Using GIMP
# 1. Open image in GIMP
# 2. File → Export As
# 3. Choose WebP format
# 4. Set quality to 85

# Method 4: Using Photoshop
# 1. Open image in Photoshop
# 2. File → Export → Export As
# 3. Choose WebP format
# 4. Set quality to 85
`;

// Создаем список файлов для конвертации
function createFileList() {
  const themes = [
    {
      name: 'casino',
      inputDir: './themes/casino/cards/SVG-cards-1.3',
      outputDir: './themes/casino/cards/WEBP_cards',
      extension: 'svg'
    },
    {
      name: 'tavern',
      inputDir: './themes/tavern/cards/PNG_cards', 
      outputDir: './themes/tavern/cards/WEBP_cards',
      extension: 'png'
    },
    {
      name: 'underground',
      inputDir: './themes/underground/cards/JPG_cards',
      outputDir: './themes/underground/cards/WEBP_cards', 
      extension: 'jpg'
    }
  ];
  
  let fileList = '# Files to Convert to WebP\n\n';
  
  themes.forEach(theme => {
    if (fs.existsSync(theme.inputDir)) {
      const files = fs.readdirSync(theme.inputDir).filter(file => 
        file.endsWith(`.${theme.extension}`)
      );
      
      fileList += `## ${theme.name.toUpperCase()} Theme (${files.length} files)\n`;
      fileList += `**Input:** ${theme.inputDir}\n`;
      fileList += `**Output:** ${theme.outputDir}\n\n`;
      
      files.forEach(file => {
        const webpFile = file.replace(/\.(svg|png|jpg)$/i, '.webp');
        fileList += `- ${file} → ${webpFile}\n`;
      });
      
      fileList += '\n';
    }
  });
  
  return fileList;
}

// Создаем инструкции
fs.writeFileSync('WEBP_CONVERSION_INSTRUCTIONS.md', conversionScript);
fs.writeFileSync('FILES_TO_CONVERT.md', createFileList());

console.log('📝 Created conversion instructions:');
console.log('   - WEBP_CONVERSION_INSTRUCTIONS.md');
console.log('   - FILES_TO_CONVERT.md');

// Создаем простой скрипт для проверки WebP поддержки
const webpTestScript = `
// WebP Support Test
function testWebP() {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

testWebP().then(supported => {
  console.log('WebP support:', supported ? '✅ Supported' : '❌ Not supported');
});
`;

fs.writeFileSync('webp-test.js', webpTestScript);

console.log('\n🎯 Next Steps:');
console.log('1. Check WEBP_CONVERSION_INSTRUCTIONS.md for conversion methods');
console.log('2. Use FILES_TO_CONVERT.md as a checklist');
console.log('3. Convert files using your preferred method');
console.log('4. Test WebP support with: node webp-test.js');

console.log('\n💡 Recommended: Use online converter for quick results');
console.log('   https://convertio.co/svg-webp/');
console.log('   https://cloudconvert.com/svg-to-webp');
