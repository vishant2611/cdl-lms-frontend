'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '../../../../../lib/api';
import { useAuthStore } from '../../../../../store/authStore';
import Link from 'next/link';

export default function QuizPage() {
  const { courseId } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/quizzes/course/' + courseId)
      .then(r => setQuiz(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert('Please answer all questions before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/quizzes/' + quiz.id + '/submit', { answers });
      setResult(data);
      if (data.passed) {
        await api.post('/certificates/issue', { userId: user?.id, courseId });
        await api.patch('/enrollments/progress', { courseId, progressPct: 100 });
      }
    } finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}><div style={{ width: '40px', height: '40px', border: '3px solid #6C9604', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /></div>;

  if (!quiz) return (
    <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB' }}>
      <p style={{ fontSize: '48px', marginBottom: '12px' }}>📝</p>
      <p style={{ fontSize: '18px', fontWeight: '700', color: '#10312B', marginBottom: '8px' }}>No quiz available</p>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>The instructor hasn't added a quiz for this course yet</p>
      <Link href={'/dashboard/courses/' + courseId} style={{ color: '#6C9604', fontWeight: '700' }}>← Back to Course</Link>
    </div>
  );

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '20px' }}>
        <Link href={'/dashboard/courses/' + courseId} style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', padding: '8px 14px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>← Back to Course</Link>
      </div>

      {result ? (
        /* Results */
        <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
          <div style={{ background: result.passed ? 'linear-gradient(135deg, #052e16, #10312B)' : 'linear-gradient(135deg, #450a0a, #7f1d1d)', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '64px', marginBottom: '16px' }}>{result.passed ? '🎉' : '😔'}</p>
            <h2 style={{ color: 'white', fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>{result.passed ? 'Congratulations!' : 'Not Quite There'}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>{result.passed ? 'You passed the assessment!' : 'Review the material and try again'}</p>
          </div>
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '6px solid', borderColor: result.passed ? '#10B981' : '#EF4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', background: result.passed ? '#ECFDF5' : '#FEF2F2' }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: result.passed ? '#10B981' : '#EF4444' }}>{result.score}%</span>
              <span style={{ fontSize: '10px', color: result.passed ? '#6EE7B7' : '#FCA5A5', fontWeight: '600' }}>SCORE</span>
            </div>
            <p style={{ fontSize: '15px', color: '#6B7280', marginBottom: '8px' }}>Pass mark: {result.passMark}%</p>
            {result.passed ? (
              <>
                <p style={{ fontSize: '14px', color: '#10B981', fontWeight: '700', marginBottom: '24px' }}>🎓 Certificate has been issued!</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <Link href="/dashboard/certificates" style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px' }}>View Certificate →</Link>
                  <Link href="/dashboard/courses" style={{ background: 'white', color: '#10312B', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: '1.5px solid #E5E7EB' }}>Back to Courses</Link>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button onClick={() => { setResult(null); setAnswers({}); }} style={{ background: 'linear-gradient(135deg, #10312B, #6C9604)', color: 'white', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>Retake Quiz</button>
                <Link href={'/dashboard/courses/' + courseId} style={{ background: 'white', color: '#10312B', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', fontSize: '14px', border: '1.5px solid #E5E7EB' }}>Review Course</Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Questions */
        <div>
          <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '24px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#10312B', marginBottom: '4px' }}>📝 Course Assessment</h1>
              <p style={{ color: '#6B7280', fontSize: '13px' }}>{quiz.questions?.length} questions · Pass mark: {quiz.passMark}%</p>
            </div>
            <div style={{ background: '#F4F7E8', borderRadius: '10px', padding: '12px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '800', color: '#6C9604' }}>{Object.keys(answers).length}/{quiz.questions?.length}</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600' }}>Answered</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            {quiz.questions?.map((q: any, idx: number) => (
              <div key={q.id} style={{ background: 'white', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '20px 24px', boxShadow: '0 1px 3px rgba(16,49,43,0.06)' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: answers[q.id] !== undefined ? '#6C9604' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                    <span style={{ color: answers[q.id] !== undefined ? 'white' : '#9CA3AF', fontSize: '12px', fontWeight: '800' }}>{idx + 1}</span>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#10312B', lineHeight: '1.5' }}>{q.question}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '40px' }}>
                  {(q.options as string[]).map((opt: string, optIdx: number) => (
                    <div key={optIdx} onClick={() => setAnswers(a => ({ ...a, [q.id]: optIdx }))}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                        borderColor: answers[q.id] === optIdx ? '#6C9604' : '#E5E7EB',
                        background: answers[q.id] === optIdx ? '#F4F7E8' : 'white',
                      }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid', borderColor: answers[q.id] === optIdx ? '#6C9604' : '#D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: answers[q.id] === optIdx ? '#6C9604' : 'white' }}>
                        {answers[q.id] === optIdx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                      </div>
                      <span style={{ fontSize: '14px', color: answers[q.id] === optIdx ? '#10312B' : '#374151', fontWeight: answers[q.id] === optIdx ? '600' : '400' }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleSubmit} disabled={submitting || Object.keys(answers).length < (quiz.questions?.length || 0)}
            style={{ width: '100%', padding: '14px', borderRadius: '12px', background: Object.keys(answers).length < (quiz.questions?.length || 0) ? '#E5E7EB' : 'linear-gradient(135deg, #10312B, #6C9604)', color: Object.keys(answers).length < (quiz.questions?.length || 0) ? '#9CA3AF' : 'white', fontWeight: '800', fontSize: '15px', border: 'none', cursor: Object.keys(answers).length < (quiz.questions?.length || 0) ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', transition: 'all 0.2s' }}>
            {submitting ? '⏳ Submitting...' : Object.keys(answers).length < (quiz.questions?.length || 0) ? 'Answer all questions to submit (' + Object.keys(answers).length + '/' + quiz.questions?.length + ')' : '✓ Submit Assessment'}
          </button>
        </div>
      )}
    </div>
  );
}