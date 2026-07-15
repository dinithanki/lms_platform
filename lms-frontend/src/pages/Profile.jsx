import React, { useEffect } from "react";
import { useAuth } from "../store/authStore";
import useProfileStore from "../store/profileStore";

const Profile = () => {
  const { user, updateUserProfileLocal } = useAuth();
  const {
    profile,
    profileImgUrl,
    loading,
    saveLoading,
    uploadLoading,
    message,
    name,
    phone,
    bio,
    selectedFile,
    certificates,
    certCourses,
    certificatesLoading,
    downloadingCertId,
    fetchProfileAndData,
    saveProfile,
    uploadProfilePicture,
    downloadCertificate,
    setName,
    setPhone,
    setBio,
    setSelectedFile,
  } = useProfileStore();

  useEffect(() => {
    fetchProfileAndData(user);
  }, [user]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    saveProfile(updateUserProfileLocal, user);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadPicture = (e) => {
    e.preventDefault();
    uploadProfilePicture(updateUserProfileLocal, user);
  };

  const handleDownloadCert = (courseId, title) => {
    downloadCertificate(courseId, title);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-navy-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fadeIn max-w-5xl mx-auto">
      {/* LEFT COL: Picture, Bio Details summary */}
      <div className="w-full md:w-1/3 flex flex-col gap-6">
        <div className="p-6 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Profile Picture render */}
          <div className="relative group mt-2">
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-accent-500/20 shadow-lg shadow-black/20"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-accent-500 to-cyan-500 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-accent-600/15">
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-white mt-4 font-display tracking-tight leading-tight">{profile?.name}</h2>
          <span className="text-[11px] uppercase font-semibold tracking-wider text-accent-400 bg-accent-600/10 px-2.5 py-1 rounded-lg border border-accent-600/20 mt-2">
            {profile?.role}
          </span>
          <p className="text-sm text-navy-300 mt-3.5 leading-relaxed">
            {profile?.bio || "No biography provided yet."}
          </p>

          {/* Upload image form */}
          <form onSubmit={handleUploadPicture} className="w-full border-t border-navy-700/30 mt-5 pt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[11px] font-semibold text-navy-400 uppercase ml-1">
                Upload Avatar Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-navy-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-navy-700 file:text-accent-400 hover:file:bg-navy-600 cursor-pointer"
                required
              />
            </div>
            {selectedFile && (
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 active:scale-[0.98] disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-[12px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 shadow-lg shadow-accent-600/15"
              >
                {uploadLoading ? (
                  <div className="w-3 h-3 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="p-6 bg-navy-800 border border-navy-700/40 rounded-2xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-5 pb-2 border-b border-navy-700/30 font-display">
            Account details
          </h3>

          {message.text && (
            <div className={`mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border ${
              message.type === "success"
                ? "bg-success-700/20 border-success-700/30 text-success-400 animate-fadeIn"
                : "bg-danger-700/20 border-danger-700/30 text-danger-400 animate-fadeIn"
            }`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-navy-100 transition-all duration-150 placeholder-navy-500 font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                  Email Address (Disabled)
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-navy-850/50 border border-navy-700/30 rounded-xl py-2.5 px-3.5 text-navy-500 cursor-not-allowed font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-navy-100 placeholder-navy-500 font-medium"
                placeholder="e.g. +1 (555) 019-2834"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">
                Biography / Career Path
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-navy-100 resize-none placeholder-navy-500 font-medium"
                placeholder="Share your technical background, interest fields, or educational experience..."
              />
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-3 bg-accent-600 hover:bg-accent-500 active:scale-[0.98] disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-accent-600/15 w-fit self-end transition-all duration-200"
            >
              {saveLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>

        {/* Student Certificates section */}
        {user?.role === "STUDENT" && (
          <div className="p-6 bg-navy-800 border border-navy-700/40 rounded-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 pb-2 border-b border-navy-700/30 font-display">
              Earned Certifications
            </h3>

            {certificatesLoading ? (
              <div className="p-4 text-center text-sm text-navy-400 animate-pulse font-medium">
                Resolving certificates metadata...
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-6 border border-dashed border-navy-700/50 text-center rounded-xl bg-navy-850 text-sm text-navy-400">
                You have not completed any course programs to earn certificates yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-fadeIn">
                {certificates.map((cert) => {
                  const courseTitle = certCourses[cert.courseId] || `Course #${cert.courseId}`;
                  return (
                    <div
                      key={cert.id}
                      className="p-4 bg-navy-850 border border-navy-700/30 rounded-xl hover:border-accent-600/30 transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-warn-600/10 text-warn-400 rounded-xl border border-warn-600/20 shrink-0">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-white truncate">{courseTitle}</h4>
                          <span className="text-[12px] text-navy-400 font-medium block mt-0.5">
                            Issue Date: {new Date(cert.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadCert(cert.courseId, courseTitle)}
                        disabled={downloadingCertId === cert.courseId}
                        className="w-full sm:w-auto px-3.5 py-2.5 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 text-[12px] font-semibold text-navy-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150 disabled:opacity-50"
                      >
                        {downloadingCertId === cert.courseId ? (
                          <div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
