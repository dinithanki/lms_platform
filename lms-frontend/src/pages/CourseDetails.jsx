import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../store/authStore";
import useCourseDetailsStore from "../store/courseDetailsStore";
import useQuizStore from "../store/quizStore";
import quizService from "../services/quizService";
import StudentVideoPlayer from "../components/StudentVideoPlayer";

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Course details store
  const {
    course,
    loading,
    error,
    isEnrolled,
    enrollLoading,
    progress,
    completingModuleId,
    selectedModule,
    showModuleModal,
    editingModule,
    modTitle,
    modVideo,
    modResource,
    modSubmitLoading,
    activeTab,
    fetchCourseDetails,
    enrollStudent,
    completeModule,
    saveModule,
    openCreateModule,
    openEditModule,
    closeModuleModal,
    setModTitle,
    setModVideo,
    setModResource,
    setSelectedModule,
    setActiveTab,
    reset: resetCourseDetails,
  } = useCourseDetailsStore();

  // Quiz store
  const {
    quiz,
    quizQuestions,
    quizResults,
    isTakingQuiz,
    quizAnswers,
    quizSubmitLoading,
    latestAttemptResult,
    downloadingCert,
    quizSubmitLoadingInst,
    qSubmitLoading,
    fetchQuizDetails,
    submitQuiz,
    createQuiz,
    publishQuiz,
    addQuestion,
    deleteQuestion,
    setIsTakingQuiz,
    setQuizAnswers,
    setDownloadingCert,
    reset: resetQuiz,
  } = useQuizStore();

  // Instructor quiz form — local since it's transient UI
  const [quizTitle, setQuizTitle] = React.useState("");
  const [quizDesc, setQuizDesc] = React.useState("");
  const [showQuestionModal, setShowQuestionModal] = React.useState(false);
  const [qText, setQText] = React.useState("");
  const [optA, setOptA] = React.useState("");
  const [optB, setOptB] = React.useState("");
  const [optC, setOptC] = React.useState("");
  const [optD, setOptD] = React.useState("");
  const [correctOpt, setCorrectOpt] = React.useState("A");

  useEffect(() => {
    const init = async () => {
      await fetchCourseDetails(id, user);
      await fetchQuizDetails(id, user);
    };
    init();
    return () => {
      resetCourseDetails();
      resetQuiz();
    };
  }, [id, user]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleEnroll = async () => {
    try {
      await enrollStudent(id, user);
      await fetchQuizDetails(id, user);
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed.");
    }
  };

  const handleCompleteModule = async (moduleId) => {
    try {
      await completeModule(moduleId, id, user);
      // Re-fetch quiz details so the Quiz tab unlocks immediately
      // when the final module is completed, without needing a page refresh.
      await fetchQuizDetails(id, user);
    } catch {
      alert("Failed to mark module as complete.");
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitQuiz(user, quizAnswers);
      await fetchQuizDetails(id, user);
    } catch (err) {
      alert(err.message || err.response?.data?.message || "Quiz submission failed.");
    }
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      const blob = await quizService.getCertificatePdfBlob(user.id, id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `certificate_${course.title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Failed to generate PDF. Make sure you have completed the course and passed the quiz.");
    } finally {
      setDownloadingCert(false);
    }
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    try {
      await saveModule(id, editingModule, modTitle, modVideo, modResource);
    } catch {
      alert(editingModule ? "Failed to update module." : "Failed to create module.");
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;
    try {
      await createQuiz({
        courseId: parseInt(id),
        title: quizTitle,
        description: quizDesc,
        published: false,
      });
      setQuizTitle("");
      setQuizDesc("");
      await fetchQuizDetails(id, user);
    } catch {
      alert("Failed to create quiz.");
    }
  };

  const handlePublishQuiz = async () => {
    try {
      await publishQuiz();
      await fetchQuizDetails(id, user);
    } catch {
      alert("Failed to publish quiz.");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) return;
    try {
      await addQuestion({
        quizId: quiz.id,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correctOpt,
      });
      setQText(""); setOptA(""); setOptB(""); setOptC(""); setOptD(""); setCorrectOpt("A");
      setShowQuestionModal(false);
      await fetchQuizDetails(id, user);
    } catch {
      alert("Failed to add question.");
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(qId);
      await fetchQuizDetails(id, user);
    } catch {
      alert("Failed to delete question.");
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const allModulesCompleted =
    progress &&
    progress.completedModulesCount === progress.totalModulesCount &&
    progress.totalModulesCount > 0;
  const passedQuiz = quizResults.some((r) => r.passed);
  const attemptsCount = quizResults.length;
  const attemptsLeft = 5 - attemptsCount;

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-navy-400 font-medium">Loading syllabus & resources...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-xl bg-navy-800 border border-navy-700/40 rounded-2xl p-6 text-center mx-auto my-8">
        <p className="text-sm text-danger-400 font-semibold mb-4">Error loading page</p>
        <p className="text-sm text-navy-400 leading-relaxed mb-6">{error || "Course not found."}</p>
        <Link to="/courses" className="px-5 py-2 bg-accent-600 hover:bg-accent-500 rounded-xl text-sm font-semibold text-white">
          Back to Courses
        </Link>
      </div>
    );
  }

  // Common input class for forms
  const inputClass = "w-full bg-navy-850 border border-navy-700/50 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 rounded-xl py-2.5 px-3.5 text-sm text-navy-100 placeholder-navy-500 transition-all duration-200";

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Course Banner Header */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-accent-900/50 via-navy-800 to-navy-850 border border-navy-700/40 rounded-2xl relative overflow-hidden flex flex-col justify-between gap-6">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-accent-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <span className="text-[11px] uppercase font-semibold tracking-widest px-2.5 py-1.5 bg-accent-600/15 text-accent-300 border border-accent-600/25 rounded-full w-fit">
            Course details
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-white mt-3.5 font-display tracking-tight leading-tight">{course.title}</h1>
          <p className="text-sm text-navy-300 mt-2.5 max-w-3xl leading-relaxed">{course.description}</p>
        </div>

        {/* Enrollment Overlay for Students */}
        {user.role === "STUDENT" && !isEnrolled && (
          <div className="flex items-center gap-4 bg-navy-700/30 border border-navy-700/30 p-4 rounded-xl w-fit backdrop-blur-sm">
            <p className="text-sm text-navy-200">You are not enrolled in this course yet.</p>
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 disabled:text-navy-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-accent-600/15"
            >
              {enrollLoading ? (
                <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Enrolling...</>
              ) : "Enroll Now"}
            </button>
          </div>
        )}

        {/* Student Progress Banner */}
        {user.role === "STUDENT" && isEnrolled && progress && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-navy-700/30 border border-navy-700/30 p-4 rounded-xl w-full sm:w-fit backdrop-blur-sm">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] uppercase font-semibold text-navy-400 tracking-wider">Your Progression</span>
              <span className="text-sm font-semibold text-white">
                {progress.completedModulesCount} / {progress.totalModulesCount} Modules Completed
              </span>
            </div>
            <div className="w-full sm:w-48 h-2.5 bg-navy-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              ></div>
            </div>
            <span className="text-sm font-bold text-accent-400">{Math.round(progress.progressPercent)}%</span>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      {isEnrolled && (
        <div className="flex flex-col gap-6">
          <div className="flex border-b border-navy-700/30">
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`px-6 py-3 text-sm uppercase font-bold tracking-wider border-b-2 transition-colors duration-200 cursor-pointer ${
                activeTab === "syllabus" ? "border-accent-500 text-accent-400" : "border-transparent text-navy-400 hover:text-accent-400"
              }`}
            >
              Syllabus Modules
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-6 py-3 text-sm uppercase font-bold tracking-wider border-b-2 transition-colors duration-200 cursor-pointer ${
                activeTab === "quiz" ? "border-accent-500 text-accent-400" : "border-transparent text-navy-400 hover:text-accent-400"
              }`}
            >
              Course Final Quiz
            </button>
          </div>

          {/* TAB 1: SYLLABUS */}
          {activeTab === "syllabus" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white font-display">Lessons & Content</h2>
                {user.role === "INSTRUCTOR" && (
                  <button
                    onClick={openCreateModule}
                    className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Module
                  </button>
                )}
              </div>

              {course.modules?.length === 0 ? (
                <div className="p-8 border border-dashed border-navy-700/50 bg-navy-800/50 text-center rounded-2xl">
                  <p className="text-sm text-navy-400">No content modules are set up for this course syllabus yet.</p>
                </div>
              ) : user.role === "STUDENT" ? (
                /* STUDENT SPLIT VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="p-5 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col gap-4">
                      {selectedModule ? (
                        <>
                          <StudentVideoPlayer
                            key={selectedModule.id}
                            videoUrl={selectedModule.videoUrl}
                            lessonTitle={selectedModule.title}
                            user={user}
                            isEnrolled={isEnrolled}
                          />
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-navy-700/30">
                            <div className="flex items-center gap-4">
                              {selectedModule.resourceUrl ? (
                                <a href={selectedModule.resourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-accent-400 hover:text-accent-300 font-medium transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download Study Materials
                                </a>
                              ) : (
                                <span className="text-sm text-navy-500 font-medium">No study materials linked</span>
                              )}
                            </div>
                            <div className="shrink-0">
                              {progress && progress.completedModuleIds && progress.completedModuleIds.includes(selectedModule.id) ? (
                                <span className="flex items-center gap-1.5 px-4 py-2 bg-success-700/20 text-success-400 border border-success-700/30 rounded-xl text-sm font-semibold">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Completed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCompleteModule(selectedModule.id)}
                                  disabled={completingModuleId === selectedModule.id}
                                  className="px-4 py-2 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-accent-600/15"
                                >
                                  {completingModuleId === selectedModule.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>
                                  ) : "Mark Completed"}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8 text-sm text-navy-400">Select a lesson from the list to start watching.</div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-4 lg:max-h-[600px] lg:overflow-y-auto pl-5 pr-2 relative">
                    <h3 className="text-[12px] font-bold uppercase tracking-wider text-navy-400 mb-1 pl-1">Course Curriculum</h3>
                    <div className="flex flex-col gap-3 relative pl-3.5 border-l border-navy-700/40">
                      {course.modules.map((mod, index) => {
                        const isCompleted = progress && progress.completedModuleIds && progress.completedModuleIds.includes(mod.id);
                        const isSelected = selectedModule && selectedModule.id === mod.id;
                        return (
                          <div
                            key={mod.id}
                            onClick={() => setSelectedModule(mod)}
                            className="relative group cursor-pointer"
                          >
                            {/* Connected timeline indicator dot */}
                            <span className={`absolute -left-[19.5px] top-[18px] w-2.5 h-2.5 rounded-full border-2 transition-all duration-300 ${
                              isSelected 
                                ? "bg-accent-500 border-accent-500 scale-125" 
                                : isCompleted 
                                ? "bg-success-500 border-success-500" 
                                : "bg-navy-800 border-navy-500 group-hover:border-accent-400"
                            }`}></span>

                            <div className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                              isSelected
                                ? "bg-accent-600/10 border-accent-600/25"
                                : "bg-navy-800 border-navy-700/40 hover:border-navy-600"
                            }`}>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-semibold truncate ${isSelected ? "text-accent-400" : "text-navy-100"}`}>
                                  {mod.title}
                                </h4>
                                <div className="flex items-center gap-2.5 mt-1.5 text-[12px] text-navy-400 font-medium">
                                  <span className="flex items-center gap-0.5 text-accent-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Video Lesson
                                  </span>
                                  {mod.resourceUrl && (
                                    <>
                                      <span>•</span>
                                      <span className="text-navy-400">Materials</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                /* INSTRUCTOR / ADMIN VIEW */
                <div className="flex flex-col gap-4">
                  {course.modules.map((mod, index) => {
                    const isCompleted = progress && progress.completedModuleIds && progress.completedModuleIds.includes(mod.id);
                    return (
                      <div key={mod.id} className="p-5 bg-navy-800 border border-navy-700/40 rounded-xl hover:border-accent-600/20 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-navy-700/50 border border-navy-700/40 text-sm font-semibold text-accent-400 shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white">{mod.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px] text-navy-400 font-medium">
                              <a href={mod.videoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-accent-400 hover:text-accent-300 transition-colors font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Lesson Video
                              </a>
                              {mod.resourceUrl && (
                                <><span className="text-navy-600">•</span>
                                  <a href={mod.resourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-navy-400 hover:text-navy-300 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Study Materials
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {user.role === "STUDENT" && (
                          <div className="shrink-0 self-end sm:self-center">
                            {isCompleted ? (
                              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-success-700/20 text-success-400 border border-success-700/30 rounded-xl text-[12px] font-semibold">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            ) : (
                              <button onClick={() => handleCompleteModule(mod.id)} disabled={completingModuleId === mod.id} className="px-3.5 py-1.5 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 text-navy-200 hover:text-accent-400 rounded-xl transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer text-sm">
                                {completingModuleId === mod.id ? <div className="w-3 h-3 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"></div> : "Mark Completed"}
                              </button>
                            )}
                          </div>
                        )}

                        {user.role === "INSTRUCTOR" && (
                          <div className="shrink-0 self-end sm:self-center">
                            <button onClick={() => openEditModule(mod)} className="px-3.5 py-1.5 bg-navy-700/50 hover:bg-navy-700 border border-navy-700/40 text-[12px] font-semibold text-accent-400 hover:text-accent-300 rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit Module
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Create/Edit Lesson Modal */}
              {showModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={closeModuleModal}></div>
                  <div className="w-full max-w-md bg-navy-800 border border-navy-700/40 rounded-2xl p-6 shadow-2xl shadow-black/40 z-10 animate-scaleIn">
                    <div className="flex justify-between items-center mb-5 border-b border-navy-700/30 pb-3">
                      <h3 className="text-base font-bold text-white font-display">{editingModule ? "Edit Lesson Module" : "Add Lesson Module"}</h3>
                      <button onClick={closeModuleModal} className="p-1.5 text-navy-400 hover:text-white rounded-lg hover:bg-navy-700/50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleSaveModule} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Module Title</label>
                        <input type="text" value={modTitle} onChange={(e) => setModTitle(e.target.value)} className={inputClass} placeholder="e.g. Lesson 1: Component Fundamentals" required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Video Lesson URL</label>
                        <input type="url" value={modVideo} onChange={(e) => setModVideo(e.target.value)} className={inputClass} placeholder="e.g. https://www.youtube.com/watch?v=..." required />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Resource Materials URL (Optional)</label>
                        <input type="url" value={modResource} onChange={(e) => setModResource(e.target.value)} className={inputClass} placeholder="e.g. https://github.com/..." />
                      </div>
                      <button type="submit" disabled={modSubmitLoading} className="w-full bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                        {modSubmitLoading ? (
                          <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>{editingModule ? "Saving Module..." : "Adding Module..."}</>
                        ) : (editingModule ? "Save Changes" : "Add Module")}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: QUIZ */}
          {activeTab === "quiz" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              {/* STUDENT WORKFLOW */}
              {user.role === "STUDENT" && (
                <div className="flex flex-col gap-5">
                  {!allModulesCompleted ? (
                    <div className="p-8 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col items-center text-center gap-3 animate-fadeIn">
                      <div className="p-3 bg-warn-600/10 text-warn-400 rounded-full border border-warn-600/20">
                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">Final Quiz Locked</h3>
                      <p className="text-sm text-navy-400 max-w-sm leading-relaxed">
                        You must complete all syllabus lesson modules in order to unlock the final course quiz and obtain a certificate.
                      </p>
                    </div>
                  ) : !quiz ? (
                    <div className="p-8 bg-navy-800 border border-navy-700/40 rounded-2xl text-center animate-fadeIn">
                      <p className="text-sm text-navy-400">No final quiz has been set up for this course syllabus yet.</p>
                    </div>
                  ) : !quiz.published ? (
                    <div className="p-8 bg-navy-800 border border-navy-700/40 rounded-2xl text-center animate-fadeIn">
                      <p className="text-sm text-navy-400">The instructor has draft questions but has not published this quiz yet.</p>
                    </div>
                  ) : passedQuiz ? (
                    <div className="p-8 bg-gradient-to-tr from-success-700/15 via-navy-800 to-navy-800 border border-success-700/30 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden animate-fadeIn">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-success-500/5 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="p-4 bg-success-700/20 text-success-400 rounded-full border border-success-700/30">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">Congratulations!</h3>
                        <p className="text-sm text-navy-400 mt-1 max-w-sm leading-relaxed">You successfully passed the course quiz and have graduated from this course program!</p>
                      </div>
                      <div className="flex gap-6 border border-navy-700/30 bg-navy-850 p-3.5 rounded-xl text-sm font-medium">
                        <div><span className="text-[11px] text-navy-400 block">Total Attempts</span><span className="text-white mt-0.5 block">{attemptsCount} / 5</span></div>
                        <div className="w-px bg-navy-700/40"></div>
                        <div><span className="text-[11px] text-navy-400 block">Highest Score</span><span className="text-success-400 mt-0.5 block">{Math.max(...quizResults.map((r) => r.score))}%</span></div>
                      </div>
                      <button onClick={handleDownloadCertificate} disabled={downloadingCert} className="px-5 py-2.5 bg-success-600 hover:bg-success-500 disabled:bg-navy-700 disabled:text-navy-500 text-white rounded-xl text-sm font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer">
                        {downloadingCert ? (
                          <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Generating PDF...</>
                        ) : (
                          <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>Download Certificate PDF</>
                        )}
                      </button>
                    </div>
                  ) : isTakingQuiz ? (
                    <form onSubmit={handleQuizSubmit} className="p-6 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col gap-6 animate-scaleIn">
                      <div className="border-b border-navy-700/30 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">{quiz.title}</h3>
                          <p className="text-[12px] text-navy-400 mt-0.5">Attempt {attemptsCount + 1} of 5</p>
                        </div>
                        <button type="button" onClick={() => setIsTakingQuiz(false)} className="px-3 py-1 bg-navy-700/50 hover:bg-navy-700 text-navy-200 rounded-lg text-[12px] font-medium transition-colors duration-150">
                          Cancel Quiz
                        </button>
                      </div>
                      <div className="flex flex-col gap-6">
                        {quizQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 bg-navy-850 border border-navy-700/30 rounded-xl flex flex-col gap-3.5">
                            <span className="text-[11px] uppercase font-semibold text-accent-400">Question {idx + 1}</span>
                            <p className="text-sm text-navy-100 font-medium leading-relaxed">{q.questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {[{ val: "A", text: q.optionA }, { val: "B", text: q.optionB }, { val: "C", text: q.optionC }, { val: "D", text: q.optionD }].map((opt) => (
                                <label key={opt.val} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer text-sm transition-all duration-150 ${quizAnswers[q.id] === opt.val ? "border-accent-500 bg-accent-600/10 text-accent-300 font-medium" : "bg-navy-800 border-navy-700/40 hover:border-accent-600/30 text-navy-300"}`}>
                                  <input type="radio" name={`q_${q.id}`} value={opt.val} checked={quizAnswers[q.id] === opt.val} onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.val }))} className="accent-accent-500 w-3.5 h-3.5 shrink-0 cursor-pointer" required />
                                  <span className="font-semibold text-[11px]">{opt.val}.</span>
                                  <span>{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <button type="submit" disabled={quizSubmitLoading} className="w-full py-3.5 bg-accent-600 hover:bg-accent-500 text-white font-semibold text-sm uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-accent-600/15">
                        {quizSubmitLoading ? <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Submitting quiz answers...</> : "Submit Quiz Attempt"}
                      </button>
                    </form>
                  ) : (
                    <div className="p-8 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col items-center text-center gap-4">
                      <div className="p-3 bg-accent-600/10 text-accent-400 rounded-full border border-accent-600/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V19h2v2h-4v-2h2v-2.03a5.008 5.008 0 01-3.536-1.864z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">{quiz.title}</h3>
                        <p className="text-sm text-navy-400 mt-1 max-w-sm leading-relaxed">{quiz.description || "Take the final exam."}</p>
                      </div>
                      <div className="flex gap-6 border border-navy-700/30 bg-navy-850 p-3.5 rounded-xl text-sm font-medium">
                        <div><span className="text-[11px] text-navy-400 block">Attempts Used</span><span className="text-white mt-0.5 block">{attemptsCount} / 5</span></div>
                        <div className="w-px bg-navy-700/40"></div>
                        <div><span className="text-[11px] text-navy-400 block">Passing Score</span><span className="text-accent-400 mt-0.5 block font-semibold">80%</span></div>
                      </div>
                      {latestAttemptResult && (
                        <div className={`p-4 rounded-xl border text-sm leading-relaxed max-w-sm ${latestAttemptResult.passed ? "bg-success-700/15 border-success-700/30 text-success-400" : "bg-danger-700/15 border-danger-700/30 text-danger-400"}`}>
                          <p className="font-semibold uppercase tracking-wider mb-1">Attempt Result: {latestAttemptResult.passed ? "Passed" : "Failed"}</p>
                          <p>Your Score: <span className="font-semibold">{latestAttemptResult.score}%</span>. Attempts used: {latestAttemptResult.attempts}</p>
                        </div>
                      )}
                      {attemptsLeft > 0 ? (
                        <button onClick={() => setIsTakingQuiz(true)} className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200">
                          Start Final Quiz ({attemptsLeft} left)
                        </button>
                      ) : (
                        <div className="p-3.5 bg-danger-700/15 border border-danger-700/30 text-danger-400 rounded-xl text-sm max-w-xs font-medium">
                          You have exhausted all 5 attempts for this quiz and did not pass. Contact support if needed.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ADMIN / INSTRUCTOR WORKFLOW */}
              {(user.role === "INSTRUCTOR" || user.role === "ADMIN") && (
                <div className="flex flex-col gap-6">
                  {!quiz ? (
                    user.role === "INSTRUCTOR" ? (
                      <div className="p-6 bg-navy-800 border border-navy-700/40 rounded-2xl max-w-md animate-fadeIn">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white mb-4 font-display">Set Up Final Quiz</h3>
                        <form onSubmit={handleCreateQuiz} className="flex flex-col gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Quiz Title</label>
                            <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} className={inputClass} placeholder="e.g. React Certification Exam" required />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Quiz Description</label>
                            <textarea rows="3" value={quizDesc} onChange={(e) => setQuizDesc(e.target.value)} className={`${inputClass} resize-none`} placeholder="Provide details about passing score, attempts limit, and exam rules..." required />
                          </div>
                          <button type="submit" disabled={quizSubmitLoadingInst} className="w-full py-2.5 bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                            {quizSubmitLoadingInst ? <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Creating Quiz Template...</> : "Create Quiz Template"}
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="p-8 bg-navy-800 border border-navy-700/40 rounded-2xl text-center">
                        <p className="text-sm text-navy-400">No final quiz has been set up for this course syllabus yet.</p>
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                      <div className="p-5 bg-navy-800 border border-navy-700/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest font-display">{quiz.title}</h3>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${quiz.published ? "bg-success-700/20 text-success-400 border-success-700/30" : "bg-warn-600/15 text-warn-400 border-warn-600/25"}`}>
                              {quiz.published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-sm text-navy-400 mt-1">{quiz.description}</p>
                        </div>
                        {user.role === "INSTRUCTOR" && !quiz.published && (
                          <button onClick={handlePublishQuiz} disabled={quizQuestions.length === 0} className="px-4 py-2 bg-success-600 hover:bg-success-500 disabled:bg-navy-700 disabled:text-navy-500 text-white rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer">
                            Publish Final Quiz
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[12px] font-bold uppercase tracking-widest text-navy-400">Questions List ({quizQuestions.length})</h4>
                          {user.role === "INSTRUCTOR" && (
                            <button onClick={() => setShowQuestionModal(true)} className="px-3.5 py-1.5 bg-accent-600 hover:bg-accent-500 text-white rounded-xl text-[12px] font-semibold transition-all duration-150 flex items-center gap-1 cursor-pointer">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Question
                            </button>
                          )}
                        </div>

                        {quizQuestions.length === 0 ? (
                          <div className="p-8 border border-dashed border-navy-700/50 text-center rounded-2xl bg-navy-800/50 animate-pulse">
                            <p className="text-sm text-navy-400">No questions have been added to this exam template yet.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {quizQuestions.map((q, idx) => (
                              <div key={q.id} className="p-5 bg-navy-800 border border-navy-700/40 rounded-xl flex flex-col gap-4 relative">
                                {user.role === "INSTRUCTOR" && (
                                  <button onClick={() => handleDeleteQuestion(q.id)} className="absolute top-4 right-4 text-navy-500 hover:text-danger-400 p-1 rounded-lg hover:bg-navy-700/50 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                                <div>
                                  <span className="text-[11px] font-semibold text-accent-400 uppercase">Question {idx + 1}</span>
                                  <p className="text-sm text-navy-100 font-medium mt-1 leading-relaxed max-w-[90%]">{q.questionText}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  {[{ k: "A", val: q.optionA }, { k: "B", val: q.optionB }, { k: "C", val: q.optionC }, { k: "D", val: q.optionD }].map((opt) => (
                                    <div key={opt.k} className={`p-2.5 border rounded-lg flex items-center gap-2 ${q.correctAnswer === opt.k ? "border-success-500/40 bg-success-700/10 text-success-400 font-medium" : "border-navy-700/30 bg-navy-850 text-navy-300"}`}>
                                      <span className="font-semibold text-[10px]">{opt.k}.</span>
                                      <span>{opt.val}</span>
                                      {q.correctAnswer === opt.k && <span className="text-[10px] uppercase px-1.5 py-0.5 rounded font-semibold bg-success-700/20 border border-success-700/30 text-success-400 ml-auto">Correct</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Create Question Modal */}
                      {user.role === "INSTRUCTOR" && showQuestionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)}></div>
                          <div className="w-full max-w-md bg-navy-800 border border-navy-700/40 rounded-2xl p-6 shadow-2xl shadow-black/40 z-10 animate-scaleIn">
                            <div className="flex justify-between items-center mb-5 border-b border-navy-700/30 pb-3">
                              <h3 className="text-base font-bold text-white font-display">Add Question</h3>
                              <button onClick={() => setShowQuestionModal(false)} className="p-1.5 text-navy-400 hover:text-white rounded-lg hover:bg-navy-700/50 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4 text-sm">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Question Prompt</label>
                                <textarea rows="2" value={qText} onChange={(e) => setQText(e.target.value)} className={`${inputClass} resize-none`} placeholder="e.g. Which Hook is used to handle side-effects in React functional components?" required />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                {[["A", optA, setOptA], ["B", optB, setOptB], ["C", optC, setOptC], ["D", optD, setOptD]].map(([label, val, setter]) => (
                                  <div key={label} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-semibold text-navy-400 ml-1 uppercase">Option {label}</label>
                                    <input type="text" value={val} onChange={(e) => setter(e.target.value)} className={inputClass} required />
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-navy-400 ml-1">Correct Answer</label>
                                <select value={correctOpt} onChange={(e) => setCorrectOpt(e.target.value)} className={`${inputClass} cursor-pointer`}>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                </select>
                              </div>
                              <button type="submit" disabled={qSubmitLoading} className="w-full bg-accent-600 hover:bg-accent-500 disabled:bg-navy-700 disabled:text-navy-500 text-white font-semibold text-sm rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
                                {qSubmitLoading ? <><div className="w-3.5 h-3.5 border-2 border-navy-400 border-t-transparent rounded-full animate-spin"></div>Adding Question...</> : "Add Question"}
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
