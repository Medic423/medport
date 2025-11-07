import React, { useState, useEffect } from 'react';
import api, { analyticsAPI } from '../services/api';
import { Building2, Truck, MapPin, Activity } from 'lucide-react';

interface SystemOverview {
  totalHospitals: number;
  totalAgencies: number;
  totalFacilities: number;
  activeHospitals: number;
  activeAgencies: number;
  activeFacilities: number;
  totalUnits: number;
  activeUnits: number;
}

const Overview: React.FC = () => {
  const [overview, setOverview] = useState<SystemOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedWarnings, setFeedWarnings] = useState<string[]>([]);
  const [showWarnings, setShowWarnings] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await analyticsAPI.getOverview();
        setOverview(response.data.data);
      } catch (error: any) {
        setError(error.response?.data?.error || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();

    const checkFeeds = async () => {
      const feeds: Array<{ path: string; label: string }> = [
        { path: '/api/tcc/analytics/overview', label: 'Analytics Overview' },
        { path: '/api/tcc/agencies', label: 'Agencies' },
        { path: '/api/dropdown-options', label: 'Dropdown Categories' },
        { path: '/api/tcc/hospitals', label: 'Hospitals' },
      ];
      const warnings: string[] = [];
      await Promise.all(
        feeds.map(async (f) => {
          try {
            const res = await api.get(f.path);
            if (res.status !== 200 || res.data?.success === false) {
              warnings.push(`${f.label}: ${res.status}`);
            }
          } catch (err: any) {
            const code = err?.response?.status || 'ERR';
            warnings.push(`${f.label}: ${code}`);
          }
        })
      );
      setFeedWarnings(warnings);
    };

    checkFeeds();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">{error}</div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Healthcare Facilities',
      value: overview?.totalHospitals || 0,
      active: overview?.activeHospitals || 0,
      icon: Building2,
      color: 'bg-blue-500',
    },
    {
      name: 'EMS Agencies',
      value: overview?.totalAgencies || 0,
      active: overview?.activeAgencies || 0,
      icon: Truck,
      color: 'bg-green-500',
    },
    {
      name: 'Facilities',
      value: overview?.totalFacilities || 0,
      active: overview?.activeFacilities || 0,
      icon: MapPin,
      color: 'bg-purple-500',
    },
    {
      name: 'EMS Units',
      value: overview?.totalUnits || 0,
      active: overview?.activeUnits || 0,
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div>
      {showWarnings && feedWarnings.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">Feed warnings detected</div>
              <ul className="list-disc ml-5 mt-1 text-sm">
                {feedWarnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
            <button onClick={() => setShowWarnings(false)} className="text-sm underline">Dismiss</button>
          </div>
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor the status of hospitals, EMS agencies, and facilities in the system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 text-sm text-gray-500">
                        ({stat.active} active)
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/dashboard/trips"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                <Truck className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Trips
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                View, manage, and monitor all transport requests.
              </p>
            </div>
          </a>

          <a
            href="/dashboard/hospitals"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                <Building2 className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage Healthcare Facilities
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add, edit, or remove healthcare facilities from the system.
              </p>
            </div>
          </a>

          <a
            href="/dashboard/agencies"
            className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div>
              <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                <Truck className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Manage EMS Agencies
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add, edit, or remove EMS agencies and their units.
              </p>
            </div>
          </a>

        </div>
      </div>
    </div>
  );
};

export default Overview;
