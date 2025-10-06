const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 Starting WebP conversion for all themes...');

// Функция для конвертации изображений в WebP
function convertToWebP(inputDir, outputDir, filePattern) {
  console.log(`📁 Processing ${inputDir}...`);
  
  if (!fs.existsSync(inputDir)) {
    console.log(`❌ Directory not found: ${inputDir}`);
    return;
  }
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created directory: ${outputDir}`);
  }
  
  const files = fs.readdirSync(inputDir).filter(file => 
    file.endsWith('.svg') || file.endsWith('.png') || file.endsWith('.jpg')
  );
  
  console.log(`📦 Found ${files.length} files to convert`);
  
  files.forEach((file, index) => {
    const inputPath = path.join(inputDir, file);
    const outputFile = file.replace(/\.(svg|png|jpg)$/i, '.webp');
    const outputPath = path.join(outputDir, outputFile);
    
    try {
      console.log(`🔄 Converting ${index + 1}/${files.length}: ${file} → ${outputFile}`);
      
      // Используем cwebp для конвертации
      const command = `cwebp -q 85 "${inputPath}" -o "${outputPath}"`;
      execSync(command, { stdio: 'pipe' });
      
      // Проверяем размер файлов
      const originalSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(outputPath).size;
      const savings = Math.round((1 - webpSize / originalSize) * 100);
      
      console.log(`✅ ${file}: ${Math.round(originalSize/1024)}KB → ${Math.round(webpSize/1024)}KB (${savings}% savings)`);
      
    } catch (error) {
      console.log(`❌ Failed to convert ${file}: ${error.message}`);
    }
  });
}

// Конвертируем карты для всех тем
const themes = [
  {
    name: 'casino',
    inputDir: './themes/casino/cards/SVG-cards-1.3',
    outputDir: './themes/casino/cards/WEBP_cards'
  },
  {
    name: 'tavern', 
    inputDir: './themes/tavern/cards/PNG_cards',
    outputDir: './themes/tavern/cards/WEBP_cards'
  },
  {
    name: 'underground',
    inputDir: './themes/underground/cards/JPG_cards', 
    outputDir: './themes/underground/cards/WEBP_cards'
  }
];

// Проверяем наличие cwebp
try {
  execSync('cwebp -version', { stdio: 'pipe' });
  console.log('✅ cwebp found, starting conversion...');
} catch (error) {
  console.log('❌ cwebp not found. Installing via npm...');
  try {
    execSync('npm install -g webp', { stdio: 'inherit' });
    console.log('✅ webp package installed');
  } catch (installError) {
    console.log('❌ Failed to install webp package. Please install manually:');
    console.log('   npm install -g webp');
    console.log('   or download from: https://developers.google.com/speed/webp/download');
    process.exit(1);
  }
}

// Конвертируем каждую тему
themes.forEach(theme => {
  console.log(`\n🎨 Converting ${theme.name} theme...`);
  convertToWebP(theme.inputDir, theme.outputDir);
});

console.log('\n🎉 WebP conversion completed!');
console.log('\n📊 Summary:');
console.log('• Casino: SVG → WebP');
console.log('• Tavern: PNG → WebP'); 
console.log('• Underground: JPG → WebP');
console.log('\n💡 Expected savings: 30-70% file size reduction');
