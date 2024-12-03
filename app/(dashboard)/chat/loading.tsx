// app/(dashboard)/chat/loading.tsx
export default function ChatLoading() {
    return (
      <div className="flex h-[calc(100vh-5rem)]">
        {/* Sidebar Loading */}
        <div className="w-64 border-r bg-white hidden md:flex flex-col h-full">
          <div className="p-4 border-b animate-pulse">
            <div className="h-10 bg-gray-100 rounded-lg w-full" />
          </div>
          <div className="flex-1 p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-12 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
  
        {/* Main Chat Area Loading */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                {/* User message loading */}
                <div className="flex justify-end">
                  <div className="animate-pulse bg-primary/20 rounded-lg p-4 max-w-[80%]">
                    <div className="h-4 bg-primary/30 rounded w-32" />
                  </div>
                </div>
                {/* Bot message loading */}
                <div className="flex justify-start">
                  <div className="animate-pulse bg-gray-100 rounded-lg p-4 max-w-[80%]">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-4 bg-gray-200 rounded w-40" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
  
          {/* Input Area Loading */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <div className="animate-pulse h-10 w-10 bg-gray-100 rounded-lg" />
              <div className="animate-pulse flex-1 h-10 bg-gray-100 rounded-lg" />
              <div className="animate-pulse h-10 w-10 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }