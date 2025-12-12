"use client";

import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">View analytics and reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sales Report</h3>
              <p className="text-sm text-gray-500">View sales analytics</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Detailed sales reports will be available soon
          </p>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Revenue Report</h3>
              <p className="text-sm text-gray-500">Track revenue trends</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Revenue analytics will be available soon
          </p>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Product Report</h3>
              <p className="text-sm text-gray-500">Product performance</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Product analytics will be available soon
          </p>
        </div>

        <div className="bg-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Financial Report</h3>
              <p className="text-sm text-gray-500">Financial overview</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Financial reports will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}

