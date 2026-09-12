import { useEffect, useState } from "react";

export function meta() {
  return [{ title: "Status" }];
}

async function callAPIHealthCheckEndpoint() {
  const url = `${import.meta.env.VITE_API_URL}/api/health`;
  try {
    const response = await fetch(url);

    // Check if status 200, if not throws an error
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // Gets the response, and outputs success message
    const result = await response.json();
    console.log(result);

    return {
      success: true,
      message: "API is available",
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      message: "API is unavailable",
    };
  }
}

export default function Status() {
  // Sets initial state
  const [status, setStatus] = useState("checking");

  // Calls callAPIHealthCheckEndpoint() once page renders and updates state, and subsequently page
  useEffect(() => {
    callAPIHealthCheckEndpoint().then((result) => {
      setStatus(result.success ? "available" : "unavailable");
    });
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="font-bold">API Status</h1>
        {status === "checking" && <p>Checking API status...</p>}

        {status === "available" && <p>API is available.</p>}

        {status === "unavailable" && <p>API is unavailable.</p>}
      </div>
    </div>
  );
}
