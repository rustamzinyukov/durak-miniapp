# PowerShell script to rename vintage card files to match expected format

# Mapping for suits
$suitMap = @{
    'C' = 'clubs'
    'D' = 'diamonds' 
    'H' = 'hearts'
    'S' = 'spades'
}

# Get all SVG files
$files = Get-ChildItem -Name "*.svg"

foreach ($file in $files) {
    $newName = $file
    
    # Handle numbered cards (6-9)
    if ($file -match "^(\d+)([CDHS])\.svg$") {
        $rank = $matches[1]
        $suit = $suitMap[$matches[2]]
        $newName = "${rank}_of_${suit}.svg"
    }
    # Handle Ten (T)
    elseif ($file -match "^T([CDHS])\.svg$") {
        $suit = $suitMap[$matches[1]]
        $newName = "10_of_${suit}.svg"
    }
    # Handle Jack (J)
    elseif ($file -match "^J([CDHS])\.svg$") {
        $suit = $suitMap[$matches[1]]
        $newName = "jack_of_${suit}.svg"
    }
    # Handle Queen (Q)
    elseif ($file -match "^Q([CDHS])\.svg$") {
        $suit = $suitMap[$matches[1]]
        $newName = "queen_of_${suit}.svg"
    }
    # Handle King (K)
    elseif ($file -match "^K([CDHS])\.svg$") {
        $suit = $suitMap[$matches[1]]
        $newName = "king_of_${suit}.svg"
    }
    # Handle Ace (A)
    elseif ($file -match "^A([CDHS])\.svg$") {
        $suit = $suitMap[$matches[1]]
        $newName = "ace_of_${suit}.svg"
    }
    
    # Rename if different
    if ($newName -ne $file) {
        Rename-Item $file $newName
        Write-Host "Renamed: $file -> $newName"
    }
}

Write-Host "Renaming complete!"

