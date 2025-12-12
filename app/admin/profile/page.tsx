"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../utils/api";
import { User, Mail, Phone, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { handleApiError } from "@/app/utils/errorHandler";

export default function AdminProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // TODO: Implement update user profile API call
      await apiRequest("/user/profile", {
        method: "PUT",
        data: profile,
      });
      alert("Profile updated successfully!");
    } catch (err) {
      alert(handleApiError(err, "updating profile"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-500">Manage your account information</p>
      </div>

      {/* Profile Information */}
      <div className="bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {profile.name?.charAt(0).toUpperCase() || "A"}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {profile.name || "Admin User"}
            </h2>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              Full Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mail size={16} />
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Phone size={16} />
              Phone
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

