import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";
import enrollmentService from "../services/enrollmentService";
import quizService from "../services/quizService";
import StudentVideoPlayer from "../components/StudentVideoPlayer";

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState("syllabus"); // syllabus, quiz

  // Course Details State
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  // Student Course Progress State
  const [progress, setProgress] = useState(null);
  const [completingModuleId, setCompletingModuleId] = useState(null);

  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizResults, setQuizResults] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  // Student Quiz Attempt State
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({}); // questionId -> selectedOption ('A', 'B', 'C', 'D')
  const [quizSubmitLoading, setQuizSubmitLoading] = useState(false);
  const [latestAttemptResult, setLatestAttemptResult] = useState(null);
  const [downloadingCert, setDownloadingCert] = useState(false);

  // Active Selected Module for Student Player
  const [selectedModule, setSelectedModule] = useState(null);

  // Instructor Module Form
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [modTitle, setModTitle] = useState("");
  const [modVideo, setModVideo] = useState("");
  const [modResource, setModResource] = useState("");
  const [modSubmitLoading, setModSubmitLoading] = useState(false);

  const handleOpenCreateModule = () => {
    setEditingModule(null);
    setModTitle("");
    setModVideo("");
    setModResource("");
    setShowModuleModal(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModTitle(mod.title);
    setModVideo(mod.videoUrl);
    setModResource(mod.resourceUrl || "");
    setShowModuleModal(true);
  };

  const handleCloseModuleModal = () => {
    setShowModuleModal(false);
    setEditingModule(null);
    setModTitle("");
    setModVideo("");
    setModResource("");
  };

  // Instructor Quiz Form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDesc, setQuizDesc] = useState("");
  const [quizSubmitLoadingInst, setQuizSubmitLoadingInst] = useState(false);

  // Instructor Question Form
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [qText, setQText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctOpt, setCorrectOpt] = useState("A");
  const [qSubmitLoading, setQSubmitLoading] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id, user]);

  const fetchCourseDetails = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await courseService.getCourseById(id);
      const modules = await courseService.getModules(id);
      setCourse({ ...data, modules });

      if (user) {
        // Check if user is enrolled
        if (user.role === "STUDENT") {
          const enrolledList = await enrollmentService.getEnrolledCourses(user.id);
          const enrolled = enrolledList.some((c) => c.id === parseInt(id));
          setIsEnrolled(enrolled);

          if (enrolled) {
            const prog = await courseService.getCourseProgress(id, user.id);
            setProgress(prog);

            // Set initial active module for student
            if (modules && modules.length > 0) {
              const incomplete = modules.find((m) => !prog.completedModuleIds || !prog.completedModuleIds.includes(m.id));
              setSelectedModule(incomplete || modules[0]);
            }
          }
        } else {
          // Instructors and Admins see details directly
          setIsEnrolled(true);
        }

        // Fetch Quiz details
        fetchQuizDetails();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load course details. Make sure services are running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizDetails = async () => {
    try {
      const quizData = await quizService.getQuizByCourseId(id, user.role === "STUDENT" ? user.id : null);
      setQuiz(quizData);

      if (quizData) {
        // Fetch quiz questions
        const questions = await quizService.getQuestionsByQuizId(quizData.id);
        setQuizQuestions(questions);

        // Fetch user attempts
        if (user.role === "STUDENT") {
          const attempts = await quizService.getQuizResults(user.id, quizData.id);
          setQuizResults(attempts);
        }
      }
    } catch (err) {
      // Quiz may not exist yet, which is fine for instructors to build
      setQuiz(null);
      setQuizQuestions([]);
    }
  };

  // Student Enroll
  const handleEnroll = async () => {
    setEnrollLoading(true);
    try {
      await enrollmentService.enrollStudent(id, user.id);
      setIsEnrolled(true);
      const prog = await courseService.getCourseProgress(id, user.id);
      setProgress(prog);
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Enrollment failed.");
    } finally {
      setEnrollLoading(false);
    }
  };

  // Student complete module
  const handleCompleteModule = async (moduleId) => {
    setCompletingModuleId(moduleId);
    try {
      await courseService.completeModule(moduleId, user.id);
      // Refresh progress & course details
      const prog = await courseService.getCourseProgress(id, user.id);
      setProgress(prog);
      const data = await courseService.getCourseById(id);
      const modules = await courseService.getModules(id);
      setCourse({ ...data, modules });

      // Update selectedModule status in-place if it was the completed module
      if (selectedModule && selectedModule.id === moduleId) {
        const updatedMod = modules.find((m) => m.id === moduleId);
        if (updatedMod) {
          setSelectedModule(updatedMod);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark module as complete.");
    } finally {
      setCompletingModuleId(null);
    }
  };

  // Student Submit Quiz
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!quiz) return;

    // Check that all questions are answered
    if (Object.keys(quizAnswers).length < quizQuestions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setQuizSubmitLoading(true);
    try {
      const formattedAnswers = Object.entries(quizAnswers).map(([qId, ans]) => ({
        questionId: parseInt(qId),
        selectedOption: ans,
      }));

      const result = await quizService.submitQuiz(user.id, quiz.id, formattedAnswers);
      setLatestAttemptResult(result);
      setIsTakingQuiz(false);
      setQuizAnswers({});
      // Refresh results
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Quiz submission failed.");
    } finally {
      setQuizSubmitLoading(false);
    }
  };

  // Student Download Certificate
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
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Make sure you have completed the course and passed the quiz.");
    } finally {
      setDownloadingCert(false);
    }
  };

  // Instructor Save Module (Create/Update)
  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!modTitle.trim() || !modVideo.trim()) return;

    setModSubmitLoading(true);
    try {
      if (editingModule) {
        await courseService.updateModule(editingModule.id, {
          title: modTitle,
          videoUrl: modVideo,
          resourceUrl: modResource,
        });
      } else {
        await courseService.createModule(id, {
          title: modTitle,
          videoUrl: modVideo,
          resourceUrl: modResource,
        });
      }
      handleCloseModuleModal();
      // Reload course
      const data = await courseService.getCourseById(id);
      const modules = await courseService.getModules(id);
      setCourse({ ...data, modules });
    } catch (err) {
      console.error(err);
      alert(editingModule ? "Failed to update module." : "Failed to create module.");
    } finally {
      setModSubmitLoading(false);
    }
  };

  // Instructor Create Quiz
  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    setQuizSubmitLoadingInst(true);
    try {
      await quizService.createQuiz({
        courseId: parseInt(id),
        title: quizTitle,
        description: quizDesc,
        published: false,
      });
      setQuizTitle("");
      setQuizDesc("");
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz.");
    } finally {
      setQuizSubmitLoadingInst(false);
    }
  };

  // Instructor Publish Quiz
  const handlePublishQuiz = async () => {
    if (!quiz) return;
    try {
      await quizService.publishQuiz(quiz.id);
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to publish quiz.");
    }
  };

  // Instructor Create Question
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!qText.trim() || !optA.trim() || !optB.trim() || !optC.trim() || !optD.trim() || !correctOpt) return;

    setQSubmitLoading(true);
    try {
      await quizService.addQuestion({
        quizId: quiz.id,
        questionText: qText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correctOpt,
      });
      setQText("");
      setOptA("");
      setOptB("");
      setOptC("");
      setOptD("");
      setCorrectOpt("A");
      setShowQuestionModal(false);
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to add question.");
    } finally {
      setQSubmitLoading(false);
    }
  };

  // Instructor Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await quizService.deleteQuestion(qId);
      fetchQuizDetails();
    } catch (err) {
      console.error(err);
      alert("Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 font-medium">Loading syllabus & resources...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center mx-auto my-8">
        <p className="text-sm text-rose-400 font-semibold mb-4">Error loading page</p>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">{error || "Course not found."}</p>
        <Link to="/courses" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white">
          Back to Courses
        </Link>
      </div>
    );
  }

  const allModulesCompleted = progress && progress.completedModulesCount === progress.totalModulesCount && progress.totalModulesCount > 0;
  const passedQuiz = quizResults.some((r) => r.passed);
  const attemptsCount = quizResults.length;
  const attemptsLeft = 5 - attemptsCount;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Course Banner Header */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col justify-between gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-slate-950/80 text-indigo-400 border border-indigo-400/20 rounded-full w-fit">
            Course details
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-slate-100 mt-3">{course.title}</h1>
          <p className="text-xs text-slate-400 mt-2 max-w-3xl leading-relaxed">{course.description}</p>
        </div>

        {/* Enrollment Overlay for Students */}
        {user.role === "STUDENT" && !isEnrolled && (
          <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl w-fit">
            <p className="text-xs text-slate-400">You are not enrolled in this course yet.</p>
            <button
              onClick={handleEnroll}
              disabled={enrollLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              {enrollLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Enrolling...
                </>
              ) : (
                "Enroll Now"
              )}
            </button>
          </div>
        )}

        {/* Student Progress summary in Banner */}
        {user.role === "STUDENT" && isEnrolled && progress && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl w-fit">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">Your Progression</span>
              <span className="text-sm font-bold text-slate-200">
                {progress.completedModulesCount} / {progress.totalModulesCount} Modules Completed
              </span>
            </div>
            <div className="w-48 h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progress.progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-indigo-400">{Math.round(progress.progressPercent)}%</span>
          </div>
        )}
      </div>

      {/* Tabs Layout */}
      {isEnrolled && (
        <div className="flex flex-col gap-6">
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`px-6 py-3 text-xs uppercase font-bold tracking-widest border-b-2 transition-colors duration-200 cursor-pointer ${
                activeTab === "syllabus"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Syllabus Modules
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-6 py-3 text-xs uppercase font-bold tracking-widest border-b-2 transition-colors duration-200 cursor-pointer ${
                activeTab === "quiz"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              Course Final Quiz
            </button>
          </div>

          {/* TAB 1: SYLLABUS */}
          {activeTab === "syllabus" && (
            <div className="flex flex-col gap-5 animate-fadeIn">
              {/* Header and Add button for Instructor */}
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Lessons & Content</h2>
                {user.role === "INSTRUCTOR" && (
                  <button
                    onClick={handleOpenCreateModule}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Module
                  </button>
                )}
              </div>

              {/* Modules list */}
              {course.modules?.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-800 bg-slate-900/10 text-center rounded-2xl">
                  <p className="text-xs text-slate-500">No content modules are set up for this course syllabus yet.</p>
                </div>
              ) : user.role === "STUDENT" ? (
                /* STUDENT SPLIT VIEW */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Player & Active Lesson Card */}
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-4">
                      {selectedModule ? (
                        <>
                          <StudentVideoPlayer
                            videoUrl={selectedModule.videoUrl}
                            lessonTitle={selectedModule.title}
                            user={user}
                            isEnrolled={isEnrolled}
                          />

                          {/* Extra info/actions for selected lesson */}
                          <div className="flex flex-wrap items-center justify-between gap-4 mt-2 pt-4 border-t border-slate-800/80">
                            {/* Materials and details */}
                            <div className="flex items-center gap-4">
                              {selectedModule.resourceUrl ? (
                                <a
                                  href={selectedModule.resourceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download Study Materials
                                </a>
                              ) : (
                                <span className="text-xs text-slate-500 font-medium">No study materials linked</span>
                              )}
                            </div>

                            {/* Mark Completed inline */}
                            <div className="shrink-0">
                              {progress && progress.completedModuleIds && progress.completedModuleIds.includes(selectedModule.id) ? (
                                <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Completed
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCompleteModule(selectedModule.id)}
                                  disabled={completingModuleId === selectedModule.id}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-indigo-600/10"
                                >
                                  {completingModuleId === selectedModule.id ? (
                                    <div className="w-3.5 h-3.5 border-2 border-slate-350 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    "Mark Completed"
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-8 text-xs text-slate-500">
                          Select a lesson from the list to start watching.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Lessons list */}
                  <div className="lg:col-span-1 flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Course Lectures
                    </h3>
                    {course.modules.map((mod, index) => {
                      const isCompleted =
                        progress && progress.completedModuleIds && progress.completedModuleIds.includes(mod.id);
                      const isSelected = selectedModule && selectedModule.id === mod.id;

                      return (
                        <div
                          key={mod.id}
                          onClick={() => setSelectedModule(mod)}
                          className={`p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600/10 border-indigo-500/50 hover:border-indigo-500/60"
                              : "bg-slate-900 border-slate-800/80 hover:border-slate-700/60"
                          }`}
                        >
                          <div className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 border border-slate-700 text-indigo-400"
                          }`}>
                            {isCompleted ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold truncate ${
                              isSelected ? "text-indigo-300" : "text-slate-200"
                            }`}>
                              {mod.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-medium">
                              <span className="flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Video
                              </span>
                              {mod.resourceUrl && (
                                <>
                                  <span>•</span>
                                  <span>Materials</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* INSTRUCTOR / ADMIN VIEW (UNCHANGED) */
                <div className="flex flex-col gap-4">
                  {course.modules.map((mod, index) => {
                    // Check if module is completed by student
                    const isCompleted =
                      progress && progress.completedModuleIds && progress.completedModuleIds.includes(mod.id);

                    return (
                      <div
                        key={mod.id}
                        className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl hover:border-slate-700/60 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Left description */}
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-indigo-400 shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-200">{mod.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-medium">
                              <a
                                href={mod.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Lesson Video
                              </a>
                              {mod.resourceUrl && (
                                <>
                                  <span className="text-slate-800">•</span>
                                  <a
                                    href={mod.resourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-slate-400 hover:text-slate-300 transition-colors"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Study Materials
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right student button */}
                        {user.role === "STUDENT" && (
                          <div className="shrink-0 self-end sm:self-center">
                            {isCompleted ? (
                              <span className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCompleteModule(mod.id)}
                                disabled={completingModuleId === mod.id}
                                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 active:bg-slate-900 border border-slate-700/50 hover:border-indigo-500/30 text-[10px] font-bold text-slate-300 hover:text-indigo-400 rounded-xl transition-all duration-150 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              >
                                {completingModuleId === mod.id ? (
                                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  "Mark Completed"
                                )}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Right instructor edit button */}
                        {user.role === "INSTRUCTOR" && (
                          <div className="shrink-0 self-end sm:self-center">
                            <button
                              onClick={() => handleOpenEditModule(mod)}
                              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 active:bg-slate-900 border border-slate-700/50 hover:border-indigo-500/30 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

              {/* Create/Edit Module Modal */}
              {showModuleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModuleModal}></div>
                  <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-scaleIn">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                      <h3 className="text-base font-bold text-slate-100">
                        {editingModule ? "Edit Lesson Module" : "Add Lesson Module"}
                      </h3>
                      <button
                        onClick={handleCloseModuleModal}
                        className="p-1.5 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <form onSubmit={handleSaveModule} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          Module Title
                        </label>
                        <input
                          type="text"
                          value={modTitle}
                          onChange={(e) => setModTitle(e.target.value)}
                          className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
                          placeholder="e.g. Lesson 1: Component Fundamentals"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          Video Lesson URL
                        </label>
                        <input
                          type="url"
                          value={modVideo}
                          onChange={(e) => setModVideo(e.target.value)}
                          className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
                          placeholder="e.g. https://www.youtube.com/watch?v=..."
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                          Resource Materials URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={modResource}
                          onChange={(e) => setModResource(e.target.value)}
                          className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
                          placeholder="e.g. https://github.com/..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={modSubmitLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {modSubmitLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            {editingModule ? "Saving Module..." : "Adding Module..."}
                          </>
                        ) : (
                          editingModule ? "Save Changes" : "Add Module"
                        )}
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
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center gap-3">
                      <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Final Quiz Locked</h3>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        You must complete all syllabus lesson modules in order to unlock the final course quiz and obtain a certificate.
                      </p>
                    </div>
                  ) : !quiz ? (
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                      <p className="text-xs text-slate-400">No final quiz has been set up for this course syllabus yet.</p>
                    </div>
                  ) : !quiz.published ? (
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
                      <p className="text-xs text-slate-400">The instructor has draft questions but has not published this quiz yet.</p>
                    </div>
                  ) : passedQuiz ? (
                    /* PASSED STATE */
                    <div className="p-8 bg-gradient-to-tr from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl flex flex-col items-center text-center gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                      <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Congratulations!</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
                          You successfully passed the course quiz and have graduated from this course program!
                        </p>
                      </div>

                      {/* Display high score */}
                      <div className="flex gap-6 border border-slate-800 bg-slate-900/60 p-3.5 rounded-xl text-xs font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Total Attempts</span>
                          <span className="text-slate-200 mt-0.5 block">{attemptsCount} / 5</span>
                        </div>
                        <div className="w-px bg-slate-800"></div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Highest Score</span>
                          <span className="text-emerald-400 mt-0.5 block">
                            {Math.max(...quizResults.map((r) => r.score))}%
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleDownloadCertificate}
                        disabled={downloadingCert}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-850 text-white rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/10"
                      >
                        {downloadingCert ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download Certificate PDF
                          </>
                        )}
                      </button>
                    </div>
                  ) : isTakingQuiz ? (
                    /* TAKING QUIZ STATE */
                    <form onSubmit={handleQuizSubmit} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col gap-6 animate-scaleIn">
                      <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{quiz.title}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Attempt {attemptsCount + 1} of 5</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsTakingQuiz(false)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] font-semibold"
                        >
                          Cancel Quiz
                        </button>
                      </div>

                      {/* Question items */}
                      <div className="flex flex-col gap-6">
                        {quizQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 bg-slate-800/25 border border-slate-800 rounded-xl flex flex-col gap-3.5">
                            <span className="text-[10px] uppercase font-bold text-indigo-400">Question {idx + 1}</span>
                            <p className="text-xs text-slate-200 font-semibold leading-relaxed">{q.questionText}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {[
                                { val: "A", text: q.optionA },
                                { val: "B", text: q.optionB },
                                { val: "C", text: q.optionC },
                                { val: "D", text: q.optionD },
                              ].map((opt) => (
                                <label
                                  key={opt.val}
                                  className={`flex items-center gap-3 p-3 bg-slate-900 border rounded-xl cursor-pointer text-xs transition-colors duration-150 ${
                                    quizAnswers[q.id] === opt.val
                                      ? "border-indigo-500 bg-indigo-500/5 text-indigo-300"
                                      : "border-slate-800 hover:border-slate-700 text-slate-400"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    value={opt.val}
                                    checked={quizAnswers[q.id] === opt.val}
                                    onChange={() =>
                                      setQuizAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                                    }
                                    className="accent-indigo-500 w-3.5 h-3.5 shrink-0"
                                    required
                                  />
                                  <span className="font-bold text-[10px]">{opt.val}.</span>
                                  <span>{opt.text}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={quizSubmitLoading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                      >
                        {quizSubmitLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            Submitting quiz answers...
                          </>
                        ) : (
                          "Submit Quiz Attempt"
                        )}
                      </button>
                    </form>
                  ) : (
                    /* NOT TAKING QUIZ / COMPLETED ALL MODULES / ATTEMPTS REMAINING */
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center text-center gap-4">
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-400/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 113.536 0V19h2v2h-4v-2h2v-2.03a5.008 5.008 0 01-3.536-1.864z" />
                        </svg>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{quiz.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{quiz.description || "Take the final exam."}</p>
                      </div>

                      {/* Display attempt stats */}
                      <div className="flex gap-6 border border-slate-800 bg-slate-900/60 p-3.5 rounded-xl text-xs font-semibold">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Attempts Used</span>
                          <span className="text-slate-200 mt-0.5 block">{attemptsCount} / 5</span>
                        </div>
                        <div className="w-px bg-slate-800"></div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Passing Score</span>
                          <span className="text-indigo-400 mt-0.5 block">80%</span>
                        </div>
                      </div>

                      {latestAttemptResult && (
                        <div className={`p-4 rounded-xl border text-xs leading-relaxed max-w-sm ${
                          latestAttemptResult.passed
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                            : "bg-rose-500/5 border-rose-500/20 text-rose-300"
                        }`}>
                          <p className="font-bold uppercase tracking-wider mb-1">
                            Attempt Result: {latestAttemptResult.passed ? "Passed" : "Failed"}
                          </p>
                          <p>Your Score: <span className="font-bold">{latestAttemptResult.score}%</span>. Attempts used: {latestAttemptResult.attempts}</p>
                        </div>
                      )}

                      {attemptsLeft > 0 ? (
                        <button
                          onClick={() => setIsTakingQuiz(true)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-slate-100 rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-600/10 hover:scale-[1.02] active:scale-95 transition-all duration-200"
                        >
                          Start Final Quiz ({attemptsLeft} left)
                        </button>
                      ) : (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs max-w-xs font-medium">
                          You have exhausted all 5 attempts for this quiz and did not pass. Contact support if needed.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* INSTRUCTOR WORKFLOW */}
              {user.role === "INSTRUCTOR" && (
                <div className="flex flex-col gap-6">
                  {/* Quiz Details or Creation form */}
                  {!quiz ? (
                    <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl max-w-md">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4">Set Up Final Quiz</h3>
                      <form onSubmit={handleCreateQuiz} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                            Quiz Title
                          </label>
                          <input
                            type="text"
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200"
                            placeholder="e.g. React Certification Exam"
                            required
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                            Quiz Description
                          </label>
                          <textarea
                            rows="3"
                            value={quizDesc}
                            onChange={(e) => setQuizDesc(e.target.value)}
                            className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 resize-none"
                            placeholder="Provide details about passing score, attempts limit, and exam rules..."
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={quizSubmitLoadingInst}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {quizSubmitLoadingInst ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                              Creating Quiz Template...
                            </>
                          ) : (
                            "Create Quiz Template"
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Quiz details and Question manager */
                    <div className="flex flex-col gap-6">
                      {/* Status header */}
                      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">{quiz.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                              quiz.published
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}>
                              {quiz.published ? "Published" : "Draft"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{quiz.description}</p>
                        </div>

                        {!quiz.published && (
                          <button
                            onClick={handlePublishQuiz}
                            disabled={quizQuestions.length === 0}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold transition-colors duration-150 cursor-pointer shadow-lg shadow-emerald-600/5"
                          >
                            Publish Final Quiz
                          </button>
                        )}
                      </div>

                      {/* Questions Manager list */}
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Questions List ({quizQuestions.length})
                          </h4>
                          <button
                            onClick={() => setShowQuestionModal(true)}
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold transition-all duration-150 flex items-center gap-1 cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            Add Question
                          </button>
                        </div>

                        {quizQuestions.length === 0 ? (
                          <div className="p-8 border border-dashed border-slate-800 text-center rounded-2xl bg-slate-900/10">
                            <p className="text-xs text-slate-500">No questions have been added to this exam template yet.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            {quizQuestions.map((q, idx) => (
                              <div key={q.id} className="p-5 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col gap-4 relative">
                                <button
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-850"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>

                                <div>
                                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Question {idx + 1}</span>
                                  <p className="text-xs text-slate-200 font-semibold mt-1 leading-relaxed max-w-[90%]">{q.questionText}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  {[
                                    { k: "A", val: q.optionA },
                                    { k: "B", val: q.optionB },
                                    { k: "C", val: q.optionC },
                                    { k: "D", val: q.optionD },
                                  ].map((opt) => (
                                    <div key={opt.k} className={`p-2.5 border rounded-lg flex items-center gap-2 ${
                                      q.correctAnswer === opt.k
                                        ? "border-emerald-500 bg-emerald-500/5 text-emerald-400 font-semibold"
                                        : "border-slate-800 bg-slate-900 text-slate-400"
                                    }`}>
                                      <span className="font-bold text-[9px]">{opt.k}.</span>
                                      <span>{opt.val}</span>
                                      {q.correctAnswer === opt.k && (
                                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 ml-auto">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Create Question Modal */}
                      {showQuestionModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowQuestionModal(false)}></div>
                          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl z-10 animate-scaleIn">
                            <div className="flex justify-between items-center mb-5 border-b border-slate-800/60 pb-3">
                              <h3 className="text-base font-bold text-slate-100">Add Question</h3>
                              <button
                                onClick={() => setShowQuestionModal(false)}
                                className="p-1.5 text-slate-500 hover:text-slate-300 rounded-full hover:bg-slate-800"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <form onSubmit={handleCreateQuestion} className="flex flex-col gap-4 text-xs">
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                  Question Prompt
                                </label>
                                <textarea
                                  rows="2"
                                  value={qText}
                                  onChange={(e) => setQText(e.target.value)}
                                  className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none transition-all duration-200 resize-none"
                                  placeholder="e.g. Which Hook is used to handle side-effects in React functional components?"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Option A</label>
                                  <input
                                    type="text"
                                    value={optA}
                                    onChange={(e) => setOptA(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Option B</label>
                                  <input
                                    type="text"
                                    value={optB}
                                    onChange={(e) => setOptB(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Option C</label>
                                  <input
                                    type="text"
                                    value={optC}
                                    onChange={(e) => setOptC(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                                    required
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[9px] font-bold text-slate-500 ml-1 uppercase">Option D</label>
                                  <input
                                    type="text"
                                    value={optD}
                                    onChange={(e) => setOptD(e.target.value)}
                                    className="w-full bg-slate-800/40 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                                  Correct Answer
                                </label>
                                <select
                                  value={correctOpt}
                                  onChange={(e) => setCorrectOpt(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-800 focus:border-indigo-500/60 rounded-xl py-2.5 px-3 text-slate-300 focus:outline-none cursor-pointer"
                                >
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="D">D</option>
                                </select>
                              </div>

                              <button
                                type="submit"
                                disabled={qSubmitLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold text-xs rounded-xl py-3 mt-2 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                              >
                                {qSubmitLoading ? (
                                  <>
                                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                    Adding Question...
                                  </>
                                ) : (
                                  "Add Question"
                                )}
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
