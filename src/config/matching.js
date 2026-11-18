import 'dotenv/config'



const num = (name) => Number(process.env[name])


export const matchingConfig = {
    weights :{
        semantic : num("WEIGHT_SEMANTIC"),
        visual : num("WEIGHT_VISUAL"),
        spatial : num("WEIGHT_SPATIAL"),
        temporal : num("WEIGHT_TEMPORAL")
    },
    sigmaMeters : num("SPATIAL_SIGMA_METERS"),
    tauHours : num("TEMPORAL_TAU_HOURS"),
    maxFoundPrecedeLossHours : num("MAX_FOUND_PRECEDE_LOSS_HOURS"),
    maxMatchingWindowDays : num("MAX_MATCHING_WINDOW_DAYS"),
    lateMatchAfterDays : num("LATE_MATCH_AFTER_DAYS"),
    maxAllowableDistanceMeters : num("MAX_ALLOWABLE_DISTANCE_METERS"),
    alertThreshold : num("ALERT_THRESHOLD"),
    possibleThreshold : num("POSSIBLE_THRESHOLD"),
}




