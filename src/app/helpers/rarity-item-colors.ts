export function RarityItemColors(rarity: string): string{

  let color: string

  switch(rarity.toLowerCase()){ //lowercase just in case (no pun intended =P)
    case "uncommon":{
      color = "green-400"
      break
    }

    case "rare":{
      color = "blue-400"
      break
    }

    case "mystical":{
      color = "purple-400"
      break
    }

    case "legendary":{
      color = "yellow-400"
      break
    }

    case "unique":{
      color = "rose-400"
      break
    }

    //default is case for common also
    default:{
      color = "white-400"
      break
    }

  }

  return color

}
