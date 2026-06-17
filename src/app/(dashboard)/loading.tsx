export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-48 bg-gray-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-40 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-32">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
              <div className="w-12 h-4 bg-gray-50 rounded-lg"></div>
            </div>
            <div className="h-6 w-24 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-96">
            <div className="h-6 w-48 bg-gray-100 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 w-full bg-gray-50 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-64">
            <div className="h-6 w-32 bg-gray-100 rounded-lg mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-full bg-gray-100 rounded-lg"></div>
                    <div className="h-3 w-2/3 bg-gray-50 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
