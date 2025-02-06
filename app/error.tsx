'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      console.error('Error occurred:', error);
      // You could add error reporting service here
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="rounded-lg bg-white p-8 shadow-md">
        {process.env.NODE_ENV === 'production' ? (
          <>
            <h2 className="text-xl font-semibold text-gray-800">
              Something went wrong
            </h2>
            <p className="mt-2 text-gray-600">
              Please try again later
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-red-800">
              Development Error:
            </h2>
            <pre className="mt-2 text-sm text-red-700">
              {error.message}
            </pre>
          </>
        )}
        <button
          onClick={reset}
          className="mt-4 rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}