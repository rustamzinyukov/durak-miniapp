# Скрипт для копирования карт из сonverted_webp в темы

# Копируем карты для tavern
$sourceTavern = "сonverted_webp\tavern\*.webp"
$destTavern = "themes\tavern\cards\WEBP_cards\"

Write-Host "Копируем карты для tavern..."
Get-ChildItem -Path $sourceTavern | Copy-Item -Destination $destTavern -Force
Write-Host "Карты для tavern скопированы"

# Копируем карты для underground  
$sourceUnderground = "сonverted_webp\underground\*.webp"
$destUnderground = "themes\underground\cards\WEBP_cards\"

Write-Host "Копируем карты для underground..."
Get-ChildItem -Path $sourceUnderground | Copy-Item -Destination $destUnderground -Force
Write-Host "Карты для underground скопированы"

# Копируем карты для casino
$sourceCasino = "сonverted_webp\casino\*.webp"
$destCasino = "themes\casino\cards\WEBP_cards\"

Write-Host "Копируем карты для casino..."
Get-ChildItem -Path $sourceCasino | Copy-Item -Destination $destCasino -Force
Write-Host "Карты для casino скопированы"

Write-Host "Все карты скопированы!"
