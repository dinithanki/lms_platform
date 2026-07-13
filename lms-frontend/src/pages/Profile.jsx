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
    uploadProfilePicture();
  };

  const handleDownloadCert = (courseId, title) => {
    downloadCertificate(courseId, title);
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
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl flex flex-col items-center text-center relative overflow-hidden shadow-sm shadow-slate-100/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

          {/* Profile Picture render */}
          <div className="relative group mt-2">
            {profileImgUrl ? (
              <img
                src={profileImgUrl}
                alt={profile.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-indigo-500/20 shadow-md shadow-slate-100"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-650 text-white font-bold text-3xl flex items-center justify-center shadow-md shadow-indigo-500/10">
                {profile?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <h2 className="text-base font-black text-slate-800 mt-4 font-display tracking-tight leading-tight">{profile?.name}</h2>
          <span className="text-[9px] uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100/50 mt-1.5 font-display">
            {profile?.role}
          </span>
          <p className="text-xs text-slate-500 mt-3.5 leading-relaxed">
            {profile?.bio || "No biography provided yet."}
          </p>

          {/* Upload image form */}
          <form onSubmit={handleUploadPicture} className="w-full border-t border-slate-100 mt-5 pt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-bold text-slate-450 uppercase ml-1">
                Upload Avatar Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-slate-550 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-slate-105 file:text-indigo-600 hover:file:bg-slate-200 cursor-pointer"
                required
              />
            </div>
            {selectedFile && (
              <button
                type="submit"
                disabled={uploadLoading}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-[10px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-150"
              >
                {uploadLoading ? (
                  <div className="w-3 h-3 border-2 border-slate-450 border-t-transparent rounded-full animate-spin"></div>
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
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm shadow-slate-100/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-5 pb-2 border-b border-slate-100">
            Account details
          </h3>

          {message.text && (
            <div className={`mb-5 flex items-start gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-705"
                : "bg-rose-50 border-rose-205 text-rose-700"
            }`}>
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-700 focus:outline-none transition-all duration-155 placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450 ml-1">
                  Email Address (Disabled)
                </label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-slate-100 border border-slate-150 rounded-xl py-2.5 px-3.5 text-slate-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-450 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-700 focus:outline-none placeholder-slate-400"
                placeholder="e.g. +1 (555) 019-2834"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-455 ml-1">
                Biography / Career Path
              </label>
              <textarea
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 px-3.5 text-slate-700 focus:outline-none resize-none placeholder-slate-400"
                placeholder="Share your technical background, interest fields, or educational experience..."
              />
            </div>

            <button
              type="submit"
              disabled={saveLoading}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/10 w-fit self-end transition-all duration-200"
            >
              {saveLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </form>
        </div>

        {/* Student Certificates section */}
        {user?.role === "STUDENT" && (
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm shadow-slate-100/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-slate-100">
              Earned Certifications
            </h3>

            {certificatesLoading ? (
              <div className="p-4 text-center text-xs text-slate-450 animate-pulse">
                Resolving certificates metadata...
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-6 border border-dashed border-slate-200 text-center rounded-2xl bg-slate-50/50 text-xs text-slate-450">
                You have not completed any course programs to earn certificates yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {certificates.map((cert) => {
                  const courseTitle = certCourses[cert.courseId] || `Course #${cert.courseId}`;
                  return (
                    <div
                      key={cert.id}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-indigo-200 transition-all duration-150 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200/60">
                          <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{courseTitle}</h4>
                          <span className="text-[10px] text-slate-450 font-medium block mt-0.5">
                            Issue Date: {new Date(cert.issuedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDownloadCert(cert.courseId, courseTitle)}
                        disabled={downloadingCertId === cert.courseId}
                        className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all duration-150 disabled:opacity-50 shadow-sm"
                      >
                        {downloadingCertId === cert.courseId ? (
                          <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
