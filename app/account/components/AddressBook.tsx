"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  MapPin,
  Home,
  Building,
  User,
  Phone,
  X,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { addAddress, updateAddress, deleteAddress, fetchProfile } from "@/app/utils/api";
import { handleApiError } from "@/app/utils/errorHandler";
import { Address } from "@/types/models";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Khulna",
  "Rajshahi",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const districts: Record<string, string[]> = {
  Dhaka: [
    "Dhaka", "Gazipur", "Narayanganj", "Tangail", "Narsingdi", "Munshiganj",
    "Rajbari", "Madaripur", "Gopalganj", "Faridpur", "Shariatpur", "Kishoreganj",
    "Manikganj", "Netrokona", "Jamalpur", "Sherpur", "Mymensingh",
  ],
  Chattogram: [
    "Chattogram", "Cox's Bazar", "Rangamati", "Bandarban", "Khagrachari",
    "Feni", "Lakshmipur", "Chandpur", "Comilla", "Noakhali", "Chittagong",
  ],
  Khulna: [
    "Khulna", "Bagerhat", "Satkhira", "Jessore", "Magura", "Jhenaidah",
    "Narail", "Kushtia", "Meherpur", "Chuadanga",
  ],
  Rajshahi: [
    "Rajshahi", "Natore", "Naogaon", "Chapainawabganj", "Pabna", "Bogura",
    "Sirajganj", "Joypurhat",
  ],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Barishal: [
    "Barishal", "Bhola", "Pirojpur", "Barguna", "Patuakhali", "Jhalokati",
  ],
  Rangpur: [
    "Rangpur", "Dinajpur", "Kurigram", "Gaibandha", "Nilphamari",
    "Panchagarh", "Thakurgaon", "Lalmonirhat",
  ],
  Mymensingh: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
};

const upazilas: Record<string, string[]> = {
  Dhaka: [
    "Dhanmondi", "Gulshan", "Mirpur", "Uttara", "Banani", "Baridhara",
    "Wari", "Lalbagh", "Kotwali", "Ramna", "Paltan", "Motijheel",
    "Shahbagh", "New Market", "Mohammadpur", "Adabar", "Tejgaon",
    "Sabujbagh", "Demra", "Shyampur", "Sutrapur", "Jatrabari",
    "Kadamtali", "Kamrangirchar", "Keraniganj", "Nawabganj", "Dohar",
    "Savar", "Dhamrai",
  ],
  Gazipur: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
  Narayanganj: [
    "Narayanganj Sadar", "Bandar", "Araihazar", "Sonargaon", "Siddhirganj",
    "Fatullah", "Rupganj",
  ],
};

export default function AddressBook() {
  const { user, updateUser } = useAuth();
  const [openForm, setOpenForm] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addresses = user?.addresses || [];

  const [formData, setFormData] = useState<Partial<Address>>({
    name: "",
    phone: "",
    division: "",
    district: "",
    upazila: "",
    address: "",
    addressType: "home",
  });

  const handleAddNew = () => {
    setEditAddress(null);
    setFormData({
      name: "",
      phone: user?.phone || "",
      division: "",
      district: "",
      upazila: "",
      address: "",
      addressType: "home",
    });
    setOpenForm(true);
    setError(null);
  };

  const handleEdit = (address: Address) => {
    setEditAddress(address);
    setFormData({
      name: address.name || "",
      phone: address.phone || "",
      division: address.division || "",
      district: address.district || "",
      upazila: address.upazila || "",
      address: address.address || "",
      addressType: address.addressType || "home",
    });
    setOpenForm(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.division || !formData.district || !formData.upazila) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editAddress?._id) {
        await updateAddress(editAddress._id, formData as Address);
      } else {
        await addAddress(formData as Address);
      }
      // Refresh user data by fetching profile
      const profileData = await fetchProfile();
      updateUser(profileData.user);
      setOpenForm(false);
      setEditAddress(null);
    } catch (err) {
      setError(handleApiError(err, "saving address"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    setLoading(true);
    try {
      await deleteAddress(addressId);
      // Refresh user data by fetching profile
      const profileData = await fetchProfile();
      updateUser(profileData.user);
      setDeleteConfirm(null);
    } catch (err) {
      setError(handleApiError(err, "deleting address"));
    } finally {
      setLoading(false);
    }
  };

  const getAddressIcon = (name?: string) => {
    const lowerName = (name || "").toLowerCase();
    if (lowerName.includes("home")) return Home;
    if (lowerName.includes("office") || lowerName.includes("work")) return Building;
    return MapPin;
  };

  const availableDistricts = formData.division ? districts[formData.division] || [] : [];
  const availableUpazilas = formData.district ? upazilas[formData.district] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Saved Addresses</h3>
          <p className="text-sm text-gray-600">
            Manage your delivery addresses for quick checkout
          </p>
        </div>
        <Button variant="primary" onClick={handleAddNew}>
          <Plus size={16} className="mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <Card padding="lg">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first delivery address to make checkout faster
            </p>
            <Button variant="primary" onClick={handleAddNew}>
              Add Your First Address
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const Icon = getAddressIcon(addr.name);
            return (
              <Card key={addr._id} padding="md" variant="elevated">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Icon size={16} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {addr.name || "Address"}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">
                        {addr.division}, {addr.district}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit address"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(addr._id || "")}
                      className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{addr.name}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      {addr.address}, {addr.upazila}, {addr.district}, {addr.division}
                    </span>
                  </div>
                  {addr.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-gray-700">{addr.phone}</span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      {openForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {editAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={() => {
                  setOpenForm(false);
                  setEditAddress(null);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />

              <Input
                label="Phone"
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1234 567890"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value, district: "", upazila: "" })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white"
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value, upazila: "" })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white"
                  required
                  disabled={!formData.division}
                >
                  <option value="">Select District</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upazila <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.upazila}
                  onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white"
                  required
                  disabled={!formData.district}
                >
                  <option value="">Select Upazila</option>
                  {availableUpazilas.map((upz) => (
                    <option key={upz} value={upz}>
                      {upz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:bg-white"
                  rows={3}
                  placeholder="House/Street address"
                  required
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setOpenForm(false);
                    setEditAddress(null);
                    setError(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={loading}
                  className="flex-1"
                >
                  Save Address
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card padding="lg" className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Address</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                isLoading={loading}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

