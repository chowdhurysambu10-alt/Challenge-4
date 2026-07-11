// Initial simulated data for FIFA Copilot 2026

export const initialMockData = {
  stadiumStats: {
    totalCheckedIn: 68412,
    capacity: 72000,
    avgWaitTime: 14, // minutes
    activeAlerts: 0,
    activeStaff: 342,
    matchInfo: {
      match: "Group Stage: USA vs England",
      kickoffCountdown: "2h 15m",
      timeText: "18:00 Local Time"
    }
  },
  
  zones: [
    { id: "A", name: "North Stand (Zone A)", density: 64, gates: ["Gate 1", "Gate 2"] },
    { id: "B", name: "East Stand (Zone B)", density: 82, gates: ["Gate 3", "Gate 4"] },
    { id: "C", name: "South Stand (Zone C)", density: 48, gates: ["Gate 5", "Gate 6"] },
    { id: "D", name: "West Stand (Zone D)", density: 57, gates: ["Gate 7", "Gate 8"] }
  ],
  
  gates: [
    { id: 1, name: "Gate 1 (Zone A)", waitTime: 8, density: 45, status: "low", currentFlow: 120, capacity: 250 },
    { id: 2, name: "Gate 2 (Zone A)", waitTime: 14, density: 60, status: "moderate", currentFlow: 180, capacity: 250 },
    { id: 3, name: "Gate 3 (Zone B)", waitTime: 26, density: 88, status: "high", currentFlow: 240, capacity: 250 },
    { id: 4, name: "Gate 4 (Zone B)", waitTime: 22, density: 82, status: "high", currentFlow: 220, capacity: 250 },
    { id: 5, name: "Gate 5 (Zone C)", waitTime: 7, density: 38, status: "low", currentFlow: 90, capacity: 250 },
    { id: 6, name: "Gate 6 (Zone C)", waitTime: 9, density: 42, status: "low", currentFlow: 110, capacity: 250 },
    { id: 7, name: "Gate 7 (Zone D)", waitTime: 12, density: 55, status: "moderate", currentFlow: 145, capacity: 250 },
    { id: 8, name: "Gate 8 (Zone D)", waitTime: 15, density: 59, status: "moderate", currentFlow: 160, capacity: 250 }
  ],
  
  parking: [
    { id: "Lot A", name: "North Parking (Lot A)", filled: 92, rate: "Fast", type: "General" },
    { id: "Lot B", name: "East Parking (Lot B)", filled: 98, rate: "Stalled", type: "VIP & Staff" },
    { id: "Lot C", name: "South Parking (Lot C)", filled: 68, rate: "Steady", type: "General & Accessible" },
    { id: "Lot D", name: "West Parking (Lot D)", filled: 45, rate: "Fast", type: "General" }
  ],
  
  transit: [
    { id: "metro-red", type: "Metro", name: "Stadium Express (Red Line)", arrivalIn: 2, status: "On Time", frequency: "5 min" },
    { id: "metro-blue", type: "Metro", name: "Downtown Link (Blue Line)", arrivalIn: 5, status: "On Time", frequency: "8 min" },
    { id: "shuttle-north", type: "Shuttle", name: "North Hub Shuttle", arrivalIn: 4, status: "On Time", frequency: "6 min" },
    { id: "shuttle-south", type: "Shuttle", name: "South Hub Shuttle", arrivalIn: 8, status: "Delayed (Traffic)", frequency: "6 min" }
  ],
  
  weather: {
    tempC: 24,
    tempF: 75,
    humidity: 62,
    windKmh: 14,
    condition: "Sunny & Mild"
  },
  
  operationalInsights: [
    {
      id: 1,
      timestamp: "14:38",
      type: "ai-suggestion",
      badge: "AI Reallocation",
      message: "Recommend redirecting 15% of Zone B arrivals to Gate 5/6 (Zone C).",
      reason: "Gate 3 wait times exceeded 25m, while Gate 5 wait times are under 10m."
    },
    {
      id: 2,
      timestamp: "14:25",
      type: "system-alert",
      badge: "Traffic Congestion",
      message: "Heavy congestion detected on Olympic Blvd access ramp. Recommending alternative routes via Metro Parkway.",
      reason: "Average traffic speed dropped below 15 km/h on external stadium approaches."
    },
    {
      id: 3,
      timestamp: "14:10",
      type: "ai-suggestion",
      badge: "Energy Efficiency",
      message: "Suggest lowering auxiliary cooling in South Concourse B by 1.5°C.",
      reason: "Current ambient temperature matches stadium comfort target with 8% lower occupancy than expected."
    }
  ],
  
  emergencyState: {
    active: false,
    type: null, // "fire", "crowd", "medical", "general"
    location: null, // "Zone A", "Zone B", etc.
    message: "",
    evacRoute: []
  }
};

