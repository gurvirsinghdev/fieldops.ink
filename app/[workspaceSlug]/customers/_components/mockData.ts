export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  type: "Commercial" | "Residential" | "Industrial" | "Municipal";
};

export const mockCustomers: Customer[] = [
  { id: "c1", name: "ABC Construction", email: "john@abcconstruction.com", phone: "604-555-1234", city: "Abbotsford", province: "BC", country: "CA", type: "Commercial" },
  { id: "c2", name: "Metro Utilities", email: "dispatch@metroutilities.ca", phone: "604-555-9800", city: "Vancouver", province: "BC", country: "CA", type: "Municipal" },
  { id: "c3", name: "Highland Homes", email: "operations@highlandhomes.com", phone: "250-555-3400", city: "Kelowna", province: "BC", country: "CA", type: "Residential" },
  { id: "c4", name: "Pacific Paving", email: null, phone: "778-555-2200", city: "Surrey", province: "BC", country: "CA", type: "Industrial" },
  { id: "c5", name: "Green Valley Landscaping", email: "admin@greenvalley.ca", phone: "250-555-6700", city: "Victoria", province: "BC", country: "CA", type: "Commercial" },
  { id: "c6", name: "Northwest Electric", email: "dispatch@nwelectric.ca", phone: "604-555-4500", city: "Burnaby", province: "BC", country: "CA", type: "Commercial" },
  { id: "c7", name: "Summit Mechanical", email: "info@summitmech.ca", phone: "778-555-8800", city: "Richmond", province: "BC", country: "CA", type: "Industrial" },
  { id: "c8", name: "Coastal Drywall", email: null, phone: "604-555-3200", city: "North Vancouver", province: "BC", country: "CA", type: "Residential" },
  { id: "c9", name: "Apex Roofing", email: "crew@apexroofing.ca", phone: "250-555-9100", city: "Kamloops", province: "BC", country: "CA", type: "Commercial" },
  { id: "c10", name: "Fraser Valley Plumbing", email: "dispatch@fvplumb.ca", phone: "604-555-7600", city: "Langley", province: "BC", country: "CA", type: "Residential" },
  { id: "c11", name: "Northern Insulation", email: "sales@northerninsul.ca", phone: "250-555-5400", city: "Prince George", province: "BC", country: "CA", type: "Industrial" },
  { id: "c12", name: "Emerald City Glass", email: "office@emeraldcityglass.ca", phone: "604-555-6100", city: "New Westminster", province: "BC", country: "CA", type: "Commercial" },
  { id: "c13", name: "Thompson Valley Excavating", email: null, phone: "250-555-1200", city: "Kamloops", province: "BC", country: "CA", type: "Industrial" },
  { id: "c14", name: "Okanagan Solar", email: "info@oksolar.ca", phone: "250-555-7800", city: "Penticton", province: "BC", country: "CA", type: "Residential" },
  { id: "c15", name: "Delta Fire Protection", email: "service@deltafire.ca", phone: "604-555-9900", city: "Delta", province: "BC", country: "CA", type: "Commercial" },
  { id: "c16", name: "Cascade Environmental", email: null, phone: "250-555-4300", city: "Nelson", province: "BC", country: "CA", type: "Municipal" },
  { id: "c17", name: "West Coast Demolition", email: "info@wcdemo.ca", phone: "604-555-5500", city: "Coquitlam", province: "BC", country: "CA", type: "Industrial" },
  { id: "c18", name: "Island Precast", email: "orders@islandprecast.ca", phone: "250-555-8200", city: "Nanaimo", province: "BC", country: "CA", type: "Commercial" },
  { id: "c19", name: "Ridge HVAC", email: "dispatch@ridgehvac.ca", phone: "778-555-3100", city: "Maple Ridge", province: "BC", country: "CA", type: "Residential" },
  { id: "c20", name: "Granite Security Systems", email: "support@granitesec.ca", phone: "604-555-1500", city: "West Vancouver", province: "BC", country: "CA", type: "Commercial" },
];
