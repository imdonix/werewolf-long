
export function loadUniqueID()
{
    let cache = localStorage.getItem('id')
    if(cache)
    {
        return cache
    }

    cache = generateUUID()
    localStorage.setItem('id', cache)
    return cache
}

export function generateUUID() 
{
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

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