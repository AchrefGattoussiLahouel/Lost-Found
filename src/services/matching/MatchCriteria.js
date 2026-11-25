import { haversineMeters } from "../../utils/geo.js";
import { gapHours, foundPrecedesLossHours } from "../../utils/time.js";

export class MatchCriteria {
  constructor(cfg) {
    this.cfg = cfg;
  }

  isSatisfied(lost, found) {
    const [lostLng, lostLat] = lost.location.coordinates;
    const [foundLng, foundLat] = found.location.coordinates;

    const distance = haversineMeters(lostLat, lostLng, foundLat, foundLng);

    if (distance > this.cfg.maxAllowableDistanceMeters) return false;
    if (foundPrecedesLossHours(lost, found) > this.cfg.maxFoundPrecedeLossHours)
      return false;
    if (gapHours(lost, found) > this.cfg.maxMatchingWindowDays * 24)
      return false;

    return true;
  }

  distance(lost, found) {
    const [lostLng, lostLat] = lost.location.coordinates;
    const [foundLng, foundLat] = found.location.coordinates;

    return haversineMeters(lostLat, lostLng, foundLat, foundLng);
  }
}
