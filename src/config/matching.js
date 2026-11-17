import 'dotenv/config'



const num = (name) => Number(process.env[name])


export const matchingConfig = {
    weights :{
        semantic : num(),
        visual : num(),
        spatial : num(),
        temporal : num()
    },
    sigmaMeters : num(),
    tauHours : num(),
    maxFoundPrecedeLossHours : num(),
    mawMatchingWindowDays : num(),
    lateMatchAfterDays : num(),
    maxAllowableDistanceMeters : num(),
    alertThreshold : num(),
    possibleThreshold : num(),
}


