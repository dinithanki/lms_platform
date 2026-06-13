import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import quizService from "../services/quizService";
import courseService from "../services/courseService";

const Profile = () => {
  const { user, updateUserProfileLocal } = useAuth();

  // Profile Form State
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile Picture upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [profileImgUrl, setProfileImgUrl] = useState(null);

  // Student Certificates state
  const [certificates, setCertificates] = useState([]);
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [certCourses, setCertCourses] = useState({});
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  useEffect(() => {
    fetchProfileAndData();
  }, [user]);

  const fetchProfileAndData = async () => {
    if (!user) return;
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      // Fetch profile
      const data = await userService.getProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setBio(data.bio || "");

      // Handle profile picture
      if (data.profileImageUrl) {
        setProfileImgUrl(userService.getProfilePictureUrl(data.id));
      } else {
        setProfileImgUrl(null);
      }

      // If student, fetch certificates
      if (user.role === "STUDENT") {
        fetchStudentCertificates(data.id);
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Failed to load profile details. Ensure user-service is active.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentCertificates = async (studentId) => {
    setCertificatesLoading(true);
    try {
      const certs = await quizService.getCertificatesByStudent(studentId);
      setCertificates(certs);

      // Resolve course titles
      const courseMap = {};
      for (const cert of certs) {
        try {
          const c = await courseService.getCourseById(cert.courseId);
          courseMap[cert.courseId] = c.title;
        } catch (e) {
          courseMap[cert.courseId] = `Course ID: #${cert.courseId}`;
        }
      }
      setCertCourses(courseMap);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Save changes handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaveLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const updated = await userService.updateProfile(profile.id, name, phone, bio);
      setProfile(updated);
      // Update Context user state so headers/names update globally
      updateUserProfileLocal({
        ...user,
        name: updated.name,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update profile details." });
    } finally {
      setSaveLoading(false);
    }
  };

  // Picture Upload handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadPicture = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const updated = await userService.uploadProfilePicture(profile.id, selectedFile);
      setProfile(updated);
      setSelectedFile(null);
      // Refresh image url with timestamp to bust browser cache
      setProfileImgUrl(`${userService.getProfilePictureUrl(updated.id)}?t=${Date.now()}`);
      setMessage({ type: "success", text: "Profile picture uploaded successfully!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to upload image. Verify size and format." });
    } finally {
      setUploadLoading(false);
    }
  };

  // Download certificate helper
  const handleDownloadCert = async (courseId, title) => {
    setDownloadingCertId(courseId);
    try {
      const blob = await quizService.getCertificatePdfBlob(profile.id, courseId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Failed to download certificate.");
    } finally {
      setDownloadingCertId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fadeIn max-w-5xl mx-auto">
      {/* LEFT COL: Picture, Bio Details summary */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Profile Picture render */}
          <div className="relative group">
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/30 shadow-lg shadow-black/40"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-indigo-600/10">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-slate-200 mt-4">{profile.name}</h2>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-0.5">
            {profile.role}
          </span>
          <p className="text-xs text-slate-400 mt-3 leading-relaxed">
            {profile.bio || "No biography provided yet."}
          </p>

          {/* Upload image form */}
          <form onSubmit={handleUploadPicture} className="w-full border-t border-slate-800/80 mt-5 pt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">
                Upload Avatar Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700/80 cursor-pointer"
                required
              />
            </div>
            {selectedFile && (
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-[10px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150"
              >
                {uploadLoading ? (
                  <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Upload Avatar Image"
                )}
              </button>
            )}
          </form>
        </div>
      </div>

      {/* RIGHT COL: Forms and Certificates list */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Profile Info form */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-black/5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-5 pb-2 border-b border-slate-800/60">
            Account details
          </h3>

          {message.text && (
            <div className={`mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold border ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none transition-all duration-150"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                  Email Address (Disabled)
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full bg-slate-950/40 border border-slate-900 rounded-xl py-2.5 px-3.5 text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none"
                placeholder="e.g. +1 (555) 019-2834"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                Biography / Career Path
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-slate-200 focus:outline-none resize-none"
                placeholder="Share your technical background, interest fields, or educational experience..."
              />
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 w-fit self-end transition-colors duration-150"
            >
              {saveLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Student Certificates section */}
        {user.role === "STUDENT" && (
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl shadow-black/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-800/60">
              Earned Certifications
            </h3>

            {certificatesLoading ? (
              <div className="p-4 text-center text-xs text-slate-500 animate-pulse">
                Resolving certificates metadata...
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-800 text-center rounded-xl bg-slate-900/10 text-xs text-slate-500">
                You have not completed any course programs to earn certificates yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {certificates.map((cert) => {
                  const courseTitle = certCourses[cert.courseId] || `Course #${cert.courseId}`;
                  return (
                    <div
                      key={cert.id}
                      className="p-4 bg-slate-800/40 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-all duration-150 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{courseTitle}</h4>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            Issue Date: {new Date(cert.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadCert(cert.courseId, courseTitle)}
                        disabled={downloadingCertId === cert.courseId}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700/50 text-[10px] font-bold text-slate-300 rounded-lg flex items-center gap-1 cursor-pointer transition-colors duration-150 disabled:opacity-50"
                      >
                        {downloadingCertId === cert.courseId ? (
                          <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download PDF
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
