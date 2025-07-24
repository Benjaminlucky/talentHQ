export const logoutJobSeeker = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const jobSeekerId = userData?.id;

    const response = await fetch("/api/jobseekers/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: jobSeekerId }),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.href = "/jobseeker/login"; // or homepage
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
