"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
);

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ zone_name: "", delivery_fee: "" });
  const router = useRouter();

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_zones')
        .select('*')
        .order('zone_name');

      if (!error && data) {
        setZones(data);
      }
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const addZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .insert({
          zone_name: formData.zone_name,
          delivery_fee: parseFloat(formData.delivery_fee)
        });

      if (!error) {
        setFormData({ zone_name: "", delivery_fee: "" });
        setShowAddForm(false);
        fetchZones();
      }
    } catch (error) {
      // Handle error
    }
  };

  const updateFee = async (id: number, newFee: string) => {
    const fee = parseFloat(newFee);
    if (isNaN(fee) || fee < 0) return;
    
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .update({ delivery_fee: fee })
        .eq('id', id);

      if (!error) {
        setZones(prev => prev.map(zone => 
          zone.id === id ? { ...zone, delivery_fee: fee } : zone
        ));
      }
    } catch (error) {
      // Handle error
    }
  };

  const toggleActive = async (id: number, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('delivery_zones')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (!error) {
        fetchZones();
      }
    } catch (error) {
      // Handle error
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/admin")}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Delivery Zones</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Manage Delivery Zones</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add Zone
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={addZone} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Zone Name"
                  value={formData.zone_name}
                  onChange={(e) => setFormData({...formData, zone_name: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Delivery Fee (₵)"
                  value={formData.delivery_fee}
                  onChange={(e) => setFormData({...formData, delivery_fee: e.target.value})}
                  className="p-3 border rounded-lg"
                  required
                />
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add Zone
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{zone.zone_name}</h3>
                  <p className="text-gray-600">₵{parseFloat(zone.delivery_fee).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={zone.delivery_fee}
                    onChange={(e) => updateFee(zone.id, e.target.value)}
                    onBlur={(e) => updateFee(zone.id, e.target.value)}
                    className="w-24 p-2 border rounded"
                  />
                  <button
                    onClick={() => toggleActive(zone.id, zone.is_active)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                      zone.is_active 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {zone.is_active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}