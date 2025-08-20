export interface F1Race {
    raceName: string
    circuitName: string
    date: string
    time: string
    country: string
    locality: string
  }
  
  export async function getF1Matches(): Promise<F1Race> {
    const currentYear = new Date().getFullYear()
    const url = `https://ergast.com/api/f1/${currentYear}.json`
  
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('F1 data not available')
      }
  
      const data = await response.json()
      const races = data.MRData.RaceTable.Races
      const now = new Date()
      
      // Find the next race
      const nextRace = races.find((race: F1Race) => {
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00'}`)
        return raceDate > now
      }) || races[races.length - 1] // Fallback to last race if season ended
  
      return {
        raceName: nextRace.raceName,
        circuitName: nextRace.Circuit.circuitName,
        date: nextRace.date,
        time: nextRace.time || 'TBA',
        country: nextRace.Circuit.Location.country,
        locality: nextRace.Circuit.Location.locality,
      }
    } catch (error) {
      throw new Error(`Failed to fetch F1 data: ${error}`)
    }
  }
  