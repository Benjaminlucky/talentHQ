"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Upload, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";

export default function JobseekerProfilePage() {
  const [profile, setProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [openModal, setOpenModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me`,
          { withCredentials: true }
        );
        setProfile(res.data);
        setProfileCompletion(res.data.completion || 50);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      if (name === "resume") {
        // ✅ store raw File object for resume
        setFormData((p) => ({ ...p, [name]: files[0] }));
      } else {
        // ✅ for avatar or images → convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((p) => ({ ...p, [name]: reader.result }));
        };
        reader.readAsDataURL(files[0]);
      }
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (section, extraData = {}) => {
    try {
      setLoading(true);

      let url = "";
      let method = "post";
      let data = { ...formData, ...extraData };
      let headers = {};

      switch (section) {
        // ✅ Profile summary
        case "summary":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me`;
          method = "put";
          break;

        // ✅ Resume upload
        case "resume":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/resume`;
          method = "put";
          const fd = new FormData();
          fd.append("resume", formData.resume);
          data = fd;
          headers = { "Content-Type": "multipart/form-data" };
          break;

        // ✅ Skills
        case "skills":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/skills`;
          method = "post";
          break;
        case "deleteSkill":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/skills/${extraData.id}`;
          method = "delete";
          data = {};
          break;

        // ✅ Work Experience
        case "work":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/work-experiences`;
          method = "post";
          break;
        case "deleteWork":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/work-experiences/${extraData.id}`;
          method = "delete";
          data = {};
          break;

        // ✅ Education
        case "education":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/education`;
          method = "post";
          break;
        case "deleteEducation":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/education/${extraData.id}`;
          method = "delete";
          data = {};
          break;

        // ✅ Projects
        case "projects":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/projects`;
          method = "post";
          break;
        case "updateProject":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/project/${extraData.id}`;
          method = "put";
          break;
        case "deleteProject":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/project/${extraData.id}`;
          method = "delete";
          data = {};
          break;

        // ✅ Certifications
        case "certification":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/certifications`;
          method = "post";
          break;
        case "deleteCertification":
          url = `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me/certifications/${extraData.id}`;
          method = "delete";
          data = {};
          break;

        default:
          throw new Error(`Unknown section: ${section}`);
      }

      await axios({
        url,
        method,
        data,
        headers,
        withCredentials: true,
      });

      toast.success("Profile updated!");
      setOpenModal(null);

      // 🔄 Refresh profile
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/profile/me`,
        { withCredentials: true }
      );
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Update failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="space-y-8">
      {/* Profile Summary */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Profile Summary</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFormData(profile);
              setOpenModal("summary");
            }}
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          <img
            src={profile.avatar || "/avatar-placeholder.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex-1 space-y-2">
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            <p className="text-gray-600">{profile.headline}</p>
            <p className="italic text-sm">{profile.tagline}</p>
            <div className="text-sm text-gray-500 space-y-1">
              {profile.email && <p>Email: {profile.email}</p>}
              {profile.phone && <p>Phone: {profile.phone}</p>}
              {profile.location && (
                <p>
                  Location:{" "}
                  {typeof profile.location === "string"
                    ? profile.location
                    : [
                        profile.location?.area,
                        profile.location?.city,
                        profile.location?.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                </p>
              )}
              {profile.linkedin && (
                <p>
                  LinkedIn:{" "}
                  <a
                    href={profile.linkedin}
                    className="text-lime-600 hover:underline"
                  >
                    {profile.linkedin}
                  </a>
                </p>
              )}
              {profile.github && (
                <p>
                  GitHub:{" "}
                  <a
                    href={profile.github}
                    className="text-lime-600 hover:underline"
                  >
                    {profile.github}
                  </a>
                </p>
              )}
            </div>
            <div className="mt-4">
              <p className="text-sm mb-1">Profile Completion</p>
              <Progress value={profileCompletion} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Resume / CV</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("resume")}
          >
            <Upload className="h-4 w-4 mr-1" /> Upload New
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Current resume: {profile.resume || "No resume uploaded"}
          </p>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Skills</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("skills")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="list-disc ml-4 text-sm space-y-1">
            {profile.skills?.map((s) => (
              <li key={s._id} className="flex justify-between">
                {s.name} – {s.level}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSubmit("deleteSkill", { id: s._id })}
                >
                  <Trash className="w-4 h-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Work Experience */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Work Experience</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("work")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {profile.workExperience?.map((w) => (
            <div
              key={w._id}
              className="flex justify-between items-start border-b pb-2"
            >
              <div>
                <p className="font-semibold">
                  {w.jobTitle} – {w.company}
                </p>
                <p className="text-gray-500">
                  {w.startDate?.slice(0, 10)} –{" "}
                  {w.endDate ? w.endDate.slice(0, 10) : "Present"}
                </p>
                <p>{w.description}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubmit("deleteWork", { id: w._id })}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Education</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("education")}
          >
            Add
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {profile.education?.map((e) => (
            <div
              key={e._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-semibold">{e.degree}</p>
                <p className="text-gray-500">
                  {e.institution} –{" "}
                  {e.graduationYear ||
                    (e.graduationDate
                      ? new Date(e.graduationDate).getFullYear()
                      : "")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubmit("deleteEducation", { id: e._id })}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Portfolio / Projects</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("projects")}
          >
            Add
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {profile.projects?.map((p) => (
            <div
              key={p._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <a
                href={p.link}
                className="text-lime-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {p.title}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSubmit("deleteProject", { id: p._id })}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      {/* Certifications */}
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Certifications</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpenModal("certification")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          {profile.certifications?.map((c) => (
            <div
              key={c._id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-semibold">{c.title}</p>
                <p className="text-gray-500">
                  {c.organization} –{" "}
                  {c.dateEarned
                    ? new Date(c.dateEarned).toLocaleDateString()
                    : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleSubmit("deleteCertification", { id: c._id })
                }
              >
                <Trash className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {openModal}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {openModal === "summary" && (
              <>
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName || ""}
                  onChange={handleChange}
                />
                <Input
                  name="headline"
                  placeholder="Headline"
                  value={formData.headline || ""}
                  onChange={handleChange}
                />
                <Input
                  name="tagline"
                  placeholder="Tagline"
                  value={formData.tagline || ""}
                  onChange={handleChange}
                />
                <Input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
                <Input
                  name="linkedin"
                  placeholder="LinkedIn"
                  value={formData.linkedin || ""}
                  onChange={handleChange}
                />
                <Input
                  name="github"
                  placeholder="GitHub"
                  value={formData.github || ""}
                  onChange={handleChange}
                />

                {/* ✅ Single flat location field */}
                <Input
                  name="location"
                  placeholder="Location"
                  value={
                    typeof formData.location === "string"
                      ? formData.location
                      : [
                          formData.location?.area,
                          formData.location?.city,
                          formData.location?.country,
                        ]
                          .filter(Boolean)
                          .join(", ")
                  }
                  onChange={handleChange}
                />

                {/* Avatar upload */}
                <Input
                  type="file"
                  accept="image/*"
                  name="avatar"
                  onChange={handleChange}
                />
              </>
            )}

            {openModal === "skills" && (
              <>
                <Input
                  name="name"
                  placeholder="Skill Name"
                  value={formData.name || ""}
                  onChange={handleChange}
                />
                <Input
                  name="level"
                  placeholder="Level (Beginner/Intermediate/Expert)"
                  value={formData.level || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {openModal === "work" && (
              <>
                <Input
                  name="jobTitle"
                  placeholder="Job Title"
                  value={formData.jobTitle || ""}
                  onChange={handleChange}
                />
                <Input
                  name="company"
                  placeholder="Company"
                  value={formData.company || ""}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  name="startDate"
                  value={formData.startDate || ""}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ""}
                  onChange={handleChange}
                />
                <Textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {openModal === "education" && (
              <>
                <Input
                  name="degree"
                  placeholder="Degree"
                  value={formData.degree || ""}
                  onChange={handleChange}
                />
                <Input
                  name="institution"
                  placeholder="Institution"
                  value={formData.institution || ""}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  name="graduationDate"
                  value={formData.graduationDate || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {openModal === "projects" && (
              <>
                <Input
                  name="title"
                  placeholder="Project Title"
                  value={formData.title || ""}
                  onChange={handleChange}
                />
                <Input
                  name="link"
                  placeholder="Project Link"
                  value={formData.link || ""}
                  onChange={handleChange}
                />
                <Textarea
                  name="description"
                  placeholder="Project Description"
                  value={formData.description || ""}
                  onChange={handleChange}
                />
              </>
            )}

            {openModal === "resume" && (
              <>
                <Input type="file" name="resume" onChange={handleChange} />
              </>
            )}

            {openModal === "certification" && (
              <>
                <Input
                  name="title"
                  placeholder="Certification Title"
                  value={formData.title || ""}
                  onChange={handleChange}
                />
                <Input
                  name="organization"
                  placeholder="Issuing Organization"
                  value={formData.organization || ""}
                  onChange={handleChange}
                />
                <Input
                  type="date"
                  name="dateEarned"
                  value={formData.dateEarned || ""}
                  onChange={handleChange}
                />
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => handleSubmit(openModal)}
              disabled={loading}
              className="bg-lime-600 text-white"
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
