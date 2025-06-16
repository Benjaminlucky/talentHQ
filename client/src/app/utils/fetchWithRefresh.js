export async function fetchWithRefresh(url, options = {}) {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 401 && refreshToken) {
    try {
      const refreshRes = await fetch(
        "http://localhost:5000/api/jobseekers/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      const refreshData = await refreshRes.json();

      if (refreshRes.ok) {
        localStorage.setItem("accessToken", refreshData.accessToken);

        res = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${refreshData.accessToken}`,
          },
        });
      } else {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
    } catch (err) {
      console.error("Refresh failed:", err);
      localStorage.clear();
      window.location.href = "/login";
      return;
    }
  }

  return res;
}
