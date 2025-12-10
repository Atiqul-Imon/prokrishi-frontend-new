"use client";

import { BarChart3, TrendingUp, DollarSign, Package } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View analytics and reports</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Sales Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">View sales analytics</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Detailed sales reports will be available soon
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track revenue trends</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Revenue analytics will be available soon
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Product Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Product performance</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Product analytics will be available soon
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500 dark:bg-green-600 flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Financial Report</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Financial overview</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Financial reports will be available soon
          </p>
        </div>
      </div>
    </div>
  );
}

