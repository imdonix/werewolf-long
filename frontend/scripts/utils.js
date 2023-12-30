export function secondsToMinutesAndSeconds(totalSeconds) 
{
  var minutes = Math.floor(totalSeconds / 60)
  var seconds = totalSeconds % 60

  if(seconds.toString().length == 1)
  {
      seconds = `0${seconds}`
  }

  return {
    minutes: minutes,
    seconds: seconds
  }
}


export function gameSideToReadable(gameSide)
{
  if(gameSide == 'spectator')
  {
    return 'Megfigyelő'
  }
  else if (gameSide == 'werewolf')
  {
    return 'Vérfarkas'
  }
  else if (gameSide == 'human')
  {
    return 'Ember'
  }
  
  return '-'
}