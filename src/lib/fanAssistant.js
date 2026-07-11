export const EMERGENCY_PATTERN = /\b(emergency|fire|danger|evacuate)\b/i;

export function isEmergencyMessage(message) {
  return EMERGENCY_PATTERN.test(message);
}

export function buildTelemetrySnapshot(stadiumData) {
  return {
    gates: stadiumData.gates.map(({ name, waitTime, density, currentFlow, status }) => ({
      name,
      waitTime,
      density,
      currentFlow,
      status
    })),
    zones: stadiumData.zones.map(({ name, density }) => ({ name, density })),
    parking: stadiumData.parking.map(({ name, filled, rate, type }) => ({
      name,
      filled,
      rate,
      type
    })),
    weather: stadiumData.weather,
    emergency: stadiumData.emergencyState.active
      ? {
          active: true,
          type: stadiumData.emergencyState.type,
          location: stadiumData.emergencyState.location,
          evacRoute: stadiumData.emergencyState.evacRoute
        }
      : { active: false }
  };
}

export function getOfflineResponse(message, translations, stadiumData) {
  const normalizedMessage = message.toLowerCase();
  const bestGate = [...stadiumData.gates].sort((firstGate, secondGate) => firstGate.waitTime - secondGate.waitTime)[0];
  const bestParking = [...stadiumData.parking].sort((firstLot, secondLot) => firstLot.filled - secondLot.filled)[0];

  if (normalizedMessage.includes('seat') || normalizedMessage.includes('block')) {
    return {
      reply: translations.responses.seat,
      basis: 'Local demo route data'
    };
  }

  if (normalizedMessage.includes('food') || normalizedMessage.includes('stall') || normalizedMessage.includes('burger') || normalizedMessage.includes('taco')) {
    return {
      reply: translations.responses.food,
      basis: 'Local demo concession data'
    };
  }

  if (normalizedMessage.includes('parking') || normalizedMessage.includes('car')) {
    return {
      reply: `${translations.responses.parking} The least full lot is ${bestParking.name} at ${bestParking.filled}%.`,
      basis: 'Current simulated parking availability'
    };
  }

  if (normalizedMessage.includes('accessibility') || normalizedMessage.includes('wheelchair') || normalizedMessage.includes('disability')) {
    return {
      reply: translations.responses.access,
      basis: 'Local accessibility-service directory'
    };
  }

  return {
    reply: `${translations.responses.default} ${bestGate.name} currently has the shortest simulated wait at ${bestGate.waitTime} minutes.`,
    basis: 'Current simulated gate telemetry'
  };
}