// Generates slightly randomized updates to mimic real-time stadium sensors
export function updateMockData(currentData) {
  // Update Checked In count (gradually rising up to capacity)
  const rate = Math.floor(Math.random() * 25) + 5;
  const newCheckedIn = Math.min(
    currentData.stadiumStats.totalCheckedIn + rate,
    currentData.stadiumStats.capacity
  );
  
  // Calculate average wait time from all gates
  let totalWait = 0;
  
  // Update Gates
  const updatedGates = currentData.gates.map(gate => {
    // Gate wait time changes slightly
    const shift = Math.random() > 0.5 ? 1 : -1;
    const size = Math.floor(Math.random() * 2);
    let newWaitTime = gate.waitTime + (size * shift);
    newWaitTime = Math.max(2, Math.min(45, newWaitTime)); // Clamp between 2 and 45 mins
    
    // Status color
    let status = "low";
    if (newWaitTime > 20) status = "high";
    else if (newWaitTime > 10) status = "moderate";
    
    // Density calculation
    let newDensity = Math.min(100, Math.max(10, Math.floor(newWaitTime * 3.5 + (Math.random() * 10 - 5))));
    
    // Flow rate changes
    const flowShift = Math.floor(Math.random() * 20) - 10;
    const newFlow = Math.max(30, Math.min(250, gate.currentFlow + flowShift));
    
    totalWait += newWaitTime;
    
    return {
      ...gate,
      waitTime: newWaitTime,
      density: newDensity,
      status,
      currentFlow: newFlow
    };
  });
  
  const avgWait = Math.round(totalWait / updatedGates.length);
  
  // Update Zones density based on gates
  const updatedZones = currentData.zones.map(zone => {
    // Look up gates for this zone
    const zoneGates = updatedGates.filter(g => zone.gates.includes(g.name.split(" ")[0] + " " + g.name.split(" ")[1]));
    const avgGateDensity = zoneGates.reduce((acc, g) => acc + g.density, 0) / (zoneGates.length || 1);
    
    // Smooth zone density towards average gate density
    const shift = (avgGateDensity - zone.density) * 0.15;
    const newDensity = Math.round(Math.max(10, Math.min(100, zone.density + shift + (Math.random() * 4 - 2))));
    
    return {
      ...zone,
      density: newDensity
    };
  });
  
  // Update Parking Lot fills
  const updatedParking = currentData.parking.map(lot => {
    const change = Math.random() > 0.4 ? 1 : -1;
    const step = Math.random() > 0.8 ? 1 : 0;
    const newFilled = Math.max(10, Math.min(100, lot.filled + change * step));
    
    let rate = "Steady";
    if (newFilled > 95) rate = "Stalled";
    else if (change > 0 && step > 0) rate = "Fast";
    else if (change < 0 && step > 0) rate = "Clearing";
    
    return {
      ...lot,
      filled: newFilled,
      rate
    };
  });
  
  // Update transit countdown times
  const updatedTransit = currentData.transit.map(t => {
    let newArrival = t.arrivalIn - 1;
    if (newArrival < 0) {
      newArrival = Math.floor(Math.random() * 4) + 5; // Reset arrival to 5-8 mins
    }
    return {
      ...t,
      arrivalIn: newArrival
    };
  });
  
  // Check if we need to auto-generate a new AI Insight feed item
  let updatedInsights = [...currentData.operationalInsights];
  if (Math.random() > 0.85) {
    const time = new Date();
    const timeString = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
    
    // Generate AI alert based on updated gates
    const busyGate = updatedGates.find(g => g.waitTime > 22);
    const lowGate = updatedGates.find(g => g.waitTime < 10);
    
    if (busyGate && lowGate) {
      const newInsight = {
        id: Date.now(),
        timestamp: timeString,
        type: "ai-suggestion",
        badge: "AI Flow Optimization",
        message: `High wait times at ${busyGate.name} (${busyGate.waitTime} mins). AI recommends redirecting arrivals to ${lowGate.name}.`,
        reason: `Discrepancy of ${busyGate.waitTime - lowGate.waitTime} minutes between adjacent gates.`
      };
      
      updatedInsights = [newInsight, ...updatedInsights.slice(0, 7)];
    }
  }
  
  return {
    ...currentData,
    stadiumStats: {
      ...currentData.stadiumStats,
      totalCheckedIn: newCheckedIn,
      avgWaitTime: avgWait
    },
    zones: updatedZones,
    gates: updatedGates,
    parking: updatedParking,
    transit: updatedTransit,
    operationalInsights: updatedInsights
  };
}

