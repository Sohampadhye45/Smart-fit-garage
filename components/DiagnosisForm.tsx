import React, { useState, useRef } from 'react';
import { CarDetails } from '../types';
import { Car, Bike, Camera, AlertTriangle, PenTool } from 'lucide-react';

interface Props {
  onSubmit: (details: CarDetails, image: string | null) => void;
  isLoading: boolean;
}

const CAR_MODELS: Record<string, string[]> = {
  "Maruti Suzuki": ["800", "A-Star", "Alto 800", "Alto K10", "Baleno", "Brezza", "Celerio", "Ciaz", "Dzire", "Eeco", "Ertiga", "Esteem", "Estilo", "Fronx", "Grand Vitara", "Gypsy", "Ignis", "Invicto", "Jimny", "Kizashi", "Omni", "Ritz", "S-Cross", "S-Presso", "Swift", "SX4", "Versa", "Vitara Brezza", "Wagon R", "XL6", "Zen", "Other"],
  "Hyundai": ["Accent", "Alcazar", "Aura", "Creta", "Elantra", "Eon", "Exter", "Getz", "Grand i10", "Grand i10 Nios", "i10", "i20", "i20 N Line", "Ioniq 5", "Kona Electric", "Santa Fe", "Santro", "Sonata", "Terracan", "Tucson", "Venue", "Verna", "Xcent", "Other"],
  "Tata Motors": ["Altroz", "Aria", "Bolt", "Curvv", "Harrier", "Hexa", "Indica", "Indigo", "Manza", "Nano", "Nexon", "Nexon EV", "Punch", "Safari", "Safari Storme", "Sumo", "Tiago", "Tiago EV", "Tigor", "Tigor EV", "Winger", "Zest", "Other"],
  "Mahindra": ["Alturas G4", "Bolero", "Bolero Neo", "KUV100", "Marazzo", "NuvoSport", "Quanto", "Scorpio", "Scorpio-N", "Thar", "TUV300", "Verito", "XUV300", "XUV400", "XUV500", "XUV700", "Xylo", "Other"],
  "Toyota": ["Camry", "Corolla", "Corolla Altis", "Etios", "Etios Cross", "Etios Liva", "Fortuner", "Glanza", "Hilux", "Hyryder", "Innova", "Innova Crysta", "Innova Hycross", "Land Cruiser", "Prius", "Qualis", "Rumion", "Urban Cruiser", "Urban Cruiser Taisor", "Vellfire", "Yaris", "Other"],
  "Kia": ["Carens", "Carnival", "EV6", "Seltos", "Sonet", "EV9", "Other"],
  "Honda": ["Accord", "Amaze", "Brio", "BR-V", "City", "Civic", "CR-V", "Elevate", "Jazz", "Mobilio", "WR-V", "Other"],
  "MG Motor": ["Astor", "Comet EV", "Gloster", "Hector", "Hector Plus", "Windsor EV", "ZS EV", "Other"],
  "Renault": ["Captur", "Duster", "Fluence", "Kiger", "Koleos", "Kwid", "Lodgy", "Pulse", "Scala", "Triber", "Other"],
  "Volkswagen": ["Ameo", "Beetle", "Cross Polo", "Jetta", "Passat", "Polo", "Taigun", "Tiguan", "T-Roc", "Vento", "Virtus", "Other"],
  "Skoda": ["Fabia", "Karoq", "Kodiaq", "Kushaq", "Laura", "Octavia", "Rapid", "Slavia", "Superb", "Yeti", "Other"],
  "Nissan": ["Evalia", "Kicks", "Magnite", "Micra", "Sunny", "Teana", "Terrano", "X-Trail", "Other"],
  "Citroen": ["Basalt", "C3", "C3 Aircross", "C5 Aircross", "Other"],
  "Jeep": ["Compass", "Grand Cherokee", "Meridian", "Wrangler", "Other"],
  "Audi": ["A3", "A4", "A5", "A6", "A8", "Q2", "Q3", "Q5", "Q7", "Q8", "e-tron", "RS5", "RS7", "S5", "Other"],
  "BMW": ["2 Series", "3 Series", "5 Series", "6 Series", "7 Series", "X1", "X3", "X4", "X5", "X6", "X7", "Z4", "i4", "i7", "iX", "Other"],
  "Mercedes-Benz": ["A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class", "V-Class", "EQC", "EQS", "Other"],
  "Volvo": ["C40 Recharge", "S60", "S90", "V40", "V90", "XC40", "XC60", "XC90", "Other"],
  "Jaguar": ["F-Pace", "F-Type", "I-Pace", "XE", "XF", "XJ", "Other"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar", "Other"],
  "Porsche": ["718", "911", "Cayenne", "Macan", "Panamera", "Taycan", "Other"],
  "Lexus": ["ES", "LC", "LM", "LS", "LX", "NX", "RX", "Other"],
  "Force Motors": ["Gurkha", "One", "Trax", "Other"],
  "Isuzu": ["D-Max", "MU-7", "MU-X", "Other"],
  "BYD": ["Atto 3", "e6", "Seal", "Other"],
  "Mini": ["Clubman", "Cooper", "Countryman", "Other"],
  "Fiat": ["Avventura", "Linea", "Palio", "Punto", "Urban Cross", "Other"],
  "Ford": ["Aspire", "EcoSport", "Endeavour", "Fiesta", "Figo", "Freestyle", "Fusion", "Ikon", "Mustang", "Other"],
  "Chevrolet": ["Aveo", "Beat", "Captiva", "Cruze", "Enjoy", "Forester", "Optra", "Sail", "Spark", "Tavera", "Trailblazer", "Other"],
  "Datsun": ["GO", "GO+", "redi-GO", "Other"],
  "Mitsubishi": ["Cedia", "Lancer", "Montero", "Outlander", "Pajero", "Other"],
  "Hindustan Motors": ["Ambassador", "Contessa", "Other"]
};

const INDIAN_CAR_BRANDS = Object.keys(CAR_MODELS).sort();

const BIKE_MODELS: Record<string, string[]> = {
  "Royal Enfield": ["Classic 350", "Bullet 350", "Himalayan 450", "Interceptor 650", "Continental GT 650", "Meteor 350", "Hunter 350", "Super Meteor 650", "Other"],
  "Bajaj": ["Pulsar NS200", "Pulsar 150", "Dominar 400", "Pulsar N160", "Pulsar RS200", "Avenger Cruise 220", "Platina 100", "CT 110", "Other"],
  "TVS": ["Apache RTR 160 4V", "Apache RR 310", "Raider 125", "Jupiter", "Ntorq 125", "Ronin", "Sport", "XL100", "Other"],
  "Hero": ["Splendor Plus", "HF Deluxe", "Passion Pro", "Glamour", "Xtreme 160R", "XPulse 200 4V", "Destini 125", "Maestro Edge", "Other"],
  "Honda": ["Activa 6G", "Shine", "Unicorn", "H'ness CB350", "Dio", "SP 125", "Livo", "Hornet 2.0", "Other"],
  "Yamaha": ["R15 V4", "MT-15 V2", "FZ-S FI V3", "Fascino 125", "RayZR 125", "Aerox 155", "FZ 25", "Other"],
  "KTM": ["390 Duke", "250 Duke", "200 Duke", "125 Duke", "RC 390", "RC 200", "390 Adventure", "250 Adventure", "Other"],
  "Suzuki": ["Access 125", "Burgman Street", "Gixxer SF", "Gixxer", "V-Strom SX", "Avenis", "Hayabusa", "Other"],
  "Jawa": ["Jawa 350", "42", "Perak", "42 Bobber", "Other"],
  "Yezdi": ["Adventure", "Scrambler", "Roadster", "Other"],
  "Ather": ["450X", "450S", "Rizta", "Other"],
  "Ola Electric": ["S1 Pro", "S1 Air", "S1 X", "Other"],
  "Triumph": ["Speed 400", "Scrambler 400 X", "Street Triple", "Tiger", "Bonneville", "Other"],
  "Harley-Davidson": ["X440", "Iron 883", "Fat Boy", "Pan America", "Other"]
};

const INDIAN_BIKE_BRANDS = Object.keys(BIKE_MODELS).sort();

const DiagnosisForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [details, setDetails] = useState<CarDetails>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    symptoms: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Optional: Strict validation on change for year length
    if (name === 'year' && value.length > 4) return;
    
    setDetails(prev => {
        const newData = { ...prev, [name]: value };
        // Reset model when make changes
        if (name === 'make') {
            newData.model = '';
        }
        return newData;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(details, imagePreview);
  };

  const availableModels = details.make ? (vehicleType === 'car' ? CAR_MODELS[details.make] : BIKE_MODELS[details.make]) : [];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-slate-900 p-6 text-white flex items-center gap-3">
        {vehicleType === 'car' ? <Car className="w-6 h-6 text-orange-500" /> : <Bike className="w-6 h-6 text-orange-500" />}
        <h2 className="text-xl font-bold">New Diagnosis</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Vehicle Type Toggle */}
        <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${vehicleType === 'car' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setVehicleType('car'); setDetails(prev => ({ ...prev, make: '', model: '' })); }}
          >
            Car
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-md transition ${vehicleType === 'bike' ? 'bg-white text-slate-900 shadow' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => { setVehicleType('bike'); setDetails(prev => ({ ...prev, make: '', model: '' })); }}
          >
            Bike
          </button>
        </div>

        {/* Vehicle Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Year</label>
            <input
              required
              type="number"
              name="year"
              placeholder="e.g. 2018"
              min="1900"
              max={currentYear}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              value={details.year}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Make</label>
            <select
              required
              name="make"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              value={details.make}
              onChange={handleChange}
            >
              <option value="" disabled>Select Manufacturer</option>
              {(vehicleType === 'car' ? INDIAN_CAR_BRANDS : INDIAN_BIKE_BRANDS).map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Model</label>
            <select
              required
              name="model"
              disabled={!details.make}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              value={details.model}
              onChange={handleChange}
            >
              <option value="" disabled>Select Model</option>
              {availableModels && availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mileage (approx)</label>
            <input
              required
              type="text"
              name="mileage"
              placeholder="e.g. 85,000"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
              value={details.mileage}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Symptoms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <PenTool className="w-4 h-4" />
            Description of the Problem
          </label>
          <textarea
            required
            name="symptoms"
            rows={4}
            placeholder="Describe what's happening... e.g., 'Strange grinding noise when braking', 'Check engine light is on', 'Steam coming from hood'"
            className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-none"
            value={details.symptoms}
            onChange={handleChange}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Upload Photo (Optional)
          </label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group"
          >
            {imagePreview ? (
              <div className="relative w-full h-48">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white font-medium">
                  Change Photo
                </div>
              </div>
            ) : (
              <>
                <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-slate-200 transition">
                  <Camera className="w-6 h-6 text-slate-500" />
                </div>
                <p className="text-slate-500 text-sm">Click to upload a photo of the dashboard or issue</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition
            ${isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700 hover:shadow-orange-500/30'}
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Diagnosing...
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5" />
              Analyze Problem
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default DiagnosisForm;