// Translations for quick responses in multilingual mode
export const fanChatTranslations = {
  en: {
    greeting: "Hello, I am your FIFA Stadium AI Assistant. Ask me anything about tickets, seating, services, or stadium navigation!",
    quickActions: {
      seat: "Find My Seat",
      food: "Nearest Food Stall",
      parking: "Parking Status",
      access: "Accessibility Help"
    },
    responses: {
      seat: "To find your seat, please enter your block/seat number. Blocks 100-110 are via Gate 1/2. Blocks 200-220 are via Gate 3/4. Block 300+ are via Gate 5-8.",
      food: "The closest dining options are Golden Goal Burgers near Block 104 (Gate 2) and Kickoff Tacos near Block 118 (Gate 4). Average wait time is 6 minutes.",
      parking: "Parking Lot A is 92% full, Lot B is 98% full. We recommend Lot C (South) which has 68% capacity, or Lot D (West) which has 45% capacity and direct express shuttles.",
      access: "Wheelchair assistance, sensory rooms, and accessible restrooms are located on all concourse levels. Elevators are accessible adjacent to Gates A, B, and D.",
      default: "I have calculated the optimal response. Based on live crowds: Gate 2 and 5 are your best path. Let me know if you'd like a navigation route plotted."
    }
  },
  es: {
    greeting: "¡Hola! Soy tu Asistente de IA del Estadio FIFA. Pregúntame sobre boletos, asientos, servicios o navegación en el estadio.",
    quickActions: {
      seat: "Buscar mi asiento",
      food: "Puesto de comida cercano",
      parking: "Estado del estacionamiento",
      access: "Ayuda de accesibilidad"
    },
    responses: {
      seat: "Para buscar su asiento, ingrese su sector. Sectores 100-110 ingresan por Puertas 1/2. Sectores 200-220 por Puertas 3/4.",
      food: "Las opciones más cercanas son Golden Goal Burgers cerca del Bloque 104 y Kickoff Tacos cerca del Bloque 118. Tiempo de espera aproximado: 6 min.",
      parking: "Los lotes A y B están casi llenos. Recomendamos Lote C (68%) o Lote D (45% libre) con lanzaderas de conexión rápida.",
      access: "Asistencia para sillas de ruedas, salas sensoriales y baños accesibles disponibles. Los ascensores están cerca de las puertas A, B y D.",
      default: "He calculado el recorrido óptimo. Según el flujo de público: las puertas 2 y 5 son los accesos más despejados."
    }
  },
  fr: {
    greeting: "Bonjour, je suis votre assistant IA FIFA Stadium. Posez-moi vos questions sur les billets, les sièges, les services ou l'orientation !",
    quickActions: {
      seat: "Trouver mon siège",
      food: "Restauration proche",
      parking: "Statut du parking",
      access: "Aide à l'accessibilité"
    },
    responses: {
      seat: "Pour trouver votre siège, veuillez saisir votre numéro de bloc. Les blocs 100-110 passent par les portes 1/2. Blocs 200-220 par les portes 3/4.",
      food: "Options les plus proches : Golden Goal Burgers (Bloc 104) et Kickoff Tacos (Bloc 118). Temps d'attente estimé : 6 minutes.",
      parking: "Parking A et B saturés. Nous vous recommandons le Parking C (68% rempli) ou D (45% rempli) desservi par des navettes express.",
      access: "Des fauteuils roulants, des salles calmes et des toilettes accessibles sont à votre disposition. Ascenseurs situés près des portes A, B et D.",
      default: "J'ai calculé l'itinéraire optimal. Compte tenu de la foule : Portes 2 et 5 conseillées pour un accès rapide."
    }
  },
  ar: {
    greeting: "مرحباً، أنا مساعد الذكاء الاصطناعي الذكي لاستاد الفيفا. اسألني عن التذاكر، المقاعد، الخدمات، أو الملاحة داخل الاستاد!",
    quickActions: {
      seat: "ابحث عن مقعدي",
      food: "أقرب كشك طعام",
      parking: "حالة مواقف السيارات",
      access: "مساعدة ذوي الاحتياجات"
    },
    responses: {
      seat: "للعثور على مقعدك، يرجى إدخال رقم القسم. الأقسام 100-110 عبر البوابة 1 و2. الأقسام 200-220 عبر البوابة 3 و4.",
      food: "خيارات الطعام الأقرب هي جولدن جول برجر قرب القسم 104 وتاكو البداية قرب القسم 118. متوسط الانتظار 6 دقائق.",
      parking: "الموقف أ ممتلئ بنسبة 92%، والموقف ب بنسبة 98%. ننصح بالموقف ج (68%) أو الموقف د (45%) مع حافلات نقل سريعة.",
      access: "تتوفر كراسي متحركة وغرف حسية ودورات مياه مجهزة في جميع الطوابق. المصاعد متاحة بجوار البوابات A و B و D.",
      default: "لقد قمت بحساب المسار الأمثل. بناءً على الازدحام الفعلي: البوابة 2 و 5 هي الأفضل لك حالياً."
    }
  },
  hi: {
    greeting: "नमस्ते, मैं आपका फीफा स्टेडियम एआई सहायक हूँ। मुझसे टिकट, सीटिंग, सुविधाओं या स्टेडियम नेविगेशन के बारे में कुछ भी पूछें!",
    quickActions: {
      seat: "मेरी सीट ढूंढें",
      food: "निकटतम फूड स्टाल",
      parking: "पार्किंग की स्थिति",
      access: "सुगमता सहायता"
    },
    responses: {
      seat: "अपनी सीट खोजने के लिए, कृपया अपना ब्लॉक नंबर दर्ज करें। ब्लॉक 100-110 गेट 1/2 से हैं। ब्लॉक 200-220 गेट 3/4 से हैं।",
      food: "निकटतम भोजन विकल्प ब्लॉक 104 के पास गोल्डन गोल बर्गर और ब्लॉक 118 के पास किकऑफ टैकोस हैं। औसत प्रतीक्षा समय 6 मिनट है।",
      parking: "पार्किंग लॉट ए 92% भरा है, लॉट बी 98% भरा है। हम लॉट सी (68% क्षमता) या लॉट डी (45% क्षमता) की सलाह देते हैं।",
      access: "व्हीलचेयर सहायता, संवेदी शांत कमरे और सुलभ शौचालय सभी स्तरों पर स्थित हैं। लिफ्ट गेट ए, बी और डी के निकट उपलब्ध हैं।",
      default: "मैंने इष्टतम मार्ग की गणना की है। लाइव भीड़ के आधार पर: गेट 2 और 5 आपके प्रवेश के लिए सबसे अच्छे हैं।"
    }
  },
  bn: {
    greeting: "হ্যালো, আমি আপনার ফিফা স্টেডিয়াম এআই সহকারী। টিকিট, আসন বিন্যাস, পরিষেবা বা স্টেডিয়াম নেভিগেশন সম্পর্কে যেকোনো প্রশ্ন করুন!",
    quickActions: {
      seat: "আমার আসন খুঁজুন",
      food: "নিকটবর্তী খাবারের দোকান",
      parking: "পার্কিং অবস্থা",
      access: "বিশেষ সহায়তা"
    },
    responses: {
      seat: "আপনার আসন খুঁজে পেতে আপনার ব্লক নম্বর লিখুন। ব্লক ১০০-১১০ গেট ১/২ দিয়ে। ব্লক ২০০-২২০ গেট ৩/৪ দিয়ে প্রবেশ করুন।",
      food: "কাছের খাবার দোকানগুলো হল ব্লক ১০৪ এর কাছে গোল্ডেন গোল বার্গার এবং ব্লক ১১৮ এর কাছে কিকঅফ ট্যাকোস। অপেক্ষার সময় প্রায় ৬ মিনিট।",
      parking: "পার্কিং লট A ৯২% এবং B ৯৮% পূর্ণ। আমরা লট C (৬৮% পূর্ণ) অথবা লট D (৪৫% পূর্ণ) ব্যবহার করার পরামর্শ দিচ্ছি।",
      access: "হুইলচেয়ার সহায়তা, শান্ত ঘর এবং বিশেষ শৌচাগার সব তলায় রয়েছে। গেট A, B এবং D এর পাশে লিফট রয়েছে।",
      default: "আমি সেরা রুট হিসেব করেছি। লাইভ ভিড়ের তথ্যানুযায়ী: গেট ২ এবং ৫ দিয়ে যাওয়া সবচেয়ে সুবিধাজনক হবে।"
    }
  }
};
